import { useState, useEffect } from "react";
import { Semester, Course, AcademicTask, BudgetConfig, AIStudyPlan, FlashcardDeck, InfoVault, Expense, QuickLink, UniGuideMessage, CareerProfile, OmniMessage, StudentProfile } from "./types";
import GPAPlanner from "./components/GPAPlanner";
import TaskTracker from "./components/TaskTracker";
import BudgetTracker from "./components/BudgetTracker";
import AIStudyCompanion from "./components/AIStudyCompanion";
import CampusVault from "./components/CampusVault";
import UniGuideAI from "./components/UniGuideAI";
import ScholarshipFinder from "./components/ScholarshipFinder";
import InternshipCareerHub from "./components/InternshipCareerHub";
import GlobalAIAssistant from "./components/GlobalAIAssistant";
import AuthModal from "./components/AuthModal";
import LandingPage from "./components/LandingPage";
import FeedbackModal from "./components/FeedbackModal";
import { calculateAcademicStats } from "./utils/academicUtils";
import { 
  auth, 
  onAuthStateChanged, 
  firebaseSignOut, 
  doc, 
  setDoc, 
  onSnapshot, 
  db, 
  User 
} from "./lib/firebase";
import { 
  GraduationCap, 
  CheckSquare, 
  Wallet, 
  Sparkles, 
  Building2,
  FolderLock, 
  RefreshCw, 
  LogOut, 
  CloudCheck, 
  CloudUpload, 
  CloudOff, 
  LogIn,
  Award,
  Briefcase,
  Compass,
  Layers,
  Globe2,
  Mail
} from "lucide-react";

// Empty Default States for Clean Firestore Sync
const EMPTY_STUDENT_PROFILE: StudentProfile = {
  studentName: "",
  studentId: "",
  university: "",
  department: "",
  degree: "",
  semester: "",
  batch: "",
  email: "",
  phone: ""
};

const EMPTY_VAULT: InfoVault = {
  studentId: "",
  advisorName: "",
  advisorEmail: "",
  lmsUrl: "",
  libraryUrl: "",
  wifiNetwork: "",
  wifiPassword: "",
  links: []
};

const EMPTY_BUDGET: BudgetConfig = {
  monthlyLimit: 0,
  expenses: []
};

const EMPTY_CAREER_PROFILE: CareerProfile = {
  major: "",
  targetRole: "",
  cgpa: 0,
  skills: [],
  resumeText: "",
  resumeScore: 0
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"academic" | "tasks" | "budget" | "ai" | "uniguide" | "vault" | "scholarships" | "career">("academic");

  // Global State initialized cleanly with empty profile defaults
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(EMPTY_STUDENT_PROFILE);

  const handleUpdateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...updated }));
  };

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [budget, setBudget] = useState<BudgetConfig>(EMPTY_BUDGET);
  const [savedPlans, setSavedPlans] = useState<AIStudyPlan[]>([]);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>([]);
  const [vault, setVault] = useState<InfoVault>(EMPTY_VAULT);
  const [uniguideMessages, setUniguideMessages] = useState<UniGuideMessage[]>([]);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>([]);
  const [careerProfile, setCareerProfile] = useState<CareerProfile>(EMPTY_CAREER_PROFILE);
  const [omniMessages, setOmniMessages] = useState<OmniMessage[]>([]);

  // Clear any legacy local storage cache on app startup
  useEffect(() => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
  }, []);

  // Hot trigger state to open AI planner with a preset topic from task list
  const [aiTriggerTopic, setAiTriggerTopic] = useState("");

  // Portal Landing Page vs Application Dashboard Mode State
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");

  // Firebase Authentication & Firestore Sync States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "guest" | "error">("guest");

  // Listen to Firebase auth state changes & real-time Firestore synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncStatus("syncing");
        try {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Student",
              photoURL: currentUser.photoURL || "",
              lastLogin: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.error("Failed to update user profile in Firestore:", err);
        }

        // Subscribe to user's academic data document in Firestore
        const dataDocRef = doc(db, "users", currentUser.uid, "data", "academicData");
        const unsubData = onSnapshot(
          dataDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.studentProfile) setStudentProfile(data.studentProfile);
              if (data.semesters) setSemesters(data.semesters);
              if (data.courses) setCourses(data.courses);
              if (data.tasks) setTasks(data.tasks);
              if (data.budget) setBudget(data.budget);
              if (data.savedPlans) setSavedPlans(data.savedPlans);
              if (data.savedDecks) setSavedDecks(data.savedDecks);
              if (data.vault) setVault(data.vault);
              if (data.uniguideMessages) setUniguideMessages(data.uniguideMessages);
              if (data.savedScholarshipIds) setSavedScholarshipIds(data.savedScholarshipIds);
              if (data.savedInternshipIds) setSavedInternshipIds(data.savedInternshipIds);
              if (data.careerProfile) setCareerProfile(data.careerProfile);
              if (data.omniMessages) setOmniMessages(data.omniMessages);
              setSyncStatus("synced");
            } else {
              // Initial empty state document push for newly registered / authenticated user
              const freshDoc = {
                studentProfile: {
                  ...EMPTY_STUDENT_PROFILE,
                  email: currentUser.email || "",
                  studentName: currentUser.displayName || ""
                },
                semesters: [],
                courses: [],
                tasks: [],
                budget: EMPTY_BUDGET,
                savedPlans: [],
                savedDecks: [],
                vault: EMPTY_VAULT,
                uniguideMessages: [],
                savedScholarshipIds: [],
                savedInternshipIds: [],
                careerProfile: EMPTY_CAREER_PROFILE,
                omniMessages: [],
                updatedAt: new Date().toISOString()
              };
              setDoc(dataDocRef, freshDoc);
              setStudentProfile(freshDoc.studentProfile);
              setSyncStatus("synced");
            }
          },
          (err) => {
            console.error("Firestore real-time sync error:", err);
            setSyncStatus("error");
          }
        );

        return () => unsubData();
      } else {
        // Reset state to empty defaults on sign-out
        setStudentProfile(EMPTY_STUDENT_PROFILE);
        setSemesters([]);
        setCourses([]);
        setTasks([]);
        setBudget(EMPTY_BUDGET);
        setSavedPlans([]);
        setSavedDecks([]);
        setVault(EMPTY_VAULT);
        setUniguideMessages([]);
        setSavedScholarshipIds([]);
        setSavedInternshipIds([]);
        setCareerProfile(EMPTY_CAREER_PROFILE);
        setOmniMessages([]);
        setSyncStatus("guest");
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state changes to Firestore when user is authenticated (debounced)
  useEffect(() => {
    if (!user) return;
    setSyncStatus("syncing");
    const dataDocRef = doc(db, "users", user.uid, "data", "academicData");
    const timer = setTimeout(() => {
      setDoc(
        dataDocRef,
        {
          studentProfile,
          semesters,
          courses,
          tasks,
          budget,
          savedPlans,
          savedDecks,
          vault,
          uniguideMessages,
          savedScholarshipIds,
          savedInternshipIds,
          careerProfile,
          omniMessages,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      )
        .then(() => setSyncStatus("synced"))
        .catch((err) => {
          console.error("Firestore write error:", err);
          setSyncStatus("error");
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    studentProfile,
    semesters,
    courses,
    tasks,
    budget,
    savedPlans,
    savedDecks,
    vault,
    uniguideMessages,
    savedScholarshipIds,
    savedInternshipIds,
    careerProfile,
    omniMessages,
    user
  ]);

  const handleToggleSaveScholarship = (id: string) => {
    if (savedScholarshipIds.includes(id)) {
      setSavedScholarshipIds(savedScholarshipIds.filter((sId) => sId !== id));
    } else {
      setSavedScholarshipIds([...savedScholarshipIds, id]);
    }
  };

  const handleToggleSaveInternship = (id: string) => {
    if (savedInternshipIds.includes(id)) {
      setSavedInternshipIds(savedInternshipIds.filter((iId) => iId !== id));
    } else {
      setSavedInternshipIds([...savedInternshipIds, id]);
    }
  };

  // Reset Hub handler - clears profile & data back to empty
  const handleResetHubData = () => {
    if (confirm("Reset the Student Hub? This will clear all your courses, GPA records, expenditures, and custom data.")) {
      setStudentProfile(EMPTY_STUDENT_PROFILE);
      setSemesters([]);
      setCourses([]);
      setTasks([]);
      setBudget(EMPTY_BUDGET);
      setSavedPlans([]);
      setSavedDecks([]);
      setVault(EMPTY_VAULT);
      setUniguideMessages([]);
      setSavedScholarshipIds([]);
      setSavedInternshipIds([]);
      setCareerProfile(EMPTY_CAREER_PROFILE);
      setOmniMessages([]);
      setActiveTab("academic");
      setAiTriggerTopic("");
    }
  };

  // Helper State Mutators
  // Semesters
  const handleAddSemester = (name: string) => {
    const newSem: Semester = { id: "sem_" + Date.now(), name };
    setSemesters([...semesters, newSem]);
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters(semesters.filter((s) => s.id !== id));
    // Cascade delete courses registered in this semester
    setCourses(courses.filter((c) => c.semesterId !== id));
  };

  // Courses
  const handleAddCourse = (newC: Omit<Course, "id">) => {
    const course: Course = { ...newC, id: "course_" + Date.now() };
    setCourses([...courses, course]);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    // Orphan associated tasks
    setTasks(tasks.map((t) => (t.courseId === id ? { ...t, courseId: "" } : t)));
  };

  const handleUpdateCourse = (id: string, updated: Partial<Course>) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  // Tasks
  const handleAddTask = (newT: Omit<AcademicTask, "id">) => {
    const task: AcademicTask = { ...newT, id: "task_" + Date.now() };
    setTasks([...tasks, task]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleUpdateTask = (id: string, updated: Partial<AcademicTask>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  // Budget
  const handleUpdateBudgetLimit = (limit: number) => {
    setBudget({ ...budget, monthlyLimit: limit });
  };

  const handleAddExpense = (newExp: Omit<Expense, "id">) => {
    const expense = { ...newExp, id: "exp_" + Date.now() };
    setBudget({ ...budget, expenses: [...budget.expenses, expense] });
  };

  const handleDeleteExpense = (id: string) => {
    setBudget({ ...budget, expenses: budget.expenses.filter((e) => e.id !== id) });
  };

  // AI Plans
  const handleSavePlan = (plan: AIStudyPlan) => {
    if (savedPlans.some((p) => p.topic.toLowerCase() === plan.topic.toLowerCase())) return;
    setSavedPlans([...savedPlans, plan]);
  };

  const handleDeletePlan = (topic: string) => {
    setSavedPlans(savedPlans.filter((p) => p.topic.toLowerCase() !== topic.toLowerCase()));
  };

  // AI Flashcards
  const handleSaveDeck = (deck: FlashcardDeck) => {
    setSavedDecks([...savedDecks, deck]);
  };

  const handleDeleteDeck = (id: string) => {
    setSavedDecks(savedDecks.filter((d) => d.id !== id));
  };

  // Info Vault
  const handleUpdateVault = (updated: Partial<InfoVault>) => {
    setVault({ ...vault, ...updated });
  };

  const handleAddQuickLink = (link: Omit<QuickLink, "id">) => {
    const quickL = { ...link, id: "ql_" + Date.now() };
    setVault({ ...vault, links: [...vault.links, quickL] });
  };

  const handleDeleteQuickLink = (id: string) => {
    setVault({ ...vault, links: vault.links.filter((l) => l.id !== id) });
  };

  // Trigger from outside helper (Task Tracker card -> AI study companion)
  const triggerStudyPlanner = (topic: string) => {
    setAiTriggerTopic(topic);
    setActiveTab("ai");
  };

  if (viewMode === "landing") {
    return (
      <>
        <LandingPage
          onEnterDashboard={(tab) => {
            if (tab) setActiveTab(tab);
            setViewMode("app");
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          isAuthenticated={!!user}
          userEmail={user?.email}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Top Navigation Banner */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => setViewMode("landing")}
            title="Return to Public Portal Landing Page"
          >
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">University Student Hub</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 uppercase font-mono">
                Academic Portfolio & AI Tutor
              </p>
            </div>
          </div>

          {/* Action Header controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Feedback Button */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              title="Send Feedback directly to aamnanoreen0@gmail.com"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Send Feedback</span>
            </button>
            {/* View Landing Page Toggle Button */}
            <button
              onClick={() => setViewMode("landing")}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              title="View Official Portal Website & AI Showcase"
            >
              <Globe2 className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Portal Website</span>
            </button>
            {/* Sync Status Badge */}
            {user && (
              <>
                {syncStatus === "synced" && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl font-medium">
                    <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Cloud Synced</span>
                  </span>
                )}
                {syncStatus === "syncing" && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1.5 rounded-xl font-medium">
                    <CloudUpload className="h-3.5 w-3.5 text-amber-600 animate-bounce" />
                    <span>Syncing...</span>
                  </span>
                )}
                {syncStatus === "error" && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1.5 rounded-xl font-medium">
                    <CloudOff className="h-3.5 w-3.5 text-rose-600" />
                    <span>Sync Error</span>
                  </span>
                )}
              </>
            )}

            {!user && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/50">
                <CloudOff className="h-3 w-3" /> Guest Mode
              </span>
            )}

            {/* User Account / Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1 pr-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User Avatar"}
                    className="w-7 h-7 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                    {user.displayName || "Student"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => firebaseSignOut(auth)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            <button
              onClick={handleResetHubData}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
              title="Reset helper data to starting templates"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Side menu navigation (Bento-style desktop, organized by Ecosystem Hubs) */}
        <nav className="w-full lg:w-64 shrink-0 flex flex-col space-y-4">
          {/* Academic Hub */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
              <span>Academic Hub</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("academic");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "academic"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>GPA & Academic Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("tasks");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "tasks"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>Assignment Tracker</span>
              </button>
            </div>
          </div>

          {/* AI Learning Hub */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Learning Hub</span>
            </div>
            <button
              onClick={() => {
                setActiveTab("ai");
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                activeTab === "ai"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
              <span>AI Study Companion</span>
            </button>
          </div>

          {/* Opportunities Hub */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>Opportunities Hub</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("scholarships");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left relative ${
                  activeTab === "scholarships"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Award className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Scholarships & Grants</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("career");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "career"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0 text-indigo-600" />
                <span>Internships & Career Hub</span>
              </button>
            </div>
          </div>

          {/* University Services */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>University Services</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("uniguide");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left relative ${
                  activeTab === "uniguide"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0 text-indigo-600" />
                <span>UniGuide AI Helpdesk</span>
                <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-emerald-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab("vault");
                  setAiTriggerTopic("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "vault"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <FolderLock className="h-4 w-4 shrink-0" />
                <span>Campus Info Vault</span>
              </button>
            </div>
          </div>

          {/* Student Life */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-slate-500" />
              <span>Student Life</span>
            </div>
            <button
              onClick={() => {
                setActiveTab("budget");
                setAiTriggerTopic("");
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                activeTab === "budget"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Wallet className="h-4 w-4 shrink-0" />
              <span>Budget & Finances</span>
            </button>
          </div>
        </nav>

        {/* Right Side: Active Workspace Stage */}
        <section id="workspace-stage" className="flex-1 min-w-0">
          {activeTab === "academic" && (
            <GPAPlanner
              studentProfile={studentProfile}
              onUpdateStudentProfile={handleUpdateStudentProfile}
              semesters={semesters}
              courses={courses}
              onAddSemester={handleAddSemester}
              onDeleteSemester={handleDeleteSemester}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
              onUpdateCourse={handleUpdateCourse}
            />
          )}

          {activeTab === "tasks" && (
            <TaskTracker
              tasks={tasks}
              courses={courses}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onGenerateStudyPlanClick={triggerStudyPlanner}
            />
          )}

          {activeTab === "budget" && (
            <BudgetTracker
              budget={budget}
              onUpdateBudgetLimit={handleUpdateBudgetLimit}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === "ai" && (
            <AIStudyCompanion
              initialTopic={aiTriggerTopic}
              savedPlans={savedPlans}
              onSavePlan={handleSavePlan}
              onDeletePlan={handleDeletePlan}
              savedDecks={savedDecks}
              onSaveDeck={handleSaveDeck}
              onDeleteDeck={handleDeleteDeck}
            />
          )}

          {activeTab === "uniguide" && (
            <UniGuideAI
              messages={uniguideMessages}
              onSaveMessages={(newMsgs) => setUniguideMessages(newMsgs)}
            />
          )}

          {activeTab === "vault" && (
            <CampusVault
              profile={studentProfile}
              onUpdateProfile={handleUpdateStudentProfile}
              vault={vault}
              onUpdateVault={handleUpdateVault}
              onAddQuickLink={handleAddQuickLink}
              onDeleteQuickLink={handleDeleteQuickLink}
            />
          )}

          {activeTab === "scholarships" && (() => {
            const academicStats = calculateAcademicStats(courses);
            return (
              <ScholarshipFinder
                studentProfile={studentProfile}
                studentCgpa={academicStats.cgpa}
                totalCredits={academicStats.totalCredits}
                gradedCourseCount={academicStats.gradedCoursesCount}
                savedScholarshipIds={savedScholarshipIds}
                onToggleSaveScholarship={handleToggleSaveScholarship}
                onNavigateToTab={(tabKey) => setActiveTab(tabKey)}
              />
            );
          })()}

          {activeTab === "career" && (() => {
            const academicStats = calculateAcademicStats(courses);
            return (
              <InternshipCareerHub
                studentProfile={studentProfile}
                careerProfile={careerProfile}
                studentCgpa={academicStats.cgpa}
                onUpdateCareerProfile={(updated) => setCareerProfile(updated)}
                savedInternshipIds={savedInternshipIds}
                onToggleSaveInternship={handleToggleSaveInternship}
              />
            );
          })()}
        </section>
      </main>

      {/* Global Universal AI Assistant Floating Trigger & Modal */}
      <GlobalAIAssistant
        studentProfile={studentProfile}
        activeTab={activeTab}
        onNavigateToTab={(tabKey) => setActiveTab(tabKey)}
        omniMessages={omniMessages}
        onSaveOmniMessages={(newMsgs) => setOmniMessages(newMsgs)}
        careerProfile={careerProfile}
        semesters={semesters}
        courses={courses}
        tasks={tasks}
        budget={budget}
        savedPlans={savedPlans}
        savedDecks={savedDecks}
        vault={vault}
        savedScholarshipIds={savedScholarshipIds}
        savedInternshipIds={savedInternshipIds}
      />

      {/* Elegant Footer branding */}
      <footer className="bg-white border-t border-slate-100 py-4 px-4 text-center mt-auto">
        <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
          <span>University Student Hub — Powered by Firebase Authentication & Firestore Realtime Sync.</span>
        </p>
      </footer>

      {/* Firebase Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Gmail Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        defaultEmail={user?.email || studentProfile.email || ""}
        defaultName={user?.displayName || studentProfile.studentName || ""}
      />
    </div>
  );
}
