#!/usr/bin/env python3
"""
Local (no image-generation) patches for the easter-egg frames.

  python3 tools/patch-frames.py

1. Open-door variants. On the knock pages (5, 7, 9) every easter-egg frame is a
   variant of the *closed*-door plate, so tapping one after the door has opened
   would fade the door shut. For each of those we build `<frame>-open.webp`: the
   open-door scene with the same change (moon glow, lit pumpkin, …) transplanted
   onto it. PageView picks these when `ExtraTap.openVariant` is set and the page
   is open.
2. Moon glows for pages that had no moon reaction (6, 7, 8) — a warm halo and a
   brighter moon over the plate's own moon.

Re-run this after re-drawing any plate or frame it reads from.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "pages"


def load(page: int, name: str) -> Image.Image:
    return Image.open(ROOT / f"{page:02d}" / f"{name}.webp").convert("RGB")


def save(img: Image.Image, page: int, name: str) -> None:
    img.save(ROOT / f"{page:02d}" / f"{name}.webp", quality=88, method=6)
    print("wrote", f"pages/{page:02d}/{name}.webp")


def smoothstep(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def transplant(page: int, frame: str, out_name: str, opened_name="scene-open", lo=12, hi=32) -> None:
    """open scene + (frame − closed plate), weighted by where the frame changed."""
    plate = load(page, "background")
    opened = np.array(load(page, opened_name)).astype(float)
    fr = load(page, frame)
    # Where did this frame change the closed plate? (soft mask, noise-tolerant)
    blur = lambda im: np.array(im.filter(ImageFilter.GaussianBlur(2))).astype(float)
    change = np.abs(blur(fr) - blur(plate)).sum(2)
    w = smoothstep(change, lo, hi)
    w = np.array(Image.fromarray((w * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float) / 255
    delta = np.array(fr).astype(float) - np.array(plate).astype(float)
    out = opened + delta * w[..., None]
    save(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), page, out_name)


def moon_glow(page: int, src: str, out_name: str, region) -> None:
    """Warm halo + brighter fill over the moon found inside `region` (full-res px)."""
    bg = load(page, src)
    W, H = bg.size
    a = np.array(bg).astype(float)
    x0, y0, x1, y1 = region
    reg = a[y0:y1, x0:x1]
    mask = ((reg[..., 0] > 215) & (reg[..., 1] > 190) & (reg[..., 2] > 130)).astype(np.uint8) * 255
    full = np.zeros((H, W), np.uint8)
    full[y0:y1, x0:x1] = mask
    m = Image.fromarray(full)
    ys, xs = np.where(full > 0)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    disc = Image.new("L", (W, H), 0)
    ImageDraw.Draw(disc).ellipse([cx - 85, cy - 85, cx + 85, cy + 85], fill=255)
    halo = np.array(disc.filter(ImageFilter.GaussianBlur(60))).astype(float) / 255
    core = np.array(m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(22))).astype(float) / 255
    g = np.clip(halo * 0.9 + core * 1.0, 0, 1)[..., None]
    out = a + (np.array([255, 228, 150])[None, None, :] - a) * g * 0.85
    fill = (np.array(m.filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255)[..., None]
    out = out + (np.array([255, 248, 215]) - out) * fill * 0.85
    save(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), page, out_name)


def _dilate(m, n=1):
    for _ in range(n):
        o = m.copy()
        o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        m = o
    return m


def slippers_hop(src: str, out_name: str, lift=26) -> None:
    """Page 12: the bunny slippers hop up off the rug (the generated frame only nudged them
    a few pixels, which read as nothing). Cut them out, lift them, rebuild the rug under them."""
    from collections import deque

    img = load(12, src)
    a = np.array(img).astype(float)
    x0, y0, x1, y1 = 1340, 915, 1600, 1100
    sub = a[y0:y1, x0:x1]
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    cream = (r > 200) & (g > 165) & (b > 115) & (r - b < 120)
    if src != "background":  # lamp-off scene is darker: relax the cut-out thresholds
        cream = (b > 165) & (g > 140) & (r > 110) & (b > r)
    h, w = cream.shape
    lab = np.zeros((h, w), int)
    n = 0
    sizes = {}
    for y in range(h):
        for x in range(w):
            if cream[y, x] and not lab[y, x]:
                n += 1
                q = deque([(y, x)])
                lab[y, x] = n
                c = 0
                while q:
                    cy, cx = q.popleft()
                    c += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and cream[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n
                            q.append((ny, nx))
                sizes[n] = c
    body = np.isin(lab, [k for k, v in sizes.items() if v > 1500])
    m = _dilate(body, 3)
    out_ = np.zeros_like(m)
    out_[0] = out_[-1] = True
    out_[:, 0] = out_[:, -1] = True
    free = ~m
    o = out_ & free
    while True:
        nb = _dilate(o) & free
        if (nb == o).all():
            break
        o = nb
    m = _dilate(~o, 4)  # + the dark outline

    m_cut = m
    m = _dilate(m, 5)  # wider footprint for clearing the old spot
    res = a.copy()
    # rebuild the rug/floor where the slippers were (column-wise from the pixels above/below)
    for c in range(w):
        col = np.where(m[:, c])[0]
        if not len(col):
            continue
        for sg in np.split(col, np.where(np.diff(col) > 1)[0] + 1):
            ya, yb = sg[0] + y0, sg[-1] + y0 + 1
            bot = np.median(a[yb + 10:yb + 18, x0 + c], axis=0)
            top = np.median(a[max(ya - 6, 0):ya - 1, x0 + c], axis=0)
            # rug/floor colour from below; only the top fifth blends toward what's above
            t = np.clip((np.linspace(0, 1, yb - ya) - 0.8) / 0.2, 0, 1)[:, None] * 0
            res[ya:yb, x0 + c] = bot[None] * (1 - t) + top[None] * t
    patch = res[y0:y1, x0:x1].copy()
    blurred = np.array(Image.fromarray(np.clip(patch, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(float)
    hole = _dilate(m, 2)
    patch[hole] = blurred[hole]
    res[y0:y1, x0:x1] = patch
    # soft shadow left on the rug where they were
    sh = Image.new("L", img.size, 0)
    ys, xs = np.where(m)
    cx, cy = xs.mean() + x0, ys.max() + y0 - 6
    ImageDraw.Draw(sh).ellipse([cx - 95, cy - 12, cx + 95, cy + 14], fill=255)
    sh = np.array(sh.filter(ImageFilter.GaussianBlur(7))).astype(float)[..., None] / 255
    res = res * (1 - 0.18 * sh) + np.array([60, 40, 30]) * 0.18 * sh
    # paste the slippers back, lifted
    sprite = a[y0:y1, x0:x1]
    alpha = np.array(Image.fromarray((m_cut * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(float) / 255
    dst = res[y0 - lift:y1 - lift, x0:x1]
    res[y0 - lift:y1 - lift, x0:x1] = dst * (1 - alpha[..., None]) + sprite * alpha[..., None]
    save(Image.fromarray(np.clip(res, 0, 255).astype(np.uint8)), 12, out_name)


if __name__ == "__main__":
    # 1 — open-door variants of the existing frames
    for page, frames in {
        5: ["moon-bright", "pumpkin-bright", "bush-hog"],
        7: ["lantern-bright", "tree-leaves", "hedge-hog"],
        9: ["moon-bright", "window-owlet", "mailbox-bat"],
    }.items():
        for f in frames:
            transplant(page, f, f"{f}-open")

    # page 12: lamp-off variants of the other two frames, and the hopping slippers
    for f in ["moon-glow", "bag-glimmer"]:
        transplant(12, f, f"{f}-open", opened_name="scene-off")
    slippers_hop("background", "slippers-tuck")
    slippers_hop("scene-off", "slippers-tuck-open")

    # 2 — moon glows (the page 7 one exists for both the closed and open scene)
    moon_glow(7, "background", "moon-bright", (200, 50, 440, 260))
    moon_glow(7, "scene-open", "moon-bright-open", (200, 50, 440, 260))
    moon_glow(6, "background", "moon-bright", (330, 50, 600, 280))
    moon_glow(8, "background", "moon-bright", (200, 50, 440, 260))
