import { useState, useEffect, useCallback } from 'react';
import { Video, Camera, ArrowLeft, BarChart2, Trophy, Zap, Flame, Clock, Target, CheckCircle, Lock, X } from 'lucide-react';
import { LEVELS, ACHIEVEMENTS, DAILY_GOAL, XP, loadState, saveState, getLevel, getLevelIdx, getNextLevel, getLevelPct } from './data';
import './App.css';

function useStore() {
  const [s, setS] = useState(() => loadState());
  const update = useCallback((fn) => {
    setS(prev => { const next = fn(prev); saveState(next); return next; });
  }, []);
  return [s, update];
}

function applyXP(state, amount) {
  const prevIdx = getLevelIdx(state.xp);
  const xp = state.xp + amount;
  const newIdx = getLevelIdx(xp);
  const leveledUp = newIdx > prevIdx;
  return { ...state, xp, _leveledUp: leveledUp };
}

function checkAchievements(state) {
  const newAchs = [];
  let xpBonus = 0;
  let nextState = { ...state };
  for (const a of ACHIEVEMENTS) {
    if (!state.unlockedAchs.includes(a.id) && a.check(state)) {
      newAchs.push(a);
      xpBonus += a.xp;
    }
  }
  if (newAchs.length) {
    nextState = { ...nextState, unlockedAchs: [...state.unlockedAchs, ...newAchs.map(a => a.id)] };
    nextState = applyXP(nextState, xpBonus);
  }
  return { nextState, newAchs };
}

function XPToast({ amount, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, [onDone]);
  return <div className="xp-toast"><Zap size={13} />+{amount} XP</div>;
}

function AchToast({ ach, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="ach-toast slide-up">
      <span className="ach-toast-icon">{ach.icon}</span>
      <div><div className="ach-toast-name">{ach.name}</div><div className="ach-toast-desc">{ach.desc}</div></div>
      <span className="ach-toast-xp"><Zap size={11} />+{ach.xp}</span>
    </div>
  );
}

function LevelModal({ level, onClose }) {
  return (
    <div className="level-overlay" onClick={onClose}>
      <div className="level-card pop-in" onClick={e => e.stopPropagation()}>
        <div className="level-emoji">{level.emoji}</div>
        <div className="level-up-title">Level Up!</div>
        <div className="level-name-text">{level.name}</div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>You're getting sharper every day.</p>
        <button className="btn-primary" style={{ marginTop: 28, width: '100%' }} onClick={onClose}>Keep Going 🔥</button>
      </div>
    </div>
  );
}

function Header({ xp, onStats, onAchs }) {
  const level = getLevel(xp);
  const idx = getLevelIdx(xp) + 1;
  return (
    <div className="header">
      <div className="logo"><span className="logo-text">VOID</span><span className="logo-sub">digital detox</span></div>
      <div className="header-right">
        <button className="icon-btn" onClick={onAchs} title="Achievements"><Trophy size={18} /></button>
        <button className="icon-btn" onClick={onStats} title="Stats"><BarChart2 size={18} /></button>
        <div className="level-chip"><span>{level.emoji}</span><span>Lv {idx}</span></div>
      </div>
    </div>
  );
}

function XPBar({ xp }) {
  const level = getLevel(xp);
  const next = getNextLevel(xp);
  const pct = getLevelPct(xp);
  return (
    <div className="xp-bar-wrap">
      <div className="xp-bar-meta">
        <span className="xp-level-name">{level.emoji} {level.name}</span>
        <span className="xp-count"><Zap size={11} />{xp} XP{next ? ` / ${next.min}` : ' (MAX)'}</span>
      </div>
      <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function HeroCard({ pausesToday }) {
  const pct = Math.min(pausesToday / DAILY_GOAL, 1);
  const r = 34, circ = 2 * Math.PI * r;
  const done = pausesToday >= DAILY_GOAL;
  return (
    <div className="glass hero-card">
      <div className="ring-wrap">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - pct * circ}
            transform="rotate(-90 44 44)" style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ring-inner"><span className="ring-count">{pausesToday}</span><span className="ring-label">/ {DAILY_GOAL}</span></div>
      </div>
      <div className="hero-text">
        <div className="hero-title">{done ? "Daily goal done! 🎉" : "Daily Pauses"}</div>
        <div className="hero-sub">{done ? "You've hit your target. Every pause is a win." : `${DAILY_GOAL - pausesToday} more pauses to reach your goal today.`}</div>
        {done && <div className="goal-done"><CheckCircle size={13} />+50 XP bonus earned</div>}
      </div>
    </div>
  );
}

function StatsRow({ streak, totalPauses, xp }) {
  return (
    <div className="stats-row">
      <div className="stat-chip"><div className="stat-icon-wrap"><Flame size={15} className="ic-streak" /></div><span className="stat-val">{streak}</span><span className="stat-name">Streak</span></div>
      <div className="stat-chip"><div className="stat-icon-wrap"><Target size={15} className="ic-pauses" /></div><span className="stat-val">{totalPauses}</span><span className="stat-name">Pauses</span></div>
      <div className="stat-chip"><div className="stat-icon-wrap"><Clock size={15} className="ic-time" /></div><span className="stat-val">{totalPauses * 2}</span><span className="stat-name">Mins Saved</span></div>
    </div>
  );
}

function FocusToggle({ active, onToggle }) {
  return (
    <div className={`glass focus-toggle ${active ? 'on' : ''}`} onClick={onToggle}>
      <div className="ft-left">
        <Lock size={17} className="ft-icon" />
        <div><div className="ft-label">Focus Mode</div><div className="ft-sub">{active ? 'ON — pausing before every app' : 'OFF — direct access enabled'}</div></div>
      </div>
      <div className={`toggle-pill ${active ? 'on' : ''}`}><div className="toggle-thumb" /></div>
    </div>
  );
}

const APPS = [
  { id: 'youtube', name: 'YouTube', Icon: Video, color: '#ff0000' },
  { id: 'instagram', name: 'Instagram', Icon: Camera, color: '#e1306c' },
];
function AppGrid({ onApp, focusMode }) {
  return (
    <div>
      <div className="section-label"><Lock size={11} />{focusMode ? 'Guarded Apps' : 'Apps'}</div>
      <div className="app-grid">
        {APPS.map(({ id, name, Icon, color }) => (
          <button key={id} className={`glass app-tile ${focusMode ? 'guarded' : ''}`} onClick={() => onApp(id)}>
            {focusMode && <div className="guard-badge"><Lock size={10} /></div>}
            <Icon size={28} color={focusMode ? 'var(--muted)' : color} />
            <span className="app-tile-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Intervention({ onSkip, onContinue }) {
  const [t, setT] = useState(30);
  useEffect(() => {
    if (t <= 0) { onContinue(); return; }
    const id = setInterval(() => setT(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [t, onContinue]);
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <div className="fullscreen fade-up">
      <div className="xp-pill"><Zap size={12} />Earn +{XP.pause} XP for pausing</div>
      <div className="screen-title">Take a breath.</div>
      <p className="screen-sub">A 5-second pause before you scroll.<br />Your future self will thank you.</p>
      <div className="timer-ring-wrap">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="70" cy="70" r={r} fill="none" stroke="url(#tg)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (t / 30) * circ}
            transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
        </svg>
        <div className="timer-number">{t}</div>
      </div>
      <div className="screen-actions">
        <button className="btn-ghost" onClick={onSkip}><X size={15} />Skip</button>
        <button className="btn-primary" onClick={onContinue} disabled={t > 25}>{t > 25 ? 'Wait…' : 'Continue →'}</button>
      </div>
    </div>
  );
}

function MicroBreathe({ onDone }) {
  const phases = [['in','Breathe In',4,'#7c3aed'],['hold','Hold',4,'#f59e0b'],['out','Breathe Out',6,'#10b981']];
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(phases[0][2]);
  const phase = phases[idx];

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          if (idx < phases.length - 1) { setIdx(i => i + 1); return phases[idx + 1][2]; }
          else { clearInterval(id); setTimeout(onDone, 600); return 0; }
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [idx]);

  return (
    <div className="fullscreen fade-up">
      <div className="micro-tag">🌬️ Breathing Exercise</div>
      <div className="micro-xp"><Zap size={11} />+{XP.breathe} XP</div>
      <div className={`breath-orb ${phase[0]}`}>{count}</div>
      <div className="breath-phase" style={{ color: phase[3] }}>{phase[1]}</div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Follow the orb • close your eyes</p>
      <button className="btn-ghost" style={{ marginTop: 36 }} onClick={onDone}>Skip</button>
    </div>
  );
}

const PROMPTS = [
  'What are you actually looking for right now?',
  'Are you opening this out of habit or genuine need?',
  'What would truly make you happy in this moment?',
  'What could you do instead that would feel better?',
];
function MicroReflect({ onDone }) {
  const [val, setVal] = useState('');
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  return (
    <div className="fullscreen fade-up">
      <div className="micro-tag">💭 Reflection</div>
      <div className="micro-xp"><Zap size={11} />+{XP.reflect} XP</div>
      <div className="screen-title" style={{ fontSize: 20, maxWidth: 300, margin: '0 auto 16px' }}>{prompt}</div>
      <div className="reflection-box">
        <textarea placeholder="Type your thoughts here…" value={val} onChange={e => setVal(e.target.value)} autoFocus rows={4} style={{ width: '100%', fontSize: 15, lineHeight: 1.6 }} />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={onDone} disabled={val.trim().length < 3}>
        {val.trim().length < 3 ? 'Write a little more…' : 'Continue to App →'}
      </button>
      <button className="btn-ghost" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={onDone}>Skip</button>
    </div>
  );
}

function MicroGame({ onDone }) {
  const [taps, setTaps] = useState(0);
  const [pos, setPos] = useState({ top: '50%', left: '50%' });
  const [flash, setFlash] = useState(false);
  const TOTAL = 5;
  const tap = () => {
    const next = taps + 1;
    setTaps(next); setFlash(true); setTimeout(() => setFlash(false), 180);
    if (next >= TOTAL) { setTimeout(onDone, 500); return; }
    setPos({ top: `${15 + Math.random() * 70}%`, left: `${15 + Math.random() * 70}%` });
  };
  return (
    <div className="fullscreen fade-up">
      <div className="micro-tag">🎯 Focus Game</div>
      <div className="micro-xp"><Zap size={11} />+{XP.game} XP</div>
      <div className="screen-title">Tap the target!</div>
      <div className="game-prog-track"><div className="game-prog-fill" style={{ width: `${(taps / TOTAL) * 100}%` }} /></div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{taps >= TOTAL ? '✓ Done!' : `${TOTAL - taps} taps remaining`}</p>
      <div className="glass game-area">
        <div className={`focus-target ${flash ? 'hit' : ''}`} onClick={tap} style={{ top: pos.top, left: pos.left }} />
      </div>
    </div>
  );
}

const YT_VIDS = ['How to Learn Anything 10x Faster', 'The Science of Deep Focus', 'Build Better Habits in 30 Days'];
function MockYoutube({ onBack }) {
  return (
    <div className="mock-app fade-up">
      <div className="mock-header">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="mock-logo"><Video size={20} color="#ff0000" /><span>FocusTube</span></div>
        <div style={{ width: 36 }} />
      </div>
      <div className="mock-body">
        <div className="mock-notice"><CheckCircle size={15} />Focus Mode — Shorts &amp; Trending hidden</div>
        <div className="mock-search"><input placeholder="Search educational content…" /></div>
        <div className="section-title">📚 Suggested for Focus</div>
        {YT_VIDS.map((t, i) => (
          <div key={i} className="glass mock-video-row"><div className="mock-thumb" /><div><div className="mock-vid-title">{t}</div><div className="mock-vid-sub">Educational • {8 + i * 3} min</div></div></div>
        ))}
      </div>
    </div>
  );
}

const DMS = ['Alex', 'Jordan', 'Sam', 'Taylor'];
function MockInstagram({ onBack }) {
  return (
    <div className="mock-app fade-up">
      <div className="mock-header">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="mock-logo"><Camera size={20} color="#e1306c" /><span>Messages Only</span></div>
        <div style={{ width: 36 }} />
      </div>
      <div className="mock-body">
        <div className="mock-notice"><CheckCircle size={15} />Focus Mode — Feed &amp; Reels are hidden</div>
        {DMS.map((name, i) => (
          <div key={i} className="glass mock-dm"><div className="mock-avatar" /><div><div className="dm-name">{name}</div><div className="dm-time">Sent a message • {i + 1}h ago</div></div></div>
        ))}
      </div>
    </div>
  );
}

function StatsScreen({ s, onBack }) {
  const level = getLevel(s.xp);
  return (
    <div className="stats-screen fade-up">
      <div className="back-header">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="back-title">Your Stats</span>
      </div>
      <XPBar xp={s.xp} />
      <div className="stats-big-grid">
        <div className="glass stat-big-card"><div className="sbc-val sbc-accent-purple">{s.totalPauses}</div><div className="sbc-label">Total Pauses</div></div>
        <div className="glass stat-big-card"><div className="sbc-val sbc-accent-orange">{s.streak}</div><div className="sbc-label">Day Streak 🔥</div></div>
        <div className="glass stat-big-card"><div className="sbc-val sbc-accent-amber">{s.xp}</div><div className="sbc-label">Total XP ⚡</div></div>
        <div className="glass stat-big-card"><div className="sbc-val sbc-accent-green">{s.totalPauses * 2}</div><div className="sbc-label">Mins Saved</div></div>
      </div>
      <div className="glass stat-big-card" style={{ marginBottom: 12 }}>
        <div className="sbc-val">{level.emoji} {level.name}</div>
        <div className="sbc-label">Current Level</div>
        <div style={{ marginTop: 12 }}><XPBar xp={s.xp} /></div>
      </div>
    </div>
  );
}

function AchievementsScreen({ s, onBack }) {
  return (
    <div className="stats-screen fade-up">
      <div className="back-header">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="back-title">Achievements</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)' }}>{s.unlockedAchs.length}/{ACHIEVEMENTS.length}</span>
      </div>
      <div className="ach-grid">
        {ACHIEVEMENTS.map(a => {
          const unlocked = s.unlockedAchs.includes(a.id);
          return (
            <div key={a.id} className={`glass ach-row ${unlocked ? '' : 'locked'}`}>
              <span className="ach-emoji">{a.icon}</span>
              <div className="ach-info"><div className="ach-name">{a.name}</div><div className="ach-desc">{a.desc}</div></div>
              <div className="ach-xp"><Zap size={11} />+{a.xp}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [s, update] = useStore();
  const [screen, setScreen] = useState('home');
  const [targetApp, setTargetApp] = useState(null);
  const [microType, setMicroType] = useState(0);
  const [xpToast, setXpToast] = useState(null);
  const [achQueue, setAchQueue] = useState([]);
  const [levelUp, setLevelUp] = useState(null);

  // Show achievements one at a time
  const currentAch = achQueue[0] || null;
  const dismissAch = () => setAchQueue(q => q.slice(1));

  const gainXP = (amount, stateAfter) => {
    const prevIdx = getLevelIdx(stateAfter.xp - amount);
    const newIdx  = getLevelIdx(stateAfter.xp);
    setXpToast(amount);
    if (newIdx > prevIdx) setLevelUp(LEVELS[newIdx]);
  };

  const runAchChecks = (nextState, baseXP) => {
    const { nextState: final, newAchs } = checkAchievements(nextState);
    update(() => final);
    gainXP(baseXP + newAchs.reduce((a, b) => a + b.xp, 0), final);
    if (newAchs.length) setAchQueue(q => [...q, ...newAchs]);
    return final;
  };

  const handleAppClick = (appId) => {
    setTargetApp(appId);
    setScreen(s.focusMode !== false ? 'intervention' : appId);
  };

  const handleInterventionContinue = () => {
    const today = new Date().toISOString().slice(0, 10);
    update(prev => {
      const isNewDay = prev.lastPauseDate !== today;
      const newStreak = isNewDay ? (prev.streak + 1) : prev.streak;
      const next = {
        ...prev,
        totalPauses: prev.totalPauses + 1,
        pausesToday: prev.pausesToday + 1,
        pausesDate: today,
        lastPauseDate: today,
        streak: newStreak,
        xp: prev.xp + XP.pause,
      };
      return next;
    });
    setMicroType(Math.floor(Math.random() * 3));
    setScreen('micro');
    setXpToast(XP.pause);
  };

  const handleMicroDone = (type) => {
    const xpMap = { 0: XP.breathe, 1: XP.reflect, 2: XP.game };
    const countMap = { 0: 'breathCount', 1: 'reflectCount', 2: 'gameCount' };
    update(prev => {
      const next = { ...prev, xp: prev.xp + xpMap[type], [countMap[type]]: (prev[countMap[type]] || 0) + 1 };
      const { nextState: final, newAchs } = checkAchievements(next);
      if (newAchs.length) setAchQueue(q => [...q, ...newAchs]);
      gainXP(xpMap[type], final);
      return final;
    });
    setScreen(targetApp);
  };

  const focusMode = s.focusMode !== false;

  return (
    <div className="app">
      {/* Toasts */}
      {xpToast && <XPToast amount={xpToast} onDone={() => setXpToast(null)} />}
      {currentAch && <AchToast ach={currentAch} onDone={dismissAch} />}
      {levelUp && <LevelModal level={levelUp} onClose={() => setLevelUp(null)} />}

      {/* Home */}
      {screen === 'home' && (
        <div className="fade-up">
          <Header xp={s.xp} onStats={() => setScreen('stats')} onAchs={() => setScreen('achievements')} />
          <XPBar xp={s.xp} />
          <HeroCard pausesToday={s.pausesToday || 0} />
          <StatsRow streak={s.streak} totalPauses={s.totalPauses} xp={s.xp} />
          <FocusToggle active={focusMode} onToggle={() => update(prev => ({ ...prev, focusMode: !focusMode }))} />
          <AppGrid onApp={handleAppClick} focusMode={focusMode} />
        </div>
      )}

      {/* Intervention */}
      {screen === 'intervention' && (
        <Intervention onSkip={() => setScreen('home')} onContinue={handleInterventionContinue} />
      )}

      {/* Micro Experiences */}
      {screen === 'micro' && microType === 0 && <MicroBreathe onDone={() => handleMicroDone(0)} />}
      {screen === 'micro' && microType === 1 && <MicroReflect onDone={() => handleMicroDone(1)} />}
      {screen === 'micro' && microType === 2 && <MicroGame    onDone={() => handleMicroDone(2)} />}

      {/* Mock Apps */}
      {screen === 'youtube'   && <MockYoutube   onBack={() => setScreen('home')} />}
      {screen === 'instagram' && <MockInstagram onBack={() => setScreen('home')} />}

      {/* Stats & Achievements */}
      {screen === 'stats'        && <StatsScreen        s={s} onBack={() => setScreen('home')} />}
      {screen === 'achievements' && <AchievementsScreen s={s} onBack={() => setScreen('home')} />}
    </div>
  );
}
