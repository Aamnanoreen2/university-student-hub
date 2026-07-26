# 🎓 UniHub.AI — All-in-One AI-Powered University Student Operating System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.4-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Gmail API](https://img.shields.io/badge/Gmail_API-Google_Workspace-EA4335?logo=gmail&logoColor=white)](https://developers.google.com/gmail/api)

---

## 📌 The Problem UniHub.AI Solves

University life for modern students is notoriously fragmented:
* **Scattered Tools**: Students juggle separate, disconnected tools for GPA calculations, assignment deadlines, scholarship hunting, resume tailoring, personal budgeting, and study note summarization.
* **Lack of Actionable Academic Guidance**: Generic AI chatbots don't understand grading schemes, credit-hour weightages, target CGPA requirements, or university-specific scholarship deadlines.
* **Opaque Career Preparation**: Students apply to competitive internships without knowing whether their CV passes ATS (Applicant Tracking System) filters or contains impactful action verbs.
* **Financial Stress & Missed Opportunities**: Hundreds of fully funded regional and international scholarships pass unnoticed due to poor tracking and scattered eligibility criteria.

**UniHub.AI** unifies academic planning, AI study acceleration, career development, financial tracking, and campus document vaults into a single, cohesive dark-mode workspace.

---

## ✨ Key Modules & Capabilities

### 1. 📈 GPA Planner & Analytics
* **Target CGPA Calculator**: Calculates the exact GPA required in remaining credit hours to achieve target academic standing (e.g., Dean's List, Cum Laude, 3.8+ CGPA).
* **Interactive Grade Simulator**: Allows students to simulate different letter grades across upcoming courses and immediately preview the impact on cumulative GPA.
* **Historical Semester Trend Charting**: Powered by `recharts` for visualizing GPA progression across semesters.
* **Customizable Grading Scales**: Supports standard 4.0, 4.33, 5.0, and custom percentage-to-letter grade conversion tables.

### 2. 🧠 AI Study Companion
* **Automated Study Plan Generator**: Inputs course syllabi, exam dates, and available weekly study hours to output structured daily study blueprints.
* **AI Flashcard Creator**: Generates study-ready Q&A flashcards on any subject (Calculus, Data Structures, Biochemistry, Microeconomics) in seconds.
* **Deep Concept Explainer**: Breaks down complex academic concepts into simple analogies, key formulas, and step-by-step examples powered by Gemini AI.

### 3. 🎓 Scholarships & Financial Aid Finder
* **Global & Regional Database**: Includes curated listings for HEC Need-Based, Fulbright, Erasmus Mundus, Türkiye Bursları, Chevening, and University Merit grants.
* **AI Eligibility Advisor**: Matches student GPA, major, household income, and country criteria against active scholarship requirements.
* **Application Countdown Tracker**: Tracks application deadlines, required documents (SOP, LORs, Transcripts), and completion statuses.

### 4. 💼 Career & Internship Hub
* **ATS Resume / CV Analyzer**: Scans resume text against target job descriptions, computing an overall match score, detecting missing keywords, and highlighting passive verbs.
* **Cover Letter Builder**: Generates tailored, professional cover letters using candidate background and target company details.
* **Mock Interview Simulator**: Provides AI-generated technical and behavioral interview questions with real-time response feedback.
* **Curated Tech & Corporate Opportunities**: Direct listings for software engineering, data science, product management, and business internships.

### 5. 🏛️ UniGuide AI Assistant
* **24/7 Academic & Campus Life Advisor**: Helps students draft academic petition letters, optimize weekly class schedules, manage exam stress, and navigate university administrative rules.
* **Context-Aware Prompts**: Quick-action prompts for course registration advice, professor email drafting, and study group coordination.

### 6. 📝 Assignments & Task Tracker
* **Multi-View Task Management**: Kanban board and filterable list views categorized by subject, urgency, and task type (Exam, Project, Homework, Reading).
* **Deadline Countdowns**: Visual urgency indicators (Overdue, Due Today, Upcoming) with progress bars.

### 7. 💰 Student Budget & Expense Tracker
* **Monthly Allowance Management**: Tracks income from family support, part-time jobs, stipends, and scholarships.
* **Category Visualizations**: Visual pie and bar chart breakdowns for dorm rent, food/dining, books, transportation, and entertainment.
* **Budget Warning Alerts**: Highlights categories approaching pre-set spending limits.

### 8. 📁 Campus Vault
* **Encrypted Document Repository**: Organizes academic transcripts, letters of recommendation, CNIC/Passports, certificates, and enrollment letters in one secure panel.

### 9. 📧 Gmail API Feedback & Inquiry System
* **Direct Admin Mail Delivery**: Connects to Google OAuth with Gmail `send` scope, enabling students to send feedback, feature requests, or bug reports directly to `aamnanoreen0@gmail.com` via the native Gmail REST API endpoint (`/api/send-feedback`).
* **Fallback Mailto Link**: Provides a seamless fallback to default mail clients if browser popups or permissions are blocked.

### 10. ☁️ Real-time Firebase Synchronization
* **Firestore Data Persistence**: Automatically synchronizes all student profiles, GPA logs, tasks, budgets, and saved scholarships across devices in real time.
* **Google Authentication**: One-click Google Sign-In with full guest mode fallback.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **Framework**: React 19 + TypeScript + Vite 6
* **Styling**: Tailwind CSS v4 (Glassmorphic dark-mode palette, custom gradient overlays)
* **Animations**: `motion` (Framer Motion v12) for smooth tab transitions and floating hero badges
* **Icons**: `lucide-react`
* **Charts**: `recharts` for GPA trendlines and budget breakdowns

### **Backend & APIs**
* **Server**: Express.js (TypeScript runtime with `tsx` in dev, compiled to single CJS bundle via `esbuild` for production)
* **AI Engine**: `@google/genai` official SDK utilizing Gemini AI models
* **Workspace Integration**: Google Gmail REST API (`gmail.googleapis.com/gmail/v1/users/me/messages/send`)
* **Database & Auth**: Firebase Firestore & Firebase Authentication (`firebase/auth`, `firebase/firestore`)

---

## 📂 Project Structure

```
.
├── server.ts                    # Express backend (Gemini AI proxy & Gmail API endpoints)
├── firestore.rules              # Firebase Firestore Security Rules
├── firebase-applet-config.json  # Firebase Project Configuration
├── index.html                   # Entry HTML document
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── src/
    ├── main.tsx                 # React application entry point
    ├── App.tsx                  # Main app container, navigation sidebar & tab router
    ├── types.ts                 # TypeScript type definitions (GPA, Tasks, Scholarships, etc.)
    ├── index.css                # Global CSS & Tailwind imports
    ├── lib/
    │   └── firebase.ts          # Firebase SDK initialization, Auth providers & OAuth helper
    ├── utils/
    │   └── academicUtils.ts     # GPA calculation logic, grading schemes & statistics
    └── components/
        ├── LandingPage.tsx          # High-converting product landing page with hero graphics
        ├── GPAPlanner.tsx           # CGPA calculator, target forecaster & trend charts
        ├── AIStudyCompanion.tsx     # Study plan, flashcards & concept explainer generator
        ├── ScholarshipFinder.tsx    # Scholarship search, AI eligibility & deadline tracker
        ├── InternshipCareerHub.tsx  # ATS CV scorer, cover letter generator & internship listings
        ├── UniGuideAI.tsx           # Campus life AI assistant
        ├── TaskTracker.tsx          # Assignment Kanban board & list view
        ├── BudgetTracker.tsx        # Expense tracker & spending analytics
        ├── CampusVault.tsx          # Document repository
        ├── GlobalAIAssistant.tsx    # Floating persistent AI companion drawer
        ├── AuthModal.tsx            # Firebase Google Auth dialog
        └── FeedbackModal.tsx        # Dedicated Gmail feedback dialog
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/unihub-ai.git
cd unihub-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Firebase & Google OAuth Setup

1. **Firebase Project Setup**:
   * Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   * Enable **Authentication** with the **Google Sign-In** provider.
   * Enable **Firestore Database** in test mode or apply the provided `firestore.rules`.
   * Copy your Firebase config object into `firebase-applet-config.json` or `.env`.

2. **Google Gmail API Integration**:
   * Enable the **Gmail API** in your Google Cloud Console.
   * Add `https://www.googleapis.com/auth/gmail.send` to your OAuth consent screen scopes.
   * Ensure authorized origins and redirect URIs match your deployment domain.

---

## 🤝 Contributing

Contributions are warmly welcome! If you'd like to improve UniHub.AI:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git checkout -b feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## DEPLOYED : https://university-student-hub-alpha.vercel.app

<img width="1800" height="884" alt="image" src="https://github.com/user-attachments/assets/90863a93-cef1-43a5-8ecd-5c60aebcc9a5" />
<img width="1813" height="616" alt="image" src="https://github.com/user-attachments/assets/26cc1f17-bcaa-4265-9866-bb015e931872" />

<img width="1813" height="881" alt="image" src="https://github.com/user-attachments/assets/c5d6baba-e2a9-43db-b753-f4e69b29cc6d" />

<img width="1816" height="657" alt="image" src="https://github.com/user-attachments/assets/930ba156-0144-4d72-9e70-9091f69a58bf" />

<img width="1823" height="879" alt="image" src="https://github.com/user-attachments/assets/c5eb0d0e-e519-4319-8403-178990d77d14" />

<img width="1816" height="874" alt="image" src="https://github.com/user-attachments/assets/e6f22db0-f14f-40a1-9ec3-caf2fc611462" />

<img width="1815" height="872" alt="image" src="https://github.com/user-attachments/assets/f1b27aea-ae58-43c9-9eca-5705bf0e6bb5" />

<img width="1800" height="872" alt="image" src="https://github.com/user-attachments/assets/f606caff-1a18-4d2e-b22a-0911a87ecfb1" />

<img width="1811" height="877" alt="image" src="https://github.com/user-attachments/assets/d3a66003-604c-4379-b34d-af05d6122508" />

<img width="1843" height="889" alt="image" src="https://github.com/user-attachments/assets/aad164a5-456d-446c-9fef-1282fa184f34" />

<img width="1837" height="888" alt="image" src="https://github.com/user-attachments/assets/d7c3c629-e7f5-4b8a-8ef0-9ee5797ff300" />

<img width="1814" height="882" alt="image" src="https://github.com/user-attachments/assets/1e74a985-1c0e-4d00-8371-832bb6969a18" />


<img width="1839" height="887" alt="image" src="https://github.com/user-attachments/assets/7c1bdf34-c387-45bc-b8ee-b607caba5a84" />

<img width="1818" height="872" alt="image" src="https://github.com/user-attachments/assets/f33e454f-63b8-4f4a-aabd-f2c74be9f990" />

<img width="1833" height="775" alt="image" src="https://github.com/user-attachments/assets/75760897-c199-4648-ad23-5c192d44ba86" />

<p center>
Made with ❤️ for students worldwide by <strong>UniHub.AI Team</strong>. Direct feedback: <a href="mailto:aamnanoreen0@gmail.com">aamnanoreen0@gmail.com</a>
</p>
