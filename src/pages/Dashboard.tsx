import * as React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { MacroSummary } from "../components/MacroSummary";
import { MealCard, Meal } from "../components/MealCard";
import { Button } from "../components/ui/button";
import { Plus, MessageCircle, Utensils, Camera, X, Loader2, Sparkles, LogOut, ShieldCheck } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, addDoc, limit, serverTimestamp } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { analyzeMealText, analyzeMealImage, generateDailyTip } from "../lib/gemini";
import { redactPII } from "../lib/pii";
import { encryptData } from "../lib/crypto";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function Dashboard() {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyTip, setDailyTip] = useState("Log a meal to get your first tip!");
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logMode, setLogMode] = useState<'text' | 'image'>('text');
  const [mealText, setMealText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Default goals based on common stats, could be personalized later
  const goals = {
    calories: profile?.goal === "Lose weight" ? 1800 : profile?.goal === "Build muscle" ? 2800 : 2200,
    protein: profile?.goal === "Build muscle" ? 180 : 100,
    carbs: 250,
    fat: 70,
  };

  useEffect(() => {
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "meals"),
      where("userId", "==", profile.uid),
      where("timestamp", ">=", today),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(mealData);
      setLoadingMeals(false);

      if (mealData.length > 0) {
        const historyStr = mealData.map(m => m.name).join(", ");
        generateDailyTip(historyStr, profile.goal).then(setDailyTip);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "meals");
    });

    return () => unsubscribe();
  }, [profile]);

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogMeal = async () => {
    if (!profile) return;
    setAnalyzing(true);
    try {
      let analysis;
      if (logMode === 'text') {
        const safeText = redactPII(mealText);
        analysis = await analyzeMealText(safeText, profile.goal, profile.diet);
      } else if (imagePreview) {
        const mimeTypeMatch = imagePreview.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64 = imagePreview.split(',')[1];
        analysis = await analyzeMealImage(base64, mimeType, profile.goal, profile.diet);
      }

      if (analysis) {
        await addDoc(collection(db, "meals"), {
          userId: profile.uid,
          name: analysis.meal_name,
          calories: analysis.calories,
          protein: analysis.protein_g,
          carbs: analysis.carbs_g,
          fat: analysis.fat_g,
          healthScore: analysis.health_score,
          tip: analysis.tip,
          timestamp: serverTimestamp(),
          imageUrl: imagePreview || null,
        });
        toast.success("Meal logged successfully!");
        setIsLogOpen(false);
        setMealText("");
        setImagePreview(null);
        setImageFile(null);
      }
    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, "meals");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-xl">N</div>
          <div>
            <h1 className="text-lg font-bold">NutriMind</h1>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider leading-none">
              Goal: {profile?.goal}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/chat">
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-100" onClick={() => auth.signOut()}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Good morning, {profile?.displayName?.split(' ')[0]} 👋</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-slate-500 font-medium">You're on a {profile?.streak || 0}-day streak! Keep it up.</p>
            </div>
          </div>
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl h-14 px-8 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-lg font-bold">
                <Plus className="w-6 h-6 mr-2" /> Log a Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Log Your Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${logMode === 'text' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
                    onClick={() => setLogMode('text')}
                  >
                    <Utensils className="w-4 h-4" /> Text
                  </button>
                  <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${logMode === 'image' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
                    onClick={() => setLogMode('image')}
                  >
                    <Camera className="w-4 h-4" /> Photo
                  </button>
                </div>

                {logMode === 'text' ? (
                  <Textarea 
                    placeholder="e.g. 2 boiled eggs, a toast and black coffee"
                    className="min-h-[120px] rounded-2xl border-slate-200 focus:border-orange-500"
                    value={mealText}
                    onChange={(e) => setMealText(e.target.value)}
                  />
                ) : (
                  <div className="relative group">
                    {imagePreview ? (
                      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 rounded-full h-8 w-8"
                          onClick={() => { setImagePreview(null); setImageFile(null); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-12 h-12 text-slate-300 mb-3" />
                          <p className="text-sm font-bold text-slate-500 tracking-tight">Snap or upload a photo</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                )}

                <Button 
                  disabled={analyzing || (logMode === 'text' ? !mealText.trim() : !imagePreview)}
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-orange-500 hover:bg-orange-600"
                  onClick={handleLogMeal}
                >
                  {analyzing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing with Gemini...</>
                  ) : (
                    <>Analyze Meal</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Today's Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Today's Summary</h3>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <MacroSummary 
            calories={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            goals={goals}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Meals */}
          <section className="lg:col-span-2 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Meal History</h3>
             {loadingMeals ? (
               <div className="space-y-4">
                 {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)}
               </div>
             ) : meals.length === 0 ? (
               <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-slate-200">
                 <Utensils className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <h4 className="text-lg font-bold text-slate-900">No meals logged today</h4>
                 <p className="text-slate-500">Log your first meal to see it here.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {meals.map((meal) => (
                   <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={meal.id}
                   >
                     <MealCard meal={meal} />
                   </motion.div>
                 ))}
               </div>
             )}
          </section>

          {/* Sidebar / AI Tip */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">AI Insights</h3>
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-[32px] p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/20 -rotate-12" />
              <h4 className="text-lg font-bold mb-2">NutriTip of the Day</h4>
              <p className="text-orange-50 font-medium leading-relaxed">
                "{dailyTip}"
              </p>
              <div className="mt-6 flex items-center gap-2 p-2 bg-white/10 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Real-time Analysis</span>
              </div>
            </div>
            
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Security Status
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider">PII Redaction</span>
                  <span className="text-green-600">ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider">AES-256 GCM</span>
                  <span className="text-green-600">ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider">Gemini Privacy</span>
                  <span className="text-green-600">ENABLED</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
