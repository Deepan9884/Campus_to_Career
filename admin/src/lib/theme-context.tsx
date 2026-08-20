import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type AccentColor = "indigo" | "emerald" | "purple" | "amber" | "cyan";
export type LayoutDensity = "comfortable" | "compact";

export interface MentorPreferences {
  atRiskThreshold: number; // e.g. 60, 70, 80
  emailDigest: "daily" | "weekly" | "off";
  autoEncouragement: boolean;
  officeHoursUrl: string;
  defaultExportFormat: "csv" | "pdf" | "json";
  showAmbientGlow: boolean;
  notifyOnLowMockScore: boolean;
  notifyOnLowResumeScore: boolean;
  notifyOnInactivity: boolean;
  defaultCohortFilter: string;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  density: LayoutDensity;
  setDensity: (density: LayoutDensity) => void;
  mentorPreferences: MentorPreferences;
  updatePreferences: (newPrefs: Partial<MentorPreferences>) => void;
}

const DEFAULT_PREFERENCES: MentorPreferences = {
  atRiskThreshold: 65,
  emailDigest: "daily",
  autoEncouragement: true,
  officeHoursUrl: "https://calendly.com/mentor-office-hours",
  defaultExportFormat: "csv",
  showAmbientGlow: true,
  notifyOnLowMockScore: true,
  notifyOnLowResumeScore: true,
  notifyOnInactivity: true,
  defaultCohortFilter: "my-mentees",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cf-admin-theme") as Theme;
      if (saved && ["dark", "light", "system"].includes(saved)) {
        return saved;
      }
    }
    return "dark";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cf-admin-accent") as AccentColor;
      if (saved && ["indigo", "emerald", "purple", "amber", "cyan"].includes(saved)) {
        return saved;
      }
    }
    return "indigo";
  });

  const [density, setDensityState] = useState<LayoutDensity>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cf-admin-density") as LayoutDensity;
      if (saved && ["comfortable", "compact"].includes(saved)) {
        return saved;
      }
    }
    return "comfortable";
  });

  const [mentorPreferences, setMentorPreferences] = useState<MentorPreferences>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cf-admin-preferences");
      if (saved) {
        try {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        } catch (e) {
          console.error("Failed to parse mentor preferences", e);
        }
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let active: "dark" | "light" = "dark";
      if (theme === "system") {
        active = mediaQuery.matches ? "dark" : "light";
      } else {
        active = theme;
      }
      setResolvedTheme(active);

      if (active === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
      } else {
        root.classList.remove("light");
        root.classList.add("dark");
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  // Apply Accent Color and Layout Density to Root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", accentColor);

    const palettes: Record<AccentColor, {
      primary: string;
      primaryRgb: string;
      primaryHover: string;
      btnGradient: string;
      glassHover: string;
      ring: string;
    }> = {
      indigo: {
        primary: "#6366f1",
        primaryRgb: "99, 102, 241",
        primaryHover: "#4f46e5",
        btnGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
        glassHover: "rgba(99, 102, 241, 0.45)",
        ring: "#6366f1",
      },
      purple: {
        primary: "#9333ea",
        primaryRgb: "147, 51, 234",
        primaryHover: "#7e22ce",
        btnGradient: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #ec4899 100%)",
        glassHover: "rgba(168, 85, 247, 0.45)",
        ring: "#a855f7",
      },
      emerald: {
        primary: "#10b981",
        primaryRgb: "16, 185, 129",
        primaryHover: "#059669",
        btnGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)",
        glassHover: "rgba(16, 185, 129, 0.45)",
        ring: "#10b981",
      },
      amber: {
        primary: "#f59e0b",
        primaryRgb: "245, 158, 11",
        primaryHover: "#d97706",
        btnGradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #f97316 100%)",
        glassHover: "rgba(245, 158, 11, 0.45)",
        ring: "#f59e0b",
      },
      cyan: {
        primary: "#06b6d4",
        primaryRgb: "6, 182, 212",
        primaryHover: "#0891b2",
        btnGradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #38bdf8 100%)",
        glassHover: "rgba(6, 182, 212, 0.45)",
        ring: "#06b6d4",
      },
    };

    const activePalette = palettes[accentColor] || palettes.indigo;
    root.style.setProperty("--color-primary", activePalette.primary);
    root.style.setProperty("--color-primary-rgb", activePalette.primaryRgb);
    root.style.setProperty("--color-primary-hover", activePalette.primaryHover);
    root.style.setProperty("--btn-gradient", activePalette.btnGradient);
    root.style.setProperty("--glass-card-hover", activePalette.glassHover);
    root.style.setProperty("--ring-color", activePalette.ring);
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", density);
  }, [density]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("cf-admin-theme", newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem("cf-admin-accent", color);
  };

  const setDensity = (newDensity: LayoutDensity) => {
    setDensityState(newDensity);
    localStorage.setItem("cf-admin-density", newDensity);
  };

  const updatePreferences = (newPrefs: Partial<MentorPreferences>) => {
    setMentorPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem("cf-admin-preferences", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        density,
        setDensity,
        mentorPreferences,
        updatePreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
