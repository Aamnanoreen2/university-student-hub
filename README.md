# 🎓 UniHub.AI — All-in-One AI-Powered University Student Operating System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Groq AI](https://img.shields.io/badge/Groq_AI-API_Cloud-orange?logo=fastapi&logoColor=white)](https://groq.com)
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
* **Deep Concept Explainer**: Breaks down complex academic concepts into simple analogies, key formulas, and step-by-step examples powered by Groq AI.

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
* **AI Engine**: `groq-sdk` official SDK utilizing Groq LLM models
* **Workspace Integration**: Google Gmail REST API (`gmail.googleapis.com/gmail/v1/users/me/messages/send`)
* **Database & Auth**: Firebase Firestore & Firebase Authentication (`firebase/auth`, `firebase/firestore`)

---

## 📂 Project Structure

```
.
├── server.ts                    # Express backend (Groq AI proxy & Gmail API endpoints)
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
* **Groq API Key**: Obtainable from [Groq Console](https://console.groq.com/)

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
GROQ_API_KEY="your_actual_groq_api_key"
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

## DEPLOYED : https://university-student-hub-mu.vercel.app

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


<img width="644" height="793" alt="image" src="https://github.com/user-attachments/assets/e1c7cb34-1a73-4542-b5a0-48be14b137c2" />


# 🤖 AI Modules

## 1. 🌐 Global Omni AI Assistant (`/api/ai/omni-assistant`)

### What it does
Serves as a workspace-wide AI companion that connects across all 8 student modules (**GPA Planner, Assignment Tracker, Budget, Campus Vault, Career Hub, Scholarships**). It reads real-time student portal data, supports multilingual conversations (**English, Urdu, and Roman Urdu**), and routes students directly to relevant workspace tabs with actionable navigation buttons.

### System Prompt / Instruction

> **You are the official Global AI Assistant for the University Student Hub, an intelligent AI companion that supports students throughout their entire academic and professional journey. You act as a single unified AI assistant across all university features.**
>
> **STRICT PORTAL SYNCHRONIZATION & TRUTH DIRECTIVE**
>
> - You must ONLY state facts that are explicitly recorded on the student's portal context provided.
> - NEVER invent, assume, or fabricate any student name, university, degree program, CGPA, target role, courses, or assignments.
> - If a profile field or CGPA is blank or unconfigured, explicitly state that it is not yet recorded, and guide the student on where to enter it on the portal.
>
> **CORE PERSONA & LANGUAGE DIRECTIVES**
>
> - **UNIFIED ASSISTANT IDENTITY:** Communicate professionally, politely, and in an encouraging, mentor-like tone.
> - **MULTILINGUAL RESPONSIVENESS:** Respond in the EXACT language used by the student (English, Urdu, or Roman Urdu).
> - **PAKISTANI UNIVERSITIES & HEC POLICY PRIORITY:** Prioritize official regulations from Pakistani universities and HEC Pakistan (admissions, exams, attendance, degree attestation, scholarships like HEC Need-Based, Ehsaas, PM Youth Scheme).

---

## 2. 🏛️ UniGuide AI — Student Helpdesk & Notice Analyzer (`/api/ai/uniguide`)

### What it does
Answers university administrative questions, academic regulations, degree attestation (HEC), transcript procedures, and hostel rules. It can also analyze uploaded official university circulars/notices to extract deadlines, affected departments, and action items.

### System Prompt / Instruction

> **You are "UniGuide AI", an intelligent University Knowledge Hub and digital student assistant designed to help students access accurate, reliable, and easy-to-understand university information.**
>
> **YOUR MANDATE & PERSONA**
>
> - **Primary Purpose:** Reduce confusion by answering questions related ONLY to university services, academic policies, admissions, examinations, scholarships, regulations, forms, notices, and student support.
> - **Knowledge Base:** Base your responses exclusively on official university sources (academic regulations, student handbooks, official notices, circulars, admission policies, examination rules).
> - **Absolute Accuracy & No Hallucination:** NEVER invent information, fabricate policies, estimate deadlines, create fee structures, or assume eligibility requirements.

---

## 3. 🎓 Scholarship AI Assistant & Matching Engine (`/api/ai/scholarships-assistant`)

### What it does
Dynamically evaluates the student's live cumulative GPA (CGPA), degree program, and financial background against local and international scholarship programs (**HEC Need-Based, Fulbright, Chevening, Erasmus Mundus, etc.**) to provide match percentages, eligibility reasons, and document checklists.

### System Prompt / Instruction

> **You are an expert University Financial Aid Counselor and Scholarship Advisor.**
>
> Output structured JSON matching the requested schema.
>
> Evaluate scholarship eligibility dynamically using the student's live verified portal profile data.
>
> Never invent or hardcode sample profile values.

---

## 4. 💼 Career Assistant & ATS Resume Analyzer (`/api/ai/career-assistant`)

### What it does
Scans student resumes against target roles (e.g., **Software Engineer, Data Analyst, SOC Analyst, Product Designer**), computes an ATS compatibility score (**0–100**), identifies missing technical/soft skills, suggests resume bullet point improvements, generates multi-phase career roadmaps, and creates custom practice interview questions.

### System Prompt / Instruction

> **You are a Senior University Career Strategist and ATS Resume Evaluator.**
>
> Generate structured JSON output based strictly on the provided custom session search criteria.

---

## 5. 📅 Academic Study Plan Generator (`/api/ai/study-plan`)

### What it does
Transforms any course subject, study duration (e.g., **7 days**), and intensity level (**Light, Moderate, High**) into a day-by-day learning roadmap complete with daily focus areas, concrete tasks, and active-recall study tips.

### System Prompt / Instruction

> **You are a professional university academic counselor and learning strategist.**
>
> Always generate standard JSON matching the requested schema.

---

## 6. 📇 AI Flashcard Creator (`/api/ai/flashcards`)

### What it does
Automatically generates study-ready Q&A flashcards testing definitions, mechanisms, and core formulas on any academic topic.

### System Prompt / Instruction

> **You are an expert academic educator.**
>
> Generate educational flashcards in strict JSON formatting.

---

## 7. 🧠 Deep Concept Explainer & Quiz Engine (`/api/ai/explain`)

### What it does
Explains complex academic topics in two distinct modes:

- **Explain Like a Freshman** (using relatable real-world analogies)
- **Exam Prep Breakdown** (covering mechanisms and key formulas)

Each explanation includes a multiple-choice quiz question with detailed answer explanations.

### System Prompt / Instruction

> **You are a university professor who excels at breaking down complex concepts for students.**
>
> Generate a complete explanation and quiz in strict JSON formatting.
>
> ## 🧠 Deep Concept Explainer & Quiz Engine

**Endpoint:** `/api/ai/explain`

Transforms complex academic concepts into simple, interactive learning experiences.

### Learning Modes

#### 🎒 Explain Like a Freshman

- Beginner-friendly explanations
- Real-world analogies
- Easy-to-understand language

#### 📖 Exam Prep Breakdown

- Detailed concept explanations
- Important mechanisms
- Key formulas
- Exam-focused summaries

### Bonus Features

- ✅ Multiple-choice quizzes
- 💡 Answer explanations
- 📈 Knowledge reinforcement

---

# 🔒 AI Design Principles

All AI assistants follow the same standards throughout the platform.

- ✅ Privacy-first architecture
- ✅ Uses verified student portal information only
- ✅ No fabricated data or hallucinated student records
- ✅ Structured JSON responses
- ✅ Context-aware conversations
- ✅ Multilingual support (English, Urdu & Roman Urdu)
- ✅ Built specifically for Pakistani university students while remaining adaptable for broader academic use

---

## 🚀 Powered By

- Groq API
- Firebase
- React + Vite
- TypeScript
- Tailwind CSS
- AI-driven workflow architecture

# 🚀 Getting Started

Follow these steps to run the University Student Hub locally.

## 1. Clone the Repository

```bash
git clone https://github.com/Aamnanoreen2/university-student-hub.git
cd university-student-hub
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
# Groq AI (Server-side)
GROQ_API_KEY=your_groq_api_key

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_OAUTH_CLIENT_ID=your_oauth_client_id

# Application URL
APP_URL=http://localhost:3000
```

> **Note:** Never commit your `.env` file to GitHub. The project includes `.env.example` as a template.

---

## 4. Start the Development Server

```bash
npm run dev
```

The application will start at:

```
http://localhost:3000
```

---

## 5. Build for Production

```bash
npm run build
```

---

## 6. Start the Production Server

```bash
npm start
```

---

# 📂 Project Structure

```
.
├── client/               # React frontend
├── server.ts             # Express server
├── public/               # Static assets
├── dist/                 # Production build
├── .env.example          # Environment variable template
├── package.json
└── README.md
```

---

# ⚙️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run TypeScript type checking |

---

# 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key used for AI-powered assistants |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication Domain |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_OAUTH_CLIENT_ID` | Firebase OAuth Client ID |
| `APP_URL` | Local or deployed application URL |

---

# ⚠️ Troubleshooting

### PowerShell blocks npm scripts

Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then restart PowerShell.

---

### Port 3000 is already in use

Stop the process using port **3000** or change the application's port before starting the server.

---

### AI Assistant reports missing `GROQ_API_KEY`

- Ensure `GROQ_API_KEY` is present in your `.env` file.
- Restart the development server after updating environment variables.
- For Vercel deployments, add the variable under **Project Settings → Environment Variables** and **redeploy** the project.



<p center>
Made with ❤️ for students worldwide by <strong>UniHub.AI Team</strong>. Direct feedback: <a href="mailto:aamnanoreen0@gmail.com">aamnanoreen0@gmail.com</a>
</p>
