import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListTodo,
  X,
  Send,
  Calendar,
  AlertCircle,
  FileText,
  Mic,
  Code2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { createMentorTask } from "../lib/admin-api";

interface AssignTaskModalProps {
  open: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export function AssignTaskModal({
  open,
  studentId,
  studentName,
  onClose,
}: AssignTaskModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("interview");
  const [priority, setPriority] = useState("high");
  const [daysToComplete, setDaysToComplete] = useState(5);
  const [actionUrl, setActionUrl] = useState("/interview");

  const createTaskMutation = useMutation({
    mutationFn: (payload: any) => createMentorTask(studentId, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Goal assigned to student!");
      queryClient.invalidateQueries({ queryKey: ["adminStudentTasks", studentId] });
      queryClient.invalidateQueries({ queryKey: ["adminStudent360", studentId] });
      setTitle("");
      setDescription("");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to assign goal");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      daysToComplete: Number(daysToComplete),
      actionUrl,
    });
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === "interview") setActionUrl("/interview");
    else if (cat === "quiz") setActionUrl("/roadmap");
    else if (cat === "resume") setActionUrl("/resume");
    else if (cat === "coding") setActionUrl("/coding-platforms");
    else setActionUrl("/dashboard");
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Assign Goal Milestone</h2>
              <p className="text-xs text-slate-400">
                Prescribe a direct action task with deadline for <strong className="text-white">{studentName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Dynamic Programming Roadmap Assessment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Description & Guidance Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide concrete action steps or resources for the candidate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 text-xs"
              >
                <option value="interview">Mock Interview</option>
                <option value="quiz">Roadmap Assessment</option>
                <option value="resume">Resume Optimization</option>
                <option value="coding">Coding Platform Sync</option>
                <option value="general">General Career Task</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 text-xs"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Days to Complete
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={daysToComplete}
                onChange={(e) => setDaysToComplete(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Target Action Module
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Assign Goal Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
