import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import { Loader2 } from "lucide-react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading NutriMind...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user exists but no profile, they need onboarding
  // We check profile === null carefully (user exists, but no doc found)
  if (!profile && window.location.pathname !== "/onboarding") {
     return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/onboarding" 
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-center" expand />
    </ErrorBoundary>
  );
}
