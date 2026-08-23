import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/Score";
import { AIInterventionModal } from "../components/AIInterventionModal";
import { AssignTaskModal } from "../components/AssignTaskModal";
import { CompanyMatcherModal } from "../components/CompanyMatcherModal";
import { LiveProctoringOperations } from "../components/LiveProctoringOperations";
import {
  Users,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Zap,
  Target,
  FileText,
  Mic,
  Code2,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Send,
  CheckCircle2,
  X,
  Activity,
  Building2,
  ShieldAlert,
  ListTodo,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStudentsList,
  getCohortAnalytics,
  sendStudentFeedback,
  addMentee,
  searchRegisteredStudents,
  exportCohortCsvData,
} from "../lib/admin-api";

export function OverviewPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "top" | "ontrack" | "atrisk">("all");

  // Feedback Modal State
  const [feedbackStudent, setFeedbackStudent] = useState<any | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackActionType, setFeedbackActionType] = useState("general");

  // AI Co-Pilot & Task Modals State
  const [interventionStudent, setInterventionStudent] = useState<any | null>(null);
  const [taskStudent, setTaskStudent] = useState<any | null>(null);
  const [showCompanyMatcher, setShowCompanyMatcher] = useState(false);
  const [showLiveProctoring, setShowLiveProctoring] = useState(false);

  // Add Mentee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [menteeEmailInput, setMenteeEmailInput] = useState("");
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);

  // Query ONLY assigned mentees for mentor's command center
  const {
    data: rosterData,
    isLoading: loadingRoster,
    isRefetching: isRefetchingRoster,
    refetch: refetchRoster,
  } = useQuery({
    queryKey: ["adminStudentsList", 1, "", "my-mentees", 100],
    queryFn: () => getStudentsList(1, "", "my-mentees", 100),
  });

  const {
    data: cohortData,
    isLoading: loadingCohort,
    isRefetching: isRefetchingCohort,
    refetch: refetchCohort,
  } = useQuery({
    queryKey: ["adminCohortAnalytics", "my-mentees"],
    queryFn: () => getCohortAnalytics("my-mentees"),
  });

  // Feedback Mutation
  const sendFeedbackMutation = useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: any }) =>
      sendStudentFeedback(studentId, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Guidance note delivered to mentee");
      setFeedbackStudent(null);
      setFeedbackNote("");
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to deliver guidance note");
    },
  });

  // Add Mentee Mutation
  const addMenteeMutation = useMutation({
    mutationFn: (emailOrId: string) => addMentee(emailOrId),
    onSuccess: (res) => {
      toast.success(res.message || "Student assigned to your mentee roster");
      setMenteeEmailInput("");
      setStudentSearchResults([]);
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminCohortAnalytics"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || "Could not add student. Verify the student has a registered account."
      );
    },
  });

  const handleLiveSearch = async (val: string) => {
    setMenteeEmailInput(val);
    if (!val.trim()) {
      setStudentSearchResults([]);
      return;
    }
    setIsSearchingStudents(true);
    try {
      const res = await searchRegisteredStudents(val);
      setStudentSearchResults(res.students || []);
    } catch {
      setStudentSearchResults([]);
    } finally {
      setIsSearchingStudents(false);
    }
  };

  const handleRefresh = () => {
    refetchRoster();
    refetchCohort();
    toast.success("Telemetry refreshed");
  };

  const handleExportCohortCSV = () => {
    const mentees = rosterData?.students || [];
    if (mentees.length === 0) {
      toast.error("No mentees available to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Target Role",
      "Overall Readiness %",
      "Status",
      "ATS Resume %",
      "Mock Interview %",
      "Problems Solved",
      "Verified Proofs",
    ];

    const rows = mentees.map((s) => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.targetRole}"`,
      s.overallReadiness,
      `"${s.status}"`,
      s.resumeScore,
      s.avgInterviewScore,
      s.totalProblemsSolved,
      s.verifiedEventsCount,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mentees-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported mentees CSV");
  };

  const students = rosterData?.students || [];

  // Accurate assigned mentee calculations
  const totalCount = students.length;
  const placementReadyCount = students.filter((s) => s.overallReadiness >= 75).length;
  const developingCount = students.filter((s) => s.overallReadiness >= 45 && s.overallReadiness < 75).length;
  const interventionCount = students.filter((s) => s.overallReadiness < 45).length;

  const readyPct = totalCount > 0 ? Math.round((placementReadyCount / totalCount) * 100) : 0;
  const devPct = totalCount > 0 ? Math.round((developingCount / totalCount) * 100) : 0;
  const alertPct = totalCount > 0 ? Math.round((interventionCount / totalCount) * 100) : 0;

  const avgCohortReadiness =
    totalCount > 0
      ? Math.round(students.reduce((acc, s) => acc + s.overallReadiness, 0) / totalCount)
      : 0;

  const avgResumeScore =
    totalCount > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.resumeScore || 0), 0) / totalCount)
      : 0;

  const avgInterviewScore =
    totalCount > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.avgInterviewScore || 0), 0) / totalCount)
      : 0;

  const totalCodingProblems = students.reduce((acc, s) => acc + (s.totalProblemsSolved || 0), 0);
  const totalVerifiedProofs = students.reduce((acc, s) => acc + (s.verifiedEventsCount || 0), 0);

  // Missing skills from cohort data or computed
  const missingSkills = cohortData?.topMissingSkills || [];
  const topTargetRoles = cohortData?.topTargetRoles || [];

  // Filter students
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.targetRole.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "top") return st.status === "Top Performer" || st.overallReadiness >= 75;
    if (statusFilter === "ontrack") return st.status === "On Track" && st.overallReadiness >= 45 && st.overallReadiness < 75;
    if (statusFilter === "atrisk") return st.status === "At Risk" || st.overallReadiness < 45;
    return true;
  });

  const urgentAtRisk = students.filter((s) => s.status === "At Risk" || s.overallReadiness < 45).slice(0, 3);
  const topPerformer = students.reduce((prev, current) =>
    (prev && prev.overallReadiness > current.overallReadiness) ? prev : current, students[0]);

  if (loadingRoster || loadingCohort) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Loading assigned mentees telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Assigned: <strong className="text-slate-900 dark:text-white">{totalCount} Mentees</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Mentor Command Center
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Real-time diagnostic telemetry, skill deficiency analysis, and placement readiness tracking for your assigned mentees.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 self-start lg:self-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition hover:scale-105"
          >
            <UserPlus className="h-4 w-4" /> Add Mentee
          </button>

          <button
            onClick={handleExportCohortCSV}
            className="px-3.5 py-2.5 rounded-xl glass hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-2 transition"
            title="Export Mentees CSV"
          >
            <Download className="h-4 w-4 text-indigo-500" /> Export CSV
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefetchingRoster || isRefetchingCohort}
            className="p-2.5 rounded-xl glass hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition"
            title="Refresh Telemetry"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-500 dark:text-slate-400 ${
                isRefetchingRoster || isRefetchingCohort ? "animate-spin text-indigo-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Hiring Readiness & Placement Funnel Hub */}
      <GlassCard
        variant="strong"
        className="p-6 sm:p-7 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/50 dark:via-slate-900/80 dark:to-purple-950/50 relative overflow-hidden"
      >
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Zap className="h-3 w-3 text-indigo-500 dark:text-indigo-400" /> Hiring Readiness Funnel
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Target Benchmark: <strong className="text-emerald-600 dark:text-emerald-400">≥75% Readiness</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mentorship Placement Funnel
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Composite telemetry evaluated across ATS resumes, technical mock interviews, verified proofs, and DSA problem solving.
            </p>
          </div>

          {/* Clean Metric Badges (No Cheesy Symbols) */}
          <div className="grid grid-cols-3 gap-3 w-full xl:w-auto shrink-0 bg-white/80 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md">
            {/* Placement Ready */}
            <div className="text-center px-2 sm:px-4 border-r border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-2xl sm:text-3xl font-black">{placementReadyCount}</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">Placement Ready</p>
              <span className="text-[10px] text-slate-500 font-semibold">({readyPct}%)</span>
            </div>

            {/* Developing */}
            <div className="text-center px-2 sm:px-4 border-r border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-2xl sm:text-3xl font-black">{developingCount}</span>
              </div>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-0.5">Developing</p>
              <span className="text-[10px] text-slate-500 font-semibold">({devPct}%)</span>
            </div>

            {/* Intervention Required */}
            <div className="text-center px-2 sm:px-4">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-2xl sm:text-3xl font-black">{interventionCount}</span>
              </div>
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mt-0.5">Intervention</p>
              <span className="text-[10px] text-slate-500 font-semibold">({alertPct}%)</span>
            </div>
          </div>
        </div>

        {/* Funnel Progress Visualizer Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              Mentees Placement Readiness Distribution
            </span>
            <span className="text-indigo-600 dark:text-indigo-300 font-extrabold bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
              {avgCohortReadiness}% Average Readiness
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-300 dark:border-white/10 shadow-inner">
            {totalCount > 0 ? (
              <>
                <div
                  style={{ width: `${Math.max(readyPct > 0 ? 5 : 0, readyPct)}%` }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full transition-all duration-500"
                  title={`Placement Ready: ${readyPct}% (${placementReadyCount} mentees)`}
                />
                <div
                  style={{ width: `${Math.max(devPct > 0 ? 5 : 0, devPct)}%` }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                  title={`Developing: ${devPct}% (${developingCount} mentees)`}
                />
                <div
                  style={{ width: `${Math.max(alertPct > 0 ? 5 : 0, alertPct)}%` }}
                  className="bg-gradient-to-r from-rose-500 to-red-400 h-full rounded-r-full transition-all duration-500"
                  title={`Intervention Required: ${alertPct}% (${interventionCount} mentees)`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-300 dark:bg-slate-800 h-full rounded-full" />
            )}
          </div>
        </div>

        {/* Live Cohort Insight */}
        {totalCount > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Activity className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>
                {missingSkills.length > 0
                  ? `Focus area: ${missingSkills[0].skill} is lacking across ${missingSkills[0].count} mentees.`
                  : "Tracking telemetry across all assigned mentees."}
              </span>
            </div>

            {topPerformer && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <span>
                  Highest readiness: <strong className="text-slate-900 dark:text-white font-bold">{topPerformer.name}</strong> ({topPerformer.overallReadiness}%)
                </span>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* 6-Card Rich Telemetry KPI Grid (Accurate to Assigned Mentees) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Assigned Mentees */}
        <GlassCard className="p-4 space-y-2 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Mentees
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Assigned Mentees</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalCount}</p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">Active cohort</p>
          </div>
        </GlassCard>

        {/* KPI 2: ATS Resume Score */}
        <GlassCard className="p-4 space-y-2 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
              ATS
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg ATS Resume</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{avgResumeScore}%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Resume evaluation</p>
          </div>
        </GlassCard>

        {/* KPI 3: Mock Interview Avg */}
        <GlassCard className="p-4 space-y-2 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30">
              <Mic className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Mock
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mock Interview</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{avgInterviewScore}%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Technical rounds</p>
          </div>
        </GlassCard>

        {/* KPI 4: Coding Solved */}
        <GlassCard className="p-4 space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              DSA
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Coding Solved</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{totalCodingProblems}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Total problems</p>
          </div>
        </GlassCard>

        {/* KPI 5: Verified Proofs */}
        <GlassCard className="p-4 space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Proofs
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Proofs</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{totalVerifiedProofs}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Credentials</p>
          </div>
        </GlassCard>

        {/* KPI 6: Readiness Index */}
        <GlassCard className="p-4 space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-500 dark:text-pink-400 border border-pink-500/30">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full">
              Index
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Readiness Index</p>
            <p className="text-2xl font-black text-pink-600 dark:text-pink-400 tracking-tight">{avgCohortReadiness}%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{placementReadyCount} ready for hire</p>
          </div>
        </GlassCard>
      </div>

      {/* Main 2-Column Command Workspace */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Deficiency Heatmap */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard className="p-6 space-y-5 border-amber-500/20">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" /> Skill Deficiency Heatmap
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Missing skills identified across mentees
                </p>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">
                Gaps
              </span>
            </div>

            <div className="space-y-3">
              {missingSkills.length > 0 ? (
                missingSkills.slice(0, 6).map((item, idx) => {
                  const pct = Math.min(100, Math.round((item.count / Math.max(1, totalCount)) * 100));
                  return (
                    <div key={idx} className="space-y-1.5 p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">
                          {item.skill}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">{item.count} mentees lacking</span>
                      </div>

                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No skill gap data detected for your mentees yet.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Target Role Breakdown */}
          {topTargetRoles.length > 0 && (
            <GlassCard className="p-6 space-y-4 border-indigo-500/20">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Target Roles
                </h3>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {topTargetRoles.length} Roles
                </span>
              </div>

              <div className="space-y-2.5">
                {topTargetRoles.map((roleItem, idx) => {
                  const rolePct = Math.min(100, Math.round((roleItem.count / Math.max(1, totalCount)) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{roleItem.role}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{roleItem.count} ({rolePct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${rolePct}%` }} className="h-full bg-indigo-500 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Mentees Readiness Directory */}
        <div className="space-y-6 lg:col-span-2">
          <GlassCard className="p-6 space-y-5 border-slate-200 dark:border-white/10">
            {/* Directory Header & In-page Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" /> Mentees Readiness Directory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time student progress telemetry & 360° profile inspection
                </p>
              </div>

              <Link
                to="/students"
                className="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 shrink-0 self-start sm:self-center"
              >
                Full Roster View <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Filter Tabs & Quick Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-white/10 p-1 rounded-xl flex-wrap gap-1">
                {[
                  { key: "all", label: `All (${students.length})` },
                  { key: "top", label: `Ready (${placementReadyCount})` },
                  { key: "ontrack", label: `Developing (${developingCount})` },
                  { key: "atrisk", label: `Intervention (${interventionCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      statusFilter === tab.key
                        ? "btn-gradient text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative min-w-[200px]">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter mentee name or role..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Mentees Cards List */}
            {filteredStudents.length > 0 ? (
              <div className="space-y-3.5">
                {filteredStudents.map((student) => {
                  const isAtRisk = student.status === "At Risk" || student.overallReadiness < 45;
                  const isTop = student.status === "Top Performer" || student.overallReadiness >= 75;

                  return (
                    <div
                      key={student._id}
                      className={`p-4 rounded-2xl glass border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-lg ${
                        isAtRisk
                          ? "border-rose-500/30 hover:border-rose-500/50 bg-rose-500/5"
                          : isTop
                          ? "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5"
                          : "border-slate-200 dark:border-white/10 hover:border-indigo-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <ScoreRing score={student.overallReadiness} size={50} stroke={5} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate" title={student.name}>
                              {student.name}
                            </p>
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                isTop
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                                  : isAtRisk
                                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                                  : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5" title={student.targetRole}>
                            {student.targetRole}
                          </p>

                          {/* Multi-Telemetry Stat Badges */}
                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] mt-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                              ATS: {student.resumeScore}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                              Mock: {student.avgInterviewScore}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              Solved: {student.totalProblemsSolved}
                            </span>
                            {student.verifiedEventsCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                                {student.verifiedEventsCount} Proofs
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => setFeedbackStudent(student)}
                          className="px-3 py-2 rounded-xl glass hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-500/30 text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5 transition shadow-sm"
                          title="Send Quick Guidance Note to Student"
                        >
                          <Send className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Guide</span>
                        </button>

                        <Link
                          to={`/students/${student._id}`}
                          className="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition hover:scale-105"
                        >
                          Inspect 360° <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl glass border border-slate-200 dark:border-white/10 space-y-3">
                <Users className="h-10 w-10 text-indigo-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {students.length === 0 ? "You Have No Assigned Mentees Yet" : "No Mentees Match Filter Criteria"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {students.length === 0
                    ? "Click 'Add Mentee' above to assign registered students to your mentor command center."
                    : "Try clearing your search query or reset your filter."}
                </p>
                {students.length === 0 ? (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md"
                  >
                    <UserPlus className="h-4 w-4" /> Add Mentee
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2 rounded-xl glass text-xs font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </GlassCard>

          {/* Urgent Intervention Spotlight Card */}
          {urgentAtRisk.length > 0 && (
            <GlassCard className="p-5 border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-500" /> Urgent Intervention Required ({urgentAtRisk.length})
                </h4>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Action Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                These mentees are scoring below the placement threshold. Send a direct guidance note:
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {urgentAtRisk.map((st) => (
                  <div
                    key={st._id}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/90 border border-rose-500/20 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate" title={st.name}>
                          {st.name}
                        </span>
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">
                          {st.overallReadiness}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{st.targetRole}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => setInterventionStudent(st)}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-black text-indigo-600 dark:text-indigo-300 transition flex items-center justify-center gap-1 shadow-sm"
                        title="AI Co-Pilot 2-Week Remedial Plan"
                      >
                        <Bot className="h-3 w-3 text-indigo-500" /> AI Plan
                      </button>
                      <button
                        onClick={() => setTaskStudent(st)}
                        className="flex-1 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-black text-purple-600 dark:text-purple-300 transition flex items-center justify-center gap-1 shadow-sm"
                        title="Assign Specific Goal Milestone"
                      >
                        <ListTodo className="h-3 w-3 text-purple-500" /> Assign Goal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* MODAL 1: Send Direct Guidance Note to Mentee */}
      {feedbackStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard variant="strong" className="w-full max-w-lg p-6 space-y-5 border-indigo-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center font-bold text-white text-sm">
                    {feedbackStudent.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Send Guidance Note to {feedbackStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Delivers an alert notification to student's dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackStudent(null);
                  setFeedbackNote("");
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!feedbackNote.trim()) {
                  toast.error("Please enter a guidance message");
                  return;
                }
                sendFeedbackMutation.mutate({
                  studentId: feedbackStudent._id,
                  payload: {
                    title: `Mentor Guidance Note`,
                    note: feedbackNote.trim(),
                    actionType: feedbackActionType,
                  },
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Action Focus Area
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "general", label: "General Guidance" },
                    { id: "resume", label: "ATS Resume" },
                    { id: "interview", label: "Mock Interview" },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setFeedbackActionType(act.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                        feedbackActionType === act.id
                          ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                          : "border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Actionable Mentorship Message
                </label>
                <textarea
                  rows={4}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={`Hi ${feedbackStudent.name}, focus on practicing technical interview rounds and coding problems this week...`}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackStudent(null);
                    setFeedbackNote("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendFeedbackMutation.isPending}
                  className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {sendFeedbackMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Dispatch Guidance Note
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL 2: Add Mentee to Dashboard */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard variant="strong" className="w-full max-w-md p-6 space-y-5 border-indigo-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Mentee to Roster</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Assign registered student to your command center</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setMenteeEmailInput("");
                  setStudentSearchResults([]);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!menteeEmailInput.trim()) {
                  toast.error("Please enter a student email or name");
                  return;
                }
                addMenteeMutation.mutate(menteeEmailInput.trim());
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Registered Email or Name
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={menteeEmailInput}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    placeholder="Enter student email..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {isSearchingStudents && (
                    <Loader2 className="h-4 w-4 absolute right-3 top-3 animate-spin text-indigo-500" />
                  )}
                </div>
              </div>

              {/* Live search results */}
              {studentSearchResults.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-2 py-1 uppercase">
                    Matching Registered Students ({studentSearchResults.length})
                  </p>
                  {studentSearchResults.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => {
                        if (!s.isMyMentee) {
                          addMenteeMutation.mutate(s.email);
                        }
                      }}
                      className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                        s.isMyMentee ? "bg-amber-500/10 border border-amber-500/20" : "hover:bg-slate-200/60 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 grid place-items-center font-bold shrink-0 text-xs">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                      {s.isMyMentee ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Mentee
                        </span>
                      ) : (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">Add +</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setMenteeEmailInput("");
                    setStudentSearchResults([]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMenteeMutation.isPending}
                  className="btn-gradient px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {addMenteeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Assign Mentee
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL 3: AI Co-Pilot Intervention Diagnosis */}
      {interventionStudent && (
        <AIInterventionModal
          open={!!interventionStudent}
          studentId={interventionStudent._id}
          studentName={interventionStudent.name}
          onClose={() => setInterventionStudent(null)}
        />
      )}

      {/* MODAL 4: Prescriptive Goal & Milestone Assignment */}
      {taskStudent && (
        <AssignTaskModal
          open={!!taskStudent}
          studentId={taskStudent._id}
          studentName={taskStudent.name}
          onClose={() => setTaskStudent(null)}
        />
      )}
    </div>
  );
}
