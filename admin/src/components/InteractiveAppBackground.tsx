import React, { useEffect, useRef } from "react";
import { useTheme } from "../lib/theme-context";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseRadius: number;
}

export const InteractiveAppBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { accentColor, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes count based on screen area
    const count = Math.min(48, Math.floor((width * height) / 30000));
    const particles: Particle[] = [];

    const paletteMap: Record<string, string[]> = {
      indigo: [
        "rgba(99, 102, 241, 0.85)",  // Electric Indigo
        "rgba(168, 85, 247, 0.75)",  // Royal Purple
        "rgba(56, 189, 248, 0.70)",  // Cyber Sky
      ],
      purple: [
        "rgba(147, 51, 234, 0.85)",  // Purple
        "rgba(192, 132, 252, 0.80)", // Light Purple
        "rgba(236, 72, 153, 0.70)",  // Pink
      ],
      emerald: [
        "rgba(16, 185, 129, 0.85)",  // Emerald
        "rgba(5, 150, 105, 0.80)",   // Deep Green
        "rgba(20, 184, 166, 0.70)",  // Teal
      ],
      amber: [
        "rgba(245, 158, 11, 0.85)",  // Amber
        "rgba(217, 119, 6, 0.80)",   // Deep Amber
        "rgba(251, 146, 60, 0.70)",  // Orange
      ],
      cyan: [
        "rgba(6, 182, 212, 0.85)",   // Cyan
        "rgba(56, 189, 248, 0.80)",  // Sky
        "rgba(14, 165, 233, 0.70)",  // Blue
      ],
    };

    const coolPalette = paletteMap[accentColor] || paletteMap.indigo;

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 2.2 + 1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius,
        baseRadius: radius,
        color: coolPalette[i % coolPalette.length],
        alpha: Math.random() * 0.6 + 0.3,
      });
    }

    let mouseX = -2000;
    let mouseY = -2000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -2000;
      mouseY = -2000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);
      const isLight = document.documentElement.classList.contains("light");

      // 1. Draw Connection Lines between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const lineAlpha = (1 - dist / 150) * (isLight ? 0.25 : 0.18);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isLight
              ? `rgba(99, 102, 241, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // 2. Interactive Magnetic Mouse Connection
        const mdx = particles[i].x - mouseX;
        const mdy = particles[i].y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < 180) {
          const mouseLineAlpha = (1 - mDist / 180) * (isLight ? 0.45 : 0.38);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = isLight
            ? `rgba(79, 70, 229, ${mouseLineAlpha})`
            : `rgba(168, 85, 247, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Gentle magnetic attraction towards cursor
          particles[i].vx += (mouseX - particles[i].x) * 0.00012;
          particles[i].vy += (mouseY - particles[i].y) * 0.00012;
          particles[i].radius = particles[i].baseRadius * 1.5;
        } else {
          particles[i].radius = particles[i].baseRadius + Math.sin(time + i) * 0.4;
        }

        // 3. Move Particles with Smooth Boundaries
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;

        // Dampen velocity to keep motion smooth
        particles[i].vx *= 0.994;
        particles[i].vy *= 0.994;

        // Soft screen wrapping
        if (particles[i].x < 0) particles[i].x = width;
        if (particles[i].x > width) particles[i].x = 0;
        if (particles[i].y < 0) particles[i].y = height;
        if (particles[i].y > height) particles[i].y = 0;

        // 4. Render Glowing Particle Nodes
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, Math.max(0.5, particles[i].radius), 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(99, 102, 241, 0.7)" : particles[i].color;
        ctx.shadowColor = isLight ? "rgba(99, 102, 241, 0.5)" : particles[i].color;
        ctx.shadowBlur = isLight ? 8 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [accentColor]);

  // Color orb class mapping based on accent
  const orbConfig = {
    indigo: {
      orb1: "from-indigo-600/25 via-purple-600/20 to-transparent",
      orb2: "from-purple-600/25 via-pink-600/20 to-transparent",
      orb3: "from-cyan-600/20 via-blue-600/20 to-emerald-600/10",
      grid: "rgba(99, 102, 241, 0.22)",
    },
    purple: {
      orb1: "from-purple-600/30 via-fuchsia-600/25 to-transparent",
      orb2: "from-pink-600/30 via-rose-600/20 to-transparent",
      orb3: "from-violet-600/25 via-purple-600/20 to-indigo-600/10",
      grid: "rgba(168, 85, 247, 0.22)",
    },
    emerald: {
      orb1: "from-emerald-600/30 via-teal-600/25 to-transparent",
      orb2: "from-teal-600/25 via-cyan-600/20 to-transparent",
      orb3: "from-green-600/25 via-emerald-600/20 to-cyan-600/10",
      grid: "rgba(16, 185, 129, 0.22)",
    },
    amber: {
      orb1: "from-amber-600/30 via-orange-600/25 to-transparent",
      orb2: "from-orange-600/25 via-red-600/20 to-transparent",
      orb3: "from-yellow-600/25 via-amber-600/20 to-orange-600/10",
      grid: "rgba(245, 158, 11, 0.22)",
    },
    cyan: {
      orb1: "from-cyan-600/30 via-sky-600/25 to-transparent",
      orb2: "from-sky-600/25 via-blue-600/20 to-transparent",
      orb3: "from-teal-600/25 via-cyan-600/20 to-blue-600/10",
      grid: "rgba(6, 182, 212, 0.22)",
    },
  }[accentColor] || {
    orb1: "from-indigo-600/25 via-purple-600/20 to-transparent",
    orb2: "from-purple-600/25 via-pink-600/20 to-transparent",
    orb3: "from-cyan-600/20 via-blue-600/20 to-emerald-600/10",
    grid: "rgba(99, 102, 241, 0.22)",
  };

  return (
    <div
      id="interactive-canvas-bg"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print"
      aria-hidden="true"
    >
      {/* Dynamic Aurora Ambient Glowing Orbs */}
      <div className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br ${orbConfig.orb1} blur-[140px] animate-pulse pointer-events-none`} style={{ animationDuration: "10s" }} />
      <div className={`absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl ${orbConfig.orb2} blur-[150px] animate-pulse pointer-events-none`} style={{ animationDuration: "14s" }} />
      <div className={`absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-tr ${orbConfig.orb3} blur-[160px] animate-pulse pointer-events-none`} style={{ animationDuration: "12s" }} />

      {/* Cyber Grid with Soft Perspective */}
      <div
        className="absolute inset-0 opacity-[0.16] dark:opacity-[0.18] pointer-events-none transition-all duration-500"
        style={{
          backgroundImage:
            `linear-gradient(${orbConfig.grid} 1px, transparent 1px), linear-gradient(90deg, ${orbConfig.grid} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial Vignette Mask */}
      <div
        className="absolute inset-0 dark:block hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(2, 6, 23, 0.75) 75%, rgba(2, 6, 23, 0.98) 100%)",
        }}
      />
      <div
        className="absolute inset-0 block dark:hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(248, 250, 252, 0.5) 85%, rgba(241, 245, 249, 0.9) 100%)",
        }}
      />

      {/* Interactive Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
