import React, { useState } from "react";
import {
  GraduationCap,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import { setAccessToken } from "../lib/api";
import { toast } from "sonner";

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
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
      toast.success("Welcome back to Mentor Portal!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: "demo-admin-google-credential" }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Google login failed");
      }
      setAccessToken(json.data.accessToken);
      toast.success("Signed in as Admin via Google!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin-mentor" }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "GitHub login failed");
      }
      setAccessToken(json.data.accessToken);
      toast.success("Signed in as Admin via GitHub!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "GitHub login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(10,13,20)] text-slate-100 flex flex-col justify-center selection:bg-indigo-500 selection:text-white font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Panel - Branding & Telemetry Overview (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-slate-900/60 border-r border-slate-800/80 p-12 flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Glow & Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <img src="/logo-dark.png" alt="Campus to Career AI" className="h-28 md:h-32 w-auto max-w-[380px] object-contain drop-shadow-xl" />
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold shrink-0">
              Mentor Workspace
            </span>
          </div>

          {/* Hero Branding Content */}
          <div className="relative z-10 max-w-lg space-y-8 my-auto py-12">
            <div className="space-y-4">
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
                Real-time student placement telemetry & mentorship guidance.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitor student skill gaps, GitHub coding velocity, ATS resume readiness, and mock interview performance across cohorts in one centralized dashboard.
              </p>
            </div>

            {/* Live Metrics Card Preview */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Cohort Telemetry
                </span>
                <span className="text-[11px] font-normal text-slate-400">Updated just now</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Placement</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-white font-sans">94.8%</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Users className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>Students</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-white font-sans">1,240</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Audits</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-white font-sans">18.4k</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" /> Enterprise RBAC Protected
            </span>
            <span>Campus to Career Portal v2.4</span>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md space-y-8">
            
            {/* Mobile Header Brand Icon */}
            <div className="lg:hidden flex items-center gap-3 mb-2">
              <img src="/logo-dark.png" alt="Campus to Career AI" className="h-10 w-auto max-w-[200px] object-contain" />
            </div>

            {/* Section Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Sign in to your account
              </h2>
              <p className="text-slate-400 text-sm">
                Enter your institutional email to access student career insights.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mentor@campustocareer.ai"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Contact your campus system administrator to reset credentials.")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-lg shadow-sm hover:shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[rgb(10,13,20)] px-3 text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-xs sm:text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-xs sm:text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Security Footer */}
            <p className="text-center text-xs text-slate-400 pt-2">
              Protected by 256-bit SSL encryption & role-based access control.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
