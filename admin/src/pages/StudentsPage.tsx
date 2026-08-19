import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/Score";
import {
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Filter,
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserMinus,
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStudentsList,
  addMentee,
  removeMentee,
  searchRegisteredStudents,
} from "../lib/admin-api";

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("my-mentees");

  // Modal State for Adding Mentees
  const [showAddModal, setShowAddModal] = useState(false);
  const [menteeEmailInput, setMenteeEmailInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["adminStudentsList", page, search, filter, pageSize],
    queryFn: () => getStudentsList(page, search, filter, pageSize),
  });

  const students = data?.students || [];
  const pagination = data?.pagination || { page: 1, limit: pageSize, total: students.length, totalPages: 1 };

  // Add Mentee Mutation
  const addMenteeMutation = useMutation({
    mutationFn: (emailOrId: string) => addMentee(emailOrId),
    onSuccess: (res) => {
      toast.success(res.message || "Mentee added successfully!");
      setMenteeEmailInput("");
      setSearchResults([]);
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminCohortAnalytics"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || "No student account found with this email. Only registered students can be added as mentees."
      );
    },
  });

  // Remove Mentee Mutation
  const removeMenteeMutation = useMutation({
    mutationFn: (studentId: string) => removeMentee(studentId),
    onSuccess: (res) => {
      toast.success(res.message || "Mentee removed successfully");
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
      queryClient.invalidateQueries({ queryKey: ["adminCohortAnalytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove mentee");
    },
  });

  // Live search registered students in modal
  const handleLiveSearch = async (val: string) => {
    setMenteeEmailInput(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchRegisteredStudents(val);
      setSearchResults(res.students || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeEmailInput.trim()) {
      toast.error("Please enter a student email or name");
      return;
    }
    addMenteeMutation.mutate(menteeEmailInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500 shrink-0" /> Student Directory & Placement Roster
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, filter, and inspect career readiness indicators for your assigned mentees
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Add Mentee Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition hover:scale-105 shrink-0 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" /> Add Mentee
          </button>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search student by name, email, or role..."
              className="w-full pl-9 pr-8 py-2 rounded-xl glass-input text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 p-1 rounded-xl flex-wrap">
            {[
              { key: "my-mentees", label: "My Mentees" },
              { key: "all", label: "All Students Directory" },
              { key: "top-performer", label: "Ready (≥75%)" },
              { key: "at-risk", label: "Intervention (<40%)" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  filter === f.key
                    ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Search & Directory Mode Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {search ? (
            <span className="px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Showing results matching "{search}" ({pagination.total} total)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold">
              Total in view: <strong className="text-slate-900 dark:text-white">{pagination.total} students</strong>
            </span>
          )}
        </div>

        {filter === "all" && (
          <div className="p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-500 shrink-0" />
            <span><strong className="text-slate-900 dark:text-white">Directory Privacy Mode:</strong> Telemetry stats columns are hidden for unassigned students until added to your mentees.</span>
          </div>
        )}
      </div>

      {/* Roster Table Card */}
      <GlassCard className="p-0 overflow-hidden border-slate-200 dark:border-white/10">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                    <th className="py-4 px-5">Student Info</th>
                    <th className="py-4 px-5">Mentee Status</th>
                    <th className="py-4 px-5">Target Role</th>

                    {/* Telemetry Stats Columns — Hidden in "All Students Directory" View */}
                    {filter !== "all" && (
                      <>
                        <th className="py-4 px-5 text-center">Readiness Index</th>
                        <th className="py-4 px-5 text-center">ATS Resume</th>
                        <th className="py-4 px-5 text-center">Mock Interview</th>
                        <th className="py-4 px-5 text-center">Coding Solved</th>
                        <th className="py-4 px-5 text-center">Verified Proofs</th>
                      </>
                    )}

                    <th className="py-4 px-5 text-right">
                      {filter === "all" ? "Roster Action" : "360° Inspection"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                  {students.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition">
                      {/* Student Info */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-md shrink-0">
                            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[11px] flex items-center justify-center font-bold text-white text-xs">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap truncate max-w-[200px]" title={st.name}>
                              {st.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap truncate max-w-[200px]" title={st.email}>
                              {st.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Mentee Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {st.isMyMentee ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1 whitespace-nowrap">
                              <CheckCircle2 className="h-3 w-3 text-indigo-500" /> Assigned Mentee
                            </span>
                            <button
                              onClick={() => removeMenteeMutation.mutate(st._id)}
                              disabled={removeMenteeMutation.isPending}
                              title="Remove from My Mentees"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addMenteeMutation.mutate(st.email)}
                            disabled={addMenteeMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 transition flex items-center gap-1 whitespace-nowrap shadow-sm"
                          >
                            <UserPlus className="h-3 w-3" /> Assign Mentee
                          </button>
                        )}
                      </td>

                      {/* Target Role */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800/90 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-300 whitespace-nowrap inline-block max-w-[210px] truncate align-middle"
                          title={st.targetRole}
                        >
                          {st.targetRole}
                        </span>
                      </td>

                      {/* Telemetry Stats Columns (Only rendered when NOT in "All Students Directory" mode) */}
                      {filter !== "all" && (
                        <>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex justify-center">
                              <ScoreRing score={st.overallReadiness} size={40} stroke={4} />
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center font-extrabold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">{st.resumeScore}%</td>
                          <td className="py-4 px-5 text-center font-extrabold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">{st.avgInterviewScore}%</td>
                          <td className="py-4 px-5 text-center font-extrabold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">{st.totalProblemsSolved}</td>
                          <td className="py-4 px-5 text-center font-extrabold text-amber-600 dark:text-amber-400 text-sm whitespace-nowrap">{st.verifiedEventsCount}</td>
                        </>
                      )}

                      {/* Action Column */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {st.isMyMentee ? (
                          <Link
                            to={`/students/${st._id}`}
                            className="btn-gradient px-3.5 py-1.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1 shadow-md shadow-indigo-500/20 whitespace-nowrap"
                          >
                            Inspect 360° <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => addMenteeMutation.mutate(st.email)}
                            disabled={addMenteeMutation.isPending}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-bold text-indigo-600 dark:text-indigo-300 inline-flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Assign Mentee
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comprehensive Pagination Toolbar */}
            {pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                {/* Showing indicator & Page Size Selector */}
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>
                    Showing <strong className="text-slate-900 dark:text-white font-bold">{Math.min(pagination.total, (page - 1) * pageSize + 1)}</strong> to{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">{Math.min(page * pageSize, pagination.total)}</strong> of{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">{pagination.total}</strong> students
                  </span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-[11px]">Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 rounded-lg text-xs outline-none cursor-pointer text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 shadow-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl glass hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs font-semibold">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={p}>
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-slate-400">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                                page === p
                                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                                  : "glass hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl glass hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    title="Next Page"
                  >
                    <span className="hidden sm:inline text-xs font-semibold">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Users className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {filter === "my-mentees"
                ? "You Have No Assigned Mentees Yet"
                : filter === "all"
                ? "No Registered Students Found"
                : "No Students Match Selected Criteria"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {filter === "my-mentees"
                ? "Click 'Add Mentee' above or switch to 'All Students Directory' to assign students to your mentor dashboard."
                : search
                ? "Try clearing your search keywords."
                : "No student records match this filter."}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Add Mentee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard variant="strong" className="w-full max-w-md p-6 space-y-5 border-indigo-500/30 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Mentee to Roster</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Assign registered students to your mentor command center</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setMenteeEmailInput("");
                  setSearchResults([]);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Warning Note on Strict Account Logic */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">Account Validation Rule:</strong> You can only add students who have an existing registered account on the platform.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Account Email or Name
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={menteeEmailInput}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    placeholder="Enter registered student email (e.g. student@example.com)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {isSearching && (
                    <Loader2 className="h-4 w-4 absolute right-3 top-3 animate-spin text-indigo-500" />
                  )}
                </div>
              </div>

              {/* Live Search Suggestions */}
              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-2 py-1 uppercase">
                    Matching Student Accounts ({searchResults.length})
                  </p>
                  {searchResults.map((s) => (
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
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 grid place-items-center font-bold shrink-0">
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
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">Click to Add +</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setMenteeEmailInput("");
                    setSearchResults([]);
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
                  Add Mentee
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
