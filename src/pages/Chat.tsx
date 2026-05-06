import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { ChatMessage } from "../components/ChatMessage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { ArrowLeft, Send, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { chatWithGemini } from "../lib/gemini";
import { redactPII } from "../lib/pii";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { motion } from "motion/react";

export function Chat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "chats"),
      where("userId", "==", profile.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chats");
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !profile) return;

    setSending(true);
    const userMessage = input.trim();
    setInput("");

    try {
      const safeMessage = redactPII(userMessage);
      
      // 1. Save user message to Firestore
      await addDoc(collection(db, "chats"), {
        userId: profile.uid,
        role: 'user',
        content: userMessage,
        timestamp: serverTimestamp(),
        isSecured: true,
      });

      // 2. Prepare history for Gemini
      const history = messages.map(m => ({ 
        role: m.role as 'user' | 'model', 
        text: m.content 
      }));
      history.push({ role: 'user', text: safeMessage });

      // 3. Get AI response
      const userContext = `User goal: ${profile.goal}. Diet: ${profile.diet}. Streak: ${profile.streak}.`;
      const aiResponse = await chatWithGemini(history, userContext);

      // 4. Save AI response to Firestore
      await addDoc(collection(db, "chats"), {
        userId: profile.uid,
        role: 'model',
        content: aiResponse,
        timestamp: serverTimestamp(),
        isSecured: true,
      });

    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, "chats");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-white text-sm">N</div>
          <div>
            <h1 className="text-sm font-bold">NutriAI Assistant</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active & Secured</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Ask NutriMind anything</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Get advice on recipes, nutrition facts, or how to reach your health goals faster.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              <ChatMessage 
                role={m.role} 
                content={m.content} 
                isSecured={m.role === 'model'} 
              />
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 italic">
              <Loader2 className="w-3 h-3 animate-spin" /> Gemini is thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-white border-t">
        <div className="max-w-3xl mx-auto flex gap-4">
          <div className="relative flex-1">
            <Input 
              placeholder="Ask about your diet, goals, or a specific food..." 
              className="h-12 rounded-xl pr-12 border-slate-200 focus:border-orange-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-green-500 opacity-50" />
            </div>
          </div>
          <Button 
            className="h-12 w-12 rounded-xl bg-orange-500 hover:bg-orange-600"
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center mt-2 text-slate-400 font-medium uppercase tracking-[0.2em]">
          All interactions are redacted and encrypted for your privacy
        </p>
      </div>
    </div>
  );
}
