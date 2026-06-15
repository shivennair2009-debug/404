"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function Vignette() {
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Subtle interactive slate global spotlight following mouse
  const spotlightGradient = useMotionTemplate`radial-gradient(120vw circle at ${smoothX}% ${smoothY}%, rgba(16, 38, 64, 0.05) 0%, rgba(2, 6, 12, 0.45) 50%, rgba(0, 0, 0, 0.85) 100%)`;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[40]"
        style={{
          background: spotlightGradient,
        }}
      />
      {/* Slow-moving high-end atmospheric ambient light drift (Global Light) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[39] opacity-50 mix-blend-screen"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(14,165,233,0.04) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)",
            "radial-gradient(circle at 80% 70%, rgba(14,165,233,0.02) 0%, rgba(99,102,241,0.05) 50%, transparent 75%)",
            "radial-gradient(circle at 30% 80%, rgba(14,165,233,0.05) 0%, rgba(99,102,241,0.01) 30%, transparent 65%)",
            "radial-gradient(circle at 20% 30%, rgba(14,165,233,0.04) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)"
          ]
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
