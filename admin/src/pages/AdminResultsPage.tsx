import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Award,
  Download,
  Unlock,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
  Shield,
  FileText,
  Layers,
  ChevronDown,
  Sparkles,
  Trophy,
  User,
  Check,
  Code2,
  HelpCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "../components/GlassCard";
import {
  getAdminExams,
  getAdminExamResults,
  toggleAdminExamDisclosure,
  unblockStudentExam,
  type ExamItem,
  type ExamResultsResponse,
  type ExamResultRow,
} from "../lib/admin-api";
import { generateExamResultsPdf } from "../lib/exam-pdf-generator";

export function AdminResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const selectedExamIdParam = searchParams.get("examId") || "";

  const [selectedExamId, setSelectedExamId] = useState<string>(selectedExamIdParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [inspectSubmission, setInspectSubmission] = useState<ExamResultRow | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Fetch list of all exams for dropdown selector
  const { data: exams = [], isLoading: isLoadingExams } = useQuery({
    queryKey: ["admin-exams-list"],
    queryFn: () => getAdminExams("all", ""),
  });

  // Synchronize URL search params and selectedExamId
  useEffect(() => {
    if (selectedExamIdParam && selectedExamIdParam !== selectedExamId) {
      setSelectedExamId(selectedExamIdParam);
    } else if (!selectedExamId && exams.length > 0) {
      const firstId = exams[0]._id;
      setSelectedExamId(firstId);
      setSearchParams({ examId: firstId }, { replace: true });
    }
  }, [selectedExamIdParam, exams, selectedExamId, setSearchParams]);

  // Fetch results for the selected exam
  const {
    data: resultsData,
    isLoading: isLoadingResults,
    refetch: refetchResults,
  } = useQuery({
    queryKey: ["admin-exam-results", selectedExamId],
    queryFn: () => getAdminExamResults(selectedExamId),
    enabled: Boolean(selectedExamId),
  });

  // Disclosure Toggle Mutation
  const toggleDisclosureMutation = useMutation({
    mutationFn: ({ examId, currentState }: { examId: string; currentState: boolean }) =>
      toggleAdminExamDisclosure(examId, !currentState),
    onSuccess: (res) => {
      toast.success(
        res.isResultDisclosed
          ? "Exam results DISCLOSED to students. Students can now view their scores."
          : "Exam results CONCEALED. Marks are now hidden from students."
      );
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ["admin-exams-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle result disclosure");
    },
  });

  const unblockMutation = useMutation({
    mutationFn: ({ examId, studentId }: { examId: string; studentId: string }) =>
      unblockStudentExam(examId, studentId),
    onSuccess: (data, variables) => {
      toast.success(data.message || "Candidate has been unblocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminExamResults", selectedExamId] });
      queryClient.invalidateQueries({ queryKey: ["admin-exams-list"] });
      if (inspectSubmission && inspectSubmission.studentId === variables.studentId) {
        setInspectSubmission((prev) => (prev ? { ...prev, isBlocked: false, status: "in_progress" } : null));
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to unblock candidate");
    },
  });

  const handleUnblockStudent = (studentId: string, studentName: string) => {
    if (!selectedExamId) return;
    unblockMutation.mutate({ examId: selectedExamId, studentId });
  };

  const handleSelectExam = (id: string) => {
    setSelectedExamId(id);
    setSearchParams({ examId: id });
  };

  const handleDownloadPdf = async () => {
    if (!resultsData) return;
    setIsExportingPdf(true);
    try {
      await generateExamResultsPdf(resultsData);
      toast.success("PDF Marksheet exported and downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const isDisclosed = resultsData?.exam.isResultDisclosed ?? false;

  // Filter student rows
  const filteredRows = (resultsData?.resultsTable || []).filter((row) => {
    const matchesSearch =
      row.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "passed" ? row.passed : !row.passed;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-7">
      {/* ── HEADER & EXAM PICKER ──────────────────────────────────────────── */}
      <div className="elite-panel hero-card-shimmer relative rounded-3xl p-5 sm:p-6 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-72 h-32 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(167,139,250,0.7), transparent 70%)" }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Evaluation & Marksheet Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              <span className="gradient-text-warm">Assessment Results</span>{" "}
              <span className="text-[var(--foreground)]">& Evaluation</span>
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 max-w-xl">
              Student submissions, marksheets, and score disclosures.
            </p>
          </div>

          {/* Exam Dropdown Selector */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[260px]">
              <select
                value={selectedExamId}
                onChange={(e) => handleSelectExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none pr-9 shadow-sm"
              >
                {exams.length === 0 ? (
                  <option value="" disabled className="bg-[#0f172a] text-slate-400">
                    {isLoadingExams ? "Loading assessments..." : "No assessments available"}
                  </option>
                ) : (
                  exams.map((exam) => (
                    <option
                      key={exam._id}
                      value={exam._id}
                      className="bg-[#0f172a] text-slate-100 py-2.5 font-medium"
                    >
                      {exam.title} ({exam.examType.toUpperCase()})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick-Switch Assessment Pills */}
        {exams.length > 1 && (
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] shrink-0 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Tests:
            </span>
            {exams.map((exam) => {
              const isSelected = exam._id === selectedExamId;
              return (
                <button
                  key={exam._id}
                  type="button"
                  onClick={() => handleSelectExam(exam._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "btn-gradient text-white shadow-md shadow-indigo-500/25"
                      : "bg-[var(--glass-input-bg)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                  }`}
                >
                  <span>{exam.title}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md ${
                      isSelected ? "bg-white/20 text-white font-extrabold" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {exam.examType}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoadingResults ? (
        <div className="p-16 text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-foreground)]">Loading assessment results...</p>
        </div>
      ) : !resultsData ? (
        <div className="p-12 rounded-3xl border border-dashed border-[var(--border)] text-center space-y-4 bg-white/[0.02]">
          <AlertCircle className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Exam Selected</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Please select an assessment from below to view its results:
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto pt-2">
            {exams.map((ex) => (
              <button
                key={ex._id}
                type="button"
                onClick={() => handleSelectExam(ex._id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── SELECTED EXAM CONTROL & DISCLOSURE BANNER ──────────────────── */}
          <GlassCard className="p-6 relative overflow-hidden space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {resultsData.exam.examType} Exam
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {resultsData.exam.category} • {resultsData.exam.durationMinutes} mins
                  </span>
                </div>
                <h2 className="text-xl font-black text-[var(--foreground)]">
                  {resultsData.exam.title}
                </h2>
              </div>

              {/* Action Buttons: Disclose Result & Download PDF */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Disclose Result Button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleDisclosureMutation.mutate({
                      examId: resultsData.exam._id,
                      currentState: isDisclosed,
                    })
                  }
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-md ${
                    isDisclosed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  }`}
                  title={
                    isDisclosed
                      ? "Results are visible to students. Click to hide."
                      : "Results are hidden. Click to disclose to students."
                  }
                >
                  {isDisclosed ? (
                    <>
                      <Unlock className="h-4 w-4" />
                      <span>Results Disclosed (Click to Hide)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Disclose Result to Students</span>
                    </>
                  )}
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  disabled={isExportingPdf || resultsData.resultsTable.length === 0}
                  onClick={handleDownloadPdf}
                  className="btn-gradient px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:scale-105 transition disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExportingPdf ? "Generating PDF..." : "Download as PDF"}</span>
                </button>
              </div>
            </div>

            {/* Performance Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Appeared
                </span>
                <p className="text-xl font-black text-[var(--foreground)] mt-0.5">
                  {resultsData.summary.totalSubmissions}
                </p>
                <span className="text-[10px] text-slate-400">Total Candidates</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Pass Rate
                </span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {resultsData.summary.passPercentage}%
                </p>
                <span className="text-[10px] text-emerald-300">
                  {resultsData.summary.passedCount} Passed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Average Score
                </span>
                <p className="text-xl font-black text-indigo-400 mt-0.5">
                  {resultsData.summary.avgScore} <span className="text-xs text-slate-400">/ {resultsData.exam.totalMarks}</span>
                </p>
                <span className="text-[10px] text-slate-400">Cohort Mean</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Highest Score
                </span>
                <p className="text-xl font-black text-amber-400 mt-0.5">
                  {resultsData.summary.highestScore} <span className="text-xs text-slate-400">/ {resultsData.exam.totalMarks}</span>
                </p>
                <span className="text-[10px] text-amber-300 font-semibold">Rank #1 Benchmark</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Passing Cutoff
                </span>
                <p className="text-xl font-black text-[var(--foreground)] mt-0.5">
                  {resultsData.exam.passingScorePercentage}%
                </p>
                <span className="text-[10px] text-slate-400">Minimum to Pass</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] block uppercase">
                  Student Visibility
                </span>
                <p
                  className={`text-sm font-black mt-1 ${
                    isDisclosed ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isDisclosed ? "DISCLOSED" : "HIDDEN"}
                </p>
                <span className="text-[10px] text-slate-400">
                  {isDisclosed ? "Live in Student Hub" : "Confidential"}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* ── TABLE CONTROLS & SEARCH ───────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs">
              {[
                { id: "all", label: "All Candidates" },
                { id: "passed", label: "Passed" },
                { id: "failed", label: "Failed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                    statusFilter === tab.id
                      ? "bg-white dark:bg-[var(--glass-input-bg)] text-[var(--primary)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate by name, roll no, email..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* ── TABULAR MARKSHEET GRID (ROWS & COLUMNS) ────────────────────── */}
          {filteredRows.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-[var(--border)] text-center space-y-3">
              <User className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No Student Submissions Yet</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Student submissions will appear here once candidates complete the examination.
              </p>
            </div>
          ) : (
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-950/60 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)]">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Register No</th>
                      <th className="py-3 px-4">Question-wise Scores</th>
                      <th className="py-3 px-4 text-center">Overall Score</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4 text-center">Integrity</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredRows.map((row) => {
                      const isTop3 = row.rank <= 3;
                      return (
                        <tr
                          key={row.submissionId}
                          className="hover:bg-[var(--glass-input-bg)] transition-colors group"
                        >
                          {/* Rank / Position */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-black">
                              {row.rank === 1 ? (
                                <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                                  <Trophy className="h-4 w-4" /> #1
                                </span>
                              ) : row.rank === 2 ? (
                                <span className="flex items-center gap-1 text-slate-300 font-extrabold">
                                  <Award className="h-4 w-4" /> #2
                                </span>
                              ) : row.rank === 3 ? (
                                <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                                  <Award className="h-4 w-4" /> #3
                                </span>
                              ) : (
                                <span className="text-[var(--muted-foreground)] font-bold">
                                  #{row.rank}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[rgb(var(--primary-rgb)/20%)] text-[var(--primary)] flex items-center justify-center text-xs font-black">
                                {row.studentName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-[var(--foreground)] block">
                                  {row.studentName}
                                </span>
                                <span className="text-[10px] text-[var(--muted-foreground)]">
                                  {row.studentEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Register Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[var(--foreground)] text-[11px]">
                            {row.registerNumber}
                          </td>

                          {/* Question-Wise Scores Chips */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {row.questionScores.slice(0, 5).map((q, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                    q.isCorrect || q.score > 0
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                      : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                                  }`}
                                  title={`Q${idx + 1}: ${q.score}/${q.maxMarks} marks`}
                                >
                                  Q{idx + 1}: {q.score}/{q.maxMarks}
                                </span>
                              ))}
                              {row.questionScores.length > 5 && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400">
                                  +{row.questionScores.length - 5}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total Score */}
                          <td className="py-3.5 px-4 text-center">
                            <strong className="text-sm font-black text-[var(--foreground)]">
                              {row.totalScore}
                            </strong>
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                              /{row.maxScore}
                            </span>
                          </td>

                          {/* Percentage */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-black text-xs ${
                                row.passed ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {row.percentage}%
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                            {Math.floor(row.durationSeconds / 60)}m {row.durationSeconds % 60}s
                          </td>

                          {/* Integrity */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.proctoringIntegrity >= 80
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-rose-500/15 text-rose-400"
                              }`}
                            >
                              {row.proctoringIntegrity}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {row.isBlocked || row.status === "disqualified" ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Blocked
                              </span>
                            ) : (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  row.passed
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {row.passed ? "Passed" : "Failed"}
                              </span>
                            )}
                          </td>

                          {/* Inspect & Unblock Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {(row.isBlocked || row.status === "disqualified") && (
                                <button
                                  onClick={() => handleUnblockStudent(row.studentId, row.studentName)}
                                  disabled={unblockMutation.isPending}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 hover:text-white transition flex items-center gap-1 cursor-pointer"
                                  title="Unblock candidate to allow them to continue the exam"
                                >
                                  <Unlock className="h-3 w-3" />
                                  <span>Unblock</span>
                                </button>
                              )}
                              <button
                                onClick={() => setInspectSubmission(row)}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[var(--glass-input-bg)] border border-[var(--border)] hover:text-[var(--primary)] hover:border-[rgb(var(--primary-rgb)/40%)] transition cursor-pointer"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── INSPECT SUBMISSION DETAILS MODAL ──────────────────────────────── */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Submission Audit • Rank #{inspectSubmission.rank}
                </span>
                <h3 className="text-base font-bold text-white">
                  {inspectSubmission.studentName} ({inspectSubmission.registerNumber})
                </h3>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Blocked Alert Banner in Modal */}
            {(inspectSubmission.isBlocked || inspectSubmission.status === "disqualified") && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-rose-300">
                  <Lock className="w-5 h-5 shrink-0 text-rose-400" />
                  <div>
                    <strong className="block text-white">Exam Access Blocked by Proctoring System</strong>
                    <span className="text-[11px] text-slate-300">
                      {inspectSubmission.blockedReason || "Candidate exceeded anti-cheat violation limit."}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblockStudent(inspectSubmission.studentId, inspectSubmission.studentName)}
                  disabled={unblockMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unblock Candidate</span>
                </button>
              </div>
            )}

            {/* Score Overview */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Score</span>
                <strong className="text-lg font-black text-white">
                  {inspectSubmission.totalScore} / {inspectSubmission.maxScore}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Percentage</span>
                <strong
                  className={`text-lg font-black ${
                    inspectSubmission.passed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {inspectSubmission.percentage}%
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Integrity Score</span>
                <strong className="text-lg font-black text-emerald-400">
                  {inspectSubmission.proctoringIntegrity}%
                </strong>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Question-by-Question Evaluation</h4>

              {inspectSubmission.questionScores.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        Q{idx + 1} ({q.type.toUpperCase()})
                      </span>
                      <span className="font-semibold text-white">{q.questionTitle}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.isCorrect
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {q.score} / {q.maxMarks} Marks
                    </span>
                  </div>

                  {q.type === "mcq" ? (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                      <span>Selected Answer: </span>
                      <strong className="text-white">{q.userAnswer || "Not Answered"}</strong>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Test Cases Passed: {q.testCasesPassed || 0} / {q.totalTestCases || 0}</span>
                        <span>Exec Time: {q.executionTimeMs || 0}ms</span>
                      </div>
                      {q.userAnswer && (
                        <pre className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-blue-300 font-mono text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {q.userAnswer}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
