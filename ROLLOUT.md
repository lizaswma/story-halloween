# Book 1 art rollout — plan for sign-off

Pages **3 and 5 are done** (probe). This covers the remaining **10 pages + shared
assets**. Pipeline is proven; see the `scene-pipeline-v1` memory and
`little-rabbit-style/tools/README.md`.

**Model:** `gemini-3.1-flash-image` (Nano Banana 2), 2K, **batch** (½ price), via
`generate.mjs --batch`. Pro only as escalation for a specific bad image.
**Consistency:** every job feeds `hero.png` (+ costume / the approved plate) as a
reference. **Framing:** the manifest now appends a full-bleed clause to every job.

---

## Scene arc

| Pages | Setting |
|---|---|
| 1 | 小兔's cottage, outside, dusk — establishes "home" |
| 2 | 小兔's entryway (coat hooks, mirror) — costume on a hook |
| 3 ✅ | 小兔's bedroom |
| 4 | 小兔's front door, seen from inside |
| 5–6 ✅/→ | **小猫's house** (warm cottage, round-window door, carved pumpkin) |
| 7–8 | **小熊's house** (blue-grey, arched door, paper lantern, autumn tree) — plate done |
| 9–10 | **猫头鹰's house** (tall narrow house by a big tree, round windows, ivy) |
| 11 | back home — 小兔 on the rug with the open bag, all 6 stickers |
| 12 | 小兔's bedroom again (= page 3 room, dimmed) — bedtime |

Each neighbour house is drawn once and used for its knock + treat page. Page 12
reuses the page-3 room.

---

## Per-page detail

Each page = **1 plate** (scene + 小兔 composited) + (for swap pages) **1 reveal
frame** + **3 easter-egg frames**. Easter eggs cross-fade a full-frame "reacted"
variant in for ~0.9 s on tap, with a sound — never gate progress.

### Page 1 — 万圣节到了！ / It's Halloween!
- **Scene:** 小兔 (no costume yet) in her front yard at dusk, looking up. Cottage with warm windows behind, big crescent moon + stars, a friendly carved pumpkin on the doorstep, autumn leaves. Wide establishing shot.
- **Main tap:** moon → the whole sky sparkles (`stars-bright`).
- **Easter eggs:**
  1. a dark **window** → a light flicks on, a little pet silhouette appears (`window-light`)
  2. a **pile of leaves** by the path → they swirl up (`leaves-swirl`)
  3. the **doorstep pumpkin** → it winks / wiggles (`pumpkin-wink`)

### Page 2 — 小兔选南瓜装。 / Little Rabbit picks the pumpkin.
- **Scene:** 小兔's entryway — coat hooks, a round mirror, a rug, a window to dusk. The pumpkin costume hangs on a hook; 小兔 (no costume) reaches for it.
- **Main tap:** costume → lifts off the hook and wiggles "ready" (`costume-ready`).
- **Easter eggs:**
  1. the **mirror** → a tiny ghost waves back in the reflection (`mirror-peek`)
  2. a pair of little **boots** by the door → they do a tap-dance wiggle (`boots-wiggle`)
  3. the **window** → the moon outside brightens (`window-moon-bright`)

### Page 4 — 小兔出门啦。 / Little Rabbit goes out.
- **Scene:** 小兔 (in costume now) at her own front door from inside, paw on the handle, door shut. Warm hallway.
- **Main tap:** door → opens, the night neighbourhood revealed, 小兔 steps out (`door-open`).
- **Easter eggs:**
  1. the **coat hooks** → a scarf swings, a hat drops and rights itself (`hook-sway`)
  2. the **floor by the door** → a tiny mouse scurries past (`mouse-scurry`)
  3. a **framed picture** on the wall → the face in it waves (`picture-wave`)

### Page 6 — 小猫给一张贴纸。 / The cat gives one sticker.
- **Scene:** 小猫's doorway (same house as p5), 3/4 view so 小兔's trick-or-treat bag shows. 小猫 leans out with one sticker; warm light spills from inside.
- **Main tap:** the sticker → flies to the bag and sticks (×1).
- **Easter eggs:**
  1. 小猫's **tail** → it swishes (`cat-tail-swish`)
  2. the lit **window** → brightens, a second kitten appears (`window-kitten`)
  3. the **doormat** → a little beetle scurries out (`mat-bug`)

### Page 7 — 小兔又敲门。 / knocks again.  *(plate done — Flash #1)*
- **Scene:** 小熊's blue-grey cottage, arched door, glowing paper lantern, autumn tree, hedge. 小兔 from behind, reaching to knock.
- **Main tap:** door → opens, 小熊 in the doorway with 2 stickers (`p07-open`).
- **Easter eggs:**
  1. the **paper lantern** → glows brighter, sways (`lantern-glow`)
  2. the **autumn tree** → leaves flutter down (`tree-leaves`)
  3. the **hedge** → a little hedgehog peeks out (`hedge-peek`)

### Page 8 — 小熊给两张贴纸。 / The bear gives two stickers.
- **Scene:** 小熊's doorway (same house), 3/4 view, 小兔 + bag, 小熊 leaning out with 2 stickers.
- **Main tap:** each sticker → sticks to the bag (×2).
- **Easter eggs:**
  1. 小熊's **tummy** → a happy bounce (`bear-bounce`)
  2. a **honey pot** by the door → a bee loops around it (`honey-bee`)
  3. the **lantern** → brightens (`lantern-glow-8`)

### Page 9 — 再敲一扇门。 / One more door.
- **Scene:** 猫头鹰's house — tall and narrow beside a big tree, two round windows, ivy, a crescent-moon door knocker. 小兔 from behind, reaching up.
- **Main tap:** door → opens, 猫头鹰 with 3 stickers (`p09-open`).
- **Easter eggs:**
  1. a **round window** → an owlet blinks in it (`window-owlet`)
  2. a little **mailbox** → flag flips up, a bat flutters out (`mailbox-bat`)
  3. the big **moon** → brightens (`moon-bright-9`)

### Page 10 — 猫头鹰给三张贴纸。 / The owl gives three stickers.
- **Scene:** 猫头鹰's doorway (same house), 3/4, 小兔's bag fuller now, 猫头鹰 with 3 stickers.
- **Main tap:** each sticker → sticks (×3).
- **Easter eggs:**
  1. 猫头鹰's **head** → a cute near-full turn (`owl-turn`)
  2. a **candle** by the door → flame flares up (`candle-flare`)
  3. the **ivy** → a moth flutters out (`ivy-moth`)

### Page 11 — 数一数贴纸。 / Let's count the stickers.
- **Scene:** back home — 小兔 sits on her round rug, trick-or-treat bag open in front, all **6 stickers** laid out so they can be counted 1→6. Cozy, lamp-lit. The little ghost that's been following her all night is curled up on the rug beside her.
- **Main tap:** each sticker → lights up, voice counts 一/二/三…, the numeral shows (×6).
- **Easter eggs:**
  1. the **lamp** → warm flare (`lamp-flare-11`)
  2. the **window** → the moon brightens softly (`window-moon-11`)
  3. the **little ghost friend** curled on the rug → a sleepy stretch and yawn (`ghost-stretch`) — pays off the ghost cameo from p5 and leads into bedtime

### Page 12 — 万圣节快乐，晚安！ / Happy Halloween. Good night!
- **Scene:** 小兔's bedroom (= page 3, dimmed), costume folded on the chair, 小兔 in pajamas sitting on the bed, lamp on, sticker bag on the nightstand.
- **Main tap:** lamp → dims, 小兔 curls up asleep, moon-glow takes over (`lamp-off`).
- **Easter eggs:**
  1. the window **moon** → soft glow + a lullaby sparkle (`moon-lullaby`)
  2. the **sticker bag** on the nightstand → stickers glow faintly (`bag-glow`)
  3. the **slippers** by the bed → they shuffle together neatly (`slippers-tuck`)

---

## Shared assets (generate once, reuse)

| Asset | For | ~images |
|---|---|---|
| **Sticker set** — pumpkin, ghost, bat, star, moon, black cat (one die-cut sheet) + **trick-or-treat bag** | pages 6, 8, 10, 11 | 6–8 |
| **猫头鹰** reference (小猫 from p5-open, 小熊 from p7-open already usable) | pages 9, 10 | 3 |

*Title card (page 0) is being done separately, not in this rollout.*

---

## Cost & batching

~**83 images** total. Flash 2K batch = $0.05/image; easter-egg frames can drop to
1K ($0.034). Estimate **$4–5**, plus reroll headroom → **~$5–7**.

Submitted in **3 waves** so we course-correct between:

| Wave | Contents | Images | ~Cost |
|---|---|---|---|
| **A** | 10 plates (p7 mostly done) + sticker sheet + bag + 猫头鹰 ref | ~41 | ~$2.05 |
| **B** | reveal / costume-ready / door-open / lamp-off frames (edits of approved plates) | ~16 | ~$0.80 |
| **C** | ~30 easter-egg frames (edits of approved plates), 1K | ~30 | ~$1.00 |

Between waves: I review, send you the picks, you approve before the next wave.

## Decisions (2026-09-07)

1. **Neighbour houses** ✅ — cat = warm cottage, bear = blue-grey w/ lantern, owl =
   tall narrow house by a big tree, round windows, ivy.
2. **Page 1** ✅ — 小兔 *without* the costume.
3. **Page 11** ✅ — no "7th sticker"; easter egg is the ghost friend curled on the
   rug doing a sleepy stretch.
4. **Title card** ✅ — separate, not in this rollout.

## Wave A picks (2026-09-07) — wired into the app

| Page | Pick | Page | Pick |
|---|---|---|---|
| 1 | option 1 | 8 | option 1 |
| 2 | option 1 | 9 | option 2 |
| 4 | option 1 | 10 | **regen in Wave B** (ref p09 house + new owl) |
| 6 | option 1 | 11 | option 2 |
| 7 | v2-1 | 12 | option 2 (+ expression nudge to content-sleepy) |
| sticker sheet | option 1 (warm, gold moon) | bag | option 2 (striped, toothless) |
| 猫头鹰 | **reroll** — classic big round awake eyes | | |

**Sticker → neighbour assignment** (the 6 she counts on p11):
- 小猫 gives **1**: black cat
- 小熊 gives **2**: pumpkin + star
- 猫头鹰 gives **3**: ghost + bat + moon

## Wave B — reveal frames + fixes (next)

| Job | ×N | |
|---|---|---|
| p01 `scene-bright` | 2 | edit p01: moon + stars bloom |
| p02 `scene-ready` | 2 | edit p02: costume lifts off the hook |
| p04 `scene-open` | 2 | edit p04: door opens, night street beyond |
| p07 `scene-open` | 2 | edit p07: door opens, 小熊 + 2 stickers |
| p09 `scene-open` | 2 | edit p09: door opens, 猫头鹰 + 3 stickers |
| p10 plate | 3 | fresh, ref p09 house + new owl-ref |
| p12 plate reroll | 2 | content-sleepy face |
| p12 `scene-off` | 2 | lamp off, 小兔 asleep, moon glow |
| owl-ref reroll | 3 | classic awake eyes |
| bag swap p06/p08/p10/p11 | 4 | edit in the striped bag |
| **~24 images · Flash 2K batch · ~$1.20** | | |

Sticker sheet + bag get keyed (no generation). Wave C = the ~30 easter-egg frames.
