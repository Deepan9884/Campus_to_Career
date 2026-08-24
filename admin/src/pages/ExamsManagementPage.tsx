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
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "../components/GlassCard";
import {
  getAdminExams,
  deleteAdminExam,
  toggleAdminExamDisclosure,
  toggleAdminExamRetakes,
  type ExamItem,
} from "../lib/admin-api";
import { CreateExamModal } from "../components/exam/CreateExamModal";

export function ExamsManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all exams
  const { data: exams = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-exams", activeTypeFilter, searchQuery],
    queryFn: () => getAdminExams(activeTypeFilter, searchQuery),
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
  const disclosedCount = exams.filter((e) => e.isResultDisclosed).length;

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
                Admin & Mentor Assessment Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
              <span className="gradient-text-warm">Assessments</span>{" "}
              <span className="text-[var(--foreground)]">Console</span>
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Create and manage cohort examinations.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gradient px-5 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:scale-105 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      </div>

      {/* ── METRIC STATS CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="kpi-card kpi-card-violet space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            Total Exams
          </span>
          <p className="text-2xl font-black text-violet-300">{totalExams}</p>
          <span className="text-[10px] text-violet-400/80 font-semibold">Active Cohort</span>
        </div>

        <div className="kpi-card kpi-card-blue space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            MCQ Assessments
          </span>
          <p className="text-2xl font-black text-blue-300">{mcqCount}</p>
          <span className="text-[10px] text-blue-400/80 font-semibold">Diagnostic</span>
        </div>

        <div className="kpi-card kpi-card-purple space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            Coding Arenas
          </span>
          <p className="text-2xl font-black text-purple-300">{codingCount}</p>
          <span className="text-[10px] text-purple-400/80 font-semibold">Algorithmic</span>
        </div>

        <div className="kpi-card kpi-card-pink space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            Mixed Exams
          </span>
          <p className="text-2xl font-black text-pink-300">{mixedCount}</p>
          <span className="text-[10px] text-pink-400/80 font-semibold">Multi-Round</span>
        </div>

        <div className="kpi-card kpi-card-emerald space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            Total Submissions
          </span>
          <p className="text-2xl font-black text-emerald-300">{totalSubmissions}</p>
          <span className="text-[10px] text-emerald-400/80 font-semibold">Evaluated</span>
        </div>

        <div className="kpi-card kpi-card-amber space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">
            Disclosed Results
          </span>
          <p className="text-2xl font-black text-amber-300">
            {disclosedCount} <span className="text-xs text-[var(--muted-foreground)]">/ {totalExams}</span>
          </p>
          <span className="text-[10px] text-amber-400/80 font-semibold">Published to Students</span>
        </div>
      </div>

      {/* ── CONTROLS: SEARCH & FILTER TABS ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs">
          {[
            { id: "all", label: "All Formats" },
            { id: "mcq", label: "MCQs Only" },
            { id: "coding", label: "Coding Only" },
            { id: "mixed", label: "Mixed Format" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTypeFilter === tab.id
                  ? "bg-white dark:bg-[var(--glass-input-bg)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exams by title..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* ── EXAMS GRID ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-foreground)]">Loading assessments...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-[var(--border)] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--primary-rgb)/10%)] text-[var(--primary)] flex items-center justify-center mx-auto">
            <FileCode className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">No Assessments Found</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1">
              Create your first examination by clicking the "Create New Exam" button above.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => {
            const isDisclosed = exam.isResultDisclosed;
            return (
              <GlassCard
                key={exam._id}
                className="p-5 flex flex-col justify-between gap-5 group hover:border-[rgb(var(--primary-rgb)/40%)] transition-all relative overflow-hidden"
              >
                {/* Accent Top Border */}
                <div
                  className={`absolute top-0 inset-x-0 h-[2px] ${
                    exam.examType === "mcq"
                      ? "bg-indigo-500"
                      : exam.examType === "coding"
                      ? "bg-cyan-500"
                      : "bg-purple-500"
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Category & Format Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        exam.examType === "mcq"
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                          : exam.examType === "coding"
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                          : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {exam.examType} Exam
                    </span>

                    <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                      {exam.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition line-clamp-1">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
                      {exam.description || "Official proctored examination for campus students."}
                    </p>
                  </div>

                  {/* Meta Tiles */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Duration</span>
                      <strong className="text-[var(--foreground)]">{exam.durationMinutes}m</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Audience</span>
                      <strong className="text-[var(--foreground)] uppercase text-[11px]">
                        {exam.targetAudience}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--muted-foreground)] block">Attempts</span>
                      <strong className="text-emerald-400 font-black">
                        {exam.stats?.totalSubmissions || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Result Disclosure Toggle Row */}
                  <div className="p-3 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDisclosed ? (
                        <Unlock className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-amber-400" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold block text-[var(--foreground)]">
                          {isDisclosed ? "Results Disclosed" : "Results Hidden"}
                        </span>
                        <span className="text-[9px] text-[var(--muted-foreground)]">
                          {isDisclosed
                            ? "Students can view marks"
                            : "Marks concealed from students"}
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
                  <div className="p-3 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${exam.allowRetakes ? "text-cyan-400" : "text-slate-400"}`} />
                      <div>
                        <span className="text-[11px] font-bold block text-[var(--foreground)]">
                          {exam.allowRetakes ? "Retakes Allowed" : "Retakes Blocked"}
                        </span>
                        <span className="text-[9px] text-[var(--muted-foreground)]">
                          {exam.allowRetakes
                            ? "Students can retake exam"
                            : "Single attempt only"}
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
                      {exam.allowRetakes ? "Disable Retakes" : "Allow Retakes"}
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/results?examId=${exam._id}`)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold btn-gradient text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 hover:scale-102 transition"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>View Results Panel</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete exam "${exam.title}"? All submissions will also be deleted.`)) {
                        deleteMutation.mutate(exam._id);
                      }
                    }}
                    className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
    </div>
  );
}
