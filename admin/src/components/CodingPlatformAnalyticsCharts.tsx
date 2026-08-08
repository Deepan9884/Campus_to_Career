import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { GlassCard } from "./GlassCard";
import { BarChart3, Activity, Trophy, Zap } from "lucide-react";

export interface CodingPlatformStatItem {
  platform: string;
  username?: string;
  profileUrl?: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  rating?: number;
  rank?: string | number | null;
}

const PLATFORM_BRAND_COLORS: Record<string, string> = {
  leetcode: "#f59e0b",
  codechef: "#8b5cf6",
  hackerrank: "#10b981",
  gfg: "#3b82f6",
};

export function CodingPlatformAnalyticsCharts({
  platforms,
  totalProblemsSolved: totalSolvedOverride,
}: {
  platforms: CodingPlatformStatItem[];
  totalProblemsSolved?: number;
}) {
  const totalSolvedSum = totalSolvedOverride ?? platforms.reduce((acc, p) => acc + (p.totalSolved || 0), 0);
  const totalEasySum = platforms.reduce((acc, p) => acc + (p.easySolved || 0), 0);
  const totalMediumSum = platforms.reduce((acc, p) => acc + (p.mediumSolved || 0), 0);
  const totalHardSum = platforms.reduce((acc, p) => acc + (p.hardSolved || 0), 0);

  const pieData = platforms
    .filter((p) => p.totalSolved > 0)
    .map((p) => ({
      name: p.platform.toUpperCase(),
      value: p.totalSolved,
      color: PLATFORM_BRAND_COLORS[p.platform] || "#6366f1",
    }));

  const stackedBarData = platforms.map((p) => ({
    name: p.platform.toUpperCase(),
    Easy: p.easySolved,
    Medium: p.mediumSolved,
    Hard: p.hardSolved,
  }));

  return (
    <div className="space-y-6">
      {/* 4 Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {platforms.map((p) => (
          <GlassCard key={p.platform} className="p-4 border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-indigo-300">{p.platform}</span>
              <span className="text-[10px] text-slate-400">@{p.username || "connected"}</span>
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{p.totalSolved} <span className="text-xs text-muted-foreground font-normal">solved</span></p>
            <div className="flex gap-2 text-[10px] mt-2 font-mono">
              <span className="text-emerald-400">E: {p.easySolved}</span>
              <span className="text-amber-400">M: {p.mediumSolved}</span>
              <span className="text-rose-400">H: {p.hardSolved}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h4 className="text-xs font-bold uppercase text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" /> Platform Share Distribution
          </h4>
          <div className="h-56 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No coding solved data</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h4 className="text-xs font-bold uppercase text-slate-300 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" /> Difficulty Split Per Platform
          </h4>
          <div className="h-56 w-full">
            {platforms.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Bar dataKey="Easy" stackId="a" fill="#10b981" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Hard" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No coding breakdown data</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
