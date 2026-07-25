import React, { useState, useRef, useEffect } from "react";
import {
  OmniMessage,
  CareerProfile,
  Semester,
  Course,
  AcademicTask,
  BudgetConfig,
  AIStudyPlan,
  FlashcardDeck,
  InfoVault,
  StudentProfile
} from "../types";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  Building2,
  GraduationCap,
  Award,
  Briefcase,
  Wallet,
  BookOpen,
  RefreshCw,
  Compass,
  Filter,
  Globe,
  SlidersHorizontal
} from "lucide-react";

interface GlobalAIAssistantProps {
  activeTab: string;
  onNavigateToTab: (tabKey: any) => void;
  omniMessages: OmniMessage[];
  onSaveOmniMessages: (messages: OmniMessage[]) => void;
  studentProfile?: StudentProfile;
  careerProfile?: CareerProfile;
  semesters?: Semester[];
  courses?: Course[];
  tasks?: AcademicTask[];
  budget?: BudgetConfig;
  savedPlans?: AIStudyPlan[];
  savedDecks?: FlashcardDeck[];
  vault?: InfoVault;
  savedScholarshipIds?: string[];
  savedInternshipIds?: string[];
}

// Helper to render module icons for quick navigation
const getModuleIcon = (moduleKey?: string) => {
  switch (moduleKey) {
    case "uniguide":
      return <Compass className="h-4 w-4 text-white" />;
    case "career":
      return <Briefcase className="h-4 w-4 text-white" />;
    case "scholarships":
      return <Award className="h-4 w-4 text-white" />;
    case "academic":
      return <GraduationCap className="h-4 w-4 text-white" />;
    case "tasks":
      return <BookOpen className="h-4 w-4 text-white" />;
    case "budget":
      return <Wallet className="h-4 w-4 text-white" />;
    case "vault":
      return <Building2 className="h-4 w-4 text-white" />;
    default:
      return <Sparkles className="h-4 w-4 text-white" />;
  }
};

// Helper component to parse and render markdown text with bold elements and lists
const renderInlineFormatted = (str: string) => {
  if (!str) return null;
  // Regex to match **bold** or *italic*
  const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-slate-950 bg-indigo-50/80 text-indigo-950 px-1 py-0.5 rounded border border-indigo-200/50 inline-block">
          {boldContent}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-2 leading-relaxed text-slate-800 text-xs">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Section Headings (e.g. ### Heading or **Heading**)
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const headingText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={lineIdx} className="font-bold text-slate-900 text-xs pt-1 border-b border-slate-100 pb-1">
              {renderInlineFormatted(headingText)}
            </h4>
          );
        }

        // Bullet list item (•, -, or *)
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^(•|-|\*)\s*/, "");
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-indigo-600 font-bold text-xs select-none">•</span>
              <div className="flex-1 text-slate-800 text-xs leading-relaxed">{renderInlineFormatted(bulletContent)}</div>
            </div>
          );
        }

        // Numbered list item like 1. or 2)
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="font-bold text-indigo-700 text-xs min-w-4">{numMatch[1]}.</span>
              <div className="flex-1 text-slate-800 text-xs leading-relaxed">{renderInlineFormatted(numMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-xs text-slate-800 leading-relaxed">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const GlobalAIAssistant: React.FC<GlobalAIAssistantProps> = ({
  activeTab,
  onNavigateToTab,
  omniMessages,
  onSaveOmniMessages,
  studentProfile,
  careerProfile,
  semesters,
  courses,
  tasks,
  budget,
  savedPlans,
  savedDecks,
  vault,
  savedScholarshipIds,
  savedInternshipIds
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state for scholarships/internships/jobs queries
  const [selectedWorkMode, setSelectedWorkMode] = useState<"All" | "Remote" | "Hybrid" | "Onsite">("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All (Pakistan & Global)");
  const [selectedDegree, setSelectedDegree] = useState<string>("Undergraduate");
  const [selectedFunding, setSelectedFunding] = useState<string>("All Funding Types");

  // Compute live calculated CGPA and completed credits from courses
  const GRADE_POINTS_MAP: Record<string, number> = {
    "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.5, "B": 3.0, "B-": 2.7,
    "C+": 2.5, "C": 2.0, "C-": 1.7, "D+": 1.5, "D": 1.0, "F": 0.0
  };
  const completedCourses = (courses || []).filter(c => c.status === "completed" && c.grade && GRADE_POINTS_MAP[c.grade] !== undefined);
  const totalCreditsCompleted = completedCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePoints = completedCourses.reduce((sum, c) => sum + (GRADE_POINTS_MAP[c.grade] * c.credits), 0);
  const calculatedCgpa = totalCreditsCompleted > 0 ? Number((totalGradePoints / totalCreditsCompleted).toFixed(2)) : (careerProfile?.cgpa || 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, omniMessages, isLoading]);

  // Initial greeting if history is empty
  useEffect(() => {
    if (omniMessages.length === 0) {
      const initialWelcome: OmniMessage = {
        id: "omni_welcome",
        sender: "assistant",
        text: "Assalam-o-Alaikum & Welcome! I am your Global AI Assistant for the University Student Hub. I am here to assist you across all academic and professional needs with official guidance from Pakistani Universities and HEC Pakistan, alongside global scholarships and career opportunities in English, Urdu, or Roman Urdu.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intentCategory: "general",
        data: {
          keyTakeaways: [
            "Official Pakistani University & HEC Policy Guidance",
            "Local & Global Scholarships, Internships, and Remote Jobs",
            "Multilingual Assistance in English, Urdu, or Roman Urdu"
          ],
          followUpQuestions: [
            "What is my current calculated CGPA and active assignments?",
            "Mujhe HEC Need-Based scholarship ki eligibility aur procedure batao.",
            "Show me remote software engineering internships matching my skills."
          ]
        }
      };
      onSaveOmniMessages([initialWelcome]);
    }
  }, [omniMessages.length]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend) return;

    const userMsg: OmniMessage = {
      id: "omni_user_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [...omniMessages, userMsg];
    onSaveOmniMessages(updated);
    setInputText("");
    setIsLoading(true);

    // Compute live calculated CGPA and completed credits from courses
    const GRADE_POINTS_MAP: Record<string, number> = {
      "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.5, "B": 3.0, "B-": 2.7,
      "C+": 2.5, "C": 2.0, "C-": 1.7, "D+": 1.5, "D": 1.0, "F": 0.0
    };
    const completedCourses = (courses || []).filter(c => c.status === "completed" && c.grade && GRADE_POINTS_MAP[c.grade] !== undefined);
    const totalCreditsCompleted = completedCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalGradePoints = completedCourses.reduce((sum, c) => sum + (GRADE_POINTS_MAP[c.grade] * c.credits), 0);
    const calculatedCgpa = totalCreditsCompleted > 0 ? Number((totalGradePoints / totalCreditsCompleted).toFixed(2)) : (careerProfile?.cgpa || 0);

    const hubData = {
      studentProfile: studentProfile || null,
      profile: careerProfile || {
        major: "",
        targetRole: "",
        cgpa: calculatedCgpa,
        skills: []
      },
      gpaPlanner: {
        semestersCount: semesters?.length || 0,
        totalCoursesCount: courses?.length || 0,
        calculatedCgpa,
        totalCreditsCompleted,
        completedCourses: completedCourses.map(c => ({ name: c.name, code: c.code, grade: c.grade, credits: c.credits })),
        activeCourses: (courses || []).filter(c => c.status === "active").map(c => ({ name: c.name, code: c.code, credits: c.credits }))
      },
      assignmentTracker: {
        totalTasks: tasks?.length || 0,
        pendingTasks: (tasks || []).filter(t => t.status !== "completed").map(t => ({ title: t.title, dueDate: t.dueDate, priority: t.priority, status: t.status }))
      },
      budgetTracker: {
        monthlyLimit: budget?.monthlyLimit || 0,
        totalExpenses: (budget?.expenses || []).reduce((sum, e) => sum + e.amount, 0),
        recentExpenses: (budget?.expenses || []).slice(-5).map(e => ({ title: e.title, amount: e.amount, category: e.category }))
      },
      campusVault: vault ? {
        studentId: vault.studentId,
        advisorName: vault.advisorName,
        advisorEmail: vault.advisorEmail,
        lmsUrl: vault.lmsUrl,
        libraryUrl: vault.libraryUrl,
        wifiNetwork: vault.wifiNetwork
      } : null,
      studyPlanner: {
        savedPlansCount: savedPlans?.length || 0,
        topics: (savedPlans || []).map(p => p.topic)
      },
      flashcards: {
        decksCount: savedDecks?.length || 0,
        deckNames: (savedDecks || []).map(d => d.name)
      },
      savedScholarshipsCount: savedScholarshipIds?.length || 0,
      savedInternshipsCount: savedInternshipIds?.length || 0
    };

    try {
      const response = await fetch("/api/ai/omni-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          activeTab,
          studentProfile: studentProfile || hubData.studentProfile,
          hubData,
          filters: {
            workMode: selectedWorkMode,
            country: selectedCountry,
            degreeLevel: selectedDegree,
            fundingType: selectedFunding
          },
          history: omniMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          }))
        })
      });

      if (!response.ok) throw new Error("Universal AI Assistant error.");

      const data = await response.json();

      const botMsg: OmniMessage = {
        id: "omni_bot_" + Date.now(),
        sender: "assistant",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intentCategory: data.intentCategory,
        suggestedActionModule: data.suggestedActionModule,
        data: {
          suggestedModuleLabel: data.suggestedModuleLabel,
          keyTakeaways: data.keyTakeaways,
          followUpQuestions: data.followUpQuestions
        }
      };

      onSaveOmniMessages([...updated, botMsg]);
    } catch (err: any) {
      console.error("Omni AI Error:", err);
      const errMsg: OmniMessage = {
        id: "omni_err_" + Date.now(),
        sender: "assistant",
        text: "I experienced a brief connection error. Please verify your GEMINI_API_KEY in Settings > Secrets.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      onSaveOmniMessages([...updated, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleIcon = (moduleKey?: string) => {
    switch (moduleKey) {
      case "scholarships":
        return <Award className="h-4 w-4 text-emerald-600" />;
      case "career":
        return <Briefcase className="h-4 w-4 text-indigo-600" />;
      case "uniguide":
        return <Building2 className="h-4 w-4 text-indigo-600" />;
      case "study_companion":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "academic":
        return <GraduationCap className="h-4 w-4 text-indigo-600" />;
      case "budget":
        return <Wallet className="h-4 w-4 text-emerald-600" />;
      default:
        return <Compass className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-900 hover:scale-105 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-200 border border-indigo-400/40 group"
          title="Open Global AI Assistant"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline">
            Global AI Assistant
          </span>
        </button>
      </div>

      {/* Slide-over Conversation Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[80vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Global AI Assistant
                </h3>
                <p className="text-[10px] text-slate-300">HEC Pakistan & Global Opportunities Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                  showFilters || selectedWorkMode !== "All"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title="Search Filters (Location, Work Mode)"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Filters Drawer Bar */}
          {showFilters && (
            <div className="bg-indigo-950 border-b border-indigo-800/60 p-3 text-white space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[10px] text-indigo-300 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>Personalized Recommendation Filters</span>
                </span>
                <button
                  onClick={() => {
                    setSelectedWorkMode("All");
                    setSelectedCountry("All (Pakistan & Global)");
                    setSelectedDegree("Undergraduate");
                  }}
                  className="hover:underline text-[9px] text-indigo-300"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-300 block mb-0.5">Work Mode</label>
                  <select
                    value={selectedWorkMode}
                    onChange={(e: any) => setSelectedWorkMode(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="All">All Modes</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 block mb-0.5">Target Location</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="All (Pakistan & Global)">Pakistan & Global</option>
                    <option value="Pakistan Only">Pakistan Only</option>
                    <option value="United States / Canada">USA / Canada</option>
                    <option value="United Kingdom / Europe">UK & Europe</option>
                    <option value="Remote Worldwide">Remote Worldwide</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 block mb-0.5">Degree Level</label>
                  <select
                    value={selectedDegree}
                    onChange={(e) => setSelectedDegree(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Undergraduate">Undergraduate / Bachelor's</option>
                    <option value="Master's / MS">Master's / MS</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="Diploma / Trainee">Diploma / Trainee</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 block mb-0.5">Funding / Visa</label>
                  <select
                    value={selectedFunding}
                    onChange={(e) => setSelectedFunding(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="All Funding Types">All Funding Types</option>
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partial / Need-Based">Partial / Need-Based</option>
                    <option value="Visa Sponsorship">Visa Sponsorship</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Connected Live Portal Record Status Bar */}
          <div className="bg-slate-900 border-b border-indigo-900/40 px-3.5 py-2 flex items-center justify-between text-white text-[11px] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="font-semibold truncate text-slate-200">
                {studentProfile?.studentName || "Unconfigured Profile"}
              </span>
              <span className="text-indigo-300 font-mono text-[10px] truncate hidden sm:inline">
                ({studentProfile?.university ? `${studentProfile.university}` : (studentProfile?.degree || "No university set")})
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[10px] text-slate-400">CGPA:</span>
              <span className="font-bold text-amber-400 font-mono">
                {calculatedCgpa > 0 ? calculatedCgpa.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          {/* Messages scroll stage */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {omniMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {msg.sender === "user" ? "You" : "Universal AI"}
                  </span>
                  <span className="text-[9px] text-slate-300 font-mono">{msg.timestamp}</span>
                </div>

                {msg.sender === "user" ? (
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs leading-relaxed shadow-2xs">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 max-w-[95%] shadow-2xs text-xs space-y-3 text-slate-800">
                    <FormattedText text={msg.text} />

                    {/* Action Button to Jump to Module */}
                    {msg.suggestedActionModule && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            onNavigateToTab(msg.suggestedActionModule);
                            setIsOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold py-2.5 px-3.5 rounded-xl transition-all shadow-sm flex items-center justify-between text-xs group cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                              {getModuleIcon(msg.suggestedActionModule)}
                            </span>
                            <span>{msg.data?.suggestedModuleLabel || `Connect to ${msg.suggestedActionModule} Module`}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-lg">
                            <span>Open Module</span>
                            <ArrowRight className="h-3.5 w-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Key Takeaways / Bullet highlights if provided */}
                    {msg.data?.keyTakeaways && msg.data.keyTakeaways.length > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
                        <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                          {msg.data.keyTakeaways.map((point: string, i: number) => (
                            <li key={i}>{renderInlineFormatted(point)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up suggestion chips */}
                    {msg.data?.followUpQuestions && msg.data.followUpQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.data.followUpQuestions.map((fq: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(fq)}
                            className="text-left bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/50 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition flex items-center gap-1"
                          >
                            <span>{fq}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-600">
                <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                <span>AI Assistant is routing and evaluating query...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask anything across university life..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalAIAssistant;
