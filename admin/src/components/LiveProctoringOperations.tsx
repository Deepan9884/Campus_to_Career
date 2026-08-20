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
} from "lucide-react";
import { toast } from "sonner";
import {
  getLiveProctoringFeed,
  batchUnblockStudents,
  unblockStudentProctoring,
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminLiveProctoringFeed"],
    queryFn: getLiveProctoringFeed,
    refetchInterval: open ? 5000 : false,
    enabled: open,
  });

  const blockedUsers = data?.blockedUsers || [];
  const recentViolations = data?.recentViolations || [];

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-900 text-slate-100 border border-rose-500/40 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.2)] overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
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
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live Stream</span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional telemetry monitor, real-time violation logs, and batch exam unblocking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Active Blocked Students Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Blocked Examination Access ({blockedUsers.length})
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
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow transition"
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
                        className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shrink-0"
                      >
                        <ShieldCheck className="h-4 w-4" /> Batch Restore Access ({selectedIds.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>All candidate assessment access is currently clear. Zero active proctoring locks.</span>
              </div>
            )}
          </div>

          {/* Real-time Violation Incident Feed */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider">
              Recent Institutional Telemetry Incidents ({recentViolations.length})
            </p>

            {recentViolations.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentViolations.map((v) => (
                  <div
                    key={v._id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          v.isBlocked ? "bg-rose-500 animate-ping" : v.violationCount > 1 ? "bg-amber-400" : "bg-blue-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">
                          {v.userId?.name || "Student"}{" "}
                          <span className="text-[10px] text-slate-500 font-normal">({v.moduleType} assessment)</span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {(v.events || []).slice(-3).map((e, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                            >
                              {e.violationType === "mobile_phone_detected" ? (
                                <Smartphone className="h-2.5 w-2.5 text-rose-400" />
                              ) : e.violationType === "multiple_faces_detected" ? (
                                <Users className="h-2.5 w-2.5 text-orange-400" />
                              ) : (
                                <Maximize className="h-2.5 w-2.5 text-amber-400" />
                              )}
                              {e.violationType.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          v.isBlocked
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {v.violationCount}/3 Strikes
                      </span>
                      {v.userId?._id && (
                        <Link
                          to={`/students/${v.userId._id}`}
                          onClick={onClose}
                          className="p-1 rounded text-indigo-400 hover:text-white"
                          title="Inspect 360"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                No recent proctoring violation incidents recorded.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Live updates poll automatically every 5 seconds.
          </span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition">
            Close Operations Hub
          </button>
        </div>
      </div>
    </div>
  );
}
