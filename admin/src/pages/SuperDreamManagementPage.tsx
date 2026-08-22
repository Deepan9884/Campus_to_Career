import React, { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import {
  Users,
  Compass,
  GraduationCap,
  FileCode,
  Map,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  ShieldCheck,
  Award,
  Search,
  X,
  UserCheck,
  TrendingUp,
  Crown,
  ChevronRight,
  Filter,
  Layers,
  Calendar,
  AlertCircle,
  Star,
  BookOpen,
  Code2,
  Eye,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExhaustiveTestBuilderModal,
  type FullTestConfig,
} from "../components/superdream/ExhaustiveTestBuilderModal";
import {
  ExhaustiveTaskBuilderModal,
  type PhasedTaskConfig,
} from "../components/superdream/ExhaustiveTaskBuilderModal";
import {
  ExhaustiveDeliverableReviewModal,
} from "../components/superdream/ExhaustiveDeliverableReviewModal";
import {
  ExhaustiveCourseCuratorModal,
  type FullCourseConfig,
} from "../components/superdream/ExhaustiveCourseCuratorModal";
import {
  CertificateProofInspectionModal,
} from "../components/superdream/CertificateProofInspectionModal";
import {
  ExhaustiveRoadmapBuilderModal,
  type FullRoadmapModuleConfig,
} from "../components/superdream/ExhaustiveRoadmapBuilderModal";

interface CohortCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  targetRole: string;
  readinessIndex: number;
  activePhase: number;
  verifiedCourses: number;
  completedTasks: number;
  avgTestScore: number;
  status: "Qualified" | "In Training" | "Review Required";
}

const INITIAL_CANDIDATES: CohortCandidate[] = [
  {
    id: "std-1",
    name: "Deepan S",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "deepan.s@campus.edu",
    targetRole: "Distributed Systems Engineer (24 LPA)",
    readinessIndex: 88,
    activePhase: 2,
    verifiedCourses: 2,
    completedTasks: 8,
    avgTestScore: 92,
    status: "Qualified",
  },
  {
    id: "std-2",
    name: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    email: "priya.nair@campus.edu",
    targetRole: "Cloud Platform Architect (28 LPA)",
    readinessIndex: 84,
    activePhase: 2,
    verifiedCourses: 2,
    completedTasks: 7,
    avgTestScore: 89,
    status: "Qualified",
  },
  {
    id: "std-3",
    name: "Rohan Varma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "rohan.varma@campus.edu",
    targetRole: "Backend Core Architect (20 LPA)",
    readinessIndex: 78,
    activePhase: 1,
    verifiedCourses: 1,
    completedTasks: 5,
    avgTestScore: 82,
    status: "In Training",
  },
  {
    id: "std-4",
    name: "Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    email: "ananya.s@campus.edu",
    targetRole: "Low Latency Trading Engineer (32 LPA)",
    readinessIndex: 91,
    activePhase: 3,
    verifiedCourses: 3,
    completedTasks: 11,
    avgTestScore: 95,
    status: "Qualified",
  },
];

const INITIAL_TASKS: any[] = [
  {
    id: "task-1",
    title: "Implement Distributed Consensus Raft Leader Election in Go/C++",
    category: "System Design",
    phase: 2,
    description: "Build a functioning Raft protocol node handling heartbeats, term increments, and split-brain election timeouts.",
    assignedBy: "Dr. Rajesh Kumar",
    assignedDate: "2026-08-10",
    dueDate: "2026-08-28",
    priority: "Urgent",
    status: "in_review",
    deliverableLink: "https://github.com/candidate/raft-consensus-engine",
    submissionNote: "Implemented election timer randomization and RPC message marshaling over gRPC with JMH benchmarks.",
    submittedAt: "2026-08-20",
    requiredDeliverables: {
      githubRepo: true,
      liveDemoUrl: true,
      architecturePdf: true,
      benchmarkSuite: true,
    },
    performanceBenchmarks: {
      minThroughputQps: 50000,
      maxLatencyP99Ms: 2.5,
      zeroMemoryLeaksRequired: true,
    },
    rubricWeights: {
      architecturePct: 40,
      performancePct: 30,
      codeQualityPct: 30,
    },
  },
  {
    id: "task-2",
    title: "Zero-Allocation High-Throughput Ring Buffer",
    category: "Core Engineering",
    phase: 2,
    description: "Design a cache-line padded disruptor ring buffer achieving >10M ops/sec with zero garbage collection pauses.",
    assignedBy: "Dr. Rajesh Kumar",
    assignedDate: "2026-08-12",
    dueDate: "2026-09-05",
    priority: "High",
    status: "completed",
    deliverableLink: "https://github.com/candidate/lockfree-ring-buffer",
    submissionNote: "Benchmarked using JMH and Google Benchmark, zero L3 cache line false sharing.",
    mentorFeedback: "Exceptional low-level latency optimization. Verified cache line alignment.",
    mentorRating: 5,
  },
  {
    id: "task-3",
    title: "Dynamic Programming: Knapsack & 2D Matrix DP Masterclass",
    category: "DSA",
    phase: 1,
    description: "Solve and document formal state transition invariants for 25 LeetCode Hard DP problems.",
    assignedBy: "Dr. Rajesh Kumar",
    assignedDate: "2026-08-01",
    dueDate: "2026-08-18",
    priority: "Normal",
    status: "completed",
    deliverableLink: "https://leetcode.com/problemset/all/",
    mentorFeedback: "Good work on state compression techniques.",
    mentorRating: 5,
  },
];

const INITIAL_COURSES: any[] = [
  {
    id: "c-1",
    title: "CS 244B: Distributed Systems & Consensus Architecture",
    provider: "Stanford Online",
    instructor: "Prof. David Mazières",
    duration: "8 Weeks (48 Hours)",
    difficulty: "Master",
    targetLpaTier: "25 - 45 LPA (FAANG)",
    topics: ["Raft Consensus", "Paxos Invariants", "Vector Clocks", "Byzantine Fault Tolerance"],
    description: "Rigorous distributed systems design covering linearizable consistency and distributed lock managers.",
    status: "completed",
    verificationPolicy: {
      minSyllabusCoveragePct: 96,
      mandatoryStudentNameMatch: true,
      requireCryptoSignature: true,
      tamperCheckMandatory: true,
    },
  },
  {
    id: "c-2",
    title: "6.824: Distributed Systems Engineering Lab",
    provider: "MIT OpenCourseWare",
    instructor: "Prof. Robert Morris",
    duration: "10 Weeks (60 Hours)",
    difficulty: "Master",
    targetLpaTier: "30 - 50 LPA (FAANG Staff)",
    topics: ["MapReduce Engine", "Multi-Raft Sharding", "Fault-Tolerant KV Storage", "Two-Phase Commit"],
    description: "Building production-grade distributed storage with automated network partition failure tests.",
    status: "in_progress",
  },
  {
    id: "c-3",
    title: "LFD420: Linux Kernel Internals & Concurrency",
    provider: "The Linux Foundation",
    instructor: "Greg Kroah-Hartman",
    duration: "6 Weeks (36 Hours)",
    difficulty: "Expert",
    targetLpaTier: "22 - 35 LPA",
    topics: ["RCU Synchronization", "Memory Barriers", "eBPF Tracing", "CFS Scheduler"],
    description: "Kernel-level execution mechanics, cache coherence protocols, and lockless data structures.",
    status: "in_progress",
  },
];

const INITIAL_TESTS: any[] = [
  {
    id: "t-1",
    title: "Super Dream FAANG Diagnostics: System Architecture Speed Exam",
    category: "System Architecture",
    durationMinutes: 60,
    passingScorePercentage: 80,
    difficulty: "Super Dream (FAANG)",
    targetPhase: 2,
    targetCandidate: "all",
    proctoringConfig: {
      webcamRequired: true,
      fullscreenEnforced: true,
      tabSwitchLimit: 2,
      aiFaceDetection: true,
      copyPasteDisabled: true,
    },
    sections: [
      {
        id: "sec-1",
        title: "Section A: Distributed Systems Core MCQ",
        type: "mcq",
        timeLimitMinutes: 20,
        mcqQuestions: [
          {
            id: "q-1",
            question: "In Raft, how does a candidate node transition into Leader state?",
            options: [
              "Receiving affirmative votes from a majority of all nodes in the cluster",
              "Waiting for 3 heartbeat intervals",
              "Having lowest latency",
              "External DNS flag",
            ],
            correctOptionIndex: 0,
            positiveMarks: 4,
            negativeMarks: 1,
            explanation: "Majority quorum required for leader election.",
            topic: "Consensus",
          },
        ],
        codingQuestions: [],
      },
      {
        id: "sec-2",
        title: "Section B: High-Throughput Disruptor Sandbox",
        type: "coding",
        timeLimitMinutes: 40,
        mcqQuestions: [],
        codingQuestions: [
          {
            id: "q-code-1",
            title: "Implement Zero-Copy Lock-Free Ring Buffer",
            problemStatement: "Design and implement single-producer single-consumer ring buffer with zero mutex contention.",
            constraints: "Time Limit: 1000ms • Memory Limit: 64MB",
            allowedLanguages: ["C++", "Rust", "Go", "Java"],
            starterBoilerplate: {},
            testCases: [
              { id: "tc-1", input: "1000000 items", expectedOutput: "1000000 ordered items", isHidden: false },
              { id: "tc-2", input: "High saturation burst", expectedOutput: "Zero data loss", isHidden: true },
            ],
            attachedPdfName: "disruptor_architecture_spec_v2.pdf",
            attachedPdfSize: "1.4 MB",
          },
        ],
      },
    ],
  },
];

const INITIAL_ROADMAP: any[] = [
  {
    id: "m-1",
    title: "Advanced Concurrency & Memory Models",
    tag: "High Concurrency",
    phase: 2,
    description: "Cache coherence protocols (MESI/MOESI), volatile semantics, memory fences, and lock-free structures.",
    status: "completed",
    topics: [
      { id: "top-1", name: "Memory Barriers & CPU Cache Lines", completed: true, estimatedHours: 12 },
      { id: "top-2", name: "CAS (Compare-And-Swap) & Lock-Free Stacks", completed: true, estimatedHours: 16 },
      { id: "top-3", name: "Disruptor Pattern & Ring Buffers", completed: true, estimatedHours: 14 },
    ],
  },
  {
    id: "m-2",
    title: "Distributed Storage & High-Availability Consensus",
    tag: "Distributed Systems",
    phase: 2,
    description: "Linearizability vs Sequential Consistency, Raft leader election, WAL, and LSM trees.",
    status: "in_progress",
    topics: [
      { id: "top-4", name: "LSM Trees & Write-Ahead Logging (WAL)", completed: true, estimatedHours: 18 },
      { id: "top-5", name: "Raft Consensus & Multi-Paxos", completed: false, estimatedHours: 24 },
      { id: "top-6", name: "Consistent Hashing & Virtual Nodes", completed: false, estimatedHours: 12 },
    ],
  },
];

export function SuperDreamManagementPage() {
  const [candidates, setCandidates] = useState<CohortCandidate[]>(INITIAL_CANDIDATES);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("std-1");
  const [tasks, setTasks] = useState<any[]>(INITIAL_TASKS);
  const [courses, setCourses] = useState<any[]>(INITIAL_COURSES);
  const [tests, setTests] = useState<any[]>(INITIAL_TESTS);
  const [roadmap, setRoadmap] = useState<any[]>(INITIAL_ROADMAP);

  const [activeTab, setActiveTab] = useState<"cohort" | "tasks" | "submissions" | "courses" | "tests" | "roadmap">("cohort");
  const [searchCandidate, setSearchCandidate] = useState("");

  // Exhaustive Builder Modals
  const [showTestBuilderModal, setShowTestBuilderModal] = useState(false);
  const [showTaskBuilderModal, setShowTaskBuilderModal] = useState(false);
  const [showCourseCuratorModal, setShowCourseCuratorModal] = useState(false);
  const [showRoadmapBuilderModal, setShowRoadmapBuilderModal] = useState(false);
  const [activeReviewTask, setActiveReviewTask] = useState<any | null>(null);
  const [activeInspectCourse, setActiveInspectCourse] = useState<any | null>(null);

  const selectedCandidate = candidates.find((c) => c.id === selectedStudentId) || candidates[0];
  const pendingSubmissions = tasks.filter((t) => t.status === "in_review" || (t.deliverableLink && t.status !== "completed"));

  const handleSaveTest = (newTest: FullTestConfig) => {
    setTests((prev) => [newTest, ...prev]);
  };

  const handleSaveTask = (newTask: PhasedTaskConfig) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleSaveCourse = (newCourse: FullCourseConfig) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleSaveRoadmap = (newModule: FullRoadmapModuleConfig) => {
    setRoadmap((prev) => [...prev, newModule]);
  };

  const handleApproveDeliverable = (taskId: string, feedback: string, rating: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "completed",
              mentorFeedback: feedback,
              mentorRating: rating,
            }
          : t
      )
    );
  };

  const handleRequestRevisions = (taskId: string, feedback: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "in_review",
              mentorFeedback: feedback,
            }
          : t
      )
    );
  };

  const handleApproveProof = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "completed" } : c))
    );
  };

  const handleRejectProof = (courseId: string, reason: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "in_progress", rejectionReason: reason } : c))
    );
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.targetRole.toLowerCase().includes(searchCandidate.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Super Dream Admin Hero Banner */}
      <GlassCard className="p-6 border-[rgb(var(--primary-rgb)/30%)] liquid-glass-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 grid place-items-center text-white shadow-xl shrink-0">
            <Crown className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgb(var(--warning-rgb)/20%)] text-[var(--warning)] border border-[rgb(var(--warning-rgb)/30%)] font-mono">
                ADMIN COMMAND CENTER
              </span>
              <span className="text-xs text-[var(--primary)] font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[var(--primary)]" /> Super Dream 20+ LPA Accelerator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
              Super Dream Curriculum & Assessment Operations
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Multi-section diagnostic exams with coding testcases & PDF specs, phased deliverables with benchmarks, and neural OCR proof verification.
            </p>
          </div>
        </div>

        {/* Global Action Launchers */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setShowTaskBuilderModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Assign Phased Task
          </button>
          <button
            onClick={() => setShowCourseCuratorModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Curate Course
          </button>
          <button
            onClick={() => setShowTestBuilderModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-md shadow-rose-500/25 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" /> Architect Full Test
          </button>
          <button
            onClick={() => setShowRoadmapBuilderModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-500/25 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" /> Build Roadmap
          </button>
        </div>
      </GlassCard>

      {/* Cohort KPIs Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-[rgb(var(--primary-rgb)/30%)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">Total Super Dream Candidates</p>
            <Users className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-3xl font-black text-[var(--foreground)] font-mono mt-1">{candidates.length}</p>
          <p className="text-[11px] text-[var(--primary)] mt-1">Cohort Batch 2026</p>
        </GlassCard>

        <GlassCard className="p-4 border-[rgb(var(--warning-rgb)/30%)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">Pending Deliverable Reviews</p>
            <Clock className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <p className="text-3xl font-black text-[var(--warning)] font-mono mt-1">{pendingSubmissions.length}</p>
          <p className="text-[11px] text-[rgb(var(--warning-rgb)/90%)] mt-1">Code repositories in queue</p>
        </GlassCard>

        <GlassCard className="p-4 border-[rgb(var(--success-rgb)/30%)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">Avg Candidate Readiness</p>
            <TrendingUp className="w-4 h-4 text-[var(--success)]" />
          </div>
          <p className="text-3xl font-black text-[var(--success)] font-mono mt-1">85.2%</p>
          <p className="text-[11px] text-[rgb(var(--success-rgb)/90%)] mt-1">FAANG placement benchmark</p>
        </GlassCard>

        <GlassCard className="p-4 border-[rgb(var(--chart-5-rgb)/30%)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">Super Dream Offers Projected</p>
            <Award className="w-4 h-4 text-[var(--chart-5)]" />
          </div>
          <p className="text-3xl font-black text-[var(--chart-5)] font-mono mt-1">75%</p>
          <p className="text-[11px] text-[rgb(var(--chart-5-rgb)/90%)] mt-1">Tier-1 conversion rate</p>
        </GlassCard>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 bg-slate-100/90 dark:bg-white/[0.04] border border-[var(--border)] rounded-2xl scrollbar-none">
        <button
          onClick={() => setActiveTab("cohort")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "cohort"
              ? "bg-[rgb(var(--primary-rgb)/20%)] text-[var(--primary)] border-[rgb(var(--primary-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Users className="w-4 h-4 text-[var(--primary)]" />
          <span>Cohort Candidates ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "tasks"
              ? "bg-[rgb(var(--chart-5-rgb)/20%)] text-[var(--chart-5)] border-[rgb(var(--chart-5-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Compass className="w-4 h-4 text-[var(--chart-5)]" />
          <span>Phased Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "submissions"
              ? "bg-[rgb(var(--warning-rgb)/20%)] text-[var(--warning)] border-[rgb(var(--warning-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Clock className="w-4 h-4 text-[var(--warning)]" />
          <span>Review Deliverables ({pendingSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "courses"
              ? "bg-[rgb(var(--success-rgb)/20%)] text-[var(--success)] border-[rgb(var(--success-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[var(--success)]" />
          <span>Curate Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "tests"
              ? "bg-[rgb(var(--destructive-rgb)/20%)] text-[var(--destructive)] border-[rgb(var(--destructive-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileCode className="w-4 h-4 text-[var(--destructive)]" />
          <span>Scheduled Tests ({tests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            activeTab === "roadmap"
              ? "bg-[rgb(var(--chart-2-rgb)/20%)] text-[var(--chart-2)] border-[rgb(var(--chart-2-rgb)/40%)] shadow-sm"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Map className="w-4 h-4 text-[var(--chart-2)]" />
          <span>Learning Roadmap ({roadmap.length})</span>
        </button>
      </div>

      {/* TAB 1: COHORT CANDIDATES DIRECTORY */}
      {activeTab === "cohort" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--primary)]" />
              Super Dream Candidate Roster
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchCandidate}
                onChange={(e) => setSearchCandidate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((cand) => (
              <GlassCard
                key={cand.id}
                className={`p-5 flex flex-col justify-between gap-4 card-hover-lift transition ${
                  selectedStudentId === cand.id ? "border-[rgb(var(--primary-rgb)/60%)] ring-1 ring-[rgb(var(--primary-rgb)/40%)]" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-[var(--border)]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[var(--foreground)]">{cand.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                              cand.status === "Qualified"
                                ? "bg-[rgb(var(--success-rgb)/20%)] text-[var(--success)] border-[rgb(var(--success-rgb)/30%)]"
                                : "bg-[rgb(var(--warning-rgb)/20%)] text-[var(--warning)] border-[rgb(var(--warning-rgb)/30%)]"
                            }`}
                          >
                            {cand.status}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">{cand.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-[var(--muted-foreground)]">Readiness</p>
                      <p className="text-lg font-black font-mono text-[var(--warning)]">{cand.readinessIndex}%</p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--primary)] mt-3 font-semibold">
                    Target: {cand.targetRole}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-xs text-center">
                  <div className="bg-slate-100/80 dark:bg-white/[0.05] p-2 rounded-lg border border-border/50">
                    <p className="text-[10px] text-[var(--muted-foreground)]">Active Phase</p>
                    <p className="font-bold text-[var(--chart-5)] font-mono mt-0.5">Phase 0{cand.activePhase}</p>
                  </div>
                  <div className="bg-slate-100/80 dark:bg-white/[0.05] p-2 rounded-lg border border-border/50">
                    <p className="text-[10px] text-[var(--muted-foreground)]">Verified Proofs</p>
                    <p className="font-bold text-[var(--success)] font-mono mt-0.5">{cand.verifiedCourses} Courses</p>
                  </div>
                  <div className="bg-slate-100/80 dark:bg-white/[0.05] p-2 rounded-lg border border-border/50">
                    <p className="text-[10px] text-[var(--muted-foreground)]">Assessments</p>
                    <p className="font-bold text-[var(--chart-2)] font-mono mt-0.5">{cand.verifiedCourses + 1} Verified</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    {cand.completedTasks} Tasks Completed
                  </span>

                  <button
                    onClick={() => {
                      setSelectedStudentId(cand.id);
                      toast.success(`Selected ${cand.name} for individual curation`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedStudentId === cand.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[var(--foreground)] border border-border/50"
                    }`}
                  >
                    {selectedStudentId === cand.id ? "Selected Candidate" : "Select Candidate"}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN & MANAGE TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--chart-5)]" />
              Assigned Phased Trajectory Tasks ({tasks.length})
            </h3>
            <button
              onClick={() => setShowTaskBuilderModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Assign New Phased Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <GlassCard
                key={task.id}
                className="p-5 flex flex-col justify-between gap-4 card-hover-lift"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--glass-input-bg)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      Phase 0{task.phase} • {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        task.status === "completed"
                          ? "bg-[rgb(var(--success-rgb)/20%)] text-[var(--success)] border-[rgb(var(--success-rgb)/30%)]"
                          : task.status === "in_review"
                          ? "bg-[rgb(var(--chart-5-rgb)/20%)] text-[var(--chart-5)] border-[rgb(var(--chart-5-rgb)/30%)]"
                          : "bg-[rgb(var(--warning-rgb)/20%)] text-[var(--warning)] border-[rgb(var(--warning-rgb)/30%)]"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[var(--foreground)]">{task.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{task.description}</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center justify-between">
                    <span>Due: <strong className="text-[var(--foreground)] font-mono">{task.dueDate}</strong></span>
                    <span>Priority: <strong className={task.priority === "Urgent" ? "text-[var(--destructive)] font-bold" : "text-[var(--warning)]"}>{task.priority}</strong></span>
                  </div>

                  {task.deliverableLink && (
                    <div className="p-2 rounded bg-[var(--glass-input-bg)] border border-[rgb(var(--primary-rgb)/20%)] flex items-center justify-between">
                      <a
                        href={task.deliverableLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--primary)] hover:text-[rgb(var(--primary-rgb)/70%)] flex items-center gap-1 font-mono text-[11px] truncate max-w-[200px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Submitted Repo
                      </a>
                      <button
                        onClick={() => setActiveReviewTask(task)}
                        className="text-xs font-bold text-[var(--warning)] hover:text-[rgb(var(--warning-rgb)/70%)] cursor-pointer"
                      >
                        Evaluate
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setActiveReviewTask(task)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                    >
                      Review Deliverable
                    </button>
                    <button
                      onClick={() => {
                        setTasks((prev) => prev.filter((t) => t.id !== task.id));
                        toast.success("Task deleted");
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-[var(--destructive)] hover:bg-[rgb(var(--destructive-rgb)/10%)] transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW DELIVERABLES & SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--warning)]" />
              Candidate Submissions Awaiting Evaluation ({pendingSubmissions.length})
            </h3>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)] text-center text-[var(--muted-foreground)] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[var(--success)] mx-auto" />
              <p className="text-base font-bold text-[var(--foreground)]">All Submissions Evaluated</p>
              <p className="text-xs">No pending student deliverables in review queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSubmissions.map((task) => (
                <GlassCard
                  key={task.id}
                  className="p-5 border-[rgb(var(--warning-rgb)/30%)] flex flex-col justify-between gap-4 card-hover-lift"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[rgb(var(--warning-rgb)/20%)] text-[var(--warning)] border border-[rgb(var(--warning-rgb)/30%)]">
                        Phase 0{task.phase} Deliverable
                      </span>
                      <span className="text-xs font-mono text-[var(--muted-foreground)]">{task.submittedAt || "Recent"}</span>
                    </div>

                    <h4 className="font-bold text-base text-[var(--foreground)]">{task.title}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{task.description}</p>

                    {task.submissionNote && (
                      <div className="p-3 rounded-xl bg-[var(--glass-input-bg)] border border-[var(--border)] mt-3 text-xs">
                        <p className="text-[var(--muted-foreground)] font-medium">Candidate Submission Notes:</p>
                        <p className="text-[var(--foreground)] mt-0.5 italic">"{task.submissionNote}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    {task.deliverableLink ? (
                      <a
                        href={task.deliverableLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[var(--chart-5)] hover:text-[rgb(var(--chart-5-rgb)/70%)] flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Code Repo
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">Pending Link</span>
                    )}

                    <button
                      onClick={() => setActiveReviewTask(task)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-95 text-white transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Grade & Review
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSIGN & CURATE COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[var(--success)]" />
              Assigned Course Curriculums ({courses.length})
            </h3>
            <button
              onClick={() => setShowCourseCuratorModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Curate New Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => (
              <GlassCard
                key={c.id}
                className="p-5 flex flex-col justify-between gap-4 card-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--warning)]">{c.provider}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--glass-input-bg)] text-[var(--muted-foreground)]">
                      {c.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[var(--foreground)]">{c.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Instructor: {c.instructor} • {c.duration}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {c.status === "completed" ? (
                      <span className="text-[var(--success)] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI Verified Proof
                      </span>
                    ) : (
                      <span className="text-[var(--warning)] font-medium">Verification Pending</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveInspectCourse(c)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[rgb(var(--success-rgb)/20%)] text-[var(--success)] border border-[rgb(var(--success-rgb)/40%)] hover:bg-[rgb(var(--success-rgb)/30%)] transition cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Inspect Proof</span>
                    </button>

                    <button
                      onClick={() => {
                        setCourses((prev) => prev.filter((item) => item.id !== c.id));
                        toast.success("Course removed");
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs text-[var(--destructive)] hover:bg-[rgb(var(--destructive-rgb)/10%)] transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULED DIAGNOSTIC ASSESSMENTS */}
      {activeTab === "tests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[var(--destructive)]" />
              Configured Diagnostic Tests ({tests.length})
            </h3>
            <button
              onClick={() => setShowTestBuilderModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Architect Full Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((t) => (
              <GlassCard
                key={t.id}
                className="p-5 flex flex-col justify-between gap-4 card-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--warning)]">{t.category}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--glass-input-bg)] text-[var(--muted-foreground)]">
                      {t.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[var(--foreground)]">{t.title}</h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                    <div>Duration: <strong className="text-[var(--foreground)]">{t.durationMinutes}m</strong></div>
                    <div>Sections: <strong className="text-[var(--chart-5)]">{t.sections?.length || 2}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Passing Mark: <strong className="text-[var(--success)]">{t.passingScorePercentage || 80}%</strong>
                  </span>

                  <button
                    onClick={() => {
                      setTests((prev) => prev.filter((item) => item.id !== t.id));
                      toast.success("Test removed from schedule");
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs text-[var(--destructive)] hover:bg-[rgb(var(--destructive-rgb)/10%)] transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CURATE LEARNING ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Map className="w-4 h-4 text-[var(--chart-2)]" />
              Mentor Curated Syllabus Modules ({roadmap.length})
            </h3>
            <button
              onClick={() => setShowRoadmapBuilderModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Build Syllabus Module
            </button>
          </div>

          <div className="space-y-4">
            {roadmap.map((m, idx) => (
              <GlassCard key={m.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[rgb(var(--chart-2-rgb)/20%)] text-[var(--chart-2)]">
                      Module 0{idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-[var(--foreground)]">{m.title}</h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--glass-input-bg)] text-[var(--muted-foreground)]">
                      {m.tag}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setRoadmap((prev) => prev.filter((item) => item.id !== m.id));
                      toast.success("Module removed");
                    }}
                    className="text-xs text-[var(--destructive)] hover:underline cursor-pointer"
                  >
                    Delete Module
                  </button>
                </div>

                <p className="text-xs text-[var(--muted-foreground)]">{m.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                  {m.topics?.map((t: any) => (
                    <div key={t.id} className="p-2.5 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs">
                      <p className="font-medium text-[var(--foreground)]">{t.name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{t.estimatedHours}h study load</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <ExhaustiveTestBuilderModal
        open={showTestBuilderModal}
        onClose={() => setShowTestBuilderModal(false)}
        onSaveTest={handleSaveTest}
      />

      <ExhaustiveTaskBuilderModal
        open={showTaskBuilderModal}
        onClose={() => setShowTaskBuilderModal(false)}
        onSaveTask={handleSaveTask}
      />

      <ExhaustiveCourseCuratorModal
        open={showCourseCuratorModal}
        onClose={() => setShowCourseCuratorModal(false)}
        onSaveCourse={handleSaveCourse}
      />

      <ExhaustiveRoadmapBuilderModal
        open={showRoadmapBuilderModal}
        onClose={() => setShowRoadmapBuilderModal(false)}
        onSaveRoadmapModule={handleSaveRoadmap}
      />

      {activeReviewTask && (
        <ExhaustiveDeliverableReviewModal
          open={Boolean(activeReviewTask)}
          onClose={() => setActiveReviewTask(null)}
          task={activeReviewTask}
          candidateName={selectedCandidate.name}
          onApprove={handleApproveDeliverable}
          onRequestRevisions={handleRequestRevisions}
        />
      )}

      {activeInspectCourse && (
        <CertificateProofInspectionModal
          open={Boolean(activeInspectCourse)}
          onClose={() => setActiveInspectCourse(null)}
          course={activeInspectCourse}
          candidateName={selectedCandidate.name}
          onApproveProof={handleApproveProof}
          onRejectProof={handleRejectProof}
        />
      )}
    </div>
  );
}
