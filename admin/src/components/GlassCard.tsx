import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle" | "interactive" | "neon";
}

export function GlassCard({ children, className = "", variant = "default", ...props }: GlassCardProps) {
  let baseClass = "glass rounded-2xl p-6 shadow-xl";

  if (variant === "strong") {
    baseClass = "glass-card rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-white/10";
  } else if (variant === "subtle") {
    baseClass = "glass rounded-xl p-4 border border-slate-200/80 dark:border-white/5";
  } else if (variant === "interactive") {
    baseClass = "glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10";
  } else if (variant === "neon") {
    baseClass = "glass-card rounded-2xl p-6 border border-indigo-500/30 neon-glow-indigo shadow-2xl";
  }

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
