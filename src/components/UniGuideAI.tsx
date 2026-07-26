import React, { useState, useRef, useEffect } from "react";
import { UniGuideMessage, UniGuideResponseData } from "../types";
import {
  Building2,
  Send,
  Paperclip,
  FileText,
  X,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Globe
} from "lucide-react";

interface UniGuideAIProps {
  messages: UniGuideMessage[];
  onSaveMessages: (messages: UniGuideMessage[]) => void;
}

// Preset Official University Notices for Testing
const PRESET_NOTICES = [
  {
    title: "Registration & Course Add/Drop Notice Fall 2026",
    filename: "Notice_Reg_Fall2026.txt",
    content: `OFFICIAL NOTIFICATION - REGISTRAR OFFICE
Ref No: REG/2026/CIRC-104 | Date: August 15, 2026

SUBJECT: REGISTRATION DEADLINES & COURSE ADD/DROP POLICY

1. All undergraduate and postgraduate students are hereby notified that semester registration for Fall 2026 commences on August 20, 2026.
2. The deadline for online course registration without late fee is August 28, 2026.
3. Add/Drop Period: August 29 to September 05, 2026. No course changes will be entertained after September 05.
4. Students with fee outstanding exceeding $500 / PKR 50,000 will be blocked from self-registration and must seek approval from the Student Financial Services Office.
5. Minimum credit limit per semester: 12 credit hours. Maximum credit limit: 18 credit hours (21 for students with CGPA >= 3.50).

Issued with approval of the Vice Chancellor.
Registrar, University Academic Administration.`
  },
  {
    title: "Merit & Need-Based Scholarship Guidelines 2026",
    filename: "Scholarship_Policy_2026.txt",
    content: `STUDENT FINANCIAL AID OFFICE - SCHOLARSHIP CIRCULAR
Notification No: SFAO/SCH-2026/012 | Date: July 10, 2026

SUBJECT: ANNUAL MERIT & NEED-BASED SCHOLARSHIP APPLICATIONS

1. ELIGIBILITY FOR MERIT SCHOLARSHIP:
   - Minimum SGPA of 3.75 in the preceding semester.
   - Full course load (at least 15 credit hours) completed without any 'F' grade or course drop.
   - Award: 50% to 100% tuition fee waiver for top 3 rank holders per department.

2. ELIGIBILITY FOR NEED-BASED FINANCIAL AID:
   - Family gross monthly income less than $1,500 / PKR 250,000.
   - Minimum CGPA of 2.50.

3. REQUIRED DOCUMENTS:
   - Attested income certificate / salary slips of parents/guardian.
   - Utility bills for past 3 months (Electricity, Gas, Water).
   - Copy of Student ID Card & National CNIC/Passport.
   - Latest unofficial transcript.

4. APPLICATION PROCEDURE:
   - Step 1: Download Form SFAO-1 from the Student Portal.
   - Step 2: Attach required income and academic documents.
   - Step 3: Submit hard copy to Room 102, Financial Aid Building before September 15, 2026.

Manager Financial Aid Office.`
  },
  {
    title: "Transcript & Degree Verification Regulations",
    filename: "Examination_Rules_Transcript.txt",
    content: `OFFICE OF THE CONTROLLER OF EXAMINATIONS
Policy Document EX-2026-T1 | Examination Regulations

SUBJECT: PROCEDURE FOR ISSUANCE OF TRANSCRIPT, DEGREE & VERIFICATION

1. OFFICIAL TRANSCRIPT ISSUANCE:
   - Processing time: Normal (7 working days), Urgent (2 working days).
   - Fee: Normal ($15 / PKR 1,500), Urgent ($35 / PKR 3,500).
   - Pre-requisite: Clearance from Library, Hostel, Accounts, and Departmental Labs.

2. DEGREE VERIFICATION:
   - Application must be submitted via the Online Examination Portal.
   - Original transcript and matriculation/high school certificate scan required.
   - Processing time: 10 working days.

3. DUPLICATE DEGREE / TRANSCRIPT:
   - Requires submission of an original Affidavit on Stamp Paper ($5 / PKR 100) countersigned by a Notary Public, plus a newspaper publication clipping advertising the loss.

Controller of Examinations.`
  }
];

// Frequently Asked Questions / Quick Chips
const QUICK_QUESTIONS = [
  "How do I apply for an official transcript and degree verification?",
  "What is the minimum attendance requirement for final exams?",
  "How can I apply for the Merit Scholarship?",
  "What is the process to withdraw or drop a course?",
  "Degree verification ka kya tareeqa hai aur kitni fee hai?",
  "Where do I submit my Internship approval form?"
];

export const UniGuideAI: React.FC<UniGuideAIProps> = ({ messages, onSaveMessages }) => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedNoticeName, setAttachedNoticeName] = useState<string | null>(null);
  const [attachedNoticeContent, setAttachedNoticeContent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message if history is empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialWelcome: UniGuideMessage = {
        id: "msg_welcome",
        sender: "uniguide",
        text: "Welcome to UniGuide AI — Your Official University Knowledge Hub & Student Assistant. How can I assist you with academic procedures, policies, or notices today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: {
          summary: "I am UniGuide AI, your dedicated university help desk representative. I provide reliable, accurate information based strictly on official university regulations, handbooks, and notifications.",
          detailedExplanation: "Whether you need guidance on course registration, examination rules, scholarship eligibility, grading policies, CGPA calculations, transcript issuance, or hostel & campus services, I am here to clarify procedures step-by-step.",
          requiredDocuments: [
            "Student ID Card / CNIC",
            "Latest Academic Transcript",
            "Relevant Departmental Forms (if applicable)"
          ],
          steps: [
            "Select or type your query in English, Urdu, or Roman Urdu.",
            "Optionally upload or select an official university notice/circular for instant analysis.",
            "Receive structured, step-by-step guidance referencing responsible offices and official policies."
          ],
          responsibleOffice: "University Student Helpdesk & Academic Secretariat",
          notesAndWarnings: [
            "All procedures conform to standard academic regulations.",
            "Final official approvals rest with the respective university authority (Registrar, Controller of Examinations, Deans)."
          ],
          officialSource: "University General Academic Prospectus & Student Handbook 2026",
          confidence: "Verified Official Documentation"
        }
      };
      onSaveMessages([initialWelcome]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Submit Query to UniGuide AI backend
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend && !attachedNoticeContent) return;

    const userMsg: UniGuideMessage = {
      id: "msg_user_" + Date.now(),
      sender: "user",
      text: textToSend || (attachedNoticeName ? `Analyzed document: ${attachedNoticeName}` : "Analyzing notice..."),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachedNoticeName: attachedNoticeName || undefined,
      attachedNoticeContent: attachedNoticeContent || undefined
    };

    const updatedMessages = [...messages, userMsg];
    onSaveMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      // Format history for context
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch("/api/ai/uniguide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          history: historyPayload,
          attachedNoticeName: attachedNoticeName || undefined,
          attachedNoticeContent: attachedNoticeContent || undefined
        })
      });

      if (!response.ok) {
        let errMessage = "Failed to reach UniGuide AI service.";
        try {
          const errorData = await response.json();
          if (errorData?.error) errMessage = errorData.error;
        } catch {
          // ignore non-json error responses
        }
        throw new Error(errMessage);
      }

      const resData: UniGuideResponseData = await response.json();

      const botMsg: UniGuideMessage = {
        id: "msg_uniguide_" + Date.now(),
        sender: "uniguide",
        text: resData.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: resData
      };

      onSaveMessages([...updatedMessages, botMsg]);
    } catch (err: any) {
      console.error("UniGuide query error:", err);
      const errorMsg: UniGuideMessage = {
        id: "msg_err_" + Date.now(),
        sender: "uniguide",
        text: "I encountered an issue accessing official guidelines.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: {
          summary: "Could not complete query processing at this time.",
          detailedExplanation: err.message || "An unexpected network or server error occurred. Please verify that your GROQ_API_KEY is configured in your hosting environment (for Vercel: Project Settings > Environment Variables).",
          requiredDocuments: [],
          steps: ["Check your internet connection.", "Ensure GROQ_API_KEY is set in your hosting environment (for Vercel: Project Settings > Environment Variables).", "Contact the University Helpdesk directly."],
          responsibleOffice: "IT Helpdesk & System Support",
          notesAndWarnings: ["Official information could not be verified automatically."],
          officialSource: "System Error Log",
          confidence: "Official Confirmation Required"
        }
      };
      onSaveMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      // Clear attachment after sending
      setAttachedNoticeName(null);
      setAttachedNoticeContent(null);
    }
  };

  // Handle file uploads (text/notices)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedNoticeName(file.name);
      setAttachedNoticeContent(content);
    };
    reader.readAsText(file);
  };

  // Select Preset Notice
  const handleSelectPreset = (preset: typeof PRESET_NOTICES[0]) => {
    setAttachedNoticeName(preset.filename);
    setAttachedNoticeContent(preset.content);
    setShowPresets(false);
  };

  // Copy structured response to clipboard
  const handleCopyMessage = (msg: UniGuideMessage) => {
    if (!msg.data) return;
    const textToCopy = `UNI-GUIDE AI - OFFICIAL RESPONSE
Summary: ${msg.data.summary}

Detailed Policy:
${msg.data.detailedExplanation}

Required Documents:
${msg.data.requiredDocuments.map((d) => `- ${d}`).join("\n")}

Step-by-Step Procedure:
${msg.data.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

Responsible Office: ${msg.data.responsibleOffice}
Official Source: ${msg.data.officialSource}
Confidence: ${msg.data.confidence}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech synthesizer for audio reading
  const handleToggleSpeech = (msg: UniGuideMessage) => {
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    if (msg.data) {
      const speechText = `${msg.data.summary}. ${msg.data.detailedExplanation}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(msg.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation history with UniGuide AI?")) {
      onSaveMessages([]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/50 shrink-0">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl shadow-md shadow-indigo-900/40 shrink-0">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-white">UniGuide AI</h2>
              <span className="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Official Knowledge Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Intelligent University Digital Helpdesk. Instant step-by-step guidance on admissions, examinations, scholarships, transcripts, regulations & notices.
            </p>
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs font-semibold bg-indigo-900/80 hover:bg-indigo-800/90 text-indigo-100 border border-indigo-700/60 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Load Official University Notices for Analysis"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-300" />
            <span>Sample Notices</span>
            {showPresets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            onClick={handleClearChat}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Preset Notices Dropdown Drawer */}
      {showPresets && (
        <div className="bg-indigo-950/90 border-b border-indigo-800/60 p-4 text-white text-xs animate-in slide-in-from-top duration-200">
          <p className="font-semibold text-indigo-200 mb-2.5 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span>Select an Official Circular / Notice to Analyze:</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESET_NOTICES.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/50 hover:border-indigo-500 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-300 block mb-1">
                    {preset.filename}
                  </span>
                  <h4 className="font-bold text-slate-100 text-xs mb-1.5 leading-snug">{preset.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {preset.content}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-indigo-800/60 text-[10px] text-indigo-300 font-semibold flex items-center justify-between">
                  <span>Attach & Analyze</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Conversation Stage */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className="text-[11px] font-bold text-slate-500">
                {msg.sender === "user" ? "You (Student)" : "UniGuide AI Representative"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
            </div>

            {/* Message Body */}
            {msg.sender === "user" ? (
              <div className="bg-indigo-600 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-2xl shadow-sm text-sm leading-relaxed">
                {msg.attachedNoticeName && (
                  <div className="bg-indigo-700/70 border border-indigo-500/60 rounded-xl p-2.5 mb-2 flex items-center gap-2 text-xs">
                    <Paperclip className="h-4 w-4 text-amber-300 shrink-0" />
                    <span className="font-semibold text-amber-200 truncate">{msg.attachedNoticeName}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-3xl rounded-tl-sm p-5 sm:p-6 shadow-sm space-y-5">
                {/* Confidence Badge & Quick Tools */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
                  {msg.data?.confidence === "Verified Official Documentation" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Verified Official Documentation</span>
                    </span>
                  )}
                  {msg.data?.confidence === "Partially Verified" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <span>Partially Verified</span>
                    </span>
                  )}
                  {msg.data?.confidence === "Official Confirmation Required" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>Official Confirmation Required</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button
                      onClick={() => handleToggleSpeech(msg)}
                      className={`p-1.5 rounded-lg border transition ${
                        speakingId === msg.id
                          ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                          : "hover:bg-slate-100 border-slate-200"
                      }`}
                      title="Listen to response"
                    >
                      {speakingId === msg.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleCopyMessage(msg)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
                      title="Copy response details"
                    >
                      {copiedId === msg.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* 1. Brief Summary */}
                {msg.data?.summary && (
                  <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Executive Summary</span>
                    </h4>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {msg.data.summary}
                    </p>
                  </div>
                )}

                {/* 2. Detailed Explanation */}
                {msg.data?.detailedExplanation && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Policy & Procedural Details
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {msg.data.detailedExplanation}
                    </p>
                  </div>
                )}

                {/* 3. Required Documents */}
                {msg.data?.requiredDocuments && msg.data.requiredDocuments.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-indigo-600" />
                      <span>Required Documents Checklist</span>
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {msg.data.requiredDocuments.map((docItem, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white border border-slate-200/60 p-2.5 rounded-xl font-medium">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{docItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Step-by-Step Procedure */}
                {msg.data?.steps && msg.data.steps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Step-by-Step Instructions
                    </h4>
                    <div className="space-y-2.5">
                      {msg.data.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-2xs">
                          <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium pt-0.5">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Responsible Office & Official Source Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {msg.data?.responsibleOffice && (
                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Responsible University Authority
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                        {msg.data.responsibleOffice}
                      </span>
                    </div>
                  )}

                  {msg.data?.officialSource && (
                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                        Official Regulation Source
                      </span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{msg.data.officialSource}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* 6. Notes & Warnings */}
                {msg.data?.notesAndWarnings && msg.data.notesAndWarnings.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                    <h5 className="font-bold mb-1.5 flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Important Conditions & Restrictions:</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      {msg.data.notesAndWarnings.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Formal Disclaimer Footnote */}
                <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2.5 flex items-center gap-1.5 italic">
                  <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    Note: Final official decisions rest with the relevant university authority. Please confirm with the official university office before making critical administrative decisions.
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 my-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md animate-pulse">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-semibold text-slate-600">
                <span>UniGuide AI is consulting official university regulations & documents...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 overflow-x-auto shrink-0 flex items-center gap-2 text-xs scrollbar-none">
        <span className="font-bold text-slate-400 uppercase text-[10px] shrink-0 tracking-wider flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Quick Questions:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="whitespace-nowrap bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-200 px-3 py-1.5 rounded-full font-medium transition text-xs shrink-0 shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Bottom Input Controls Bar */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {/* Attached Document Banner */}
        {attachedNoticeName && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 mb-2.5 flex items-center justify-between text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-bold truncate">Attached Document: {attachedNoticeName}</span>
            </div>
            <button
              onClick={() => {
                setAttachedNoticeName(null);
                setAttachedNoticeContent(null);
              }}
              className="text-amber-700 hover:text-rose-600 p-1 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File input button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.doc,.docx,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-2xl transition shrink-0"
            title="Attach University Circular, Policy Document or Notice"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Prompt Textarea */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask UniGuide AI about admissions, exams, scholarships, transcripts, attendance (English, Urdu, or Roman Urdu)..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
            <div className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 font-mono hidden sm:block">
              Shift+Enter for newline
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputText.trim() && !attachedNoticeContent)}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition shadow-md shadow-indigo-100 shrink-0 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniGuideAI;
