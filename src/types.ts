export interface Semester {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  credits: number;
  grade: string; // "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", or "" (In Progress)
  marks?: number; // Marks/percentage score out of 100
  status: "active" | "completed" | "planned";
}

export interface AcademicTask {
  id: string;
  courseId: string; // Empty string if not linked
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "textbooks" | "tuition" | "rent" | "food" | "social" | "transport" | "subscriptions" | "other";
  date: string; // YYYY-MM-DD
}

export interface BudgetConfig {
  monthlyLimit: number;
  expenses: Expense[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
}

export interface StudentProfile {
  studentName: string;
  studentId: string;
  university: string;
  department: string;
  degree: string;
  semester: string;
  batch: string;
  email: string;
  phone: string;
}

export interface InfoVault {
  studentId: string;
  advisorName: string;
  advisorEmail: string;
  lmsUrl: string;
  libraryUrl: string;
  wifiNetwork: string;
  wifiPassword: string;
  links: QuickLink[];
}

export interface StudyPlanDay {
  day: number;
  focus: string;
  tasks: string[];
  tips: string;
}

export interface AIStudyPlan {
  topic: string;
  durationDays: number;
  intensity: string;
  overview: string;
  days: StudyPlanDay[];
}

export interface AIExplanation {
  title: string;
  concept: string;
  analogy: string;
  takeaways: string[];
  quizQuestion: string;
  quizOptions: string[];
  quizAnswerIndex: number;
  quizExplanation: string;
}

export interface UniGuideResponseData {
  summary: string;
  detailedExplanation: string;
  requiredDocuments: string[];
  steps: string[];
  responsibleOffice: string;
  notesAndWarnings: string[];
  officialSource: string;
  confidence: "Verified Official Documentation" | "Partially Verified" | "Official Confirmation Required";
}

export interface UniGuideMessage {
  id: string;
  sender: "user" | "uniguide";
  text: string;
  timestamp: string;
  attachedNoticeName?: string;
  attachedNoticeContent?: string;
  data?: UniGuideResponseData;
}

export interface Scholarship {
  id: string;
  title: string;
  organization: string;
  type: "Merit-Based" | "Need-Based" | "Research" | "International" | "Government";
  amount: string;
  minCgpa: number;
  eligibleMajors: string[];
  deadline: string;
  description: string;
  requiredDocuments: string[];
  officialUrl: string;
  matchPercentage?: number;
  isSaved?: boolean;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  city?: string;
  country?: string;
  workMode?: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Part-time" | "Remote" | "Summer Internship" | "Graduate Program" | "Contract" | "Freelance";
  industry?: string;
  stipend: string;
  minCgpa?: number;
  requiredSkills: string[];
  targetMajors: string[];
  experienceLevel?: "Student / Intern" | "Fresh Graduate" | "Entry Level" | "Mid Level";
  visaSponsorship?: boolean;
  deadline: string;
  description: string;
  applicationUrl: string;
  matchPercentage?: number;
  matchRationale?: string;
  isSaved?: boolean;
}

export interface CareerProfile {
  major: string;
  targetRole: string;
  cgpa: number;
  skills: string[];
  resumeText?: string;
  resumeScore?: number;
}

export interface OmniMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  intentCategory?: "uniguide" | "academic" | "study" | "scholarship" | "career" | "general";
  suggestedActionModule?: string;
  data?: any;
}
