import React from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "../components/GlassCard";
import { BarChart3, Users, Trophy, FileText, Mic, Code2, Loader2, Target, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { getCohortAnalytics } from "../lib/admin-api";

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminCohortAnalytics"],
    queryFn: getCohortAnalytics,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const { summary, topTargetRoles, topMissingSkills = [] } = data;
  const funnel = summary?.placementFunnel || { placementReady: 0, developing: 0, intervention: 0 };

  const roleChartData = topTargetRoles.map((r) => ({
    role: r.role,
    Students: r.count,
  }));

  const funnelPieData = [
    { name: "Placement Ready (≥75%)", value: funnel.placementReady, color: "#10b981" },
    { name: "Developing (45-74%)", value: funnel.developing, color: "#f59e0b" },
    { name: "Intervention (<45%)", value: funnel.intervention, color: "#ef4444" },
  ];

  const skillGapsChartData = topMissingSkills.map((s) => ({
    skill: s.skill,
    "Lacking Mentees": s.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-400" /> Cohort Analytics & Intelligence Matrix
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aggregated career readiness, hiring funnel metrics, and skill deficiency analytics
        </p>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <Users className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Total Cohort Mentees</p>
          <p className="text-3xl font-extrabold text-white mt-1">{summary.totalStudents}</p>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <FileText className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Avg ATS Resume Match</p>
          <p className="text-3xl font-extrabold text-blue-400 mt-1">{summary.avgResumeScore}%</p>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <Mic className="h-5 w-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Avg Mock Interview Score</p>
          <p className="text-3xl font-extrabold text-purple-400 mt-1">{summary.avgInterviewScore}%</p>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <Code2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Total Solved Problems</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{summary.totalCodingProblems}</p>
        </GlassCard>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart 1: Hiring Readiness Funnel */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-400" /> Hiring Readiness Distribution Funnel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={funnelPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4}>
                  {funnelPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2: Skill Deficiency Heatmap Bar */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" /> Cohort Skill Deficiency Heatmap
          </h3>
          <div className="h-64 w-full">
            {skillGapsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="skill" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#fff" }} />
                  <Bar dataKey="Lacking Mentees" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No skill deficiency data available</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Target Roles Distribution */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" /> Mentees Target Role Distribution
        </h3>
        <div className="h-64 w-full">
          {roleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="role" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#fff" }} />
                <Bar dataKey="Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No target roles data available</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
