import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "../components/GlassCard";
import { ScoreRing } from "../components/Score";
import { CodingPlatformAnalyticsCharts } from "../components/CodingPlatformAnalyticsCharts";
import {
  User as UserIcon,
  ArrowLeft,
  FileText,
  Mic,
  Code2,
  Github,
  Award,
  BookOpen,
  Send,
  Loader2,
  Sparkles,
  Clock,
  Printer,
  Star,
  UserPlus,
  UserMinus,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ExternalLink,
  Calendar,
  Zap,
  ShieldCheck,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStudent360Detail,
  sendStudentFeedback,
  addMentee,
  removeMentee,
} from "../lib/admin-api";

type Tab =
  | "overview"
  | "resumes"
  | "interviews"
  | "coding"
  | "proofs"
  | "roadmap"
  | "activity"
  | "mentor-action";

function formatExtractedText(text: string): string {
  if (!text) return "";
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([&,;:])([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function StudentDetailPage() {
  const { studentId = "" } = useParams<{ studentId: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedResumeModal, setSelectedResumeModal] = useState<any | null>(null);

  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackActionType, setFeedbackActionType] = useState("general");

  const { data, isLoading } = useQuery({
    queryKey: ["adminStudent360", studentId],
    queryFn: () => getStudent360Detail(studentId),
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload: { title?: string; note: string; actionType?: string }) =>
      sendStudentFeedback(studentId, payload),
    onSuccess: () => {
      toast.success("Mentor guidance note sent to student!");
      setFeedbackTitle("");
      setFeedbackNote("");
      queryClient.invalidateQueries({ queryKey: ["adminStudent360", studentId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send feedback");
    },
  });

  const addMenteeMutation = useMutation({
    mutationFn: (emailOrId: string) => addMentee(emailOrId),
    onSuccess: (res) => {
      toast.success(res.message || "Assigned as your mentee!");
      queryClient.invalidateQueries({ queryKey: ["adminStudent360", studentId] });
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to assign mentee");
    },
  });

  const removeMenteeMutation = useMutation({
    mutationFn: (id: string) => removeMentee(id),
    onSuccess: (res) => {
      toast.success(res.message || "Removed from your mentees");
      queryClient.invalidateQueries({ queryKey: ["adminStudent360", studentId] });
      queryClient.invalidateQueries({ queryKey: ["adminStudentsList"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove mentee");
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const {
    student,
    metrics,
    resumes = [],
    interviews = [],
    codingProfiles = [],
    repoAnalyses = [],
    events = [],
    gapAnalyses = [],
    userSkills = [],
    activityLogs = [],
    quizAttempts = [],
  } = data;

  // Event telemetry statistics
  const verifiedEvents = events.filter(
    (e: any) => e.verificationResult?.isVerified || e.status === "verified"
  );
  const podiumEvents = events.filter((e: any) => {
    const res = (e.result || "").toLowerCase();
    return res === "winner" || res === "runner-up" || res === "finalist" || res === "podium";
  });
  const verificationPassRate =
    events.length > 0 ? Math.round((verifiedEvents.length / events.length) * 100) : 0;

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "overview", label: "Readiness Overview", icon: Sparkles },
    { key: "resumes", label: `Resumes (${resumes.length})`, icon: FileText },
    { key: "interviews", label: `Interviews (${interviews.length})`, icon: Mic },
    { key: "coding", label: `Coding & GitHub (${codingProfiles.length})`, icon: Code2 },
    { key: "proofs", label: `Event Proofs (${events.length})`, icon: Award },
    { key: "roadmap", label: `Roadmap & Gaps (${userSkills.length})`, icon: BookOpen },
    { key: "activity", label: `Activity Stream (${activityLogs.length})`, icon: Clock },
    { key: "mentor-action", label: "Mentor Actions ✨", icon: Send },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Top Toolbar */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Student Roster
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-400" /> Print / Export 360° Report
          </button>
          <span className="text-xs text-slate-400">Student ID: {student._id}</span>
        </div>
      </div>

      {/* Hero Student Banner */}
      <GlassCard className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-xl shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                {student.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <h2 className="text-2xl font-extrabold text-white">{student.name}</h2>
                {student.isMyMentee ? (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-extrabold text-amber-300 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Your Assigned Mentee
                  </span>
                ) : (
                  <button
                    onClick={() => addMenteeMutation.mutate(student.email)}
                    disabled={addMenteeMutation.isPending}
                    className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition flex items-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Assign as My Mentee
                  </button>
                )}
                {student.isMyMentee && (
                  <button
                    onClick={() => removeMenteeMutation.mutate(student._id)}
                    disabled={removeMenteeMutation.isPending}
                    className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-400 transition flex items-center gap-1"
                  >
                    <UserMinus className="h-3 w-3" /> Unassign
                  </button>
                )}
              </div>

              <p className="text-xs text-indigo-300 mt-1 font-medium">{student.targetRole}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400 mt-2">
                <span>{student.email}</span>
                {student.githubUsername && (
                  <a
                    href={`https://github.com/${student.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <Github className="h-3.5 w-3.5" /> @{student.githubUsername}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
            <ScoreRing score={student.isMyMentee ? metrics.overallReadinessPct : 0} size={70} stroke={6} label="Readiness" />
            <div>
              <p className="text-xs font-semibold text-slate-300">Composite Readiness</p>
              <p className="text-lg font-bold text-emerald-400">
                {student.isMyMentee ? `${metrics.overallReadinessPct}% Index` : "🔒 Restricted"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {student.isMyMentee ? "Calculated across 5 telemetry streams" : "Assign mentee to unlock"}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Privacy Notice Banner for Unassigned Students */}
      {!student.isMyMentee && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Unassigned Student Account — Restricted Privacy Access</p>
              <p className="text-[11px] text-amber-300/80">Detailed diagnostic metrics, interview scores, and guidance notes are restricted to assigned mentors.</p>
            </div>
          </div>
          <button
            onClick={() => addMenteeMutation.mutate(student.email)}
            disabled={addMenteeMutation.isPending}
            className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shrink-0"
          >
            <UserPlus className="h-4 w-4" /> Assign as My Mentee
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                isActive
                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <GlassCard className="p-4 text-center">
              <FileText className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">ATS Resume</p>
              <p className="text-xl font-bold text-white mt-1">{metrics.resumeScore}%</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Mic className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Mock Interview Avg</p>
              <p className="text-xl font-bold text-white mt-1">{metrics.avgInterviewScore}%</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Code2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Coding Solved</p>
              <p className="text-xl font-bold text-white mt-1">{metrics.totalProblemsSolved}</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Verified Proofs</p>
              <p className="text-xl font-bold text-white mt-1">{metrics.verifiedEventsCount}</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Trophy className="h-5 w-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Event Index</p>
              <p className="text-xl font-bold text-white mt-1">{metrics.eventScore}%</p>
            </GlassCard>
          </div>

          <CodingPlatformAnalyticsCharts
            platforms={codingProfiles}
            totalProblemsSolved={metrics.totalProblemsSolved}
          />
        </div>
      )}

      {/* Tab Content 2: Resumes */}
      {activeTab === "resumes" && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" /> Uploaded Resumes ({resumes.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI ATS resume scoring, keyword matching, and bullet point diagnostics.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              {resumes.length} {resumes.length === 1 ? "File" : "Files"} Analyzed
            </span>
          </div>

          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((r: any, i: number) => {
                const matched = r.keywordBreakdown?.matched || [];
                const missing = r.keywordBreakdown?.missing || [];
                const score = r.atsScore || 0;
                const scoreColor =
                  score >= 80
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : score >= 60
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30";

                return (
                  <div
                    key={r._id || i}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-4 shadow-lg"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white">
                              {r.filename || `Resume #${resumes.length - i}`}
                            </span>
                            {(r.targetRole || r.inferredTargetRole) && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {r.targetRole || r.inferredTargetRole}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            Uploaded {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${scoreColor}`}>
                          <span className="text-xs font-semibold">ATS Score</span>
                          <span className="text-base font-extrabold">{score}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    {r.summary ? (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="font-semibold text-indigo-400 block mb-1">Executive Summary</span>
                        {r.summary}
                      </p>
                    ) : r.extractedText ? (
                      <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                        {formatExtractedText(r.extractedText)}
                      </p>
                    ) : null}

                    {/* Keyword Breakdown Tags */}
                    {(matched.length > 0 || missing.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {matched.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills ({matched.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {matched.slice(0, 6).map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {matched.length > 6 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{matched.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {missing.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" /> Missing Keywords ({missing.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {missing.slice(0, 6).map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {missing.length > 6 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{missing.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {r.strengths?.length > 0 && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-indigo-400" /> {r.strengths.length} Strengths identified
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedResumeModal(r)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Inspect Full ATS Report
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              No resumes uploaded yet by student.
            </p>
          )}
        </GlassCard>
      )}

      {/* Tab Content 3: Interviews */}
      {activeTab === "interviews" && (
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mic className="h-4 w-4 text-purple-400" /> Completed AI Mock Interviews ({interviews.length})
          </h3>
          {interviews.length > 0 ? (
            <div className="space-y-3">
              {interviews.map((session: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl glass border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Target Role: {session.targetRole}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Rounds: {session.rounds?.length || 0} • Status: {session.status}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-purple-400">
                    {session.overallScore || 0}% Score
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No completed mock interview sessions yet.
            </p>
          )}
        </GlassCard>
      )}

      {/* Tab Content 4: Coding & Repos */}
      {activeTab === "coding" && (
        <div className="space-y-6">
          <CodingPlatformAnalyticsCharts
            platforms={codingProfiles}
            totalProblemsSolved={metrics.totalProblemsSolved}
          />

          <GlassCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Github className="h-4 w-4 text-indigo-400" /> GitHub Repo Analyses ({repoAnalyses.length})
            </h3>
            {repoAnalyses.length > 0 ? (
              <div className="space-y-3">
                {repoAnalyses.map((repo: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl glass border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{repo.repoName}</p>
                      <p className="text-[10px] text-muted-foreground">{repo.repoUrl}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      {repo.overallScore || 0}% Score
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No GitHub repository analyses performed yet.
              </p>
            )}
          </GlassCard>
        </div>
      )}

      {/* Tab Content 5: Event Proofs & Hackathons Matrix */}
      {activeTab === "proofs" && (
        <div className="space-y-6">
          {/* Summary KPI Matrix for Events */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-black text-white mt-1">{events.length}</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Verified Proofs</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{verifiedEvents.length}</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Podiums & Winners</p>
              <p className="text-2xl font-black text-yellow-400 mt-1">{podiumEvents.length}</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <Zap className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Pass Rate</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">{verificationPassRate}%</p>
            </GlassCard>
          </div>

          {/* Detailed Events & Proofs List */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" /> Hackathon & Event Verification Telemetry ({events.length})
              </h3>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Automated Verification Engine Active
              </span>
            </div>

            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((ev: any, i: number) => {
                  const isVerified = ev.verificationResult?.isVerified || ev.status === "verified";
                  const resultStr = (ev.result || "Participant").toLowerCase();
                  const isPodium = resultStr === "winner" || resultStr === "runner-up" || resultStr === "finalist";

                  return (
                    <div
                      key={i}
                      className="p-4 rounded-xl glass border border-white/10 space-y-3 transition hover:bg-white/5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-white/10 text-[10px] font-semibold text-indigo-300">
                              {ev.eventCategory || "Hackathon"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>Organized by: <strong className="text-slate-200">{ev.organizer || "Community"}</strong></span>
                            {ev.eventDate && (
                              <span className="flex items-center gap-1">
                                • <Calendar className="h-3 w-3 text-slate-400" /> {new Date(ev.eventDate).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Result & Verification Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Result Badge */}
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              resultStr === "winner"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : resultStr === "runner-up"
                                ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                                : resultStr === "finalist"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {isPodium ? <Trophy className="h-3.5 w-3.5 text-amber-400" /> : <Award className="h-3.5 w-3.5" />}
                            {ev.result || "Participant"}
                          </span>

                          {/* Verification Badge */}
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              isVerified
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Verified Proof
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 text-yellow-400" /> Under Review
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Verification Feedback / Reason */}
                      {(ev.verificationResult?.reason || ev.description) && (
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-xs text-slate-300">
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">
                            Verification Audit Note
                          </p>
                          <p className="leading-relaxed">
                            {ev.verificationResult?.reason || ev.description}
                          </p>
                        </div>
                      )}

                      {/* Skills / Proof URLs */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(ev.skills || ev.tags || []).map((sk: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
                              #{sk}
                            </span>
                          ))}
                        </div>

                        {(ev.proofUrl || ev.certificateUrl) && (
                          <a
                            href={ev.proofUrl || ev.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                          >
                            View Submitted Proof <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Award className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No Event Proof Submissions Recorded</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Student has not submitted any hackathons, open source, or competition proof credentials yet.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Tab Content 6: Roadmap & Gaps */}
      {activeTab === "roadmap" && (
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" /> User Skills & Level Index (
            {userSkills.length})
          </h3>
          {userSkills.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userSkills.map((sk: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl glass border border-white/10 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-white">{sk.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                    {sk.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No verified skills recorded yet.
            </p>
          )}
        </GlassCard>
      )}

      {/* Tab Content 7: Activity Stream */}
      {activeTab === "activity" && (
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" /> Real-Time Student Activity Stream ({activityLogs.length})
          </h3>
          {activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl glass border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{log.summary}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Module: <span className="text-indigo-300 font-semibold">{log.module}</span> • Action: {log.action}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No activity logs recorded yet for this student.
            </p>
          )}
        </GlassCard>
      )}

      {/* Tab Content 8: Mentor Actions & Guidance Form */}
      {activeTab === "mentor-action" && (
        <GlassCard className="p-6 space-y-5 border-indigo-500/30">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send Direct Guidance Note to Student</h3>
              <p className="text-xs text-muted-foreground">Delivers an instant high-priority notification to student's dashboard</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!feedbackNote.trim()) {
                toast.error("Please enter a guidance note");
                return;
              }
              feedbackMutation.mutate({
                title: feedbackTitle.trim() || undefined,
                note: feedbackNote.trim(),
                actionType: feedbackActionType,
              });
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Note Header / Title</label>
                <input
                  type="text"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="e.g. Focus on System Design before Tuesday interview..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Category / Priority</label>
                <select
                  value={feedbackActionType}
                  onChange={(e) => setFeedbackActionType(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-900 text-white"
                >
                  <option value="general">General Mentorship Advice</option>
                  <option value="resume_fix">Resume / ATS Fix Required</option>
                  <option value="coding_practice">Coding Platform Intervention</option>
                  <option value="interview_prep">Mock Interview Prep</option>
                  <option value="high_priority">🔥 High Priority Intervention</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Detailed Guidance Message</label>
              <textarea
                rows={4}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Write specific recommendations, resource links, or actionable next steps..."
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={feedbackMutation.isPending}
                className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {feedbackMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Guidance Note
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Resume Inspection Detail Modal */}
      {selectedResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedResumeModal.filename || "Resume ATS Report"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Uploaded on {new Date(selectedResumeModal.createdAt).toLocaleDateString()} • Target: {selectedResumeModal.targetRole || selectedResumeModal.inferredTargetRole || "General"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResumeModal(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
              {/* Score & Key Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ATS Score</span>
                  <span className="text-2xl font-black text-indigo-400 mt-1 block">{selectedResumeModal.atsScore || 0}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Matched Keywords</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    {selectedResumeModal.keywordBreakdown?.matched?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Missing Keywords</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    {selectedResumeModal.keywordBreakdown?.missing?.length || 0}
                  </span>
                </div>
              </div>

              {/* Summary */}
              {selectedResumeModal.summary && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Executive Summary</h4>
                  <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 leading-relaxed">
                    {selectedResumeModal.summary}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {selectedResumeModal.strengths?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Strengths Identified
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedResumeModal.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-slate-200 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {selectedResumeModal.improvements?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Actionable Improvements
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedResumeModal.improvements.map((imp: string, idx: number) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-slate-200 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Raw Text Formatted Preview */}
              {selectedResumeModal.extractedText && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Parsed Document Text</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {formatExtractedText(selectedResumeModal.extractedText)}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
              <button
                onClick={() => setSelectedResumeModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
