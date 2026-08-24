import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  X,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Users,
  Maximize,
  Layers,
  CheckCircle2,
  Lock,
  Eye,
  FileCode,
  Search,
  Filter,
  Flame,
  Radio,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  getLiveProctoringFeed,
  batchUnblockStudents,
  unblockStudentExam,
  type LiveProctoringFeedResponse,
  type LiveExamGroup,
  type LiveExamCandidate,
} from "../lib/admin-api";

interface LiveProctoringOperationsProps {
  open: boolean;
  onClose: () => void;
}

export function LiveProctoringOperations({
  open,
  onClose,
}: LiveProctoringOperationsProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [unblockReason, setUnblockReason] = useState("");
  const [activeExamFilter, setActiveExamFilter] = useState<string>("all");
  const [candidateSearch, setCandidateSearch] = useState("");

  const { data, isLoading, refetch } = useQuery<LiveProctoringFeedResponse>({
    queryKey: ["adminLiveProctoringFeed"],
    queryFn: getLiveProctoringFeed as any,
    refetchInterval: open ? 4000 : false,
    enabled: open,
  });

  const blockedUsers = data?.blockedUsers || [];
  const recentViolations = data?.recentViolations || [];
  const examsWithTakers: LiveExamGroup[] = data?.examsWithTakers || [];
  const totalActiveCandidates = data?.totalActiveCandidates || 0;

  const batchUnblockMutation = useMutation({
    mutationFn: (ids: string[]) => batchUnblockStudents(ids, unblockReason || "Mentor proctoring audit reset"),
    onSuccess: (res) => {
      toast.success(res.message || "Exam access restored!");
      setSelectedIds([]);
      setUnblockReason("");
      queryClient.invalidateQueries({ queryKey: ["adminLiveProctoringFeed"] });
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to batch unblock");
    },
  });

  const unblockExamCandidateMutation = useMutation({
    mutationFn: ({ examId, studentId }: { examId: string; studentId: string }) =>
      unblockStudentExam(examId, studentId),
    onSuccess: (res) => {
      toast.success(res.message || "Candidate unblocked and exam access restored!");
      queryClient.invalidateQueries({ queryKey: ["adminLiveProctoringFeed"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to unblock candidate for this exam");
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === blockedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blockedUsers.map((u) => u._id));
    }
  };

  if (!open) return null;

  const filteredExams =
    activeExamFilter === "all"
      ? examsWithTakers
      : examsWithTakers.filter((e) => e.examId === activeExamFilter);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(244,63,94,0.15)] overflow-hidden flex flex-col max-h-[92vh] my-auto backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Live Proctoring Operations Center</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Multi-Exam Stream</span>
              </div>
              <p className="text-xs text-slate-400">
                Track active test-takers categorized by Exam Name, live telemetry, and unlock blocked examinees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Multi-Exam Group Filter Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveExamFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                activeExamFilter === "all"
                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>All Active Exams ({examsWithTakers.length})</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                {totalActiveCandidates} Takers
              </span>
            </button>

            {examsWithTakers.map((ex) => (
              <button
                key={ex.examId}
                onClick={() => setActiveExamFilter(ex.examId)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeExamFilter === ex.examId
                    ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span className="truncate max-w-[140px]">{ex.examTitle}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-indigo-300 font-mono text-[10px]">
                  {ex.activeCount}
                </span>
                {ex.blockedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 font-mono text-[10px]">
                    {ex.blockedCount} blocked
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Filter candidates..."
              className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs select-text">
          {/* ── ACTIVE EXAMS & CANDIDATES GROUPED BY EXAM NAME ──────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <span>Live Examinees Grouped by Exam ({filteredExams.reduce((acc, e) => acc + e.activeCount, 0)} Active)</span>
              </h3>
            </div>

            {filteredExams.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 text-slate-400 space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <p className="font-bold text-slate-300">No active test takers currently online.</p>
                <p className="text-[11px] text-slate-500">Live candidate sessions will appear here as soon as students start their assessments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExams.map((examGroup) => {
                  const filteredCandidates = examGroup.candidates.filter(
                    (c) =>
                      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                      c.registerNumber.toLowerCase().includes(candidateSearch.toLowerCase())
                  );

                  return (
                    <div
                      key={examGroup.examId}
                      className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-md space-y-3 p-4"
                    >
                      {/* Exam Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl btn-gradient text-white">
                            <FileCode className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">{examGroup.examTitle}</h4>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {examGroup.examType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Duration: {examGroup.durationMinutes} mins • Difficulty: {examGroup.difficulty} • Category: {examGroup.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                            {examGroup.activeCount} Candidates Online
                          </span>
                          {examGroup.blockedCount > 0 && (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold">
                              {examGroup.blockedCount} Blocked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Candidates Table */}
                      {filteredCandidates.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No candidates match the filter for this exam.
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900/80">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                              <tr>
                                <th className="py-2.5 px-3">Student</th>
                                <th className="py-2.5 px-3">Reg No / Role</th>
                                <th className="py-2.5 px-3">Integrity</th>
                                <th className="py-2.5 px-3">Strikes</th>
                                <th className="py-2.5 px-3">Session Status</th>
                                <th className="py-2.5 px-3 text-right">Quick Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {filteredCandidates.map((cand) => (
                                <tr key={cand.submissionId} className="hover:bg-slate-800/40 transition">
                                  <td className="py-2.5 px-3">
                                    <p className="font-bold text-white text-xs">{cand.name}</p>
                                    <p className="text-[10px] text-slate-400">{cand.email}</p>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-mono text-slate-300 block">{cand.registerNumber}</span>
                                    <span className="text-[10px] text-slate-400">{cand.targetRole}</span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`font-bold font-mono ${
                                        cand.proctoringIntegrity < 60
                                          ? "text-rose-400"
                                          : cand.proctoringIntegrity < 85
                                          ? "text-amber-400"
                                          : "text-emerald-400"
                                      }`}
                                    >
                                      {cand.proctoringIntegrity}%
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        cand.violationsCount >= 3
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                          : cand.violationsCount > 0
                                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                          : "bg-slate-800 text-slate-400"
                                      }`}
                                    >
                                      {cand.violationsCount}/3 Strikes
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {cand.status === "blocked" ? (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 w-max">
                                        <Lock className="h-3 w-3" /> Blocked
                                      </span>
                                    ) : cand.status === "warning" ? (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-max">
                                        <AlertTriangle className="h-3 w-3" /> Warning
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-max">
                                        <CheckCircle2 className="h-3 w-3" /> Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {cand.status === "blocked" ? (
                                      <button
                                        onClick={() =>
                                          unblockExamCandidateMutation.mutate({
                                            examId: examGroup.examId,
                                            studentId: cand.studentId,
                                          })
                                        }
                                        disabled={unblockExamCandidateMutation.isPending}
                                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow transition cursor-pointer"
                                      >
                                        <ShieldCheck className="h-3 w-3" /> Unlock Session
                                      </button>
                                    ) : (
                                      <Link
                                        to={`/results?examId=${examGroup.examId}`}
                                        onClick={onClose}
                                        className="text-xs text-indigo-400 hover:underline font-bold"
                                      >
                                        Live Log
                                      </Link>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Blocked Students Across All Modules Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Master Blocked Examination Access ({blockedUsers.length})
                </span>
                {blockedUsers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    Action Required
                  </span>
                )}
              </div>

              {blockedUsers.length > 0 && (
                <button
                  onClick={selectAll}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  {selectedIds.length === blockedUsers.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {blockedUsers.length > 0 ? (
              <div className="space-y-2">
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === blockedUsers.length}
                            onChange={selectAll}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Candidate</th>
                        <th className="py-2.5 px-3">Target Role</th>
                        <th className="py-2.5 px-3">Blocked At</th>
                        <th className="py-2.5 px-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {blockedUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(u._id)}
                              onChange={() => toggleSelect(u._id)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-white text-xs">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{u.targetRole || "Software Engineer"}</td>
                          <td className="py-2.5 px-3 text-rose-400 font-medium">
                            {u.proctoringBlockedAt ? new Date(u.proctoringBlockedAt).toLocaleTimeString() : "Recent"}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => batchUnblockMutation.mutate([u._id])}
                              disabled={batchUnblockMutation.isPending}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow transition cursor-pointer"
                            >
                              <ShieldCheck className="h-3 w-3" /> Unblock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Batch Unblock Action Bar */}
                {selectedIds.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-slate-300 text-xs">
                      Selected: <strong className="text-white font-bold">{selectedIds.length} candidates</strong>
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={unblockReason}
                        onChange={(e) => setUnblockReason(e.target.value)}
                        placeholder="Optional audit reason..."
                        className="flex-1 sm:w-64 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-xs outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => batchUnblockMutation.mutate(selectedIds)}
                        disabled={batchUnblockMutation.isPending}
                        className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4" /> Batch Restore Access ({selectedIds.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Zero system-wide candidate proctoring blocks.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Live telemetry stream updates automatically every 4 seconds.
          </span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer">
            Close Operations Hub
          </button>
        </div>
      </div>
    </div>
  );
}
