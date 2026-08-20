import React from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "../components/GlassCard";
import {
  BarChart3,
  Users,
  Trophy,
  FileText,
  Mic,
  Code2,
  Loader2,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { getCohortAnalytics, exportCohortCsvData } from "../lib/admin-api";
import { useTheme } from "../lib/theme-context";
import { toast } from "sonner";

export function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["adminCohortAnalytics"],
    queryFn: () => getCohortAnalytics(),
  });

  const handleExportAnalyticsCsv = async () => {
    toast.loading("Compiling institutional analytics dataset...", { id: "analytics-csv" });
    try {
      const res = await exportCohortCsvData();
      const rows = res.students || [];
      const headers = [
        "Name",
        "Email",
        "Target Role",
        "Overall Readiness %",
        "ATS Resume %",
        "Mock Interview %",
        "Coding Solved Count",
        "Verified Event Proofs",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...rows.map((s) =>
          [
            `"${s.name}"`,
            `"${s.email}"`,
            `"${s.targetRole}"`,
            s.overallReadiness,
            s.resumeScore,
            s.avgInterviewScore,
            s.totalProblemsSolved,
            s.verifiedEventsCount,
            `"${s.status}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Institutional_Cohort_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${rows.length} student records!`, { id: "analytics-csv" });
    } catch {
      toast.error("Failed to export analytics CSV", { id: "analytics-csv" });
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <BarChart3 className="h-6 w-6 text-indigo-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Generating Analytics Matrix...
        </p>
      </div>
    );
  }

  const tooltipBg = resolvedTheme === "light" ? "#ffffff" : "#0f172a";
  const tooltipBorder = resolvedTheme === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)";
  const tooltipColor = resolvedTheme === "light" ? "#0f172a" : "#ffffff";
  const axisColor = resolvedTheme === "light" ? "#64748b" : "#94a3b8";

  const { summary, topTargetRoles = [], topMissingSkills = [] } = data;
  const funnel = summary?.placementFunnel || { placementReady: 0, developing: 0, intervention: 0 };
  const total = summary.totalStudents || 1;

  const roleChartData = topTargetRoles.map((r) => ({
    role: r.role,
    Students: r.count,
    Percentage: Math.round((r.count / total) * 100),
  }));

  const funnelPieData = [
    { name: `Placement Ready (${funnel.placementReady})`, value: funnel.placementReady, color: "#10b981" },
    { name: `Developing (${funnel.developing})`, value: funnel.developing, color: "#f59e0b" },
    { name: `Intervention (${funnel.intervention})`, value: funnel.intervention, color: "#f43f5e" },
  ];

  const skillGapsChartData = topMissingSkills.map((s) => ({
    skill: s.skill,
    "Lacking Mentees": s.count,
    "Lacking %": Math.round((s.count / total) * 100),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Deep Cohort Intelligence
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-500" /> Cohort Analytics & Intelligence Matrix
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
            Aggregated placement readiness velocity, skill deficiency telemetry, and hiring funnel benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportAnalyticsCsv}
            className="btn-gradient px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition hover:scale-105"
          >
            <Download className="h-4 w-4" /> Export Analytics CSV
          </button>

          <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-950 p-2 rounded-2xl border border-slate-300 dark:border-white/10 text-xs">
            <span className="text-slate-500 font-bold px-2">Cohort:</span>
            <span className="px-3 py-1 rounded-xl bg-indigo-500 text-white font-black shadow-md">
              {summary.totalStudents} Mentees
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1 text-center border-indigo-500/20">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-500 w-fit mx-auto mb-1">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Mentees</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalStudents}</p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Active Cohort Roster</p>
        </GlassCard>

        <GlassCard className="p-4 space-y-1 text-center border-blue-500/20">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-500 w-fit mx-auto mb-1">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg ATS Resume Match</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{summary.avgResumeScore}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{summary.analyzedResumesCount || 0} evaluated</p>
        </GlassCard>

        <GlassCard className="p-4 space-y-1 text-center border-purple-500/20">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-500 w-fit mx-auto mb-1">
            <Mic className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Mock Interview Score</p>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{summary.avgInterviewScore}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{summary.completedInterviewsCount || 0} completed</p>
        </GlassCard>

        <GlassCard className="p-4 space-y-1 text-center border-emerald-500/20">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 w-fit mx-auto mb-1">
            <Code2 className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Solved Problems</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.totalCodingProblems}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Multi-platform telemetry</p>
        </GlassCard>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart 1: Hiring Readiness Funnel */}
        <GlassCard className="p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" /> Hiring Readiness Distribution Funnel
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              3 TIERS
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                >
                  {funnelPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "1rem",
                    fontSize: "0.75rem",
                    color: tooltipColor,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2: Skill Deficiency Heatmap Bar */}
        <GlassCard className="p-6 space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" /> Cohort Skill Deficiency Heatmap
            </h3>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              HIGH PRIORITY
            </span>
          </div>

          <div className="h-72 w-full">
            {skillGapsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="skill" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: "1rem",
                      fontSize: "0.75rem",
                      color: tooltipColor,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Bar dataKey="Lacking Mentees" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                No skill deficiency data available
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Target Roles Distribution */}
      <GlassCard className="p-6 space-y-4 border-indigo-500/20">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-500" /> Mentees Target Role Distribution Matrix
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            {roleChartData.length} SPECIALIZATIONS
          </span>
        </div>

        <div className="h-72 w-full">
          {roleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="role" stroke={axisColor} fontSize={11} />
                <YAxis stroke={axisColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "1rem",
                    fontSize: "0.75rem",
                    color: tooltipColor,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                />
                <Bar dataKey="Students" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
              No target roles data available
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
