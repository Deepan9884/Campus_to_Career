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
  Calendar,
  Timer,
  Lock,
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
import { QuestionPaperPreviewModal } from "./QuestionPaperPreviewModal";

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

  // ── STEP 4: TARGET AUDIENCE, PROCTORING & SCHEDULING ───────────────────────
  const [targetAudience, setTargetAudience] = useState<"all" | "mentees" | "selected">("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentsRoster, setStudentsRoster] = useState<StudentSummary[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Scheduling Configuration
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");

  // Proctoring Settings
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [fullscreenEnforced, setFullscreenEnforced] = useState(true);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(3);
  const [aiFaceDetection, setAiFaceDetection] = useState(false);
  const [copyPasteDisabled, setCopyPasteDisabled] = useState(false);
  const [allowRetakes, setAllowRetakes] = useState(false);

  // Success & Preview States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewPaperModal, setShowPreviewPaperModal] = useState(false);
  const [createdExamRecord, setCreatedExamRecord] = useState<ExamItem | null>(null);

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

  // Section Topic toggle
  const handleToggleTopic = (secIdx: number, topic: string) => {
    const updated = [...sections];
    const curTopics = updated[secIdx].topics || [];
    if (curTopics.includes(topic)) {
      if (curTopics.length === 1) {
        toast.error("Section must have at least one topic");
        return;
      }
      updated[secIdx].topics = curTopics.filter((t) => t !== topic);
    } else {
      updated[secIdx].topics = [...curTopics, topic];
    }
    setSections(updated);
  };

  // Custom Topic add
  const handleAddCustomTopic = (secIdx: number) => {
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    const updated = [...sections];
    const curTopics = updated[secIdx].topics || [];
    if (!curTopics.includes(trimmed)) {
      updated[secIdx].topics = [...curTopics, trimmed];
      setSections(updated);
      toast.success(`Added topic: "${trimmed}"`);
    }
    setCustomTopicInput("");
  };

  // ── STRICT STEP PROGRESSION VALIDATOR ──────────────────────────────────────
  const validateStep = (fromStep: number): boolean => {
    if (fromStep === 1) {
      if (!examType) {
        toast.error("Please select an Exam Type to proceed.");
        return false;
      }
      return true;
    }
    if (fromStep === 2) {
      if (!title.trim() || title.trim().length < 3) {
        toast.error("Please provide an Exam Title (at least 3 characters).");
        return false;
      }
      if (!durationMinutes || durationMinutes < 5) {
        toast.error("Duration must be at least 5 minutes.");
        return false;
      }
      if (sections.length === 0) {
        toast.error("Please configure at least 1 section.");
        return false;
      }
      for (let i = 0; i < sections.length; i++) {
        if (!sections[i].title.trim()) {
          toast.error(`Section ${i + 1} must have a valid title.`);
          return false;
        }
        if (!sections[i].topics || sections[i].topics.length === 0) {
          toast.error(`Section ${i + 1} ("${sections[i].title}") must have at least 1 topic.`);
          return false;
        }
      }
      return true;
    }
    if (fromStep === 3) {
      if (isGeneratingAi || isParsingLink || parsingSlotKey || generatingSlotKey) {
        toast.error("Please wait for AI generation / link parsing to complete before proceeding.");
        return false;
      }
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.type === "mcq" && (!sec.mcqQuestions || sec.mcqQuestions.length === 0)) {
          toast.error(`Section ${i + 1} ("${sec.title}") has no MCQ questions. Please click "Fetch Questions via AI" or author questions before proceeding.`);
          setActiveSectionIdx(i);
          return false;
        }
        if (sec.type === "coding" && (!sec.codingQuestions || sec.codingQuestions.length === 0)) {
          toast.error(`Section ${i + 1} ("${sec.title}") has no coding challenges. Please import a link or generate questions before proceeding.`);
          setActiveSectionIdx(i);
          return false;
        }
      }
      return true;
    }
    if (fromStep === 4) {
      if (targetAudience === "selected" && selectedStudentIds.length === 0) {
        toast.error("Please select at least 1 student or choose 'All Students'.");
        return false;
      }
      if (isScheduled) {
        if (!scheduledStartTime) {
          toast.error("Please select a Scheduled Start Date & Time.");
          return false;
        }
        if (scheduledEndTime && new Date(scheduledEndTime) <= new Date(scheduledStartTime)) {
          toast.error("Scheduled End Time must be later than the Start Time.");
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (isGeneratingAi) {
      toast.error("AI question generation is in progress. Please wait until questions are generated.");
      return;
    }
    if (targetStep > activeStep) {
      for (let s = activeStep; s < targetStep; s++) {
        if (!validateStep(s)) return;
      }
    }
    setActiveStep(targetStep as any);
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(5, prev + 1) as any);
    }
  };

  const handleSwitchSection = (newIdx: number) => {
    if (isGeneratingAi) {
      toast.error("AI question generation is in progress. Please wait.");
      return;
    }
    const current = sections[activeSectionIdx];
    if (current.type === "mcq" && current.mcqQuestions.length === 0) {
      toast.info(`Note: ${current.title} currently has no questions generated.`);
    }
    setActiveSectionIdx(newIdx);
  };

  // ── AI MCQ GENERATOR ──────────────────────────────────────────────────────
  const handleGenerateAiMcqsForSection = async (secIdx: number) => {
    const sec = sections[secIdx];
    setIsGeneratingAi(true);
    const count = sec.targetQuestionCount || 5;

    try {
      toast.loading(`AI Examiner is generating ${count} ${sec.difficulty} MCQs...`, { id: "ai-mcq-gen" });
      const generated = await generateAiMcqs(
        sec.topics.length > 0 ? sec.topics : ["DSA"],
        sec.difficulty as any,
        count
      );

      const updated = [...sections];
      updated[secIdx].mcqQuestions = generated;
      setSections(updated);
      toast.success(`Generated ${generated.length} MCQs for "${sec.title}"! Review questions below.`, { id: "ai-mcq-gen" });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI MCQs", { id: "ai-mcq-gen" });
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

  // Construct preview exam object
  const previewExamObject: ExamItem = {
    _id: "preview-temp-id",
    title: title.trim() || "Placement Assessment",
    description: description.trim() || "Proctored Institutional Examination",
    examType,
    category,
    difficulty,
    durationMinutes: Number(durationMinutes) || 60,
    passingScorePercentage: Number(passingScorePercentage) || 60,
    totalMarks: sections.reduce((acc, s) => {
      if (s.type === "mcq") {
        return acc + s.mcqQuestions.reduce((qAcc, q) => qAcc + (Number(q.positiveMarks) || 1), 0);
      }
      return acc + s.codingQuestions.reduce((cAcc, c) => cAcc + (Number(c.marks) || 10), 0);
    }, 0) || 100,
    targetAudience,
    sections,
    proctoringConfig: {
      webcamRequired,
      fullscreenEnforced,
      tabSwitchLimit,
      aiFaceDetection,
      copyPasteDisabled,
    },
    isResultDisclosed: false,
    allowRetakes,
    isPublished: true,
    isScheduled,
    scheduledStartTime: isScheduled && scheduledStartTime ? scheduledStartTime : null,
    scheduledEndTime: isScheduled && scheduledEndTime ? scheduledEndTime : null,
    status: isScheduled && scheduledStartTime && new Date(scheduledStartTime) > new Date() ? "scheduled" : "active",
    createdAt: new Date().toISOString(),
  };

  // ── VALIDATE AND SUBMIT FINAL EXAM ────────────────────────────────────────
  const handleSubmitExam = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
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
        isResultDisclosed: false,
        allowRetakes,
        isPublished: true,
        isScheduled: Boolean(isScheduled && scheduledStartTime),
        scheduledStartTime: isScheduled && scheduledStartTime ? scheduledStartTime : null,
        scheduledEndTime: isScheduled && scheduledEndTime ? scheduledEndTime : null,
      };

      const created = await createAdminExam(payload);
      toast.success(
        isScheduled
          ? "Exam scheduled and published successfully!"
          : "Exam authored and published successfully!"
      );
      setCreatedExamRecord(created);
      onSuccess(created);
    } catch (err: any) {
      toast.error(err.message || "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const currentSec = sections[activeSectionIdx] || sections[0];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
        <div className="max-w-4xl w-full bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-100 backdrop-blur-2xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl btn-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Create Proctored Assessment</h2>
                <p className="text-xs text-slate-400">
                  Strict section gating, AI question synthesis, scheduling, and question preview
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

          {/* Step Indicator Bar with Strict Progression Locks */}
          <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
            {[
              { num: 1, label: "1. Exam Type" },
              { num: 2, label: "2. Sections & Topics" },
              { num: 3, label: "3. Sourcing & Links" },
              { num: 4, label: "4. Schedule & Rules" },
              { num: 5, label: "5. Review & Publish" },
            ].map((s) => {
              const isCurrent = activeStep === s.num;
              const isPast = activeStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => handleStepClick(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    isCurrent
                      ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                      : isPast
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80"
                  }`}
                >
                  <span>{s.label}</span>
                  {isPast && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  {!isPast && !isCurrent && <Lock className="h-3 w-3 text-slate-500" />}
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* ══════════════════════════════════════════════════════════════════
                SUCCESS OVERLAY (AFTER PUBLISHING)
                ══════════════════════════════════════════════════════════════════ */}
            {createdExamRecord ? (
              <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                    Assessment Published
                  </span>
                  <h3 className="text-2xl font-black text-white">{createdExamRecord.title}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {createdExamRecord.isScheduled
                      ? `Scheduled to unlock for candidates on ${new Date(
                          createdExamRecord.scheduledStartTime!
                        ).toLocaleString()}`
                      : "Live and active immediately for enrolled students in the Test Arena."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setShowPreviewPaperModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View Question Paper</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    Back to Assessments Console
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ══════════════════════════════════════════════════════════════════
                    STEP 1: SELECT EXAM TYPE (MCQ / CODING / BOTH)
                    ══════════════════════════════════════════════════════════════════ */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-bold text-white">Choose Exam Type</h3>
                      <p className="text-xs text-slate-400">
                        Select the core examination architecture to configure sections and sourcing
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
                            Configure topics, section time limits, and question targets. Synthesize questions via AI with instant visual review.
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
                            Paste problem links from HackerRank/LeetCode or synthesize FAANG-tier coding problems with full test suites.
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
                            Comprehensive placement assessments combining multiple MCQ rounds and hands-on coding challenges in a single proctored test.
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
                            placeholder="e.g. Campus Recruitment: DSA & CS Fundamentals Assessment"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Category</label>
                          <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Super Dream Placement Qualifier"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Total Duration (Mins) *</label>
                          <input
                            type="number"
                            min={5}
                            max={300}
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Passing Score (%) *</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={passingScorePercentage}
                            onChange={(e) => setPassingScorePercentage(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Overall Difficulty</label>
                          <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          >
                            <option value="Easy">Easy (Foundation)</option>
                            <option value="Medium">Medium (Standard Placement)</option>
                            <option value="Hard">Hard (Product/MNC Tier)</option>
                            <option value="FAANG Tier">FAANG Tier (Elite)</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section Count Controls */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Section Architecture ({sections.length})</h4>
                          <p className="text-[11px] text-slate-400">Configure distinct assessment modules and topics</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => handleSetSectionCount(cnt)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                sections.length === cnt
                                  ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-700"
                              }`}
                            >
                              {cnt} {cnt === 1 ? "Section" : "Sections"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sections List */}
                      <div className="space-y-3">
                        {sections.map((sec, idx) => (
                          <div
                            key={sec.sectionId || idx}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={sec.title}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].title = e.target.value;
                                    setSections(updated);
                                  }}
                                  placeholder={`Section ${idx + 1} Title`}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={sec.type}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].type = e.target.value as any;
                                    setSections(updated);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-indigo-300 font-bold"
                                >
                                  <option value="mcq">MCQ Questions</option>
                                  <option value="coding">Coding Arena</option>
                                </select>

                                <select
                                  value={sec.difficulty}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].difficulty = e.target.value as any;
                                    setSections(updated);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                  <option value="faang">FAANG Tier</option>
                                </select>
                              </div>
                            </div>

                            {/* Section Topics Tags */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Selected Topics:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {COMMON_TOPICS.map((topic) => {
                                  const isSelected = (sec.topics || []).includes(topic);
                                  return (
                                    <button
                                      key={topic}
                                      type="button"
                                      onClick={() => handleToggleTopic(idx, topic)}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer ${
                                        isSelected
                                          ? "bg-indigo-600 text-white"
                                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                                      }`}
                                    >
                                      {topic}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
                    STEP 3: QUESTION SOURCING & AI GENERATION GATE
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
                            key={sec.sectionId || idx}
                            onClick={() => handleSwitchSection(idx)}
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

                    {/* AI Generation Loading Shield */}
                    {isGeneratingAi && (
                      <div className="p-8 rounded-3xl bg-indigo-950/50 border-2 border-indigo-500/50 text-center space-y-4 animate-pulse">
                        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/20">
                          <Loader2 className="h-7 w-7 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-extrabold text-white">AI Examiner Generating Questions...</h4>
                          <p className="text-xs text-slate-300 max-w-md mx-auto">
                            Crafting rigorous, technically verified questions with options, marked answer keys, and detailed faculty explanations. Please hold on...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Current Section Sourcing Controls */}
                    {!isGeneratingAi && (
                      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                        {/* Requirements Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">{currentSec.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Target: <strong className="text-indigo-400">{currentSec.targetQuestionCount || 5} questions</strong> • Hardness: <strong className="text-indigo-400">{currentSec.difficulty}</strong> • Topics: {(currentSec.topics || []).join(", ")}
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
                                  Automatically synthesizes {currentSec.targetQuestionCount || 5} {currentSec.difficulty} questions tailored to selected topics with full explanations.
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

                            {/* Fetched Questions List with Full Visual Inspection */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-extrabold uppercase text-slate-300">
                                  Section Questions ({currentSec.mcqQuestions.length})
                                </h5>
                                {currentSec.mcqQuestions.length > 0 && (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Ready for examination
                                  </span>
                                )}
                              </div>

                              {currentSec.mcqQuestions.length === 0 ? (
                                <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                                  <AlertCircle className="h-5 w-5 text-amber-400 mx-auto" />
                                  <p>No questions added yet. Click <strong>"Fetch via AI"</strong> or <strong>"Author Custom MCQ"</strong> to populate this section.</p>
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                  {currentSec.mcqQuestions.map((q, qIdx) => (
                                    <div
                                      key={q.questionId || qIdx}
                                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2.5">
                                          <span className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                                            {qIdx + 1}
                                          </span>
                                          <p className="text-xs font-bold text-white leading-relaxed">
                                            {q.question}
                                          </p>
                                        </div>

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
                                          title="Remove question"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* Options */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        {q.options.map((opt, oIdx) => {
                                          const isCorrect = oIdx === q.correctOptionIndex;
                                          return (
                                            <div
                                              key={oIdx}
                                              className={`px-3 py-1.5 rounded-lg border flex items-center justify-between gap-1.5 ${
                                                isCorrect
                                                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold"
                                                  : "bg-slate-950 border-slate-800 text-slate-400"
                                              }`}
                                            >
                                              <span className="truncate">
                                                {String.fromCharCode(65 + oIdx)}. {opt}
                                              </span>
                                              {isCorrect && (
                                                <span className="text-[9px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                                                  Correct
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Explanation */}
                                      {q.explanation && (
                                        <p className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                                          <strong className="text-indigo-400">Explanation:</strong> {q.explanation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sourcing Actions for Coding */}
                        {currentSec.type === "coding" && (
                          <div className="space-y-4">
                            {/* Slots */}
                            <div className="space-y-3">
                              {Array.from({ length: currentSec.targetQuestionCount || 2 }).map((_, slotIdx) => {
                                const codeQuestion = currentSec.codingQuestions[slotIdx];
                                const slotKey = `${activeSectionIdx}-${slotIdx}`;
                                const isParsing = parsingSlotKey === slotKey;
                                const isGen = generatingSlotKey === slotKey;

                                return (
                                  <div
                                    key={slotIdx}
                                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg btn-gradient text-white font-black text-xs flex items-center justify-center">
                                          #{slotIdx + 1}
                                        </span>
                                        <span className="font-bold text-white text-xs">
                                          Challenge #{slotIdx + 1}
                                        </span>
                                      </div>

                                      {codeQuestion ? (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveCodingSlot(activeSectionIdx, slotIdx)}
                                          className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      ) : null}
                                    </div>

                                    {codeQuestion ? (
                                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <strong className="text-white text-xs font-bold">
                                            {codeQuestion.title}
                                          </strong>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                            {codeQuestion.difficulty}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 line-clamp-2">
                                          {codeQuestion.problemStatement}
                                        </p>
                                        <span className="text-[10px] text-emerald-400 font-bold block">
                                          ✓ {(codeQuestion.testCases || []).length} Test Cases configured
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        {/* Import via Link */}
                                        <div className="space-y-1.5">
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              value={slotLinkInputs[slotKey] || ""}
                                              onChange={(e) =>
                                                setSlotLinkInputs({ ...slotLinkInputs, [slotKey]: e.target.value })
                                              }
                                              placeholder="LeetCode / HackerRank URL"
                                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                                            />
                                            <button
                                              type="button"
                                              disabled={isParsing}
                                              onClick={() => handleParseCodingLinkForSlot(activeSectionIdx, slotIdx)}
                                              className="px-3 py-1.5 rounded-xl btn-gradient text-xs font-bold text-white flex items-center gap-1 shrink-0"
                                            >
                                              {isParsing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Import"}
                                            </button>
                                          </div>
                                        </div>

                                        {/* AI Generate */}
                                        <button
                                          type="button"
                                          disabled={isGen}
                                          onClick={() => handleGenerateAiCodingForSlot(activeSectionIdx, slotIdx)}
                                          className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5"
                                        >
                                          {isGen ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                          )}
                                          <span>Generate AI Challenge</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
                    STEP 4: TARGET AUDIENCE, PROCTORING & SCHEDULING
                    ══════════════════════════════════════════════════════════════════ */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    {/* Assessment Scheduling Window Card */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-white">Assessment Timing & Scheduling</h4>
                            <p className="text-[11px] text-slate-400">Launch immediately or schedule for a specific window</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsScheduled(false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              !isScheduled
                                ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                                : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                          >
                            Launch Immediately
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsScheduled(true)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isScheduled
                                ? "btn-gradient text-white shadow-md shadow-indigo-500/20"
                                : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                          >
                            Schedule Timing
                          </button>
                        </div>
                      </div>

                      {isScheduled && (
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Timer className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Scheduled Start Date & Time *</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={scheduledStartTime}
                              onChange={(e) => setScheduledStartTime(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400 block">
                              Students cannot enter before this timestamp
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Timer className="h-3.5 w-3.5 text-rose-400" />
                              <span>Scheduled End Date & Time (Optional)</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={scheduledEndTime}
                              onChange={(e) => setScheduledEndTime(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400 block">
                              Examination window automatically closes after this timestamp
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Audience */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-400" />
                        <h4 className="text-xs font-extrabold text-white">Target Candidate Cohort</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "all", label: "All Registered Students", desc: "Open to entire student directory" },
                          { id: "mentees", label: "My Mentees Only", desc: "Restricted to your assigned mentees" },
                          { id: "selected", label: "Specific Selected Students", desc: "Manually pick candidates" },
                        ].map((aud) => (
                          <div
                            key={aud.id}
                            onClick={() => setTargetAudience(aud.id as any)}
                            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                              targetAudience === aud.id
                                ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500"
                                : "bg-slate-900 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <span className="font-bold text-white text-xs block">{aud.label}</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{aud.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Selected Students & Batch Picker */}
                      {targetAudience === "selected" && (
                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-xs border border-indigo-500/30">
                                {selectedStudentIds.length} Candidate(s) Selected for this Test Batch
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = studentsRoster.filter((st) => {
                                    const matchesSearch =
                                      !studentSearch ||
                                      st.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                      st.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                      ((st as any).registerNumber && (st as any).registerNumber.toLowerCase().includes(studentSearch.toLowerCase()));
                                    return matchesSearch;
                                  });
                                  const allIds = Array.from(new Set([...selectedStudentIds, ...filtered.map((s) => s._id)]));
                                  setSelectedStudentIds(allIds);
                                  toast.success(`Selected ${filtered.length} candidates`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                Select All Filtered ({studentsRoster.filter((st) => !studentSearch || st.name.toLowerCase().includes(studentSearch.toLowerCase()) || st.email.toLowerCase().includes(studentSearch.toLowerCase())).length})
                              </button>

                              {selectedStudentIds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentIds([])}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 font-bold text-xs transition cursor-pointer"
                                >
                                  Clear Selection
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={studentSearch}
                              onChange={(e) => setStudentSearch(e.target.value)}
                              placeholder="Search candidates by name, email, or register number..."
                              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-800 rounded-2xl p-2.5 bg-slate-900/90">
                            {studentsRoster
                              .filter((st) =>
                                !studentSearch ||
                                st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                st.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                ((st as any).registerNumber && (st as any).registerNumber.toLowerCase().includes(studentSearch.toLowerCase()))
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
                                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition border ${
                                      isSelected
                                        ? "bg-indigo-600/20 border-indigo-500/50 text-white font-bold"
                                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                                        }`}
                                      >
                                        {st.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-white">{st.name}</span>
                                          {(st as any).registerNumber && (
                                            <span className="text-[10px] font-mono text-indigo-300 font-semibold">
                                              ({(st as any).registerNumber})
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 block">{st.email}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {st.targetRole && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                                          {st.targetRole}
                                        </span>
                                      )}
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                          isSelected
                                            ? "bg-indigo-600 border-indigo-500 text-white"
                                            : "border-slate-700 bg-slate-800/50 text-transparent"
                                        }`}
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Proctoring Rules */}
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-xs font-extrabold text-white">Proctoring & Anti-Cheat Protocols</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                          <span>Fullscreen Mode Required</span>
                          <input
                            type="checkbox"
                            checked={fullscreenEnforced}
                            onChange={(e) => setFullscreenEnforced(e.target.checked)}
                            className="accent-indigo-600 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                          <span>Webcam Monitoring</span>
                          <input
                            type="checkbox"
                            checked={webcamRequired}
                            onChange={(e) => setWebcamRequired(e.target.checked)}
                            className="accent-indigo-600 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                          <span>Disable Copy/Paste & Shortcuts</span>
                          <input
                            type="checkbox"
                            checked={copyPasteDisabled}
                            onChange={(e) => setCopyPasteDisabled(e.target.checked)}
                            className="accent-indigo-600 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                          <span>Permit Retakes</span>
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
                    STEP 5: REVIEW, QUESTION PAPER PREVIEW & PUBLISH
                    ══════════════════════════════════════════════════════════════════ */}
                {activeStep === 5 && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {examType.toUpperCase()} ASSESSMENT
                          </span>
                          <h4 className="text-lg font-black text-white mt-1.5">{title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {description || "Placement Readiness & Technical Competency Examination"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPreviewPaperModal(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer shadow"
                        >
                          <BookOpen className="h-4 w-4 text-indigo-400" />
                          <span>Preview Full Question Paper</span>
                        </button>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                          <strong className="text-white">{durationMinutes} mins</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Max Marks</span>
                          <strong className="text-emerald-400">{previewExamObject.totalMarks} Marks</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Passing Score</span>
                          <strong className="text-indigo-300">{passingScorePercentage}%</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                          <strong className="text-amber-300">
                            {isScheduled ? "Scheduled" : "Live Immediately"}
                          </strong>
                        </div>
                      </div>

                      {/* Sections List */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] uppercase font-bold text-slate-400 block">
                          Verified Question Sections ({sections.length})
                        </span>
                        <div className="space-y-2">
                          {sections.map((sec, idx) => {
                            const count =
                              sec.type === "mcq" ? sec.mcqQuestions.length : sec.codingQuestions.length;
                            return (
                              <div
                                key={sec.sectionId || idx}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <strong className="text-white block">{sec.title}</strong>
                                  <span className="text-slate-400 text-[11px]">
                                    Topics: {(sec.topics || []).join(", ")} • Difficulty: {sec.difficulty}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-emerald-400">
                                  {count} {sec.type === "mcq" ? "MCQs" : "Challenges"} Ready
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer Controls */}
          {!createdExamRecord && (
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                type="button"
                disabled={activeStep === 1 || isGeneratingAi}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {activeStep < 5 ? (
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={handleNextStep}
                  className="btn-gradient px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting
                      ? "Publishing Assessment..."
                      : isScheduled
                      ? "Schedule & Publish Assessment"
                      : "Publish Assessment"}
                  </span>
                </button>
              )}
            </div>
          )}
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
                    placeholder="Enter question problem statement..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Diagram / Image URL (Optional)</label>
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono"
                  />
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

      {/* Question Paper Preview Modal */}
      <QuestionPaperPreviewModal
        open={showPreviewPaperModal}
        onClose={() => setShowPreviewPaperModal(false)}
        exam={createdExamRecord || previewExamObject}
      />
    </>
  );
}
