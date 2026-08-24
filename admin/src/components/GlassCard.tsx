import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle" | "interactive" | "liquid" | "card";
  hover?: boolean;
  glow?: "violet" | "rose" | "mint" | "amber" | "none";
}

const GLOW_CLASS: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  violet: "shadow-[0_0_30px_rgba(167,139,250,0.25)]",
  rose: "shadow-[0_0_30px_rgba(249,168,212,0.22)]",
  mint: "shadow-[0_0_30px_rgba(134,239,172,0.22)]",
  amber: "shadow-[0_0_30px_rgba(253,230,138,0.20)]",
  none: "",
};

export function GlassCard({
  children,
  className = "",
  variant = "default",
  hover = false,
  glow = "none",
  ...props
}: GlassCardProps) {
  let baseClass = "glass rounded-2xl p-6 shadow-xl";

  if (variant === "strong") {
    baseClass = "glass-strong rounded-2xl p-6 shadow-2xl";
  } else if (variant === "subtle") {
    baseClass = "glass rounded-xl p-4";
  } else if (variant === "interactive") {
    baseClass = "liquid-glass-card rounded-2xl p-6 cursor-pointer card-hover-lift";
  } else if (variant === "liquid") {
    baseClass = "liquid-glass rounded-2xl p-6";
  } else if (variant === "card") {
    baseClass = "liquid-glass-card rounded-2xl p-6";
  }

  const glowClass = GLOW_CLASS[glow] || "";

  return (
    <div className={`${baseClass} ${hover ? "card-hover-lift cursor-pointer" : ""} ${glowClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
