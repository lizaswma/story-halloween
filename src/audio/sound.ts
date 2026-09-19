import { Howl, Howler } from "howler";
import { countSrc, narrationSrc, sfxSrc } from "../book";
import type { Language } from "../types";

// Central audio control (PRD §4.3, §7.2). All playback is best-effort: a missing
// file or a browser autoplay block must never throw into the render tree.

let muted = false;
let currentNarration: Howl | null = null;
const cache = new Map<string, Howl>();

export function setMuted(next: boolean) {
  muted = next;
  Howler.mute(next);
  if (next) stopNarration();
}

export function isMuted() {
  return muted;
}

// Narration streams via HTML5 audio; short SFX use Web Audio for tap-latency and
// so rapid re-taps overlap instead of restarting.
function load(src: string, html5 = true): Howl {
  let howl = cache.get(src);
  if (!howl) {
    howl = new Howl({ src: [src], preload: true, html5 });
    howl.on("loaderror", () => {
      /* placeholder assets not present yet — silent */
    });
    cache.set(src, howl);
  }
  return howl;
}

function safePlay(src: string, html5 = true) {
  if (muted) return;
  try {
    load(src, html5).play();
  } catch {
    /* ignore */
  }
}

export function playSfx(name: string) {
  safePlay(sfxSrc(name), false);
}

export function stopNarration() {
  try {
    currentNarration?.stop();
  } catch {
    /* ignore */
  }
  currentNarration = null;
}

/** Auto-plays on page turn and on tap-to-replay. */
export function playNarration(pageId: number, lang: Language) {
  stopNarration();
  if (muted) return;
  try {
    const howl = load(narrationSrc(pageId, lang));
    currentNarration = howl;
    howl.play();
  } catch {
    /* ignore */
  }
}

/** Counting page: speak the number in the active language (PRD §5 p11). */
export function playCount(n: number, lang: Language) {
  safePlay(countSrc(n, lang));
}

/** Warm the audio engine after the first user gesture (mobile autoplay policy). */
export function unlockAudio() {
  try {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === "suspended") ctx.resume();
  } catch {
    /* ignore */
  }
}
