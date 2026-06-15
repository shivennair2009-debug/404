"use client";

import { useRef, useCallback } from "react";

/**
 * useHoverSound — synthesizes a subtle sci-fi tone on hover using Web Audio API.
 * No audio files required. Works as a placeholder that can later be swapped for
 * real sound files via HTMLAudioElement.
 *
 * @param options.frequency  Base frequency in Hz  (default: 440)
 * @param options.type       OscillatorType         (default: "sine")
 * @param options.duration   Tone duration in ms    (default: 80)
 * @param options.gain       Peak gain 0–1          (default: 0.04)
 */
export function useHoverSound(options?: {
  frequency?: number;
  type?: OscillatorType;
  duration?: number;
  gain?: number;
}) {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      // Lazily create AudioContext on first interaction (browser policy)
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      
      // Ensure context is active (browsers may suspend until user interaction)
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

      // Soft attack → immediate decay envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {
      // Silently fail — audio is optional
    }
  }, [options]);

  return play;
}

/**
 * Preset sounds for the maze UI.
 */
export const SOUND_PRESETS = {
  /** Soft glimmer on PARTIAL/RECOVERED hover */
  glimmer: { frequency: 880, type: "sine" as OscillatorType,    duration: 60,  gain: 0.035 },
  /** Low rumble on CORRUPTED hover */
  corrupt: { frequency: 110, type: "sawtooth" as OscillatorType, duration: 100, gain: 0.03  },
  /** Silent (LOST nodes make no sound) */
  silence: { frequency: 0,   type: "sine" as OscillatorType,    duration: 0,   gain: 0      },
  /** Click confirmation */
  click:   { frequency: 660, type: "square" as OscillatorType,  duration: 40,  gain: 0.025  },
};
