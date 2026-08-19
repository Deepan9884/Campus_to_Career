import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  GraduationCap,
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getAccessToken, setAccessToken } from "./lib/api";
import { ThemeProvider, useTheme } from "./lib/theme-context";
import { InteractiveAppBackground } from "./components/InteractiveAppBackground";
import { getCohortAnalytics } from "./lib/admin-api";

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

function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    const handleCycleTheme = () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    };

    return (
      <button
        onClick={handleCycleTheme}
        className="w-full p-2.5 rounded-xl glass hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 transition"
        title={`Theme Mode: ${theme} (Click to switch)`}
      >
        {theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
        {theme === "dark" && <Moon className="h-4 w-4 text-indigo-400" />}
        {theme === "system" && <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/80 dark:border-white/10 text-xs">
      <button
        onClick={() => setTheme("light")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition-all duration-200 ${
          theme === "light"
            ? "bg-white text-indigo-600 shadow-md"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Light Mode"
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span>Light</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition-all duration-200 ${
          theme === "dark"
            ? "bg-slate-800 text-indigo-400 shadow-md"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5 text-indigo-400" />
        <span>Dark</span>
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold text-[11px] transition-all duration-200 ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="System Preference"
      >
        <Laptop className="h-3.5 w-3.5 text-slate-500" />
        <span>Auto</span>
      </button>
    </div>
  );
}

function MentorLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // no-op
      }
      return next;
    });
  };

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
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 selection:bg-indigo-500 selection:text-white flex transition-colors duration-300 overflow-x-hidden">
      {/* Interactive Background */}
      <InteractiveAppBackground />

      {/* Left Sidebar Navigation (Expandable & Shrinkable) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl ${
          sidebarCollapsed ? "w-[72px] p-3" : "w-64 p-5"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header & Shrink / Expand Toggle */}
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2">
                  <img
                    src="/logo-dark.png"
                    alt="Campus to Career AI"
                    className="h-11 w-auto max-w-[145px] object-contain drop-shadow-md hidden dark:block"
                  />
                  <img
                    src="/logo.png"
                    alt="Campus to Career AI"
                    className="h-11 w-auto max-w-[145px] object-contain drop-shadow-md block dark:hidden"
                  />
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center w-full gap-3">
                <div className="h-9 w-9 rounded-xl btn-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </div>
            )}
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
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full rounded-xl text-xs font-bold flex items-center transition-all duration-200 group ${
                    sidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2.5 gap-3"
                  } ${
                    isActive
                      ? "btn-gradient text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-indigo-500 dark:text-indigo-400"
                    }`}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
          {/* Theme Switcher */}
          {!sidebarCollapsed ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                Theme Mode
              </p>
              <ThemeSwitcher compact={false} />
            </div>
          ) : (
            <ThemeSwitcher compact={true} />
          )}

          {/* Mentor Tour Button */}
          <button
            onClick={() => setShowMentorTour(true)}
            title="Mentor Guide & Product Tour"
            className={`w-full rounded-xl glass hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/30 text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center transition group ${
              sidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2 justify-between"
            }`}
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              {!sidebarCollapsed && <span>Mentor Guide</span>}
            </span>
            {!sidebarCollapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 font-bold">
                Tour
              </span>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            title="Sign Out"
            className={`w-full rounded-xl glass hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center transition hover:text-rose-600 dark:hover:text-red-400 ${
              sidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2 gap-2"
            }`}
          >
            <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar with Hamburger Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl btn-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Mentor Portal</span>
            <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Campus to Career AI
            </span>
          </div>
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

      {/* Main Content Area (Generous breathing gap between sidebar navbar and main section) */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out min-w-0 py-8 px-6 sm:px-10 mt-14 lg:mt-0 relative z-10 ${
          sidebarCollapsed ? "lg:pl-[108px]" : "lg:pl-[296px]"
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-7">
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

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Mentor Admin App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-950 border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Something Went Wrong</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "An unexpected error occurred while rendering the interface."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/students";
              }}
              className="btn-gradient px-4 py-2.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2 shadow-lg"
            >
              Return to Student Roster
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <Toaster position="top-right" theme={resolvedTheme} richColors />
      <AppErrorBoundary>
        <MentorLayout onLogout={onLogout} />
      </AppErrorBoundary>
    </>
  );
}

export function App() {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isVerifying, setIsVerifying] = useState<boolean>(() => Boolean(getAccessToken()));

  // Listen for custom auth change events from api.ts
  React.useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string | null }>;
      setToken(customEvent.detail?.token || null);
    };

    window.addEventListener("cf:admin:auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("cf:admin:auth-change", handleAuthChange);
    };
  }, []);

  // Verify stored token on initial load
  React.useEffect(() => {
    const currentToken = getAccessToken();
    if (!currentToken) {
      setIsVerifying(false);
      return;
    }

    let isMounted = true;
    fetch("/api/admin/profile", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Invalid session");
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          if (json.success === false) {
            setAccessToken(null);
            setToken(null);
          }
          setIsVerifying(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAccessToken(null);
          setToken(null);
          setIsVerifying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    setAccessToken(null);
    setToken(null);
    queryClient.clear();
  };

  const handleLoginSuccess = () => {
    setToken(getAccessToken());
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {token ? (
            <AuthenticatedApp onLogout={handleLogout} />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;
