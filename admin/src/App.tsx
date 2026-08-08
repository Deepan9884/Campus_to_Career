import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  GraduationCap,
  ShieldCheck,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { getAccessToken, setAccessToken } from "./lib/api";

import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { MentorSettingsPage } from "./pages/MentorSettingsPage";
import { MentorProductTour } from "./components/MentorProductTour";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MentorLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMentorTour, setShowMentorTour] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cf-mentor-tour-done") !== "true";
    }
    return false;
  });

  const navItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Student Roster", href: "/students", icon: Users },
    { label: "Cohort Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white flex">
      {/* Ambient background glow effects */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px] z-0" />

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] grid place-items-center">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-white tracking-tight">Mentor Portal</h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Placement Command Center</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition ${
                    isActive
                      ? "btn-gradient text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowMentorTour(true)}
            className="w-full px-3.5 py-2 rounded-xl glass hover:bg-white/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 flex items-center gap-2 transition"
          >
            <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
            Mentor Guide 💡
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3.5 py-2 rounded-xl glass hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-2 transition hover:text-red-300"
          >
            <LogOut className="h-4 w-4 text-slate-400 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar with Hamburger Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-white text-sm">Mentor Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <MentorProductTour open={showMentorTour} onClose={() => setShowMentorTour(false)} />

      {/* Main Content Area (Padded for Left Sidebar) */}
      <main className="flex-1 lg:pl-64 min-w-0 py-8 px-4 sm:px-8 mt-12 lg:mt-0 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:studentId" element={<StudentDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<MentorSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(Boolean(getAccessToken()));

  const handleLogout = () => {
    setAccessToken(null);
    setAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme="dark" richColors />
      <BrowserRouter>
        {authenticated ? (
          <MentorLayout onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
