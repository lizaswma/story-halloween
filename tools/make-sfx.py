#!/usr/bin/env python3
"""Synthesize the storybook sound effects into public/sfx/*.mp3.

Pure numpy + ffmpeg (libmp3lame); no samples, so there is nothing to license.
Every name here matches an `sfx:` in src/book.ts (see public/sfx/README.md).
Sounds are meant for a 2-3 year old: soft attacks, short, never startling.

    python3 tools/make-sfx.py              # all sounds
    python3 tools/make-sfx.py mew purr     # just these

Deterministic (fixed RNG seed), so re-running gives byte-identical audio.
"""
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
TARGET_RMS = 10 ** (-19 / 20)  # perceived level shared by all sounds
rng = np.random.default_rng(7)


# ── Building blocks ─────────────────────────────────────────────────────────
def time(dur):
    return np.arange(int(dur * SR)) / SR


def decay(t, tc, attack=0.004):
    """Linear attack then exponential decay (tc = time constant, seconds)."""
    return np.minimum(t / attack, 1.0) * np.exp(-t / tc)


def bell(t, pos, width):
    """Smooth 0→1→0 bump centred at `pos` (0–1 of the buffer)."""
    x = t / t[-1]
    return np.exp(-(((x - pos) / width) ** 2))


def osc(freq, wave_="sine"):
    """Oscillator following a per-sample frequency array (or a constant)."""
    phase = np.cumsum(np.broadcast_to(freq, freq.shape) / SR) if np.ndim(freq) else None
    if wave_ == "sine":
        return np.sin(2 * np.pi * phase)
    if wave_ == "saw":
        return 2 * (phase % 1.0) - 1
    raise ValueError(wave_)


def noise(n):
    return rng.standard_normal(n)


def svf(x, fc, q=1.0, mode="bp"):
    """State-variable filter; `fc` may be a per-sample array to sweep."""
    fc = np.broadcast_to(fc, x.shape)
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    damp = 1.0 / q
    low = band = 0.0
    out = np.empty_like(x)
    for i, xi in enumerate(x):
        low += f[i] * band
        high = xi - low - damp * band
        band += f[i] * high
        out[i] = band if mode == "bp" else low
    return out


def lowpass(x, fc):
    return svf(x, fc, 0.7, "lp")


def place(buf, part, at):
    i = int(at * SR)
    end = min(len(buf), i + len(part))
    buf[i:end] += part[: end - i]


def fade(x, fade_in=0.006, fade_out=0.03):
    x = x.copy()
    a, b = int(fade_in * SR), int(fade_out * SR)
    x[:a] *= np.linspace(0, 1, a)
    x[-b:] *= np.linspace(1, 0, b)
    return x


# ── The sounds ──────────────────────────────────────────────────────────────
def chime():
    """Three rising glockenspiel notes — stars twinkle / moon glints."""
    buf = np.zeros(int(1.3 * SR))
    for k, f in enumerate((1046.5, 1318.5, 1568.0)):
        t = time(0.9)
        note = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in ((1, 1), (2.0, 0.3), (3.0, 0.1)))
        place(buf, note * decay(t, 0.28, 0.006) * (0.7 + 0.15 * k), 0.13 * k)
    return buf, 0.5


def sparkle():
    """Scatter of tiny high pings."""
    buf = np.zeros(int(1.3 * SR))
    freqs = (1568, 1976, 2349, 2637, 3136, 3951)
    for at in np.sort(rng.uniform(0, 0.65, 14)):
        t = time(0.4)
        f = freqs[rng.integers(len(freqs))]
        place(buf, np.sin(2 * np.pi * f * t) * decay(t, 0.09) * rng.uniform(0.3, 1), at)
    return buf, 0.55


def rustle():
    """Dry leaves / fabric: band-passed noise in soft irregular lumps."""
    t = time(0.85)
    lumps = np.abs(lowpass(noise(len(t)), 14)) ** 1.2
    lumps /= lumps.max()
    body = svf(noise(len(t)), 3200, 0.9) * lumps * bell(t, 0.5, 0.35)
    return body, 0.55


def creak():
    """Slow door creak: jittery low pulse train through a sweeping resonance."""
    t = time(1.3)
    jitter = lowpass(noise(len(t)), 6) * 18
    f0 = 55 + 30 * bell(t, 0.55, 0.3) + jitter
    src = osc(np.maximum(f0, 20), "saw")
    voice = svf(src, 520 + 520 * bell(t, 0.55, 0.3), 6.0)
    voice = lowpass(voice, 2200)
    return voice * bell(t, 0.5, 0.32), 0.45


def knock():
    """Three soft wooden knocks."""
    buf = np.zeros(int(1.05 * SR))
    for k, at in enumerate((0.0, 0.3, 0.56)):
        t = time(0.3)
        tone = (
            np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.055)
            + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.035)
            + 0.25 * np.sin(2 * np.pi * 640 * t) * np.exp(-t / 0.02)
        )
        click = lowpass(noise(len(t)), 1400) * np.exp(-t / 0.004) * 0.6
        place(buf, (tone + click) * (1.0 - 0.1 * k), at)
    return buf, 0.6


def boop():
    """Round upward bloop — sticker onto the bag."""
    t = time(0.4)
    f = 420 + 230 * (1 - np.exp(-t / 0.05))
    tone = osc(f) + 0.2 * osc(f * 2)
    return tone * decay(t, 0.09, 0.006), 0.55


def count():
    """Clean little blip per sticker while counting."""
    t = time(0.3)
    return np.sin(2 * np.pi * 784 * t) * decay(t, 0.06, 0.005), 0.5


def flare():
    """Warm rising glow — lamp / lantern / candle brightening."""
    t = time(1.0)
    f = 300 + 700 * (t / t[-1]) ** 1.5
    pad = osc(f) + 0.35 * osc(f * 2) + 0.12 * osc(f * 3)
    air = svf(noise(len(t)), 800 + 3200 * (t / t[-1]), 1.2) * 0.35
    return (pad + air) * bell(t, 0.5, 0.28), 0.4


def pop():
    """Soft bubble pop."""
    t = time(0.25)
    f = 250 + 700 * np.exp(-t / 0.03)
    return osc(f) * decay(t, 0.05, 0.002), 0.55


def tap():
    """Tiny wooden tick."""
    t = time(0.2)
    tone = np.sin(2 * np.pi * 720 * t) + 0.4 * np.sin(2 * np.pi * 1450 * t)
    return tone * np.exp(-t / 0.022), 0.5


def whoosh():
    """Airy sweep — ghost drifting past."""
    t = time(0.9)
    x = t / t[-1]
    fc = 350 + 2200 * np.sin(np.pi * x) ** 1.3
    return svf(noise(len(t)), fc, 1.6) * bell(t, 0.5, 0.28), 0.55


def whump():
    """Soft low thud — someone flopping into bed."""
    t = time(0.5)
    f = 90 + 110 * np.exp(-t / 0.05)
    thump = (osc(f) + 0.3 * osc(f * 2)) * decay(t, 0.13, 0.004)
    puff = lowpass(noise(len(t)), 400) * np.exp(-t / 0.05) * 0.6
    return thump + puff, 0.6


def squeak():
    """Two tiny mouse squeaks."""
    buf = np.zeros(int(0.5 * SR))
    for at in (0.0, 0.17):
        t = time(0.11)
        f = 2000 + 700 * np.sin(np.pi * t / t[-1]) + 30 * np.sin(2 * np.pi * 45 * t)
        place(buf, (osc(f) + 0.25 * osc(f * 2)) * bell(t, 0.5, 0.4), at)
    return buf, 0.4


def _vowel(f0, formants, n, breath=0.0):
    """Sawtooth source through moving formants (each formant is an fc array)."""
    src = osc(f0, "saw")
    out = sum(svf(src, fc, q, "bp") * g for fc, q, g in formants)
    if breath:
        out = out + svf(noise(n), 1800, 1.0) * breath
    return out


def mew():
    """Kitten mew: rising-falling pitch, mouth opening then closing."""
    t = time(0.6)
    x = t / t[-1]
    f0 = 430 + 360 * np.sin(np.pi * x**0.75)
    open_ = np.sin(np.pi * x**0.8)
    formants = [(350 + 550 * open_, 5.0, 1.0), (1500 + 900 * open_, 6.0, 0.7)]
    voice = _vowel(f0, formants, len(t))
    return voice * fade(np.ones_like(t), 0.05, 0.12) * bell(t, 0.45, 0.6), 0.5


def purr():
    """Cat purr: low buzz gated at ~25 Hz."""
    t = time(1.4)
    buzz = osc(np.full_like(t, 85.0), "saw") + 0.5 * lowpass(noise(len(t)), 500)
    gate = (0.5 + 0.5 * np.sin(2 * np.pi * 25 * t)) ** 2
    body = lowpass(buzz, 700) * gate
    return body * bell(t, 0.5, 0.35), 0.55


def hoo():
    """Owl: two mellow 'hoo' notes."""
    buf = np.zeros(int(1.3 * SR))
    for at, base in ((0.0, 400.0), (0.5, 355.0)):
        t = time(0.42)
        f = base * (1 - 0.06 * t / t[-1])
        tone = osc(f) + 0.12 * osc(f * 2)
        place(buf, tone * fade(bell(t, 0.5, 0.3), 0.07, 0.1), at)
    return buf, 0.55


def yawn():
    """Big sleepy yawn: sinking pitch, mouth opens wide then closes."""
    t = time(1.5)
    x = t / t[-1]
    f0 = 270 - 110 * x
    open_ = np.sin(np.pi * x**0.9)
    formants = [(400 + 500 * open_, 4.0, 1.0), (1300 + 500 * open_, 5.0, 0.5)]
    voice = _vowel(f0, formants, len(t), breath=0.25)
    return voice * bell(t, 0.42, 0.32), 0.5


def flutter():
    """Bat wings: quick soft flaps."""
    t = time(0.75)
    flaps = np.maximum(0, np.sin(2 * np.pi * 15 * t)) ** 2
    air = svf(noise(len(t)), 1100, 1.0) + 0.6 * lowpass(noise(len(t)), 300)
    return air * flaps * bell(t, 0.5, 0.4), 0.55


def lullaby():
    """Music-box bedtime tune, slowing to a stop."""
    E, G, A, D, F, C = (329.63, 392.0, 440.0, 293.66, 349.23, 261.63)
    tune = [E, G, A, G, E, G, E, D, F, G, F, D, E, C]
    beats = [1] * 13 + [2]
    step, pos = 0.34, 0.0
    buf = np.zeros(int(10 * SR))
    for i, (f, b) in enumerate(zip(tune, beats)):
        f *= 2
        t = time(1.6)
        note = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in ((1, 1), (2, 0.28), (4, 0.1), (5.4, 0.04)))
        place(buf, note * decay(t, 0.5 + 0.1 * (b > 1), 0.004), pos)
        last = pos
        pos += step * b * (1 + 0.025 * i)  # gentle ritardando
    buf = buf[: int((last + 1.5) * SR)]
    return fade(buf, 0.01, 0.9), 0.4


SOUNDS = {fn.__name__: fn for fn in (
    chime, sparkle, rustle, creak, knock, boop, count, flare, pop, tap,
    whoosh, whump, squeak, mew, purr, hoo, yawn, flutter, lullaby,
)}


# ── Output ──────────────────────────────────────────────────────────────────
def render(name):
    x, peak = SOUNDS[name]()
    x = x / np.max(np.abs(x))
    loud = x[np.abs(x) > 0.02]  # RMS over the audible part, not the padding
    x = x * min(TARGET_RMS / np.sqrt(np.mean(loud**2)), peak)
    x = fade(x)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f"{name}.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
        mp3 = OUT / f"{name}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
             "-codec:a", "libmp3lame", "-b:a", "96k", "-ac", "1", str(mp3)],
            check=True,
        )
    print(f"{name:9s} {len(x) / SR:4.2f}s  {mp3.stat().st_size / 1024:5.1f} KB")


if __name__ == "__main__":
    names = sys.argv[1:] or list(SOUNDS)
    OUT.mkdir(parents=True, exist_ok=True)
    for n in names:
        render(n)
