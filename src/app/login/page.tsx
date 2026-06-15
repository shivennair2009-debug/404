"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useHoverSound, SOUND_PRESETS } from "@/hooks/useHoverSound";

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, currentUser, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState("");

  const playClick = useHoverSound(SOUND_PRESETS.click);
  const playHover = useHoverSound(SOUND_PRESETS.glimmer);
  const playError = useHoverSound(SOUND_PRESETS.corrupt);

  // If already logged in, redirect to maze
  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/maze");
    }
  }, [currentUser, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    playClick();

    if (isLogin) {
      setSubmittingStep("ESTABLISHING ENCRYPTED UPLINK...");
      const res = await login(email, password);
      if (res.success) {
        setSuccess("ACCESS GRANTED. REDIRECTING...");
        setTimeout(() => {
          router.push("/maze");
        }, 1000);
      } else {
        setError(res.error || "Authentication failed.");
        playError();
        setIsSubmitting(false);
      }
    } else {
      if (!username.trim()) {
        setError("Username is required.");
        playError();
        setIsSubmitting(false);
        return;
      }
      setSubmittingStep("CREATING SECTOR PATHWAYS...");
      const res = await signup(email, username, password);
      if (res.success) {
        setSuccess("UPLINK CREATED. INITIALIZING ARCHIVE...");
        setTimeout(() => {
          router.push("/maze");
        }, 1000);
      } else {
        setError(res.error || "Uplink registration failed.");
        playError();
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading || currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-[0.5rem] tracking-[0.4em] text-sky-500/40 uppercase"
        >
          ► SYNCHRONIZING AUTH STATE...
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden">
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,#082032,#02080d)] blur-[140px] top-[-30%] left-[-20%] opacity-70" />
        <div className="absolute w-[100vw] h-[100vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(circle_at_center,#0f304a,#030c14)] blur-[130px] bottom-[-40%] right-[-30%] opacity-60" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf802_1px,transparent_1px),linear-gradient(to_bottom,#38bdf802_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        <div className="absolute top-12 left-12 w-4 h-4 border-t border-l border-sky-500/10"></div>
        <div className="absolute top-12 right-12 w-4 h-4 border-t border-r border-sky-500/10"></div>
        <div className="absolute bottom-12 left-12 w-4 h-4 border-b border-l border-sky-500/10"></div>
        <div className="absolute bottom-12 right-12 w-4 h-4 border-b border-r border-sky-500/10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md border border-sky-900/30 bg-[#02050a]/85 p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-md"
      >
        {/* Corner accents */}
        {CORNERS.map((pos, i) => (
          <div key={i} className={`absolute w-3 h-3 border-sky-500/20 ${pos}`} />
        ))}

        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-sky-900/20 pb-4 text-center sm:text-left">
          <span className="font-mono text-[0.45rem] tracking-[0.5em] text-sky-500/40 uppercase">
            SECURE ACCESS SYSTEM
          </span>
          <h1 className="font-mono text-[0.95rem] tracking-[0.3em] text-sky-200 uppercase font-semibold">
            {isLogin ? "SIGN_IN_UPLINK" : "REGISTER_SIGNAL_UPLINK"}
          </h1>
        </div>

        {isSubmitting ? (
          /* Submitting state animation */
          <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-sky-500/25 rounded-full"
              />
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400/80 animate-ping" />
            </div>
            <span className="font-mono text-[0.55rem] tracking-[0.2em] text-sky-300/80 uppercase">
              {submittingStep}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-red-900/30 bg-red-950/10 p-3 text-left flex items-start gap-2.5"
              >
                <span className="text-red-500 font-mono text-[0.6rem]">⚠</span>
                <span className="font-mono text-[0.55rem] tracking-[0.12em] leading-relaxed text-red-400 uppercase">
                  ERROR: {error}
                </span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-emerald-900/30 bg-emerald-950/10 p-3 text-left flex items-start gap-2.5"
              >
                <span className="text-emerald-500 font-mono text-[0.6rem]">✓</span>
                <span className="font-mono text-[0.55rem] tracking-[0.12em] leading-relaxed text-emerald-400 uppercase">
                  {success}
                </span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onMouseEnter={playHover}
                className="w-full bg-zinc-950/60 border border-sky-900/30 text-sky-100 font-mono text-[0.6rem] px-3 py-2.5 tracking-[0.15em] focus:outline-none focus:border-sky-500/50 transition-colors"
                placeholder="e.g. USER@VOID.NET"
              />
            </div>

            {/* Username Field (Signup Only) */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onMouseEnter={playHover}
                    className="w-full bg-zinc-950/60 border border-sky-900/30 text-sky-100 font-mono text-[0.6rem] px-3 py-2.5 tracking-[0.15em] focus:outline-none focus:border-sky-500/50 transition-colors"
                    placeholder="e.g. SYSTEM_ADMIN"
                    maxLength={18}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                Access passphrase
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onMouseEnter={playHover}
                className="w-full bg-zinc-950/60 border border-sky-900/30 text-sky-100 font-mono text-[0.6rem] px-3 py-2.5 tracking-[0.15em] focus:outline-none focus:border-sky-500/50 transition-colors"
                placeholder="••••••••••••"
                minLength={6}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
              <button
                type="submit"
                className="group relative w-full py-3 overflow-hidden border border-sky-500/30 bg-sky-950/15 hover:bg-sky-900/30 transition-colors duration-500 cursor-pointer text-center"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-sky-500/5 blur-md pointer-events-none" />
                <span className="relative z-10 font-mono text-[0.55rem] tracking-[0.3em] text-sky-300 uppercase">
                  {isLogin ? "[ INITIALIZE UPLINK ]" : "[ REGISTER ARCHIVE SIGNAL ]"}
                </span>
                {CORNERS.map((pos, i) => (
                  <div key={i} className={`absolute w-1.5 h-1.5 border-sky-700/50 group-hover:border-sky-300 transition-colors duration-700 ${pos}`} />
                ))}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  playClick();
                }}
                className="font-mono text-[0.45rem] tracking-[0.2em] text-zinc-500 hover:text-sky-400/80 transition-colors duration-300 uppercase cursor-pointer"
              >
                {isLogin
                  ? "→ RESERVED SIGNAL PORTAL? REGISTER HERE"
                  : "← REGISTERED INJECTOR? INITIATE SIGN IN"}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Return to Landing Page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Link
          href="/"
          onClick={playClick}
          className="font-mono text-[0.5rem] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 uppercase transition-colors"
        >
          [ Return to Main Menu ]
        </Link>
      </motion.div>
    </main>
  );
}
