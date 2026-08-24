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
  assignExamStudents,
  getStudentsList,
  type ExamItem,
  type StudentSummary,
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
  const [selectedExamForBatch, setSelectedExamForBatch] = useState<ExamItem | null>(null);

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
                        Starts: {new Date(exam.scheduledStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        {" → "}
                        Auto-ends: {exam.scheduledEndTime
                          ? new Date(exam.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(new Date(exam.scheduledStartTime).getTime() + (exam.durationMinutes || 60) * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                  {/* Candidate Cohort Batch Row */}
                  <div className="p-2.5 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      <div>
                        <span className="text-[11px] font-bold block text-[var(--foreground)]">
                          {exam.targetAudience === "selected" || (exam.assignedStudents && exam.assignedStudents.length > 0)
                            ? `Selected Batch (${exam.assignedStudents?.length || 0} Students)`
                            : exam.targetAudience === "mentees"
                            ? "My Mentees Only"
                            : "All Registered Students"}
                        </span>
                        <span className="text-[9px] text-[var(--muted-foreground)]">
                          {exam.targetAudience === "selected" || (exam.assignedStudents && exam.assignedStudents.length > 0)
                            ? "Strictly restricted to selected batch"
                            : exam.targetAudience === "mentees"
                            ? "Only visible to your mentees"
                            : "Visible to all registered students"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedExamForBatch(exam)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      <span>Assign Batch</span>
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

      {/* ── ASSIGN BATCH MODAL ───────────────────────────────────────────── */}
      {selectedExamForBatch && (
        <AssignBatchModal
          exam={selectedExamForBatch}
          onClose={() => setSelectedExamForBatch(null)}
          onSuccess={() => {
            setSelectedExamForBatch(null);
            queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
          }}
        />
      )}
    </div>
  );
}

// ── ASSIGN BATCH MODAL COMPONENT ───────────────────────────────────────────
function AssignBatchModal({
  exam,
  onClose,
  onSuccess,
}: {
  exam: ExamItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [targetAudience, setTargetAudience] = useState<"all" | "mentees" | "selected">(
    exam.targetAudience || "all"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (Array.isArray(exam.assignedStudents)) {
      return exam.assignedStudents.map((s: any) => (typeof s === "string" ? s : s._id));
    }
    return [];
  });
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    getStudentsList()
      .then((res) => {
        setStudents(res.students || []);
      })
      .catch((err) => {
        console.error("Failed to load students roster", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      ((s as any).registerNumber && (s as any).registerNumber.toLowerCase().includes(q))
    );
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await assignExamStudents(
        exam._id,
        targetAudience,
        targetAudience === "selected" ? selectedIds : []
      );
      toast.success(
        targetAudience === "selected"
          ? `Successfully assigned test to ${selectedIds.length} candidate(s)`
          : targetAudience === "mentees"
          ? "Exam restricted to your assigned mentees"
          : "Exam opened to all registered students"
      );
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update batch assignment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Assign Test Batch & Target Candidates
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                Exam: <strong className="text-indigo-300">{exam.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Audience Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Target Audience Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: "all", label: "All Students", desc: "Open to whole directory" },
              { id: "mentees", label: "My Mentees Only", desc: "Assigned mentees only" },
              { id: "selected", label: "Selected Batch", desc: "Designated candidate list" },
            ].map((aud) => (
              <div
                key={aud.id}
                onClick={() => setTargetAudience(aud.id as any)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
                  targetAudience === aud.id
                    ? "bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500 text-white font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-bold block text-white">{aud.label}</span>
                <p className="text-[10px] text-slate-400 leading-tight">{aud.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Selector for Selected Batch */}
        {targetAudience === "selected" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-indigo-300 px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                {selectedIds.length} Candidate(s) Selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allIds = Array.from(new Set([...selectedIds, ...filteredStudents.map((s) => s._id)]));
                    setSelectedIds(allIds);
                    toast.success(`Selected ${filteredStudents.length} candidates`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Select All Filtered ({filteredStudents.length})
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 font-bold text-xs transition cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name, email, register number..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-800 rounded-2xl p-2.5 bg-slate-900/80">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading student directory...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No candidates match search query.</div>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = selectedIds.includes(st._id);
                  return (
                    <div
                      key={st._id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedIds(selectedIds.filter((id) => id !== st._id));
                        } else {
                          setSelectedIds([...selectedIds, st._id]);
                        }
                      }}
                      className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition border ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500/50 text-white font-bold"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{st.name}</span>
                            {(st as any).registerNumber && (
                              <span className="text-[10px] font-mono text-indigo-300 font-semibold">
                                ({(st as any).registerNumber})
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{st.email}</span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-slate-700 bg-slate-800/50 text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving || (targetAudience === "selected" && selectedIds.length === 0)}
            onClick={handleSave}
            className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving Batch..." : "Save Batch Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
