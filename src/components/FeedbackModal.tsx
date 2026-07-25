import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Send, X, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { getGoogleAccessToken, signInWithGoogleWithGmail } from "../lib/firebase";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  defaultEmail = "",
  defaultName = ""
}: FeedbackModalProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setErrorMsg(null);
    setIsSending(true);

    try {
      let token = getGoogleAccessToken();
      if (!token) {
        // Request Gmail authorization via Google Sign-In popup
        const authResult = await signInWithGoogleWithGmail();
        token = authResult.accessToken;
      }

      if (!token) {
        throw new Error("Google Gmail authorization was not granted. Please sign in with Google to send directly to Gmail.");
      }

      const res = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          name,
          email,
          university,
          message
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver email via Gmail API.");
      }

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setMessage("");
        onClose();
      }, 3500);
    } catch (err: any) {
      console.error("Feedback modal submit error:", err);
      setErrorMsg(err.message || "Failed to send feedback. You can also use the direct mail app button below.");
    } finally {
      setIsSending(false);
    }
  };

  const mailtoUrl = `mailto:aamnanoreen0@gmail.com?subject=${encodeURIComponent(`UniHub AI Feedback from ${name || "Student"}`)}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nUniversity: ${university}\n\nMessage:\n${message}`
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100"
        >
          {/* Header decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Send Feedback via Gmail</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Delivered directly to <span className="text-indigo-300 font-mono">aamnanoreen0@gmail.com</span>
              </p>
            </div>
          </div>

          {sentSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6"
            >
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 animate-bounce" />
              <h4 className="text-base font-bold text-emerald-200">Feedback Sent Successfully!</h4>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto leading-relaxed">
                Your message was sent via Gmail to <strong className="text-emerald-100 font-mono">aamnanoreen0@gmail.com</strong>. Thank you for helping improve UniHub AI!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p>{errorMsg}</p>
                    <a
                      href={mailtoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:underline font-bold pt-1"
                    >
                      <span>Open in default Mail App</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aamna Noreen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@university.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">University / Organization</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. NUST / FAST / LUMS / COMSATS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Feedback / Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your suggestions, feature requests, or questions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Sending via Gmail API...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Feedback to Gmail (aamnanoreen0@gmail.com)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Powered by Google Gmail API</span>
                  <a
                    href={mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    <span>Use mailto link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
