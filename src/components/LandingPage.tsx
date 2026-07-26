import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  GraduationCap, 
  CheckSquare, 
  Wallet, 
  Award, 
  Briefcase, 
  Compass, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Users, 
  Globe2, 
  HelpCircle, 
  Mail, 
  ChevronDown, 
  Star, 
  Search, 
  FileText, 
  BarChart3, 
  Send, 
  Layers, 
  LogIn, 
  UserPlus, 
  ExternalLink,
  BookOpen,
  Check,
  TrendingUp,
  Cpu,
  Bookmark,
  ChevronRight,
  Menu,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getGoogleAccessToken, signInWithGoogleWithGmail } from "../lib/firebase";

// Generated hero and app mockup assets
import heroImage from "../assets/images/unihub_ai_student_hero_1784998602055.jpg";
import mockupImage from "../assets/images/student_app_mockup_1784981725608.jpg";

interface LandingPageProps {
  onEnterDashboard: (tab?: string) => void;
  onOpenAuthModal: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
}

export default function LandingPage({
  onEnterDashboard,
  onOpenAuthModal,
  isAuthenticated,
  userEmail
}: LandingPageProps) {
  // Navigation & Interactive States
  const [activeTab, setActiveTab] = useState<"study" | "gpa" | "scholarship" | "career" | "uniguide">("gpa");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", university: "", message: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Interactive Live Demo Sandbox State
  const [demoCredits, setDemoCredits] = useState<number>(12);
  const [demoGrade, setDemoGrade] = useState<string>("A");
  const [demoGpaResult, setDemoGpaResult] = useState<number>(4.00);

  const handleCalculateDemoGpa = (grade: string, credits: number = demoCredits) => {
    setDemoGrade(grade);
    setDemoCredits(credits);
    let g = 4.0;
    if (grade === "A") g = 4.0;
    if (grade === "A-") g = 3.7;
    if (grade === "B+") g = 3.5;
    if (grade === "B") g = 3.0;
    setDemoGpaResult(g);
  };

  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) return;
    setGmailError(null);
    setIsSendingGmail(true);

    try {
      let token = getGoogleAccessToken();
      if (!token) {
        // Trigger Google Sign in with Gmail scope
        const res = await signInWithGoogleWithGmail();
        token = res.accessToken;
      }

      if (!token) {
        throw new Error("Gmail authorization was not granted. Please authorize Gmail access to send feedback directly to Gmail.");
      }

      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          name: contactForm.name,
          email: contactForm.email,
          university: contactForm.university,
          message: contactForm.message
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver email via Gmail API.");
      }

      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setContactForm({ name: "", email: "", university: "", message: "" });
      }, 5000);
    } catch (err: any) {
      console.error("Gmail send error:", err);
      setGmailError(err?.message || "Could not deliver email via Gmail API.");
    } finally {
      setIsSendingGmail(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-x-hidden">
      
      {/* BACKGROUND DECORATIVE GLOW ACCENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* FIXED HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* BRAND LOGO & VISION TAG */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-mono">UniHub<span className="text-indigo-400">.AI</span></span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full uppercase tracking-wider">
                  Official Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">University Student Operating System</p>
            </div>
          </div>

          {/* STREAMLINED DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => scrollToSection("features")} className="hover:text-white transition py-1">Features</button>
            <button onClick={() => scrollToSection("aimodules")} className="hover:text-white transition py-1">AI Modules</button>
            <button onClick={() => scrollToSection("journey")} className="hover:text-white transition py-1">Student Journey</button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-white transition py-1">FAQ</button>
            
            {/* MORE DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setMoreMenuOpen(!moreMenuOpen)} 
                className="flex items-center gap-1 hover:text-white transition py-1 px-2 rounded-lg hover:bg-slate-900"
              >
                <span>More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreMenuOpen ? "rotate-180 text-indigo-400" : ""}`} />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                  >
                    <button 
                      onClick={() => scrollToSection("screenshots")} 
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-lg transition flex items-center gap-2"
                    >
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Screenshots</span>
                    </button>
                    <button 
                      onClick={() => scrollToSection("about")} 
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-lg transition flex items-center gap-2"
                    >
                      <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>About & Vision</span>
                    </button>
                    <button 
                      onClick={() => scrollToSection("contact")} 
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-lg transition flex items-center gap-2"
                    >
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Contact Us</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* RIGHT ACTION BUTTONS & HAMBURGER TOGGLE */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline-block text-[11px] font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-full">
                  Signed in as <strong className="text-white font-semibold">{userEmail?.split('@')[0]}</strong>
                </span>
                <button
                  onClick={() => onEnterDashboard()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 border border-indigo-400/30"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="hidden sm:flex text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition items-center gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onEnterDashboard()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 border border-white/20"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}

            {/* HAMBURGER TOGGLE BUTTON FOR MOBILE / TABLET */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-indigo-400" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE DRAWER NAV MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-slate-800/80 mt-3 pt-3 pb-2 bg-slate-950/95 backdrop-blur-2xl"
            >
              <div className="flex flex-col space-y-1 px-2">
                <button
                  onClick={() => scrollToSection("features")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span>Features</span>
                </button>
                <button
                  onClick={() => scrollToSection("aimodules")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span>AI Modules</span>
                </button>
                <button
                  onClick={() => scrollToSection("journey")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span>Student Journey</span>
                </button>
                <button
                  onClick={() => scrollToSection("screenshots")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>Screenshots</span>
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Globe2 className="h-4 w-4 text-sky-400" />
                  <span>About & Vision</span>
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <HelpCircle className="h-4 w-4 text-pink-400" />
                  <span>FAQ & Support</span>
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center gap-2.5"
                >
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <span>Contact</span>
                </button>

                {!isAuthenticated && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
                      className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onEnterDashboard(); }}
                      className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Get Started</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative z-10 pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* HERO LEFT COLUMN: Tagline, Headline, Value prop */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* VISION TAG BADGE */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>THE ALL-IN-ONE AI STUDENT OPERATING SYSTEM</span>
              <span className="bg-indigo-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">HEC Compliant</span>
            </motion.div>

            {/* MAIN HEADLINE */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-[64px] xl:text-[72px] font-black text-white tracking-tight leading-[1.08]"
            >
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">University GPA</span>, Unlock Scholarships & Launch Your Career.
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-2xl"
            >
              UniHub AI simplifies university life into one unified portal. From automated GPA predictions and AI study flashcards to official Pakistani university regulation guides, fully-funded scholarship matching, and ATS resume scoring.
            </motion.p>

            {/* ACTION CTA BUTTONS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => onEnterDashboard("academic")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition shadow-xl shadow-indigo-600/35 flex items-center gap-2 border border-indigo-400/30 group"
              >
                <span>Enter Student Hub Portal</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection("demo-sandbox")}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm px-5 py-3.5 rounded-2xl transition flex items-center gap-2"
              >
                <Cpu className="h-4 w-4 text-purple-400" />
                <span>Try Live AI Preview</span>
              </button>
            </motion.div>

            {/* QUICK FEATURE HIGHLIGHT STRIP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Free Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>HEC & Global Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Firebase Real-Time Sync</span>
              </div>
            </motion.div>

          </div>

          {/* HERO RIGHT COLUMN: Hero Graphic + Motion Glass Floating Badges */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-slate-900/50 shadow-2xl shadow-indigo-950/50 group"
            >
              <img 
                src={heroImage} 
                alt="UniHub AI Student Assistant in modern academic setting" 
                className="w-full h-[400px] sm:h-[460px] object-cover opacity-95 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-slate-950/20" />

              {/* FLOATING MOTION BADGE 1: GPA Forecast */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-6 left-6 backdrop-blur-xl bg-slate-900/85 border border-emerald-500/40 p-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs z-10"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  3.92
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Forecasted CGPA</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <span>Dean's List Eligible</span>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  </p>
                </div>
              </motion.div>

              {/* FLOATING MOTION BADGE 2: Scholarship Radar */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 right-6 backdrop-blur-xl bg-slate-900/85 border border-indigo-500/40 p-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs z-10"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Scholarship Match</p>
                  <p className="text-white font-bold">HEC Need-Based (100% Tuition)</p>
                </div>
              </motion.div>

              {/* FLOATING MOTION BADGE 3: AI Assistant Prompt */}
              <motion.div 
                animate={{ x: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 left-6 backdrop-blur-xl bg-slate-900/85 border border-purple-500/40 px-3 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-[11px] text-purple-200 z-10"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>"Generated 15 Calculus flashcards in 2.4s"</span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* TRUST METRICS BAR */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-8 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">15,000+</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Students Empowered</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">98.6%</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Scholarship Match Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">500+</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Pakistani University Rules</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Free & Firebase Synced</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO SANDBOX PREVIEW */}
      <section id="demo-sandbox" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-3.5 py-1 rounded-full">
            Interactive Live Sandbox
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
            Experience the AI Platform Before You Sign In
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Click across modules below to test live GPA calculation, scholarship filters, and AI learning tools directly on this page.
          </p>
        </div>

        {/* DEMO SANDBOX CONTAINER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* DEMO MODULE TABS */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4 mb-6">
            <button
              onClick={() => setActiveTab("gpa")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "gpa" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>GPA Forecast Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("scholarship")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "scholarship" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Scholarship Radar</span>
            </button>

            <button
              onClick={() => setActiveTab("career")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "career" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Internship Matcher</span>
            </button>

            <button
              onClick={() => setActiveTab("study")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "study" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Study Companion</span>
            </button>

            <button
              onClick={() => setActiveTab("uniguide")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "uniguide" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>UniGuide AI Helpdesk</span>
            </button>
          </div>

          {/* DEMO TAB CONTENT STAGE */}
          <div className="min-h-[220px]">
            {activeTab === "gpa" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Simulate Next Semester Impact</span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-normal">Real-Time</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Test how upcoming course credit hours and projected letter grades update your cumulative GPA.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">New Semester Credits</label>
                        <select 
                          value={demoCredits} 
                          onChange={(e) => handleCalculateDemoGpa(demoGrade, Number(e.target.value))}
                          className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
                        >
                          <option value={12}>12 Credits (4 Courses)</option>
                          <option value={15}>15 Credits (5 Courses)</option>
                          <option value={18}>18 Credits (6 Courses)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Target Letter Grade</label>
                        <div className="flex gap-1.5">
                          {["A", "A-", "B+", "B"].map((g) => (
                            <button
                              key={g}
                              onClick={() => handleCalculateDemoGpa(g)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                                demoGrade === g 
                                  ? "bg-indigo-600 text-white border-indigo-400" 
                                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CALCULATED RESULT CARD */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projected CGPA</span>
                    <p className="text-4xl font-black text-emerald-400 font-mono">{demoGpaResult.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-300">
                      {demoGpaResult >= 3.5 ? "⭐ Honors & Dean's List Tier" : "✅ Good Academic Standing"}
                    </p>
                    <button
                      onClick={() => onEnterDashboard("academic")}
                      className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>Open Full GPA Planner</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "scholarship" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Top Matched Scholarships (Verified)</h3>
                  <span className="text-xs text-indigo-400">12 Scholarships Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">HEC Need-Based Undergraduate Grant</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">100% Tuition + Monthly Stipend</span>
                    </div>
                    <p className="text-xs text-slate-400">Targeted for Pakistani university students. Covers full tuition and PKR 6,000 monthly allowance.</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">Erasmus Mundus Global Masters</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Fully Funded Europe</span>
                    </div>
                    <p className="text-xs text-slate-400">Full tuition, airfare, visa coverage, and €1,400 monthly allowance across 3 European universities.</p>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <button onClick={() => onEnterDashboard("scholarships")} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline">
                    Launch Scholarship Finder in App →
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "career" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Remote & Local Internships Matching CS / Business</h3>
                  <span className="text-xs text-indigo-400">ATS Resume Evaluator Built-In</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">Remote Frontend / React Engineer Intern</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">$800 - $1,200 / mo</span>
                    </div>
                    <p className="text-xs text-slate-400">Remote worldwide position. Work on modern web applications with senior mentors.</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">Software Engineering Management Trainee</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Karachi / Lahore / Islamabad</span>
                    </div>
                    <p className="text-xs text-slate-400">On-site paid trainee program for graduating seniors and fresh graduates.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "study" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-base font-bold text-white">AI Instant Study Plan & Flashcards Generator</h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>Topic: Data Structures & Algorithms (3-Day Study Sprint)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-indigo-400 block">Day 1: Time Complexity</strong>
                      <p className="text-[11px] text-slate-400 mt-1">Master Big-O notation, space limits, and recursion trees.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-indigo-400 block">Day 2: Trees & Graphs</strong>
                      <p className="text-[11px] text-slate-400 mt-1">Practice BST traversal algorithms (BFS & DFS).</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <strong className="text-indigo-400 block">Day 3: Dynamic Programming</strong>
                      <p className="text-[11px] text-slate-400 mt-1">Solve memoization problems & practice mock quiz.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "uniguide" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-base font-bold text-white">UniGuide AI — Official Regulations & University Policy Guide</h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-purple-300">Q: "What is the official attendance requirement for final university exams?"</p>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong>Official Policy (HEC Standard):</strong> Higher Education Commission (HEC) regulations mandate a minimum of <strong>75% attendance</strong> in lectures/labs to be eligible to sit for final semester examinations. Students falling between 70%–74% require Dean approval with medical documentation.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-3.5 py-1 rounded-full">
            Complete Student Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-4">
            Everything You Need to Excel in University
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Designed specifically for modern university students with powerful AI integrations, privacy-first offline storage, and cloud persistence.
          </p>
        </div>

        {/* 6 CORE FEATURE BENTO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-indigo-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GPA Planner & Credit Forecast</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log semesters, track current letter grades, and calculate exact cumulative GPA with what-if credit scenarios.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Multi-semester transcript records</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Letter grade point converter</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-purple-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Study Companion & Decks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate custom structured multi-day study plans and interactive flashcard decks powered by Groq AI.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Interactive flashcard flip decks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Exam countdown revision plans</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Scholarship & Grant Finder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter local Pakistani grants (HEC Need-Based, Ehsaas) and international fully-funded opportunities (Fulbright, Chevening).
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Automatic eligibility match score</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Direct portal links & deadline alerts</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-blue-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Internship & Career Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore remote and on-site internships, evaluate your ATS resume score, and match skills to job descriptions.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>ATS Resume Match Evaluator</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Work mode & salary filtering</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-amber-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">UniGuide AI Helpdesk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get instant answers regarding official Pakistani university policies, HEC guidelines, transcripts, and hostel rules.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified HEC Pakistan policy rules</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Multilingual: English & Roman Urdu</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-pink-500/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Budget & Campus Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track student monthly expenditures, manage dormitory rent/textbooks, and store quick campus LMS & library links.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Monthly expense limit progress</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Campus Vault quick portals</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* COMPREHENSIVE AI MODULES SHOWCASE */}
      <section id="aimodules" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 bg-slate-900/30 rounded-3xl border border-slate-800/80 my-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/80 border border-purple-800/60 px-3.5 py-1 rounded-full">
            All 10+ Platform Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Explore All University Student Hub Capabilities
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Every module is tightly integrated with Groq AI and Firebase Firestore for zero-friction real-time persistence.
          </p>
        </div>

        {/* MODULE LIST SHOWCASE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "GPA Planner & Credit Simulator", desc: "Forecast CGPA, calculate semester GPAs, and record completed credit hours with letter grade conversion.", icon: GraduationCap, color: "text-indigo-400" },
            { title: "AI Study Companion & Flashcards", desc: "Generate multi-day study revision plans and self-testing flashcard decks using Groq AI.", icon: Sparkles, color: "text-purple-400" },
            { title: "UniGuide AI Official Helpdesk", desc: "Ask questions on university regulations, attendance limits, grading schemes, and HEC degree attestation.", icon: Compass, color: "text-amber-400" },
            { title: "Scholarship & Financial Aid Radar", desc: "Discover fully-funded local (HEC, Ehsaas) and international grants matching your degree and CGPA.", icon: Award, color: "text-emerald-400" },
            { title: "Internship & Career Hub", desc: "Filter remote & local software/business roles, analyze your ATS resume score, and plan skill goals.", icon: Briefcase, color: "text-blue-400" },
            { title: "Assignment & Exam Tracker", desc: "Manage coursework deadlines, prioritize assignments by urgency, and trigger AI revision plans.", icon: CheckSquare, color: "text-cyan-400" },
            { title: "Budget & Expense Tracker", desc: "Set monthly spending limits, categorize expenses (textbooks, food, rent), and track remaining balance.", icon: Wallet, color: "text-pink-400" },
            { title: "Campus Vault & Quick Links", desc: "Store student ID, university portal URLs, library links, advisor contact details, and custom credentials.", icon: Building2, color: "text-indigo-300" },
            { title: "Global Universal AI Assistant", desc: "Floating AI companion accessible anywhere in the hub with full read-only awareness of your student data.", icon: Globe2, color: "text-emerald-300" },
          ].map((mod, idx) => (
            <div key={idx} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition space-y-2">
              <div className="flex items-center gap-3">
                <mod.icon className={`h-5 w-5 ${mod.color}`} />
                <h4 className="text-sm font-bold text-white">{mod.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS & MOCKUPS SECTION */}
      <section id="screenshots" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3.5 py-1 rounded-full">
            UI Showcase & Screenshots
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Designed for Modern Desktop & Mobile Browsers
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            A high-contrast, distraction-free student portal built with smooth micro-interactions and quick navigation.
          </p>
        </div>

        {/* GENERATED MOCKUP DISPLAY WITH ANNOTATION CARDS */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <img 
            src={mockupImage} 
            alt="UniHub AI Application Dashboard Preview" 
            className="w-full h-[400px] sm:h-[520px] object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

          {/* OVERLAY ANNOTATION CARD 1 */}
          <div className="absolute top-8 left-8 hidden sm:flex items-center gap-3 bg-slate-950/90 border border-indigo-500/40 p-3.5 rounded-2xl backdrop-blur-md">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold">
              1
            </div>
            <div>
              <p className="text-xs font-bold text-white">Unified Navigation Drawer</p>
              <p className="text-[11px] text-slate-400">Jump between GPA, Tasks, Career, & Scholarships</p>
            </div>
          </div>

          {/* OVERLAY ANNOTATION CARD 2 */}
          <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-3 bg-slate-950/90 border border-purple-500/40 p-3.5 rounded-2xl backdrop-blur-md">
            <div className="h-8 w-8 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-400 font-bold">
              2
            </div>
            <div>
              <p className="text-xs font-bold text-white">Global Universal AI Assistant</p>
              <p className="text-[11px] text-slate-400">Context-aware advisor available on every screen</p>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT JOURNEY ROADMAP */}
      <section id="journey" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-3.5 py-1 rounded-full">
            The 4-Step Student Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            How UniHub AI Guides You to Graduation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: "01", title: "Setup Student Profile", desc: "Log your university name, program, current semester, and course list." },
            { step: "02", title: "Calculate & Predict GPA", desc: "Record assignment scores and test grades to forecast your cumulative GPA." },
            { step: "03", title: "Match Scholarships & Internships", desc: "Get personalized notifications for HEC grants, study abroad, and remote roles." },
            { step: "04", title: "Graduate & Launch Career", desc: "Build an ATS-optimized resume and transition confidently into top industries." },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3 relative">
              <span className="text-3xl font-black text-indigo-500/40 font-mono">{item.step}</span>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT & VISION SECTION */}
      <section id="about" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 bg-slate-900/40 rounded-3xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">About & Mission</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Democratizing AI Academic Support for Every University Student
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              UniHub AI was created to eliminate academic friction, financial uncertainty, and career confusion for university students in Pakistan and globally. By combining real-time academic calculators, official Higher Education Commission (HEC) regulation assistance, and Groq AI companion models into one unified platform, we empower students to perform at their absolute best.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Privacy-First Data Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-emerald-400" />
                <span>Multilingual (Urdu & English)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-indigo-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              <span>Our Vision for Higher Education</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              "To make higher education transparent, achievable, and career-driven through intelligent AI mentorship, ensuring no deserving student misses a scholarship or job opportunity due to lack of guidance."
            </p>
            <button
              onClick={() => onEnterDashboard()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Join the Student Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-3.5 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is UniHub AI completely free to use?",
              a: "Yes! UniHub AI is 100% free for all university students. You can create an account using Firebase Authentication or access the platform as a guest."
            },
            {
              q: "Does the UniGuide AI follow official Pakistani university & HEC rules?",
              a: "Yes. UniGuide AI is specifically engineered to prioritize verified regulations from Pakistani universities and HEC Pakistan regarding attendance limits, grading schemes, degree attestation, and scholarships."
            },
            {
              q: "How does the GPA Planner calculate my CGPA?",
              a: "The GPA Planner uses standard university quality point formulas (Quality Points = Course Credit Hours × Letter Grade Point Value) across all recorded semesters."
            },
            {
              q: "Is my student data synced across my devices?",
              a: "When signed in with Firebase, your student profile, courses, assignment tasks, budget records, and saved scholarships sync automatically to Firestore real-time cloud database."
            },
            {
              q: "Can I use the AI Assistant in Urdu or Roman Urdu?",
              a: "Yes! The Global AI Assistant supports questions asked in English, Urdu script, or Roman Urdu (e.g. 'Mujhe HEC scholarship ka tareeqa batao')."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-indigo-300 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${faqOpenIndex === idx ? "rotate-180 text-indigo-400" : "text-slate-500"}`} />
              </button>
              {faqOpenIndex === idx && (
                <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto relative z-10">
        <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Get in Touch</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Have Feedback or Want Your University Partnered?</h2>
            <p className="text-xs text-slate-400">Send us a direct note and our AI support team will respond promptly.</p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 animate-bounce" />
              <p className="text-sm">Thank you! Your feedback has been sent directly to <span className="font-mono text-emerald-100">aamnanoreen0@gmail.com</span> via Gmail API.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {gmailError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p>{gmailError}</p>
                    <a
                      href={`mailto:aamnanoreen0@gmail.com?subject=${encodeURIComponent(`UniHub AI Inquiry from ${contactForm.name || "Student"}`)}&body=${encodeURIComponent(
                        `Name: ${contactForm.name}\nEmail: ${contactForm.email}\nUniversity: ${contactForm.university}\n\nMessage:\n${contactForm.message}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:underline font-bold pt-1"
                    >
                      <span>Send via Default Mail App (aamnanoreen0@gmail.com)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Aamna Noreen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. student@university.edu.pk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">University / Organization</label>
                <input
                  type="text"
                  value={contactForm.university}
                  onChange={(e) => setContactForm({ ...contactForm, university: e.target.value })}
                  placeholder="e.g. NUST / FAST / LUMS / COMSATS / PU"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Message / Inquiry</label>
                <textarea
                  rows={3}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Ask a question or request a feature for your university..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSendingGmail}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSendingGmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Sending to Gmail (aamnanoreen0@gmail.com)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Feedback via Gmail API</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Direct recipient: <span className="text-indigo-400 font-mono">aamnanoreen0@gmail.com</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FINAL HIGH CONVERSION CTA BANNER */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Take Control of Your Academic Future?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Join thousands of university students using UniHub AI to calculate GPAs, discover scholarships, master study plans, and secure top internships.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onEnterDashboard("academic")}
              className="bg-white text-slate-950 hover:bg-indigo-50 font-black text-sm px-8 py-3.5 rounded-2xl transition shadow-xl flex items-center gap-2"
            >
              <span>Launch Portal Dashboard</span>
              <ArrowRight className="h-4 w-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 px-4 sm:px-8 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-white font-mono">UniHub.AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The official all-in-one AI ecosystem empowering university students with academic calculators, HEC regulations guidance, financial aid matching, and career preparation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => scrollToSection("home")} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => scrollToSection("features")} className="hover:text-white transition">Features</button></li>
              <li><button onClick={() => scrollToSection("aimodules")} className="hover:text-white transition">AI Modules</button></li>
              <li><button onClick={() => scrollToSection("faq")} className="hover:text-white transition">FAQ</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Modules</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => onEnterDashboard("academic")} className="hover:text-white transition">GPA Planner</button></li>
              <li><button onClick={() => onEnterDashboard("scholarships")} className="hover:text-white transition">Scholarship Finder</button></li>
              <li><button onClick={() => onEnterDashboard("career")} className="hover:text-white transition">Internship & Career Hub</button></li>
              <li><button onClick={() => onEnterDashboard("uniguide")} className="hover:text-white transition">UniGuide AI</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">System Status</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Firebase Real-Time DB Active</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                <span>Groq AI Models Online</span>
              </div>
              <p className="text-slate-500 pt-2">© 2026 UniHub AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
