import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/Score";
import {
  Users,
  AlertTriangle,
  Trophy,
  Award,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
  Target,
  FileText,
  Mic,
  Code2,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  Star,
} from "lucide-react";
import { getStudentsList, getCohortAnalytics } from "../lib/admin-api";

export function OverviewPage() {
  // Query ONLY assigned mentees for mentor's command center
  const { data: rosterData, isLoading: loadingRoster } = useQuery({
    queryKey: ["adminStudentsList", 1, "", "my-mentees"],
    queryFn: () => getStudentsList(1, "", "my-mentees"),
  });

  const { data: cohortData, isLoading: loadingCohort } = useQuery({
    queryKey: ["adminCohortAnalytics"],
    queryFn: getCohortAnalytics,
  });

  const students = rosterData?.students || [];
  const summary = cohortData?.summary;
  const funnel = summary?.placementFunnel || { placementReady: 0, developing: 0, intervention: 0 };
  const missingSkills = cohortData?.topMissingSkills || [];

  const atRiskStudents = students.filter((s) => s.status === "At Risk");
  const avgCohortReadiness =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.overallReadiness, 0) / students.length)
      : 0;

  if (loadingRoster || loadingCohort) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const totalCount = summary?.totalStudents || students.length || 0;
  const readyPct = totalCount > 0 ? Math.round((funnel.placementReady / totalCount) * 100) : 0;
  const devPct = totalCount > 0 ? Math.round((funnel.developing / totalCount) * 100) : 0;
  const alertPct = totalCount > 0 ? Math.round((funnel.intervention / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Mentor Hero Placement Funnel Header */}
      <GlassCard variant="strong" className="p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Mentee Command Center
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Mentorship & Hiring Readiness Funnel</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Live placement progress tracking for {totalCount} assigned mentees under your guidance.
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-2xl font-black text-emerald-400">{funnel.placementReady}</p>
              <p className="text-[10px] font-semibold text-emerald-300/80">Placement Ready</p>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-2xl font-black text-amber-400">{funnel.developing}</p>
              <p className="text-[10px] font-semibold text-amber-300/80">Developing</p>
            </div>
            <div className="text-center px-3">
              <p className="text-2xl font-black text-rose-400">{funnel.intervention}</p>
              <p className="text-[10px] font-semibold text-rose-300/80">Intervention</p>
            </div>
          </div>
        </div>

        {/* Funnel Progress Visualizer */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Mentees Cohort Distribution</span>
            <span>{avgCohortReadiness}% Overall Avg</span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-white/10">
            {totalCount > 0 ? (
              <>
                <div style={{ width: `${Math.max(5, readyPct)}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full" title={`Ready: ${readyPct}%`} />
                <div style={{ width: `${Math.max(5, devPct)}%` }} className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full" title={`Developing: ${devPct}%`} />
                <div style={{ width: `${Math.max(5, alertPct)}%` }} className="bg-gradient-to-r from-rose-500 to-red-400 h-full rounded-r-full" title={`Intervention: ${alertPct}%`} />
              </>
            ) : (
              <div className="w-full bg-slate-800 h-full rounded-full" />
            )}
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Assigned Mentees</p>
            <p className="text-2xl font-black text-white">{totalCount}</p>
            <p className="text-[10px] text-indigo-400 font-medium">Active learning cohort</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Avg ATS Resume</p>
            <p className="text-2xl font-black text-blue-400">{summary?.avgResumeScore || 0}%</p>
            <p className="text-[10px] text-slate-400 font-medium">{summary?.analyzedResumesCount || 0} resumes evaluated</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Mock Interview Avg</p>
            <p className="text-2xl font-black text-purple-400">{summary?.avgInterviewScore || 0}%</p>
            <p className="text-[10px] text-slate-400 font-medium">{summary?.completedInterviewsCount || 0} completed sessions</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Coding Solved</p>
            <p className="text-2xl font-black text-emerald-400">{summary?.totalCodingProblems || 0}</p>
            <p className="text-[10px] text-slate-400 font-medium">Multi-platform telemetry</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Heatmap + Mentees Directory */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Deficiency Heatmap */}
        <GlassCard className="p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-400" /> Cohort Skill Deficiency Heatmap
            </h3>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              TOP GAPS
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Skills most frequently missing across your mentees' gap analyses. Focus your upcoming mentorship sessions here:
          </p>

          <div className="space-y-3 pt-2">
            {missingSkills.length > 0 ? (
              missingSkills.slice(0, 6).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">{item.skill}</span>
                    <span className="text-amber-400 font-extrabold">{item.count} mentees lacking</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      style={{ width: `${Math.min(100, (item.count / Math.max(1, totalCount)) * 100)}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No skill gap data detected for your mentees yet.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Right Column: Assigned Mentees Directory Preview */}
        <GlassCard className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Mentees Readiness Directory
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time student progress telemetry & diagnostic indicators
              </p>
            </div>
            <Link
              to="/students"
              className="btn-gradient px-3.5 py-1.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1 shadow-md shadow-indigo-500/20"
            >
              Full Roster <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mentees Cards */}
          {students.length > 0 ? (
            <div className="space-y-3.5">
              {students.slice(0, 6).map((student) => (
                <div
                  key={student._id}
                  className="p-4 rounded-2xl glass border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <ScoreRing score={student.overallReadiness} size={48} stroke={5} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{student.name}</p>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            student.status === "Top Performer"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : student.status === "At Risk"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{student.targetRole}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                        <span className="text-blue-400 font-semibold">ATS: {student.resumeScore}%</span>
                        <span>•</span>
                        <span className="text-purple-400 font-semibold">Mock: {student.avgInterviewScore}%</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">Solved: {student.totalProblemsSolved}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/students/${student._id}`}
                    className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-xs font-bold text-indigo-300 border border-white/10 flex items-center gap-1.5 transition self-end sm:self-center shrink-0"
                  >
                    Inspect 360° Profile <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl glass border border-white/10 space-y-3">
              <Users className="h-10 w-10 text-indigo-400 mx-auto" />
              <h4 className="text-base font-bold text-white">You Have No Assigned Mentees Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add registered students from the Student Directory to your mentee list to track their placement readiness here.
              </p>
              <Link
                to="/students"
                className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <UserPlus className="h-4 w-4" /> Add Mentees to Dashboard
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
