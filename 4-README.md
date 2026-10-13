# Prajit Chaturvedi - Portfolio

Static, build-free portfolio site (HTML, CSS, vanilla JS, canvas). Scroll-driven animated backgrounds, five project detail pages.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000
or `npx serve .`

## Deploy (Vercel)
Import this repo in Vercel. Framework preset: Other. No build command, no output directory, no env variables.

## Structure
- `index.html` - home (About, Projects, Skills, Experience, Contact)
- `projects/*.html` - ragkit, KaleshAI, Incident Triage, Pulseboard, STRIDE tool
- `js/bg.js` - per-page animated canvas backgrounds; `js/main.js` - scroll effects
- `assets/` - resume PDF
