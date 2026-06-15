"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import MemoryNode, { CLUSTER_HALO } from "@/components/MemoryNode";
import { getFragments, saveDynamicFragment, MemoryFragment, STATIC_MEMORY_FRAGMENTS } from "@/constants/fragments";
import { useHoverSound, SOUND_PRESETS } from "@/hooks/useHoverSound";

// ── Cluster grouping ──────────────────────────────────────────────────────
const STATUS_ORDER = ["RECOVERED", "PARTIAL", "CORRUPTED", "LOST"];

const CLUSTER_LABEL: Record<string, string> = {
  RECOVERED: "STABLE",
  PARTIAL:   "VOLATILE",
  CORRUPTED: "CRITICAL",
  LOST:      "NULL",
};

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

// Helper to determine styling for state cards
const getStatusColorClasses = (name: string, active: boolean) => {
  if (name === "RECOVERED") {
    return active 
      ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
      : "border-zinc-800 bg-zinc-950/4 hover:border-zinc-700 text-zinc-500";
  }
  if (name === "PARTIAL") {
    return active 
      ? "border-sky-500 bg-sky-950/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
      : "border-zinc-800 bg-zinc-950/4 hover:border-zinc-700 text-zinc-500";
  }
  if (name === "CORRUPTED") {
    return active 
      ? "border-red-500 bg-red-950/20 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
      : "border-zinc-800 bg-zinc-950/4 hover:border-zinc-700 text-zinc-500";
  }
  return active 
    ? "border-zinc-400 bg-zinc-800/20 text-zinc-200 shadow-[0_0_12px_rgba(244,244,245,0.1)]"
    : "border-zinc-800 bg-zinc-950/4 hover:border-zinc-700 text-zinc-500";
};

// ── Component ────────────────────────────────────────────────────────────

export default function MazePage() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Dynamic memory state
  const [fragments, setFragments] = useState<MemoryFragment[]>(STATIC_MEMORY_FRAGMENTS);

  // Uplink Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [formStatus, setFormStatus] = useState<MemoryFragment["status"]>("RECOVERED");
  const [formNarrative, setFormNarrative] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  
  // Pipeline animation state
  const [uploadingStep, setUploadingStep] = useState(0); // 0: Idle, 1: Connecting, 2: Degrading, 3: Completed
  const [pipelineProgress, setPipelineProgress] = useState(0);

  const playClick = useHoverSound(SOUND_PRESETS.click);
  const playPulse = useHoverSound({ frequency: 880, duration: 40, gain: 0.02 });

  // Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });
  const bgX   = useTransform(smoothX, [-1, 1], [-15, 15]);
  const bgY   = useTransform(smoothY, [-1, 1], [-15, 15]);
  const gridX = useTransform(smoothX, [-1, 1],  [8, -8]);
  const gridY = useTransform(smoothY, [-1, 1],  [8, -8]);

  // Load custom and static fragments on mount
  useEffect(() => {
    setFragments(getFragments());
  }, []);

  // Sync Form Default Label when count changes
  useEffect(() => {
    setFormLabel(`FRAGMENT_${String(fragments.length + 1).padStart(2, "0")}`);
  }, [fragments.length, isUploadOpen]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  // HUD tick clock
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleReturn = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    playClick();
    setTimeout(() => router.push("/"), 300);
  };

  // Build cluster map: status → fragments[]
  const clusters = useMemo(() => {
    const map = new Map<string, MemoryFragment[]>();
    for (const status of STATUS_ORDER) {
      const group = fragments.filter(f => f.status === status);
      if (group.length) map.set(status, group);
    }
    return map;
  }, [fragments]);

  // Handle uploaded file base64 translation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit dynamic memory pipeline sequence
  const handleInjectPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNarrative.trim()) return;

    playClick();
    setUploadingStep(1);
    setPipelineProgress(15);

    // Dynamic animation sequence simulating digital upload
    setTimeout(() => {
      setUploadingStep(2);
      setPipelineProgress(55);
      playPulse();
    }, 1200);

    setTimeout(() => {
      setUploadingStep(3);
      setPipelineProgress(90);
      playPulse();
    }, 2400);

    setTimeout(() => {
      setPipelineProgress(100);
      
      // Construct dynamic fragment values
      const hexId = "0x" + Math.random().toString(16).substr(2, 2).toUpperCase() + String(fragments.length + 1);
      
      const contentMap = {
        RECOVERED: `// Successfully recovered client signal\n// Checksum: VERIFIED\n// Integrity: 100%\n// Channel: CH_UPLINK_${hexId}`,
        PARTIAL:   `// Client signal partially restored\n// Integrity: 62%\n// Recovery trace active\n// Data packets degraded`,
        CORRUPTED: `// CORE COMPRESSION FAILURE\n// Packet loss: 87%\n// System memory corrupted\n// ADDR: ${hexId}\n▓▓▓▓▓▓▓▓▓▓`,
        LOST:      `// FILE ERASED\n// Direct access failure\n// NULL value committed\n// TRACE: NO SIGNAL`
      };

      const now = new Date();
      const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} // ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const newFragment: MemoryFragment = {
        id: hexId,
        label: formLabel.trim().toUpperCase() || `FRAGMENT_${fragments.length + 1}`,
        status: formStatus,
        glitch: formStatus === "CORRUPTED" || formStatus === "LOST",
        timestamp: formStatus === "LOST" ? "[NULL]" : formattedDate,
        narrative: formNarrative.trim(),
        content: contentMap[formStatus],
        imageUrl: imageFile || undefined,
      };

      // Persist client fragment list
      saveDynamicFragment(newFragment);
      setFragments(getFragments());

      // Reset form variables
      setUploadingStep(0);
      setPipelineProgress(0);
      setFormNarrative("");
      setImageFile(null);
      setIsUploadOpen(false);
      playClick();
    }, 3200);
  };

  // Global delay counter so stagger is continuous across clusters
  let globalDelay = 0.6;

  return (
    <motion.main
      animate={isLeaving ? { x: [-4, 4, -2, 2, 0], y: [-2, 2, -3, 3, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "linear" }}
      onAnimationComplete={() => setIsLeaving(false)}
      className="relative flex flex-col items-center min-h-screen w-full overflow-x-hidden px-4 py-16 sm:py-24"
    >

      {/* ── Background Mesh ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none"
        style={{ x: bgX, y: bgY, willChange: "transform" }}
      >
        <motion.div
          animate={{ x: ["0%", "-20%", "10%", "0%"], y: ["0%", "20%", "-10%", "0%"], rotate: [0, -90, -180, -360], scale: [1, 1.2, 0.9, 1], borderRadius: ["50%", "70% 30% 30% 70% / 70% 70% 30% 30%", "40% 60% 70% 30% / 40% 30% 60% 70%", "50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,#082032,#02080d)] blur-[140px] bottom-[-30%] right-[-20%] opacity-70"
        />
        <motion.div
          animate={{ x: ["0%", "25%", "-15%", "0%"], y: ["0%", "-25%", "15%", "0%"], rotate: [360, 270, 90, 0], scale: [1, 0.85, 1.3, 1], borderRadius: ["40%", "30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "40%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[100vw] h-[100vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(circle_at_center,#0f304a,#030c14)] blur-[130px] top-[-40%] left-[-30%] opacity-60"
        />
      </motion.div>

      {/* ── HUD overlay ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ x: gridX, y: gridY, willChange: "transform" }}
      >
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf804_1px,transparent_1px),linear-gradient(to_bottom,#38bdf804_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />

        {/* Corner marks */}
        {CORNERS.map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 border-sky-500/20 ${cls}`} />
        ))}

        {/* Tick counter */}
        <motion.div
          animate={{ opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[0.5rem] tracking-[0.35em] text-sky-400/35 uppercase"
        >
          TICK_{String(tick).padStart(6, "0")} // MAZE.ACTIVE
        </motion.div>
        <motion.div
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.5rem] tracking-[0.35em] text-sky-400/25 uppercase"
        >
          FRAGMENT_COUNT: {fragments.length} // INTEGRITY: LOW
        </motion.div>
      </motion.div>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-4 mb-16 sm:mb-20 text-center"
      >
        {/* Top label */}
        <span className="font-mono text-[0.5rem] tracking-[0.9em] text-sky-500/40 uppercase ml-[0.9em]">
          MEMORY ARCHIVE
        </span>

        {/* Main title */}
        <h1 className="font-mono text-[1.1rem] sm:text-[1.3rem] tracking-[0.5em] text-sky-200/80 uppercase font-semibold ml-[0.5em] drop-shadow-[0_0_20px_rgba(56,189,248,0.25)]">
          SECTOR_NULL
        </h1>

        <div className="w-px h-6 bg-gradient-to-b from-sky-500/30 to-transparent animate-pulse" />

        <p className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-400/25 uppercase">
          SELECT A FRAGMENT TO RECOVER
        </p>

        {/* Uplink button to load custom fragments */}
        <motion.button
          onClick={() => {
            setIsUploadOpen(true);
            playClick();
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative z-30 pointer-events-auto px-6 py-2.5 overflow-hidden transition-all duration-700 bg-transparent border border-sky-800/40 hover:border-sky-500/60 bg-sky-950/5 mt-4 cursor-pointer"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-sky-500/5 blur-md pointer-events-none" />
          <span className="relative z-10 font-mono text-[0.5rem] tracking-[0.5em] text-sky-500/80 group-hover:text-sky-200 uppercase ml-[0.5em] font-light">
            ▲ UPLINK NEW FRAGMENT
          </span>
          {CORNERS.map((cls, i) => (
            <div key={i} className={`absolute w-1.5 h-1.5 border-sky-700/50 group-hover:border-sky-300 transition-colors duration-700 ${cls}`} />
          ))}
        </motion.button>
      </motion.div>

      {/* ── Clustered Fragment Grid ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-20 w-full max-w-5xl px-3 sm:px-6 flex flex-col gap-12 sm:gap-16"
      >
        {Array.from(clusters.entries()).map(([status, frags], clusterIdx) => {
          const clusterStartDelay = globalDelay;
          globalDelay += frags.length * 0.09 + 0.3;

          return (
            <motion.section
              key={status}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: clusterStartDelay - 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Cluster ambient halo */}
              <div
                className={`absolute inset-0 -z-10 rounded-lg bg-gradient-radial ${CLUSTER_HALO[status]} blur-3xl opacity-60 pointer-events-none`}
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, ${
                    status === "CORRUPTED" ? "rgba(239,68,68,0.06)" :
                    status === "PARTIAL"   ? "rgba(56,189,248,0.05)" :
                    status === "RECOVERED" ? "rgba(52,211,153,0.05)" :
                    "rgba(100,116,139,0.03)"
                  } 0%, transparent 75%)`,
                }}
              />

              {/* Cluster header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-1 h-4 rounded-full ${
                    status === "CORRUPTED" ? "bg-red-500/50" :
                    status === "PARTIAL"   ? "bg-sky-500/50" :
                    status === "RECOVERED" ? "bg-emerald-500/50" :
                    "bg-zinc-600/40"
                  }`}
                />
                <span
                  className={`font-mono text-[0.45rem] tracking-[0.5em] uppercase ${
                    status === "CORRUPTED" ? "text-red-500/50" :
                    status === "PARTIAL"   ? "text-sky-500/50" :
                    status === "RECOVERED" ? "text-emerald-500/50" :
                    "text-zinc-600/40"
                  }`}
                >
                  {CLUSTER_LABEL[status]} // {frags.length} FRAGMENT{frags.length !== 1 ? "S" : ""}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-sky-900/20 to-transparent" />
              </div>

              {/* Fragment nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {frags.map((frag, i) => {
                  const nodeDelay = clusterStartDelay + i * 0.09;
                  return (
                    <MemoryNode
                      key={frag.id}
                      id={frag.id}
                      label={frag.label}
                      status={frag.status}
                      glitch={frag.glitch}
                      isActive={activeNode === frag.id}
                      onHoverStart={() => setActiveNode(frag.id)}
                      onHoverEnd={() => setActiveNode(null)}
                      delay={nodeDelay}
                    />
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      {/* ── Return Button ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="relative z-10 mt-16 sm:mt-24"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95, filter: "brightness(2)" }}>
          <Link
            href="/"
            onClick={handleReturn}
            className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden bg-transparent"
          >
            <div className="absolute inset-0 border border-sky-900/25 group-hover:border-sky-600/45 bg-sky-950/8 transition-colors duration-700" />

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-sky-500/4 blur-xl pointer-events-none" />

            <span className="relative z-10 font-mono text-[0.55rem] tracking-[0.45em] text-sky-700/80 uppercase group-hover:text-sky-200 transition-colors duration-700">
              ← Return to Void
            </span>

            {/* Corner accents */}
            {CORNERS.map((cls, i) => (
              <div key={i} className={`absolute w-2 h-2 border-sky-800/30 group-hover:border-sky-400/50 transition-colors duration-700 ${cls}`} />
            ))}
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Cinematic Slide-in Signal Uplink Modal ────────────────────── */}
      <AnimatePresence>
        {isUploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 24, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg border border-sky-900/30 bg-[#02050a]/95 p-6 sm:p-8 flex flex-col gap-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Corner accents */}
              {CORNERS.map((cls, i) => (
                <div key={i} className={`absolute w-3 h-3 border-sky-500/20 ${cls}`} />
              ))}

              {/* Glowing decorative reticle on background */}
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 border border-sky-500/5 rounded-full pointer-events-none" />

              {/* Title & Status */}
              <div className="flex flex-col gap-2 border-b border-sky-900/20 pb-4">
                <span className="font-mono text-[0.42rem] tracking-[0.4em] text-sky-500/40 uppercase">
                  UPLINK INTERACTION UNIT
                </span>
                <h2 className="font-mono text-[0.85rem] tracking-[0.3em] text-sky-200 uppercase font-semibold">
                  DECRYPTION_INJECTION
                </h2>
              </div>

              {uploadingStep === 0 ? (
                <form onSubmit={handleInjectPipeline} className="flex flex-col gap-5">
                  {/* Label Row */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                      Signal label
                    </label>
                    <input
                      type="text"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-950/60 border border-sky-900/30 text-sky-100 font-mono text-[0.6rem] px-3 py-2 tracking-[0.25em] focus:outline-none focus:border-sky-500/50 transition-colors"
                      placeholder="e.g. FRAGMENT_10"
                      maxLength={18}
                    />
                  </div>

                  {/* Stability Level selector (4 styled buttons) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                      Stability calibration // status
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { name: "RECOVERED", label: "STABLE", desc: "No distortion" },
                        { name: "PARTIAL", label: "VOLATILE", desc: "Coherence drift" },
                        { name: "CORRUPTED", label: "CRITICAL", desc: "Heavy glitch" },
                        { name: "LOST", label: "NULL", desc: "Cold trace void" },
                      ].map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => {
                            setFormStatus(opt.name as any);
                            playClick();
                          }}
                          className={`p-2.5 border flex flex-col gap-1 text-left transition-all duration-300 cursor-pointer ${getStatusColorClasses(opt.name, formStatus === opt.name)}`}
                        >
                          <span className="font-mono text-[0.45rem] tracking-[0.18em] font-medium leading-none mb-1">{opt.label}</span>
                          <span className="font-mono text-[0.34rem] tracking-[0.05em] opacity-45 leading-tight">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description / Narrative text area */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                      Memory signal transcription (narrative)
                    </label>
                    <textarea
                      value={formNarrative}
                      onChange={(e) => setFormNarrative(e.target.value)}
                      className="w-full h-24 bg-zinc-950/60 border border-sky-900/30 text-sky-100 font-mono text-[0.58rem] p-3 tracking-[0.08em] leading-relaxed focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
                      placeholder="Transcribe the raw moment detail. What was felt, remembered, or erased?"
                      maxLength={400}
                      required
                    />
                    <div className="flex justify-end">
                      <span className="font-mono text-[0.38rem] text-sky-500/30">
                        {formNarrative.length} / 400 CHARS
                      </span>
                    </div>
                  </div>

                  {/* Image Signal Attachment */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[0.42rem] tracking-[0.3em] text-sky-500/40 uppercase">
                      Image attachment signal
                    </label>
                    {!imageFile ? (
                      <label className="border border-dashed border-sky-900/25 hover:border-sky-500/45 bg-sky-950/[0.02] p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="font-mono text-[0.45rem] tracking-[0.25em] text-sky-500/60 uppercase">
                          ▲ UPLINK IMAGE FILE
                        </span>
                        <span className="font-mono text-[0.34rem] tracking-[0.08em] text-zinc-600 uppercase">
                          PNG, JPG, WEBP (stored in local system)
                        </span>
                      </label>
                    ) : (
                      <div className="relative border border-sky-900/30 p-2.5 flex items-center justify-between bg-zinc-950/60">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageFile}
                            alt="Uplink preview"
                            className="w-12 h-8 object-cover border border-sky-800/20"
                          />
                          <span className="font-mono text-[0.45rem] tracking-[0.15em] text-emerald-400">
                            IMAGE_SIGNAL_CONNECTED.RAW
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            playClick();
                          }}
                          className="font-mono text-[0.42rem] tracking-[0.1em] text-red-500/70 hover:text-red-400 uppercase cursor-pointer"
                        >
                          [ DISCONNECT ]
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 border-t border-sky-900/10 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadOpen(false);
                        playClick();
                      }}
                      className="font-mono text-[0.52rem] tracking-[0.3em] text-zinc-500 hover:text-zinc-300 uppercase cursor-pointer px-4 py-2"
                    >
                      [ CANCEL ]
                    </button>
                    <button
                      type="submit"
                      className="group relative px-6 py-2.5 overflow-hidden border border-sky-500/30 bg-sky-950/15 hover:bg-sky-900/30 transition-colors duration-500 cursor-pointer"
                    >
                      <span className="relative z-10 font-mono text-[0.52rem] tracking-[0.3em] text-sky-300 uppercase">
                        [ INJECT PIPELINE ]
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Dynamic injection/decryption progress bar screen */
                <div className="flex flex-col items-center justify-center py-12 gap-8 text-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-sky-500/20 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full ${
                        formStatus === "RECOVERED" ? "bg-emerald-400" :
                        formStatus === "PARTIAL"   ? "bg-sky-400" :
                        formStatus === "CORRUPTED" ? "bg-red-400" :
                        "bg-zinc-500"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[0.45rem] tracking-[0.4em] text-sky-500/40 uppercase">
                      PIPELINE COMMITTING
                    </span>
                    <motion.span 
                      key={uploadingStep}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      className="font-mono text-[0.62rem] tracking-[0.2em] text-sky-200 uppercase font-light"
                    >
                      {uploadingStep === 1 && "► ESTABLISHING ARCHIVE CONTEXT..."}
                      {uploadingStep === 2 && "► DISTORTING SIGNAL WAVELENGTHS..."}
                      {uploadingStep === 3 && "► DECRYPTING DATA PACKET MATRIX..."}
                    </motion.span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full max-w-xs h-1 border border-sky-900/35 relative overflow-hidden bg-zinc-950">
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                      style={{ width: `${pipelineProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>

                  <span className="font-mono text-[0.45rem] tracking-[0.25em] text-sky-500/30">
                    PACKET_LOAD: {pipelineProgress}% // SYS.OK
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
