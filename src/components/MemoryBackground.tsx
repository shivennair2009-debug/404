"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MemoryBackground() {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate deterministic particles to avoid hydration mismatch
    const pts = Array.from({ length: 15 }, (_, i) => {
      // Deterministic values seeded by index
      const x = (i * 7.3) % 100;
      const y = (i * 13.7) % 100;
      const size = 1 + (i % 3);
      const delay = (i * 0.4) % 4;
      const duration = 15 + (i * 3) % 15;
      return { x, y, size, delay, duration };
    });
    setParticles(pts);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-black select-none">
      {/* Wave glow mesh */}
      <motion.div
        animate={{
          scale: [1, 1.12, 0.95, 1],
          opacity: [0.35, 0.5, 0.3, 0.35],
          x: ["0%", "4%", "-3%", "0%"],
          y: ["0%", "-4%", "3%", "0%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 40% 30%, rgba(14, 54, 88, 0.18) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(8, 25, 48, 0.25) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Floating dust particles */}
      {particles.map((pt, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-sky-400/20"
          style={{
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            width: pt.size,
            height: pt.size,
          }}
          animate={{
            y: ["0px", "-120px", "0px"],
            x: ["0px", "40px", "0px"],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{
            duration: pt.duration,
            repeat: Infinity,
            delay: pt.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf802_1px,transparent_1px),linear-gradient(to_bottom,#38bdf802_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-40" />
    </div>
  );
}
