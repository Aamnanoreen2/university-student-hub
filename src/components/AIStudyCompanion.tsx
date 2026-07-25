import React, { useState, useEffect } from "react";
import { AIStudyPlan, AIExplanation, FlashcardDeck, Flashcard } from "../types";
import { Sparkles, Brain, GraduationCap, ChevronRight, ChevronLeft, Check, RefreshCw, Bookmark, BookmarkCheck, PlayCircle, Loader2, HelpCircle } from "lucide-react";

interface AIStudyCompanionProps {
  initialTopic?: string; // Optional trigger topic from assignment list
  savedPlans: AIStudyPlan[];
  onSavePlan: (plan: AIStudyPlan) => void;
  onDeletePlan: (topic: string) => void;
  savedDecks: FlashcardDeck[];
  onSaveDeck: (deck: FlashcardDeck) => void;
  onDeleteDeck: (id: string) => void;
}

const LOADING_MESSAGES = [
  "Formulating academic strategies...",
  "Consulting study syllabus guidelines...",
  "Drafting learning schedule timelines...",
  "Synthesizing freshman-friendly analogies...",
  "Formatting study flashcards...",
  "Structuring practice quiz material...",
  "Summoning academic knowledge..."
];

// High-quality local offline generators for Pakistani university students when Gemini API keys aren't set
export const getLocalStudyPlan = (topic: string, durationDays: number, intensity: string): AIStudyPlan => {
  const steps = [
    {
      focus: "Syllabus Review & Core Principles",
      tasks: [
        `Acquire past papers and lecture handouts for "${topic}"`,
        `Map out the marking weightage and primary equations`,
        `Define all core variables, standard boundaries, and core assumptions`
      ],
      tips: "To secure a 4.0 GPA, master the foundational theorems first before jumping into sample problems."
    },
    {
      focus: "Derivations, Proofs & Numerical Practice",
      tasks: [
        `Write down step-by-step mathematical proofs for "${topic}" equations`,
        `Solve 5 diagnostic and midterm level problems from past exam papers`,
        `Discuss standard edge cases during virtual group discussions or tutorial slots`
      ],
      tips: "Practice without a calculator first to build quick mathematical instincts for exam conditions."
    },
    {
      focus: "Past-Paper Simulations & Speed Runs",
      tasks: [
        `Tackle past final exam questions on "${topic}" under strict 45-minute timed sessions`,
        `Review answer keys and pinpoint exactly where decimal or analytical errors occur`,
        `Compile a 1-page condensed cheat sheet focusing purely on tricky rules and exceptions`
      ],
      tips: "Many Pakistani universities emphasize speed and accuracy. Time yourself on each past paper question."
    },
    {
      focus: "Peer Teaching & Memory Consolidation",
      tasks: [
        `Conduct a peer-tutoring session or explain the concept of "${topic}" out loud in your own words`,
        `Complete a full high-yield mock assessment sheet based on previous semester exams`,
        `Get a good night's sleep to optimize long-term cognitive memory retention`
      ],
      tips: "If you can explain it simply to a non-technical classmate, you have truly mastered the concept. Best of luck!"
    }
  ];

  const days = Array.from({ length: durationDays }, (_, i) => {
    const stepIdx = Math.min(Math.floor((i / durationDays) * steps.length), steps.length - 1);
    const baseStep = steps[stepIdx];
    return {
      day: i + 1,
      focus: `${baseStep.focus} - Session ${i + 1}`,
      tasks: [
        ...baseStep.tasks.map(t => `${t} (Part ${Math.floor(i % 2) + 1})`),
        `Review previous day's notes on "${topic}" for 10 minutes`
      ],
      tips: baseStep.tips
    };
  });

  return {
    topic: topic || "University Course Prep",
    durationDays,
    intensity,
    overview: `This structured academic plan for "${topic}" has been generated to guide you step-by-step through first-year midterm and final examinations.`,
    days
  };
};

export const getLocalFlashcards = (topic: string, count: number) => {
  const baseCards = [
    {
      front: `In Pakistani university grading, what marks percentage secures a perfect 4.0 GPA?`,
      back: `An aggregate score of 80% or above (typically mapped to grade 'A' or 'A+') yields a 4.0 Grade Point.`
    },
    {
      front: `What is the most high-yield practice method for mastering "${topic}"?`,
      back: `Solving 5-10 years of university past papers (e.g., from NUST, FAST, PU, or your specific board) to understand recurring question patterns.`
    },
    {
      front: `What common mistake should you avoid when analyzing "${topic}" on paper?`,
      back: `Skipping step-by-step working. Many engineering and science departments award partial marks for correct formulas and calculations even if the final answer contains an arithmetic slip!`
    },
    {
      front: `How does "${topic}" typically connect to intermediate (FSc / A-Levels) fundamentals?`,
      back: `It extends core concepts of calculus, basic mechanics, or basic programming to multi-variable, applied industrial scenarios.`
    },
    {
      front: `What is a great active recall strategy for studying "${topic}"?`,
      back: `The Feynman Technique: teach the core mechanism to a peer, locate any gaps in your explanation, and refer back to textbooks to solidify them.`
    }
  ];

  return {
    cards: Array.from({ length: count }, (_, i) => {
      const base = baseCards[i % baseCards.length];
      return {
        front: base.front.replace(`"${topic}"`, `"${topic || 'this subject'}"`),
        back: base.back.replace(`"${topic}"`, `"${topic || 'this subject'}"`)
      };
    })
  };
};

export const getLocalExplanation = (topic: string, mode: string): AIExplanation => {
  const isFreshman = mode === "explain_like_freshman";
  return {
    title: `Exploring "${topic || 'Academic Concepts'}"`,
    concept: isFreshman
      ? `Think of "${topic || 'this concept'}" like registering for classes on the portal: it has clear rules, a set of prerequisites, and requires optimal timing. In simple terms, it describes how a system takes inputs, distributes resources, and outputs a balanced result. Focus on the core relationship instead of memorizing complex formulas straight away!`
      : `An advanced analytical review of "${topic || 'this topic'}". We analyze the primary mathematical formulations, standard boundary equations, and coordinate system constraints. In Pakistani university examinations, you must ensure that all constants are fully defined and dimensional checks are executed first to guarantee full marks.`,
    analogy: `It operates like a campus canteen line during lunch hours: the serving rate must perfectly balance the arrival rate to prevent infinite queues, representing standard equilibrium constraints.`,
    takeaways: [
      "Rule 1: Always check boundary values and coordinate axes before starting solutions.",
      "Rule 2: Marks >= 80% gives a perfect 4.0 GPA, so aim for full intermediate steps.",
      "Rule 3: Master at least three past-paper questions to confidently handle exam variants."
    ],
    quizQuestion: `Under standard exam conditions for "${topic || 'this subject'}", what is the most high-yield strategy for securing full marks?`,
    quizOptions: [
      "Detailing clear step-by-step mathematical working rather than just writing the final answer.",
      "Copying the question twice to fill up the sheet.",
      "Guessing the final value without showing formula definitions.",
      "Leaving the numerical proof blank and hoping for grace marks."
    ],
    quizAnswerIndex: 0,
    quizExplanation: "Excellent choice! University grading criteria award substantial partial marks for formulas, derivations, and intermediate steps. Presenting clean, legible steps is the safest path to a 4.0 GPA."
  };
};

export default function AIStudyCompanion({
  initialTopic = "",
  savedPlans,
  onSavePlan,
  onDeletePlan,
  savedDecks,
  onSaveDeck,
  onDeleteDeck,
}: AIStudyCompanionProps) {
  const [activeSubTab, setActiveSubTab] = useState<"planner" | "flashcards" | "explainer">("planner");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Planner States
  const [planTopic, setPlanTopic] = useState(initialTopic);
  const [duration, setDuration] = useState(7);
  const [intensity, setIntensity] = useState("moderate");
  const [activePlan, setActivePlan] = useState<AIStudyPlan | null>(null);
  const [selectedSavedPlan, setSelectedSavedPlan] = useState<AIStudyPlan | null>(null);

  // Flashcards Generator States
  const [deckTopic, setDeckTopic] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cardCount, setCardCount] = useState(6);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [selectedSavedDeck, setSelectedSavedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Explainer States
  const [explainTopic, setExplainTopic] = useState("");
  const [explainMode, setExplainMode] = useState("explain_like_freshman");
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Trigger from outside topic
  useEffect(() => {
    if (initialTopic) {
      setPlanTopic(initialTopic);
      setActiveSubTab("planner");
    }
  }, [initialTopic]);

  // Rotate loading message
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // 1. Trigger generate study plan
  const generateStudyPlan = async () => {
    if (!planTopic.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setActivePlan(null);
    setSelectedSavedPlan(null);

    try {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: planTopic.trim(),
          durationDays: duration,
          intensity,
        }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate study plan";
        try {
          const errorData = await response.json();
          if (errorData?.error) errMessage = errorData.error;
        } catch {
          // fallback on default message if non-json error
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      setActivePlan(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please check your Gemini API configuration.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger generate flashcards
  const generateFlashcards = async () => {
    if (!deckTopic.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setActiveDeck(null);
    setSelectedSavedDeck(null);
    setCurrentCardIdx(0);
    setCardFlipped(false);

    try {
      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: deckTopic.trim(),
          count: cardCount,
        }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate flashcards";
        try {
          const errorData = await response.json();
          if (errorData?.error) errMessage = errorData.error;
        } catch {
          // fallback on default message if non-json error
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      // Transform data into correct deck shape
      const newDeck: FlashcardDeck = {
        id: "deck_" + Date.now(),
        name: deckName.trim() || `Study: ${deckTopic.substring(0, 20)}`,
        topic: deckTopic.trim(),
        cards: data.cards.map((c: any, index: number) => ({
          id: `card_${index}_${Date.now()}`,
          front: c.front,
          back: c.back,
        })),
        createdAt: new Date().toLocaleDateString(),
      };
      setActiveDeck(newDeck);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate flashcards. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Trigger explanation
  const generateExplanation = async () => {
    if (!explainTopic.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setExplanation(null);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: explainTopic.trim(),
          mode: explainMode,
        }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate explanation";
        try {
          const errorData = await response.json();
          if (errorData?.error) errMessage = errorData.error;
        } catch {
          // fallback on default message if non-json error
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      setExplanation(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch concept explanation. Verify server availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithDemoMode = () => {
    setErrorMsg("");
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      try {
        if (activeSubTab === "planner") {
          const topic = planTopic.trim() || "Calculus Midterm Prep";
          const demoPlan = getLocalStudyPlan(topic, duration, intensity);
          setActivePlan(demoPlan);
        } else if (activeSubTab === "flashcards") {
          const topic = deckTopic.trim() || "Computer Science";
          const demoCards = getLocalFlashcards(topic, cardCount);
          const newDeck: FlashcardDeck = {
            id: "deck_" + Date.now(),
            name: deckName.trim() || `Demo: ${topic.substring(0, 20)}`,
            topic,
            cards: demoCards.cards.map((c, index) => ({
              id: `card_${index}_${Date.now()}`,
              front: c.front,
              back: c.back,
            })),
            createdAt: new Date().toLocaleDateString(),
          };
          setActiveDeck(newDeck);
        } else if (activeSubTab === "explainer") {
          const topic = explainTopic.trim() || "Physics Concepts";
          const demoExplanation = getLocalExplanation(topic, explainMode);
          setExplanation(demoExplanation);
          setSelectedQuizOption(null);
          setQuizSubmitted(false);
        }
      } catch (err: any) {
        setErrorMsg("Failed to run local Sandbox generator: " + err.message);
      }
    }, 1000);
  };

  const handleSaveActivePlan = () => {
    if (activePlan) {
      onSavePlan(activePlan);
    }
  };

  const handleSaveActiveDeck = () => {
    if (activeDeck) {
      onSaveDeck(activeDeck);
      setSelectedSavedDeck(activeDeck);
      setActiveDeck(null);
    }
  };

  const activePlanIsSaved = activePlan && savedPlans.some((p) => p.topic.toLowerCase() === activePlan.topic.toLowerCase());

  return (
    <div className="space-y-6">
      {/* AI Companion Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex space-x-1">
        <button
          onClick={() => {
            setActiveSubTab("planner");
            setErrorMsg("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
            activeSubTab === "planner"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="h-4.5 w-4.5" />
          Study Planner
        </button>

        <button
          onClick={() => {
            setActiveSubTab("flashcards");
            setErrorMsg("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
            activeSubTab === "flashcards"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Brain className="h-4.5 w-4.5" />
          Flashcard Decks
        </button>

        <button
          onClick={() => {
            setActiveSubTab("explainer");
            setErrorMsg("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
            activeSubTab === "explainer"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-4.5 w-4.5" />
          Freshman Explainer
        </button>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-2xl text-sm flex flex-col gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Gemini AI Offline / Key Configuration Needed</p>
              <p className="text-xs text-amber-800 mt-1">
                {errorMsg}
              </p>
              <div className="text-xs text-slate-500 mt-2 bg-white/70 p-3 rounded-lg border border-amber-100 leading-relaxed">
                <strong>How to fix:</strong> Click the <strong>Settings</strong> button at the top-right of your AI Studio screen, select <strong>Secrets</strong>, add your <code>GEMINI_API_KEY</code>, and click save.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-amber-200/50 pt-3 items-center justify-between">
            <button
              onClick={handleGenerateWithDemoMode}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Generate with Sandbox Mode (Instant Demo)
            </button>
            <button
              onClick={() => setErrorMsg("")}
              className="text-amber-700 hover:text-amber-950 font-bold text-xs py-2 px-3"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="bg-white border border-indigo-100 rounded-3xl p-12 text-center shadow-lg flex flex-col items-center justify-center min-h-[350px] animate-pulse">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Generating Study Assistant Assets</h3>
          <p className="text-sm text-indigo-500 font-semibold mt-1.5">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          <p className="text-xs text-slate-400 mt-4 max-w-xs">
            Using Google Gemini-3.5-flash to custom build real academic plans and tutoring guides.
          </p>
        </div>
      )}

      {/* MAIN TOOL VIEWS */}
      {!loading && (
        <div>
          {/* ==================== 1. PLANNER SUBTAB ==================== */}
          {activeSubTab === "planner" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls Column */}
              <div className="space-y-6 lg:col-span-1">
                {/* Plan Input form */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-3.5">Configure Study Plan</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Topic / Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Calculus: Integration by parts"
                        value={planTopic}
                        onChange={(e) => setPlanTopic(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Duration (Days)</label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          {[3, 5, 7, 10, 14].map((d) => (
                            <option key={d} value={d}>
                              {d} Days Plan
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Intensity</label>
                        <select
                          value={intensity}
                          onChange={(e) => setIntensity(e.target.value)}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="light">Light Pace</option>
                          <option value="moderate">Moderate</option>
                          <option value="deep_dive">Deep Dive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={generateStudyPlan}
                        disabled={!planTopic.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Build Plan with Gemini
                      </button>
                      <button
                        onClick={handleGenerateWithDemoMode}
                        disabled={!planTopic.trim()}
                        className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="h-3.5 w-3.5 text-slate-500" />
                        Generate with Sandbox Mode (Demo)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saved plans list */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Saved Academic Plans</h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {savedPlans.map((plan) => (
                      <div
                        key={plan.topic}
                        onClick={() => {
                          setSelectedSavedPlan(plan);
                          setActivePlan(null);
                        }}
                        className={`p-3 rounded-xl cursor-pointer border text-left transition flex justify-between items-center ${
                          selectedSavedPlan?.topic === plan.topic
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-800"
                            : "bg-slate-50 border-transparent hover:bg-slate-100/50 text-slate-600"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-xs truncate capitalize">{plan.topic}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {plan.durationDays} Days • {plan.intensity}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete the study plan for "${plan.topic}"?`)) {
                              onDeletePlan(plan.topic);
                              if (selectedSavedPlan?.topic === plan.topic) {
                                setSelectedSavedPlan(null);
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 transition p-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                    {savedPlans.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No saved schedules yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* View Column */}
              <div className="lg:col-span-2">
                {/* Active Plan rendering */}
                {(activePlan || selectedSavedPlan) ? (
                  (() => {
                    const plan = activePlan || selectedSavedPlan!;
                    return (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-50 pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                              AI Study Guide
                            </span>
                            <h2 className="text-xl font-bold text-slate-800 mt-1 capitalize">{plan.topic}</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Paced for {plan.durationDays} days at a {plan.intensity} learning pace
                            </p>
                          </div>
                          {activePlan && (
                            <button
                              onClick={handleSaveActivePlan}
                              disabled={activePlanIsSaved}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                                activePlanIsSaved
                                  ? "bg-slate-50 border-slate-200 text-emerald-600"
                                  : "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              {activePlanIsSaved ? (
                                <>
                                  <BookmarkCheck className="h-3.5 w-3.5" /> Saved
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-3.5 w-3.5" /> Keep Plan
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Plan Overview */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Overview & Goal</p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed italic">"{plan.overview}"</p>
                        </div>

                        {/* Day by Day schedule */}
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                          {plan.days.map((d) => (
                            <div key={d.day} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded">
                                  Day {d.day}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800">{d.focus}</h4>
                              </div>

                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tasks:</p>
                                <ul className="space-y-1.5">
                                  {d.tasks.map((task, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{task}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-amber-50/30 border-l-2 border-amber-400 p-2.5 rounded-r-lg mt-3">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pro Tip:</p>
                                <p className="text-xs text-slate-600 mt-0.5">{d.tips}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <GraduationCap className="h-14 w-14 text-slate-200 mb-3" />
                    <h3 className="text-base font-bold text-slate-600">No Study Schedule Generated</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Configure a subject topic or exam title on the left, then click "Build Plan" to generate a customized curriculum calendar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 2. FLASHCARDS SUBTAB ==================== */}
          {activeSubTab === "flashcards" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deck Management column */}
              <div className="space-y-6 lg:col-span-1">
                {/* Generate form */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-3.5">AI Flashcard Generator</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Deck Topic</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mitosis Phases"
                        value={deckTopic}
                        onChange={(e) => setDeckTopic(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Deck Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Biology Exam prep"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Number of Cards</label>
                      <select
                        value={cardCount}
                        onChange={(e) => setCardCount(Number(e.target.value))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {[4, 6, 8, 10, 12].map((num) => (
                          <option key={num} value={num}>
                            {num} Cards Deck
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={generateFlashcards}
                        disabled={!deckTopic.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Create Deck via Gemini
                      </button>
                      <button
                        onClick={handleGenerateWithDemoMode}
                        disabled={!deckTopic.trim()}
                        className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="h-3.5 w-3.5 text-slate-500" />
                        Create with Sandbox Mode (Demo)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saved decks list */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Saved Study Decks</h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {savedDecks.map((deck) => (
                      <div
                        key={deck.id}
                        onClick={() => {
                          setSelectedSavedDeck(deck);
                          setActiveDeck(null);
                          setCurrentCardIdx(0);
                          setCardFlipped(false);
                        }}
                        className={`p-3 rounded-xl cursor-pointer border text-left transition flex justify-between items-center ${
                          selectedSavedDeck?.id === deck.id
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-800"
                            : "bg-slate-50 border-transparent hover:bg-slate-100/50 text-slate-600"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-xs truncate capitalize">{deck.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {deck.cards.length} Cards • Created {deck.createdAt}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
                              onDeleteDeck(deck.id);
                              if (selectedSavedDeck?.id === deck.id) {
                                setSelectedSavedDeck(null);
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 transition p-1"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {savedDecks.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No flashcard decks yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Viewer column */}
              <div className="lg:col-span-2">
                {(activeDeck || selectedSavedDeck) ? (
                  (() => {
                    const deck = activeDeck || selectedSavedDeck!;
                    const currentCard = deck.cards[currentCardIdx];
                    if (!currentCard) return null;

                    return (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
                        {/* Deck Header */}
                        <div className="flex justify-between items-start border-b border-slate-50 pb-3 mb-6">
                          <div>
                            <h2 className="text-base font-bold text-slate-800 capitalize">{deck.name}</h2>
                            <p className="text-xs text-slate-400 font-medium">Topic: {deck.topic}</p>
                          </div>
                          {activeDeck && (
                            <button
                              onClick={handleSaveActiveDeck}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-100 transition"
                            >
                              <Bookmark className="h-3.5 w-3.5" /> Save Deck
                            </button>
                          )}
                        </div>

                        {/* Flip Card Stage */}
                        <div className="flex-1 flex flex-col justify-center py-4">
                          <div
                            onClick={() => setCardFlipped(!cardFlipped)}
                            className={`min-h-[200px] border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-sm relative ${
                              cardFlipped
                                ? "bg-indigo-900 border-indigo-950 text-white shadow-indigo-100/30"
                                : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/50"
                            }`}
                          >
                            <span className="absolute top-3 left-4 text-[10px] font-bold font-mono tracking-wider opacity-60 uppercase">
                              {cardFlipped ? "Back / Explanation" : "Front / Concept"}
                            </span>

                            <span className="absolute top-3 right-4 text-[10px] font-mono tracking-wider opacity-60">
                              Card {currentCardIdx + 1} of {deck.cards.length}
                            </span>

                            <div className="px-4 max-w-lg">
                              {cardFlipped ? (
                                <p className="text-base font-medium leading-relaxed font-sans">{currentCard.back}</p>
                              ) : (
                                <p className="text-lg font-bold leading-relaxed">{currentCard.front}</p>
                              )}
                            </div>

                            <div className="absolute bottom-3 text-xs opacity-50 flex items-center gap-1">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                              Click card to flip
                            </div>
                          </div>
                        </div>

                        {/* Controls & Progress bar */}
                        <div className="mt-6 border-t border-slate-50 pt-4 space-y-4">
                          {/* Progress indicators */}
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Study progress</span>
                            <span>{Math.round(((currentCardIdx + 1) / deck.cards.length) * 100)}% complete</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full transition-all duration-200"
                              style={{ width: `${((currentCardIdx + 1) / deck.cards.length) * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <button
                              disabled={currentCardIdx === 0}
                              onClick={() => {
                                setCurrentCardIdx(currentCardIdx - 1);
                                setCardFlipped(false);
                              }}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40 flex items-center"
                            >
                              <ChevronLeft className="h-4 w-4" /> Prev Card
                            </button>

                            <button
                              onClick={() => setCardFlipped(!cardFlipped)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition"
                            >
                              Flip Card
                            </button>

                            <button
                              disabled={currentCardIdx === deck.cards.length - 1}
                              onClick={() => {
                                setCurrentCardIdx(currentCardIdx + 1);
                                setCardFlipped(false);
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 flex items-center"
                            >
                              Next Card <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <Brain className="h-14 w-14 text-slate-200 mb-3" />
                    <h3 className="text-base font-bold text-slate-600">No Interactive Deck Active</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Choose a topic to create educational flashcards, or select a pre-saved list to kickstart your memory drill session.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. EXPLAINER SUBTAB ==================== */}
          {activeSubTab === "explainer" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Input form Column */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit lg:col-span-1">
                <h3 className="text-base font-bold text-slate-800 mb-3.5">Topic Explainer Setup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subject / Concept Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prisoner's Dilemma, Photosynthesis"
                      value={explainTopic}
                      onChange={(e) => setExplainTopic(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Pedagogical Approach</label>
                    <select
                      value={explainMode}
                      onChange={(e) => setExplainMode(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    >
                      <option value="explain_like_freshman">Explain like I'm a Freshman (Simple, Fun Analogies)</option>
                      <option value="detailed_exam_prep">Detailed Academic breakdown (Formulas & Pitfalls)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={generateExplanation}
                      disabled={!explainTopic.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Consult AI Tutor
                    </button>
                    <button
                      onClick={handleGenerateWithDemoMode}
                      disabled={!explainTopic.trim()}
                      className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="h-3.5 w-3.5 text-slate-500" />
                      Consult in Sandbox Mode (Demo)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Output Viewer */}
              <div className="lg:col-span-2">
                {explanation ? (
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        AI Freshman Advisor
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 mt-1 capitalize">{explanation.title}</h2>
                    </div>

                    {/* Simple Concept */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700">The Breakdown:</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-sans">{explanation.concept}</p>
                    </div>

                    {/* Analogy Box */}
                    {explanation.analogy && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">💡 Relatable Analogy</p>
                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{explanation.analogy}</p>
                      </div>
                    )}

                    {/* Takeaways */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Takeaways & Memory Rules:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {explanation.takeaways.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600">
                            <span className="bg-indigo-600 text-white font-mono rounded-full h-4 w-4 shrink-0 flex items-center justify-center text-[10px]">
                              {i + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practice Quiz */}
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                        <PlayCircle className="h-4 w-4" />
                        Freshman Self-Assessment
                      </p>
                      <h4 className="font-bold text-sm text-slate-800 leading-relaxed">{explanation.quizQuestion}</h4>

                      <div className="space-y-2 mt-3">
                        {explanation.quizOptions.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedQuizOption(idx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                              quizSubmitted
                                ? idx === explanation.quizAnswerIndex
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                                  : selectedQuizOption === idx
                                  ? "bg-rose-50 border-rose-300 text-rose-800"
                                  : "bg-white border-slate-100 text-slate-400"
                                : selectedQuizOption === idx
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold"
                                : "bg-white border-slate-200 hover:bg-slate-100/50 text-slate-700"
                            }`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && idx === explanation.quizAnswerIndex && (
                              <Check className="h-4.5 w-4.5 text-emerald-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      {!quizSubmitted && selectedQuizOption !== null && (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition"
                        >
                          Submit Answer
                        </button>
                      )}

                      {quizSubmitted && (
                        <div className="mt-4 p-3 bg-white rounded-lg border text-xs leading-relaxed space-y-1">
                          <p className={`font-bold ${selectedQuizOption === explanation.quizAnswerIndex ? "text-emerald-700" : "text-rose-700"}`}>
                            {selectedQuizOption === explanation.quizAnswerIndex ? "Correct Answer!" : "Study recommendation:"}
                          </p>
                          <p className="text-slate-600">{explanation.quizExplanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <Sparkles className="h-14 w-14 text-slate-200 mb-3" />
                    <h3 className="text-base font-bold text-slate-600">No Concept Decoded</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Input any complex, daunting academic term or concept on the left, and let our AI professor parse it into absolute freshman terms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
