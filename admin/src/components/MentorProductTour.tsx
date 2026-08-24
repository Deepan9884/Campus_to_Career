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
  FileText,
  Mic,
  Code2,
  Award,
  ShieldAlert,
  Building2,
  Download,
  Palette,
  Command,
  Bot,
} from "lucide-react";

interface MentorProductTourProps {
  open: boolean;
  onClose: () => void;
}

const MENTOR_TOUR_STEPS = [
  {
    step: 1,
    title: "Welcome to Mentor Command Center",
    subtitle: "Your dedicated portal for monitoring mentee readiness and placement progress",
    icon: GraduationCap,
    iconColor: "text-[var(--chart-1)]",
    badge: "PLACEMENT COMMAND CENTER",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <p>
          The Mentor Portal provides real-time visibility into your students' technical skills, ATS resume scores, mock interview recordings, and competitive coding telemetry across platforms.
        </p>
        <div className="p-3 rounded-xl bg-[rgb(var(--primary-rgb)/15%)] border border-[rgb(var(--primary-rgb)/30%)] text-[var(--primary)] font-medium">
          <strong className="text-[var(--foreground)]">Readiness Index:</strong> Monitor composite career readiness metrics to identify top performers and mentees needing help.
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: "Hiring Readiness Funnel & Heatmap",
    subtitle: "Identify cohort-wide skill deficiencies before placement season",
    icon: Trophy,
    iconColor: "text-[var(--chart-3)]",
    badge: "HIRING FUNNEL & HEATMAP",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Placement Readiness Funnel:</strong> Classify mentees into{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> Placement Ready (&ge; 75%)
              </span>
              ,{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--warning)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" /> Developing (45%–74%)
              </span>
              , and{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--destructive)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--destructive)]" /> Priority Intervention (&lt; 45%)
              </span>
              .
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
            <span><strong className="text-[var(--foreground)]">Skill Deficiency Heatmap:</strong> See top missing skills (e.g. <em>System Design</em>, <em>SQL</em>) across your entire student body.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 3,
    title: "Student Roster & 360° Inspection",
    subtitle: "Deep inspection into individual student telemetry & transcripts",
    icon: Users,
    iconColor: "text-[var(--chart-5)]",
    badge: "360° STUDENT INSPECTOR",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <p>
          Search the student directory, filter by readiness tier, and click <strong className="text-[var(--foreground)]">Inspect 360°</strong> to view:
        </p>
        <div className="grid grid-cols-2 gap-2 font-semibold text-[var(--foreground)]">
          <span className="p-2 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-[var(--primary)]" /> ATS Resume Scores
          </span>
          <span className="p-2 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center gap-2">
            <Mic className="h-3.5 w-3.5 text-[var(--chart-5)]" /> Mock Interview Audits
          </span>
          <span className="p-2 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center gap-2">
            <Code2 className="h-3.5 w-3.5 text-[var(--success)]" /> Solved Problems
          </span>
          <span className="p-2 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-[var(--warning)]" /> Verified Proofs
          </span>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: "AI Co-Pilot & Prescriptive Goal Assignment",
    subtitle: "Deliver custom goals and AI guidance directly to student dashboards",
    icon: Send,
    iconColor: "text-[var(--chart-2)]",
    badge: "MENTOR ACTION SUITE",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Bot className="h-4 w-4 text-[var(--chart-2)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">AI Mentor Co-Pilot:</strong> 1-click diagnostic analysis of student bottlenecks with instant generated guidance notes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Prescriptive Goal Milestones:</strong> Assign targeted tasks (e.g. <em>Solve 10 Medium DP problems</em>, <em>Rewrite Resume Summary</em>) with urgent due dates and live student dashboard synchronization.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 5,
    title: "Live Proctoring Operations & Batch Unblock",
    subtitle: "Monitor real-time exam integrity and restore candidate access",
    icon: ShieldAlert,
    iconColor: "text-[var(--destructive)]",
    badge: "PROCTORING COMMAND",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--destructive)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Live Violation Monitor:</strong> View real-time logs of student tab switches, multiple faces, and mobile device detections.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Floating Batch Unblock Dock:</strong> Select multiple blocked students from the roster or command hub to restore exam access in 1 click.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 6,
    title: "Company Placement Matcher & Master CSV Export",
    subtitle: "Filter candidates by partner hiring criteria & export cohort matrices",
    icon: Building2,
    iconColor: "text-[var(--chart-5)]",
    badge: "INSTITUTIONAL PLACEMENT",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-[var(--chart-5)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Company Matcher:</strong> Set minimum readiness thresholds, target roles, and skill filters to instantly generate hiring shortlist pools.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Download className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">1-Click Master CSV Export:</strong> Download comprehensive cohort readiness matrices for placement drives and accreditation reporting.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 7,
    title: "Institutional Command Hub (⌘K) & Accent Themes",
    subtitle: "Lightning-fast spotlight navigation & dynamic UI customizations",
    icon: Palette,
    iconColor: "text-[var(--warning)]",
    badge: "COMMAND HUB & CUSTOMIZATION",
    content: (
      <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Command className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Global Command Palette (<kbd className="px-1 py-0.5 rounded bg-[var(--glass-input-bg)] text-[11px] font-mono border border-[var(--border)]">⌘K</kbd>):</strong> Press <strong className="text-[var(--foreground)] font-mono">⌘K</strong> anytime to search candidates, trigger tools, or toggle themes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Palette className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--foreground)]">Dynamic Accent Themes:</strong> Choose between Indigo Electric, Royal Purple, Emerald Growth, Amber Glow, and Ocean Cyan with reactive aurora backgrounds.
            </span>
          </li>
        </ul>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgb(var(--background-rgb)/85%)] backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard variant="strong" className="w-full max-w-lg p-6 space-y-6 border-[rgb(var(--primary-rgb)/30%)] shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            localStorage.setItem("cf-mentor-tour-done", "true");
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-input-bg)] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shrink-0">
            <div className="w-full h-full bg-[var(--popover)] rounded-[14px] grid place-items-center">
              <Icon className={`h-6 w-6 ${current.iconColor}`} />
            </div>
          </div>

          <div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[rgb(var(--primary-rgb)/15%)] text-[var(--primary)] border border-[rgb(var(--primary-rgb)/30%)] uppercase tracking-wider">
              {current.badge} • Step {currentStep + 1} of {MENTOR_TOUR_STEPS.length}
            </span>
            <h3 className="text-lg font-extrabold text-[var(--foreground)] mt-1">{current.title}</h3>
            <p className="text-xs text-muted-foreground">{current.subtitle}</p>
          </div>
        </div>

        {/* Step Body */}
        <div className="py-2">{current.content}</div>

        {/* Footer Controls */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {MENTOR_TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-[var(--primary)]" : "w-1.5 bg-[rgb(var(--foreground-rgb)/20%)]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl glass hover:bg-[var(--glass-input-bg)] text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-gradient px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-[rgb(var(--primary-rgb)/20%)]"
            >
              {isLast ? (
                <>Enter Portal</>
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
