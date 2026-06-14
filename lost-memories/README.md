# lost-memories

made this for #horizons. basically, it's a visual and interactive "404 page" where you navigate a maze of lost/degraded data clusters. instead of just showing a dead link, it splits memories into status levels: stable, volatile, corrupted, and lost.

you can also register a secure uplink account, log in with your email, attach custom image assets, and inject new memory signals that save specifically to your user profile in browser storage.

### why i made this
we all see 404 errors all the time, and they're always boring. I wanted to make a 404 page feel like a physical, decaying digital graveyard. files don't just disappear; they slowly lose coherence, just like human memory.

### preview
![landing](public/screenshot1.png)
![maze](public/screenshot2.png)

### tech stack
- **next.js & typescript**
- **framer-motion** (for all the interactive nodes, liquid mesh background, and HUD parallax)
- **tailwind css** (for the glassmorphic cards and layout)
- **web audio api** (for real-time sound effects. it synthesizes retro/ambient oscillators directly in your browser instead of loading heavy audio assets)

### how it works under the hood
1. **user authentication & session state:** I built a custom React Context provider (`src/context/AuthContext.tsx`) that acts as a client-side authentication database using localStorage. It handles account registration (validating emails, ensuring unique usernames) and keeps users logged in via persistent sessions. All custom memories you create are automatically scoped to your specific profile.
2. **audio synthesis:** inside `src/hooks/useHoverSound.ts`, I use the native browser `AudioContext` to create sine and triangle waves on the fly. Stable files have a high, clean frequency, while corrupted/lost ones sound low and glitched.
3. **deterministic seeded styling:** to give each memory detailed view its own unique look without manually styling them, I wrote a custom LCG (Linear Congruential Generator) random function. It seeds itself using the memory's ID hash, so the glow size and atmospheric color shifts are unique but always the same for that specific ID.
4. **dynamic signal uplink:** when a logged-in user types a new memory and hits inject, it goes through a multi-step loading sequence, generates a new hex ID, and saves it directly to localstorage scoped to that user.

### how to run locally
1. install packages:
   ```bash
   npm install
   ```
2. start the dev server:
   ```bash
   npm run dev
   ```
