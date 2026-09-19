import { useEffect, useRef, useState } from "react";
import type { ExtraTap, Page } from "../types";
import { useBook } from "../context/BookContext";
import { t } from "../i18n";
import {
  playCount,
  playNarration,
  playSfx,
  stopNarration,
} from "../audio/sound";
import { Layer } from "./Layer";

const pad = (n: number) => String(n).padStart(2, "0");

/** One story page: background + stacked layers + one big tap target (PRD §6). */
export function PageView({ page }: { page: Page }) {
  const { language, showText, given, markGiven, unmarkGiven } = useBook();
  const it = page.interaction;
  const extras = page.extras ?? [];

  const [opened, setOpened] = useState(false);
  // A counter, not a bool: the costume glow replays on every tap rather than
  // once per page visit, and each new value forces the CSS animations to
  // restart (see the effect below and the sparkle-burst `key`).
  const [glowBurst, setGlowBurst] = useState(0);
  const glowing = glowBurst > 0;
  const pageRef = useRef<HTMLDivElement>(null);
  const [twinkling, setTwinkling] = useState(false);
  // Which of the stickers on offer have been taken, in the order taken.
  const [taken, setTaken] = useState<number[]>([]);
  // Easter eggs mid-reaction (extra layer id → true); cleared on a timer so the
  // element can be tapped again right away.
  const [flashing, setFlashing] = useState<Record<string, boolean>>({});
  // The banner fades back after a few seconds so it stops covering the art; a
  // tap on it (or a page turn) brings it back. Parent-facing text only.
  const [bannerDim, setBannerDim] = useState(false);

  // Pending timers (banner fade + per-easter-egg reset), cleared on unmount so a
  // page turn can't fire state updates on the old page.
  const bannerTimer = useRef<number>();
  const flashTimers = useRef<Record<string, number>>({});
  useEffect(
    () => () => {
      window.clearTimeout(bannerTimer.current);
      Object.values(flashTimers.current).forEach(window.clearTimeout);
    },
    [],
  );

  // React reuses the DOM node across bursts since the className string is
  // unchanged once glowing (both before and after re-adding "is-glowing"), so
  // a remove → reflow → re-add is needed to make the CSS animation restart.
  useEffect(() => {
    if (glowBurst === 0) return;
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove("is-glowing");
    void el.offsetWidth;
    el.classList.add("is-glowing");
  }, [glowBurst]);

  // Narration auto-plays on page turn and whenever the language changes (PRD §4.1).
  useEffect(() => {
    playNarration(page.id, language);
    return () => stopNarration();
  }, [page.id, language]);

  // Reset + arm the banner auto-fade on every page turn.
  useEffect(() => {
    setBannerDim(false);
    window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setBannerDim(true), 4200);
  }, [page.id]);

  function wakeBanner() {
    setBannerDim(false);
    window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setBannerDim(true), 4200);
  }

  // The sticker interaction in play: the page's own, or — on a door page —
  // the one that takes over once the door is open and the stickers are held out.
  const stick =
    it.kind === "stick" ? it : it.kind === "swap" && opened ? it.afterOpen : undefined;
  // What the big tap target currently is (position + sound).
  const target = stick ?? it;

  // Stickers handed over on the door page are already in the bag on the sticker
  // page that follows (same set of sprites), so there is nothing left to tap.
  // `givenAtMount` is a snapshot so a hand-over that happens on this very page
  // still plays its fly-in rather than snapping into place.
  const [givenAtMount] = useState(given);
  const stickKey = stick && !stick.counting ? stick.stickers.join(",") : undefined;
  // Only the sticker page inherits a hand-over; a door page always starts fresh.
  const alreadyGiven =
    !!stick && stick === it && !!stickKey && givenAtMount.has(stickKey);
  const takenList = stick
    ? alreadyGiven
      ? Array.from({ length: stick.count }, (_, i) => i)
      : taken.slice(0, stick.count)
    : [];
  const placed = takenList.length;
  const done = !!stick && placed >= stick.count;
  useEffect(() => {
    if (stickKey && done) markGiven(stickKey);
  }, [stickKey, done, markGiven]);
  // Arriving at a door page clears any earlier hand-over of its stickers, so the
  // sticker page after it is only pre-filled if they're given on this visit.
  const doorKey =
    it.kind === "swap" && it.afterOpen
      ? it.afterOpen.stickers.join(",")
      : undefined;
  useEffect(() => {
    if (doorKey) unmarkGiven(doorKey);
  }, [doorKey, unmarkGiven]);

  // Send one of the stickers on offer to the bag (the given one, else the next).
  function takeSticker(pick?: number) {
    if (!stick || done) return;
    const left = stick.stickers.map((_, i) => i).filter((i) => !taken.includes(i));
    const idx = pick !== undefined && left.includes(pick) ? pick : left[0];
    playSfx(stick.sfx);
    if (stick.counting) playCount(taken.length + 1, language);
    setTaken([...taken, idx]);
  }

  function handleTap(e: React.MouseEvent<HTMLButtonElement>) {
    if (stick) {
      if (done) return;
      const left = stick.stickers.map((_, i) => i).filter((i) => !taken.includes(i));
      let pick = left[0];
      // With stickers held out, send the one nearest the tap.
      const stage = e.currentTarget.parentElement?.getBoundingClientRect();
      if (stick.hand && stage && (e.clientX || e.clientY)) {
        const tx = ((e.clientX - stage.x) / stage.width) * 100;
        const ty = ((e.clientY - stage.y) / stage.height) * 100;
        const dist = (i: number) =>
          Math.hypot(stick.hand![i].x - tx, stick.hand![i].y - ty);
        pick = left.reduce((a, b) => (dist(b) < dist(a) ? b : a), pick);
      }
      takeSticker(pick);
      return;
    }
    playSfx(target.sfx);
    switch (it.kind) {
      case "swap":
        setOpened(true);
        break;
      case "glow":
        setGlowBurst((n) => n + 1);
        break;
      case "twinkle":
        setTwinkling(true);
        break;
        break;
    }
  }

  function tapExtra(x: ExtraTap) {
    playSfx(x.sfx);
    setFlashing((f) => ({ ...f, [x.flash]: true }));
    // Re-tapping restarts the hold rather than letting an in-flight timer cut it short.
    window.clearTimeout(flashTimers.current[x.flash]);
    flashTimers.current[x.flash] = window.setTimeout(() => {
      setFlashing((f) => {
        const next = { ...f };
        delete next[x.flash];
        return next;
      });
      delete flashTimers.current[x.flash];
    }, x.hold ?? 900);
  }

  function layerClass(id: string): string {
    if (it.kind === "glow" && glowing && id === it.targetLayer)
      return "is-glowing";
    if (it.kind === "twinkle" && twinkling && id === it.targetLayer)
      return "is-twinkling";
    return "";
  }

  const pageGlowing = it.kind === "glow" && glowing && !it.targetLayer;

  return (
    <div
      ref={pageRef}
      className={`page ${pageGlowing ? "is-glowing" : ""}`}
      data-open={opened || undefined}
    >
      <Layer asset={page.background} className="background" />

      {page.layers.map((l) => {
        if (it.kind === "swap" && l.id === it.from)
          return <Layer key={l.id} asset={l} hidden={opened} />;
        if (it.kind === "swap" && l.id === it.to)
          return <Layer key={l.id} asset={l} hidden={!opened} />;
        if (l.onOpen) return <Layer key={l.id} asset={l} hidden={!opened} />;
        return <Layer key={l.id} asset={l} className={layerClass(l.id)} />;
      })}

      {/* A whole-scene tone shift alone reads as "nothing happened" — this
          starburst gives the tap an unmistakable, localized event. */}
      {pageGlowing && (
        <div
          key={glowBurst}
          className="sparkle-burst"
          style={{
            left: `${it.hotspot.x + it.hotspot.w / 2}%`,
            top: `${it.hotspot.y + it.hotspot.h / 2}%`,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            // Rotation is a static inline transform on this wrapper, not part
            // of the animated keyframes: Chrome fails to interpolate a
            // transform whose rotate() reads a CSS custom property, freezing
            // the animation on its first frame.
            <span
              key={i}
              className="sparkle-arm"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <span
                className="sparkle"
                style={{ animationDelay: `${i * 35}ms` }}
              />
            </span>
          ))}
        </div>
      )}

      {/* Easter-egg "reacted" frames: a full-frame variant of the plate cross-faded
          in for a moment on tap (PRD §6 "no dead taps"). */}
      {extras.map((x) => (
        <Layer
          key={x.flash}
          asset={{
            id: x.flash,
            src:
              x.src ??
              `/pages/${pad(page.id)}/${x.flash}${opened && x.openVariant ? "-open" : ""}.webp`,
          }}
          className="extra-flash"
          hidden={!flashing[x.flash]}
        />
      ))}

      {stick?.counting && (
        // The plate already shows the 6 stickers on the floor — tapping just
        // counts them: a numeral pops over each in turn.
        <div className="count-row">
          {Array.from({ length: placed }).map((_, i) => (
            <b
              className="count-num"
              key={i}
              style={
                stick.slots?.[i]
                  ? { left: `${stick.slots[i].x}%`, top: `${stick.slots[i].y}%` }
                  : undefined
              }
            >
              {i + 1}
            </b>
          ))}
        </div>
      )}
      {stick && !stick.counting && (
        // Stickers still in the hand sit as sprites; each tap sends one to the bag.
        <div className="sticker-bag">
          {stick.hand?.map((h, i) =>
            takenList.includes(i) ? null : (
              // A tap on the sticker itself takes it, even where an easter egg
              // (the bear, the owl) sits behind it.
              <button
                type="button"
                className="sticker-hand"
                key={`hand-${i}`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.w}%`,
                  height: `${h.h}%`,
                }}
                onClick={() => takeSticker(i)}
                aria-hidden="true"
                tabIndex={-1}
              >
                <img src={`/stickers/${stick.stickers[i]}.webp`} alt="" draggable={false} />
              </button>
            ),
          )}
          {takenList.map((idx, slot) => {
            const bag = stick.bag ?? {
              x: stick.hotspot.x + stick.hotspot.w / 2,
              y: stick.hotspot.y + stick.hotspot.h / 2,
            };
            const from = stick.hand?.[idx] ?? {
              x: stick.hotspot.x + stick.hotspot.w / 2,
              y: stick.hotspot.y + stick.hotspot.h / 2,
            };
            const spread = slot - (stick.stickers.length - 1) / 2;
            return (
              <span
                className={`sticker ${alreadyGiven ? "is-settled" : ""}`}
                key={`tok-${idx}`}
                style={
                  {
                    left: `${bag.x + spread * 3.4}%`,
                    top: `${bag.y - (slot % 2) * 2.6}%`,
                    "--from-x": `${from.x}%`,
                    "--from-y": `${from.y}%`,
                  } as React.CSSProperties
                }
              >
                <img src={`/stickers/${stick.stickers[idx]}.webp`} alt="" draggable={false} />
              </span>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className={`hotspot ${done ? "is-done" : ""}`}
        style={{
          left: `${target.hotspot.x}%`,
          top: `${target.hotspot.y}%`,
          width: `${target.hotspot.w}%`,
          height: `${target.hotspot.h}%`,
        }}
        onClick={handleTap}
        aria-label={t(page.text, language)}
      />

      {/* Easter-egg tap targets, above the main hotspot so they win on overlap. */}
      {extras
        .filter((x) => !x.openOnly || opened)
        .map((x) => (
        <button
          key={x.flash}
          type="button"
          className="hotspot extra-hotspot"
          style={{
            left: `${x.hotspot.x}%`,
            top: `${x.hotspot.y}%`,
            width: `${x.hotspot.w}%`,
            height: `${x.hotspot.h}%`,
          }}
          onClick={() => tapExtra(x)}
          aria-hidden="true"
          tabIndex={-1}
        />
      ))}

      <button
        type="button"
        className={`text-banner ${bannerDim ? "is-dim" : ""} ${
          showText ? "" : "text-hidden"
        }`}
        onClick={() => {
          playNarration(page.id, language);
          wakeBanner();
        }}
        aria-label={
          (language === "zh" ? "再听一次：" : "Play again: ") +
          t(page.text, language)
        }
      >
        <span className="replay-icon" aria-hidden="true">
          ▶
        </span>
        {showText && (
          <span className="banner-text">
            <span className="sentence">{t(page.text, language)}</span>
            {page.secondaryText && (
              <span className="chant">{t(page.secondaryText, language)}</span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
