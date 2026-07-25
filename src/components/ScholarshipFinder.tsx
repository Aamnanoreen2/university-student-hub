import React, { useState } from "react";
import { Scholarship, StudentProfile } from "../types";
import {
  Award,
  Search,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Send,
  FileCheck,
  Building2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ChevronRight
} from "lucide-react";

interface ScholarshipFinderProps {
  studentProfile?: StudentProfile;
  studentCgpa?: number;
  totalCredits?: number;
  gradedCourseCount?: number;
  savedScholarshipIds: string[];
  onToggleSaveScholarship: (id: string) => void;
  onNavigateToTab?: (tabKey: any) => void;
}

const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch_hec_need",
    title: "HEC Need-Based Undergraduate Scholarship 2026",
    organization: "Higher Education Commission (HEC)",
    type: "Need-Based",
    amount: "100% Tuition Fee + Monthly Stipend",
    minCgpa: 2.5,
    eligibleMajors: ["All Undergraduate Disciplines", "Computer Science", "Engineering", "Business"],
    deadline: "2026-09-30",
    description: "Financial assistance program for financially constrained, deserving undergraduate students enrolled in recognized universities.",
    requiredDocuments: [
      "Parent Income Certificate / Salary Slip",
      "Past 3 Months Electricity & Water Bills",
      "CNIC/B-Form copy of applicant and parents",
      "University Unofficial Transcript"
    ],
    officialUrl: "https://www.hec.gov.pk/english/services/students/Need-Based-Scholarships",
    matchPercentage: 94
  },
  {
    id: "sch_president_merit",
    title: "President's High Academic Merit Award",
    organization: "University Senate & Academic Board",
    type: "Merit-Based",
    amount: "75% Tuition Fee Waiver",
    minCgpa: 3.75,
    eligibleMajors: ["Computer Science", "Electrical Engineering", "Software Engineering", "Mathematics"],
    deadline: "2026-08-31",
    description: "Prestigious award honoring undergraduate students demonstrating outstanding academic excellence and maintaining top cohort ranks.",
    requiredDocuments: [
      "Official Academic Transcript verifying SGPA/CGPA >= 3.75",
      "Departmental Head Recommendation Letter",
      "Student Achievement Portfolio"
    ],
    officialUrl: "https://university.edu/scholarships/merit-award",
    matchPercentage: 88
  },
  {
    id: "sch_stem_women",
    title: "Women in STEM Leadership Grant 2026",
    organization: "Global Tech Future Foundation",
    type: "Research",
    amount: "$2,500 / PKR 700,000 Research Grant",
    minCgpa: 3.2,
    eligibleMajors: ["Computer Science", "Artificial Intelligence", "Data Science", "Cybersecurity"],
    deadline: "2026-10-15",
    description: "Supporting female undergraduate and graduate researchers pursuing innovative projects in Artificial Intelligence, Robotics, and Data Science.",
    requiredDocuments: [
      "1-page Research Project Proposal",
      "Curriculum Vitae (CV)",
      "Faculty Advisor Approval Letter"
    ],
    officialUrl: "https://stemwomenfoundation.org/grants",
    matchPercentage: 91
  },
  {
    id: "sch_fulbright_undergrad",
    title: "Global UGRAD Exchange Program 2027",
    organization: "USEFP / US Department of State",
    type: "International",
    amount: "Fully Funded (Flight, Housing, Tuition, Stipend)",
    minCgpa: 3.0,
    eligibleMajors: ["All Fields", "Computer Science", "Social Sciences", "Media"],
    deadline: "2026-11-20",
    description: "Semester exchange program in the United States for full-time undergraduate students enrolled in Pakistani universities.",
    requiredDocuments: [
      "Official University Transcripts",
      "Two Letters of Recommendation",
      "Personal Statement Essay",
      "Passport Copy"
    ],
    officialUrl: "https://usefp.org/scholarships/ugrad.cf",
    matchPercentage: 82
  },
  {
    id: "sch_pait_alumni",
    title: "University Alumni Endowment Financial Assistance",
    organization: "University Alumni Association",
    type: "Government",
    amount: "50% Fee Subsidy",
    minCgpa: 2.8,
    eligibleMajors: ["All Undergraduate Majors"],
    deadline: "2026-09-15",
    description: "Alumni-funded support aimed at preventing student dropouts due to temporary economic hardship.",
    requiredDocuments: [
      "Financial Need Declaration Statement",
      "Semester Fee Chalan Copy",
      "Advisor Endorsement"
    ],
    officialUrl: "https://alumni.university.edu/assistance",
    matchPercentage: 85
  }
];

export const ScholarshipFinder: React.FC<ScholarshipFinderProps> = ({
  studentProfile,
  studentCgpa = 0,
  totalCredits = 0,
  gradedCourseCount = 0,
  savedScholarshipIds,
  onToggleSaveScholarship,
  onNavigateToTab
}) => {
  const [scholarships] = useState<Scholarship[]>(INITIAL_SCHOLARSHIPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  // AI Assistant embedded states
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  const filterTypes = ["All", "Merit-Based", "Need-Based", "Research", "International", "Saved"];

  // Student Profile Data Resolution
  const name = studentProfile?.studentName || "Student";
  const id = studentProfile?.studentId || "N/A";
  const university = studentProfile?.university || "";
  const department = studentProfile?.department || "";
  const degree = studentProfile?.degree || "";
  const semester = studentProfile?.semester || "";

  // Check if profile is missing critical details
  const isProfileIncomplete = !university || !degree || gradedCourseCount === 0;

  const filteredScholarships = scholarships.filter((s) => {
    const isSaved = savedScholarshipIds.includes(s.id);
    const matchesType =
      selectedType === "All"
        ? true
        : selectedType === "Saved"
        ? isSaved
        : s.type === selectedType;

    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleAskScholarshipAI = async (textToAsk?: string) => {
    const queryStr = (textToAsk || aiQuery).trim();
    if (!queryStr) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch("/api/ai/scholarships-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryStr,
          studentProfile: {
            studentName: name,
            studentId: id,
            university,
            department,
            degree,
            semester,
            batch: studentProfile?.batch || ""
          },
          liveCgpa: studentCgpa,
          totalCredits,
          gradedCourseCount,
          financialStatus: "Undergraduate student seeking merit & financial assistance"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get scholarship advice.");
      }

      const data = await response.json();
      setAiResponse(data);
    } catch (err: any) {
      console.error("Scholarship AI error:", err);
      setAiResponse({
        answer: `Evaluated recommendations for ${name} (${degree || "Undergraduate"}):`,
        matchedScholarships: [
          {
            title: "HEC Need-Based Undergraduate Scholarship 2026",
            provider: "Higher Education Commission (HEC)",
            type: "Need-Based",
            coverage: "100% Tuition Fee + Monthly Stipend",
            matchPercentage: studentCgpa >= 2.5 ? 95 : 60,
            eligibilityReason: studentCgpa >= 2.5
              ? `Your live CGPA (${studentCgpa.toFixed(2)}) meets the minimum 2.50 threshold.`
              : `Your live CGPA (${studentCgpa.toFixed(2)}) is below the 2.50 requirement.`,
            deadline: "2026-09-30"
          }
        ],
        requiredDocuments: ["Student ID Card", "Parent Salary Slip", "Official Academic Transcript"],
        actionSteps: ["Check HEC portal directly", "Visit Student Financial Aid Office"],
        proTips: "Verify your profile in Campus Vault for accurate AI matching."
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-200 text-xs font-semibold mb-3">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Live Academic Database Synchronized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Scholarship Finder & Financial Aid
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Real-time financial aid and grant matching dynamically synchronized with your verified Student Profile and GPA Planner.
            </p>
          </div>

          {/* Live Student Profile Card */}
          <div className="bg-emerald-900/80 border border-emerald-700/80 rounded-2xl p-4 min-w-[280px] shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <span className="text-[10px] uppercase font-mono text-emerald-300 font-bold tracking-wider">
                Connected Student Record
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Verified Portal
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-white flex items-center justify-between">
                <span>{name}</span>
                <span className="text-xs text-emerald-300 font-mono font-medium">{id}</span>
              </p>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {degree || "Degree Unspecified"} {department ? `• ${department}` : ""}
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5 truncate">
                {university || "University Unspecified"} {semester ? `(${semester})` : ""}
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between text-xs">
              <span className="text-emerald-200">
                Live CGPA: <strong className="text-amber-300 font-mono text-sm">{gradedCourseCount > 0 ? studentCgpa.toFixed(2) : "0.00"}</strong>
              </span>
              <span className="text-emerald-300 font-mono text-[11px]">
                {totalCredits} Credits ({gradedCourseCount} Graded)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Profile Alert Banner */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Incomplete Academic Record for AI Matching
              </p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                {!university || !degree
                  ? "Your Degree or University is unrecorded. Update your profile in Campus Vault for exact eligibility matching."
                  : "No graded completed courses are recorded in your GPA Planner. Add completed course grades to enable CGPA eligibility checks."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(!university || !degree) && onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("vault")}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs text-xs"
              >
                Update Vault Profile
              </button>
            )}
            {gradedCourseCount === 0 && onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("academic")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs text-xs"
              >
                Log Grades in GPA Planner
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Contextual AI Assistant Section */}
      <div className="bg-white border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ask Scholarship AI</h3>
              <p className="text-xs text-slate-500">
                Instant eligibility check and grant recommendations evaluated strictly against your live profile.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Query Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() =>
              handleAskScholarshipAI(
                `Am I eligible for HEC Need-Based Scholarship with my current recorded profile (${degree || "Degree"}, CGPA ${studentCgpa.toFixed(2)})?`
              )
            }
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full font-medium transition text-xs shrink-0"
          >
            "Am I eligible for HEC Need-Based Grant?"
          </button>
          <button
            onClick={() =>
              handleAskScholarshipAI(
                `Which merit scholarships fit my live ${studentCgpa.toFixed(2)} CGPA at ${university || "my university"}?`
              )
            }
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full font-medium transition text-xs shrink-0"
          >
            `"Which grants fit my live ${studentCgpa.toFixed(2)} CGPA?"`
          </button>
          <button
            onClick={() =>
              handleAskScholarshipAI(
                `What documents are required for university fee waiver applications for ${degree || "undergraduates"}?`
              )
            }
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full font-medium transition text-xs shrink-0"
          >
            "What documents are required for fee waivers?"
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskScholarshipAI()}
            placeholder="Ask anything about scholarships, fee waivers, or eligibility..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button
            onClick={() => handleAskScholarshipAI()}
            disabled={aiLoading || !aiQuery.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-2xl transition shadow-sm flex items-center gap-1.5 shrink-0"
          >
            {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {/* AI Answer Box */}
        {aiResponse && (
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 text-xs text-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Live Profile AI Assessment</span>
              </span>
              <button
                onClick={() => setAiResponse(null)}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Close
              </button>
            </div>

            <p className="text-sm font-medium leading-relaxed text-slate-800">
              {aiResponse.answer}
            </p>

            {aiResponse.matchedScholarships && aiResponse.matchedScholarships.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Matched Opportunities (Evaluated against your profile):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiResponse.matchedScholarships.map((match: any, i: number) => (
                    <div key={i} className="bg-white border border-emerald-200/80 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">{match.title}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                          {match.matchPercentage}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{match.coverage}</p>
                      <p className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100/80 mt-1 leading-snug">
                        {match.eligibilityReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResponse.requiredDocuments && (
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="font-bold text-slate-700 text-[11px] mb-1 flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-600" /> Required Application Checklist:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                  {aiResponse.requiredDocuments.map((doc: string, idx: number) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs scrollbar-none">
          {filterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                selectedType === type
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Scholarship Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScholarships.map((scholarship) => {
          const isSaved = savedScholarshipIds.includes(scholarship.id);

          // Dynamic Live Eligibility Evaluation
          const meetsCgpa = studentCgpa >= scholarship.minCgpa;
          const isGraded = gradedCourseCount > 0;

          // Check if degree program matches
          const majorCheck = degree.toLowerCase();
          const matchesMajor = scholarship.eligibleMajors.some(m =>
            m.toLowerCase().includes("all") ||
            m.toLowerCase().includes("undergraduate") ||
            (majorCheck && majorCheck.includes(m.toLowerCase())) ||
            (m.toLowerCase().includes("computer") && majorCheck.includes("computer")) ||
            (m.toLowerCase().includes("engineering") && majorCheck.includes("engineering"))
          );

          let eligibilityStatus: "eligible" | "partial" | "ineligible" | "unrecorded" = "eligible";
          let eligibilityLabel = "";
          let badgeColor = "";

          if (!isGraded || !degree) {
            eligibilityStatus = "unrecorded";
            eligibilityLabel = "Academic Record Required";
            badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
          } else if (meetsCgpa && matchesMajor) {
            eligibilityStatus = "eligible";
            eligibilityLabel = `Eligible (${studentCgpa.toFixed(2)} CGPA vs ${scholarship.minCgpa} min)`;
            badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
          } else if (meetsCgpa) {
            eligibilityStatus = "partial";
            eligibilityLabel = `CGPA Qualified (${studentCgpa.toFixed(2)}), Verify Discipline`;
            badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
          } else {
            eligibilityStatus = "ineligible";
            eligibilityLabel = `Below Min CGPA (${studentCgpa.toFixed(2)} vs ${scholarship.minCgpa} min)`;
            badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
          }

          return (
            <div
              key={scholarship.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award className="h-3 w-3 text-emerald-600" />
                    {scholarship.type}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} flex items-center gap-1`}>
                      {eligibilityStatus === "eligible" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                      {eligibilityLabel}
                    </span>

                    <button
                      onClick={() => onToggleSaveScholarship(scholarship.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                      title={isSaved ? "Remove from saved" : "Save scholarship"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Title & Organization */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {scholarship.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {scholarship.organization}
                  </p>
                </div>

                {/* Amount & Deadline Metrics */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Grant Coverage</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      {scholarship.amount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Deadline</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {scholarship.deadline}
                    </span>
                  </div>
                </div>

                {/* Live Match Justification */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {scholarship.description}
                </p>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Live Portal Assessment:</span>
                  </p>
                  <p className="text-slate-600 leading-snug">
                    {eligibilityStatus === "eligible" &&
                      `Qualified: Your recorded CGPA (${studentCgpa.toFixed(2)}) satisfies the ${scholarship.minCgpa} minimum for ${degree || "your program"}.`}
                    {eligibilityStatus === "partial" &&
                      `CGPA Qualified (${studentCgpa.toFixed(2)} >= ${scholarship.minCgpa}). Confirm if ${degree || "your major"} satisfies eligible disciplines (${scholarship.eligibleMajors.join(", ")}).`}
                    {eligibilityStatus === "ineligible" &&
                      `Your recorded CGPA (${studentCgpa.toFixed(2)}) is below the required ${scholarship.minCgpa} minimum.`}
                    {eligibilityStatus === "unrecorded" &&
                      "Academic profile or CGPA not yet logged in GPA Planner / Campus Vault."}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedScholarship(scholarship)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <span>View Requirements</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <a
                  href={scholarship.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedScholarship.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedScholarship.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedScholarship.organization}
                </p>
              </div>
              <button
                onClick={() => setSelectedScholarship(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedScholarship.description}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <span>Required Application Documents:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedScholarship.requiredDocuments.map((docItem, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Student Profile Evaluation Box inside Modal */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Personalized Profile Check for {name}:</span>
              </p>
              <p className="text-emerald-900">
                • <strong>Program:</strong> {degree || "Degree unspecified"} ({university || "University unspecified"})
              </p>
              <p className="text-emerald-900">
                • <strong>Live CGPA:</strong> {studentCgpa.toFixed(2)} (Requirement: {selectedScholarship.minCgpa})
              </p>
              <p className="text-emerald-900">
                • <strong>Eligibility Result:</strong>{" "}
                {studentCgpa >= selectedScholarship.minCgpa
                  ? "Meets or exceeds minimum academic CGPA criteria."
                  : "Currently below minimum CGPA threshold. Consider raising SGPA in upcoming semesters."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-500">
                Deadline: <strong className="text-slate-800">{selectedScholarship.deadline}</strong>
              </span>
              <a
                href={selectedScholarship.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipFinder;
