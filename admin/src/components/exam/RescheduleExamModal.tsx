import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Timer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Bell,
  Users,
  FileText,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { rescheduleAdminExam, type ExamItem } from "../../lib/admin-api";

interface RescheduleExamModalProps {
  open: boolean;
  onClose: () => void;
  exam: ExamItem | null;
  onSuccess: (updatedExam: ExamItem) => void;
}

export function RescheduleExamModal({
  open,
  onClose,
  exam,
  onSuccess,
}: RescheduleExamModalProps) {
  if (!open || !exam) return null;

  // Format a Date object to "YYYY-MM-DDTHH:mm" for datetime-local input
  const toDateTimeLocalString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Initial states derived from current exam
  const [scheduleMode, setScheduleMode] = useState<"scheduled" | "immediate">(() =>
    exam.isScheduled ? "scheduled" : "scheduled"
  );

  const [startTime, setStartTime] = useState<string>(() => {
    if (exam.scheduledStartTime) {
      const d = new Date(exam.scheduledStartTime);
      if (d > new Date()) {
        return toDateTimeLocalString(d);
      }
    }
    // Default to +1 hour from now rounded to next 15 mins
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    return toDateTimeLocalString(d);
  });

  const [durationMinutes, setDurationMinutes] = useState<number>(() => exam.durationMinutes || 60);
  const [resetSubmissions, setResetSubmissions] = useState<boolean>(true);
  const [notifyStudents, setNotifyStudents] = useState<boolean>(true);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Derive calculated end time
  const computedEndTime = React.useMemo(() => {
    if (scheduleMode === "immediate" || !startTime) return null;
    try {
      const s = new Date(startTime);
      if (isNaN(s.getTime())) return null;
      return new Date(s.getTime() + (Number(durationMinutes) || 60) * 60 * 1000);
    } catch {
      return null;
    }
  }, [startTime, durationMinutes, scheduleMode]);

  // Helper presets for quick start time selection
  const applyPreset = (type: "plus1h" | "plus3h" | "tomorrowMorning" | "tomorrowAfternoon" | "plus2d") => {
    const now = new Date();
    let target = new Date();

    if (type === "plus1h") {
      target = new Date(now.getTime() + 60 * 60 * 1000);
      target.setMinutes(Math.ceil(target.getMinutes() / 15) * 15, 0, 0);
    } else if (type === "plus3h") {
      target = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      target.setMinutes(Math.ceil(target.getMinutes() / 15) * 15, 0, 0);
    } else if (type === "tomorrowMorning") {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (type === "tomorrowAfternoon") {
      target.setDate(target.getDate() + 1);
      target.setHours(14, 0, 0, 0);
    } else if (type === "plus2d") {
      target.setDate(target.getDate() + 2);
      target.setHours(10, 0, 0, 0);
    }

    setStartTime(toDateTimeLocalString(target));
    setScheduleMode("scheduled");
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (scheduleMode === "scheduled" && !startTime) {
      toast.error("Please select a scheduled start date and time.");
      return;
    }

    const payload = {
      isScheduled: scheduleMode === "scheduled",
      scheduledStartTime: scheduleMode === "scheduled" ? new Date(startTime).toISOString() : null,
      scheduledEndTime:
        scheduleMode === "scheduled" && computedEndTime
          ? computedEndTime.toISOString()
          : null,
      durationMinutes: Number(durationMinutes) || 60,
      resetSubmissions,
      notifyStudents,
      reason: reason.trim(),
    };

    setIsSubmitting(true);
    try {
      const res = await rescheduleAdminExam(exam._id, payload);
      toast.success(
        res.message || `Exam '${exam.title}' rescheduled successfully!`
      );
      if (res.resetSubmissionsCount && res.resetSubmissionsCount > 0) {
        toast.info(
          `Reset ${res.resetSubmissionsCount} prior candidate submission(s) for a clean attempt.`
        );
      }
      onSuccess(res.exam);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 p-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Reschedule Examination
                </span>
                <span className="text-[10px] text-slate-400">
                  Format: <strong className="text-slate-200 uppercase">{exam.examType}</strong>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {exam.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleRescheduleSubmit} className="space-y-5">
          {/* Current Status Info Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="text-slate-300">
                Current Status:{" "}
                <span className="font-bold text-white capitalize">{exam.status || "Active"}</span>
                {exam.scheduledStartTime && (
                  <span className="text-slate-400 ml-1">
                    (Originally scheduled: {new Date(exam.scheduledStartTime).toLocaleString()})
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Rescheduling will unblock this exam, restore published visibility, set the new access window, and optionally notify candidates.
              </p>
            </div>
          </div>

          {/* Schedule Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Assessment Window Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScheduleMode("scheduled")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  scheduleMode === "scheduled"
                    ? "bg-indigo-500/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  {scheduleMode === "scheduled" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                </div>
                <strong className="text-xs font-bold block text-white">
                  Schedule Specific Window
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Test unlocks at specified date & time
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode("immediate")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  scheduleMode === "immediate"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  {scheduleMode === "immediate" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <strong className="text-xs font-bold block text-white">
                  Make Live Immediately
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Assessment unlocks right now for candidates
                </span>
              </button>
            </div>
          </div>

          {/* Scheduled Date/Time Picker & Presets */}
          {scheduleMode === "scheduled" && (
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Scheduled Start Date & Time</span>
                </label>
                <span className="text-[10px] text-indigo-300 font-mono">
                  (Candidate Local Time)
                </span>
              </div>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs text-white focus:border-indigo-400 focus:outline-none [color-scheme:dark]"
                required
              />

              {/* Quick presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Time Presets:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "plus1h", label: "+1 Hour" },
                    { id: "plus3h", label: "+3 Hours" },
                    { id: "tomorrowMorning", label: "Tomorrow 9:00 AM" },
                    { id: "tomorrowAfternoon", label: "Tomorrow 2:00 PM" },
                    { id: "plus2d", label: "+2 Days" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id as any)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/40 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-computed End Window Preview */}
              {computedEndTime && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>Auto-conclusion Window:</span>
                  </div>
                  <strong className="text-white font-mono text-xs">
                    {computedEndTime.toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                    at {computedEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Duration Adjustment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-slate-400" />
              <span>Assessment Duration (Minutes)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(5, Number(e.target.value)))}
                className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">minutes allowed per candidate</span>
            </div>
          </div>

          {/* Option: Reset Submissions */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={resetSubmissions}
                onChange={(e) => setResetSubmissions(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Reset Prior Candidate Submissions & Violations
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Recommended for fresh reschedules. Clears existing test submissions and unblocks candidate proctoring states so all assigned students can take this test cleanly in the new window.
                </p>
              </div>
            </label>
          </div>

          {/* Option: Notify Students */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyStudents}
                onChange={(e) => setNotifyStudents(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Broadcast Real-time Notification Alert</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Sends an immediate in-app push notification to all assigned candidates/mentees with the new examination date & time.
                </p>
              </div>
            </label>
          </div>

          {/* Reason / Note to Students */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Reschedule Note / Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rescheduled due to network maintenance. Please be prepared 5 minutes prior to start time."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-102 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
