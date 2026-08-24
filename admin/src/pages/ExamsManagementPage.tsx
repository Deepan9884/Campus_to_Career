import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FileCode,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Award,
  Layers,
  Code2,
  HelpCircle,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Lock,
  Unlock,
  BookOpen,
  StopCircle,
  Calendar,
  Timer,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "../components/GlassCard";
import {
  getAdminExams,
  deleteAdminExam,
  stopAdminExam,
  toggleAdminExamDisclosure,
  toggleAdminExamRetakes,
  type ExamItem,
} from "../lib/admin-api";
import { CreateExamModal } from "../components/exam/CreateExamModal";
import { QuestionPaperPreviewModal } from "../components/exam/QuestionPaperPreviewModal";

export function ExamsManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<ExamItem | null>(null);

  // Fetch all exams
  const { data: exams = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-exams", activeTypeFilter, activeStatusFilter, searchQuery],
    queryFn: () => getAdminExams(activeTypeFilter, searchQuery, activeStatusFilter),
  });

  // Toggle disclosure mutation
  const toggleDisclosureMutation = useMutation({
    mutationFn: ({ examId, currentState }: { examId: string; currentState: boolean }) =>
      toggleAdminExamDisclosure(examId, !currentState),
    onSuccess: (res) => {
      toast.success(
        res.isResultDisclosed
          ? "Exam results DISCLOSED to students. Students can now view their scores."
          : "Exam results CONCEALED. Marks are now hidden from students."
      );
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update disclosure state");
    },
  });

  // Toggle retakes mutation
  const toggleRetakesMutation = useMutation({
    mutationFn: ({ examId, currentState }: { examId: string; currentState: boolean }) =>
      toggleAdminExamRetakes(examId, !currentState),
    onSuccess: (res) => {
      toast.success(
        res.allowRetakes
          ? "Retakes ENABLED. Students can now retake this examination."
          : "Retakes DISABLED. Students cannot retake this examination."
      );
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update retake settings");
    },
  });

  // Stop exam mutation
  const stopExamMutation = useMutation({
    mutationFn: (examId: string) => stopAdminExam(examId),
    onSuccess: (res) => {
      toast.success(res.message || "Exam ended. In-progress candidate responses finalized and calculated.");
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to stop exam");
    },
  });

  // Delete exam mutation
  const deleteMutation = useMutation({
    mutationFn: (examId: string) => deleteAdminExam(examId),
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete exam");
    },
  });

  // Summary Metrics
  const totalExams = exams.length;
  const mcqCount = exams.filter((e) => e.examType === "mcq").length;
  const codingCount = exams.filter((e) => e.examType === "coding").length;
  const mixedCount = exams.filter((e) => e.examType === "mixed").length;
  const totalSubmissions = exams.reduce((acc, e) => acc + (e.stats?.totalSubmissions || 0), 0);
  const activeExamsCount = exams.filter((e) => e.status === "active" || (!e.status && e.isPublished)).length;

  return (
    <div className="space-y-7">
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="elite-panel hero-card-shimmer relative rounded-3xl p-5 sm:p-6 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-72 h-32 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(167,139,250,0.7), transparent 70%)" }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[rgb(var(--primary-rgb)/15%)] text-[var(--primary)] border border-[rgb(var(--primary-rgb)/30%)]">
                Faculty & Mentor Examination Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
              <span className="gradient-text-warm">Assessments</span>{" "}
              <span className="text-[var(--foreground)]">& Test Control</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl">
              Strict section gating, scheduled examination windows, question paper previews, and proctoring locks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gradient px-5 py-2.5 rounded-2xl text-xs font-black text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-102 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <GlassCard className="p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Total Exams
            </span>
            <strong className="text-lg font-black text-[var(--foreground)]">
              {totalExams}
            </strong>
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Active / Live Exams
            </span>
            <strong className="text-lg font-black text-emerald-400">
              {activeExamsCount}
            </strong>
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Coding / Mixed
            </span>
            <strong className="text-lg font-black text-cyan-400">
              {codingCount + mixedCount}
            </strong>
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Total Submissions
            </span>
            <strong className="text-lg font-black text-purple-400">
              {totalSubmissions}
            </strong>
          </div>
        </GlassCard>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ──────────────────────────────────────── */}
      <GlassCard className="p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Formats" },
            { id: "mcq", label: "MCQ Only" },
            { id: "coding", label: "Coding Arena" },
            { id: "mixed", label: "Mixed Rounds" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTypeFilter === tab.id
                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--glass-input-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exams by title or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </GlassCard>

      {/* ── EXAMS GRID ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--muted-foreground)]">
          Loading assessments catalog...
        </div>
      ) : exams.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3 rounded-3xl">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <FileCode className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Assessments Found</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
            Get started by authoring a proctored assessment with MCQ sections and coding arenas.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/20"
          >
            Create First Exam
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {exams.map((exam) => {
            const isDisclosed = Boolean(exam.isResultDisclosed);
            const isStopped = exam.status === "stopped";
            const isScheduledFuture =
              exam.isScheduled &&
              exam.scheduledStartTime &&
              new Date(exam.scheduledStartTime) > new Date();

            return (
              <GlassCard
                key={exam._id}
                className="p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group relative"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        exam.examType === "mcq"
                          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                          : exam.examType === "coding"
                          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                          : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {exam.examType.toUpperCase()}
                    </span>

                    {/* Status Badge */}
                    {isStopped ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <StopCircle className="h-3 w-3" /> Stopped
                      </span>
                    ) : isScheduledFuture ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Scheduled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--foreground)] line-clamp-1 group-hover:text-indigo-400 transition">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1 leading-relaxed">
                      {exam.description || "Comprehensive proctored assessment"}
                    </p>
                  </div>

                  {/* Schedule Timestamps Banner */}
                  {exam.isScheduled && exam.scheduledStartTime && (
                    <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[10px] text-indigo-300 flex items-center gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">
                        Window: {new Date(exam.scheduledStartTime).toLocaleString()}
                        {exam.scheduledEndTime ? ` - ${new Date(exam.scheduledEndTime).toLocaleTimeString()}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Meta Tiles */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Duration</span>
                      <strong className="text-[var(--foreground)]">{exam.durationMinutes}m</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Max Marks</span>
                      <strong className="text-emerald-400">{exam.totalMarks}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Attempts</span>
                      <strong className="text-indigo-400 font-black">
                        {exam.stats?.totalSubmissions || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Result Disclosure Toggle Row */}
                  <div className="p-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDisclosed ? (
                        <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold block text-[var(--foreground)]">
                          {isDisclosed ? "Results Disclosed" : "Results Hidden"}
                        </span>
                        <span className="text-[9px] text-[var(--muted-foreground)]">
                          {isDisclosed ? "Students can see marks" : "Marks concealed from students"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleDisclosureMutation.mutate({
                          examId: exam._id,
                          currentState: isDisclosed,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        isDisclosed
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                      }`}
                    >
                      {isDisclosed ? "Hide Marks" : "Disclose Marks"}
                    </button>
                  </div>

                  {/* Retakes Permission Toggle Row */}
                  <div className="p-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-3.5 w-3.5 ${exam.allowRetakes ? "text-cyan-400" : "text-slate-400"}`} />
                      <div>
                        <span className="text-[11px] font-bold block text-[var(--foreground)]">
                          {exam.allowRetakes ? "Retakes Allowed" : "Retakes Blocked"}
                        </span>
                        <span className="text-[9px] text-[var(--muted-foreground)]">
                          {exam.allowRetakes ? "Multiple attempts allowed" : "Single attempt only"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleRetakesMutation.mutate({
                          examId: exam._id,
                          currentState: Boolean(exam.allowRetakes),
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        exam.allowRetakes
                          ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                          : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                      }`}
                    >
                      {exam.allowRetakes ? "Disable" : "Allow"}
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExamForPreview(exam)}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                      title="View Complete Question Paper"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      <span>View Paper</span>
                    </button>

                    <button
                      onClick={() => navigate(`/results?examId=${exam._id}`)}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold btn-gradient text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 hover:scale-102 transition cursor-pointer"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Results Panel</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Stop Exam Now Button */}
                    {!isStopped && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to stop the exam "${exam.title}" now? All active candidate submissions will be immediately finalized and auto-graded up to this exact moment.`
                            )
                          ) {
                            stopExamMutation.mutate(exam._id);
                          }
                        }}
                        className="px-3 py-1 rounded-xl text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition cursor-pointer"
                        title="End exam session and finalize in-progress submissions"
                      >
                        <StopCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span>Stop Exam Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Delete exam "${exam.title}"? All submissions will also be deleted.`)) {
                          deleteMutation.mutate(exam._id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-rose-400 hover:bg-rose-500/10 transition ml-auto cursor-pointer"
                      title="Delete Exam"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ── CREATE EXAM MODAL ────────────────────────────────────────────── */}
      <CreateExamModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* ── QUESTION PAPER PREVIEW MODAL ─────────────────────────────────── */}
      <QuestionPaperPreviewModal
        open={Boolean(selectedExamForPreview)}
        onClose={() => setSelectedExamForPreview(null)}
        exam={selectedExamForPreview}
      />
    </div>
  );
}
