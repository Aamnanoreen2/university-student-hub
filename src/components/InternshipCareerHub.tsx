import React, { useState } from "react";
import { Internship, CareerProfile, StudentProfile } from "../types";
import {
  Briefcase,
  Search,
  Sparkles,
  FileText,
  CheckCircle2,
  ExternalLink,
  Building2,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Award,
  TrendingUp,
  Target,
  FileCheck,
  RefreshCw,
  Plus,
  X,
  UserCheck,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  MapPin,
  Globe,
  DollarSign,
  GraduationCap,
  Info,
  Check,
  Upload,
  UploadCloud,
  CheckSquare,
  Square
} from "lucide-react";

interface InternshipCareerHubProps {
  studentProfile?: StudentProfile;
  careerProfile: CareerProfile;
  studentCgpa?: number;
  onUpdateCareerProfile: (updated: CareerProfile) => void;
  savedInternshipIds: string[];
  onToggleSaveInternship: (id: string) => void;
}

const PRESET_CAREER_ROLES = [
  "Software Engineer",
  "Data Analyst / Scientist",
  "Cyber Security Analyst",
  "UI/UX Designer",
  "Cloud & DevOps Engineer",
  "Product Manager",
  "Financial Analyst",
  "AI / ML Engineer"
];

const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: "int_dev_google",
    title: "Software Engineering Fellow / Intern 2026",
    company: "Google / Tech Global Labs",
    location: "Remote / Hybrid (Lahore & Karachi Hubs)",
    city: "Lahore",
    country: "Pakistan",
    workMode: "Hybrid",
    type: "Summer Internship",
    industry: "Software & Cloud Engineering",
    stipend: "$800 / PKR 220,000 / month",
    minCgpa: 3.2,
    requiredSkills: ["Data Structures", "Algorithms", "Python", "C++", "System Design"],
    targetMajors: ["Computer Science", "Software Engineering", "AI", "Data Science"],
    experienceLevel: "Student / Intern",
    visaSponsorship: true,
    deadline: "2026-08-15",
    description: "Hands-on experience developing scalable cloud applications, optimizing REST APIs, and working directly alongside senior software engineers.",
    applicationUrl: "https://careers.google.com/students"
  },
  {
    id: "int_data_systems",
    title: "Data Analytics & Business Intelligence Intern",
    company: "Systems Limited / Enterprise AI",
    location: "Islamabad & Remote",
    city: "Islamabad",
    country: "Pakistan",
    workMode: "Remote",
    type: "Full-time",
    industry: "Data & Artificial Intelligence",
    stipend: "PKR 85,000 / month",
    minCgpa: 3.0,
    requiredSkills: ["SQL", "PowerBI", "Python", "Pandas", "Data Cleaning"],
    targetMajors: ["Data Science", "Computer Science", "Information Technology", "Business Analytics"],
    experienceLevel: "Student / Intern",
    visaSponsorship: false,
    deadline: "2026-09-01",
    description: "Transform raw enterprise data into executive dashboards, perform statistical trend modeling, and write automated ETL pipelines.",
    applicationUrl: "https://systemsltd.com/careers"
  },
  {
    id: "int_fullstack_devs",
    title: "Frontend React & Mobile App Intern",
    company: "DevSinc Technologies",
    location: "Lahore Hub",
    city: "Lahore",
    country: "Pakistan",
    workMode: "On-site",
    type: "Summer Internship",
    industry: "Software & Cloud Engineering",
    stipend: "PKR 70,000 / month",
    minCgpa: 2.8,
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "Git"],
    targetMajors: ["Computer Science", "Software Engineering", "IT"],
    experienceLevel: "Student / Intern",
    visaSponsorship: false,
    deadline: "2026-08-30",
    description: "Join modern product teams crafting user interfaces, implementing state management, and connecting REST/GraphQL endpoints.",
    applicationUrl: "https://devsinc.com/careers"
  },
  {
    id: "int_cyber_security",
    title: "Information Security & SOC Analyst Intern",
    company: "Trillium Information Security Systems",
    location: "Rawalpindi / Remote",
    city: "Rawalpindi",
    country: "Pakistan",
    workMode: "Hybrid",
    type: "Part-time",
    industry: "Cyber Security & SOC",
    stipend: "PKR 65,000 / month",
    minCgpa: 3.0,
    requiredSkills: ["Networking", "Linux", "Penetration Testing", "Wireshark"],
    targetMajors: ["Cybersecurity", "Computer Science", "IT"],
    experienceLevel: "Student / Intern",
    visaSponsorship: false,
    deadline: "2026-09-20",
    description: "Monitor network traffic, perform vulnerability assessments, and assist senior SOC analysts in incident response protocols.",
    applicationUrl: "https://trilliumsec.com/careers"
  },
  {
    id: "int_ml_arbisoft",
    title: "Machine Learning & AI Engineering Fellow",
    company: "Arbisoft",
    location: "Lahore / Hybrid",
    city: "Lahore",
    country: "Pakistan",
    workMode: "Hybrid",
    type: "Graduate Program",
    industry: "Data & Artificial Intelligence",
    stipend: "PKR 100,000 / month",
    minCgpa: 3.2,
    requiredSkills: ["Python", "PyTorch", "Scikit-Learn", "Machine Learning", "NLP"],
    targetMajors: ["Computer Science", "Data Science", "Artificial Intelligence"],
    experienceLevel: "Fresh Graduate",
    visaSponsorship: false,
    deadline: "2026-09-10",
    description: "Build custom LLM agents, train predictive machine learning pipelines, and optimize neural network inference speeds.",
    applicationUrl: "https://arbisoft.com/careers"
  },
  {
    id: "int_jazz_product",
    title: "Product Management & Growth Trainee",
    company: "Jazz (VEON Digital)",
    location: "Islamabad HQ",
    city: "Islamabad",
    country: "Pakistan",
    workMode: "On-site",
    type: "Graduate Program",
    industry: "UI/UX & Product Design",
    stipend: "PKR 80,000 / month",
    minCgpa: 3.0,
    requiredSkills: ["Product Analytics", "Agile", "Figma", "Market Research", "SQL"],
    targetMajors: ["Business Analytics", "Computer Science", "IT", "Management"],
    experienceLevel: "Fresh Graduate",
    visaSponsorship: false,
    deadline: "2026-08-25",
    description: "Drive digital product discovery, write user stories, conduct A/B testing, and collaborate with engineering leads.",
    applicationUrl: "https://jazz.com.pk/careers"
  },
  {
    id: "int_cloud_tenpearls",
    title: "Cloud & DevOps Engineering Associate",
    company: "TenPearls & AWS Partner Network",
    location: "Karachi / Remote",
    city: "Karachi",
    country: "Pakistan",
    workMode: "Remote",
    type: "Full-time",
    industry: "Software & Cloud Engineering",
    stipend: "PKR 95,000 / month",
    minCgpa: 3.1,
    requiredSkills: ["Docker", "Linux", "AWS", "CI/CD", "Terraform"],
    targetMajors: ["Software Engineering", "Computer Science", "IT"],
    experienceLevel: "Entry Level",
    visaSponsorship: true,
    deadline: "2026-09-15",
    description: "Automate cloud infrastructure provisioning, build CI/CD pipelines, and monitor microservices deployment health.",
    applicationUrl: "https://tenpearls.com/careers"
  },
  {
    id: "int_ms_apprentice",
    title: "Global Software Engineering Apprentice",
    company: "Microsoft Leap Program",
    location: "Remote Worldwide / USA Hub",
    city: "Remote",
    country: "United States",
    workMode: "Remote",
    type: "Contract",
    industry: "Software & Cloud Engineering",
    stipend: "$1,200 / PKR 330,000 / month",
    minCgpa: 3.2,
    requiredSkills: ["C#", ".NET", "Web APIs", "Azure", "Git"],
    targetMajors: ["Computer Science", "Software Engineering", "IT"],
    experienceLevel: "Student / Intern",
    visaSponsorship: true,
    deadline: "2026-10-01",
    description: "Immersive 16-week global software engineering apprenticeship with mentorship from Microsoft Azure engineering teams.",
    applicationUrl: "https://leap.microsoft.com"
  },
  {
    id: "int_fintech_meezan",
    title: "Financial Data & Business Analyst Intern",
    company: "Meezan Bank Fintech Division",
    location: "Karachi HQ",
    city: "Karachi",
    country: "Pakistan",
    workMode: "On-site",
    type: "Summer Internship",
    industry: "Finance & Fintech",
    stipend: "PKR 60,000 / month",
    minCgpa: 2.8,
    requiredSkills: ["Excel", "Financial Modeling", "SQL", "Data Analysis"],
    targetMajors: ["Finance", "Business Analytics", "Computer Science"],
    experienceLevel: "Student / Intern",
    visaSponsorship: false,
    deadline: "2026-08-20",
    description: "Analyze digital banking transaction volumes, build credit risk dashboards, and optimize customer journey analytics.",
    applicationUrl: "https://meezanbank.com/careers"
  }
];

// Local ATS Score & Keyword Match Evaluator
function calculateLocalAtsScore(cvText: string, targetRole: string, studentSkills: string[]) {
  const roleLower = targetRole.toLowerCase();
  const cvLower = cvText.toLowerCase();

  // Role keyword match
  const roleKeywords = roleLower.split(/\s+/).filter(w => w.length > 2);
  const keywordsFound = roleKeywords.filter(kw => cvLower.includes(kw));
  const keywordRatio = roleKeywords.length > 0 ? keywordsFound.length / roleKeywords.length : 0.8;

  // Skills match
  const skillsFound = studentSkills.filter(sk => cvLower.includes(sk.toLowerCase()));
  const skillRatio = studentSkills.length > 0 ? skillsFound.length / studentSkills.length : 0.7;

  // Role-specific expected skills
  let expectedRoleSkills: string[] = [];
  if (roleLower.includes("data") || roleLower.includes("analytic")) {
    expectedRoleSkills = ["SQL", "Python", "PowerBI", "Pandas", "Tableau", "Statistics"];
  } else if (roleLower.includes("cyber") || roleLower.includes("security") || roleLower.includes("soc")) {
    expectedRoleSkills = ["Networking", "Wireshark", "Linux", "Security+", "SIEM", "Penetration Testing"];
  } else if (roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux")) {
    expectedRoleSkills = ["Figma", "Wireframing", "User Research", "Prototyping", "Usability Testing"];
  } else if (roleLower.includes("devops") || roleLower.includes("cloud")) {
    expectedRoleSkills = ["Docker", "AWS", "CI/CD", "Linux", "Kubernetes", "Terraform"];
  } else if (roleLower.includes("product") || roleLower.includes("project")) {
    expectedRoleSkills = ["Agile", "Scrum", "Jira", "User Stories", "PRD", "Analytics"];
  } else {
    expectedRoleSkills = ["React", "TypeScript", "Node.js", "Git", "REST APIs", "SQL"];
  }

  const missingRoleSkills = expectedRoleSkills.filter(sk => !cvLower.includes(sk.toLowerCase()));

  // Length score
  let lengthPts = 15;
  if (cvText.length < 100) lengthPts = 5;
  else if (cvText.length > 500) lengthPts = 20;

  // Verb score
  const actionVerbs = ["developed", "built", "designed", "optimized", "managed", "implemented", "created", "analyzed", "led", "automated", "improved"];
  const verbsFound = actionVerbs.filter(verb => cvLower.includes(verb));
  const verbPts = Math.min(15, verbsFound.length * 3);

  const keywordPts = Math.round(keywordRatio * 35);
  const skillPts = Math.round(skillRatio * 30);

  const totalScore = Math.min(98, Math.max(45, lengthPts + verbPts + keywordPts + skillPts));

  return {
    totalScore,
    keywordMatchPct: Math.round(keywordRatio * 100),
    skillsFoundCount: skillsFound.length,
    missingRoleSkills,
    verbsCount: verbsFound.length,
    feedback: `CV text analyzed against target role "${targetRole}". Found ${verbsFound.length} action verbs and ${keywordsFound.length}/${roleKeywords.length || 1} core role terms.`
  };
}

// Local Dynamic Career Roadmap Generator
function generateLocalRoadmap(targetRole: string, major: string) {
  const roleLower = targetRole.toLowerCase();

  if (roleLower.includes("data") || roleLower.includes("analytic")) {
    return {
      roadmap: [
        { phase: "Phase 1: Advanced SQL & Data Manipulation", duration: "2-3 Weeks", goals: ["Master complex SQL JOINs, CTEs, and window functions", "Complete 5 real-world dataset cleaning projects in Python/Pandas"] },
        { phase: "Phase 2: BI Dashboarding & Data Visualization", duration: "3-4 Weeks", goals: ["Build 3 interactive executive dashboards in PowerBI/Tableau", "Publish data analysis case studies on GitHub & Kaggle"] },
        { phase: "Phase 3: Machine Learning & Business Analytics", duration: "4 Weeks", goals: ["Train baseline predictive regression & classification models", "Learn cohort analysis & funnel conversion metrics"] },
        { phase: "Phase 4: Targeted Data Applications", duration: "Ongoing", goals: ["Apply to 15+ Data Analyst & BI Trainee roles", "Practice technical SQL live coding challenges"] }
      ],
      questions: [
        `How do you handle missing or duplicate values when cleaning a high-volume dataset for a ${targetRole} project?`,
        "Explain the difference between WHERE and HAVING clauses in SQL, and give a scenario where you must use a Window function like RANK().",
        "Walk me through how you would design an executive dashboard to track weekly user retention and churn rates."
      ]
    };
  } else if (roleLower.includes("cyber") || roleLower.includes("security") || roleLower.includes("soc")) {
    return {
      roadmap: [
        { phase: "Phase 1: Networking & Linux Hardening", duration: "2-3 Weeks", goals: ["Master OSI model, TCP/IP handshake, and subnetting", "Gain speed with Linux CLI administration & bash scripting"] },
        { phase: "Phase 2: TryHackMe & Vulnerability Assessment", duration: "3-4 Weeks", goals: ["Complete TryHackMe Cyber Defense / Pentesting pathways", "Learn Nmap scanning, Wireshark packet capture, and Burp Suite"] },
        { phase: "Phase 3: SOC Analysis & SIEM Tools", duration: "4 Weeks", goals: ["Set up local Splunk/Elastic lab for log analysis", "Write incident response reports for 3 simulated threat scenarios"] },
        { phase: "Phase 4: Industry Certification & Job Applications", duration: "Ongoing", goals: ["Prepare for CompTIA Security+ or eJPT exam", "Apply for SOC Analyst & Security Internships"] }
      ],
      questions: [
        `In a ${targetRole} interview, how would you investigate a sudden spike in outbound DNS traffic from an internal server?`,
        "Explain the 3-way TCP handshake and describe how a SYN Flood Denial-of-Service attack works.",
        "What is the difference between Symmetric and Asymmetric encryption, and when should each be used?"
      ]
    };
  } else if (roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux")) {
    return {
      roadmap: [
        { phase: "Phase 1: Design Systems & Figma Mastery", duration: "2 Weeks", goals: ["Master Figma auto-layout, interactive components, and variant sets", "Study Apple Human Interface & Google Material Design 3 guidelines"] },
        { phase: "Phase 2: User Research & Wireframing Case Study", duration: "3 Weeks", goals: ["Conduct 5 user interviews for a problem statement", "Draft low-fidelity wireframes and high-fidelity interactive prototypes"] },
        { phase: "Phase 3: Portfolio Website Build", duration: "3 Weeks", goals: ["Publish an online design portfolio with 2 detailed case studies", "Include user flow diagrams, persona maps, and usability test metrics"] },
        { phase: "Phase 4: Design Critique & Applications", duration: "Ongoing", goals: ["Participate in daily UI design challenges", "Apply for Product Design & UI/UX Internships"] }
      ],
      questions: [
        `Walk us through a design case study in your portfolio for a ${targetRole} role. How did user research inform your UI decisions?`,
        "How do you hand off designs to front-end developers to ensure responsive fidelity and accurate spacing?",
        "How do you conduct usability testing when working with tight deadlines and limited budget?"
      ]
    };
  } else if (roleLower.includes("devops") || roleLower.includes("cloud")) {
    return {
      roadmap: [
        { phase: "Phase 1: Linux Administration & Docker", duration: "2-3 Weeks", goals: ["Containerize a multi-service web application with Docker Compose", "Master Linux bash scripting and SSH key management"] },
        { phase: "Phase 2: CI/CD Automation & GitHub Actions", duration: "3 Weeks", goals: ["Write GitHub Actions workflows to auto-build, test, and deploy code", "Configure automated test runners and environment secrets"] },
        { phase: "Phase 3: AWS Cloud & Infrastructure as Code", duration: "4 Weeks", goals: ["Deploy containerized apps to AWS ECS/EC2 using Terraform", "Set up CloudWatch monitoring and automated alerts"] },
        { phase: "Phase 4: Certification & Job Search", duration: "Ongoing", goals: ["Study for AWS Certified Cloud Practitioner / Solutions Architect", "Apply to Cloud & DevOps Trainee programs"] }
      ],
      questions: [
        `As a ${targetRole}, how do you ensure zero-downtime deployments when pushing new container builds to production?`,
        "Explain the difference between Docker images and Docker containers, and how Docker Compose manages multi-container applications.",
        "Describe Infrastructure as Code (IaC) and explain why Terraform is preferred over manual cloud console configuration."
      ]
    };
  } else if (roleLower.includes("product") || roleLower.includes("project")) {
    return {
      roadmap: [
        { phase: "Phase 1: Product Specs & PRD Writing", duration: "2 Weeks", goals: ["Write 2 comprehensive Product Requirement Documents (PRDs)", "Master Jira / Trello story mapping and sprint planning"] },
        { phase: "Phase 2: Product Metrics & A/B Testing", duration: "3 Weeks", goals: ["Learn conversion funnels, DAU/MAU metrics, and churn analysis", "Design an A/B test proposal with clear hypotheses & success criteria"] },
        { phase: "Phase 3: Product Deconstruct Case Studies", duration: "3 Weeks", goals: ["Deconstruct 3 popular apps (e.g., Spotify, WhatsApp, Notion) identifying feature gaps", "Present feature teardowns on LinkedIn & Medium"] },
        { phase: "Phase 4: APM Program Applications", duration: "Ongoing", goals: ["Apply to Associate Product Manager (APM) graduate programs", "Practice product design and estimation interview questions"] }
      ],
      questions: [
        `How would you measure the success of a new feature launched for a ${targetRole} initiative?`,
        "How do you prioritize competing feature requests from engineering leads, designers, and marketing stakeholders?",
        "Tell me about a product you use daily that has a flaw. How would you redesign it to solve that issue?"
      ]
    };
  } else {
    return {
      roadmap: [
        { phase: "Phase 1: Resume & GitHub Portfolio Polish", duration: "1-2 Weeks", goals: [`Align resume keywords with ${targetRole} job descriptions`, "Deploy 2 full-stack applications with live URLs and GitHub READMEs"] },
        { phase: "Phase 2: Data Structures & Live Coding", duration: "3-4 Weeks", goals: ["Solve 30 LeetCode Medium problems covering arrays, trees, and dynamic programming", "Practice time & space complexity analysis (Big-O)"] },
        { phase: "Phase 3: System Design & API Engineering", duration: "3 Weeks", goals: ["Learn database indexing, caching strategies (Redis), and microservices", "Build and document a scalable RESTful backend service"] },
        { phase: "Phase 4: Targeted Applications & Mock Interviews", duration: "Ongoing", goals: [`Apply to 15+ top companies offering ${targetRole} roles`, "Conduct 3 peer mock technical interviews"] }
      ],
      questions: [
        `For a ${targetRole} position, how do you handle state management and performance optimization in modern web applications?`,
        "Explain the difference between SQL and NoSQL databases, and when you would choose one over the other for a scalable project.",
        "Walk me through how you debug a production memory leak or slow API response time in a multi-user app."
      ]
    };
  }
}

export const InternshipCareerHub: React.FC<InternshipCareerHubProps> = ({
  studentProfile,
  careerProfile,
  studentCgpa = 0,
  onUpdateCareerProfile,
  savedInternshipIds,
  onToggleSaveInternship
}) => {
  const [internships] = useState<Internship[]>(INITIAL_INTERNSHIPS);
  const [activeSubTab, setActiveSubTab] = useState<"internships" | "resume" | "roadmap">("internships");

  // Official Verified Profile Baseline Values
  const verifiedMajor = studentProfile?.degree || careerProfile.major || "";
  const verifiedCgpa = studentCgpa || careerProfile.cgpa || 0;
  const verifiedTargetRole = careerProfile.targetRole || "";
  const verifiedSkills = careerProfile.skills || [];

  // EDITABLE CUSTOM SEARCH & FILTER SESSION STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRole, setSearchRole] = useState(verifiedTargetRole);
  const [searchIndustry, setSearchIndustry] = useState<string>("All");
  const [searchDegree, setSearchDegree] = useState(verifiedMajor);
  const [searchCgpa, setSearchCgpa] = useState<number>(verifiedCgpa);
  const [searchSkills, setSearchSkills] = useState<string[]>(verifiedSkills);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [searchExperienceLevel, setSearchExperienceLevel] = useState<string>("All");
  const [searchCountry, setSearchCountry] = useState<string>("All");
  const [searchCity, setSearchCity] = useState<string>("All");
  const [searchWorkMode, setSearchWorkMode] = useState<string>("All");
  const [searchEmploymentType, setSearchEmploymentType] = useState<string>("All");
  const [searchVisaSponsorship, setSearchVisaSponsorship] = useState<string>("All");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Resume text & uploaded file state
  const [resumeTextInput, setResumeTextInput] = useState(careerProfile.resumeText || "");
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{ name: string; size: string } | null>(null);

  // Roadmap Goal Progress Checkboxes State
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  // AI Assistant States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCareerData, setAiCareerData] = useState<any | null>(null);

  // Check if active search criteria differ from official verified profile
  const isCustomizedSearch =
    searchRole !== verifiedTargetRole ||
    searchDegree !== verifiedMajor ||
    Math.abs(searchCgpa - verifiedCgpa) > 0.01 ||
    searchSkills.length !== verifiedSkills.length ||
    !searchSkills.every((sk) => verifiedSkills.includes(sk)) ||
    searchIndustry !== "All" ||
    searchWorkMode !== "All" ||
    searchEmploymentType !== "All" ||
    searchCountry !== "All" ||
    searchCity !== "All" ||
    searchExperienceLevel !== "All" ||
    searchVisaSponsorship !== "All";

  // Reset Search Filters back to Verified Profile
  const handleResetFiltersToVerifiedProfile = () => {
    setSearchQuery("");
    setSearchRole(verifiedTargetRole);
    setSearchIndustry("All");
    setSearchDegree(verifiedMajor);
    setSearchCgpa(verifiedCgpa);
    setSearchSkills([...verifiedSkills]);
    setSearchExperienceLevel("All");
    setSearchCountry("All");
    setSearchCity("All");
    setSearchWorkMode("All");
    setSearchEmploymentType("All");
    setSearchVisaSponsorship("All");
  };

  // Sync / Update Official Profile with current customized inputs
  const handleSyncToOfficialProfile = () => {
    onUpdateCareerProfile({
      ...careerProfile,
      targetRole: searchRole,
      major: searchDegree,
      cgpa: searchCgpa,
      skills: searchSkills,
      resumeText: resumeTextInput
    });
  };

  // Add & Remove Custom Search Skills
  const handleAddSearchSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!searchSkills.includes(newSkillInput.trim())) {
      setSearchSkills([...searchSkills, newSkillInput.trim()]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSearchSkill = (skillToRemove: string) => {
    setSearchSkills(searchSkills.filter((s) => s !== skillToRemove));
  };

  // Switch role directly and re-run analysis
  const handleSelectPresetRole = (role: string) => {
    setSearchRole(role);
    handleAskCareerAI(`Evaluate career fit and roadmap for role: ${role}`, resumeTextInput, role);
  };

  // Handle File Upload for CV / Resume (.pdf, .docx, .txt, .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeStr = (file.size / 1024).toFixed(1) + " KB";
    setUploadedFileMeta({ name: file.name, size: fileSizeStr });

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result;
      if (typeof rawResult === "string") {
        let cleanText = rawResult;
        // Strip non-printable characters for binary file types
        if (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
          cleanText = rawResult.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
        }
        setResumeTextInput(cleanText);
        // Automatically run ATS analysis on the uploaded CV for the active searchRole
        handleAskCareerAI(`Evaluate ATS Score for uploaded CV: ${file.name}`, cleanText, searchRole);
      }
    };
    reader.readAsText(file);
  };

  // AI Career Assistant Call passing custom search criteria
  const handleAskCareerAI = async (queryStr?: string, customCvText?: string, customRole?: string) => {
    setAiLoading(true);
    const activeRoleToUse = customRole || searchRole;
    const cvTextToUse = customCvText !== undefined ? customCvText : resumeTextInput;

    try {
      const response = await fetch("/api/ai/career-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryStr || `Evaluate ATS score and career roadmap for ${activeRoleToUse}`,
          resumeText: cvTextToUse || `Student in ${searchDegree} seeking ${activeRoleToUse} role`,
          targetRole: activeRoleToUse,
          studentMajor: searchDegree,
          studentCgpa: searchCgpa,
          studentSkills: searchSkills,
          workMode: searchWorkMode,
          employmentType: searchEmploymentType,
          preferredCountry: searchCountry,
          preferredCity: searchCity,
          industry: searchIndustry,
          experienceLevel: searchExperienceLevel,
          visaSponsorship: searchVisaSponsorship === "Visa Sponsorship Available",
          studentProfile
        })
      });

      if (!response.ok) throw new Error("Career AI service failed.");
      const data = await response.json();
      setAiCareerData(data);

      if (data.resumeScore) {
        onUpdateCareerProfile({
          ...careerProfile,
          targetRole: activeRoleToUse,
          resumeText: cvTextToUse,
          resumeScore: data.resumeScore
        });
      }
    } catch (err) {
      console.error("Career AI error:", err);
      // Dynamic local fallback
      const computedScore = calculateLocalAtsScore(cvTextToUse, activeRoleToUse, searchSkills);
      const roleRoadmap = generateLocalRoadmap(activeRoleToUse, searchDegree);

      setAiCareerData({
        resumeScore: computedScore.totalScore,
        profileStrength: computedScore.totalScore >= 85 ? "Exceptional" : computedScore.totalScore >= 70 ? "Strong" : "Developing",
        overallAdvice: `CV analyzed against target role: "${activeRoleToUse}". ${computedScore.feedback}`,
        missingSkills: computedScore.missingRoleSkills,
        resumeImprovements: [
          `Align resume bullet points specifically with keywords for ${activeRoleToUse}.`,
          "Quantify achievement metrics (e.g., 'Improved performance by 30%', 'Managed 10+ student accounts').",
          "Add live links to GitHub projects and interactive web/design portfolios.",
          "Ensure single-column ATS-friendly structure without tables or complex icons."
        ],
        recommendedInternships: [
          { title: `${activeRoleToUse} Intern / Trainee`, type: "Full-time", matchPercentage: Math.min(96, computedScore.totalScore + 5), keyFocus: `Tailored match for ${activeRoleToUse}` }
        ],
        careerRoadmap: roleRoadmap.roadmap,
        interviewQuestions: roleRoadmap.questions
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle milestone checkbox in roadmap
  const handleToggleMilestone = (goal: string) => {
    if (completedMilestones.includes(goal)) {
      setCompletedMilestones(completedMilestones.filter((g) => g !== goal));
    } else {
      setCompletedMilestones([...completedMilestones, goal]);
    }
  };

  // Instant local ATS score calculation for display
  const localAtsInfo = calculateLocalAtsScore(resumeTextInput, searchRole, searchSkills);
  const activeRoadmapInfo = generateLocalRoadmap(searchRole, searchDegree);

  // Filter & Rank Opportunities against Active Search Criteria
  const filteredInternships = internships.map((item) => {
    // Skill match count
    const matchedSkills = item.requiredSkills.filter((reqSkill) =>
      searchSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    // Free text search query check across all fields
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      (item.city && item.city.toLowerCase().includes(q)) ||
      (item.country && item.country.toLowerCase().includes(q)) ||
      (item.industry && item.industry.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q) ||
      (item.workMode && item.workMode.toLowerCase().includes(q)) ||
      item.requiredSkills.some((s) => s.toLowerCase().includes(q));

    // Target Role match check
    const r = searchRole.toLowerCase().trim();
    const roleKeywords = r.split(/\s+/).filter((w) => w.length > 2);
    const matchesRole =
      !r ||
      roleKeywords.length === 0 ||
      roleKeywords.some(
        (kw) =>
          item.title.toLowerCase().includes(kw) ||
          (item.industry && item.industry.toLowerCase().includes(kw)) ||
          item.description.toLowerCase().includes(kw) ||
          item.requiredSkills.some((s) => s.toLowerCase().includes(kw)) ||
          item.targetMajors.some((m) => m.toLowerCase().includes(kw))
      );

    // Degree match
    const majorCheck = searchDegree.toLowerCase();
    const matchesMajor = item.targetMajors.some(
      (m) =>
        m.toLowerCase().includes("all") ||
        majorCheck.includes(m.toLowerCase()) ||
        (m.toLowerCase().includes("computer") && majorCheck.includes("computer")) ||
        (m.toLowerCase().includes("software") && majorCheck.includes("software")) ||
        (m.toLowerCase().includes("data") && majorCheck.includes("data"))
    );

    // CGPA match
    const meetsCgpa = item.minCgpa ? searchCgpa >= item.minCgpa : true;

    // Work Mode match
    const matchesWorkMode =
      searchWorkMode === "All" ||
      !item.workMode ||
      item.workMode === searchWorkMode ||
      item.location.toLowerCase().includes(searchWorkMode.toLowerCase());

    // Employment type match
    const matchesType =
      searchEmploymentType === "All" ||
      item.type === searchEmploymentType;

    // Industry match
    const matchesIndustry =
      searchIndustry === "All" ||
      !item.industry ||
      item.industry === searchIndustry;

    // Country match
    const matchesCountry =
      searchCountry === "All" ||
      !item.country ||
      item.country.toLowerCase().includes(searchCountry.toLowerCase()) ||
      item.location.toLowerCase().includes(searchCountry.toLowerCase());

    // City match
    const matchesCity =
      searchCity === "All" ||
      !item.city ||
      item.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      item.location.toLowerCase().includes(searchCity.toLowerCase());

    // Experience Level match
    const matchesExp =
      searchExperienceLevel === "All" ||
      !item.experienceLevel ||
      item.experienceLevel === searchExperienceLevel;

    // Visa match
    const matchesVisa =
      searchVisaSponsorship === "All" ||
      (searchVisaSponsorship === "Visa Sponsorship Available" ? item.visaSponsorship === true : true);

    // Match score calculation
    let matchScore = 50;
    if (matchedSkills.length > 0) {
      matchScore += Math.min(30, (matchedSkills.length / item.requiredSkills.length) * 30);
    }
    if (meetsCgpa) matchScore += 10;
    if (matchesMajor) matchScore += 10;
    if (matchesWorkMode) matchScore += 5;
    if (matchesType) matchScore += 5;

    const finalMatchPercentage = Math.min(98, Math.max(45, Math.round(matchScore)));

    const skillRatio = `${matchedSkills.length}/${item.requiredSkills.length} required skills (${matchedSkills.join(", ") || "None matched yet"})`;
    const cgpaRationale = meetsCgpa
      ? `Search CGPA (${searchCgpa.toFixed(2)}) meets min requirement (${item.minCgpa || 2.5}).`
      : `Search CGPA (${searchCgpa.toFixed(2)}) is below ${item.minCgpa || 3.0} requirement.`;
    const modeRationale = matchesWorkMode ? `Work Mode matches (${item.workMode || item.type}).` : `Work Mode differs (${item.workMode || item.type} vs ${searchWorkMode}).`;

    const matchRationale = `${skillRatio}. ${cgpaRationale} ${modeRationale}`;

    const isFullyMatched =
      matchesQuery &&
      matchesRole &&
      matchesWorkMode &&
      matchesType &&
      matchesIndustry &&
      matchesCountry &&
      matchesCity &&
      matchesExp &&
      matchesVisa;

    return {
      ...item,
      dynamicMatchPercentage: finalMatchPercentage,
      matchRationale,
      isFullyMatched,
      matchedSkillsCount: matchedSkills.length
    };
  }).filter((item) => item.isFullyMatched);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-900/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold mb-3">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              <span>Session-Customizable Career Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Internship & Career Search Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically customize target roles, career goals, uploaded CVs, and filters to evaluate real-time ATS scores, role-specific career roadmaps, and internship opportunities.
            </p>
          </div>

          {/* Official Verified Student Profile Card */}
          <div className="bg-indigo-900/60 border border-indigo-700/60 rounded-2xl p-4 min-w-[280px] shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-2">
              <span className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-wider flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                Verified Student Record
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Portal Database
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-white flex items-center justify-between">
                <span>{studentProfile?.studentName || "Student"}</span>
                <span className="text-xs text-indigo-300 font-mono font-medium">{studentProfile?.studentId || "N/A"}</span>
              </p>
              <p className="text-xs text-indigo-200 mt-0.5">
                {verifiedMajor}
              </p>
              <p className="text-[11px] text-indigo-300/80 truncate">
                {studentProfile?.university || "University"}
              </p>
            </div>

            <div className="pt-2 border-t border-indigo-700/60 flex items-center justify-between text-xs">
              <span className="text-indigo-200">
                Official CGPA: <strong className="text-amber-300 font-mono text-sm">{verifiedCgpa.toFixed(2)}</strong>
              </span>
              <span className="text-indigo-300 font-mono text-[11px]">
                Target: <strong className="text-emerald-300 font-bold">{searchRole}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH CRITERIA MODIFIER PANEL & ROLE SELECTOR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span>Target Role & Career Criteria Controls</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or type any desired job role to re-orient ATS resume scoring, career roadmap phases, and opportunity search.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCustomizedSearch && (
              <button
                onClick={handleResetFiltersToVerifiedProfile}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                title="Restore search filters to official profile data"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset Profile</span>
              </button>
            )}

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-indigo-200 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
              <span>{showAdvancedFilters ? "Hide Filters" : "More Filters"}</span>
            </button>
          </div>
        </div>

        {/* Target Role Field + Preset Role Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-indigo-600" />
              <span>Desired Career Goal / Target Role:</span>
            </label>
            <span className="text-[11px] text-slate-500">Click a preset role chip or type custom role:</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Scientist, Cyber Security Analyst..."
              className="flex-1 bg-indigo-50/50 border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleAskCareerAI(`Evaluate career fit and roadmap for role: ${searchRole}`)}
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>Apply Role to AI Engine</span>
            </button>
          </div>

          {/* Preset Role Quick Selector Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
            {PRESET_CAREER_ROLES.map((r, i) => {
              const isSelected = searchRole.toLowerCase().includes(r.toLowerCase().split(" ")[0]);
              return (
                <button
                  key={i}
                  onClick={() => handleSelectPresetRole(r)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Degree Program
            </label>
            <input
              type="text"
              value={searchDegree}
              onChange={(e) => setSearchDegree(e.target.value)}
              placeholder="e.g. BS Computer Science, BS IT"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
              <span>Simulated CGPA</span>
              <span className="text-indigo-600 font-mono font-bold">{searchCgpa.toFixed(2)}</span>
            </label>
            <input
              type="number"
              step="0.05"
              min="0.00"
              max="4.00"
              value={searchCgpa}
              onChange={(e) => setSearchCgpa(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Work Mode
            </label>
            <select
              value={searchWorkMode}
              onChange={(e) => setSearchWorkMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Career Field / Industry
            </label>
            <select
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Industries</option>
              <option value="Software & Cloud Engineering">Software & Cloud Engineering</option>
              <option value="Data & Artificial Intelligence">Data & Artificial Intelligence</option>
              <option value="Cyber Security & SOC">Cyber Security & SOC</option>
              <option value="UI/UX & Product Design">UI/UX & Product Design</option>
              <option value="Finance & Fintech">Finance & Fintech</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Employment Type
              </label>
              <select
                value={searchEmploymentType}
                onChange={(e) => setSearchEmploymentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Summer Internship">Summer Internship</option>
                <option value="Graduate Program">Graduate Program</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Preferred Country
              </label>
              <select
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="All">Any Country / Worldwide</option>
                <option value="Pakistan">Pakistan</option>
                <option value="United States">United States</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="Germany">Germany</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Preferred City
              </label>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="All">Any City</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Remote">Remote Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Experience Level
              </label>
              <select
                value={searchExperienceLevel}
                onChange={(e) => setSearchExperienceLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="All">All Experience Levels</option>
                <option value="Student / Intern">Student / Intern</option>
                <option value="Fresh Graduate">Fresh Graduate</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Skills Tags Manager */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
            Active Technical Skills Filter ({searchSkills.length})
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {searchSkills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSearchSkill(skill)}
                  className="text-indigo-400 hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSearchSkill()}
                placeholder="+ Add skill..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-28"
              />
              <button
                onClick={handleAddSearchSkill}
                className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM SEARCH ACTIVE NOTICE BANNER */}
      {isCustomizedSearch && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 flex items-center gap-2">
                <span>Custom Session Search Criteria Active</span>
                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold">
                  Simulation Mode
                </span>
              </p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Recommendations & ATS evaluation are configured for: Role: <strong>{searchRole}</strong>, Major: <strong>{searchDegree}</strong>, CGPA: <strong>{searchCgpa.toFixed(2)}</strong>. Official student profile: <strong>{verifiedTargetRole}</strong>, <strong>{verifiedMajor}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetFiltersToVerifiedProfile}
              className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-xl transition text-xs flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              onClick={handleSyncToOfficialProfile}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs text-xs flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Sync to Official Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("internships")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === "internships"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Opportunity Recommendations ({filteredInternships.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("resume")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === "resume"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>CV Upload & ATS Score Analyzer</span>
        </button>

        <button
          onClick={() => setActiveSubTab("roadmap")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === "roadmap"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Career Roadmap & Interview Prep</span>
        </button>
      </div>

      {/* Subtab 1: Internships Opportunities */}
      {activeSubTab === "internships" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3">
            <p className="text-xs font-bold text-slate-600">
              Showing <span className="text-indigo-600 font-mono text-sm">{filteredInternships.length}</span> verified roles matching search for <strong className="text-slate-900">"{searchRole}"</strong>
            </p>

            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, title, skills, location..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* OPPORTUNITIES GRID */}
          {filteredInternships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInternships.map((internship) => {
                const isSaved = savedInternshipIds.includes(internship.id);

                return (
                  <div
                    key={internship.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-indigo-50 border border-indigo-200/80 text-indigo-800 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-indigo-600" />
                          {internship.type}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {internship.dynamicMatchPercentage}% Match
                          </span>

                          <button
                            onClick={() => onToggleSaveInternship(internship.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                          >
                            {isSaved ? <BookmarkCheck className="h-4 w-4 text-indigo-600" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {internship.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {internship.company} • <span className="text-slate-600">{internship.location}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Stipend / Package</span>
                          <span className="font-bold text-indigo-700 mt-0.5 block">{internship.stipend}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Min CGPA & Deadline</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                            Min CGPA: {internship.minCgpa || 2.5} • {internship.deadline}
                          </span>
                        </div>
                      </div>

                      {/* Required Skills Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {internship.requiredSkills.map((sk, idx) => {
                          const isSkillMatched = searchSkills.some(
                            (s) => s.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(s.toLowerCase())
                          );
                          return (
                            <span
                              key={idx}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                isSkillMatched
                                  ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                      </div>

                      {/* Match Justification Rationale Box */}
                      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                        <p className="font-bold text-indigo-950 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Match Rationale:</span>
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 font-normal">
                            {isCustomizedSearch ? "Evaluated vs Session Criteria" : "Evaluated vs Verified Record"}
                          </span>
                        </p>
                        <p className="text-slate-600 leading-snug">
                          {internship.matchRationale}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {internship.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() =>
                          handleAskCareerAI(
                            `Evaluate my fit for ${internship.title} at ${internship.company} given my active search parameters (Role: ${searchRole}, CGPA: ${searchCgpa.toFixed(2)}, Major: ${searchDegree})`
                          )
                        }
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Ask AI Match Analysis</span>
                      </button>

                      <a
                        href={internship.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5"
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* NO RESULTS PANEL WITH SMART RELAXATION TIPS */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  No Opportunities Match Your Active Search Parameters
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Try broadening your target job role or clearing location/industry filters using the quick controls below.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setSearchRole("Software Engineer")}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 transition"
                >
                  Show Software Engineer Roles
                </button>
                <button
                  onClick={() => setSearchRole("Data")}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 transition"
                >
                  Show Data & Analytics Roles
                </button>
                <button
                  onClick={handleResetFiltersToVerifiedProfile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: CV Upload & ATS Analyzer */}
      {activeSubTab === "resume" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Upload CV / Resume & Run Real-Time ATS Audit</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your CV (.pdf, .docx, .txt) or paste your resume text to compute an ATS score tailored specifically to your target role: <strong className="text-indigo-700">{searchRole}</strong>.
              </p>
            </div>

            <button
              onClick={() => handleAskCareerAI(`Audit ATS score for role: ${searchRole}`)}
              disabled={aiLoading || !resumeTextInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-2xl transition shadow-sm flex items-center gap-1.5 shrink-0"
            >
              {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>Re-Run AI ATS Audit</span>
            </button>
          </div>

          {/* FILE UPLOAD DROPZONE */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-50/30 border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition relative">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to upload CV / Resume file"
            />
            <div className="max-w-sm mx-auto space-y-2 pointer-events-none">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">
                  Click to Upload or Drag & Drop your CV / Resume File
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports PDF, DOCX, DOC, TXT, or Markdown files
                </p>
              </div>

              {uploadedFileMeta && (
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-bold mt-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>{uploadedFileMeta.name} ({uploadedFileMeta.size})</span>
                </div>
              )}
            </div>
          </div>

          {/* RESUME DRAFT TEXTAREA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Extracted CV Content / Editable Resume Text:</span>
              <span className="text-[11px] text-slate-400 font-mono">{resumeTextInput.length} characters</span>
            </label>
            <textarea
              value={resumeTextInput}
              onChange={(e) => setResumeTextInput(e.target.value)}
              placeholder="Or paste your resume draft here (e.g. Education, Work Experience, Projects, Skills, Certifications)..."
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* REAL-TIME DYNAMIC ATS SCORE CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ATS Score Gauge Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Calculated ATS Score
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Target: {searchRole}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-amber-300 font-mono">
                  {aiCareerData?.resumeScore || localAtsInfo.totalScore}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${aiCareerData?.resumeScore || localAtsInfo.totalScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Profile Rating: <strong className="text-emerald-300">{aiCareerData?.profileStrength || (localAtsInfo.totalScore >= 75 ? "Strong" : "Developing")}</strong>. Computed using role keywords and action verbs.
              </p>
            </div>

            {/* Keyword Match Breakdown */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 font-mono block">
                Role Keyword Alignment
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {localAtsInfo.keywordMatchPct}% Match for "{searchRole}"
              </p>
              <p className="text-slate-600 text-[11px]">
                Found {localAtsInfo.verbsCount} action verbs and {localAtsInfo.skillsFoundCount} verified technical skills in CV.
              </p>
            </div>

            {/* Missing Skills Warning */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 font-mono flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-rose-600" />
                Missing Role Skills to Add
              </span>
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {(aiCareerData?.missingSkills || localAtsInfo.missingRoleSkills).slice(0, 4).map((ms: string, idx: number) => (
                  <span key={idx} className="bg-white border border-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    + {ms}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI ATS Detailed Feedback */}
          {aiCareerData && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span>AI ATS Detailed Audit for "{searchRole}"</span>
                </span>
              </div>

              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {aiCareerData.overallAdvice}
              </p>

              {/* Bullet Points */}
              {aiCareerData.resumeImprovements && (
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-indigo-600" /> Key Resume Improvements for {searchRole}:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {aiCareerData.resumeImprovements.map((imp: string, i: number) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Career Roadmap & Interview Prep */}
      {activeSubTab === "roadmap" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span>Personalized Career Roadmap for {searchRole}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Milestone goals and interview preparation custom-generated for career goal: <strong className="text-indigo-700">{searchRole}</strong> ({searchDegree}).
              </p>
            </div>

            <button
              onClick={() => handleAskCareerAI(`Generate career roadmap for ${searchRole}`)}
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-2xl transition shadow-sm flex items-center gap-1.5 shrink-0"
            >
              {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span>Regenerate Roadmap with AI</span>
            </button>
          </div>

          {/* Quick Career Goal Switcher inside Roadmap Tab */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              Change Active Career Goal:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_CAREER_ROLES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectPresetRole(r)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition ${
                    searchRole.toLowerCase().includes(r.toLowerCase().split(" ")[0])
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Goals Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sequential Roadmap Milestones ({completedMilestones.length} Completed)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(aiCareerData?.careerRoadmap || activeRoadmapInfo.roadmap).map((roadmapItem: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {roadmapItem.phase}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                      {roadmapItem.duration}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {roadmapItem.goals.map((goal: string, i: number) => {
                      const isCompleted = completedMilestones.includes(goal);
                      return (
                        <li
                          key={i}
                          onClick={() => handleToggleMilestone(goal)}
                          className="flex items-start gap-2 cursor-pointer hover:text-indigo-600 transition"
                        >
                          {isCompleted ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isCompleted ? "line-through text-slate-400" : "text-slate-700 font-medium"}>
                            {goal}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Practice Questions tailored for active role */}
          <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-5 text-xs space-y-3">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Mock Interview Questions for "{searchRole}":</span>
            </h4>
            <div className="space-y-2 pt-1">
              {(aiCareerData?.interviewQuestions || activeRoadmapInfo.questions).map((q: string, i: number) => (
                <div key={i} className="bg-white border border-indigo-100 rounded-xl p-3.5 font-semibold text-slate-800 shadow-2xs">
                  <span className="text-indigo-600 font-bold mr-1.5">Q{i + 1}:</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipCareerHub;
