import type { Asset, Page, StickInteraction, TitleCard } from "./types";

// ── Asset path helpers ──────────────────────────────────────────────────────
// Real art drops into /public/pages/NN/. Until then <Layer> shows the id as a
// labelled placeholder box (PRD §8.3).
const pageDir = (n: number) => `/pages/${String(n).padStart(2, "0")}`;

// Plates + reveal frames are WebP (~⅓ the size of JPEG); cutout sprites are PNG.
const bg = (n: number): Asset => ({
  id: `bg-${n}`,
  src: `${pageDir(n)}/background.webp`,
  alt: "",
});

const layer = (
  n: number,
  id: string,
  extra: Partial<Asset> & { ext?: "png" | "jpg" | "webp" } = {},
): Asset => {
  const { ext = "png", ...rest } = extra;
  return {
    id,
    src: `${pageDir(n)}/${id}.${ext}`,
    alt: "",
    ...rest,
  };
};

/** Audio paths — narration is per-page per-language (PRD §4.3). */
export const narrationSrc = (pageId: number, lang: string) =>
  `/audio/${lang}/${String(pageId).padStart(2, "0")}.mp3`;
export const countSrc = (n: number, lang: string) =>
  `/audio/${lang}/count/${n}.mp3`;
export const sfxSrc = (name: string) => `/sfx/${name}.mp3`;

// ── Title card (PRD §7.4) ───────────────────────────────────────────────────
export const TITLE_CARD: TitleCard = {
  series: { zh: "「小兔」系列", en: "The Little Rabbit series" },
  title: { zh: "小兔过万圣节", en: "Little Rabbit's Halloween" },
  start: { zh: "开始", en: "Start" },
  // 小兔 in costume is part of the cover art; the app overlays the text.
  background: { id: "bg-title", src: "/pages/00/background.webp", alt: "" },
  layers: [],
};

// The stickers are held out at the open door (pages 5/7/9) and again on the
// sticker page that follows (6/8/10) — same art, so the same tap target.
const CAT_STICKER: StickInteraction = {
  kind: "stick",
  sfx: "boop",
  count: 1,
  stickers: ["cat"],
  hotspot: { x: 54, y: 52, w: 12, h: 22 }, // the sticker in 小猫's paw
  bag: { x: 54, y: 73 },
  hand: [{ x: 59.2, y: 63, w: 5.8, h: 10.1 }], // cat sticker, held out in 小猫's paw
};
const BEAR_STICKERS: StickInteraction = {
  kind: "stick",
  sfx: "boop",
  count: 2,
  stickers: ["pumpkin", "star"],
  hotspot: { x: 58, y: 50, w: 16, h: 21 }, // the two stickers held out by 小熊
  bag: { x: 60, y: 76 },
  // The plate has empty paws; these sprites sit where the stickers were painted.
  hand: [
    { x: 61.2, y: 57.5, w: 6.4, h: 14.2 }, // pumpkin
    { x: 68.9, y: 59.8, w: 5.3, h: 9.6 }, // star
  ],
};
const OWL_STICKERS: StickInteraction = {
  kind: "stick",
  sfx: "boop",
  count: 3,
  stickers: ["ghost", "bat", "moon"],
  hotspot: { x: 49, y: 53, w: 12, h: 28 }, // the three stickers, mid-exchange
  bag: { x: 51, y: 84 },
  // The plate has an empty hand; these sprites sit where the stickers were painted.
  hand: [
    { x: 53.5, y: 65.5, w: 3.9, h: 8 }, // ghost
    { x: 56.6, y: 57.3, w: 5.6, h: 5.6 }, // bat
    { x: 54.1, y: 75.3, w: 3.6, h: 6.8 }, // moon
  ],
};

// ── The 12 pages (PRD §5) ───────────────────────────────────────────────────
const CHANT = { zh: "不给糖就捣蛋！", en: "Trick or treat!" };

// Hotspots are % of the stage {x,y = top-left, w,h}. Positions measured off the
// approved plates (2026-09-08). extra-hotspots sit above the main hotspot and the
// text banner (z-index), so keep each extra clear of the main interaction target.
export const PAGES: Page[] = [
  {
    id: 1,
    text: {
      zh: "万圣节到了！小兔好想去要糖。",
      en: "It's Halloween! Little Rabbit is excited to go trick-or-treat.",
    },
    background: bg(1),
    layers: [layer(1, "scene-bright", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "chime",
      to: "scene-bright",
      hotspot: { x: 16, y: 2, w: 28, h: 30 }, // moon, upper-left
    },
    extras: [
      { flash: "window-peek", sfx: "mew", hotspot: { x: 35, y: 54, w: 11, h: 18 } }, // left house window
      { flash: "leaves-swirl", sfx: "rustle", hotspot: { x: 20, y: 78, w: 20, h: 18 } }, // left leaf pile
    ],
  },
  {
    id: 2,
    text: { zh: "小兔要穿南瓜装！", en: "Little Rabbit's costume is a pumpkin!" },
    background: bg(2),
    layers: [layer(2, "scene-ready", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "rustle",
      to: "scene-ready",
      hotspot: { x: 57, y: 12, w: 24, h: 54 }, // costume on the hook
    },
    extras: [
      { flash: "window-bright", sfx: "chime", hotspot: { x: 17, y: 7, w: 22, h: 40 } }, // window + moon, left
      { flash: "mirror-ghost", sfx: "whoosh", hotspot: { x: 81, y: 26, w: 17, h: 24 } }, // round mirror, right
      { flash: "boots-hop", sfx: "tap", hotspot: { x: 9, y: 70, w: 17, h: 20 } }, // boots by the door
    ],
  },
  {
    id: 3,
    text: { zh: "小兔穿上南瓜装。", en: "Little Rabbit puts it on." },
    // 小兔 is composited into the plate; the tap warms the whole scene (the
    // costume "lights up"). A separate keyed rabbit layer + per-character glow
    // is a later refinement (cutout kept at
    // little-rabbit-style/scenes/approved/rabbit-costume-cutout.png).
    background: bg(3),
    layers: [],
    interaction: {
      kind: "glow",
      sfx: "sparkle",
      hotspot: { x: 33, y: 22, w: 34, h: 60 }, // 小兔, centre
    },
    extras: [
      { flash: "moon-bright", sfx: "chime", hotspot: { x: 3, y: 16, w: 14, h: 42 } }, // window + moon, far left
      { flash: "lamp-flare", sfx: "flare", hotspot: { x: 54, y: 44, w: 16, h: 24 } }, // bedside lamp
      { flash: "bed-lump", sfx: "whump", hotspot: { x: 74, y: 42, w: 25, h: 46 } }, // the bed, right
    ],
  },
  {
    id: 4,
    text: {
      zh: "小兔准备好去要糖了。",
      en: "Little Rabbit is ready to go trick-or-treat.",
    },
    background: bg(4),
    layers: [layer(4, "scene-open", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "creak",
      to: "scene-open",
      hotspot: { x: 48, y: 8, w: 34, h: 76 }, // the door + 小兔's paw on the handle
    },
    extras: [
      { flash: "light-flare", sfx: "flare", hotspot: { x: 40, y: 0, w: 20, h: 16 } }, // ceiling light
      { flash: "scarf-sway", sfx: "rustle", hotspot: { x: 21, y: 22, w: 14, h: 42 } }, // scarf on the hook
      { flash: "mouse-peek", sfx: "squeak", hotspot: { x: 17, y: 78, w: 12, h: 19 } }, // mouse peeking from the baseboard hole, bottom-left
    ],
  },
  {
    id: 5,
    text: {
      zh: "小兔去敲猫叔叔的门。",
      en: "Little Rabbit knocks on Mr. Cat's door.",
    },
    secondaryText: CHANT,
    // The plate has 小兔 knocking at the closed door; "scene-open" is the same
    // frame with the door open and 小猫 in the doorway offering a sticker.
    background: bg(5),
    layers: [layer(5, "scene-open", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "knock",
      to: "scene-open",
      hotspot: { x: 50, y: 14, w: 28, h: 60 }, // the door + knocking paw
      afterOpen: CAT_STICKER,
    },
    extras: [
      { flash: "moon-bright", sfx: "chime", openVariant: true, hotspot: { x: 13, y: 4, w: 22, h: 24 } }, // moon, upper-left
      { flash: "pumpkin-bright", sfx: "pop", openVariant: true, hotspot: { x: 67, y: 67, w: 15, h: 24 } }, // porch jack-o'-lantern
      { flash: "bush-hog", sfx: "rustle", openVariant: true, hotspot: { x: 3, y: 60, w: 32, h: 24 } }, // bushes, lower-left
    ],
  },
  {
    id: 6,
    text: {
      zh: "猫叔叔给小兔一张贴纸。",
      en: "Mr. Cat gives Little Rabbit one sticker.",
    },
    background: bg(6),
    layers: [],
    interaction: CAT_STICKER,
    extras: [
      { flash: "moon-bright", sfx: "chime", hotspot: { x: 16, y: 3, w: 13, h: 20 } }, // moon, upper-left
      { flash: "cat-tail", sfx: "purr", hotspot: { x: 62, y: 34, w: 11, h: 36 } }, // 小猫's tail, curls up
      { flash: "window-kitten", sfx: "mew", hotspot: { x: 81, y: 24, w: 12, h: 32 } }, // right-side window
      { flash: "pumpkin-bright", sfx: "pop", hotspot: { x: 67, y: 68, w: 14, h: 22 } }, // porch pumpkin
    ],
  },
  {
    id: 7,
    text: {
      zh: "小兔去敲熊阿姨的门。",
      en: "Little Rabbit knocks on Ms. Bear's door.",
    },
    secondaryText: CHANT,
    background: bg(7),
    layers: [layer(7, "scene-open", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "knock",
      to: "scene-open",
      hotspot: { x: 46, y: 12, w: 30, h: 62 }, // arched door + knocking paw
      afterOpen: BEAR_STICKERS,
    },
    extras: [
      { flash: "moon-bright", sfx: "chime", openVariant: true, hotspot: { x: 9, y: 3, w: 13, h: 20 } }, // moon, upper-left
      // Page 8's frame is this same open-door scene, so the wave is shared.
      { flash: "bear-wave", sfx: "pop", openOnly: true, src: "/pages/08/bear-wave.webp", hotspot: { x: 60, y: 30, w: 16, h: 52 } }, // 小熊, once the door is open
      { flash: "lantern-bright", sfx: "flare", openVariant: true, hotspot: { x: 75, y: 12, w: 16, h: 34 } }, // paper lantern, right
      { flash: "tree-leaves", sfx: "rustle", openVariant: true, hotspot: { x: 18, y: 16, w: 24, h: 48 } }, // autumn tree, left
      { flash: "hedge-hog", sfx: "rustle", openVariant: true, hotspot: { x: 0, y: 62, w: 38, h: 24 } }, // the hedge, left
    ],
  },
  {
    id: 8,
    text: {
      zh: "熊阿姨给小兔两张贴纸。",
      en: "Ms. Bear gives Little Rabbit two stickers.",
    },
    background: bg(8),
    layers: [],
    interaction: BEAR_STICKERS,
    extras: [
      { flash: "moon-bright", sfx: "chime", hotspot: { x: 9, y: 3, w: 13, h: 20 } }, // moon, upper-left
      { flash: "bear-wave", sfx: "pop", hotspot: { x: 60, y: 30, w: 16, h: 52 } }, // 小熊, head to feet (a tap on a held-out sticker still takes the sticker)
      { flash: "lantern-bright", sfx: "flare", hotspot: { x: 75, y: 12, w: 16, h: 34 } }, // paper lantern
      { flash: "tree-leaves", sfx: "rustle", hotspot: { x: 18, y: 14, w: 24, h: 48 } }, // autumn tree
    ],
  },
  {
    id: 9,
    text: { zh: "最后一扇门啦！", en: "One last door!" },
    secondaryText: CHANT,
    background: bg(9),
    layers: [layer(9, "scene-open", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "knock",
      to: "scene-open",
      hotspot: { x: 45, y: 42, w: 22, h: 42 }, // the door + moon knocker + reaching paw
      afterOpen: OWL_STICKERS,
    },
    extras: [
      { flash: "moon-bright", sfx: "chime", openVariant: true, hotspot: { x: 4, y: 4, w: 20, h: 24 } }, // moon, upper-left
      // Page 10's frame is this same open-door scene, so the peek is shared.
      { flash: "owl-peek", sfx: "hoo", openOnly: true, src: "/pages/10/owl-peek.webp", hotspot: { x: 54, y: 57, w: 12, h: 31 } }, // 猫头鹰, once the door is open
      { flash: "window-owlet", sfx: "hoo", openVariant: true, hotspot: { x: 71, y: 52, w: 12, h: 20 } }, // lower round window
      { flash: "mailbox-bat", sfx: "flutter", openVariant: true, hotspot: { x: 61, y: 71, w: 11, h: 15 } }, // the mailbox
    ],
  },
  {
    id: 10,
    text: {
      zh: "猫头鹰姐姐给小兔三张贴纸。",
      en: "Miss Owl gives Little Rabbit three stickers.",
    },
    background: bg(10),
    layers: [],
    interaction: OWL_STICKERS,
    extras: [
      { flash: "moon-bright", sfx: "chime", hotspot: { x: 4, y: 4, w: 20, h: 24 } }, // moon, upper-left
      { flash: "owl-peek", sfx: "hoo", hotspot: { x: 54, y: 57, w: 12, h: 31 } }, // 猫头鹰, head to feet (a held-out sticker still wins a tap)
      { flash: "candle-flare", sfx: "flare", hotspot: { x: 64, y: 57, w: 8, h: 14 } }, // candle on the shelf
    ],
  },
  {
    id: 11,
    text: {
      zh: "我们来数一数小兔有多少张贴纸吧。",
      en: "Let's count how many stickers Little Rabbit has.",
    },
    background: bg(11),
    layers: [],
    interaction: {
      kind: "stick",
      sfx: "count",
      count: 6,
      counting: true,
      stickers: ["pumpkin", "ghost", "bat", "star", "moon", "cat"],
      hotspot: { x: 27, y: 78, w: 48, h: 18 }, // the row of six stickers on the floor
      slots: [
        { x: 32.7, y: 79 },
        { x: 40.2, y: 79 },
        { x: 48.8, y: 79 },
        { x: 56.8, y: 79 },
        { x: 63.6, y: 79 },
        { x: 70.3, y: 79 },
      ],
    },
    extras: [
      { flash: "window-bright", sfx: "chime", hotspot: { x: 55, y: 0, w: 23, h: 42 } }, // window + moon, top-right
      { flash: "lamp-flare", sfx: "flare", hotspot: { x: 20, y: 22, w: 16, h: 42 } }, // lamp on the stool, left
      { flash: "ghost-stretch", sfx: "yawn", hotspot: { x: 60, y: 61, w: 15, h: 19 } }, // sleeping ghost, right of 小兔
    ],
  },
  {
    id: 12,
    text: {
      zh: "小兔玩得很开心，现在该睡觉了。晚安！",
      en: "Little Rabbit enjoyed Halloween, but now it's time to sleep. Good night!",
    },
    background: bg(12),
    layers: [layer(12, "scene-off", { className: "swap-to", ext: "webp" })],
    interaction: {
      kind: "swap",
      sfx: "lullaby",
      to: "scene-off",
      hotspot: { x: 73, y: 35, w: 10, h: 27 }, // the bedside lamp
    },
    extras: [
      { flash: "moon-glow", sfx: "chime", openVariant: true, hotspot: { x: 58, y: 0, w: 17, h: 38 } }, // window + moon, top-right
      { flash: "bag-glimmer", sfx: "chime", openVariant: true, hotspot: { x: 81, y: 43, w: 11, h: 22 } }, // sticker bag on the nightstand
      { flash: "slippers-tuck", sfx: "tap", openVariant: true, hotspot: { x: 65, y: 81, w: 14, h: 15 } }, // bunny slippers, bottom-centre
    ],
  },
];

export const LAST_PAGE_INDEX = PAGES.length; // step 0 = title card, 1..12 = pages
