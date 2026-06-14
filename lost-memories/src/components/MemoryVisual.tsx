"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MemoryVisualProps {
  id: string;
  status: string;
  imageUrl?: string;
}

function seed(id: string, salt = 0): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function CustomImageGlitched({ imageUrl, status }: { imageUrl: string; status: string }) {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [sliceStyle, setSliceStyle] = useState<React.CSSProperties>({});
  const [isGlitched, setIsGlitched] = useState(false);

  useEffect(() => {
    if (status !== "CORRUPTED") return;

    const interval = setInterval(() => {
      const active = Math.random() > 0.65;
      setIsGlitched(active);
      if (active) {
        setGlitchOffset({
          x: Math.floor(Math.random() * 10) - 5,
          y: Math.floor(Math.random() * 6) - 3,
        });
        
        const top = Math.random() * 75;
        const height = 8 + Math.random() * 15;
        setSliceStyle({
          clipPath: `inset(${top}% 0px ${100 - (top + height)}% 0px)`,
          transform: `translateX(${Math.floor(Math.random() * 24) - 12}px)`,
          filter: "hue-rotate(120deg) invert(1) contrast(2.5)",
        });
      } else {
        setGlitchOffset({ x: 0, y: 0 });
        setSliceStyle({});
      }
    }, 120);

    return () => clearInterval(interval);
  }, [status]);

  const filterStyle = {
    RECOVERED: "contrast(1.05) saturate(1.1) brightness(0.95)",
    PARTIAL:   "sepia(0.8) hue-rotate(185deg) saturate(1.6) contrast(1.1) blur(0.4px)",
    CORRUPTED: "contrast(2.2) saturate(1.8) brightness(0.8) hue-rotate(320deg)",
    LOST:      "grayscale(1) brightness(0.12) contrast(0.75) blur(5px)",
  }[status] || "";

  return (
    <div className="relative w-full h-full bg-[#020408] overflow-hidden flex items-center justify-center">
      <motion.img
        src={imageUrl}
        alt="Memory Signal"
        className="w-full h-full object-cover select-none pointer-events-none"
        style={{
          filter: filterStyle,
          transform: status === "CORRUPTED" && isGlitched
            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px) scale(1.04)`
            : "translate(0px, 0px) scale(1)",
        }}
      />

      {status === "CORRUPTED" && isGlitched && (
        <img
          src={imageUrl}
          alt="Memory Signal Slice"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={sliceStyle}
        />
      )}

      {status === "RECOVERED" && (
        <div className="absolute inset-0 bg-[#34d399]/[0.02] bg-[linear-gradient(to_bottom,rgba(52,211,153,0.05)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
      )}
      {status === "PARTIAL" && (
        <div className="absolute inset-0 bg-[#38bdf8]/[0.03] bg-[linear-gradient(to_bottom,rgba(56,189,248,0.06)_50%,transparent_50%)] bg-[size:100%_6px] pointer-events-none" />
      )}
      {status === "CORRUPTED" && (
        <div className="absolute inset-0 bg-[#ef4444]/[0.04] bg-[linear-gradient(to_bottom,rgba(239,68,68,0.08)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none animate-pulse" />
      )}
      {status === "LOST" && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      )}
    </div>
  );
}

function CorruptedVisual({ id, hasBg = true }: { id: string; hasBg?: boolean }) {
  const s = (n: number) => seed(id, n);
  const blocks = Array.from({ length: 12 }, (_, i) => ({
    x: (s(i * 3)     % 200),
    y: (s(i * 3 + 1) % 120),
    w: 4 + (s(i * 3 + 2) % 40),
    h: 2 + (s(i * 3 + 3) % 14),
    delay: (s(i) % 100) / 100,
  }));

  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`rg-c-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#3b0a0a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#020408" stopOpacity="1" />
        </radialGradient>
      </defs>

      {hasBg && <rect width="200" height="140" fill={`url(#rg-c-${id})`} />}

      {Array.from({ length: 8 }, (_, i) => (
        <motion.line
          key={`gl-${i}`}
          x1={i * 28} y1="0" x2={i * 28 + (s(i) % 10) - 5} y2="140"
          stroke="#ef4444" strokeWidth="0.3" strokeOpacity="0.15"
          animate={{ x1: [0, (s(i + 20) % 6) - 3, 0], strokeOpacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 1.2 + (s(i) % 100) / 100, repeat: Infinity, delay: (s(i) % 60) / 100 }}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.line
          key={`gl2-${i}`}
          x1="0" y1={i * 24} x2="200" y2={i * 24 + (s(i + 10) % 8) - 4}
          stroke="#ef4444" strokeWidth="0.3" strokeOpacity="0.1"
          animate={{ y1: [0, (s(i + 30) % 4) - 2, 0], strokeOpacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 1.5 + (s(i) % 100) / 100, repeat: Infinity, delay: (s(i) % 80) / 100 }}
        />
      ))}

      {blocks.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x} y={b.y} width={b.w} height={b.h}
          fill="#ef4444"
          fillOpacity={0.12 + (s(i + 50) % 20) / 100}
          animate={{
            x:           [b.x, b.x + (s(i + 5) % 8) - 4, b.x],
            fillOpacity: [0.05, 0.2, 0.05],
            scaleX:      [1, 1.3, 0.7, 1],
          }}
          transition={{ duration: 0.3 + b.delay * 0.8, repeat: Infinity, delay: b.delay * 1.2, ease: "linear" }}
        />
      ))}

      <motion.circle
        cx="100" cy="70" r="20"
        fill="none" stroke="#ef4444" strokeWidth="0.5"
        strokeDasharray="4 3"
        strokeOpacity="0.25"
        animate={{ r: [18, 24, 18], rotate: [0, 360], strokeOpacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 70px" }}
      />
      <motion.circle
        cx="100" cy="70" r="6"
        fill="#ef4444" fillOpacity="0.4"
        animate={{ r: [5, 9, 5], fillOpacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.rect
        x="0" width="200" height="1"
        fill="url(#scanRed)" fillOpacity="0.6"
        animate={{ y: [0, 140, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <linearGradient id="scanRed" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#ef4444" stopOpacity="0" />
          <stop offset="50%"  stopColor="#ef4444" stopOpacity="1" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PartialVisual({ id, hasBg = true }: { id: string; hasBg?: boolean }) {
  const s = (n: number) => seed(id, n);
  const rings = [30, 50, 70, 90];

  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`rg-p-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#071c2e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#020408" stopOpacity="1" />
        </radialGradient>
        <clipPath id={`clip-p-${id}`}>
          <rect x="0" y="0" width={110 + s(1) % 40} height="140" />
        </clipPath>
      </defs>

      {hasBg && <rect width="200" height="140" fill={`url(#rg-p-${id})`} />}

      {rings.map((r, i) => (
        <g key={i}>
          <circle cx="100" cy="70" r={r} fill="none" stroke="#38bdf8"
            strokeWidth="0.4" strokeOpacity="0.08" strokeDasharray={`${3 + i} ${2 + i}`} />
          <motion.circle
            cx="100" cy="70" r={r} fill="none" stroke="#38bdf8"
            strokeWidth={0.6 + i * 0.1}
            strokeOpacity={0.4 - i * 0.07}
            strokeDasharray={`${6 + i * 2} ${5 + i * 3}`}
            clipPath={`url(#clip-p-${id})`}
            animate={{ strokeDashoffset: [0, -(11 + i * 5)], strokeOpacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
          />
        </g>
      ))}

      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v-${i}`} x1={i * 22} y1="0" x2={i * 22} y2="140"
          stroke="#38bdf8" strokeWidth="0.3" strokeOpacity={Math.max(0, 0.12 - i * 0.012)} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h-${i}`} x1="0" y1={i * 23} x2="200" y2={i * 23}
          stroke="#38bdf8" strokeWidth="0.3" strokeOpacity="0.06" />
      ))}

      <motion.circle
        cx="100" cy="70" r="8"
        fill="#38bdf8" fillOpacity="0.18"
        animate={{ r: [7, 11, 7], fillOpacity: [0.12, 0.3, 0.12] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {hasBg && (
        <rect x="100" y="0" width="100" height="140" fill={`url(#rg-p-fade-${id})`} />
      )}
      <defs>
        <linearGradient id={`rg-p-fade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#020408" stopOpacity="0" />
          <stop offset="100%" stopColor="#020408" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <motion.rect x="0" width="200" height="1" fill="url(#scanBlue)" fillOpacity="0.5"
        animate={{ y: [0, 140, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <defs>
        <linearGradient id="scanBlue" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%"  stopColor="#38bdf8" stopOpacity="1" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LostVisual({ id, hasBg = true }: { id: string; hasBg?: boolean }) {
  const s = (n: number) => seed(id, n);
  const dots = Array.from({ length: 18 }, (_, i) => ({
    cx: (s(i * 2)     % 180) + 10,
    cy: (s(i * 2 + 1) % 120) + 10,
    r:  0.5 + (s(i + 100) % 20) / 10,
    op: 0.05 + (s(i + 200) % 15) / 100,
  }));

  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`rg-l-${id}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#0d0d0d" stopOpacity="1" />
          <stop offset="100%" stopColor="#020408" stopOpacity="1" />
        </radialGradient>
      </defs>

      {hasBg && <rect width="200" height="140" fill={`url(#rg-l-${id})`} />}

      {Array.from({ length: 10 }, (_, i) => (
        <motion.line key={`v-${i}`}
          x1={i * 22} y1="0" x2={i * 22} y2="140"
          stroke="#64748b" strokeWidth="0.3"
          animate={{ strokeOpacity: [0.04, 0.01, 0.04] }}
          transition={{ duration: 4 + (s(i) % 30) / 10, repeat: Infinity, delay: (s(i) % 100) / 100 }}
        />
      ))}

      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.cx} cy={d.cy} r={d.r}
          fill="#64748b"
          animate={{ fillOpacity: [d.op, d.op * 3, d.op], r: [d.r, d.r * 0.5, d.r] }}
          transition={{ duration: 3 + (s(i + 10) % 40) / 10, repeat: Infinity, delay: (s(i + 20) % 200) / 100 }}
        />
      ))}

      <motion.circle
        cx="100" cy="70" r="25"
        fill="#020408"
        animate={{ r: [23, 28, 23] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="100" cy="70" r="25"
        fill="none" stroke="#334155" strokeWidth="0.4" strokeDasharray="2 6"
        animate={{ strokeOpacity: [0.08, 0.2, 0.08], rotate: [0, -360] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 70px" }}
      />

      <text x="100" y="75" textAnchor="middle" fontFamily="monospace"
        fontSize="8" fill="#334155" fillOpacity="0.15" letterSpacing="4">
        NULL
      </text>
    </svg>
  );
}

function RecoveredVisual({ id, hasBg = true }: { id: string; hasBg?: boolean }) {
  const s = (n: number) => seed(id, n);
  const hexPoints = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");

  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>{`
        @keyframes hex-glow-${id} {
          0%, 100% { stroke-opacity: var(--base-op); }
          50% { stroke-opacity: calc(var(--base-op) * 2.6); }
        }
        .hex-cell-${id} {
          animation: hex-glow-${id} var(--dur) infinite ease-in-out;
          animation-delay: var(--delay);
          will-change: stroke-opacity;
        }
      `}</style>
      <defs>
        <radialGradient id={`rg-r-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#071a12" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#020408" stopOpacity="1" />
        </radialGradient>
      </defs>

      {hasBg && <rect width="200" height="140" fill={`url(#rg-r-${id})`} />}

      {Array.from({ length: 7 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => {
          const cx = col * 36 + (row % 2) * 18 + 5;
          const cy = row * 22 + 5;
          const op = 0.05 + (s(row * 10 + col) % 15) / 100;
          return (
            <polygon
              key={`h-${row}-${col}`}
              points={hexPoints(cx, cy, 14)}
              fill="none" stroke="#34d399"
              strokeWidth="0.4"
              className={`hex-cell-${id}`}
              style={{
                strokeOpacity: op,
                // @ts-ignore
                "--base-op": op,
                // @ts-ignore
                "--dur": `${3 + (s(row * 7 + col) % 30) / 10}s`,
                // @ts-ignore
                "--delay": `${(s(row + col * 3) % 200) / 100}s`,
              }}
            />
          );
        })
      )}

      <motion.circle
        cx="100" cy="70" r="22"
        fill="#34d399" fillOpacity="0.06"
        animate={{ r: [20, 24, 20], fillOpacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="100" cy="70" r="22"
        fill="none" stroke="#34d399" strokeWidth="0.6"
        animate={{ strokeOpacity: [0.3, 0.7, 0.3], rotate: [0, 60] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 70px" }}
      />
      <motion.polyline
        points="91,70 97,77 112,62"
        fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={{ strokeOpacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.rect x="0" width="200" height="1" fill="url(#scanGreen)" fillOpacity="0.4"
        animate={{ y: [0, 140, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
      <defs>
        <linearGradient id="scanGreen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#34d399" stopOpacity="0" />
          <stop offset="50%"  stopColor="#34d399" stopOpacity="1" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function MemoryVisual({ id, status, imageUrl }: MemoryVisualProps) {
  const BORDER: Record<string, string> = {
    CORRUPTED: "border-red-900/30",
    PARTIAL:   "border-sky-900/30",
    LOST:      "border-zinc-800/25",
    RECOVERED: "border-emerald-900/30",
  };

  const visual = {
    CORRUPTED: <CorruptedVisual id={id} hasBg={!imageUrl} />,
    PARTIAL:   <PartialVisual  id={id} hasBg={!imageUrl} />,
    LOST:      <LostVisual     id={id} hasBg={!imageUrl} />,
    RECOVERED: <RecoveredVisual id={id} hasBg={!imageUrl} />,
  }[status] ?? <LostVisual id={id} hasBg={!imageUrl} />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
      className={`relative w-full overflow-hidden border ${BORDER[status]}`}
      style={{ aspectRatio: "16/7" }}
    >
      {imageUrl && (
        <div className="absolute inset-0 w-full h-full z-0">
          <CustomImageGlitched imageUrl={imageUrl} status={status} />
        </div>
      )}

      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {visual}
      </div>

      <div className="absolute top-2 left-3 z-20 font-mono text-[0.42rem] tracking-[0.4em] text-sky-400/20 uppercase pointer-events-none">
        MEMORY.VIS // {id}
      </div>
      <div className="absolute bottom-2 right-3 z-20 font-mono text-[0.42rem] tracking-[0.35em] text-sky-400/15 uppercase pointer-events-none">
        {status}
      </div>
    </motion.div>
  );
}
