import { api } from "./api";

export interface StudentSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  targetRole: string;
  githubUsername?: string;
  overallReadiness: number;
  resumeScore: number;
  avgInterviewScore: number;
  totalProblemsSolved: number;
  repoCount: number;
  verifiedEventsCount: number;
  linkedPlatformsCount: number;
  status: "On Track" | "At Risk" | "Top Performer";
  isMyMentee?: boolean;
  lastActive?: string;
}

export interface StudentsListResponse {
  students: StudentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Student360DetailResponse {
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    targetRole: string;
    githubUsername?: string;
    bio?: string;
    createdAt: string;
    assignedMentor?: string;
    isMyMentee?: boolean;
    isProctoringBlocked?: boolean;
    proctoringBlockedAt?: string;
  };
  metrics: {
    overallReadinessPct: number;
    skillGapMatchPct: number;
    resumeScore: number;
    avgInterviewScore: number;
    codingScore: number;
    eventScore: number;
    totalProblemsSolved: number;
    repoCount: number;
    verifiedEventsCount: number;
  };
  resumes: any[];
  interviews: any[];
  codingProfiles: any[];
  repoAnalyses: any[];
  events: any[];
  gapAnalyses: any[];
  roadmaps: any[];
  userSkills: any[];
  activityLogs?: any[];
  quizAttempts?: any[];
  proctoringViolations?: any[];
}

export interface CohortAnalyticsResponse {
  summary: {
    totalStudents: number;
    avgResumeScore: number;
    avgInterviewScore: number;
    totalCodingProblems: number;
    verifiedProofsCount: number;
    completedInterviewsCount: number;
    analyzedResumesCount: number;
    placementFunnel?: {
      placementReady: number;
      developing: number;
      intervention: number;
    };
  };
  topTargetRoles: { role: string; count: number }[];
  topMissingSkills?: { skill: string; count: number }[];
}

export async function getStudentsList(
  page = 1,
  search = "",
  filter = "all",
  limit = 20
): Promise<StudentsListResponse> {
  return api.get<StudentsListResponse>(
    `/admin/students?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&filter=${filter}`
  );
}

export async function getStudent360Detail(studentId: string): Promise<Student360DetailResponse> {
  return api.get<Student360DetailResponse>(`/admin/students/${studentId}`);
}

export async function getCohortAnalytics(scope = "my-mentees"): Promise<CohortAnalyticsResponse> {
  return api.get<CohortAnalyticsResponse>(`/admin/analytics?scope=${scope}`);
}

export async function sendStudentFeedback(
  studentId: string,
  payload: { title?: string; note: string; actionType?: string }
): Promise<{ message: string; notification: any }> {
  return api.post<{ message: string; notification: any }>(`/admin/students/${studentId}/feedback`, payload);
}

export async function addMentee(studentEmail: string): Promise<{ message: string; student: any }> {
  return api.post<{ message: string; student: any }>("/admin/mentees", { studentEmail });
}

export async function removeMentee(studentId: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/admin/mentees/${studentId}`);
}

export async function getMyMentees(): Promise<{ mentees: any[] }> {
  return api.get<{ mentees: any[] }>("/admin/mentees");
}

export async function searchRegisteredStudents(query: string): Promise<{ students: any[] }> {
  return api.get<{ students: any[] }>(`/admin/students/search-registered?query=${encodeURIComponent(query)}`);
}

export async function getMentorProfile(): Promise<any> {
  return api.get<any>("/admin/profile");
}

export async function updateMentorProfile(data: any): Promise<{ message: string; user: any }> {
  return api.patch<{ message: string; user: any }>("/admin/profile", data);
}

export async function changeMentorPassword(data: any): Promise<{ message: string }> {
  return api.post<{ message: string }>("/admin/change-password", data);
}

export async function unblockStudentProctoring(
  studentId: string
): Promise<{ message: string }> {
  return api.post<{ message: string }>(
    `/admin/students/${studentId}/unblock-proctoring`,
    {}
  );
}

export async function getStudentProctoringViolations(
  studentId: string
): Promise<{
  violations: Array<{
    _id: string;
    moduleType: string;
    moduleId: string;
    violationCount: number;
    isBlocked: boolean;
    blockedAt?: string;
    createdAt: string;
    events: Array<{ violationType: string; detectedAt: string }>;
  }>;
}> {
  return api.get(`/admin/students/${studentId}/proctoring-violations`);
}
