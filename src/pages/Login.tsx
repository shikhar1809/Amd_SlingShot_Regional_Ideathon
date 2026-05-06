import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { signInWithGoogle } from "../lib/firebase";
import { motion } from "motion/react";
import { ShieldCheck, HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      console.log("Authentication successful, redirecting to Dashboard");
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to sign in with Google");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6 overflow-hidden relative">
      {/* Decorative Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center rotate-12 shadow-xl shadow-orange-500/20">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-7xl font-black tracking-tight uppercase leading-[0.85] italic">
            Nutri<br />
            <span className="text-orange-500">Mind</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-sm mx-auto">
            Eat smarter, not harder. AI-powered nutrition for your unique goals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-8"
        >
          <Button 
            onClick={handleLogin}
            className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-orange-500 hover:text-white transition-all rounded-xl"
          >
            Continue with Google
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            AES-256 SECURED ENVIRONMENT
          </div>
        </motion.div>
      </div>

      {/* Floating labels for aesthetic */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] [writing-mode:vertical-rl] h-40">
          VERSION 1.0 // BULD FOR HACKATHON
        </div>
      </div>
      <div className="absolute top-10 right-10 hidden md:block text-right">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
          PERSONALIZED NUTRITION<br />
          GEMINI 3 FLASH POWERED
        </div>
      </div>
    </div>
  );
}
