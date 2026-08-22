import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  Users,
  ShieldCheck,
  Building2,
  Download,
  Sun,
  Moon,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Command,
} from "lucide-react";
import { toast } from "sonner";
import {
  searchRegisteredStudents,
  exportCohortCsvData,
  batchUnblockStudents,
  getLiveProctoringFeed,
} from "../lib/admin-api";
import { useTheme } from "../lib/theme-context";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenCompanyMatcher?: () => void;
  onOpenLiveProctoring?: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onOpenCompanyMatcher,
  onOpenLiveProctoring,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Search registered students
  const { data: searchData, isLoading: searching } = useQuery({
    queryKey: ["adminCommandPaletteSearch", query],
    queryFn: () => (query.trim() ? searchRegisteredStudents(query) : Promise.resolve({ students: [] })),
    enabled: query.trim().length > 0,
  });

  const { data: proctorFeed } = useQuery({
    queryKey: ["adminLiveProctoringFeed"],
    queryFn: getLiveProctoringFeed,
    enabled: open,
  });

  const students = searchData?.students || [];
  const blockedUsers = proctorFeed?.blockedUsers || [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Batch unblock mutation
  const batchUnblockMutation = useMutation({
    mutationFn: (ids: string[]) => batchUnblockStudents(ids, "Restored via Global Command Palette"),
    onSuccess: (res) => {
      toast.success(res.message || "Students unblocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminLiveProctoringFeed"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to batch unblock");
    },
  });

  // Export CSV
  const handleExportCsv = async () => {
    toast.loading("Compiling institutional cohort readiness dataset...", { id: "csv-export" });
    try {
      const res = await exportCohortCsvData();
      const rows = res.students || [];
      if (rows.length === 0) {
        toast.error("No student data available to export.", { id: "csv-export" });
        return;
      }

      const headers = [
        "Name",
        "Email",
        "Target Role",
        "Overall Readiness (%)",
        "ATS Resume Score (%)",
        "Mock Interview Score (%)",
        "Coding Solved Count",
        "Verified Hackathon Proofs",
        "Mentee Status",
        "Proctoring Status",
        "Last Active",
      ];

      const csvContent = [
        headers.join(","),
        ...rows.map((s) =>
          [
            `"${s.name.replace(/"/g, '""')}"`,
            `"${s.email}"`,
            `"${s.targetRole}"`,
            s.overallReadiness,
            s.resumeScore,
            s.avgInterviewScore,
            s.totalProblemsSolved,
            s.verifiedEventsCount,
            s.isMyMentee ? "Assigned Mentee" : "Directory",
            s.isProctoringBlocked ? "BLOCKED" : "Active",
            `"${s.lastActive || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `CampusToCareer_Cohort_Readiness_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${rows.length} student records to CSV!`, { id: "csv-export" });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate CSV export", { id: "csv-export" });
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-start justify-center p-4 pt-12 sm:pt-20 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl lg:max-w-4xl bg-[var(--glass-strong-bg)] text-[var(--foreground)] border border-[var(--glass-strong-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-[40px] saturate-[180%]"
      >
        {/* Search Header */}
        <div className="flex items-center px-6 py-4.5 border-b border-[var(--border)] gap-3.5 bg-[var(--glass-input-bg)]">
          <Search className="h-6 w-6 text-[var(--primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a student name, email, or command (e.g. 'export', 'matcher', 'proctor')..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none font-medium"
          />
          <div className="flex items-center gap-1 text-xs bg-[var(--glass-input-bg)] px-2.5 py-1 rounded-lg text-[var(--muted-foreground)] font-mono border border-[var(--border)] shadow-sm">
            <span>ESC</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-input-bg)] rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Command Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Quick Actions Group */}
          <div>
            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Quick Operations & Tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCompanyMatcher?.();
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-input-bg)] hover:bg-[var(--primary)]/20 text-[var(--foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition text-left group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] group-hover:scale-105 transition-transform">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--foreground)]">Company Placement Matcher</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Filter students by hiring partner criteria</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenLiveProctoring?.();
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-input-bg)] hover:bg-[var(--destructive)]/20 text-[var(--foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--destructive)]/30 transition text-left group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[var(--destructive)]/15 text-[var(--destructive)] group-hover:scale-105 transition-transform">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--foreground)]">Live Proctoring Operations</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {blockedUsers.length > 0 ? `${blockedUsers.length} blocked candidate(s)` : "Real-time violation stream"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--destructive)] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-input-bg)] hover:bg-[var(--success)]/20 text-[var(--foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--success)]/30 transition text-left group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[var(--success)]/15 text-[var(--success)] group-hover:scale-105 transition-transform">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--foreground)]">Export Cohort Master CSV</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Download placement readiness sheet</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--success)] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                  toast.success(`Switched to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`);
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--glass-input-bg)] hover:bg-[var(--warning)]/20 text-[var(--foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--warning)]/30 transition text-left group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[var(--warning)]/15 text-[var(--warning)] group-hover:scale-105 transition-transform">
                    {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--foreground)]">Toggle Theme</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Current: {resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--warning)] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Blocked Candidates Quick Unblock Action */}
          {blockedUsers.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--destructive)]/15 border border-[var(--destructive)]/30 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--destructive)] flex items-center gap-2 text-sm">
                  <ShieldAlert className="h-5 w-5 text-[var(--destructive)]" />
                  {blockedUsers.length} Exam Block(s) Active
                </span>
                <button
                  onClick={() => batchUnblockMutation.mutate(blockedUsers.map((u) => u._id))}
                  disabled={batchUnblockMutation.isPending}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--destructive)] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                >
                  <ShieldCheck className="h-4 w-4" /> Restore All Access
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {blockedUsers.slice(0, 8).map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      onClose();
                      navigate(`/students/${u._id}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--destructive)]/15 text-[var(--destructive)] hover:bg-[var(--destructive)]/25 text-xs font-medium border border-[var(--destructive)]/30 transition"
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Search Results */}
          {query.trim() && (
            <div>
              <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Matching Student Records ({students.length})
              </p>
              {searching ? (
                <div className="py-10 text-center text-[var(--muted-foreground)] text-sm">Searching students...</div>
              ) : students.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  {students.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => {
                        onClose();
                        navigate(`/students/${s._id}`);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--glass-input-bg)] hover:bg-[var(--glass-input-bg)] hover:brightness-110 text-left transition border border-[var(--border)] hover:border-[var(--primary)]/30 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] font-bold flex items-center justify-center text-sm shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--foreground)] text-sm truncate">{s.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{s.email} • {s.targetRole}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--primary)] font-bold px-3 py-1.5 bg-[var(--primary)]/15 rounded-lg shrink-0 border border-[var(--primary)]/30">
                        Inspect 360° →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[var(--muted-foreground)] text-sm">
                  No matching student records found for "{query}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[var(--glass-input-bg)] border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Press <kbd className="px-2 py-0.5 bg-[var(--glass-input-bg)] rounded-md text-[var(--muted-foreground)] font-mono text-[11px] border border-[var(--border)]">ESC</kbd> to exit</span>
            <span>Use <kbd className="px-2 py-0.5 bg-[var(--glass-input-bg)] rounded-md text-[var(--muted-foreground)] font-mono text-[11px] border border-[var(--border)]">↑</kbd> <kbd className="px-2 py-0.5 bg-[var(--glass-input-bg)] rounded-md text-[var(--muted-foreground)] font-mono text-[11px] border border-[var(--border)]">↓</kbd> to navigate</span>
          </div>
          <span className="text-[var(--primary)] font-bold flex items-center gap-1.5">
            <Command className="h-3.5 w-3.5" /> Career Intelligence Command Hub
          </span>
        </div>
      </div>
    </div>
  );
}
