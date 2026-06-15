"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface FragmentedDataProps {
  text: string;
  status: "CORRUPTED" | "PARTIAL" | "LOST" | "RECOVERED";
  className?: string;
  speed?: number;
  isStabilized?: boolean;
}

const CORRUPT_CHARS = "█▓▒░$#@&*<>[]{}/\\|";

export default function FragmentedData({
  text,
  status,
  className = "",
  speed = 40,
  isStabilized = false,
}: FragmentedDataProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [lockIndex, setLockIndex] = useState(-1);
  const lockIndexRef = useRef(-1);

  const corruptionLevel = {
    CORRUPTED: 0.22, // Reduced default corruption level to balance readability
    LOST: 0.48,      // Balanced so it is recognizable but still distorted
    PARTIAL: 0.08,
    RECOVERED: 0.01,
  }[status] || 0;

  // Handle progressive decryption/decoding when isStabilized becomes true
  useEffect(() => {
    if (isStabilized) {
      lockIndexRef.current = 0;
      setLockIndex(0);

      const interval = setInterval(() => {
        if (lockIndexRef.current < text.length) {
          // Increment lockIndex
          const increment = Math.max(1, Math.floor(text.length / 25)); // Decodes in ~25 frames
          lockIndexRef.current = Math.min(text.length, lockIndexRef.current + increment);
          setLockIndex(lockIndexRef.current);
        } else {
          clearInterval(interval);
        }
      }, 40);

      return () => clearInterval(interval);
    } else {
      lockIndexRef.current = -1;
      setLockIndex(-1);
      setDisplayText(text);
    }
  }, [isStabilized, text]);

  // Main glitch effect
  useEffect(() => {
    if (isStabilized && lockIndex >= text.length) {
      setDisplayText(text);
      return;
    }

    if (status === "RECOVERED" && !isHovered && !isStabilized) {
      setDisplayText(text);
      return;
    }

    const interval = setInterval(() => {
      const chars = text.split("");
      const glitched = chars.map((char, index) => {
        // If this index is locked (stabilized), keep the original character
        if (isStabilized && index < lockIndex) {
          return char;
        }

        if (char === " " || char === "\n") return char;

        const threshold = isHovered ? corruptionLevel + 0.12 : corruptionLevel;
        if (Math.random() < threshold) {
          // If LOST, favor spaces/erasure
          if (status === "LOST" && Math.random() > 0.5) return " ";
          return CORRUPT_CHARS[Math.floor(Math.random() * CORRUPT_CHARS.length)];
        }
        return char;
      });
      setDisplayText(glitched.join(""));
    }, speed + Math.random() * 50);

    return () => clearInterval(interval);
  }, [text, status, speed, isHovered, corruptionLevel, isStabilized, lockIndex]);

  return (
    <motion.div
      className={`relative group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative z-10 font-mono leading-[2.2] break-words whitespace-pre-wrap select-text">
        {displayText}
      </div>

      {/* Background "Ghost" Layer for depth */}
      {!isStabilized && (
        <div className="absolute inset-0 z-0 opacity-[0.04] blur-[1px] select-none pointer-events-none font-mono">
          {text.split("").map((c, i) => (
            <span key={i} className={i % 23 === 0 ? "text-red-500/20" : ""}>
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Scanning line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: isStabilized ? 0 : 1 }}
      >
        <motion.div
          className="w-full h-[2px] bg-sky-400/20 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          animate={{
            top: ["0%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ position: "absolute" }}
        />
      </motion.div>
    </motion.div>
  );
}
