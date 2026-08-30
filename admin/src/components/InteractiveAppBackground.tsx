import React from "react";
import { useTheme } from "../lib/theme-context";

export const InteractiveAppBackground: React.FC = () => {
  const { accentColor } = useTheme();

  const orbConfig = {
    indigo: {
      orb1: "from-violet-600/25 via-purple-600/16 to-transparent",
      orb2: "from-pink-500/18 via-rose-500/12 to-transparent",
      orb3: "from-indigo-500/14 via-violet-400/08 to-transparent",
    },
    purple: {
      orb1: "from-purple-600/26 via-fuchsia-600/18 to-transparent",
      orb2: "from-pink-500/20 via-rose-500/14 to-transparent",
      orb3: "from-fuchsia-500/14 via-purple-400/08 to-transparent",
    },
    emerald: {
      orb1: "from-emerald-500/24 via-teal-500/16 to-transparent",
      orb2: "from-teal-500/18 via-cyan-500/12 to-transparent",
      orb3: "from-green-400/14 via-emerald-300/08 to-transparent",
    },
    amber: {
      orb1: "from-amber-400/24 via-orange-400/16 to-transparent",
      orb2: "from-yellow-400/18 via-amber-300/12 to-transparent",
      orb3: "from-orange-300/14 via-amber-200/08 to-transparent",
    },
    cyan: {
      orb1: "from-sky-500/24 via-cyan-500/16 to-transparent",
      orb2: "from-blue-500/18 via-sky-400/12 to-transparent",
      orb3: "from-cyan-400/14 via-sky-300/08 to-transparent",
    },
  }[accentColor] || {
    orb1: "from-violet-600/25 via-purple-600/16 to-transparent",
    orb2: "from-pink-500/18 via-rose-500/12 to-transparent",
    orb3: "from-indigo-500/14 via-violet-400/08 to-transparent",
  };

  return (
    <div id="interactive-canvas-bg" className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print" aria-hidden="true">
      {/* Dark mode only: Primary top-left orb */}
      <div
        className={`absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br ${orbConfig.orb1} blur-[180px] animate-pulse pointer-events-none dark:block hidden`}
        style={{ animationDuration: "12s" }}
      />
      {/* Dark mode only: Secondary right orb */}
      <div
        className={`absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl ${orbConfig.orb2} blur-[160px] animate-pulse pointer-events-none dark:block hidden`}
        style={{ animationDuration: "16s", animationDelay: "4s" }}
      />
      {/* Dark mode only: Bottom center orb */}
      <div
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] animate-pulse pointer-events-none dark:block hidden"
        style={{ background: "radial-gradient(circle, rgba(196,181,253,0.16), transparent 70%)", animationDuration: "20s", animationDelay: "8s" }}
      />
      {/* Dark mode only: Mid-screen diagonal accent orb */}
      <div
        className={`absolute top-1/2 left-1/4 w-[450px] h-[350px] rounded-full bg-gradient-to-tr ${orbConfig.orb3} blur-[140px] animate-pulse pointer-events-none dark:block hidden`}
        style={{ animationDuration: "18s", animationDelay: "2s" }}
      />
      {/* Dark mode vignette overlay */}
      <div
        className="absolute inset-0 dark:block hidden pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(14,11,30,0.45) 70%, rgba(14,11,30,0.82) 100%)" }}
      />
      {/* Dark mode subtle dot-mesh texture */}
      <div
        className="absolute inset-0 dark:block hidden pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Light mode ultra-subtle top ambient glow */}
      <div
        className="absolute inset-0 block dark:hidden pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(79,70,229,0.03) 0%, transparent 70%)" }}
      />
    </div>
  );
};
