import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";
import {
  Trophy,
  BarChart3,
  Target,
  Users,
  Send,
  FileText,
  GraduationCap,
  ShieldAlert,
  Palette,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Loader2,
  Lightbulb,
  Building2,
  Command,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface MentorProductTourProps {
  open: boolean;
  onClose: () => void;
}

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge: string;
  routeName: string;
  route: string;
  targetSelector: string;
  preferredPlacement?: "bottom" | "top" | "left" | "right";
  content: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: "Placement Readiness Funnel & Benchmark",
    subtitle: "Real-time cohort distribution across Placement Ready, Developing, and Intervention tiers",
    icon: Trophy,
    iconColor: "text-indigo-500",
    badge: "Readiness Funnel",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="readiness-funnel"]',
    preferredPlacement: "bottom",
    content: (
      <div className="space-y-3">
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong className="text-slate-900 dark:text-white font-semibold">Mentorship Placement Funnel</strong> dynamically categorizes your assigned cohort against the institutional benchmark (<strong className="text-emerald-600 dark:text-emerald-400">≥75%</strong> readiness).
        </p>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5 shadow-xs">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">Pro Tip:</span> The progress visualizer immediately recalculates as mentees solve problems, complete AI mock interviews, and submit resumes.
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: "6-Stream Cohort Telemetry Matrix",
    subtitle: "ATS resume scoring, AI mock audits, coding platform solutions & verified credentials",
    icon: BarChart3,
    iconColor: "text-blue-500",
    badge: "Cohort KPIs",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="kpi-grid"]',
    preferredPlacement: "top",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">
          Aggregated telemetry streams directly from live student platforms:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-blue-500" /> ATS Resume Scoring
          </span>
          <span className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-purple-500" /> AI Voice Audits
          </span>
          <span className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> LeetCode & CodeChef
          </span>
          <span className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-500" /> Verified Hackathon Proofs
          </span>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: "Cohort-Wide Skill Deficiency Heatmap",
    subtitle: "Identify critical gaps like System Design, SQL, and OOPs before placement drives",
    icon: Target,
    iconColor: "text-amber-500",
    badge: "Skill Gaps",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="skill-heatmap"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          AI automatically evaluates all student code submissions and mock interview transcripts to surface the most common missing concepts across the cohort.
        </p>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          Use these insights to schedule targeted remedial sessions or assign specialized coding tracks.
        </p>
      </div>
    ),
  },
  {
    step: 4,
    title: "Searchable Mentee Directory & 360° Deep Inspection",
    subtitle: "Filter candidates, inspect interview audio, view ATS resumes & coding progress",
    icon: Users,
    iconColor: "text-indigo-500",
    badge: "Mentee Directory",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="mentee-directory"]',
    preferredPlacement: "left",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Inspect 360°:</strong> Click into any student to review full telemetry transcripts, speech clarity metrics, and ATS breakdown.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Instant Filtering:</strong> Quick-filter between Ready, Developing, and Intervention tiers with live search.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 5,
    title: "1-Click AI Diagnosis & Prescriptive Goal Assignment",
    subtitle: "Deliver instant diagnostic guidance notes and milestone tasks directly to students",
    icon: Send,
    iconColor: "text-emerald-500",
    badge: "AI Action Suite",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="mentee-directory"]',
    preferredPlacement: "top",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">
          Provide proactive mentorship with automated AI interventions:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">AI Diagnostic Co-Pilot:</strong> Generate instant diagnostic analysis identifying student roadblocks in 1 click.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Prescriptive Goals:</strong> Assign milestone tasks with urgent due dates that sync directly to the student dashboard header!
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 6,
    title: "Proctored Exams & Coding Challenge Hub",
    subtitle: "Schedule assessments, configure testcases, and set AI cheating detection thresholds",
    icon: FileText,
    iconColor: "text-blue-500",
    badge: "Exams Management",
    routeName: "Exams & Assessments",
    route: "/exams",
    targetSelector: '[data-tour="nav-exams"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          Configure and dispatch enterprise-grade assessments with custom MCQ and multi-language live coding sandboxes.
        </p>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5 shadow-xs">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">Proctoring Controls:</span> Enforce webcam monitoring, multi-face detection, tab switch lockouts, and live code replay.
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 7,
    title: "Super Dream Track & Company Matcher",
    subtitle: "Target Tier-1 marquee companies and match candidates against live hiring cutoffs",
    icon: GraduationCap,
    iconColor: "text-purple-500",
    badge: "Super Dream",
    routeName: "Super Dream Track",
    route: "/super-dream",
    targetSelector: '[data-tour="nav-superdream"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          Organize premier placement cohorts for Tier-1 technology companies like Google, Microsoft, Amazon, and Atlassian with strict readiness benchmarks and specialized challenge tracks.
        </p>
      </div>
    ),
  },
  {
    step: 8,
    title: "Real-Time Proctoring Radar & Batch Unblock Dock",
    subtitle: "Monitor tab switching, multiple faces, and instantly restore blocked test-takers",
    icon: ShieldAlert,
    iconColor: "text-rose-500",
    badge: "Proctoring Radar",
    routeName: "Placement Tools",
    route: "/",
    targetSelector: '[data-tour="live-proctoring-btn"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          Live stream candidate integrity status during ongoing tests. If students get locked out due to accidental tab changes or network hiccups, restore them with the 1-click floating batch unblock dock.
        </p>
      </div>
    ),
  },
  {
    step: 9,
    title: "Global Spotlight Launcher (⌘K) & Theme Customization",
    subtitle: "Press ⌘K or Ctrl+K anytime to search candidates or jump to any operational module",
    icon: Palette,
    iconColor: "text-amber-500",
    badge: "Command Hub & ⌘K",
    routeName: "Command Hub",
    route: "/",
    targetSelector: '[data-tour="command-palette-btn"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
              <Command className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Global Command Hub (<kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700">⌘K</kbd>):</strong> Press <strong className="text-slate-900 dark:text-white font-mono">⌘K</strong> or <strong className="text-slate-900 dark:text-white font-mono">Ctrl+K</strong> anytime for instant student profile lookup or CSV exports.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="p-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
              <Palette className="h-3.5 w-3.5" />
            </div>
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Theme Mode:</strong> Toggle between executive Light Mode, sleek Dark Mode, or System Auto anytime.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    step: 10,
    title: "You're All Set!",
    subtitle: "Restart this interactive guide anytime by clicking Mentor Guide",
    icon: CheckCircle2,
    iconColor: "text-indigo-500",
    badge: "Tour Complete",
    routeName: "Overview",
    route: "/",
    targetSelector: '[data-tour="mentor-tour-btn"]',
    preferredPlacement: "right",
    content: (
      <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          You have full command over your students' career preparation telemetry! You can relaunch this interactive guide at any time by clicking <strong className="text-slate-900 dark:text-white font-semibold">Mentor Guide</strong> in the navigation sidebar.
        </p>
      </div>
    ),
  },
];

interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CardPosition {
  top: number;
  left: number;
  arrowPlacement: "top" | "bottom" | "left" | "right";
  arrowOffset?: number;
}

export function MentorProductTour({ open, onClose }: MentorProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cardPosition, setCardPosition] = useState<CardPosition>({
    top: 100,
    left: 100,
    arrowPlacement: "left",
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const current = TOUR_STEPS[currentStep];
  const Icon = current.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Reset step on open
  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  // Handle route switching if the step requires a specific page
  useEffect(() => {
    if (!open) return;

    if (current && location.pathname !== current.route) {
      setIsNavigating(true);
      setTargetRect(null);

      const navTimer = setTimeout(() => {
        navigate(current.route);

        setTimeout(() => {
          setIsNavigating(false);
        }, 400);
      }, 300);

      return () => clearTimeout(navTimer);
    } else {
      setIsNavigating(false);
    }
  }, [open, currentStep, current, location.pathname, navigate]);

  // Prevent background page from scrolling or jumping while tour modal is active
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Target element locator with safe viewport positioning (runs ONCE per step change)
  const locateTargetElement = useCallback(() => {
    if (!open || !current || isNavigating) return;

    const el = document.querySelector(current.targetSelector) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    // Check if element is inside sticky sidebar or fixed header
    const isFixedOrSticky = Boolean(
      el.closest("aside") ||
      el.closest("header") ||
      window.getComputedStyle(el).position === "fixed" ||
      window.getComputedStyle(el).position === "sticky"
    );

    const elRect = el.getBoundingClientRect();
    const inViewport =
      elRect.top >= 20 &&
      elRect.bottom <= window.innerHeight - 20 &&
      elRect.left >= 0 &&
      elRect.right <= window.innerWidth;

    // Only scroll into view once if NOT fixed/sticky and NOT already in viewport
    if (!isFixedOrSticky && !inViewport) {
      try {
        el.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
      } catch (_) {}
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [open, current, isNavigating]);

  // Update target rect stably on step change or route navigation
  useEffect(() => {
    if (!open || isNavigating) return;

    locateTargetElement();
    const settleTimer = setTimeout(locateTargetElement, 120);
    return () => clearTimeout(settleTimer);
  }, [open, currentStep, location.pathname, isNavigating, locateTargetElement]);

  // Window resize listener to re-measure target without scrolling
  useEffect(() => {
    if (!open || isNavigating || !current) return;

    const handleResize = () => {
      const el = document.querySelector(current.targetSelector) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTargetRect((prev) => {
        if (
          prev &&
          Math.abs(prev.left - rect.left) < 1 &&
          Math.abs(prev.top - rect.top) < 1 &&
          Math.abs(prev.width - rect.width) < 1 &&
          Math.abs(prev.height - rect.height) < 1
        ) {
          return prev;
        }
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [open, isNavigating, current]);

  // Dynamic Zero-Overlap Placement Solver
  const calculateCardPosition = useCallback(() => {
    if (!targetRect) return;

    const cardEl = cardRef.current;
    const cardWidth = cardEl ? cardEl.offsetWidth : Math.min(420, window.innerWidth - 32);
    const cardHeight = cardEl ? cardEl.offsetHeight : 420;
    const margin = 16;
    const padding = 16;

    const targetBox = {
      left: targetRect.left - padding,
      top: targetRect.top - padding,
      right: targetRect.left + targetRect.width + padding,
      bottom: targetRect.top + targetRect.height + padding,
    };

    const spaceRight = window.innerWidth - (targetBox.right + margin);
    const spaceLeft = targetBox.left - margin;
    const spaceBottom = window.innerHeight - (targetBox.bottom + margin);
    const spaceTop = targetBox.top - margin;

    const preferred = current.preferredPlacement || "right";
    const allPlacements: Array<"right" | "left" | "bottom" | "top"> = ["right", "left", "bottom", "top"];
    const orderedPlacements = [preferred, ...allPlacements.filter((p) => p !== preferred)];

    let chosenTop = 100;
    let chosenLeft = 100;
    let chosenPlacement: "right" | "left" | "bottom" | "top" = "right";
    let foundNonOverlapping = false;

    for (const placement of orderedPlacements) {
      let t = 0;
      let l = 0;
      let hasRoom = false;

      if (placement === "right") {
        hasRoom = spaceRight >= cardWidth;
        l = targetBox.right + margin;
        t = targetRect.top + targetRect.height / 2 - cardHeight / 2;
      } else if (placement === "left") {
        hasRoom = spaceLeft >= cardWidth;
        l = targetBox.left - cardWidth - margin;
        t = targetRect.top + targetRect.height / 2 - cardHeight / 2;
      } else if (placement === "bottom") {
        hasRoom = spaceBottom >= cardHeight;
        t = targetBox.bottom + margin;
        l = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      } else if (placement === "top") {
        hasRoom = spaceTop >= cardHeight;
        t = targetBox.top - cardHeight - margin;
        l = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      }

      // Viewport boundary clamping
      const maxTop = Math.max(16, window.innerHeight - cardHeight - 16);
      const maxLeft = Math.max(16, window.innerWidth - cardWidth - 16);
      l = Math.max(16, Math.min(maxLeft, l));
      t = Math.max(16, Math.min(maxTop, t));

      const candidateBox = {
        left: l,
        top: t,
        right: l + cardWidth,
        bottom: t + cardHeight,
      };

      const overlaps = !(
        candidateBox.right <= targetBox.left ||
        candidateBox.left >= targetBox.right ||
        candidateBox.bottom <= targetBox.top ||
        candidateBox.top >= targetBox.bottom
      );

      if (hasRoom && !overlaps) {
        chosenTop = t;
        chosenLeft = l;
        chosenPlacement = placement;
        foundNonOverlapping = true;
        break;
      }
    }

    if (!foundNonOverlapping) {
      const candidates = [
        { side: "right" as const, space: spaceRight },
        { side: "left" as const, space: spaceLeft },
        { side: "bottom" as const, space: spaceBottom },
        { side: "top" as const, space: spaceTop },
      ];
      candidates.sort((a, b) => b.space - a.space);
      const fallbackPlacement = candidates[0].side;

      if (fallbackPlacement === "right") {
        chosenLeft = targetBox.right + margin;
        chosenTop = targetRect.top + targetRect.height / 2 - cardHeight / 2;
      } else if (fallbackPlacement === "left") {
        chosenLeft = targetBox.left - cardWidth - margin;
        chosenTop = targetRect.top + targetRect.height / 2 - cardHeight / 2;
      } else if (fallbackPlacement === "bottom") {
        chosenTop = targetBox.bottom + margin;
        chosenLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      } else {
        chosenTop = targetBox.top - cardHeight - margin;
        chosenLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      }

      const maxTop = Math.max(16, window.innerHeight - cardHeight - 16);
      const maxLeft = Math.max(16, window.innerWidth - cardWidth - 16);
      chosenLeft = Math.max(16, Math.min(maxLeft, chosenLeft));
      chosenTop = Math.max(16, Math.min(maxTop, chosenTop));
      chosenPlacement = fallbackPlacement;
    }

    let arrowPlacement: "top" | "bottom" | "left" | "right" = "left";
    let arrowOffset: number | undefined = undefined;

    if (chosenPlacement === "right") {
      arrowPlacement = "left";
      const targetCenterY = targetRect.top + targetRect.height / 2;
      arrowOffset = Math.max(28, Math.min(cardHeight - 28, targetCenterY - chosenTop));
    } else if (chosenPlacement === "left") {
      arrowPlacement = "right";
      const targetCenterY = targetRect.top + targetRect.height / 2;
      arrowOffset = Math.max(28, Math.min(cardHeight - 28, targetCenterY - chosenTop));
    } else if (chosenPlacement === "bottom") {
      arrowPlacement = "top";
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowOffset = Math.max(28, Math.min(cardWidth - 28, targetCenterX - chosenLeft));
    } else if (chosenPlacement === "top") {
      arrowPlacement = "bottom";
      const targetCenterX = targetRect.left + targetRect.width / 2;
      arrowOffset = Math.max(28, Math.min(cardWidth - 28, targetCenterX - chosenLeft));
    }

    setCardPosition((prev) => {
      if (
        Math.abs(prev.top - chosenTop) < 1 &&
        Math.abs(prev.left - chosenLeft) < 1 &&
        prev.arrowPlacement === arrowPlacement &&
        prev.arrowOffset === arrowOffset
      ) {
        return prev;
      }
      return {
        top: chosenTop,
        left: chosenLeft,
        arrowPlacement,
        arrowOffset,
      };
    });
  }, [targetRect, current]);

  useEffect(() => {
    calculateCardPosition();
  }, [targetRect, calculateCardPosition]);

  useEffect(() => {
    if (!cardRef.current || !open) return;
    const observer = new ResizeObserver(() => {
      calculateCardPosition();
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [open, currentStep, calculateCardPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        localStorage.setItem("cf-mentor-tour-done", "true");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentStep]);

  if (!open) return null;

  const handleNext = () => {
    if (isLast) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      localStorage.setItem("cf-mentor-tour-done", "true");
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStep(idx);
  };

  const padding = 16;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden font-sans select-none">
      {/* SVG Mask Spotlight Cutout */}
      {targetRect && !isNavigating ? (
        <svg className="fixed inset-0 w-full h-full pointer-events-auto z-40 transition-all duration-200 ease-out">
          <defs>
            <mask id="mentor-spotlight-cutout">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="20"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="black"
            fillOpacity={0.65}
            mask="url(#mentor-spotlight-cutout)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-in fade-in duration-300 flex flex-col items-center justify-center">
          {isNavigating && (
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
              <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Navigating to {current.routeName}...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Locating {current.badge}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleek Stationary Beacon Ring around Target Element */}
      {targetRect && !isNavigating && (
        <div
          style={{
            left: `${targetRect.left - padding}px`,
            top: `${targetRect.top - padding}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
          }}
          className="fixed z-40 pointer-events-none rounded-2xl border-2 border-indigo-500 ring-2 ring-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all duration-200 ease-out"
        />
      )}

      {/* Dynamic Popover Tooltip Box */}
      {!isNavigating && (
        <div
          ref={cardRef}
          style={
            targetRect
              ? {
                  position: "fixed",
                  top: `${cardPosition.top}px`,
                  left: `${cardPosition.left}px`,
                }
              : {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
          className="z-50 w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] max-h-[calc(100vh-32px)] transition-all duration-300 ease-out animate-in zoom-in-95"
        >
          <div className="p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_0_35px_rgba(99,102,241,0.15)] relative overflow-hidden rounded-3xl flex flex-col max-h-[calc(100vh-32px)]">
            {/* Pointer Arrow Element */}
            <div
              style={
                cardPosition.arrowPlacement === "left" || cardPosition.arrowPlacement === "right"
                  ? { top: cardPosition.arrowOffset !== undefined ? `${cardPosition.arrowOffset}px` : "50%" }
                  : { left: cardPosition.arrowOffset !== undefined ? `${cardPosition.arrowOffset}px` : "50%" }
              }
              className={cn(
                "absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 border-indigo-500/40 rotate-45 z-20 pointer-events-none",
                cardPosition.arrowPlacement === "top" && "-top-2 -translate-x-1/2 border-t border-l",
                cardPosition.arrowPlacement === "bottom" && "-bottom-2 -translate-x-1/2 border-b border-r",
                cardPosition.arrowPlacement === "left" && "-left-2 -translate-y-1/2 border-b border-l",
                cardPosition.arrowPlacement === "right" && "-right-2 -translate-y-1/2 border-t border-r"
              )}
            />

            {/* Ambient Background Glow Accents */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar: Section Badge + Step Counter + Close Button */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
                <Compass className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: "16s" }} />
                <span>{current.routeName}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Step <span className="text-slate-900 dark:text-white font-black">{currentStep + 1}</span> of {TOUR_STEPS.length}
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem("cf-mentor-tour-done", "true");
                    onClose();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  title="Close Tour (Esc)"
                  aria-label="Close tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Step Header */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs shrink-0 mt-0.5">
                <Icon className={cn("h-5 w-5", current.iconColor)} />
              </div>
              <div className="min-w-0">
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
                  {current.badge}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {current.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {current.subtitle}
                </p>
              </div>
            </div>

            {/* Step Body Content */}
            <div className="relative z-10 py-1 overflow-y-auto max-h-[36vh] pr-1">
              {current.content}
            </div>

            {/* Footer Navigation & Step Progress Dots */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 relative z-10">
              {/* Progress Dots Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[130px] sm:max-w-none py-1">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectStep(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      idx === currentStep
                        ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                        : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                    )}
                    title={`Go to Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:scale-102"
                >
                  {isLast ? (
                    <>
                      <span>Complete Tour</span>
                      <Sparkles className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
