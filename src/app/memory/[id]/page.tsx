"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getFragmentById, STATUS_STYLES } from "@/constants/fragments";
import { useHoverSound, SOUND_PRESETS } from "@/hooks/useHoverSound";
import MemoryVisual from "@/components/MemoryVisual";
import FragmentedData from "@/components/FragmentedData";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function getSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUS_BORDER: Record<string, string> = {
  CORRUPTED: "border-red-900/30",
  PARTIAL:   "border-sky-900/30",
  LOST:      "border-zinc-800/25",
  RECOVERED: "border-emerald-900/30",
};

const STATUS_BG: Record<string, string> = {
  CORRUPTED: "bg-red-950/8",
  PARTIAL:   "bg-sky-950/8",
  LOST:      "bg-zinc-950/5",
  RECOVERED: "bg-emerald-950/8",
};

const STATUS_GLOW: Record<string, string> = {
  CORRUPTED: "rgba(239,68,68,0.07)",
  PARTIAL:   "rgba(56,189,248,0.05)",
  LOST:      "rgba(100,116,139,0.03)",
  RECOVERED: "rgba(52,211,153,0.05)",
};

const STATUS_ACCENT: Record<string, string> = {
  CORRUPTED: "text-red-400/70",
  PARTIAL:   "text-sky-400/70",
  LOST:      "text-zinc-500/55",
  RECOVERED: "text-emerald-400/70",
};

const STATUS_DIVIDER: Record<string, string> = {
  CORRUPTED: "via-red-500/15",
  PARTIAL:   "via-sky-500/15",
  LOST:      "via-zinc-500/10",
  RECOVERED: "via-emerald-500/15",
};

const STATUS_SOUND_MAP: Record<string, typeof SOUND_PRESETS[keyof typeof SOUND_PRESETS]> = {
  CORRUPTED: SOUND_PRESETS.corrupt,
  PARTIAL:   SOUND_PRESETS.glimmer,
  LOST:      SOUND_PRESETS.silence,
  RECOVERED: { ...SOUND_PRESETS.glimmer, frequency: 1100, gain: 0.03 },
};

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

export default function MemoryPage() {
  const params   = useParams();
  const id       = params.id as string;
  const { currentUser } = useAuth();
  
  const [fragment, setFragment] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isStabilized, setIsStabilized] = useState(false);

  // All hooks before early return (Rules of Hooks)
  const playNav  = useHoverSound(SOUND_PRESETS.click);
  const playCard = useHoverSound(
    fragment ? (STATUS_SOUND_MAP[fragment.status] ?? SOUND_PRESETS.glimmer) : SOUND_PRESETS.silence
  );

  useEffect(() => {
    const frag = getFragmentById(id, currentUser?.username);
    if (frag) {
      setFragment(frag);
    }
    setIsHydrated(true);
  }, [id, currentUser]);

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-[60vh] w-full">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-500/40 uppercase"
        >
          ► ESTABLISHING CONNECTION...
        </motion.div>
      </div>
    );
  }

  if (!fragment) {
    return (
      <motion.div
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center space-y-6 min-h-screen"
      >
        <span className="font-mono text-[0.6rem] tracking-[0.6em] text-zinc-500/70 uppercase">
          [ FRAGMENT NOT FOUND ]
        </span>
        <NavButton href="/maze" label="← Return to Archive" onClick={playNav} />
      </motion.div>
    );
  }

  const isCorrupted = fragment.status === "CORRUPTED" || fragment.status === "LOST";

  // Unique deterministic style parameters per ID
  const rng = getSeededRandom(id);
  const hueShift = Math.floor(rng() * 12) - 6; // subtle atmospheric variation
  const glowScale = 0.98 + rng() * 0.04;

  return (
    <motion.main
      initial={{ opacity: 0, filter: "blur(16px)", scale: 0.98 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(16px)", scale: 1.02 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
      className="relative w-full max-w-2xl mx-auto px-4 py-16 sm:py-20 flex flex-col gap-8 sm:gap-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${STATUS_GLOW[fragment.status]} 0%, transparent 80%)`,
          transform: `scale(${glowScale})`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="flex flex-col items-center space-y-4 mb-12 sm:mb-16"
      >
        <span className="font-mono text-[0.5rem] tracking-[0.8em] text-sky-500/30 uppercase ml-[0.8em]">
          MEMORY ARCHIVE
        </span>
        <h1 className="font-mono text-[1.1rem] sm:text-[1.3rem] tracking-[0.5em] text-sky-200/72 uppercase font-semibold ml-[0.5em] drop-shadow-[0_0_16px_rgba(56,189,248,0.18)]">
          DETAILED_VIEW
        </h1>
        <div className="w-px h-8 bg-gradient-to-b from-sky-500/25 to-transparent" />
      </motion.div>

      <Section delay={0.25} className="relative overflow-hidden group">
        <SectionLabel>Memory Visualization</SectionLabel>
        <MemoryVisual id={fragment.id} status={fragment.status} imageUrl={fragment.imageUrl} />
        
        {/* Data Scan Overlay */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent h-20 animate-scan-slow" />
        </div>
      </Section>

      <Section delay={0.45}>
        <div
          className={`relative border ${STATUS_BORDER[fragment.status]} ${STATUS_BG[fragment.status]} p-5 flex flex-col gap-4 overflow-hidden`}
        >
          {/* Corner accents */}
          {CORNERS.map((pos, i) => (
            <div key={i} className={`absolute w-3 h-3 ${pos} ${STATUS_STYLES[fragment.status]}`} />
          ))}

          {/* Corruption artifacts */}
          {isCorrupted && (
            <>
              <div className="absolute top-2 right-4 w-1 h-1 bg-red-500/30 rounded-full" />
              <div className="absolute bottom-3 left-5 w-0.5 h-0.5 bg-red-500/20 rounded-full" />
            </>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: "Fragment ID", value: fragment.id,    cls: "text-sky-100/90" },
              { label: "Status",      value: fragment.status, cls: STATUS_ACCENT[fragment.status] },
              { label: "Label",       value: fragment.label, cls: "text-sky-300/80" },
              { label: "Integrity",   value: isCorrupted ? "COMPROMISED" : fragment.status === "PARTIAL" ? "VOLATILE" : "VERIFIED", cls: STATUS_ACCENT[fragment.status] },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <span className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-500/35 uppercase">
                  {label}
                </span>
                <span className={`font-mono text-[0.6rem] tracking-[0.2em] uppercase font-medium ${cls}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={`w-full h-px bg-gradient-to-r from-transparent ${STATUS_DIVIDER[fragment.status]} to-transparent`} />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-500/35 uppercase">
                Timestamp
              </span>
              <motion.span
                className={`font-mono text-[0.6rem] tracking-[0.2em] uppercase ${STATUS_ACCENT[fragment.status]}`}
                animate={isCorrupted ? { opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {fragment.timestamp}
              </motion.span>
            </div>

            {/* Live indicator / Decode Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsStabilized(!isStabilized);
                  playNav();
                }}
                className={`group relative px-3 py-1.5 overflow-hidden transition-all duration-300 ${
                  isStabilized
                    ? "border border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
                    : "border border-sky-500/20 bg-sky-950/5 text-sky-400"
                }`}
              >
                <span className="relative z-10 font-mono text-[0.45rem] tracking-[0.25em] uppercase pointer-events-none">
                  {isStabilized ? "● STABILIZED" : "○ STABILIZE CONNECTION"}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <motion.div
                  className={`w-1 h-1 rounded-full ${
                    fragment.status === "RECOVERED" ? "bg-emerald-400" :
                    fragment.status === "PARTIAL"   ? "bg-sky-400" :
                    "bg-red-500"
                  }`}
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }}
                  transition={{ duration: isCorrupted ? 0.6 : 1.5, repeat: Infinity }}
                />
                <span className="font-mono text-[0.4rem] tracking-[0.3em] text-sky-500/30 uppercase">
                  {fragment.status === "RECOVERED" ? "VERIFIED" : isCorrupted ? "UNSTABLE" : "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section delay={0.6} className="">
        <SectionLabel>Recovered Narrative</SectionLabel>
        <div
          className={`relative border ${STATUS_BORDER[fragment.status]} ${STATUS_BG[fragment.status]} p-5 flex flex-col gap-4 overflow-hidden`}
        >
          {CORNERS.map((pos, i) => (
            <div key={i} className={`absolute w-3 h-3 ${pos} ${STATUS_STYLES[fragment.status]}`} />
          ))}

          {/* Narrative text */}
          <div className={`font-mono text-[0.58rem] sm:text-[0.62rem] tracking-[0.08em] leading-[1.9] ${
              isCorrupted ? "text-sky-300/45" : "text-sky-300/65"
            }`}>
            <FragmentedData 
              text={fragment.narrative} 
              status={fragment.status} 
              speed={100}
              isStabilized={isStabilized}
            />
          </div>

          {/* Divider */}
          <div className={`w-full h-px bg-gradient-to-r from-transparent ${STATUS_DIVIDER[fragment.status]} to-transparent`} />

          {/* Raw data stream (code) */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-500/30 uppercase">
              Raw Data Stream:
            </span>
            <div className="font-mono text-[0.55rem] tracking-[0.15em] text-sky-400/40 leading-relaxed">
              <FragmentedData 
                text={fragment.content} 
                status={fragment.status} 
                speed={60}
                isStabilized={isStabilized}
              />
            </div>
          </div>

          {/* Integrity warning */}
          {isCorrupted && !isStabilized && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="font-mono text-[0.45rem] tracking-[0.25em] text-red-400/50 uppercase flex items-center gap-2"
            >
              <span>⚠</span>
              <span>Data integrity compromised — decryption requested</span>
            </motion.div>
          )}
        </div>
      </Section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="mt-12 flex justify-center"
      >
        <NavButton href="/maze" label="← Back to Archive" onClick={playNav} />
      </motion.div>
    </motion.main>
  );
}

function Section({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`flex flex-col gap-2 py-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-1 h-3 bg-sky-500/20 rounded-full" />
      <span className="font-mono text-[0.45rem] tracking-[0.5em] text-sky-500/30 uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-sky-900/15 to-transparent" />
    </div>
  );
}

function NavButton({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        onClick={onClick}
        className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden"
      >
        <div className="absolute inset-0 border border-sky-900/25 group-hover:border-sky-600/40 bg-sky-950/6 transition-colors duration-700" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-sky-500/4 blur-xl pointer-events-none" />
        <span className="relative z-10 font-mono text-[0.55rem] tracking-[0.45em] text-sky-700/75 uppercase group-hover:text-sky-200 transition-colors duration-700">
          {label}
        </span>
        {CORNERS.map((pos, i) => (
          <div key={i} className={`absolute w-2 h-2 border-sky-800/25 group-hover:border-sky-400/45 transition-colors duration-700 ${pos}`} />
        ))}
      </Link>
    </motion.div>
  );
}
