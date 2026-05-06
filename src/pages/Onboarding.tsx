import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, UserCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GOALS = ["Lose weight", "Build muscle", "Eat healthier", "More energy"];
const DIETS = ["None", "Vegetarian", "Vegan", "Gluten-free"];

export function Onboarding() {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [diet, setDiet] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfile({
        goal,
        diet,
        onboardingComplete: true,
        streak: 0,
      });
      toast.success("Profile created! Welcome to NutriMind.");
      navigate("/");
    } catch (error: any) {
      console.error("Onboarding error", error);
      toast.error("Failed to save profile: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
            <UserCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Personalize Your Plan</h2>
          <p className="text-slate-500">Tell us a bit about yourself so NutriMind can help.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Step 1: Your Goal</div>
              {GOALS.map((g) => (
                <Card 
                  key={g} 
                  className={`cursor-pointer transition-all border-2 ${goal === g ? "border-orange-500 bg-orange-50/50" : "border-transparent hover:border-slate-200"}`}
                  onClick={() => setGoal(g)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-semibold">{g}</span>
                    {goal === g && <Check className="w-5 h-5 text-orange-500" />}
                  </CardContent>
                </Card>
              ))}
              <Button 
                disabled={!goal} 
                className="w-full mt-6 h-12 bg-orange-500 hover:bg-orange-600"
                onClick={() => setStep(2)}
              >
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Step 2: Diet Preference</div>
              {DIETS.map((d) => (
                <Card 
                  key={d} 
                  className={`cursor-pointer transition-all border-2 ${diet === d ? "border-orange-500 bg-orange-50/50" : "border-transparent hover:border-slate-200"}`}
                  onClick={() => setDiet(d)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-semibold">{d}</span>
                    {diet === d && <Check className="w-5 h-5 text-orange-500" />}
                  </CardContent>
                </Card>
              ))}
              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  disabled={!diet || saving} 
                  className="flex-[2] h-12 bg-orange-500 hover:bg-orange-600"
                  onClick={handleComplete}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Started"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
