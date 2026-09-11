// Data model for the storybook. See PRD.md §5 (story) and §6 (interactivity).

export type Language = "zh" | "en";

export type LocalizedText = Record<Language, string>;

export type Asset = {
  /** Stable id, also used as the placeholder label until real art exists. */
  id: string;
  /** Path under /public. */
  src: string;
  alt?: string;
  /** Extra class for positioning/animation. */
  className?: string;
  /** If true, this layer is hidden until the page's interaction "opens". */
  onOpen?: boolean;
};

/** A large, toddler-sized tap area over the art, in % of the stage. */
export type Hotspot = { x: number; y: number; w: number; h: number };

export type Interaction =
  | { kind: "twinkle"; sfx: string; hotspot: Hotspot; targetLayer: string }
  | { kind: "glow"; sfx: string; hotspot: Hotspot; targetLayer?: string }
  | {
      kind: "swap";
      sfx: string;
      hotspot: Hotspot;
      /** Layer shown before the tap. Omit for a plain reveal over the background. */
      from?: string;
      /** Layer shown after the tap. */
      to: string;
    }
  | {
      kind: "stick";
      sfx: string;
      hotspot: Hotspot;
      /** How many stickers land on the bag (1, 2, 3 … or 6 on the counting page). */
      count: number;
      /** Sticker sprite ids, in order (files under /public/stickers/<id>.webp). */
      stickers: string[];
      /** Counting page: speak the number and show the numeral on each tap. */
      counting?: boolean;
    };

/**
 * An "easter-egg" tap: a secondary element a toddler is likely to poke at.
 * It never gates progress and is never "wrong". Tapping cross-fades in a
 * full-frame "reacted" variant of the plate (the moon brightens, the lamp
 * flares…) for a beat, plus a soft sound. Repeatable forever. PRD §6.
 */
export type ExtraTap = {
  hotspot: Hotspot;
  sfx: string;
  /** Full-frame variant layer id under /pages/NN/ (e.g. "moon-bright"). */
  flash: string;
  /** How long the variant stays up, ms (default 900). */
  hold?: number;
};

export type Page = {
  id: number;
  text: LocalizedText;
  /** e.g. the trick-or-treat chant on the knock pages. */
  secondaryText?: LocalizedText;
  background: Asset;
  layers: Asset[];
  interaction: Interaction;
  /** Secondary tappable elements (PRD §6 "no dead taps"). */
  extras?: ExtraTap[];
};

export type TitleCard = {
  series: LocalizedText;
  title: LocalizedText;
  start: LocalizedText;
  background: Asset;
  layers: Asset[];
};
