# Test plan & results

Run against the dev build in a headless browser (DOM inspection + simulated taps),
2026-09-08. All code-only — no art generation.

## Test plan

| Area | What's checked |
|---|---|
| **Assets** | Every page: `background`, reveal frame, and all 3 easter-egg frames resolve `200` and decode (no 404, no broken img). No visible placeholder boxes. |
| **Main interaction** | Each page's one interaction fires and changes state: swap → reveal layer un-hides (p1,2,4,5,7,9,12); glow → scene warms (p3); stick → sticker count increments to `count` (p6=1, p8=2, p10=3, p11=6). Over-cap taps don't crash. |
| **Easter eggs** | All 32: tap → correct `flash` frame becomes visible → auto-hides after the hold → re-tappable. |
| **Hotspot geometry** | Every hotspot within frame bounds, min size, sits over its art element. Extra zones don't bury the main interaction (>~70% coverage = fail) or fully overlap each other. |
| **Navigation** | Title card: no ‹, has › + Start. Page 12: no ›. Swipe / arrows / ArrowKeys / progress dots. Page index persists (localStorage). |
| **Language** | 中/EN toggles title text and in-story sentence + chant; no page reset; persists. |
| **Parent menu** | Language, Mute (persists), Sentence text on/off, Restart → title card. |
| **Text banner** | Auto-fades ~4.2s after page turn; when faded, taps pass through to the scene and only the ▶ chip stays live; tapping ▶ wakes it + replays. `showText` off → ▶ only. |
| **Responsive** | Mobile landscape (844×390): stage fits vertically (dvh), banner/dots/gear/arrows on-screen, no page scroll. Portrait: rotate hint shown, stage hidden. |
| **Resilience** | 24 rapid-fire taps + double page-turn mid-transition → no crash, no error boundary. Full forward+back walk firing every control → zero console errors/warnings, zero uncaught errors. localStorage disabled → still loads (try/catch in `usePersistentState`). |

## Bugs found & fixed

1. **`.hotspot { min-width/height: 120px }` inflated every easter-egg zone** to ~15%×27% of the stage — bottom zones went off-frame, zones overlapped. → `.hotspot.extra-hotspot { min: 0 }` (the 120px floor is for the one primary target only).
2. **Faded banner still ate taps** in its corner at 12% opacity — blocked low easter eggs (p12 slippers). → `pointer-events: none` when dimmed; `auto` only on the ▶ chip.
3. **p12 lamp tap was stolen by the overlapping bag-glimmer easter egg** — the "rabbit goes to bed" reveal looked missing. → separated the zones; verified lamp→asleep fires.
4. **All 40 hotspots repositioned** from coordinates measured off each approved plate (were estimates).
5. **Sticker ★ placeholders spawned bottom-left, away from 小兔's bag.** → repositioned by her bag / over the counting row.
6. **p6/p8/p10 "collect sticker" zone >60% covered by the neighbour-reaction egg.** → tightened both.
7. **Timer leaks in `PageView`** (easter-egg reset + banner fade not cleared on unmount; rapid re-tap cut a flash short). → refs + cleanup; re-tap restarts the hold.
8. **Reveal layers hard-cut** instead of cross-fading. → `.swap-to` opacity transition.
9. **Parent-menu panel was still dark-purple** on the warm book. → warmed to paper.
10. **Title card: missing-art boxes + near-invisible title.** → warm gradient bg, title recoloured, placeholders hidden.
11. **Precache was 17 MB** (all JPEG). → converted 54 plates/frames to WebP → **4.7 MB**.

## Verified working (no change needed)

All 12 main interactions · all 32 easter eggs · language toggle + persistence · nav
bounds + swipe + arrows + keyboard · parent menu (4 controls, all persist) · banner
fade/wake/`showText` · restart → title · mobile-landscape fit · portrait rotate
hint · 24-tap stress + mid-transition nav · zero console errors on a full walk.

## Known gaps (not bugs — decisions / pending work)

- **`DEFAULT_LANGUAGE = "en"`** in `i18n.ts` — PRD wants `zh` default. Left as-is
  (comment: "temporarily en for testing"); one-line flip when wanted.
- **Title card has no illustration** — separate deliverable; text-only fallback styled.
- **Narration + SFX: silent** — no audio files yet (TTS is the next track).

## Done since first pass (2026-09-08)

- **Sticker sprites**: sliced the 6 from the approved sheet (`tools/stickers.mjs`)
  → `public/stickers/*.webp`. Wired via `interaction.stickers[]`; treat pages
  (6/8/10) pop the sprite onto 小兔's bag, counting page (11) pops numeral badges
  1–6 over the drawn row. Replaces the ★ placeholders. Verified on all 4 pages.
- **Easter-egg hotspots tuned against an ~800 px browser** — may want a nudge after
  real iPad testing.
- **iPad is 4:3** — 16:9 art letterboxes top/bottom there; deferred to device testing.
