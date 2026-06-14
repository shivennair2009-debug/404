# lost memories

interactive 404 page made for #horizons. 

wanted to build a 404 page that felt like a decaying digital graveyard instead of just a generic error. it splits different files/memories into status levels: stable, volatile, corrupted, and lost. 

you can create an account, log in, uplink your own memories (even attach images), and save them directly to your profile.

### demo
https://lost-memories-zeta.vercel.app

### screenshots
![landing](public/screenshot1.png)
![maze](public/screenshot2.png)

### tech
- next.js + typescript
- framer-motion (for the liquid bg blobs, hud lines, and maze transitions)
- tailwind css
- web audio api (synthesizes sound waves on the fly based on memory stability—no heavy audio files loaded)

### how to run
```bash
npm install
npm run dev
```
