#!/usr/bin/env node
/**
 * Slice the 6 stickers out of the approved sticker sheet into small sprites for
 * the treat / counting pages.
 *
 *   node tools/stickers.mjs
 *
 * The sheet's stickers already have thick white die-cut borders, so we just crop
 * each one tight (a hair of cream survives in the corners — invisible at the
 * ~44 px display size, and CSS rounds the corners) and export as WebP. No alpha
 * keying — flood-filling a JPEG left banding artifacts.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SHEET =
  "/Users/lizama/ai-sandbox/little-rabbit-style/scenes/approved/sticker-sheet.jpeg";
const OUT = "public/stickers";

// Tight boxes on the 2752×1536 sheet — just outside each white die-cut border.
const BOXES = {
  pumpkin: { left: 150, top: 560, width: 360, height: 430 },
  ghost: { left: 590, top: 555, width: 330, height: 440 },
  bat: { left: 960, top: 600, width: 430, height: 340 },
  star: { left: 1450, top: 585, width: 380, height: 380 },
  moon: { left: 1885, top: 570, width: 355, height: 410 },
  cat: { left: 2275, top: 555, width: 380, height: 440 },
};

await mkdir(OUT, { recursive: true });
for (const [name, box] of Object.entries(BOXES)) {
  await sharp(SHEET)
    .extract(box)
    .resize({ width: 300, height: 300, fit: "inside" })
    .webp({ quality: 92 })
    .toFile(`${OUT}/${name}.webp`);
  console.log(`  ${name}.webp`);
}
console.log("done →", OUT);
