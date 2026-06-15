"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useHoverSound, SOUND_PRESETS } from "@/hooks/useHoverSound";

import { MemoryFragment } from "@/constants/fragments";

interface MemoryNodeProps {
  id: string;
  label: string;
  status: MemoryFragment["status"];
  glitch?: boolean;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  delay: number;
}

// ── Style Maps ──────────────────────────────────────────────────────────────

const STATUS_TEXT_ACTIVE: Record<string, string> = {
  CORRUPTED: "text-red-400",
  PARTIAL:   "text-sky-400",
  LOST:      "text-zinc-400",
  RECOVERED: "text-emerald-400",
};

const STATUS_TEXT_IDLE: Record<string, string> = {
  CORRUPTED: "text-red-500/60",
  PARTIAL:   "text-sky-500/60",
  LOST:      "text-zinc-500/50",
  RECOVERED: "text-emerald-500/60",
};

const STATUS_BORDER_ACTIVE: Record<string, string> = {
  CORRUPTED: "border-red-500/50",
  PARTIAL:   "border-sky-500/50",
  LOST:      "border-zinc-500/40",
  RECOVERED: "border-emerald-500/50",
};

const STATUS_BORDER_IDLE: Record<string, string> = {
  CORRUPTED: "border-red-900/40",
  PARTIAL:   "border-sky-900/40",
  LOST:      "border-zinc-700/35",
  RECOVERED: "border-emerald-900/40",
};

const STATUS_BG_ACTIVE: Record<string, string> = {
  CORRUPTED: "bg-red-950/20",
  PARTIAL:   "bg-sky-950/20",
  LOST:      "bg-zinc-950/15",
  RECOVERED: "bg-emerald-950/20",
};

const STATUS_BG_IDLE: Record<string, string> = {
  CORRUPTED: "bg-red-950/10",
  PARTIAL:   "bg-sky-950/10",
  LOST:      "bg-zinc-950/8",
  RECOVERED: "bg-emerald-950/10",
};

const STATUS_CORNER_ACTIVE: Record<string, string> = {
  CORRUPTED: "border-red-400/80",
  PARTIAL:   "border-sky-400/80",
  LOST:      "border-zinc-500/60",
  RECOVERED: "border-emerald-400/80",
};

const STATUS_CORNER_IDLE: Record<string, string> = {
  CORRUPTED: "border-red-700/30",
  PARTIAL:   "border-sky-700/30",
  LOST:      "border-zinc-600/20",
  RECOVERED: "border-emerald-700/30",
};

const SCANLINE_COLOR: Record<string, string> = {
  CORRUPTED: "via-red-400/50",
  PARTIAL:   "via-sky-400/40",
  LOST:      "via-zinc-400/25",
  RECOVERED: "via-emerald-400/40",
};

const GLOW_COLOR: Record<string, string> = {
  CORRUPTED: "shadow-[0_0_24px_rgba(239,68,68,0.25)]",
  PARTIAL:   "shadow-[0_0_24px_rgba(56,189,248,0.20)]",
  LOST:      "shadow-[0_0_24px_rgba(100,116,139,0.12)]",
  RECOVERED: "shadow-[0_0_24px_rgba(52,211,153,0.20)]",
};

// Cluster halo color — subtle ambient behind the whole cluster
export const CLUSTER_HALO: Record<string, string> = {
  CORRUPTED: "from-red-950/20 to-transparent",
  PARTIAL:   "from-sky-950/15 to-transparent",
  LOST:      "from-zinc-950/10 to-transparent",
  RECOVERED: "from-emerald-950/15 to-transparent",
};

/** Sound preset per status */
const STATUS_SOUND: Record<string, typeof SOUND_PRESETS[keyof typeof SOUND_PRESETS]> = {
  CORRUPTED: SOUND_PRESETS.corrupt,
  PARTIAL:   SOUND_PRESETS.glimmer,
  LOST:      SOUND_PRESETS.silence,
  RECOVERED: { ...SOUND_PRESETS.glimmer, frequency: 1100, gain: 0.03 },
};

// ── Deterministic per-node drift ─────────────────────────────────────────

const getNodeDrift = (id: string): { x: [number, number]; y: [number, number]; duration: number } => {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = ((h1 << 5) - h1) + c;
    h2 = ((h2 << 7) - h2) + c * 2;
    h1 = h1 & h1;
    h2 = h2 & h2;
  }
  const driftX = (Math.abs(h1) % 6) - 3;
  const driftY = (Math.abs(h2) % 6) - 3;
  const duration = 7 + (Math.abs(h1) % 300) / 100;
  return { x: [0, driftX], y: [0, driftY], duration };
};

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

// ── Component ─────────────────────────────────────────────────────────────

export default function MemoryNode({
  id,
  label,
  status,
  glitch = false,
  isActive,
  onHoverStart,
  onHoverEnd,
  delay,
}: MemoryNodeProps) {
  const isCorrupted = status === "CORRUPTED" || status === "LOST";
  const drift = getNodeDrift(id);

  const playSound = useHoverSound(STATUS_SOUND[status] ?? SOUND_PRESETS.glimmer);

  const handleHoverStart = () => {
    onHoverStart();
    playSound();
  };

  return (
    <Link href={`/memory/${id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={handleHoverStart}
        onHoverEnd={onHoverEnd}
        className="relative cursor-pointer"
      >
        {/* ── Active glow ring ─────────────────────────────────────── */}
        {isActive && (
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: isCorrupted ? 1.6 : 2.5, repeat: Infinity }}
            className={`absolute inset-0 -z-10 rounded-sm pointer-events-none ${GLOW_COLOR[status]}`}
          />
        )}

        {/* ── Corrupted glitch overlay ──────────────────────────────── */}
        {isCorrupted && isActive && (
          <>
            <motion.div
              animate={{ opacity: [0, 0.25, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.8 }}
              className="absolute inset-0 bg-red-500/8 pointer-events-none z-10 rounded-sm"
            />
            <motion.div
              animate={{ x: [0, -2, 2, 0] }}
              transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 1.2 }}
              className="absolute inset-0 border border-red-500/20 pointer-events-none z-10"
            />
          </>
        )}

        {/* ── Drift wrapper ─────────────────────────────────────────── */}
        <motion.div
          animate={{
            x: [drift.x[0], drift.x[1], drift.x[0]],
            y: [drift.y[0], drift.y[1], drift.y[0]],
          }}
          transition={{ duration: drift.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ── Card shell ────────────────────────────────────────────── */}
          <div
            className={`relative border transition-all duration-500 p-5 sm:p-6 flex flex-col gap-4 overflow-hidden ${
              isActive
                ? `${STATUS_BORDER_ACTIVE[status]} ${STATUS_BG_ACTIVE[status]}`
                : `${STATUS_BORDER_IDLE[status]} ${STATUS_BG_IDLE[status]} group-hover:${STATUS_BORDER_ACTIVE[status]}`
            }`}
          >
            {/* Corner accents */}
            {CORNERS.map((pos, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 transition-colors duration-500 ${pos} ${
                  isActive ? STATUS_CORNER_ACTIVE[status] : STATUS_CORNER_IDLE[status]
                }`}
              />
            ))}

            {/* Corrupted pixel artifacts */}
            {isCorrupted && (
              <>
                <div className="absolute top-1 right-2 w-1 h-1 bg-red-500/30 rounded-full pointer-events-none" />
                <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-red-500/20 rounded-full pointer-events-none" />
                <div className="absolute top-3 left-1 w-0.5 h-3 bg-red-500/12 pointer-events-none" />
              </>
            )}

            {/* ── ID line ──────────────────────────────────────────── */}
            <span
              className={`font-mono text-[0.5rem] tracking-[0.3em] uppercase transition-colors duration-500 ${
                isActive ? STATUS_TEXT_ACTIVE[status] : STATUS_TEXT_IDLE[status]
              }`}
            >
              {id}
              {isCorrupted && isActive && (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.45, repeat: Infinity }}
                  className="ml-1 text-red-400/80"
                >
                  ▓
                </motion.span>
              )}
            </span>

            {/* ── Label ────────────────────────────────────────────── */}
            <span
              className={`font-mono text-[0.62rem] sm:text-[0.72rem] tracking-[0.2em] uppercase font-medium transition-all duration-500 ${
                isActive ? "text-white/90" : "text-sky-200/70 group-hover:text-sky-100/85"
              } ${glitch && isActive ? "animate-pulse" : ""}`}
            >
              {label}
              {isCorrupted && isActive && (
                <motion.span
                  animate={{ x: [0, 2, -2, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.5 }}
                  className="ml-1 inline-block text-red-400/70"
                >
                  ✕
                </motion.span>
              )}
            </span>

            {/* ── Status badge ─────────────────────────────────────── */}
            <span
              className={`font-mono text-[0.45rem] tracking-[0.3em] uppercase transition-colors duration-500 ${
                isActive ? STATUS_TEXT_ACTIVE[status] : STATUS_TEXT_IDLE[status]
              }`}
            >
              {status}
            </span>

            {/* ── Scanline (active) ────────────────────────────────── */}
            {isActive && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className={`absolute left-0 w-full h-px bg-gradient-to-r from-transparent ${SCANLINE_COLOR[status]} to-transparent pointer-events-none`}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
