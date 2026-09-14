# 小兔过万圣节 (Little Rabbit's Halloween) — PRD

**Status:** Scope decided — ready to scaffold
**Product:** Interactive storybook web app, book #1 in a planned holiday series featuring 小兔 (Little Rabbit)
**Primary user:** A 2–3 year old, co-playing with a parent
**Author/owner:** liza@mamabuilds.dev

---

## 1. Vision

A cozy, tappable bedtime storybook that walks a toddler through a simple Halloween
night with 小兔: pick a costume, knock on doors, say "不给糖就捣蛋!", collect
**stickers**, count them, go to sleep. One short sentence per page, one big
illustration, one thing to tap. It should feel like play and reading together —
never a quiz, never a timer.

**Treat = stickers (贴纸), not candy.** The child isn't eating candy yet, so the
neighbors hand out Halloween stickers that tap onto 小兔's trick-or-treat bag. The
traditional chant "不给糖就捣蛋！" / "Trick or treat!" is kept as-is — it's the fixed
cultural set-phrase (like "trick or treat" itself), and the parent can gloss it. See
open note in §9.

The story is **told in Mandarin by default**, with a **parent-controlled toggle to
switch the whole book to English** (text and narration). This makes it usable for a
bilingual household and for English-only relatives reading the same book.

小兔 is a **recurring character** — art, proportions, and style must be reusable for
future books (小兔过春节, 小兔过圣诞, etc.).

## 2. Who we're designing for (2–3 years old)

Design around these facts:

- Cannot read. All story text is for the **parent**; the **child navigates by
  pictures, sound, and touch**.
- Tapping is reliable; precise dragging is not. Every interaction is a tap.
- Loves repetition of the *same* pattern (knock → door opens → sticker) more than novelty.
- No concept of winning/losing or "wrong." Every tap must produce a pleasant response.
- Short sittings (~2–5 min). The whole book should be readable in one sitting but
  fine to abandon at any page.
- A parent is almost always co-reading and narrating; pacing should let the parent
  read the line aloud, then let the child tap.
- Counting (1–3, up to ~6) is emerging — the counting page teaches toward one-to-one
  correspondence, it doesn't assume it.

## 3. Platform & tech stack

| Area | Decision |
|---|---|
| Type | Web app, installable to iPad home screen (PWA), **not** a native/App Store app |
| Framework | React 18 (function components + hooks) + TypeScript |
| Build | Vite |
| Routing | None required — book is a single view with a `pageIndex` state (optional URL hash `#p3` for resume/deep-link) |
| PWA | `vite-plugin-pwa` — web manifest, service worker precaching all art/audio for **fully offline** use, `display: standalone`, landscape orientation |
| Audio | Howler.js (reliable mobile playback, audio sprites for SFX) |
| Animation | CSS transitions + keyframes now; Lottie as a later upgrade for specific moments |
| State | React context: `{ language, pageIndex, muted }`, persisted to `localStorage` |
| Backend | None. No accounts, no network dependency, no analytics |
| Reuse | Same stack/pattern as the `artbox` web project (React + Vite + TS) for maintainability |

Target device: iPad (retina). Must also run in desktop Chrome/Safari for development
and for relatives without an iPad.

## 4. Bilingual requirement (core feature)

### 4.1 Behavior

- **Default language: Mandarin (`zh`).** English (`en`) is opt-in.
- A **parent-facing toggle** (see 4.4) flips the entire book: on-page sentence,
  narration audio, and spoken number words during counting.
- Switching language **re-renders the current page in place** — same page, no reset,
  no progress loss. If narration is mid-play, it stops and the new-language track
  becomes available to replay.
- Sound effects (knock, creak, sticker "boop", etc.) are **language-independent** and
  never change.
- Selection **persists** across sessions (`localStorage`, key `lr.language`).

### 4.2 Text content model

Every page stores both languages:

```ts
type PageText = { zh: string; en: string };
```

- Mandarin sentences: **4–8 characters**, one sentence per page.
- English sentences: short, ~2–6 words, natural for reading aloud (not a literal
  gloss).
- Fixed phrase, both languages, appears on the knock pages:
  - `zh`: 不给糖就捣蛋！
  - `en`: Trick or treat!

### 4.3 Audio narration

- **One pre-recorded narration clip per page per language**: `/audio/zh/03.mp3`,
  `/audio/en/03.mp3`.
- Narration **auto-plays once on page turn** (unless muted), and **replays when the
  child taps the sentence** (large tap target on the text banner).
- Counting page: number words spoken in the selected language ("一, 二, 三…" /
  "one, two, three…").
- **Voice plan:**
  - *Now:* plain neural TTS (warm zh-CN and en-US voices) so the story can be
    reviewed end-to-end quickly.
  - *Once the story outline feels right:* regenerate with LLM-generated voices.
    Expect to use **different models for Mandarin vs. English** (best-in-class per
    language rather than one bilingual voice).
  - The file/manifest layout (`/audio/{lang}/NN.mp3`) stays identical across all
    three stages, so swapping voices is an asset change with no code change.

### 4.4 Toggle UX

- Small **EN / 中** control in a **top corner**, deliberately *not* a big toddler
  tap target, so the child doesn't flip it by accident. (A brief press-and-hold or a
  small tucked-away spot is acceptable; no hard parent-gate/math-lock needed for v1.)
- Also lives in the parent menu (see 7.3) alongside mute and restart.

### 4.5 Not in v1

- **Pinyin line** under the Mandarin sentence — dropped for v1. Revisit if a parent
  wants a learning aid later.

## 5. Story structure (page-by-page)

12 pages. The knock → door → sticker beat repeats 3× with different animals and
increasing sticker counts (1 + 2 + 3 = 6), which sets up the counting payoff.

| # | Beat | 中文 (4–8 字) | English | Tap interaction | SFX |
|---|---|---|---|---|---|
| 1 | Opening | 万圣节到了！ | It's Halloween! | Tap moon → stars twinkle | soft chime |
| 2 | Pick costume | 小兔选南瓜装。 | Little Rabbit picks the pumpkin. | Tap pumpkin costume → it lifts/wiggles ready to wear | cloth rustle |
| 3 | Put it on | 小兔穿上南瓜装。 | Little Rabbit puts it on. | Tap Little Rabbit → costume "lights up" (lit-layer swap / glow) | sparkle |
| 4 | Go out | 小兔出门啦。 | Little Rabbit goes out. | Tap door → opens, night scene revealed | door creak |
| 5 | Knock #1 | 小兔去敲门。 | Little Rabbit knocks. | Tap neighbor's door → knock, door opens, 小猫 appears | knock knock |
| 6 | Treat #1 | 小猫给一张贴纸。 | The cat gives one sticker. | Tap the sticker → it sticks onto the bag | boop |
| 7 | Knock #2 | 小兔又敲门。 | Little Rabbit knocks again. | Tap door → knock, 小熊 appears | knock knock |
| 8 | Treat #2 | 小熊给两张贴纸。 | The bear gives two stickers. | Tap each sticker (×2) → each sticks onto the bag | boop ×2 |
| 9 | Knock #3 | 再敲一扇门。 | One more door. | Tap door → knock, 猫头鹰 appears | knock knock |
| 10 | Treat #3 | 猫头鹰给三张贴纸。 | The owl gives three stickers. | Tap each sticker (×3) → each sticks onto the bag | boop ×3 |
| 11 | Count | 数一数贴纸。 | Let's count the stickers. | Tap each sticker on the bag (×6) → it lights up, voice counts "一…二…三…", numeral appears | gentle count blips |
| 12 | Bedtime | 万圣节快乐，晚安！ | Happy Halloween. Good night! | Tap the lamp → light dims, 小兔 curls up asleep | lullaby sting |

Trick-or-treat line (`不给糖就捣蛋！` / `Trick or treat!`) is shown and spoken on
pages 5, 7, 9 as a secondary line under the main sentence.

Sticker art: use Halloween motifs the child will recognize — pumpkin, ghost, bat,
star, moon, black cat. On the counting page all 6 sit on the bag so they can be
counted 1→6.

Sticker math: 1 + 2 + 3 = **6** total on the counting page. *(Decided — 6 is fine.)*

## 6. Interactivity model

Art is raster (AI-generated PNGs), so interactivity is **layered assets + code-driven
state**, not vector part manipulation.

Each page is declared as data:

```ts
type Page = {
  id: number;
  text: PageText;            // { zh, en }
  secondaryText?: PageText;  // e.g. trick-or-treat line
  background: string;        // full-bleed plate
  layers: Layer[];           // stacked transparent PNGs
  interaction: Interaction;  // the one tap-to-reveal element
};

type Interaction =
  | { kind: 'swap';  target: string; from: string; to: string; sfx: string }   // door closed→open
  | { kind: 'glow';  target: string; sfx: string }                             // costume lights up
  | { kind: 'stick';  target: string; count: number; sfx: string }             // sticker onto bag
  | { kind: 'twinkle'; target: string; sfx: string };                          // stars/moon
```

Rules:

- **One interactive element per page.** Repeatable ones (sticker ×2, ×3, ×6) count as one.
- **Tap targets ≥ 120 pt** square, generously padded, well inside the safe area.
- Every tap does *something* pleasant even after the "main" action is done (small
  wiggle + SFX) — no dead taps, no error states.
- Interactions are **not gates**: the child can turn the page without completing the
  tap. Nothing is ever "incomplete."
- Reduced-motion: honor `prefers-reduced-motion` (cross-fades instead of bounces).

## 7. Navigation & UX

### 7.1 Page turning

- Large **left/right arrow buttons** (bottom corners) **and** horizontal swipe.
- **No auto-advance.** Parent/child controls the pace.
- Subtle progress dots; not interactive for the child.
- Page-turn: quick slide/cross-fade (~250 ms).

### 7.2 Audio

- Narration auto-plays on page turn; tap sentence to replay.
- Global **mute** toggle in the parent menu and a small speaker icon on-screen.
- Respect the iPad silent switch / system volume.

### 7.3 Parent menu

Small gear icon, top corner (not a child target). Contains:

- Language: **中 / EN**
- Mute / unmute
- Restart from page 1

### 7.4 First launch

- **Prominent title card** before page 1: series branding up top — **「小兔」系列**
  (the "Little Rabbit" series) — then this book's title **小兔过万圣节 / Little
  Rabbit's Halloween** and 小兔 in the pumpkin costume. A single tap (or the arrow)
  starts the story. This card is where the series identity is established, so future
  books share the same lockup with only the sub-title changing.
- Then straight into page 1 in Mandarin. No further onboarding.
- "Add to Home Screen" hint shown once in mobile Safari.

## 8. Art & asset pipeline

### 8.1 Character (reusable across the series)

Base character prompt:

> A small, round, friendly cartoon rabbit character for a children's book, sitting
> pose, big round head, short floppy ears, large simple round eyes, tiny pink nose,
> no visible teeth, soft rounded body with no sharp edges, flat pastel color
> illustration style, clean thick outlines, minimal shading, warm and cheerful
> expression, centered on a plain white background, character reference sheet showing
> front view and 3/4 view

Halloween costume add-on:

> wearing an orange pumpkin costume with a small green stem hat, cute and not scary,
> Halloween theme, flat illustration style, children's book art, thick clean
> outlines, minimal shading, soft color palette, plain white background

Consistency tags (append to every generation):

> flat vector-style children's book illustration, thick clean outlines, minimal
> shading, soft rounded shapes, warm friendly color palette, no text, no watermark

### 8.2 Consistency technique

1. Generate a **character reference sheet** first (front + 3/4 view).
2. On every scene generation use Midjourney `--cref [url] --cw 100` (or a literal
   re-description of the character for DALL·E / ChatGPT).
3. Keep a locked palette and the tag block above on every prompt.

### 8.3 Layering

Per page, generate separately:

- **Background plate** — full scene, no interactive object, full-bleed.
- **Interactive object(s)** — transparent PNG(s), e.g. `door-closed.png` +
  `door-open.png`, `sticker-pumpkin.png`, `costume-lit.png`.
- Optional foreground/framing layer.

### 8.4 Sticker props

Generate the 6 stickers as one set, transparent PNGs, consistent size:

> a set of cute flat Halloween stickers for a toddler — pumpkin, friendly ghost,
> little bat, star, crescent moon, black cat — die-cut sticker style with a thick
> white border, flat illustration, thick clean outlines, minimal shading, soft
> friendly color palette, not scary, each on its own transparent background, no text,
> no watermark

Also need a bag: `bag-empty.png` and `bag-full.png` (or composite stickers onto the
empty bag in code).

### 8.5 Specs & organization

- Resolution: **2048 px** on the long edge (retina iPad), 4:3 or 16:10 plate.
- Format: PNG with alpha for layers; WebP for background plates if size matters.
- Layout:
  ```
  public/
    pages/01/background.webp
    pages/01/moon.png
    pages/05/door-closed.png
    pages/05/door-open.png
    pages/05/cat.png
    pages/06/sticker-pumpkin.png
    audio/zh/01.mp3   audio/en/01.mp3
    sfx/knock.mp3  sfx/boop.mp3  sfx/creak.mp3 ...
  ```
- A single `book.ts` (or `book.json`) holds the page array from §6.

## 9. Resolved decisions

1. **Treat:** stickers (贴纸), not candy — the child isn't eating candy yet. Neighbors
   give Halloween stickers that tap onto 小兔's bag.
2. **Voice:** plain TTS now → LLM-generated voices once the story outline is locked,
   likely **different models for Mandarin vs. English**. File layout unchanged across
   stages.
3. **Costume:** fixed on the pumpkin (no costume-picker in v1).
4. **Sticker total:** 1 + 2 + 3 = **6** on the counting page.
5. **Background music:** none. SFX + narration only.
6. **Knock repeats:** **3** neighbors (小猫 / 小熊 / 猫头鹰).
7. **Pinyin:** not in v1.
8. **Title card / series branding:** **prominent** — the title card leads with the
   「小兔」series lockup (see §7.4), reused across future books.

### Open note

- The chant **不给糖就捣蛋！** literally says 糖 ("candy"). It's kept as the standard
  cultural set-phrase even though the treat is stickers. If saying "candy" 3× is
  itself a concern, the fallback is a softer non-standard line (e.g. 不给贴纸就捣蛋！);
  default is to keep the real phrase and let the parent gloss it. Confirm before
  recording final voice.

## 10. Non-goals (v1)

- Other books in the series (design for reuse, but build only Halloween).
- Costume picker on page 2 (fixed pumpkin in v1).
- Background music.
- Pinyin display.
- User accounts, profiles, cloud sync, cross-device progress.
- Record-your-own-voice narration.
- Analytics / telemetry / parent progress dashboard.
- Native app / App Store / Play Store packaging.
- Printing or PDF export.
- More than the one interaction per page; part-level (vector) animation; Lottie.

## 11. Milestones

| # | Deliverable |
|---|---|
| M0 | Scaffold: Vite + React + TS + `vite-plugin-pwa`; page engine renders the §6 data model; swipe/arrows; language context + `localStorage`; placeholder rectangles for art, beep for audio |
| M1 | Full content in Mandarin: all 12 pages, `zh` text, `zh` narration (plain TTS), all SFX, all interactions working with placeholder art |
| M2 | Real art integrated: character ref sheet → title card + 12 scenes → layered exports wired in |
| M3 | Bilingual: `en` text + `en` narration + toggle (on-page + parent menu), in-place language switch, persistence |
| M4 | Final voices: regenerate `zh` + `en` narration with LLM-generated voices (per-language model), swap in as assets |
| M5 | PWA polish: offline precache verified, install-to-home-screen on iPad, landscape lock, reduced-motion, mute, restart, prominent title card |
| M6 | Playtest with the toddler; tune pacing, tap-target sizes, sticker count, narration timing |

## 12. Success criteria

- A parent can read the whole book to the child in one ~4-minute sitting.
- The child can trigger every page's interaction with a single tap, unassisted.
- Switching 中 ⇄ EN changes every sentence and every narration line, with no loss of
  place.
- Works with the iPad in airplane mode after first load.
- 小兔's art can be dropped into a second holiday book without redrawing the character.
