"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useHoverSound, SOUND_PRESETS } from "@/hooks/useHoverSound";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const playClick = useHoverSound(SOUND_PRESETS.click);
  const playHover = useHoverSound(SOUND_PRESETS.glimmer);

  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const bgX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const bgY = useTransform(smoothY, [-1, 1], [-20, 20]);

  const hudX = useTransform(smoothX, [-1, 1], [15, -15]);
  const hudY = useTransform(smoothY, [-1, 1], [15, -15]);

  const titleX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const titleY = useTransform(smoothY, [-1, 1], [-8, 8]);

  return (
    <motion.main 
      animate={isShaking ? { x: [-5, 5, -3, 3, -1, 1, 0], y: [-3, 3, -4, 4, -1, 1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "linear" }}
      onAnimationComplete={() => setIsShaking(false)}
      className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-0 overflow-hidden w-full max-w-5xl"
    >
      <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between pb-4 border-b border-sky-900/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="font-mono text-[0.45rem] tracking-[0.3em] text-sky-500/60 uppercase">
            LOST_MEMORIES // CORE_SYS
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.45rem] tracking-[0.18em] text-emerald-400 uppercase">
                ● LOGGED_IN: {currentUser.username}
              </span>
              <button
                onClick={() => {
                  playClick();
                  logout();
                }}
                className="font-mono text-[0.45rem] tracking-[0.15em] text-zinc-500 hover:text-red-400 transition-colors uppercase cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.45rem] tracking-[0.18em] text-zinc-500 uppercase">
                ○ GUEST_MODE
              </span>
              <Link
                href="/login"
                onClick={playClick}
                className="font-mono text-[0.45rem] tracking-[0.15em] text-sky-400 hover:text-sky-300 transition-colors uppercase"
              >
                [ SIGN IN / REGISTER ]
              </Link>
            </div>
          )}
        </div>
      </div>
      <motion.div 
        className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none mix-blend-normal opacity-90"
        style={{ x: bgX, y: bgY, willChange: "transform" }}
      >
        <motion.div
          animate={{
            x: ["0%", "15%", "-8%", "0%"],
            y: ["0%", "-15%", "8%", "0%"],
            rotate: [0, 90, 180, 360],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="absolute w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,#082032,#02080d)] blur-[140px] top-[-30%] left-[-20%] opacity-70 rounded-full"
        />
        <motion.div
          animate={{
            x: ["0%", "-20%", "15%", "0%"],
            y: ["0%", "20%", "-15%", "0%"],
            rotate: [360, 180, 90, 0],
            scale: [1, 0.85, 1.2, 1],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="absolute w-[100vw] h-[100vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(circle_at_center,#0f304a,#030c14)] blur-[130px] bottom-[-40%] right-[-30%] opacity-60 rounded-full"
        />
        <motion.div
          animate={{
            x: ["-15%", "15%", "-15%"],
            y: ["-15%", "15%", "-15%"],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="absolute w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(circle_at_center,#0a253a,#010910)] blur-[120px] top-[10%] left-[20%] opacity-50 rounded-full"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ x: hudX, y: hudY, willChange: "transform" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf804_1px,transparent_1px),linear-gradient(to_bottom,#38bdf804_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        
        <div className="absolute top-12 left-12 w-4 h-4 border-t border-l border-sky-500/10"></div>
        <div className="absolute top-12 right-12 w-4 h-4 border-t border-r border-sky-500/10"></div>
        <div className="absolute bottom-12 left-12 w-4 h-4 border-b border-l border-sky-500/10"></div>
        <div className="absolute bottom-12 right-12 w-4 h-4 border-b border-r border-sky-500/10"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-dashed border-sky-500/5 rounded-full"></div>
        
        {[
          { text: "DECAY.RATE // 14.2%", top: "15%", left: "10%", delay: 0 },
          { text: "LOST.SECTORS // 404_VOID", top: "80%", left: "80%", delay: 1 },
          { text: "NARRATIVE.ECHO // ACTIVE", top: "85%", left: "12%", delay: 2 },
          { text: "RESONANCE.DRIFT // 0.04Hz", top: "20%", left: "75%", delay: 1.5 },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.35em] text-sky-300/20 uppercase"
            style={{ top: item.top, left: item.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <span className="mr-2 inline-block opacity-40">►</span>{item.text}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-center space-y-8 relative z-10"
        style={{ x: titleX, y: titleY, willChange: "transform" }}
      >
        
        <motion.div 
          initial={{ opacity: 0, filter: "blur(8px)", scale: 0.97 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative select-none"
        >
          <h1 className="font-sans text-[8rem] sm:text-[12rem] md:text-[18rem] lg:text-[22rem] font-black tracking-tighter text-sky-50 drop-shadow-[0_0_40px_rgba(56,189,248,0.15)] leading-none">
            404
          </h1>
          <h1 
            className="absolute top-0 left-0 w-full h-full font-sans text-[8rem] sm:text-[12rem] md:text-[18rem] lg:text-[22rem] font-black tracking-tighter hollow-text translate-x-[6px] translate-y-[6px] pointer-events-none leading-none"
            aria-hidden="true"
          >
            404
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6 pt-6"
        >
          <h2 className="font-mono text-[0.65rem] sm:text-[0.7rem] tracking-[0.6em] md:tracking-[0.8em] text-zinc-400 uppercase font-light ml-[0.6em] md:ml-[0.8em]">
            Lost Memories
          </h2>
          <div className="w-6 h-[1px] bg-zinc-800/80"></div>
          <p className="font-mono text-[0.55rem] tracking-[0.35em] md:tracking-[0.45em] text-zinc-600 uppercase leading-loose text-center ml-[0.35em] md:ml-[0.45em]">
            Some fragments remain, suspended in the drift.<br/>Decryption is unstable. Coherence is fading.
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        className="pt-24 md:pt-32"
      >
        <motion.div
          whileHover="hover"
          whileTap="tap"
          initial="rest"
          animate="rest"
          variants={{
            rest: { scale: 1 },
            hover: {
              scale: [1, 1.02, 1],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            },
            tap: {
              scale: 0.95,
              filter: "brightness(2) drop-shadow(0 0 20px rgba(56,189,248,0.5))",
              transition: { duration: 0.05, ease: "easeOut" }
            }
          }}
        >
          <Link
            href="/maze"
            onClick={(e) => {
              e.preventDefault();
              playClick();
              setIsShaking(true);
              setTimeout(() => router.push("/maze"), 200);
            }}
            onMouseEnter={playHover}
            className="group relative inline-flex items-center justify-center px-16 py-5 overflow-hidden transition-all duration-1000 ease-out bg-transparent"
          >
            <div className="absolute inset-0 border border-sky-800/20 transition-colors duration-1000 ease-out group-hover:border-sky-600/40 bg-sky-950/10 group-hover:bg-sky-900/20"></div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out bg-sky-500/5 blur-xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-sky-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out rounded-full pointer-events-none"></div>

            <span className="relative z-10 font-mono font-light text-[0.6rem] sm:text-[0.65rem] tracking-[0.45em] text-sky-600/80 uppercase transition-all duration-1000 ease-out group-hover:text-sky-100 group-hover:tracking-[0.65em] group-hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] ml-[0.45em] group-hover:ml-[0.65em]">
              Enter The Maze
            </span>

            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-sky-700/40 transition-colors duration-1000 group-hover:border-sky-300/60"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-sky-700/40 transition-colors duration-1000 group-hover:border-sky-300/60"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-sky-700/40 transition-colors duration-1000 group-hover:border-sky-300/60"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-sky-700/40 transition-colors duration-1000 group-hover:border-sky-300/60"></div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}

