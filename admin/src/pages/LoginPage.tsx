import React, { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { GraduationCap, ShieldCheck, Lock, Mail, Loader2, Sparkles, Zap, Trophy, BarChart3 } from "lucide-react";
import { setAccessToken } from "../lib/api";
import { toast } from "sonner";

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter mentor email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Login failed");
      }

      setAccessToken(json.data.accessToken);
      toast.success("Welcome to Mentor Command Center!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setEmail("mentor@careerforge.ai");
    setPassword("MentorSecret123!");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "mentor@careerforge.ai", password: "MentorSecret123!" }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Demo login failed");
      }

      setAccessToken(json.data.accessToken);
      toast.success("Signed in as Mentor Administrator!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to log in as demo mentor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background ambient spotlight glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[160px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header & Logo Badge */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[22px] grid place-items-center">
              <GraduationCap className="h-10 w-10 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Dedicated Mentor Portal
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">Mentor Command Center</h1>
            <p className="text-xs text-slate-300 mt-1">Real-time student career telemetry & placement guidance</p>
          </div>
        </div>

        {/* Main Login Card */}
        <GlassCard variant="strong" className="p-7 space-y-5 border-indigo-500/30 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px]">
                Mentor Work Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@careerforge.ai"
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px]">
                Secret Passcode
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-3 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 fill-white" />
              )}
              Access Mentor Workspace
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <button
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300 hover:text-white transition flex items-center justify-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              1-Click Demo Mentor Login
            </button>
          </div>
        </GlassCard>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-400">
          <div className="p-2.5 rounded-xl glass border border-white/10 flex flex-col items-center gap-1">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span>Placement Funnel</span>
          </div>
          <div className="p-2.5 rounded-xl glass border border-white/10 flex flex-col items-center gap-1">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>Coding Velocity</span>
          </div>
          <div className="p-2.5 rounded-xl glass border border-white/10 flex flex-col items-center gap-1">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>360° Inspection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
