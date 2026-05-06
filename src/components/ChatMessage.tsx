import { cn } from "../lib/utils";
import { ShieldCheck, User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: 'user' | 'model';
  content: string;
  isSecured?: boolean;
}

export function ChatMessage({ role, content, isSecured }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex w-full gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
        isUser ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-card border rounded-tl-none"
        )}>
          {content}
        </div>
        {isSecured && (
          <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-green-100 italic">
            <ShieldCheck className="w-3 h-3" />
            SECURED AI PIPELINE
          </div>
        )}
      </div>
    </div>
  );
}
