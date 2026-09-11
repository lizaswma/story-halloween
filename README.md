# 小兔过万圣节 · Little Rabbit's Halloween

Interactive bilingual (中文 / English) Halloween storybook for a 2–3 year old.
Book #1 in the 「小兔」 series. See [PRD.md](PRD.md) for the full spec.

## Stack

React 18 + TypeScript + Vite + `vite-plugin-pwa`, Howler.js for audio. No backend.
Installable to an iPad home screen, works fully offline after first load.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview     # serve the build (PWA/service worker active here, not in dev)
```

## How it's put together

| Path | What |
|---|---|
| `src/book.ts` | The 12 pages + title card as data — text (`zh`/`en`), layers, the one tap interaction per page |
| `src/types.ts` | Page / interaction model (PRD §6) |
| `src/context/BookContext.tsx` | `language`, `pageIndex`, `muted` — persisted to `localStorage` |
| `src/audio/sound.ts` | Howler wrapper: narration, SFX, spoken numbers; all best-effort |
| `src/components/PageView.tsx` | Renders a page, runs the interaction (`swap` / `glow` / `twinkle` / `stick`) |
| `src/components/TitleCard.tsx` | Series-branded opening card |
| `public/pages`, `public/audio`, `public/sfx` | Drop-in assets — see the README in each folder |

Art and audio are not in the repo yet. The app runs without them: missing images
render as labelled placeholder boxes, missing audio is silent (milestone M0).

## Status

- [x] M0 — scaffold (this)
- [ ] M1 — Mandarin content + TTS narration + SFX
- [ ] M2 — real scene art
- [ ] M3 — English text + narration + toggle polish
- [ ] M4 — final LLM-generated voices
- [ ] M5 — PWA polish + iPad install
- [ ] M6 — toddler playtest
