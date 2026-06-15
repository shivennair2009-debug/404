# 404

an interactive 404 page built for #horizons. 

i wanted to make a 404 error page that actually feels like a decaying digital graveyard instead of a boring error message. it lets you explore files and data points split into different states of corruption: stable, volatile, critical, and completely lost.

you can create an account, log in, uplink your own files/data to the index, and save them.

### demo
https://lost-memories-zeta.vercel.app

### tech
- next.js + typescript
- framer-motion (for the liquid meshes and node animations)
- tailwind css
- web audio api (generates custom sound frequencies on hover based on how corrupted the data point is)

### running it
```bash
npm install
npm run dev
```
