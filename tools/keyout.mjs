#!/usr/bin/env node
/**
 * keyout.mjs — turn a Gemini scene/sprite render (opaque JPEG on a flat paper
 * background, or on the model's fake "transparency" checkerboard) into a
 * full-frame transparent PNG that drops straight in as a <Layer>.
 *
 * Method: flood-fill inward from the image border, clearing every pixel that
 * stays close to the sampled background colour. Interior pixels that happen to
 * match the background (e.g. a white highlight on the subject) are kept because
 * they are not connected to the edge.
 *
 * Usage:
 *   node tools/keyout.mjs in.jpeg out.png [--tol 32] [--feather 1] [--crop]
 *     --tol      colour distance that still counts as background (default 34)
 *     --feather  px of alpha blur at the matte edge (default 1)
 *     --crop     also trim to the content bbox (default: keep full frame)
 */
import sharp from "sharp";

const [, , inPath, outPath, ...rest] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: node tools/keyout.mjs in.jpeg out.png [--tol N] [--feather N] [--crop]");
  process.exit(1);
}
const opt = (name, def) => {
  const i = rest.indexOf(name);
  return i === -1 ? def : Number(rest[i + 1]);
};
const TOL = opt("--tol", 34);
const FEATHER = opt("--feather", 1);
const CROP = rest.includes("--crop");

const src = sharp(inPath).ensureAlpha();
const { width: W, height: H } = await src.metadata();
const { data } = await src.raw().toBuffer({ resolveWithObject: true });
// data is RGBA, W*H*4

const idx = (x, y) => (y * W + x) * 4;

// Sample the background from a ring of border pixels (median per channel).
const samples = [];
for (let x = 0; x < W; x += Math.max(1, (W / 200) | 0)) {
  samples.push([x, 0], [x, H - 1]);
}
for (let y = 0; y < H; y += Math.max(1, (H / 200) | 0)) {
  samples.push([0, y], [W - 1, y]);
}
const med = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
const bg = [0, 1, 2].map((c) => med(samples.map(([x, y]) => data[idx(x, y) + c])));

const dist2 = (i) => {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db;
};
const T2 = TOL * TOL;

// BFS flood fill from every border pixel.
const cleared = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) {
  stack.push(x, 0, x, H - 1);
}
for (let y = 0; y < H; y++) {
  stack.push(0, y, W - 1, y);
}
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const p = y * W + x;
  if (cleared[p]) continue;
  if (dist2(idx(x, y)) > T2) continue;
  cleared[p] = 1;
  stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}

let minX = W, minY = H, maxX = 0, maxY = 0;
for (let p = 0; p < W * H; p++) {
  if (cleared[p]) {
    data[p * 4 + 3] = 0;
  } else {
    const x = p % W, y = (p / W) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

let out = sharp(data, { raw: { width: W, height: H, channels: 4 } });

if (FEATHER > 0) {
  // Blur only the alpha channel a touch to soften the matte edge.
  const alpha = Buffer.alloc(W * H);
  for (let p = 0; p < W * H; p++) alpha[p] = data[p * 4 + 3];
  const blurred = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
    .blur(FEATHER)
    .raw()
    .toBuffer();
  for (let p = 0; p < W * H; p++) data[p * 4 + 3] = Math.min(data[p * 4 + 3], blurred[p]);
  out = sharp(data, { raw: { width: W, height: H, channels: 4 } });
}

if (CROP && maxX >= minX) {
  out = out.extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
}

await out.png().toFile(outPath);
console.log(
  `keyed ${inPath} → ${outPath}  bg≈rgb(${bg.join(",")})  content ${maxX - minX + 1}×${maxY - minY + 1}` +
    (CROP ? " (cropped)" : " (full frame)"),
);
