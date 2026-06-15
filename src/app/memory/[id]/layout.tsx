import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Fragment // LOST MEMORIES",
  description: "Recovering a memory fragment from the archive.",
};

/**
 * Layout for all /memory/[id] routes.
 *
 * Responsibilities:
 * - Override the root layout's overflow-hidden so the detail card can breathe
 *   on small screens without clipping.
 * - Isolate this route's stacking context so page-level glow effects don't
 *   bleed into other routes during AnimatePresence transitions.
 */
export default function MemoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
