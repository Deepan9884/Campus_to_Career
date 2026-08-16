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
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { getAccessToken, setAccessToken } from "./lib/api";
import { ThemeProvider, useTheme } from "./lib/theme-context";

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

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs">
      <button
        onClick={() => setTheme("light")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition ${
          theme === "light"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Light Mode"
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition ${
          theme === "dark"
            ? "bg-slate-800 text-indigo-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="System Preference"
      >
        <Laptop className="h-3.5 w-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
}

function MentorLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const { resolvedTheme, mentorPreferences } = useTheme();
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
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500 selection:text-white flex transition-colors duration-300">
      {/* Ambient background glow effects */}
      {mentorPreferences.showAmbientGlow && (
        <>
          <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] z-0" />
          <div className="pointer-events-none fixed top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] z-0" />
          <div className="pointer-events-none fixed -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] z-0" />
        </>
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 flex flex-col justify-between p-5 transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <img src="/logo-dark.png" alt="Campus to Career AI" className="h-16 md:h-18 w-auto max-w-[200px] object-contain drop-shadow-md hidden dark:block" />
            <img src="/logo.png" alt="Campus to Career AI" className="h-16 md:h-18 w-auto max-w-[200px] object-contain drop-shadow-md block dark:hidden" />
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-bold shrink-0">
              MENTOR PRO
            </span>
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
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
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
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
          {/* Quick Theme Switcher */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
              Theme Mode
            </p>
            <ThemeSwitcher />
          </div>

          <button
            onClick={() => setShowMentorTour(true)}
            className="w-full px-3.5 py-2 rounded-xl glass hover:bg-slate-100 dark:hover:bg-white/10 border border-indigo-500/30 text-xs font-semibold text-indigo-600 dark:text-indigo-300 flex items-center gap-2 transition"
          >
            <HelpCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            Mentor Guide 💡
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3.5 py-2 rounded-xl glass hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition hover:text-rose-600 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar with Hamburger Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">Mentor Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <Toaster position="top-right" theme={resolvedTheme} richColors />
      <MentorLayout onLogout={onLogout} />
    </>
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
      <ThemeProvider>
        <BrowserRouter>
          {authenticated ? (
            <AuthenticatedApp onLogout={handleLogout} />
          ) : (
            <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
          )}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
