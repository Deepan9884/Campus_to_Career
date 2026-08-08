import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle";
}

export function GlassCard({ children, className = "", variant = "default", ...props }: GlassCardProps) {
  const baseClass =
    variant === "strong"
      ? "glass-card rounded-2xl p-6 shadow-2xl"
      : variant === "subtle"
      ? "glass rounded-xl p-4"
      : "glass rounded-2xl p-6 shadow-xl";

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
