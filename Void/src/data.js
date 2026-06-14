export const LEVELS = [
  { min: 0,    max: 99,       name: 'Rookie',      emoji: '🌱' },
  { min: 100,  max: 249,      name: 'Focused',     emoji: '👁️' },
  { min: 250,  max: 499,      name: 'Disciplined', emoji: '🧠' },
  { min: 500,  max: 999,      name: 'Mindful',     emoji: '🌊' },
  { min: 1000, max: Infinity, name: 'Zen Master',  emoji: '⚡' },
];

export const getLevel    = (xp) => LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
export const getLevelIdx = (xp) => LEVELS.findIndex(l => xp >= l.min && xp <= l.max);
export const getNextLevel= (xp) => { const i = getLevelIdx(xp); return LEVELS[i + 1] || null; };
export const getLevelPct = (xp) => {
  const i = getLevelIdx(xp);
  const cur = LEVELS[i], next = LEVELS[i + 1];
  return next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100;
};

export const ACHIEVEMENTS = [
  { id: 'first',     name: 'First Step',      desc: 'Complete your first pause',        icon: '🎯', xp: 50,  check: s => s.totalPauses >= 1 },
  { id: 'five',      name: 'Getting Real',    desc: '5 total pauses completed',          icon: '🔥', xp: 100, check: s => s.totalPauses >= 5 },
  { id: 'twenty',    name: 'Focus Champion',  desc: '25 total pauses completed',         icon: '🏆', xp: 200, check: s => s.totalPauses >= 25 },
  { id: 'streak3',   name: '3-Day Streak',    desc: '3 consecutive days of pausing',     icon: '⚡', xp: 150, check: s => s.streak >= 3 },
  { id: 'streak7',   name: 'Week Warrior',    desc: '7-day streak achieved',             icon: '💎', xp: 500, check: s => s.streak >= 7 },
  { id: 'breathe5',  name: 'Breathwork',      desc: 'Complete 5 breathing exercises',    icon: '🌬️', xp: 75,  check: s => s.breathCount >= 5 },
  { id: 'reflect5',  name: 'Self-Aware',      desc: 'Complete 5 reflection exercises',   icon: '💭', xp: 75,  check: s => s.reflectCount >= 5 },
  { id: 'game5',     name: 'Sharpshooter',    desc: 'Complete 5 focus games',            icon: '🎮', xp: 75,  check: s => s.gameCount >= 5 },
];

const KEY = 'void_v2';
const todayStr = () => new Date().toISOString().slice(0, 10);

export const DEFAULT = {
  xp: 0, totalPauses: 0, streak: 0,
  lastPauseDate: null, unlockedAchs: [],
  breathCount: 0, reflectCount: 0, gameCount: 0,
  // daily (reset each day)
  pausesToday: 0, pausesDate: null,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const s = { ...DEFAULT, ...JSON.parse(raw) };
    // reset daily pauses if new day
    if (s.pausesDate !== todayStr()) { s.pausesToday = 0; s.pausesDate = todayStr(); }
    // check streak: if lastPauseDate is older than yesterday → reset
    if (s.lastPauseDate) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      if (s.lastPauseDate < yStr) s.streak = 0;
    }
    return s;
  } catch { return { ...DEFAULT }; }
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const XP = { pause: 10, breathe: 25, reflect: 20, game: 15 };

export const DAILY_GOAL = 5;
