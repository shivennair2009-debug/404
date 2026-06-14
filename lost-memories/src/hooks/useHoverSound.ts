"use client";

import { useRef, useCallback } from "react";

export function useHoverSound(options?: {
  frequency?: number;
  type?: OscillatorType;
  duration?: number;
  gain?: number;
}) {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const freq     = options?.frequency ?? 440;
      const type     = options?.type      ?? "sine";
      const duration = (options?.duration ?? 80) / 1000;
      const peak     = options?.gain      ?? 0.04;

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type      = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {
      // Audio is optional/fallback
    }
  }, [options]);

  return play;
}

export const SOUND_PRESETS = {
  glimmer: { frequency: 880, type: "sine" as OscillatorType,    duration: 60,  gain: 0.035 },
  corrupt: { frequency: 110, type: "sawtooth" as OscillatorType, duration: 100, gain: 0.03  },
  silence: { frequency: 0,   type: "sine" as OscillatorType,    duration: 0,   gain: 0      },
  click:   { frequency: 660, type: "square" as OscillatorType,  duration: 40,  gain: 0.025  },
};
