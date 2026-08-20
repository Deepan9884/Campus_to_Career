import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  Target,
  FileText,
  Mic,
  Code2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateAIIntervention,
  createMentorTask,
  type AIInterventionPlan,
} from "../lib/admin-api";

interface AIInterventionModalProps {
  open: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export function AIInterventionModal({
  open,
  studentId,
  studentName,
  onClose,
}: AIInterventionModalProps) {
  const queryClient = useQueryClient();
  const [delivering, setDelivering] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminAIIntervention", studentId],
    queryFn: () => generateAIIntervention(studentId),
    enabled: open && !!studentId,
    staleTime: 5 * 60 * 1000,
  });

  const plan: AIInterventionPlan | undefined = data?.intervention;

  // Batch deliver prescribed tasks to student
  const handleDeliverToStudent = async () => {
    if (!plan || !plan.suggestedTasks) return;
    setDelivering(true);
    toast.loading("Delivering intervention roadmap & tasks to mentee...", { id: "deliver-plan" });

    try {
      await Promise.all(
        plan.suggestedTasks.map((t) =>
          createMentorTask(studentId, {
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            daysToComplete: t.daysToComplete,
            actionUrl: t.actionUrl,
          })
        )
      );

      toast.success(`2-Week Recovery Plan successfully delivered to ${studentName}!`, {
        id: "deliver-plan",
      });
      queryClient.invalidateQueries({ queryKey: ["adminStudentTasks", studentId] });
      queryClient.invalidateQueries({ queryKey: ["adminStudent360", studentId] });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to deliver plan to student", { id: "deliver-plan" });
    } finally {
      setDelivering(false);
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
        className="w-full max-w-3xl bg-slate-900 text-slate-100 border border-indigo-500/40 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">AI Mentor Co-Pilot Intervention Diagnosis</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tailored 2-week remedial roadmap and prescribed action goals for <strong className="text-white">{studentName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="h-6 w-6 text-indigo-400 absolute inset-0 m-auto" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-white">Synthesizing Diagnostic Performance Dossier...</p>
                <p className="text-slate-400 text-xs mt-0.5">Evaluating ATS resume metrics, mock interview transcripts, and skill gap telemetry.</p>
              </div>
            </div>
          ) : isError || !plan ? (
            <div className="py-16 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
              <p className="font-bold text-white text-sm">Failed to generate AI intervention plan</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Retry Diagnosis
              </button>
            </div>
          ) : (
            <>
              {/* Executive Diagnosis */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Target className="h-4 w-4 text-indigo-400" /> Executive Diagnosis
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">{plan.diagnosisSummary}</p>
              </div>

              {/* Key Deficits */}
              {plan.keyDeficits && plan.keyDeficits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Primary Performance Bottlenecks
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {plan.keyDeficits.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2-Week Structured Remediation Plan */}
              {plan.twoWeekPlan && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" /> 2-Week Structured Recovery Roadmap
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.twoWeekPlan.map((w) => (
                      <div
                        key={w.week}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-extrabold text-white text-xs">Week {w.week}</span>
                          <span className="text-[10px] text-indigo-400 font-semibold">{w.theme}</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300">
                          {w.actions.map((act, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Mentor Tasks */}
              {plan.suggestedTasks && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Prescribed Task Milestones (Will be assigned to mentee)
                  </p>
                  <div className="space-y-2">
                    {plan.suggestedTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                            {t.category === "interview" ? (
                              <Mic className="h-4 w-4" />
                            ) : t.category === "resume" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Code2 className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{t.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.priority === "urgent"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : t.priority === "high"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Due in {t.daysToComplete}d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Review the generated diagnosis and deliver the prescribed tasks to the mentee.
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs">
              Close
            </button>
            <button
              onClick={handleDeliverToStudent}
              disabled={delivering || isLoading || !plan}
              className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {delivering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Deliver 2-Week Plan & Assign Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
