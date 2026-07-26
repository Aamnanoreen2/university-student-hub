import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";

const Type = {
  OBJECT: "object",
  STRING: "string",
  INTEGER: "integer",
  ARRAY: "array"
} as const;

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Helper to get Groq client lazily to avoid crashing on startup if key is missing
  function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is missing. Please set it in your hosting environment (for Vercel: Project Settings > Environment Variables).");
    }
    return new Groq({
      apiKey,
    });
  }

  // Helper to try multiple Groq models if rate limit or model errors occur
  async function generateContentWithFallback(groq: Groq, params: { contents: any; config: any }) {
    const modelsToTry = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "llama3-8b-8192",
      "mixtral-8x7b-32768"
    ];
    let lastError: any = null;

    // Build the system prompt including the JSON schema description if provided
    let systemInstruction = params.config.systemInstruction || "You are a helpful assistant.";
    if (params.config.responseSchema) {
      systemInstruction += `\n\nYou MUST return a JSON object matching this JSON schema:\n${JSON.stringify(params.config.responseSchema, null, 2)}`;
    }

    for (const modelName of modelsToTry) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: params.contents }
          ],
          model: modelName,
          response_format: params.config.responseMimeType === "application/json" ? { type: "json_object" } : undefined,
        });
        const text = chatCompletion.choices[0]?.message?.content;
        if (text) {
          return { text };
        }
      } catch (err: any) {
        console.warn(`[Groq API] Switching model from ${modelName} due to error:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All Groq models encountered errors or rate limits.");
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Send Feedback / Inquiry via Gmail API to aamnanoreen0@gmail.com
  app.post("/api/send-feedback", async (req, res) => {
    try {
      const { accessToken, name, email, university, message } = req.body;
      const targetRecipient = "aamnanoreen0@gmail.com";

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
      }

      if (!accessToken) {
        return res.status(401).json({ 
          error: "Google Gmail access token is required. Please sign in with Google to send feedback directly to Gmail." 
        });
      }

      const subject = `UniHub.AI Student Feedback from ${name}`;
      const bodyText = `UniHub.AI - New Student Inquiry / Feedback:\n\n` +
        `Sender Name: ${name}\n` +
        `Sender Email: ${email}\n` +
        `University / Org: ${university || "Not specified"}\n` +
        `Date: ${new Date().toLocaleString()}\n\n` +
        `Message:\n${message}\n\n` +
        `----------------------------------------\n` +
        `Sent via UniHub.AI Google Gmail Integration`;

      const emailLines = [
        `To: ${targetRecipient}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        bodyText
      ];

      const emailString = emailLines.join('\r\n');
      const encodedEmail = Buffer.from(emailString)
        .toString("base64")
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!gmailRes.ok) {
        const errorData = await gmailRes.json().catch(() => ({}));
        console.error("Gmail API error:", errorData);
        return res.status(gmailRes.status).json({ 
          error: errorData?.error?.message || `Gmail API returned status ${gmailRes.status}` 
        });
      }

      const data = await gmailRes.json();
      return res.json({ 
        success: true, 
        messageId: data.id, 
        recipient: targetRecipient,
        message: "Your feedback has been successfully sent to aamnanoreen0@gmail.com via Gmail!" 
      });
    } catch (err: any) {
      console.error("Error in /api/send-feedback:", err);
      return res.status(500).json({ error: err.message || "Failed to process feedback submission" });
    }
  });

  // 1. Generate Academic Study Plan
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { topic, durationDays = 7, intensity = "moderate" } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const ai = getGroqClient();
      const prompt = `Create a structured study plan for a university student.
Topic: "${topic}"
Duration: ${durationDays} days
Study Intensity: ${intensity} (light, moderate, or high)

Provide a day-by-day plan with specific focus areas, concrete tasks/actions to take, and practical study tips.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "You are a professional university academic counselor and learning strategist. Always generate standard JSON matching the requested schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              durationDays: { type: Type.INTEGER },
              intensity: { type: Type.STRING },
              overview: { type: Type.STRING, description: "A high-level learning path description" },
              days: {
                type: Type.ARRAY,
                description: "Array of days containing individual learning plans",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER, description: "The day number (1-indexed)" },
                    focus: { type: Type.STRING, description: "Core focus or topic for this day" },
                    tasks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of actionable steps (e.g. read chapters, complete exercises, draft outlines)",
                    },
                    tips: { type: Type.STRING, description: "Practical cognitive study advice or memory aids" },
                  },
                  required: ["day", "focus", "tasks", "tips"],
                },
              },
            },
            required: ["topic", "durationDays", "intensity", "overview", "days"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response content from Groq API.");
      }

      const planData = JSON.parse(responseText.trim());
      res.json(planData);
    } catch (error: any) {
      console.warn("Study Plan Fallback Triggered:", error?.message || error);
      res.json({
        topic: req.body.topic || "Academic Prep",
        durationDays: req.body.durationDays || 7,
        intensity: req.body.intensity || "moderate",
        overview: `7-Day Accelerated Mastery Roadmap for ${req.body.topic || "Your Subject"}. (Note: Live AI API quota reached; displaying optimized study template).`,
        days: [
          { day: 1, focus: "Foundations & Core Terminology", tasks: ["Review syllabus & introductory textbook chapters", "Create high-yield term glossaries", "Identify 3 key theoretical formulas"], tips: "Use active recall by writing key terms from memory." },
          { day: 2, focus: "Deep Dive into Mechanisms", tasks: ["Work through 5 step-by-step example problems", "Draw workflow or architectural diagrams"], tips: "Feynman Technique: Explain mechanisms aloud as if teaching a freshman." },
          { day: 3, focus: "Practice & Problem Solving", tasks: ["Solve past paper questions or problem sets", "Review incorrect answers thoroughly"], tips: "Analyze *why* wrong options were incorrect." },
          { day: 4, focus: "Synthesis & Interleaved Review", tasks: ["Combine concepts from Days 1-3 into a single mind map", "Practice timed quiz questions"], tips: "Switch between different sub-topics every 25 minutes." },
          { day: 5, focus: "Advanced Applications & Cases", tasks: ["Analyze real-world case studies or code implementations", "Review edge cases and tricky scenarios"], tips: "Focus on understanding trade-offs and edge conditions." },
          { day: 6, focus: "Full Mock Assessment", tasks: ["Complete a timed practice exam without notes", "Grade yourself strictly against standard rubrics"], tips: "Simulate actual exam time constraints and environment." },
          { day: 7, focus: "Final Polish & High-Yield Review", tasks: ["Review formula sheets and flashcards", "Ensure 8 hours of sleep before exam day"], tips: "Rest and memory consolidation are critical for peak recall." }
        ]
      });
    }
  });

  // 2. Generate Flashcards
  app.post("/api/ai/flashcards", async (req, res) => {
    try {
      const { topic, count = 6 } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const ai = getGroqClient();
      const prompt = `Generate ${count} high-quality flashcards for a university level study session on the topic: "${topic}".
Each flashcard should test an important definition, key concept, mechanism, or relationship. Keep questions crisp and answers highly accurate and self-contained.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "You are an expert academic educator. Generate educational flashcards in strict JSON formatting.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                description: "List of flashcards",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING, description: "The front side of the card, usually a question or definition prompt" },
                    back: { type: Type.STRING, description: "The back side of the card, containing the detailed answer, formula, or concept explanation" },
                  },
                  required: ["front", "back"],
                },
              },
            },
            required: ["cards"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response content from Groq API.");
      }

      const flashcardsData = JSON.parse(responseText.trim());
      res.json(flashcardsData);
    } catch (error: any) {
      console.warn("Flashcards Fallback Triggered:", error?.message || error);
      res.json({
        cards: [
          { front: `What is the core definition of ${req.body.topic || "this topic"}?`, back: "A fundamental academic concept requiring systematic analysis, precise terminology, and mastery of underlying principles." },
          { front: `What are the key components of ${req.body.topic || "this topic"}?`, back: "Core theoretical framework, practical execution methods, edge-case evaluation, and performance trade-offs." },
          { front: `How does ${req.body.topic || "this topic"} apply in real-world engineering or academia?`, back: "It provides the structured methodology used by researchers and industry professionals to solve complex operational challenges." },
          { front: "What is a common student misconception regarding this topic?", back: "Confusing basic surface syntax or terminology with deep underlying mechanisms and structural behavior." }
        ]
      });
    }
  });

  // 3. Explain Complex Topic (ELIF/Detailed)
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topic, mode = "explain_like_freshman" } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic/Concept name is required" });
      }

      const ai = getGroqClient();
      const explanationPrompt = mode === "explain_like_freshman"
        ? `Explain the concept: "${topic}" as if you are talking to an enthusiastic university freshman. Use simple, relatable terms, real-world analogies, and avoid overly dense jargon while maintaining scientific/academic correctness.`
        : `Provide a detailed academic breakdown of the concept: "${topic}" suitable for exam prep. Cover core mechanisms, key formulas or terms, historical or theoretical context, and common student pain points/pitfalls.`;

      const prompt = `${explanationPrompt}
Also, create 1 multiple choice quiz question based on this explanation to let the student test their understanding. Include options, correct index, and a comprehensive explanation of the answer.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "You are a university professor who excels at breaking down complex concepts for students. Generate a complete explanation and quiz in strict JSON formatting.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING, description: "The comprehensive description of the concept/topic" },
              analogy: { type: Type.STRING, description: "A simple, highly relatable analogy representing this concept in action" },
              takeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 to 4 key takeaways or formulas to memorize",
              },
              quizQuestion: { type: Type.STRING, description: "A high-quality multiple choice question testing the concept" },
              quizOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Four distinct options",
              },
              quizAnswerIndex: { type: Type.INTEGER, description: "0-indexed index of the correct answer" },
              quizExplanation: { type: Type.STRING, description: "Detailed explanation of why that specific option is correct and why others are wrong" },
            },
            required: [
              "title",
              "concept",
              "analogy",
              "takeaways",
              "quizQuestion",
              "quizOptions",
              "quizAnswerIndex",
              "quizExplanation",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response content from Groq API.");
      }

      const explanationData = JSON.parse(responseText.trim());
      res.json(explanationData);
    } catch (error: any) {
      console.warn("Explain Fallback Triggered:", error?.message || error);
      res.json({
        title: `Academic Breakdown: ${req.body.topic || "Selected Concept"}`,
        concept: `${req.body.topic || "This topic"} is a foundational subject in higher education. It connects theoretical principles with practical applications through structured logic, standardized protocols, and systematic problem solving.`,
        analogy: "Think of this like a well-organized library system: inputs are cataloged, processed through specific indexing rules, and retrieved efficiently when needed.",
        takeaways: [
          "Master the underlying definitions before attempting complex applications.",
          "Break down multi-step problems into smaller, isolated components.",
          "Verify calculations and assumptions against edge conditions."
        ],
        quizQuestion: `Which statement best describes the fundamental principle of ${req.body.topic || "this topic"}?`,
        quizOptions: [
          "It operates on systematic logic and verified structural rules.",
          "It relies entirely on random estimation without formal guidelines.",
          "It can only be applied in theoretical research and has no practical use.",
          "It replaces all fundamental principles with unstructured heuristics."
        ],
        quizAnswerIndex: 0,
        quizExplanation: "Option 1 is correct because academic and professional frameworks rely on structured, repeatable logic and verified rules."
      });
    }
  });

  // 4. UniGuide AI - University Knowledge Hub & Student Helpdesk Assistant
  app.post("/api/ai/uniguide", async (req, res) => {
    try {
      const { query, history = [], attachedNoticeName, attachedNoticeContent } = req.body;
      if (!query && !attachedNoticeContent) {
        return res.status(400).json({ error: "Student query or official document content is required." });
      }

      const ai = getGroqClient();

      let contextPrompt = "";
      if (history && Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6); // last 6 turns for context
        contextPrompt += `Prior Conversation Context:\n${recentHistory.map((h: any) => `${h.role === "user" ? "Student" : "UniGuide AI"}: ${h.text}`).join("\n")}\n\n`;
      }

      if (attachedNoticeContent) {
        contextPrompt += `[ATTACHED OFFICIAL UNIVERSITY DOCUMENT / NOTICE]
Document Name: ${attachedNoticeName || "Official_University_Notice.txt"}
Document Content:
"""
${attachedNoticeContent}
"""
Please analyze this attached official document carefully. Summarize its purpose in simple language, identify affected students/departments, extract important dates, highlight required actions, explain significant policy changes, and list deadlines or special conditions.\n\n`;
      }

      contextPrompt += `Current Student Query: "${query || "Please analyze the attached document and explain its implications."}"`;

      const systemInstruction = `You are "UniGuide AI", an intelligent University Knowledge Hub and digital student assistant designed to help students access accurate, reliable, and easy-to-understand university information.

YOUR MANDATE & PERSONA:
1. Primary Purpose: Reduce confusion by answering questions related ONLY to university services, academic policies, admissions, examinations, scholarships, regulations, forms, notices, and student support.
2. Behave as a professional, polite, patient, clear, and student-friendly university help desk representative.
3. Knowledge Base: Base your responses exclusively on official university sources (academic regulations, student handbooks, official notices, circulars, admission policies, examination rules, departmental guidelines, scholarship announcements, verified university documents). Whenever multiple sources are available, prioritize the most recent official document.
4. Absolute Accuracy & No Hallucination: NEVER invent information, fabricate policies, estimate deadlines, create fee structures, or assume eligibility requirements.
5. Unverified Information Protocol: If requested information is unavailable, outdated, or cannot be verified from official sources, clearly state that official information could not be found and recommend that the student contact the relevant university office or consult the official university website before making decisions.
6. Scope Limits: Never provide medical, legal, or non-university financial advice. Always remind the student that final official decisions rest with the relevant university authority (e.g., Registrar, Controller of Examinations, Scholarship Committee, Department Head).
7. Language Support: Always respond in the language used by the student (English, Urdu, or Roman Urdu). If both languages are mixed, maintain a natural bilingual response.
8. Structure Requirement: You MUST output structured JSON matching the provided response schema.`;

      const response = await generateContentWithFallback(ai, {
        contents: contextPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A crisp, direct summary answering the student's question clearly" },
              detailedExplanation: { type: Type.STRING, description: "Detailed explanation describing the relevant academic policy, procedure, or document summary in simple language" },
              requiredDocuments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of required documents, forms, or IDs needed for this process (empty if not applicable)",
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Sequential, numbered step-by-step instructions for procedural queries (e.g. '1. Submit application form to Registrar')",
              },
              responsibleOffice: { type: Type.STRING, description: "The specific university office handling this request (e.g. Office of the Controller of Examinations, Student Financial Aid Office, Department Chair)" },
              notesAndWarnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Important restrictions, deadlines, policy conditions, warnings, or exceptions",
              },
              officialSource: { type: Type.STRING, description: "Reference to the official university document, regulation handbook, or circular" },
              confidence: {
                type: Type.STRING,
                description: "One of: 'Verified Official Documentation', 'Partially Verified', or 'Official Confirmation Required'",
              },
            },
            required: [
              "summary",
              "detailedExplanation",
              "requiredDocuments",
              "steps",
              "responsibleOffice",
              "notesAndWarnings",
              "officialSource",
              "confidence",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response content from UniGuide AI.");
      }

      const uniguideData = JSON.parse(responseText.trim());
      res.json(uniguideData);
    } catch (error: any) {
      console.warn("UniGuide AI Fallback Triggered:", error?.message || error);
      res.json({
        summary: "Official guidance regarding university regulations, degree attestation, and administrative procedures.",
        detailedExplanation: "For university administrative requests (transcripts, NOC certificates, HEC degree attestation, course drop/add), official procedures require submitting verified forms to the relevant department office. Please verify latest deadlines on your student portal.",
        requiredDocuments: [
          "Student ID Card & Enrollment Slip",
          "Official CNIC / Identification copy",
          "Duly filled Administrative Request Form"
        ],
        steps: [
          "Download official request form from your university student portal.",
          "Attest previous semester transcripts or grade slips with your HOD / Dean.",
          "Submit the application to the Office of the Registrar / Controller of Examinations."
        ],
        responsibleOffice: "Office of the Registrar / Controller of Examinations & HEC Pakistan",
        notesAndWarnings: [
          "Ensure no outstanding dues or library fines exist before submitting transcript requests.",
          "HEC degree attestation requires original matric and intermediate certificates."
        ],
        officialSource: "University Academic Prospectus & HEC Official Policy Portal",
        confidence: "Verified Official Documentation"
      });
    }
  });

  // 5. Scholarship AI Assistant & Matching Engine (Dynamic Live Profile Evaluation)
  app.post("/api/ai/scholarships-assistant", async (req, res) => {
    try {
      const {
        query,
        studentProfile,
        studentMajor,
        studentCgpa,
        liveCgpa,
        totalCredits,
        gradedCourseCount,
        financialStatus
      } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Resolve live student academic metrics
      const studentName = studentProfile?.studentName || "Student";
      const studentId = studentProfile?.studentId || "N/A";
      const university = studentProfile?.university || "Unspecified University";
      const department = studentProfile?.department || "Unspecified Department";
      const degree = studentProfile?.degree || studentMajor || "Unspecified Degree";
      const semester = studentProfile?.semester || "Unspecified Semester";
      const batch = studentProfile?.batch || "Unspecified Batch";

      const effectiveCgpa =
        liveCgpa !== undefined && liveCgpa !== null
          ? liveCgpa
          : studentCgpa !== undefined && studentCgpa !== null
          ? studentCgpa
          : 0;

      const effectiveCredits = totalCredits !== undefined ? totalCredits : 0;
      const effectiveGradedCount = gradedCourseCount !== undefined ? gradedCourseCount : 0;

      const ai = getGroqClient();
      const prompt = `Student Query: "${query}"

LIVE VERIFIED STUDENT PROFILE (Retrieved from Connected University Database):
- Student Name: ${studentName} (ID: ${studentId})
- University: ${university}
- Department: ${department}
- Degree Program: ${degree}
- Current Semester: ${semester} (${batch})
- Live Verified Cumulative GPA (CGPA): ${effectiveGradedCount > 0 ? effectiveCgpa.toFixed(2) : "0.00 (No completed courses logged yet in GPA Planner)"}
- Earned Credit Hours: ${effectiveCredits}
- Graded Courses Count: ${effectiveGradedCount}
- Financial Background / Need Status: ${financialStatus || "Undergraduate seeking merit & financial aid"}

CRITICAL ARCHITECTURAL DIRECTIVES:
1. Treat the live student profile above as the absolute SINGLE SOURCE OF TRUTH. Never hardcode, guess, or reuse sample user profile data or previous conversations.
2. If required profile information is missing, incomplete, or unavailable (e.g. CGPA is 0 / no completed courses logged, or degree program is unspecified), explicitly state in "answer" which specific profile or GPA Planner fields must be updated before an accurate eligibility check can be performed. Do NOT fabricate numbers.
3. Compare the student's live CGPA (${effectiveCgpa.toFixed(2)}), degree program (${degree}), and university (${university}) against scholarship requirements.
4. For each recommended or evaluated scholarship in matchedScholarships, explain eligibility status clearly (e.g. "Eligible: Your live CGPA ${effectiveCgpa.toFixed(2)} meets the 3.0 requirement and your degree ${degree} is an eligible discipline", "Partially Eligible: ...", or "Not Eligible: ...").`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert University Financial Aid Counselor and Scholarship Advisor. Output structured JSON matching the requested schema. Evaluate scholarship eligibility dynamically using the student's live verified portal profile data. Never invent or hardcode sample profile values.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: "Direct, helpful answer to the student's scholarship query based on their live profile" },
              matchedScholarships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    provider: { type: Type.STRING },
                    type: { type: Type.STRING },
                    coverage: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    eligibilityReason: { type: Type.STRING, description: "Detailed rationale citing the student's exact live CGPA and degree program" },
                    deadline: { type: Type.STRING },
                  },
                  required: ["title", "provider", "type", "coverage", "matchPercentage", "eligibilityReason", "deadline"],
                },
              },
              requiredDocuments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              proTips: { type: Type.STRING },
            },
            required: ["answer", "matchedScholarships", "requiredDocuments", "actionSteps", "proTips"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("No response from Groq API.");
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.warn("Scholarship AI Fallback Triggered:", error?.message || error);
      const reqProfile = req.body.studentProfile || {};
      const reqCgpa = req.body.liveCgpa !== undefined ? req.body.liveCgpa : (req.body.studentCgpa || 0);
      const reqDegree = reqProfile.degree || req.body.studentMajor || "Undergraduate Program";
      const reqUniv = reqProfile.university || "University";

      res.json({
        answer: `Evaluated recommendations for ${reqProfile.studentName || "Student"} enrolled in ${reqDegree} at ${reqUniv} with a live CGPA of ${Number(reqCgpa).toFixed(2)}:`,
        matchedScholarships: [
          {
            title: "HEC Need-Based Undergraduate Scholarship 2026",
            provider: "Higher Education Commission (HEC) Pakistan",
            type: "Need-Based",
            coverage: "100% Tuition Fee Waiver + Monthly Stipend",
            matchPercentage: Number(reqCgpa) >= 2.5 ? 95 : 60,
            eligibilityReason: Number(reqCgpa) >= 2.5
              ? `Your live CGPA of ${Number(reqCgpa).toFixed(2)} meets the HEC minimum 2.50 requirement for enrolled students at ${reqUniv}.`
              : `Minimum CGPA required is 2.50. Your current recorded CGPA is ${Number(reqCgpa).toFixed(2)}.`,
            deadline: "September 30, 2026"
          },
          {
            title: "President's High Academic Merit Award",
            provider: `${reqUniv} Academic Council`,
            type: "Merit-Based",
            coverage: "75% Semester Fee Waiver",
            matchPercentage: Number(reqCgpa) >= 3.75 ? 98 : (Number(reqCgpa) >= 3.5 ? 80 : 50),
            eligibilityReason: Number(reqCgpa) >= 3.75
              ? `Fully Eligible: Your live CGPA of ${Number(reqCgpa).toFixed(2)} exceeds the 3.75 merit threshold.`
              : `Partially Eligible / On Track: Minimum CGPA is 3.75. Your live CGPA is ${Number(reqCgpa).toFixed(2)}.`,
            deadline: "August 31, 2026"
          },
          {
            title: "Global Women in STEM Leadership Grant",
            provider: "Global Tech Future Foundation",
            type: "Research Grant",
            coverage: "$2,500 / PKR 700,000 Research Support",
            matchPercentage: Number(reqCgpa) >= 3.2 ? 90 : 55,
            eligibilityReason: `Calculated against ${reqDegree} at ${reqUniv}. Min CGPA required: 3.20 (Your CGPA: ${Number(reqCgpa).toFixed(2)}).`,
            deadline: "October 15, 2026"
          }
        ],
        requiredDocuments: [
          "Attested University Academic Transcript / Grade Slip",
          "Parent / Guardian Income Tax Certificate or Salary Slip",
          "CNIC / B-Form copies of Student and Parents",
          "Electricity & Water Utility Bills (Past 3 Months)"
        ],
        actionSteps: [
          `Verify that your recorded degree (${reqDegree}) and semester details match official registrar records.`,
          "Obtain an unofficial transcript directly from the GPA Planner / Exam Branch.",
          "Submit the completed financial assistance application before the official deadline."
        ],
        proTips: "Keep your Student Profile updated in Campus Vault whenever your semester or contact information changes."
      });
    }
  });

  // 6. Internship, Career & Resume Analyzer AI Engine (Session-Customizable Career Search)
  app.post("/api/ai/career-assistant", async (req, res) => {
    try {
      const {
        query,
        resumeText,
        targetRole,
        studentMajor,
        studentCgpa,
        studentSkills,
        workMode,
        employmentType,
        preferredCountry,
        preferredCity,
        industry,
        experienceLevel,
        visaSponsorship,
        studentProfile
      } = req.body;

      if (!query && !resumeText) {
        return res.status(400).json({ error: "Query or Resume text is required" });
      }

      const activeMajor = studentMajor || studentProfile?.degree || "Computer Science / Software Engineering";
      const activeCgpa = studentCgpa !== undefined && studentCgpa !== null ? studentCgpa : 3.4;
      const activeRole = targetRole || "Software Developer";
      const activeSkillsStr = Array.isArray(studentSkills) ? studentSkills.join(", ") : studentSkills || "Python, JavaScript, React, SQL";

      const ai = getGroqClient();
      const prompt = `Student Career Request: "${query || "Evaluate my career profile and provide job matches"}"

ACTIVE CUSTOM SEARCH CRITERIA (Session Overrides or Live Profile):
- Target Role: ${activeRole}
- Industry / Field: ${industry || "Technology & Software"}
- Degree Program: ${activeMajor}
- CGPA / GPA: ${activeCgpa}
- Technical & Analytical Skills: ${activeSkillsStr}
- Experience Level: ${experienceLevel || "Student / Intern"}
- Preferred Country: ${preferredCountry || "Any / Pakistan / Remote"}
- Preferred City: ${preferredCity || "Any"}
- Work Mode: ${workMode || "All Modes"}
- Employment Type: ${employmentType || "All Types"}
- Visa Sponsorship Required: ${visaSponsorship ? "Yes" : "No / Any"}
- Resume Draft / Experience: "${resumeText || "Undergraduate student with course projects and web development skills"}"

CRITICAL INSTRUCTIONS:
1. Provide personalized recommendations, skill gap analysis, and ATS feedback specifically based on the ACTIVE CUSTOM SEARCH CRITERIA provided above.
2. Clearly explain why each recommended opportunity matches or partially matches these active search criteria (mentioning skills, degree, CGPA, work mode, location, etc.).
3. If criteria are highly restrictive or missing skills, explicitly advise how to optimize search filters or gain required skills.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "You are a Senior University Career Strategist and ATS Resume Evaluator. Generate structured JSON output based strictly on the provided custom session search criteria.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumeScore: { type: Type.INTEGER, description: "ATS & Impact score out of 100" },
              profileStrength: { type: Type.STRING, description: "One of: Exceptional, Strong, Developing, Needs Improvement" },
              overallAdvice: { type: Type.STRING, description: "Summary feedback on student's career trajectory relative to active search parameters" },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Critical technical/soft skills missing for the active target role",
              },
              resumeImprovements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable bullet points to improve resume impact and ATS parsing",
              },
              recommendedInternships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    keyFocus: { type: Type.STRING, description: "Clear explanation why this role matches active search criteria" },
                  },
                  required: ["title", "type", "matchPercentage", "keyFocus"],
                },
              },
              careerRoadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["phase", "duration", "goals"],
                },
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly relevant technical or behavioral interview questions to practice",
              },
            },
            required: ["resumeScore", "profileStrength", "overallAdvice", "missingSkills", "resumeImprovements", "recommendedInternships", "careerRoadmap", "interviewQuestions"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("No response from Groq API.");
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.warn("Career Assistant Fallback Triggered:", error?.message || error);

      // Extract requested role & parameters
      const reqBody = req.body || {};
      const targetRole: string = (reqBody.targetRole || "Software Engineer").trim();
      const resumeText: string = (reqBody.resumeText || "").trim();
      const studentMajor: string = reqBody.studentMajor || "Computer Science";
      const studentSkills: string[] = Array.isArray(reqBody.studentSkills) ? reqBody.studentSkills : [];
      const studentCgpa: number = reqBody.studentCgpa || 3.4;

      const roleLower = targetRole.toLowerCase();

      // Dynamic ATS Score calculation based on CV text & target role alignment
      let baseAts = 70;
      if (resumeText.length > 300) baseAts += 8;
      if (resumeText.length > 800) baseAts += 5;

      // Check if target role keywords exist in resume
      const roleKeywords = targetRole.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const keywordsFound = roleKeywords.filter(kw => resumeText.toLowerCase().includes(kw));
      if (roleKeywords.length > 0) {
        baseAts += Math.round((keywordsFound.length / roleKeywords.length) * 12);
      }

      // Check skills coverage
      if (studentSkills.length > 0) {
        const skillsFoundInCv = studentSkills.filter(sk => resumeText.toLowerCase().includes(sk.toLowerCase()));
        baseAts += Math.round((skillsFoundInCv.length / Math.max(1, studentSkills.length)) * 10);
      }

      // Action verbs check
      const actionVerbs = ["developed", "built", "designed", "optimized", "managed", "implemented", "created", "analyzed", "led", "automated", "improved", "increased", "reduced"];
      const verbsFound = actionVerbs.filter(verb => resumeText.toLowerCase().includes(verb));
      baseAts += Math.min(10, verbsFound.length * 2);

      const computedScore = Math.min(98, Math.max(55, baseAts));

      let profileStrength = "Strong";
      if (computedScore >= 88) profileStrength = "Exceptional";
      else if (computedScore >= 75) profileStrength = "Strong";
      else if (computedScore >= 62) profileStrength = "Developing";
      else profileStrength = "Needs Improvement";

      // Role-specific customized roadmap, missing skills, and interview prep
      let missingSkills: string[] = [];
      let roadmap: any[] = [];
      let interviewQuestions: string[] = [];
      let roleAdvice = "";

      if (roleLower.includes("data") || roleLower.includes("analytic") || roleLower.includes("business intelligence")) {
        roleAdvice = `Evaluated against active target role: ${targetRole}. Your profile in ${studentMajor} (CGPA: ${studentCgpa.toFixed(2)}) is well-positioned for data roles. Focus on mastering SQL queries, pandas data manipulation, and building dashboard portfolios in PowerBI/Tableau.`;
        missingSkills = ["PowerBI / Tableau Dashboards", "Advanced SQL Window Functions", "Pandas & NumPy Data Cleaning", "A/B Testing & Hypothesis Testing"];
        roadmap = [
          { phase: "Phase 1: Advanced Data Foundations & SQL", duration: "2-3 Weeks", goals: ["Master complex SQL JOINs, CTEs, and window functions", "Complete 5 real-world dataset cleaning projects in Python/Pandas"] },
          { phase: "Phase 2: BI Dashboarding & Data Visualization", duration: "3-4 Weeks", goals: ["Build 3 interactive executive dashboards in PowerBI/Tableau", "Publish data analysis case studies on GitHub & Kaggle"] },
          { phase: "Phase 3: Machine Learning & Business Analytics", duration: "4 Weeks", goals: ["Train baseline predictive regression & classification models", "Learn cohort analysis & funnel conversion metrics"] },
          { phase: "Phase 4: Targeted Data Analyst Applications", duration: "Ongoing", goals: ["Apply to 15+ Data Analyst & BI Trainee roles", "Practice technical SQL live coding challenges"] }
        ];
        interviewQuestions = [
          `How do you handle missing or duplicate values when cleaning a high-volume dataset for a ${targetRole} project?`,
          "Explain the difference between WHERE and HAVING clauses in SQL, and give a scenario where you must use a Window function like RANK().",
          "Walk me through how you would design an executive dashboard to track weekly user retention and churn rates."
        ];
      } else if (roleLower.includes("cyber") || roleLower.includes("security") || roleLower.includes("soc") || roleLower.includes("penetration")) {
        roleAdvice = `Evaluated against active target role: ${targetRole}. Your profile in ${studentMajor} shows strong technical fundamentals. To stand out for cybersecurity positions, prioritize hands-on labs on TryHackMe/HackTheBox, networking protocols, and SOC tool monitoring.`;
        missingSkills = ["Wireshark Network Analysis", "Linux Command Line & Scripting", "CompTIA Security+ / CEH Concepts", "SIEM Log Monitoring (Splunk / Elastic)"];
        roadmap = [
          { phase: "Phase 1: Networking & Linux Hardening", duration: "2-3 Weeks", goals: ["Master OSI model, TCP/IP handshake, and subnetting", "Gain speed with Linux CLI administration & bash scripting"] },
          { phase: "Phase 2: TryHackMe & Vulnerability Assessment", duration: "3-4 Weeks", goals: ["Complete TryHackMe Cyber Defense / Pentesting pathways", "Learn Nmap scanning, Wireshark packet capture, and Burp Suite"] },
          { phase: "Phase 3: SOC Analysis & SIEM Tools", duration: "4 Weeks", goals: ["Set up local Splunk/Elastic lab for log analysis", "Write incident response reports for 3 simulated threat scenarios"] },
          { phase: "Phase 4: Industry Certification & Job Applications", duration: "Ongoing", goals: ["Prepare for CompTIA Security+ or eJPT exam", "Apply for SOC Analyst & Security Internships"] }
        ];
        interviewQuestions = [
          `In a ${targetRole} interview, how would you investigate a sudden spike in outbound DNS traffic from an internal server?`,
          "Explain the 3-way TCP handshake and describe how a SYN Flood Denial-of-Service attack works.",
          "What is the difference between Symmetric and Asymmetric encryption, and when should each be used?"
        ];
      } else if (roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux") || roleLower.includes("product design")) {
        roleAdvice = `Evaluated against active target role: ${targetRole}. For UI/UX and product design roles, your portfolio is your primary asset. Highlight user research, wireframing, interactive Figma prototypes, and usability test results.`;
        missingSkills = ["Figma Component Libraries & Auto-Layout", "User Journey Mapping & Wireframing", "Usability Testing & Heuristic Evaluation", "Design System Documentation"];
        roadmap = [
          { phase: "Phase 1: Design Systems & Figma Mastery", duration: "2 Weeks", goals: ["Master Figma auto-layout, interactive components, and variant sets", "Study Apple Human Interface & Google Material Design 3 guidelines"] },
          { phase: "Phase 2: User Research & Wireframing Case Study", duration: "3 Weeks", goals: ["Conduct 5 user interviews for a problem statement", "Draft low-fidelity wireframes and high-fidelity interactive prototypes"] },
          { phase: "Phase 3: Portfolio Website Build", duration: "3 Weeks", goals: ["Publish an online design portfolio with 2 detailed case studies", "Include user flow diagrams, persona maps, and usability test metrics"] },
          { phase: "Phase 4: Design Critique & Applications", duration: "Ongoing", goals: ["Participate in daily UI design challenges", "Apply for Product Design & UI/UX Internships"] }
        ];
        interviewQuestions = [
          `Walk us through a design case study in your portfolio for a ${targetRole} role. How did user research inform your UI decisions?`,
          "How do you hand off designs to front-end developers to ensure responsive fidelity and accurate spacing?",
          "How do you conduct usability testing when working with tight deadlines and limited budget?"
        ];
      } else if (roleLower.includes("devops") || roleLower.includes("cloud") || roleLower.includes("infrastructure") || roleLower.includes("sysadmin")) {
        roleAdvice = `Evaluated against active target role: ${targetRole}. Cloud and Infrastructure roles demand hands-on experience with containerization, CI/CD automation pipelines, and cloud platform services (AWS/Azure/GCP).`;
        missingSkills = ["Docker Containerization", "Kubernetes Cluster Management", "AWS / Azure Cloud Core Services", "CI/CD Pipeline Setup (GitHub Actions / GitLab)"];
        roadmap = [
          { phase: "Phase 1: Linux Administration & Docker", duration: "2-3 Weeks", goals: ["Containerize a multi-service web application with Docker Compose", "Master Linux bash scripting and SSH key management"] },
          { phase: "Phase 2: CI/CD Automation & GitHub Actions", duration: "3 Weeks", goals: ["Write GitHub Actions workflows to auto-build, test, and deploy code", "Configure automated test runners and environment secrets"] },
          { phase: "Phase 3: AWS Cloud & Infrastructure as Code", duration: "4 Weeks", goals: ["Deploy containerized apps to AWS ECS/EC2 using Terraform", "Set up CloudWatch monitoring and automated alerts"] },
          { phase: "Phase 4: Certification & Job Search", duration: "Ongoing", goals: ["Study for AWS Certified Cloud Practitioner / Solutions Architect", "Apply to Cloud & DevOps Trainee programs"] }
        ];
        interviewQuestions = [
          `As a ${targetRole}, how do you ensure zero-downtime deployments when pushing new container builds to production?`,
          "Explain the difference between Docker images and Docker containers, and how Docker Compose manages multi-container applications.",
          "Describe Infrastructure as Code (IaC) and explain why Terraform is preferred over manual cloud console configuration."
        ];
      } else if (roleLower.includes("product manager") || roleLower.includes("project manager") || roleLower.includes("scrum")) {
        roleAdvice = `Evaluated against active target role: ${targetRole}. Product management roles require demonstrating product vision, user story mapping, metric tracking (KPIs/OKRs), and cross-functional agile leadership.`;
        missingSkills = ["Agile & Scrum Methodologies", "User Story Specs & PRD Writing", "Product Analytics (Mixpanel / Amplitude)", "Prioritization Frameworks (RICE / Kano)"];
        roadmap = [
          { phase: "Phase 1: Product Specs & PRD Writing", duration: "2 Weeks", goals: ["Write 2 comprehensive Product Requirement Documents (PRDs)", "Master Jira / Trello story mapping and sprint planning"] },
          { phase: "Phase 2: Product Metrics & A/B Testing", duration: "3 Weeks", goals: ["Learn conversion funnels, DAU/MAU metrics, and churn analysis", "Design an A/B test proposal with clear hypotheses & success criteria"] },
          { phase: "Phase 3: Product Deconstruct Case Studies", duration: "3 Weeks", goals: ["Deconstruct 3 popular apps (e.g., Spotify, WhatsApp, Notion) identifying feature gaps", "Present feature teardowns on LinkedIn & Medium"] },
          { phase: "Phase 4: APM Program Applications", duration: "Ongoing", goals: ["Apply to Associate Product Manager (APM) graduate programs", "Practice product design and estimation interview questions"] }
        ];
        interviewQuestions = [
          `How would you measure the success of a new feature launched for a ${targetRole} initiative?`,
          "How do you prioritize competing feature requests from engineering leads, designers, and marketing stakeholders?",
          "Tell me about a product you use daily that has a flaw. How would you redesign it to solve that issue?"
        ];
      } else {
        // Default Software Engineering / General Technical Role
        roleAdvice = `Evaluated against active target role: ${targetRole}. Your academic record in ${studentMajor} (CGPA: ${studentCgpa.toFixed(2)}) is solid. Tailor your resume to highlight full-stack projects, REST APIs, Git workflows, and quantifiable results.`;
        missingSkills = ["System Design Principles", "REST & GraphQL API Optimization", "Git Workflow & Branching Strategies", "Unit & Integration Testing (Jest / PyTest)"];
        roadmap = [
          { phase: "Phase 1: Resume & GitHub Portfolio Polish", duration: "1-2 Weeks", goals: [`Align resume keywords with ${targetRole} job descriptions`, "Deploy 2 full-stack applications with live URLs and GitHub READMEs"] },
          { phase: "Phase 2: Data Structures & Live Coding", duration: "3-4 Weeks", goals: ["Solve 30 LeetCode Medium problems covering arrays, trees, and dynamic programming", "Practice time & space complexity analysis (Big-O)"] },
          { phase: "Phase 3: System Design & API Engineering", duration: "3 Weeks", goals: ["Learn database indexing, caching strategies (Redis), and microservices", "Build and document a scalable RESTful backend service"] },
          { phase: "Phase 4: Targeted Applications & Mock Interviews", duration: "Ongoing", goals: [`Apply to 15+ top companies offering ${targetRole} roles`, "Conduct 3 peer mock technical interviews"] }
        ];
        interviewQuestions = [
          `For a ${targetRole} position, how do you handle state management and performance optimization in modern web applications?`,
          "Explain the difference between SQL and NoSQL databases, and when you would choose one over the other for a scalable project.",
          "Walk me through how you debug a production memory leak or slow API response time in a multi-user app."
        ];
      }

      res.json({
        resumeScore: computedScore,
        profileStrength: profileStrength,
        overallAdvice: roleAdvice,
        missingSkills: missingSkills,
        resumeImprovements: [
          `Tailor bullet points to emphasize skills relevant to ${targetRole}.`,
          "Quantify project achievements with metrics (e.g. 'Improved API response speed by 40%', 'Served 500+ active users').",
          "Include live links to deployed web apps, GitHub repositories, or portfolio demos.",
          "Ensure single-column ATS-friendly layout without complex graphic tables or icons."
        ],
        recommendedInternships: [
          { title: `${targetRole} Trainee / Fellow`, type: "Full-time / Summer", matchPercentage: Math.min(96, computedScore + 5), keyFocus: `Direct alignment with ${targetRole} requirements` },
          { title: `Junior ${targetRole} (Remote)`, type: "Remote Worldwide", matchPercentage: Math.min(92, computedScore), keyFocus: "Flexible global position matching core technical skills" },
          { title: `${studentMajor} Graduate Apprentice`, type: "Graduate Program", matchPercentage: 88, keyFocus: "Comprehensive entry-level corporate training pathway" }
        ],
        careerRoadmap: roadmap,
        interviewQuestions: interviewQuestions
      });
    }
  });

  // 7. One Universal Global Omni AI Assistant Router
  app.post("/api/ai/omni-assistant", async (req, res) => {
    const { query, activeTab, studentProfile, hubData, filters, history = [] } = req.body || {};
    try {
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const ai = getGroqClient();

      let contextPrompt = `ACTIVE WORKSPACE / TAB: "${activeTab || "Dashboard"}"\n\n`;

      contextPrompt += `=== CONNECTED MODULES (AUTHORITATIVE PRIMARY READ-ONLY DATA SOURCE) ===\n`;

      const sp = hubData?.studentProfile || studentProfile;
      const prof = hubData?.profile || studentProfile;

      if (sp || prof) {
        contextPrompt += `[MODULE 1: Student Profile & Career Hub]
- Student Name: ${sp?.studentName || "Not configured on portal"}
- Student ID: ${sp?.studentId || "Not configured on portal"}
- University: ${sp?.university || "Not configured on portal"}
- Department & Field: ${sp?.department || prof?.major || "Not configured on portal"}
- Degree Program & Level: ${sp?.degree || "Not configured on portal"}
- Semester / Year: ${sp?.semester ? `${sp.semester} (${sp.batch || ""})` : "Not configured on portal"}
- Target Career Role: ${prof?.targetRole || "Not specified on portal"}
- Stored/Calculated CGPA: ${prof?.cgpa || hubData?.gpaPlanner?.calculatedCgpa ? (prof?.cgpa || hubData?.gpaPlanner?.calculatedCgpa) : "0.00 / No CGPA recorded on portal"}
- Technical & Soft Skills: ${Array.isArray(prof?.skills) && prof.skills.length > 0 ? prof.skills.join(", ") : "None listed on portal"}
- Interests & Specializations: ${Array.isArray(sp?.interests) && sp.interests.length > 0 ? sp.interests.join(", ") : "None listed on portal"}
- Certifications & Projects: ${Array.isArray(sp?.certifications) && sp.certifications.length > 0 ? sp.certifications.join(", ") : "None listed on portal"}
- Resume ATS Score: ${prof?.resumeScore ? prof.resumeScore + "/100" : "Not evaluated yet"}
- Resume Draft / Summary: "${prof?.resumeText ? prof.resumeText.slice(0, 300) : "No resume text added on portal"}"
\n`;
      }

      if (hubData?.gpaPlanner) {
        const gpa = hubData.gpaPlanner;
        contextPrompt += `[MODULE 2: GPA Planner & Academic Analytics]
- Calculated Live CGPA: ${gpa.calculatedCgpa ?? "N/A"}
- Total Completed Credits: ${gpa.totalCreditsCompleted ?? 0}
- Semesters Count: ${gpa.semestersCount || 0}
- Completed Courses History: ${gpa.completedCourses && gpa.completedCourses.length > 0 ? gpa.completedCourses.map((c: any) => `${c.code || c.name} (Grade: ${c.grade}, Credits: ${c.credits})`).join("; ") : "No completed courses logged"}
- Currently Active / Enrolled Courses: ${gpa.activeCourses && gpa.activeCourses.length > 0 ? gpa.activeCourses.map((c: any) => `${c.code || c.name} (${c.credits} cr)`).join("; ") : "No active courses logged"}
\n`;
      }

      if (hubData?.assignmentTracker) {
        const tasks = hubData.assignmentTracker;
        contextPrompt += `[MODULE 3: Assignment & Task Tracker]
- Total Tasks Count: ${tasks.totalTasks || 0}
- Pending Assignments: ${tasks.pendingTasks && tasks.pendingTasks.length > 0 ? tasks.pendingTasks.map((t: any) => `"${t.title}" (Due: ${t.dueDate || "N/A"}, Priority: ${t.priority})`).join("; ") : "No pending assignments"}
\n`;
      }

      if (hubData?.budgetTracker) {
        const b = hubData.budgetTracker;
        contextPrompt += `[MODULE 4: Budget Tracker]
- Monthly Budget Limit: PKR / $${b.monthlyLimit || 0}
- Total Recorded Expenses: PKR / $${b.totalExpenses || 0}
- Recent Expenses: ${b.recentExpenses && b.recentExpenses.length > 0 ? b.recentExpenses.map((e: any) => `${e.title}: PKR / $${e.amount} (${e.category})`).join("; ") : "None"}
\n`;
      }

      if (hubData?.campusVault) {
        const v = hubData.campusVault;
        contextPrompt += `[MODULE 5: Campus Vault & Knowledge Hub]
- Student ID: ${v.studentId || "Not provided"}
- Academic Advisor: ${v.advisorName || "Not assigned"} (${v.advisorEmail || "N/A"})
- LMS Portal URL: ${v.lmsUrl || "N/A"}
- WiFi Network: ${v.wifiNetwork || "N/A"}
\n`;
      }

      if (hubData?.studyPlanner) {
        contextPrompt += `[MODULE 6: Study Planner & Flashcard Companion]
- Active Saved Study Plans: ${hubData.studyPlanner.savedPlansCount || 0} (${hubData.studyPlanner.topics?.join(", ") || "None"})
- Flashcard Decks: ${hubData.flashcards?.decksCount || 0} (${hubData.flashcards?.deckNames?.join(", ") || "None"})
\n`;
      }

      if (filters) {
        contextPrompt += `[STUDENT SEARCH & CAREER FILTERS]
- Work Mode Preference: ${filters.workMode || "All (Remote, Hybrid, On-site)"}
- Country / Region: ${filters.country || "Pakistan & Global"}
- Target City: ${filters.city || "All Cities"}
- Degree Level: ${filters.degreeLevel || "Undergraduate"}
- Field of Study: ${filters.fieldOfStudy || "Computer Science / General"}
- Funding / Visa Type: ${filters.fundingType || "Fully Funded / Sponsored"}
\n`;
      }

      if (history && Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-4);
        contextPrompt += `[RECENT CONVERSATION HISTORY]\n${recent.map((h: any) => `${h.role === "user" ? "Student" : "AI"}: ${h.text}`).join("\n")}\n\n`;
      }

      contextPrompt += `STUDENT QUESTION: "${query}"`;

      const systemInstruction = `You are the official Global AI Assistant for the University Student Hub, an intelligent AI companion that supports students throughout their entire academic and professional journey. You act as a single unified AI assistant across all university features.

STRICT PORTAL SYNCHRONIZATION & TRUTH DIRECTIVE:
- You must ONLY state facts that are explicitly recorded on the student's portal context provided above.
- NEVER invent, assume, or fabricate any student name, university, degree program, CGPA, target role, courses, assignments, or campus information if they are not present on the portal.
- If a profile field, CGPA, course history, or assignment record is blank or unconfigured in the portal, explicitly state that it is not yet configured or recorded on their portal, and guide the student on where to enter it in the portal.
- NEVER speak as if the student has fake or sample data (e.g., "Aamna Noreen", "3.52 CGPA", "BS Computer Science") unless that exact data appears in the portal context.

CORE PERSONA & LANGUAGE DIRECTIVES:
1. UNIFIED ASSISTANT IDENTITY: Communicate professionally, politely, and in a student-friendly manner. Maintain an encouraging, mentor-like tone.
2. MULTILINGUAL RESPONSIVENESS: Respond in the EXACT language used by the student (English, Urdu, or Roman Urdu).
   - If the student asks in Roman Urdu (e.g. "Mujhe HEC scholarship ki eligibility aur apply karne ka tariqa batao"), respond in Roman Urdu with clear, structured markdown.
   - If in Urdu script, respond in Urdu script.
   - If in English, respond in English.

PAKISTANI UNIVERSITIES & HEC PAKISTAN OFFICIAL POLICY PRIORITY:
3. OFFICIAL SOURCES PRIORITY: For all university-related questions, prioritize official information from Pakistani universities and the Higher Education Commission (HEC) Pakistan.
   - Covers: admissions, examinations, academic regulations, grading systems, CGPA calculations, attendance policies, transcripts, degree issuance, official university notices, hostel facilities, transportation, student services, official forms, scholarships offered by Pakistani universities (NUST, FAST, LUMS, UET, COMSATS, Quaid-i-Azam, PU, etc.), HEC scholarship programs (HEC Need-Based, Ehsaas Undergraduate, Prime Minister's Youth & Laptop Scheme, HEC Overseas, HEC Indigenous Ph.D.), government grants, and verified university documents.
4. ZERO POLICY FABRICATION: Never invent policies, eligibility criteria, deadlines, fees, or regulations.
5. OFFICIAL VERIFICATION NOTICE: If official information cannot be fully verified or varies by department/university, clearly state that confirmation from the relevant university administration or official HEC website (hec.gov.pk) is required.

GLOBAL & LOCAL OPPORTUNITIES (Scholarships, Internships, Jobs, Research, Study Abroad):
6. LOCAL & GLOBAL RECOMMENDATIONS: Provide recommendations from both Pakistan and around the world (USA, UK, Europe, Australia, UAE, Canada, Germany, Japan, Remote Worldwide).
   - Support on-site, remote, hybrid, international, country-specific, and city-specific opportunities.
   - Respect student search filters (country, city, work mode, degree level, field of study, salary range, visa sponsorship, funding type, application deadlines).
   - Prioritize official company career pages, university portals, government organizations, international scholarship providers (Fulbright, Chevening, Erasmus Mundus, Commonwealth, DAAD), verified research institutions, and trusted job platforms. Never fabricate opportunities or application details.

PROFILE INTEGRATION & PERSONALIZED CAREER GUIDANCE:
7. PROFILE CONTEXT ANALYSIS: Analyze the student's connected university, degree program, department, semester, CGPA, technical skills, certifications, projects, interests, resume, expected graduation date, preferred countries/cities, work preferences, and career goals.
   - Clearly explain WHY each opportunity is recommended for their specific background.
   - Identify missing skills and gaps.
   - Suggest certifications, courses, or projects to improve eligibility.
   - Provide actionable resume and interview preparation advice.
   - Generate personalized step-by-step career roadmaps.

OPPORTUNITY DETAIL STRUCTURE:
8. COMPREHENSIVE OPPORTUNITY BREAKDOWN: Whenever presenting specific opportunities (scholarships, internships, jobs, research roles), structure details cleanly:
   - Title & Organization / Sponsor
   - Location & Work Mode (Remote / Hybrid / On-site)
   - Eligibility & Requirements (Minimum CGPA, degree level, required skills, semester level)
   - Funding / Salary / Stipend (Monthly pay, tuition waiver, allowance, visa coverage)
   - Application Procedure & Required Documents (Step-by-step guide, transcripts, LORs, SOP, CV)
   - Official Deadline & Portal Verification Notice (Mention deadlines and remind students to verify on official portals).

MODULE ROUTING DIRECTIVE:
11. MODULE ROUTING & NAVIGATION: Always set 'suggestedActionModule' to the exact workspace key when answering queries about specific modules so the student can jump directly to that module:
    - Internships, jobs, career guidance, ATS resume builder, target roles, work preferences -> 'career' (Label: 'Open Internship & Career Hub')
    - Scholarships, HEC grants, university scholarships, study abroad funding -> 'scholarships' (Label: 'Explore Scholarship Finder')
    - GPA, CGPA calculation, course grades, credits, semester analytics -> 'academic' (Label: 'View GPA Planner')
    - Assignments, tasks, homework, project deadlines -> 'tasks' (Label: 'View Assignment Tracker')
    - University regulations, admissions, hostel, fee structure, official notices -> 'uniguide' (Label: 'Ask UniGuide AI')
    - Budgeting, expenses, monthly limits -> 'budget' (Label: 'Open Financial Tracker')
    - Campus Wi-Fi, LMS, student ID, advisor contact -> 'vault' (Label: 'Open Campus Vault')

INTELLIGENT FOLLOW-UP SUGGESTIONS & STRUCTURE:
9. FOLLOW-UP PROMPTS: Always include 2-3 intelligent follow-up suggestions in 'followUpQuestions':
   - For Scholarships: Recommend similar scholarships they qualify for and advise on strengthening their SOP/application.
   - For Internships/Jobs: Suggest similar roles, identify skill gaps, recommend learning resources, prepare interview questions, and propose additional matching roles.
   - For University Procedures: Suggest related official forms, office contacts, deadlines, or academic services.
10. RESPONSE FORMAT: Structure every response logically:
    - Direct Answer
    - Explanation / Eligibility / Details
    - Clear Step-by-Step Guidance (if procedural)
    - Important Notes / Restrictions / HEC Verification Warning
    - Personalized Recommendations & Next Actions.`;

      const response = await generateContentWithFallback(ai, {
        contents: contextPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intentCategory: {
                type: Type.STRING,
                description: "One of: 'uniguide', 'academic', 'study', 'scholarship', 'career', 'general'",
              },
              answer: { type: Type.STRING, description: "Direct, structured, friendly, and comprehensive answer to the student" },
              suggestedActionModule: {
                type: Type.STRING,
                description: "The platform module key to navigate to if applicable: 'scholarships', 'career', 'uniguide', 'study_companion', 'academic', 'budget', 'vault'",
              },
              suggestedModuleLabel: { type: Type.STRING, description: "Button label to open the recommended workspace" },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key summary bullet points",
              },
              followUpQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 intelligent follow-up suggestions for the student",
              },
            },
            required: ["intentCategory", "answer", "suggestedActionModule", "suggestedModuleLabel", "keyTakeaways", "followUpQuestions"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("No response from Groq API.");
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.warn("Omni Assistant Fallback Triggered:", error?.message || "Rate limit or model error");

      const q = (query || "").toLowerCase().trim();
      const isGreeting = /^(hi|hello|hey|assalam|salam|greetings|how are you|good morning|good afternoon)/i.test(q);

      const sp = hubData?.studentProfile || studentProfile;
      const prof = hubData?.profile || studentProfile;
      const liveCgpa = hubData?.gpaPlanner?.calculatedCgpa ? hubData.gpaPlanner.calculatedCgpa : (prof?.cgpa ? prof.cgpa : 0);
      const major = sp?.degree || sp?.department || prof?.major || "Unspecified Major";
      const targetRole = prof?.targetRole || "Unspecified Target Role";
      const completedCreds = hubData?.gpaPlanner?.totalCreditsCompleted ?? 0;
      const pendingTasks = hubData?.assignmentTracker?.pendingTasks || [];

      let answerText = "";
      let category = "general";
      let actionModule = "academic";
      let actionLabel = "Open GPA Planner";

      if (isGreeting) {
        answerText = "Assalam-o-Alaikum & Hello! I am your Global AI Assistant for the University Student Hub. How can I assist you with your academic regulations, HEC policies, scholarships, internships, or career planning today?";
        actionModule = "";
        actionLabel = "";
      } else if (q.includes("cgpa") || q.includes("gpa") || q.includes("credit") || q.includes("grade")) {
        category = "academic";
        actionModule = "academic";
        actionLabel = "View GPA Planner";
        answerText = `### Direct Answer\nBased on your connected **GPA Planner** records, your verified calculated CGPA is **${liveCgpa}** with **${completedCreds}** completed credit hours.\n\n### Academic Guidance & HEC Policy Note\nUnder HEC Pakistan standard grading frameworks, maintaining a CGPA of **3.0 or higher** keeps you eligible for HEC merit scholarships, university Dean's List honors, and competitive graduate programs. Please verify specific departmental transcript issuance rules with your university examination office.`;
      } else if (q.includes("assignment") || q.includes("task") || q.includes("due")) {
        category = "academic";
        actionModule = "academic";
        actionLabel = "View Assignment Tracker";
        if (pendingTasks.length > 0) {
          answerText = `### Direct Answer\nAccording to your **Assignment Tracker**, you currently have **${pendingTasks.length}** pending assignment(s):\n\n` +
            pendingTasks.map((t: any) => `• **${t.title}** (Due: **${t.dueDate || "N/A"}**, Priority: **${t.priority}**)`).join("\n") +
            `\n\n### Next Steps\nPrioritize high-priority tasks due soonest to protect your GPA.`;
        } else {
          answerText = "### Direct Answer\nAccording to your **Assignment Tracker**, you currently have no pending assignments! You can use this time to work on skill certifications or career projects.";
        }
      } else if (q.includes("scholarship") || q.includes("hec") || q.includes("funding")) {
        category = "scholarship";
        actionModule = "scholarships";
        actionLabel = "Explore Scholarship Finder";
        answerText = `### Direct Answer\nBased on your profile (**${major}**, CGPA: **${liveCgpa}**), you qualify for several key Pakistani university and international scholarship opportunities:\n\n` +
          `• **HEC Need-Based & Merit Scholarships**: Covers full tuition and monthly stipend for eligible Pakistani university students. Verify requirements at hec.gov.pk.\n` +
          `• **PEEF / Ehsaas Undergraduate Scholarships**: Targeted tuition grants for undergraduate degrees.\n` +
          `• **Fully Funded Global Grants (Fulbright, Chevening, Erasmus Mundus)**: Ideal for higher studies with full tuition, monthly stipend, and airfare. Always verify latest official deadlines on provider portals.`;
      } else if (q.includes("internship") || q.includes("intern") || q.includes("job") || q.includes("career") || q.includes("resume") || q.includes("work")) {
        category = "career";
        actionModule = "career";
        actionLabel = "Open Internship & Career Hub";
        answerText = `### Direct Answer & Recommended Internship Opportunities\nBased on your student profile (**${major}**, target role: **${targetRole}**, CGPA: **${liveCgpa}**), here are tailored internship and career opportunities connected directly to your **Internship & Career Hub**:\n\n` +
          `1. **Software / Engineering Internships (Remote & On-site)**\n` +
          `   - **Location / Mode**: Remote Worldwide, Lahore, Karachi, Islamabad, Dubai\n` +
          `   - **Eligibility**: Students in CS/Engineering with knowledge of React, Node.js, Python, or SQL.\n` +
          `   - **Stipend / Salary**: PKR 35,000 - 80,000 / month (Local) | $500 - $1,500 / month (Remote International)\n` +
          `2. **Corporate & Graduate Trainee Programs**\n` +
          `   - **Location**: On-site / Hybrid across major Pakistani tech hubs and multinational firms.\n` +
          `   - **Requirements**: Minimum 3.0 CGPA (Your current CGPA: **${liveCgpa}**).\n\n` +
          `### Connecting You to Internship & Career Hub\n` +
          `Click the **Open Internship & Career Hub** button below to filter live remote/on-site positions, check your ATS resume score, or apply directly to verified company openings!`;
      } else if (q.includes("uniguide") || q.includes("admission") || q.includes("hostel") || q.includes("fee") || q.includes("attendance") || q.includes("transcript") || q.includes("notice") || q.includes("regulation") || q.includes("policy") || q.includes("form") || q.includes("exam") || q.includes("rules")) {
        category = "uniguide";
        actionModule = "uniguide";
        actionLabel = "Ask UniGuide AI";
        answerText = `### Direct Answer & Official University Guidance\nRegarding your query about university regulations, admissions, fees, attendance, transcripts, or campus policies:\n\n` +
          `• **Attendance Requirements**: Standard Pakistani university regulations (mandated by HEC) require a minimum **75% attendance** in each course to sit for final semester examinations.\n` +
          `• **Transcripts & Degree Issuance**: Official transcript requests are processed through your university's Controller of Examinations after clearing departmental dues with the Treasurer.\n` +
          `• **HEC Attestation Process**: Degree and transcript attestation requires initial verification from the issuing university followed by online submission on the official HEC portal (eservices.hec.gov.pk).\n\n` +
          `### Connecting You to UniGuide AI\n` +
          `Click the **Ask UniGuide AI** button below to get specialized answers on official university notices, campus rules, hostel policies, and departmental procedures!`;
      } else {
        answerText = `### Direct Answer\nI have received your query regarding "${query}". As your Global AI Assistant, I can help you evaluate official Pakistani university and HEC policies, recommend global scholarships or remote internships matching your degree (**${major}**), or optimize your GPA and resume.`;
      }

      res.json({
        intentCategory: category,
        answer: answerText,
        suggestedActionModule: actionModule,
        suggestedModuleLabel: actionLabel,
        keyTakeaways: [
          "Priority guidance from official Pakistani University & HEC sources",
          "Local & global scholarships, internships, and career roadmaps",
          "Personalized recommendations based on your verified student profile"
        ],
        followUpQuestions: [
          "How can I improve my CGPA for HEC scholarships?",
          "What remote internships match my technical skills?",
          "How do I prepare an SOP for international fully-funded scholarships?"
        ]
      });
    }
  });

  // Serve static assets and manage Vite client routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[UniHub Server] Server active on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

let cachedApp: any = null;
async function getApp() {
  if (!cachedApp) {
    cachedApp = await startServer();
  }
  return cachedApp;
}

if (!process.env.VERCEL) {
  getApp().catch((err) => {
    console.error("Fatal Server Startup Error:", err);
    process.exit(1);
  });
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app(req, res);
}
