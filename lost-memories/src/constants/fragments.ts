export interface MemoryFragment {
  id: string;
  label: string;
  status: "CORRUPTED" | "PARTIAL" | "LOST" | "RECOVERED";
  glitch: boolean;
  timestamp: string;
  narrative: string;
  content: string;
  imageUrl?: string; // Optional client-uploaded image base64 data url
}

export const STATIC_MEMORY_FRAGMENTS: MemoryFragment[] = [
  { 
    id: "0xA1", 
    label: "FRAGMENT_01", 
    status: "CORRUPTED", 
    glitch: true,
    timestamp: "2047.03.14 // 04:17:22",
    narrative: "The last known stable memory before the cascade failure. Subject reported a recurring visual — a corridor that extended beyond the visible horizon, lit by a single overhead strip. No spatial anchor. No exit.",
    content: "// DATA CORRUPTED\n// Recovery: IMPOSSIBLE\n// Integrity: 12%\n// ADDR: 0x7FFF1A20\n// ERROR: 0xDEADBEEF\n▓▓▓▓▓▓▓▓▓▓"
  },
  { 
    id: "0xB2", 
    label: "FRAGMENT_02", 
    status: "PARTIAL", 
    glitch: false,
    timestamp: "2047.03.15 // 11:44:09",
    narrative: "Partial reconstruction in progress. Imagery suggests a coastal environment — salt air, grey light, a figure standing at the edge of something vast. Identity of figure unconfirmed. Emotional residue: longing.",
    content: "// Partial reconstruction in progress...\n// → Memory recovered: 67%\n// Timestamp: [REDACTED]"
  },
  { 
    id: "0xC3", 
    label: "FRAGMENT_03", 
    status: "LOST", 
    glitch: true,
    timestamp: "2047.03.16 // [NULL]",
    narrative: "Sector erased. No recoverable data. The memory existed once — that much is certain from the residual trace signature. What it contained is gone. Permanently.",
    content: "// FILE NOT FOUND\n// Sector scan: (--:--):\n// TRACE: [MEMORY LOST]"
  },
  { 
    id: "0xD4", 
    label: "FRAGMENT_04", 
    status: "RECOVERED", 
    glitch: false,
    timestamp: "2047.03.12 // 08:30:01",
    narrative: "Successfully recovered. The memory is intact — a childhood room, early morning, the sound of rain against glass. A sense of absolute safety, now unreachable. Checksum verified. Archive accessible.",
    content: "// Successfully recovered\n// Checksum: VERIFIED\n// Status: Accessible\n// Last modified: Now"
  },
  { 
    id: "0xE5", 
    label: "FRAGMENT_05", 
    status: "CORRUPTED", 
    glitch: true,
    timestamp: "2047.03.17 // 23:59:47",
    narrative: "Critical error during decryption. The memory contains structures consistent with a high-affect event — the kind the mind typically reinforces. Something went wrong. The data stream is degraded beyond recognition.",
    content: "// CRITICAL ERROR\n// Data stream: DEGRADED\n// Attempts to restore: ▓▓▓"
  },
  { 
    id: "0xF6", 
    label: "FRAGMENT_06", 
    status: "LOST", 
    glitch: false,
    timestamp: "2047.03.10 // [NULL]",
    narrative: "Empty sector. The archive shows this memory was accessed frequently before the event. Whatever it contained mattered enough to revisit. The trace signature is cold now. Archive: empty.",
    content: "// Sector cleared\n// No data signature found\n// Archive: EMPTY"
  },
  { 
    id: "0xG7", 
    label: "FRAGMENT_07", 
    status: "PARTIAL", 
    glitch: true,
    timestamp: "2047.03.18 // 16:02:55",
    narrative: "Coherence fluctuating. Reconstruction yields fragments of a conversation — two voices, one recognizable, one not. The signal strength is inconsistent. What can be heard: the word \"stay\", repeated at irregular intervals.",
    content: "// Partial recovery\n// Coherence: Fluctuating\n// Signal strength: [====--]\n// Status: Volatile"
  },
  { 
    id: "0xH8", 
    label: "FRAGMENT_08", 
    status: "LOST", 
    glitch: false,
    timestamp: "2047.03.08 // [NULL]",
    narrative: "Memory block unmapped. The page table has no entry for this sector. Somewhere in this void was a person, a place, a feeling significant enough to store. Access permanently denied.",
    content: "// Memory block: Unmapped\n// Page table: N/A\n// Access denied"
  },
  { 
    id: "0xI9", 
    label: "FRAGMENT_09", 
    status: "CORRUPTED", 
    glitch: true,
    timestamp: "2047.03.19 // 02:11:38",
    narrative: "Heap corruption detected during playback. The memory contained sequences inconsistent with known biographical data — foreign environments, unknown faces, impossible geometries. The system destabilized upon contact.",
    content: "// HEAP CORRUPTION\n// Stack overflow detected\n// System unstable: ▓▓▓▓"
  },
];

export const MEMORY_FRAGMENTS = STATIC_MEMORY_FRAGMENTS;

export function getFragments(username?: string): MemoryFragment[] {
  if (typeof window === "undefined") return STATIC_MEMORY_FRAGMENTS;
  try {
    // If logged in, fetch user's custom memories, otherwise fetch shared guest ones if any exist
    const key = username ? `lost_memories_dynamic_${username.toLowerCase()}` : "lost_memories_dynamic";
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as MemoryFragment[];
      return [...STATIC_MEMORY_FRAGMENTS, ...parsed];
    }
  } catch (e) {
    console.error("Failed to load dynamic memories:", e);
  }
  return STATIC_MEMORY_FRAGMENTS;
}

export function getFragmentById(id: string, username?: string): MemoryFragment | undefined {
  return getFragments(username).find(frag => frag.id === id);
}

export function saveDynamicFragment(fragment: MemoryFragment, username?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = username ? `lost_memories_dynamic_${username.toLowerCase()}` : "lost_memories_dynamic";
    const current = localStorage.getItem(key);
    const list: MemoryFragment[] = current ? JSON.parse(current) : [];
    list.push(fragment);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save dynamic memory:", e);
  }
}

export const STATUS_STYLES: Record<string, string> = {
  CORRUPTED: "text-red-400/60",
  PARTIAL:   "text-sky-400/60",
  LOST:      "text-zinc-600/60",
  RECOVERED: "text-emerald-400/60",
};
