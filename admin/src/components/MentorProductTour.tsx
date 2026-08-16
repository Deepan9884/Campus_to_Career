import React, { useState, useEffect } from "react";
import { GlassCard } from "./GlassCard";
import {
  Users,
  Trophy,
  Target,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Zap,
  GraduationCap,
  Send,
  BarChart3,
} from "lucide-react";

interface MentorProductTourProps {
  open: boolean;
  onClose: () => void;
}

const MENTOR_TOUR_STEPS = [
  {
    step: 1,
    title: "Welcome to Mentor Command Center 🎓",
    subtitle: "Your dedicated portal for monitoring mentee readiness and placement progress",
    icon: GraduationCap,
    iconColor: "text-indigo-400",
    badge: "PLACEMENT COMMAND CENTER",
    content: (
      <div className="space-y-3 text-xs text-slate-300">
        <p>
          The Mentor Portal provides real-time visibility into your students' technical skills, ATS resume scores, mock interview recordings, and competitive coding telemetry across platforms.
        </p>
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
          🏆 <strong className="text-white">Readiness Index:</strong> Monitor composite career readiness metrics to identify top performers and mentees needing help.
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: "Hiring Readiness Funnel & Heatmap 📊",
    subtitle: "Identify cohort-wide skill deficiencies before placement season",
    icon: Trophy,
    iconColor: "text-emerald-400",
    badge: "HIRING FUNNEL & HEATMAP",
    content: (
      <div className="space-y-3 text-xs text-slate-300">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Placement Readiness Funnel:</strong> Classify mentees into 🟢 Placement Ready (&ge; 75%), 🟡 Developing (45%–74%), and 🔴 Priority Intervention (&lt; 45%).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Skill Deficiency Heatmap:</strong> See top missing skills (e.g. <em>System Design</em>, <em>SQL</em>) across your entire student body.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 3,
    title: "Student Roster & 360° Inspection 🔍",
    subtitle: "Deep inspection into individual student telemetry & transcripts",
    icon: Users,
    iconColor: "text-blue-400",
    badge: "360° STUDENT INSPECTOR",
    content: (
      <div className="space-y-3 text-xs text-slate-300">
        <p>
          Search the student directory, filter by readiness tier, and click <strong className="text-white">Inspect 360°</strong> to view:
        </p>
        <div className="grid grid-cols-2 gap-2 font-semibold text-slate-200">
          <span className="p-2 rounded-lg bg-white/5 border border-white/10">📄 ATS Resume Scores</span>
          <span className="p-2 rounded-lg bg-white/5 border border-white/10">🎙️ Mock Interview Audits</span>
          <span className="p-2 rounded-lg bg-white/5 border border-white/10">💻 Solved Problems</span>
          <span className="p-2 rounded-lg bg-white/5 border border-white/10">🏆 Verified Proofs</span>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: "Direct Mentor Actions & Feedback ⚡",
    subtitle: "Deliver custom goals and guidance directly to student dashboards",
    icon: Send,
    iconColor: "text-purple-400",
    badge: "MENTOR ACTION SUITE",
    content: (
      <div className="space-y-3 text-xs text-slate-300">
        <p>
          Use the <strong className="text-white">Mentor Actions ✨</strong> tab on any student profile to assign custom problem goals, write targeted AI-enhanced advice, or flag priority follow-ups.
        </p>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
          🚀 <strong className="text-white">Real-Time Sync:</strong> Mentor notes deliver instant push notifications to your student's live readiness dashboard!
        </div>
      </div>
    ),
  },
];

export function MentorProductTour({ open, onClose }: MentorProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  if (!open) return null;

  const current = MENTOR_TOUR_STEPS[currentStep];
  const Icon = current.icon;
  const isLast = currentStep === MENTOR_TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("cf-mentor-tour-done", "true");
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard variant="strong" className="w-full max-w-lg p-6 space-y-6 border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            localStorage.setItem("cf-mentor-tour-done", "true");
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] grid place-items-center">
              <Icon className={`h-6 w-6 ${current.iconColor}`} />
            </div>
          </div>

          <div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {current.badge} • Step {currentStep + 1} of {MENTOR_TOUR_STEPS.length}
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">{current.title}</h3>
            <p className="text-xs text-muted-foreground">{current.subtitle}</p>
          </div>
        </div>

        {/* Step Body */}
        <div className="py-2">{current.content}</div>

        {/* Footer Controls */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {MENTOR_TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-gradient px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-indigo-500/20"
            >
              {isLast ? (
                <>Enter Portal 🎓</>
              ) : (
                <>Next <ChevronRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
