# void // digital detox app

it is a simple app to help you stay away from mindless scrolling. when you want to open "guarded" apps (like mock youtube or instagram), void intervenes and forces you to pause, breathe, reflect, or play a quick focus game. 

built for **#horizons**.

## how it works
1. **focus mode**: when toggled on, opening YouTube or Instagram triggers a 5-second countdown to make you think.
2. **micro-interventions**: after the pause, you get one of three random exercises:
   - 🌬️ **breathing**: a 14-second box-breathing cycle to slow down your heart rate.
   - 💭 **reflection**: prompts you to write down *why* you are opening the app right now.
   - 🎯 **focus game**: a quick game where you tap moving targets to regain active focus.
3. **gamification**: you earn XP for every pause or exercise. leveling up takes you from *Rookie* -> *Focused* -> *Disciplined* -> *Mindful* -> *Zen Master*.
4. **stats**: tracks your daily streak, total pauses, and total minutes saved from mindless scroll.

## tech stack
- **core**: React + Vite + Vanilla CSS
- **icons**: Lucide React
- **state**: LocalStorage persistence (holds streak, levels, stats, and achievements)

## running locally
1. install dependencies:
   ```bash
   npm install
   ```
2. start dev server:
   ```bash
   npm run dev
   ```
3. build for production:
   ```bash
   npm run build
   ```
