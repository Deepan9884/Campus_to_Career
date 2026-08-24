import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  Code2,
  HelpCircle,
  Search,
  Check,
  Award,
  Shield,
  Eye,
  Terminal,
  Loader2,
  Cpu,
  Users,
  Building2,
  Zap,
  Sliders,
  Settings2,
  ListOrdered,
  Flame,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAdminExam,
  parseCodingLink,
  generateAiMcqs,
  generateAiCoding,
  getStudentsList,
  type ExamItem,
  type ExamSectionData,
  type McqQuestionData,
  type CodingQuestionData,
  type StudentSummary,
} from "../../lib/admin-api";

interface CreateExamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (exam: ExamItem) => void;
}

const COMMON_TOPICS = [
  "Data Structures & Algorithms",
  "Arrays & Strings",
  "Trees & Graphs",
  "Dynamic Programming",
  "Database Management Systems (DBMS)",
  "SQL Queries & Optimization",
  "Operating Systems",
  "Computer Networks",
  "Object Oriented Programming (OOP)",
  "Python Programming",
  "Java Core & JVM",
  "C++ Standard Library",
  "JavaScript & Web Architecture",
  "System Design & Scalability",
  "Quantitative Aptitude",
];

export function CreateExamModal({ open, onClose, onSuccess }: CreateExamModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // ── STEP 1: EXAM TYPE ──────────────────────────────────────────────────────
  const [examType, setExamType] = useState<"mcq" | "coding" | "mixed">("mcq");

  // ── STEP 2: EXAM OVERVIEW & SECTION ARCHITECTURE ───────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Placement Assessment");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "FAANG Tier" | "Mixed">("Medium");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScorePercentage, setPassingScorePercentage] = useState(60);

  // Section configurations
  const [sections, setSections] = useState<ExamSectionData[]>([
    {
      sectionId: "sec-1",
      title: "Section 1: Core Fundamentals & MCQs",
      type: "mcq",
      difficulty: "medium",
      topics: ["Data Structures & Algorithms"],
      timeLimitMinutes: 30,
      targetQuestionCount: 5,
      mcqQuestions: [],
      codingQuestions: [],
    },
  ]);

  // Section count helper
  const sectionCount = sections.length;

  // ── STEP 3: QUESTION SOURCING & LINK PARSER ────────────────────────────────
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [linkInput, setLinkInput] = useState("");
  const [slotLinkInputs, setSlotLinkInputs] = useState<Record<string, string>>({});
  const [parsingSlotKey, setParsingSlotKey] = useState<string | null>(null);
  const [generatingSlotKey, setGeneratingSlotKey] = useState<string | null>(null);
  const [isParsingLink, setIsParsingLink] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState("");

  // Manual MCQ builder inline state
  const [showManualMcqModal, setShowManualMcqModal] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>(["", "", "", ""]);
  const [manualCorrectIdx, setManualCorrectIdx] = useState(0);
  const [manualMarks, setManualMarks] = useState(2);
  const [manualExplanation, setManualExplanation] = useState("");

  // ── STEP 4: TARGET AUDIENCE & PROCTORING CONFIG ────────────────────────────
  const [targetAudience, setTargetAudience] = useState<"all" | "mentees" | "selected">("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentsRoster, setStudentsRoster] = useState<StudentSummary[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Proctoring Settings
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [fullscreenEnforced, setFullscreenEnforced] = useState(true);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(3);
  const [aiFaceDetection, setAiFaceDetection] = useState(false);
  const [copyPasteDisabled, setCopyPasteDisabled] = useState(false);
  const [allowRetakes, setAllowRetakes] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch student roster when target audience is "selected"
  useEffect(() => {
    if (targetAudience === "selected" && studentsRoster.length === 0) {
      setIsLoadingRoster(true);
      getStudentsList(1, "", "all", 100)
        .then((res) => {
          setStudentsRoster(res.students || []);
        })
        .catch((err) => {
          console.error("Failed to load roster:", err);
        })
        .finally(() => {
          setIsLoadingRoster(false);
        });
    }
  }, [targetAudience]);

  // Adjust initial sections when examType changes
  const handleSelectExamType = (type: "mcq" | "coding" | "mixed") => {
    setExamType(type);
    if (type === "mcq") {
      setSections([
        {
          sectionId: "sec-1",
          title: "Section 1: Conceptual & Technical MCQs",
          type: "mcq",
          difficulty: "medium",
          topics: ["Data Structures & Algorithms"],
          timeLimitMinutes: 30,
          targetQuestionCount: 5,
          mcqQuestions: [],
          codingQuestions: [],
        },
      ]);
    } else if (type === "coding") {
      setSections([
        {
          sectionId: "sec-1",
          title: "Section 1: Hands-on Coding Arena",
          type: "coding",
          difficulty: "medium",
          topics: ["Algorithms", "Arrays & Strings"],
          timeLimitMinutes: 60,
          targetQuestionCount: 2,
          mcqQuestions: [],
          codingQuestions: [],
        },
      ]);
    } else {
      // Mixed
      setSections([
        {
          sectionId: "sec-1",
          title: "Section 1: Foundational MCQs",
          type: "mcq",
          difficulty: "medium",
          topics: ["Database Management Systems (DBMS)", "Operating Systems"],
          timeLimitMinutes: 20,
          targetQuestionCount: 5,
          mcqQuestions: [],
          codingQuestions: [],
        },
        {
          sectionId: "sec-2",
          title: "Section 2: Algorithmic Problem Solving",
          type: "coding",
          difficulty: "hard",
          topics: ["Dynamic Programming", "Trees & Graphs"],
          timeLimitMinutes: 40,
          targetQuestionCount: 2,
          mcqQuestions: [],
          codingQuestions: [],
        },
      ]);
    }
    setActiveStep(2);
  };

  // Set number of sections directly
  const handleSetSectionCount = (targetCount: number) => {
    if (targetCount < 1) return;
    if (targetCount > 8) {
      toast.error("Maximum 8 sections per examination");
      return;
    }

    if (targetCount === sections.length) return;

    if (targetCount > sections.length) {
      const added: ExamSectionData[] = [];
      for (let i = sections.length + 1; i <= targetCount; i++) {
        const defaultType = examType === "coding" ? "coding" : "mcq";
        added.push({
          sectionId: `sec-${i}-${Date.now()}`,
          title: `Section ${i}: ${defaultType === "mcq" ? "MCQ Diagnostic" : "Coding Challenge"}`,
          type: defaultType,
          difficulty: "medium",
          topics: ["Data Structures & Algorithms"],
          timeLimitMinutes: 25,
          targetQuestionCount: defaultType === "mcq" ? 5 : 2,
          mcqQuestions: [],
          codingQuestions: [],
        });
      }
      setSections([...sections, ...added]);
    } else {
      setSections(sections.slice(0, targetCount));
      if (activeSectionIdx >= targetCount) {
        setActiveSectionIdx(targetCount - 1);
      }
    }
  };

  // Update a single section property
  const updateSection = (idx: number, patch: Partial<ExamSectionData>) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], ...patch };
    setSections(updated);
  };

  // Toggle a topic in a section
  const handleToggleTopic = (secIdx: number, topic: string) => {
    const sec = sections[secIdx];
    const hasTopic = sec.topics.includes(topic);
    const newTopics = hasTopic
      ? sec.topics.filter((t) => t !== topic)
      : [...sec.topics, topic];
    updateSection(secIdx, { topics: newTopics });
  };

  // Add custom topic
  const handleAddCustomTopic = (secIdx: number) => {
    if (!customTopicInput.trim()) return;
    const sec = sections[secIdx];
    if (!sec.topics.includes(customTopicInput.trim())) {
      updateSection(secIdx, { topics: [...sec.topics, customTopicInput.trim()] });
    }
    setCustomTopicInput("");
  };

  // ── AI MCQ GENERATOR (USING SECTION TOPICS, DIFFICULTY, AND COUNT) ─────────
  const handleGenerateAiMcqsForSection = async (secIdx: number) => {
    const sec = sections[secIdx];
    const qCount = sec.targetQuestionCount || 5;
    setIsGeneratingAi(true);
    try {
      const generated = await generateAiMcqs(
        sec.topics.length > 0 ? sec.topics : ["Data Structures & Algorithms"],
        sec.difficulty as any,
        qCount
      );

      const updated = [...sections];
      updated[secIdx].mcqQuestions = [...updated[secIdx].mcqQuestions, ...generated];
      setSections(updated);
      toast.success(`Generated ${generated.length} MCQs for ${sec.title}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI MCQs");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ── PARSE LINK FOR A SPECIFIC QUESTION SLOT ─────────────────────────────
  const handleParseCodingLinkForSlot = async (secIdx: number, slotIdx: number) => {
    const key = `${secIdx}-${slotIdx}`;
    const url = (slotLinkInputs[key] || "").trim();
    if (!url) {
      toast.error(`Please paste a HackerRank or LeetCode link for Challenge #${slotIdx + 1}`);
      return;
    }

    setParsingSlotKey(key);
    try {
      const parsedProblem = await parseCodingLink(url);

      const updated = [...sections];
      const currentQuestions = [...(updated[secIdx].codingQuestions || [])];

      if (slotIdx < currentQuestions.length) {
        currentQuestions[slotIdx] = parsedProblem;
      } else {
        currentQuestions.push(parsedProblem);
      }

      updated[secIdx].codingQuestions = currentQuestions;
      setSections(updated);
      toast.success(`Challenge #${slotIdx + 1} imported: "${parsedProblem.title}" with test cases!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to parse link for Challenge #${slotIdx + 1}`);
    } finally {
      setParsingSlotKey(null);
    }
  };

  // ── GENERATE AI CODING FOR A SPECIFIC QUESTION SLOT ─────────────────────
  const handleGenerateAiCodingForSlot = async (secIdx: number, slotIdx: number) => {
    const key = `${secIdx}-${slotIdx}`;
    const sec = sections[secIdx];
    setGeneratingSlotKey(key);
    try {
      const topic = sec.topics.length > slotIdx ? sec.topics[slotIdx] : sec.topics[0] || "Algorithms";
      const generated = await generateAiCoding(topic, sec.difficulty as any);

      const updated = [...sections];
      const currentQuestions = [...(updated[secIdx].codingQuestions || [])];

      if (slotIdx < currentQuestions.length) {
        currentQuestions[slotIdx] = generated;
      } else {
        currentQuestions.push(generated);
      }

      updated[secIdx].codingQuestions = currentQuestions;
      setSections(updated);
      toast.success(`Generated Challenge #${slotIdx + 1}: "${generated.title}"!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI coding challenge");
    } finally {
      setGeneratingSlotKey(null);
    }
  };

  // ── REMOVE OR CLEAR A SPECIFIC QUESTION SLOT ────────────────────────────
  const handleRemoveCodingSlot = (secIdx: number, slotIdx: number) => {
    const updated = [...sections];
    updated[secIdx].codingQuestions = updated[secIdx].codingQuestions.filter((_, i) => i !== slotIdx);
    setSections(updated);
    toast.info(`Challenge #${slotIdx + 1} removed`);
  };

  // ── ADD AN EXTRA QUESTION SLOT ──────────────────────────────────────────
  const handleAddExtraQuestionSlot = (secIdx: number) => {
    const updated = [...sections];
    const currentTarget = updated[secIdx].targetQuestionCount || 1;
    updated[secIdx].targetQuestionCount = Math.max(currentTarget + 1, (updated[secIdx].codingQuestions?.length || 0) + 1);
    setSections(updated);
    toast.success(`Added Challenge #${updated[secIdx].targetQuestionCount} slot to ${updated[secIdx].title}`);
  };

  // ── LEGACY PARSE LINK FALLBACK ────────────────────────────────────────────
  const handleParseCodingLink = async (secIdx: number) => {
    if (!linkInput.trim()) {
      toast.error("Please enter a valid HackerRank or LeetCode URL / problem title");
      return;
    }

    setIsParsingLink(true);
    try {
      const parsedProblem = await parseCodingLink(linkInput.trim());

      const updated = [...sections];
      updated[secIdx].codingQuestions = [
        ...updated[secIdx].codingQuestions,
        parsedProblem,
      ];
      setSections(updated);
      setLinkInput("");
      toast.success(`Parsed problem: "${parsedProblem.title}" with test cases!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to parse link");
    } finally {
      setIsParsingLink(false);
    }
  };

  // ── AI CODING GENERATOR ───────────────────────────────────────────────────
  const handleGenerateAiCodingForSection = async (secIdx: number) => {
    const sec = sections[secIdx];
    setIsGeneratingAi(true);
    try {
      const topic = sec.topics.length > 0 ? sec.topics[0] : "Algorithms";
      const generated = await generateAiCoding(
        topic,
        sec.difficulty as any
      );

      const updated = [...sections];
      updated[secIdx].codingQuestions = [...updated[secIdx].codingQuestions, generated];
      setSections(updated);
      toast.success(`Generated coding challenge: "${generated.title}"!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI coding challenges");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ── ADD MANUAL MCQ ────────────────────────────────────────────────────────
  const handleSaveManualMcq = (secIdx: number) => {
    if (!manualQuestion.trim()) {
      toast.error("Question prompt is required");
      return;
    }
    if (manualOptions.some((opt) => !opt.trim())) {
      toast.error("All 4 options must be filled");
      return;
    }

    const newMcq: McqQuestionData = {
      questionId: `mcq-manual-${Date.now()}`,
      question: manualQuestion.trim(),
      options: manualOptions.map((o) => o.trim()),
      correctOptionIndex: manualCorrectIdx,
      correctAnswer: manualOptions[manualCorrectIdx].trim(),
      positiveMarks: Number(manualMarks) || 2,
      negativeMarks: Number(manualMarks) * 0.25,
      explanation: manualExplanation.trim() || "Correct answer as configured by faculty.",
      topic: sections[secIdx].topics[0] || "General",
      difficulty: sections[secIdx].difficulty as any,
      imageUrl: manualImageUrl.trim(),
      diagramUrl: manualImageUrl.trim(),
    };

    const updated = [...sections];
    updated[secIdx].mcqQuestions = [...updated[secIdx].mcqQuestions, newMcq];
    setSections(updated);

    // Reset
    setManualQuestion("");
    setManualImageUrl("");
    setManualOptions(["", "", "", ""]);
    setManualCorrectIdx(0);
    setManualExplanation("");
    setShowManualMcqModal(false);
    toast.success("Manual question added to section");
  };

  // ── VALIDATE AND SUBMIT FINAL EXAM ────────────────────────────────────────
  const handleSubmitExam = async () => {
    if (!title.trim()) {
      toast.error("Please provide an Exam Title");
      setActiveStep(2);
      return;
    }

    // Check that each section has at least 1 question
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec.type === "mcq" && sec.mcqQuestions.length === 0) {
        toast.error(`"${sec.title}" has no MCQ questions. Please fetch or add questions.`);
        setActiveStep(3);
        setActiveSectionIdx(i);
        return;
      }
      if (sec.type === "coding" && sec.codingQuestions.length === 0) {
        toast.error(`"${sec.title}" has no coding challenges. Please import a link or generate questions.`);
        setActiveStep(3);
        setActiveSectionIdx(i);
        return;
      }
    }

    if (targetAudience === "selected" && selectedStudentIds.length === 0) {
      toast.error("Please select at least one student or choose 'All Students'");
      setActiveStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<ExamItem> = {
        title: title.trim(),
        description: description.trim(),
        examType,
        category,
        difficulty,
        durationMinutes: Number(durationMinutes) || 60,
        passingScorePercentage: Number(passingScorePercentage) || 60,
        targetAudience,
        assignedStudents: targetAudience === "selected" ? (selectedStudentIds as any) : [],
        sections,
        proctoringConfig: {
          webcamRequired,
          fullscreenEnforced,
          tabSwitchLimit,
          aiFaceDetection,
          copyPasteDisabled,
        },
        isResultDisclosed: false, // strictly default to confidential / withheld
        allowRetakes,
        isPublished: true,
      };

      const created = await createAdminExam(payload);
      toast.success("Exam authored and published successfully!");
      onSuccess(created);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const currentSec = sections[activeSectionIdx] || sections[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-4xl w-full bg-[image:var(--glass-strong-bg)] bg-slate-900/95 border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl btn-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Create Proctored Assessment</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Structure sections, topics, hardness, and question sourcing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-[var(--border)] flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { num: 1, label: "1. Exam Type" },
            { num: 2, label: "2. Sections & Topics" },
            { num: 3, label: "3. Sourcing & Links" },
            { num: 4, label: "4. Audience & Rules" },
            { num: 5, label: "5. Review & Publish" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeStep === s.num
                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                  : activeStep > s.num
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{s.label}</span>
              {activeStep > s.num && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: SELECT EXAM TYPE (MCQ / CODING / BOTH)
              ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Choose Exam Type</h3>
                <p className="text-xs text-slate-400">
                  Select the core examination type to configure sections and sourcing
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. MCQs */}
                <div
                  onClick={() => handleSelectExamType("mcq")}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 relative ${
                    examType === "mcq"
                      ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">1. MCQs Only</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Choose topics, number of sections, how many questions per section, and hardness. Auto-fetch via AI or question bank.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 pt-2">
                    <span>Configure MCQ Sections</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 2. Coding */}
                <div
                  onClick={() => handleSelectExamType("coding")}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 relative ${
                    examType === "coding"
                      ? "bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">2. Coding Only</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Paste question links from HackerRank / LeetCode / GFG. Auto-extracts diagrams, problem text, test cases, and empty code spaces.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 pt-2">
                    <span>Configure Coding Arena</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 3. Both (Mixed) */}
                <div
                  onClick={() => handleSelectExamType("mixed")}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 relative ${
                    examType === "mixed"
                      ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">3. Both (Mixed)</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Comprehensive placement rounds combining multiple MCQ sections and algorithmic coding challenges in one unified test.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 pt-2">
                    <span>Configure Mixed Rounds</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: SECTION ARCHITECTURE, QUESTION COUNTS, HARDNESS & TOPICS
              ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Basic Overview Strip */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Exam Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Campus Recruitment: DSA & CS Fundamentals Evaluation"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Category / Track</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Placement Assessment, Super Dream Track"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Total Duration (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Passing Score (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={passingScorePercentage}
                      onChange={(e) => setPassingScorePercentage(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── QUESTION PROMPT 1: HOW MANY SECTIONS? ──────────────────── */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-indigo-400" />
                      <span>How many sections in this exam?</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure the exact number of sections and their independent syllabus.
                    </p>
                  </div>

                  {/* Section Stepper */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSetSectionCount(sections.length - 1)}
                      disabled={sections.length <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-extrabold text-indigo-300 px-2">
                      {sections.length} {sections.length === 1 ? "Section" : "Sections"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetSectionCount(sections.length + 1)}
                      disabled={sections.length >= 8}
                      className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Section Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick Set:</span>
                  {[1, 2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleSetSectionCount(cnt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        sections.length === cnt
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      {cnt} {cnt === 1 ? "Section" : "Sections"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── QUESTION PROMPT 2: FOR EACH SECTION -> QUESTIONS COUNT, HARDNESS, TOPICS ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Configure Section Parameters
                </h4>

                {sections.map((sec, idx) => (
                  <div
                    key={sec.sectionId}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 relative"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateSection(idx, { title: e.target.value })}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {examType === "mixed" && (
                        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          <button
                            type="button"
                            onClick={() => updateSection(idx, { type: "mcq" })}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                              sec.type === "mcq" ? "bg-indigo-600 text-white" : "text-slate-400"
                            }`}
                          >
                            MCQ
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSection(idx, { type: "coding" })}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                              sec.type === "coding" ? "bg-cyan-600 text-white" : "text-slate-400"
                            }`}
                          >
                            Coding
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Parameters Form */}
                    {sec.type === "coding" ? (
                      /* ── CODING SECTION: ONLY NUMBER OF QUESTIONS & TIME LIMIT ── */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Questions Count */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                              <span>Number of Coding Challenges *</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={sec.targetQuestionCount || 2}
                                onChange={(e) =>
                                  updateSection(idx, {
                                    targetQuestionCount: Math.max(1, Number(e.target.value) || 1),
                                  })
                                }
                                className="w-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-cyan-500 focus:outline-none"
                              />
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 5].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => updateSection(idx, { targetQuestionCount: num })}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                      sec.targetQuestionCount === num
                                        ? "bg-cyan-600 text-white"
                                        : "bg-slate-900 text-slate-400 border border-slate-800"
                                    }`}
                                  >
                                    {num} {num === 1 ? "Problem" : "Problems"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Time Limit */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Section Time Limit (mins)</label>
                            <input
                              type="number"
                              min={5}
                              max={180}
                              value={sec.timeLimitMinutes}
                              onChange={(e) =>
                                updateSection(idx, { timeLimitMinutes: Number(e.target.value) || 30 })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Automatic Metadata Notice for Coding */}
                        <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300">
                          <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            <strong>Automatic Metadata Extraction:</strong> Problem hardness (Easy / Medium / Hard) and data structure topic tags will be automatically parsed directly from your HackerRank or LeetCode problem links in the next step.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ── MCQ SECTION: QUESTIONS COUNT, HARDNESS, TIME LIMIT & TOPICS ── */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Questions Count */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                              <span>Questions in this section *</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={sec.targetQuestionCount || 5}
                                onChange={(e) =>
                                  updateSection(idx, {
                                    targetQuestionCount: Math.max(1, Number(e.target.value) || 1),
                                  })
                                }
                                className="w-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                              />
                              <div className="flex items-center gap-1">
                                {[5, 10, 20].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => updateSection(idx, { targetQuestionCount: num })}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                      sec.targetQuestionCount === num
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-900 text-slate-400 border border-slate-800"
                                    }`}
                                  >
                                    {num}Q
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Hardness */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Hardness of this section *</label>
                            <select
                              value={sec.difficulty}
                              onChange={(e) => updateSection(idx, { difficulty: e.target.value as any })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="easy">Easy (Foundational)</option>
                              <option value="medium">Medium (Standard Core)</option>
                              <option value="hard">Hard (Advanced / Complex)</option>
                              <option value="faang">FAANG / Competitive Tier</option>
                            </select>
                          </div>

                          {/* Time Limit */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Section Time Limit (mins)</label>
                            <input
                              type="number"
                              min={5}
                              max={180}
                              value={sec.timeLimitMinutes}
                              onChange={(e) =>
                                updateSection(idx, { timeLimitMinutes: Number(e.target.value) || 20 })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Topics Selection */}
                        <div className="space-y-2 pt-1">
                          <label className="text-xs font-bold text-slate-300 block">
                            Topics for Section {idx + 1} ({sec.topics.length} selected)
                          </label>
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                            {COMMON_TOPICS.map((topic) => {
                              const isSelected = sec.topics.includes(topic);
                              return (
                                <button
                                  key={topic}
                                  type="button"
                                  onClick={() => handleToggleTopic(idx, topic)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                                    isSelected
                                      ? "bg-indigo-600 text-white border border-indigo-400 shadow-sm"
                                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Topic Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={customTopicInput}
                              onChange={(e) => setCustomTopicInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomTopic(idx);
                                }
                              }}
                              placeholder="Type custom topic and click Add..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomTopic(idx)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                            >
                              Add Topic
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: QUESTION SOURCING & LINK IMPORT
              ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <div className="space-y-6">
              {/* Section Sub-tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                {sections.map((sec, idx) => {
                  const qCount =
                    sec.type === "mcq" ? sec.mcqQuestions.length : sec.codingQuestions.length;
                  const target = sec.targetQuestionCount || (sec.type === "mcq" ? 5 : 2);

                  return (
                    <button
                      key={sec.sectionId}
                      onClick={() => setActiveSectionIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                        activeSectionIdx === idx
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{sec.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          qCount >= target ? "bg-emerald-500/30 text-emerald-300" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {qCount} / {target}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Current Section Sourcing Controls */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                {/* Requirements Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{currentSec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: <strong className="text-indigo-400">{currentSec.targetQuestionCount || 5} questions</strong> • Hardness: <strong className="text-indigo-400">{currentSec.difficulty}</strong> • Topics: {currentSec.topics.join(", ")}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 self-start sm:self-auto">
                    {currentSec.type === "mcq"
                      ? `${currentSec.mcqQuestions.length} Questions Added`
                      : `${currentSec.codingQuestions.length} Challenges Added`}
                  </span>
                </div>

                {/* Sourcing Actions for MCQ */}
                {currentSec.type === "mcq" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Auto Fetch via AI */}
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleGenerateAiMcqsForSection(activeSectionIdx)}
                        className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 hover:border-indigo-400 text-left space-y-1 transition group cursor-pointer shadow-md shadow-indigo-500/10"
                      >
                        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition" />
                          <span>Fetch {currentSec.targetQuestionCount || 5} Questions via AI</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Automatically generates {currentSec.targetQuestionCount || 5} {currentSec.difficulty} questions tailored to selected topics with answer keys & explanations.
                        </p>
                      </button>

                      {/* Manual Add */}
                      <button
                        type="button"
                        onClick={() => setShowManualMcqModal(true)}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left space-y-1 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>Author Custom MCQ</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Manually write question prompt, 4 choices, positive/negative marks, and answer key.
                        </p>
                      </button>
                    </div>

                    {/* Fetched Questions List */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-xs font-extrabold uppercase text-slate-300">
                        Section Questions ({currentSec.mcqQuestions.length})
                      </h5>

                      {currentSec.mcqQuestions.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                          No questions added yet. Click <strong>"Fetch via AI"</strong> or <strong>"Author Custom MCQ"</strong> above.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {currentSec.mcqQuestions.map((q, qIdx) => (
                            <div
                              key={q.questionId || qIdx}
                              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-bold text-white leading-relaxed">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...sections];
                                    updated[activeSectionIdx].mcqQuestions = updated[
                                      activeSectionIdx
                                    ].mcqQuestions.filter((_, i) => i !== qIdx);
                                    setSections(updated);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {(q.imageUrl || q.diagramUrl) && (
                                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 inline-block">
                                  <img
                                    src={q.imageUrl || q.diagramUrl}
                                    alt="Question Diagram"
                                    className="max-h-24 object-contain rounded"
                                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`px-2.5 py-1 rounded-lg border ${
                                      oIdx === q.correctOptionIndex
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                                        : "bg-slate-950 border-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sourcing Actions for Coding (Slot-by-Slot matching Target Count) */}
                {currentSec.type === "coding" && (
                  <div className="space-y-5">
                    {/* Header instruction */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                          <LinkIcon className="w-4 h-4 text-cyan-400" />
                          <span>Question Sourcing by Slots ({Math.max(currentSec.targetQuestionCount || 1, currentSec.codingQuestions.length)} Challenge Slots)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Paste a separate HackerRank/LeetCode link for each requested question slot below or generate individual slots via AI.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddExtraQuestionSlot(activeSectionIdx)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question Slot</span>
                      </button>
                    </div>

                    {/* Array of Dedicated Question Slots */}
                    <div className="space-y-4">
                      {Array.from({
                        length: Math.max(currentSec.targetQuestionCount || 1, currentSec.codingQuestions.length),
                      }).map((_, slotIdx) => {
                        const question = currentSec.codingQuestions[slotIdx];
                        const key = `${activeSectionIdx}-${slotIdx}`;
                        const isParsing = parsingSlotKey === key;
                        const isGenerating = generatingSlotKey === key;
                        const linkVal = slotLinkInputs[key] || "";

                        return (
                          <div
                            key={slotIdx}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                              question
                                ? "bg-slate-900/90 border-slate-800"
                                : "bg-slate-950/70 border-dashed border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            {/* Slot Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-xl btn-gradient text-white text-xs font-black flex items-center justify-center">
                                  #{slotIdx + 1}
                                </span>
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {question ? question.title : `Challenge #${slotIdx + 1} (Awaiting Sourcing)`}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {question
                                      ? `${question.difficulty} • ${question.category} • ${question.testCases?.length || 0} Test cases`
                                      : `Target Topic: ${currentSec.topics[slotIdx % (currentSec.topics.length || 1)] || currentSec.topics[0] || "Algorithms"}`}
                                  </span>
                                </div>
                              </div>

                              {question ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Imported
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCodingSlot(activeSectionIdx, slotIdx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                                    title="Clear / Remove this challenge"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                                  Slot Empty
                                </span>
                              )}
                            </div>

                            {/* If Question already fetched: Show summary card */}
                            {question ? (
                              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                                <p className="text-[11px] text-slate-300 font-mono line-clamp-2 leading-relaxed">
                                  {question.problemStatement}
                                </p>

                                {/* Diagram Image preview & input */}
                                {question.diagramUrl && (
                                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center max-w-sm">
                                    <img
                                      src={question.diagramUrl}
                                      alt="Problem Diagram"
                                      className="max-h-32 mx-auto object-contain rounded-lg shadow"
                                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                    />
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-0.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <input
                                    type="text"
                                    value={question.diagramUrl || ""}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[activeSectionIdx].codingQuestions[slotIdx].diagramUrl = e.target.value;
                                      setSections(updated);
                                    }}
                                    placeholder="Diagram / Image URL (optional)..."
                                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] font-mono focus:outline-none focus:border-cyan-500"
                                  />
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    {question.testCases?.length || 0} Test Cases
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    Max: {question.marks || 10} pts
                                  </span>
                                  <span className="text-emerald-400 font-semibold">
                                    Starter Code: Clean Boilerplate (No Solution) ✓
                                  </span>
                                </div>
                              </div>
                            ) : (
                              /* If Question is not yet fetched: Render dedicated link input & AI generator for this slot */
                              <div className="space-y-3 pt-1">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    type="text"
                                    value={linkVal}
                                    onChange={(e) =>
                                      setSlotLinkInputs((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    placeholder={`Paste Question #${slotIdx + 1} link (e.g. https://leetcode.com/problems/...)`}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none font-mono"
                                  />

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isParsing || isGenerating}
                                      onClick={() => handleParseCodingLinkForSlot(activeSectionIdx, slotIdx)}
                                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                      {isParsing ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Fetching #{slotIdx + 1}...</span>
                                        </>
                                      ) : (
                                        <>
                                          <LinkIcon className="w-3.5 h-3.5" />
                                          <span>Fetch Problem #{slotIdx + 1}</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isParsing || isGenerating}
                                      onClick={() => handleGenerateAiCodingForSlot(activeSectionIdx, slotIdx)}
                                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                      title={`Generate Challenge #${slotIdx + 1} using AI`}
                                    >
                                      {isGenerating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                      )}
                                      <span className="hidden sm:inline">AI Generate</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 4: TARGET AUDIENCE & PROCTORING INTEGRITY (ASKED AT LAST)
              ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <div className="space-y-6">
              {/* Target Audience Prompt */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Conduct Test To (Target Audience)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose whether this test is for all students, your assigned mentees, or selected students.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetAudience("all")}
                    className={`p-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 cursor-pointer ${
                      targetAudience === "all"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span>All Students</span>
                    <span className="text-[10px] text-slate-500 font-normal">Entire Campus Cohort</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience("mentees")}
                    className={`p-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 cursor-pointer ${
                      targetAudience === "mentees"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Award className="w-5 h-5 text-purple-400" />
                    <span>My Mentees</span>
                    <span className="text-[10px] text-slate-500 font-normal">Assigned Mentee Roster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience("selected")}
                    className={`p-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 cursor-pointer ${
                      targetAudience === "selected"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span>Select Students</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} Selected` : "Custom Roster"}
                    </span>
                  </button>
                </div>

                {/* Selected Students Roster Filter */}
                {targetAudience === "selected" && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student by name, register number, department..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {studentsRoster
                        .filter(
                          (st) =>
                            st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            st.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            (st.targetRole || "").toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((st) => {
                          const isSelected = selectedStudentIds.includes(st._id);
                          return (
                            <div
                              key={st._id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedStudentIds(selectedStudentIds.filter((id) => id !== st._id));
                                } else {
                                  setSelectedStudentIds([...selectedStudentIds, st._id]);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                                isSelected
                                  ? "bg-indigo-600/20 border-indigo-500 text-white"
                                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <div>
                                <span className="font-bold text-white">{st.name}</span>
                                <span className="text-[11px] text-slate-400 ml-2">
                                  {st.email} • {st.targetRole || "Student"}
                                </span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Proctoring Settings */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Proctoring & Anti-Cheat Controls</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-white">Camera & Eye Gaze Tracking</span>
                    <input
                      type="checkbox"
                      checked={webcamRequired}
                      onChange={(e) => setWebcamRequired(e.target.checked)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-white">Fullscreen Lock Enforcement</span>
                    <input
                      type="checkbox"
                      checked={fullscreenEnforced}
                      onChange={(e) => setFullscreenEnforced(e.target.checked)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-white">Disable Copy/Paste</span>
                    <input
                      type="checkbox"
                      checked={copyPasteDisabled}
                      onChange={(e) => setCopyPasteDisabled(e.target.checked)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Tab Switch Violation Limit</span>
                    <select
                      value={tabSwitchLimit}
                      onChange={(e) => setTabSwitchLimit(Number(e.target.value))}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value={1}>1 switch (Strict)</option>
                      <option value={3}>3 switches (Standard)</option>
                      <option value={5}>5 switches (Relaxed)</option>
                    </select>
                  </div>

                  <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">Allow Retakes</span>
                      <span className="text-[10px] text-slate-400">
                        {allowRetakes ? "Students can retake this exam" : "Single attempt only (Retakes blocked)"}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowRetakes}
                      onChange={(e) => setAllowRetakes(e.target.checked)}
                      className="accent-indigo-600 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 5: REVIEW & PUBLISH
              ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Review Assessment Architecture</h3>
                <p className="text-xs text-slate-400">
                  Verify section breakdown and proctoring parameters prior to publishing
                </p>
              </div>

              {/* Assessment Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {examType.toUpperCase()} ASSESSMENT
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1">{title || "Untitled Assessment"}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{durationMinutes} mins total</span>
                </div>

                {/* Section Table */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Section Breakdown</span>
                  <div className="space-y-2">
                    {sections.map((sec, idx) => {
                      const count = sec.type === "mcq" ? sec.mcqQuestions.length : sec.codingQuestions.length;
                      return (
                        <div
                          key={sec.sectionId}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white">{sec.title}</span>
                            <span className="text-slate-400 text-[11px] block mt-0.5">
                              Topics: {sec.topics.join(", ")} • Hardness: {sec.difficulty}
                            </span>
                          </div>
                          <span className="font-bold text-indigo-400 font-mono">
                            {count} {sec.type === "mcq" ? "MCQs" : "Challenges"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Audience & Marks Disclosure Info */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase">Target Audience</span>
                    <strong className="text-white capitalize mt-0.5 block">{targetAudience} Students</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase">Marks Policy</span>
                    <strong className="text-amber-400 mt-0.5 block">Strictly Concealed (Disclosed upon Admin signoff)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1) as any)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {activeStep < 5 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1) as any)}
              className="btn-gradient px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitExam}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Authoring & Publishing..." : "Publish Assessment"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MANUAL MCQ MODAL ──────────────────────────────────────────────── */}
      {showManualMcqModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold">Author Custom MCQ</h3>
              <button onClick={() => setShowManualMcqModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Question Text *</label>
                <textarea
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  rows={2}
                  placeholder="Enter the question problem statement..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:outline-none"
                />
              </div>

              {/* Diagram / Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Diagram / Image URL (Optional)</span>
                </label>
                <input
                  type="text"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://... (e.g. image link for flowchart, circuit, tree, or graph diagram)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:outline-none font-mono"
                />
                {manualImageUrl.trim() && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 mt-1 text-center">
                    <img
                      src={manualImageUrl}
                      alt="Diagram Preview"
                      className="max-h-36 mx-auto object-contain rounded-lg shadow"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">4 Choices (Select radio for correct answer)</label>
                {manualOptions.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={manualCorrectIdx === oIdx}
                      onChange={() => setManualCorrectIdx(oIdx)}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...manualOptions];
                        next[oIdx] = e.target.value;
                        setManualOptions(next);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Marks</label>
                <input
                  type="number"
                  value={manualMarks}
                  onChange={(e) => setManualMarks(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowManualMcqModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveManualMcq(activeSectionIdx)}
                className="flex-1 btn-gradient py-2 rounded-xl text-xs font-bold text-white"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
