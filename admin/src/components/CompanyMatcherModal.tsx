import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2,
  X,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  Trophy,
  FileText,
  Mic,
  Code2,
  ExternalLink,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { exportCohortCsvData, type StudentSummary } from "../lib/admin-api";
import { ScoreRing } from "./Score";

interface CompanyMatcherModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [
  {
    name: "Tier-1 Product Tech (Google, Amazon, Microsoft)",
    role: "SDE-1 / SWE",
    minReadiness: 75,
    minAts: 80,
    minInterview: 75,
    minCoding: 150,
    requireProof: false,
    badgeColor: "bg-[rgb(var(--primary-rgb)/20%)] text-[var(--primary)] border-[rgb(var(--primary-rgb)/30%)]",
  },
  {
    name: "Fintech & Quantitative (Goldman Sachs, Morgan Stanley)",
    role: "Software & Quant Engineer",
    minReadiness: 80,
    minAts: 85,
    minInterview: 80,
    minCoding: 200,
    requireProof: false,
    badgeColor: "bg-[rgb(var(--chart-2-rgb)/20%)] text-[var(--chart-2)] border-[rgb(var(--chart-2-rgb)/30%)]",
  },
  {
    name: "High-Growth Unicorn Startups (Swiggy, Razorpay, Zepto)",
    role: "Full-Stack Engineer",
    minReadiness: 70,
    minAts: 75,
    minInterview: 70,
    minCoding: 100,
    requireProof: true,
    badgeColor: "bg-[rgb(var(--warning-rgb)/15%)] text-[var(--warning)] border-[rgb(var(--warning-rgb)/30%)]",
  },
  {
    name: "Global Tech Services (TCS Digital, Accenture, Infosys)",
    role: "Associate Software Engineer",
    minReadiness: 50,
    minAts: 60,
    minInterview: 55,
    minCoding: 40,
    requireProof: false,
    badgeColor: "bg-[rgb(var(--success-rgb)/15%)] text-[var(--success)] border-[rgb(var(--success-rgb)/30%)]",
  },
];

export function CompanyMatcherModal({ open, onClose }: CompanyMatcherModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0);
  const [minReadiness, setMinReadiness] = useState(75);
  const [minAts, setMinAts] = useState(80);
  const [minInterview, setMinInterview] = useState(75);
  const [minCoding, setMinCoding] = useState(150);
  const [requireProof, setRequireProof] = useState(false);
  const [companyName, setCompanyName] = useState("Target Hiring Partner");

  const { data, isLoading } = useQuery({
    queryKey: ["adminCohortCsvExport"],
    queryFn: exportCohortCsvData,
    enabled: open,
  });

  const students: StudentSummary[] = data?.students || [];

  const handleApplyPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setMinReadiness(p.minReadiness);
    setMinAts(p.minAts);
    setMinInterview(p.minInterview);
    setMinCoding(p.minCoding);
    setRequireProof(p.requireProof);
    setCompanyName(p.name.split(" ")[0]);
  };

  const matchedStudents = students.filter((s) => {
    if (s.overallReadiness < minReadiness) return false;
    if (s.resumeScore < minAts) return false;
    if (s.avgInterviewScore < minInterview) return false;
    if (s.totalProblemsSolved < minCoding) return false;
    if (requireProof && s.verifiedEventsCount < 1) return false;
    return true;
  });

  const handleExportRecruiterSheet = () => {
    if (matchedStudents.length === 0) {
      toast.error("No students match the current criteria.");
      return;
    }

    const headers = [
      "Candidate Name",
      "Email Address",
      "Target Role",
      "Overall Readiness %",
      "ATS Resume Score %",
      "Mock Interview Score %",
      "Coding Solved Count",
      "Verified Hackathon Proofs",
      "GitHub Profile",
      "Status",
    ];

    const csvRows = [
      headers.join(","),
      ...matchedStudents.map((s) =>
        [
          `"${s.name.replace(/"/g, '""')}"`,
          `"${s.email}"`,
          `"${s.targetRole}"`,
          s.overallReadiness,
          s.resumeScore,
          s.avgInterviewScore,
          s.totalProblemsSolved,
          s.verifiedEventsCount,
          `"${s.githubUsername ? `https://github.com/${s.githubUsername}` : ""}"`,
          `"${s.status}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Recruiter_Shortlist_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_${matchedStudents.length}_Candidates.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${matchedStudents.length} candidate dossiers for ${companyName}!`);
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[image:var(--glass-strong-bg)] text-[var(--foreground)] border border-[var(--glass-strong-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-[40px] saturate-[180%]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--glass-input-bg)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[rgb(var(--primary-rgb)/15%)] text-[var(--primary)] border border-[rgb(var(--primary-rgb)/30%)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--foreground)] flex items-center gap-2">
                Placement Drive & Corporate Hiring Matcher
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Filter and shortlist candidates based on company placement qualification benchmarks
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--glass-input-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Preset Buttons */}
          <div>
            <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[var(--primary)]" /> Standard Hiring Partner Presets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedPreset === idx
                      ? "bg-[rgb(var(--primary-rgb)/20%)] border-[var(--primary)] text-[var(--foreground)] shadow-lg ring-1 ring-[var(--primary)]"
                      : "bg-[var(--glass-input-bg)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--glass-input-bg-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs leading-snug">{p.name}</span>
                    {selectedPreset === idx && <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                    <span>LC ≥ {p.minCoding}</span>
                    <span>•</span>
                    <span>ATS ≥ {p.minAts}%</span>
                    <span>•</span>
                    <span>Mock ≥ {p.minInterview}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders & Criteria Controls */}
          <div className="p-4 rounded-2xl bg-[var(--glass-input-bg)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--foreground)] flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" /> Fine-Tune Qualification Sliders
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                Matching: <strong className="text-[var(--success)] font-bold text-sm">{matchedStudents.length}</strong> of {students.length} students
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Min Readiness:</span>
                  <span className="font-bold text-[var(--primary)]">{minReadiness}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minReadiness}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setMinReadiness(Number(e.target.value));
                  }}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Min ATS Resume:</span>
                  <span className="font-bold text-[var(--chart-5)]">{minAts}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minAts}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setMinAts(Number(e.target.value));
                  }}
                  className="w-full accent-[var(--chart-5)] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Min Mock Interview:</span>
                  <span className="font-bold text-[var(--chart-2)]">{minInterview}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minInterview}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setMinInterview(Number(e.target.value));
                  }}
                  className="w-full accent-[var(--chart-2)] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Min Coding Solved:</span>
                  <span className="font-bold text-[var(--success)]">{minCoding}+</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={400}
                  step={10}
                  value={minCoding}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setMinCoding(Number(e.target.value));
                  }}
                  className="w-full accent-[var(--success)] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  checked={requireProof}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setRequireProof(e.target.checked);
                  }}
                  className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span>Require at least 1 verified Hackathon / Contest Podium Proof</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[var(--muted-foreground)]">Drive Tag:</span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google Drive 2026"
                  className="px-2.5 py-1 rounded-lg bg-[var(--glass-input-bg)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* Matched Candidates Roster Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                Qualified Candidates ({matchedStudents.length})
              </p>
              {matchedStudents.length > 0 && (
                <button
                  onClick={handleExportRecruiterSheet}
                  className="btn-gradient px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-[rgb(var(--primary-rgb)/20%)]"
                >
                  <Download className="h-3.5 w-3.5" /> Export Recruiter Master Sheet (CSV)
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[var(--muted-foreground)]">Evaluating cohort readiness...</div>
            ) : matchedStudents.length > 0 ? (
              <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--glass-input-bg)] max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[var(--glass-input-bg)] text-[var(--muted-foreground)] font-bold border-b border-[var(--border)] uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-center">Readiness</th>
                      <th className="py-2.5 px-3 text-center">ATS Resume</th>
                      <th className="py-2.5 px-3 text-center">Mock Interview</th>
                      <th className="py-2.5 px-3 text-center">Coding</th>
                      <th className="py-2.5 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {matchedStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-[var(--glass-input-bg-hover)] transition">
                        <td className="py-2.5 px-4 font-bold text-[var(--foreground)]">{s.name}</td>
                        <td className="py-2.5 px-3 text-[var(--muted-foreground)]">{s.targetRole}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[var(--primary)]">{s.overallReadiness}%</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[var(--chart-5)]">{s.resumeScore}%</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[var(--chart-2)]">{s.avgInterviewScore}%</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[var(--success)]">{s.totalProblemsSolved}</td>
                        <td className="py-2.5 px-4 text-right">
                          <Link
                            to={`/students/${s._id}`}
                            onClick={onClose}
                            className="p-1 rounded text-[var(--primary)] hover:text-[var(--foreground)] inline-flex items-center gap-1"
                          >
                            <span>360°</span> <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-[var(--muted-foreground)] bg-[var(--glass-input-bg)] rounded-2xl border border-[var(--border)]">
                No candidates currently meet all threshold criteria. Lower the sliders to widen the candidate pool.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[var(--glass-input-bg)] border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-[var(--muted-foreground)] text-xs">
            Qualified Pool: <strong className="text-[var(--foreground)] font-bold">{matchedStudents.length} candidates</strong>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs">
              Close
            </button>
            <button
              onClick={handleExportRecruiterSheet}
              disabled={matchedStudents.length === 0}
              className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[rgb(var(--primary-rgb)/20%)] disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Download Recruiter CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
