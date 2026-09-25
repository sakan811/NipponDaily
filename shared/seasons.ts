import type { SeasonId } from "../types/index";

/**
 * Single source of truth for NipponDaily's seasonal presets — shared by the
 * MCP server (tool schema + get_active_theme payload), GET /api/site-theme,
 * the pre-hydration script in nuxt.config.ts, and the Color Palette docs
 * page. The actual CSS values live in app/assets/css/tailwind.css;
 * test/unit/seasons-css-sync.test.ts fails if a swatch below drifts from it.
 *
 * To add a season: add its [data-season="..."] palette + shape blocks to
 * tailwind.css, then add it here (and to the SeasonId union).
 */

export interface Swatch {
  /** Pigment / colour name shown in the docs. */
  name: string;
  /** The family's 500 value, lowercase #rrggbb. */
  hex: string;
}

export type PaletteRole =
  "primary" | "secondary" | "success" | "warning" | "error";

export const PALETTE_ROLES: readonly PaletteRole[] = [
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
];

export type SeasonPalette = Record<PaletteRole, Swatch>;

export interface SeasonPreset {
  id: SeasonId;
  label: string;
  /** Emoji for light / dark mode, matching .season-glyph in tailwind.css. */
  glyph: { light: string; dark: string };
  /** Calendar months (1-12, Japan Standard Time) this preset belongs to. */
  months: readonly number[];
  /** One-line description of the palette + shape language, for the agent. */
  motif: string;
  palette: { light: SeasonPalette; dark: SeasonPalette };
}

// Semantic sets shared by several seasons (the base :root / .dark values).
const BASE_LIGHT_STATES = {
  success: { name: "Herbal Green", hex: "#559e4e" },
  warning: { name: "Sunset Gold", hex: "#d88b27" },
  error: { name: "Vermilion", hex: "#e03e3e" },
} satisfies Partial<SeasonPalette>;

const BASE_DARK_STATES = {
  success: { name: "Emerald", hex: "#10b981" },
  warning: { name: "Yellow", hex: "#eab308" },
  error: { name: "Rose", hex: "#f43f5e" },
} satisfies Partial<SeasonPalette>;

export const SEASONS: Record<SeasonId, SeasonPreset> = {
  sakura: {
    id: "sakura",
    label: "Spring (sakura)",
    glyph: { light: "🌸", dark: "🌸" },
    months: [3, 4, 5],
    motif:
      "Cherry-blossom rose and sage; petal cards with a scooped notch tip, pill buttons, falling petals.",
    palette: {
      light: {
        primary: { name: "Deep Rose", hex: "#d2385a" },
        secondary: { name: "Sage Leaf", hex: "#7e957a" },
        ...BASE_LIGHT_STATES,
      },
      dark: {
        primary: { name: "Luminous Teal", hex: "#16b385" },
        secondary: { name: "Evening Orchid", hex: "#a957a9" },
        ...BASE_DARK_STATES,
      },
    },
  },
  summer: {
    id: "summer",
    label: "Summer (natsu)",
    glyph: { light: "🎐", dark: "🎆" },
    months: [6, 7, 8],
    motif:
      "Asagi sea-teal and asagao violet; squircle pebble panels, droplet buttons, wave-edged cards, rising fireflies.",
    palette: {
      light: {
        primary: { name: "Asagi Sea-Teal", hex: "#1a7f95" },
        secondary: { name: "Asagao Violet", hex: "#7a5cc0" },
        ...BASE_LIGHT_STATES,
      },
      dark: {
        primary: { name: "Lagoon Aqua", hex: "#1fa9bf" },
        secondary: { name: "Twilight Asagao", hex: "#9a7ee0" },
        ...BASE_DARK_STATES,
      },
    },
  },
  autumn: {
    id: "autumn",
    label: "Autumn (koyo)",
    glyph: { light: "🍁", dark: "🎑" },
    months: [9, 10, 11],
    motif:
      "Momiji red-orange and ginkgo gold; bevel-cut leaf cards and tag buttons/badges, falling maple leaves, tsukimi moon at night.",
    palette: {
      light: {
        primary: { name: "Momiji", hex: "#d26b38" },
        secondary: { name: "Icho Gold", hex: "#d1911f" },
        success: { name: "Matcha", hex: "#6da446" },
        warning: { name: "Kabocha", hex: "#cc751e" },
        error: { name: "Kurenai", hex: "#d02539" },
      },
      dark: {
        primary: { name: "Ember", hex: "#b35516" },
        secondary: { name: "Burnished Ginkgo", hex: "#a8781f" },
        success: { name: "Forest Moss", hex: "#48a630" },
        warning: { name: "Ember Amber", hex: "#e89417" },
        error: { name: "Garnet", hex: "#c62f48" },
      },
    },
  },
  winter: {
    id: "winter",
    label: "Winter (fuyu)",
    glyph: { light: "❄️", dark: "❄️" },
    months: [12, 1, 2],
    motif:
      "Ai indigo and silver wisteria; frosted octagonal panels, hexagonal buttons and badges, falling snow.",
    palette: {
      light: {
        primary: { name: "Ai Indigo", hex: "#34568f" },
        secondary: { name: "Fuji-nezumi", hex: "#938fba" },
        ...BASE_LIGHT_STATES,
      },
      dark: {
        primary: { name: "Moonlit Ice", hex: "#5b8fd6" },
        secondary: { name: "Silver Wisteria", hex: "#a39fc9" },
        ...BASE_DARK_STATES,
      },
    },
  },
};

/** Implemented presets, in calendar order starting from spring. */
export const SEASON_IDS = [
  "sakura",
  "summer",
  "autumn",
  "winter",
] as const satisfies readonly SeasonId[];

/** Season used when no agent has set one yet (the base :root palette). */
export const DEFAULT_SEASON: SeasonId = "sakura";

export function isSeasonId(value: unknown): value is SeasonId {
  return (
    typeof value === "string" &&
    (SEASON_IDS as readonly string[]).includes(value)
  );
}

/** Month (1-12) of the given instant in Japan Standard Time (UTC+9, no DST). */
function jstMonth(date: Date): number {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCMonth() + 1;
}

const SEASON_BY_MONTH = new Map<number, SeasonId>(
  SEASON_IDS.flatMap((id) => SEASONS[id].months.map((m) => [m, id] as const)),
);

/** The preset whose months cover `date` in JST. */
export function seasonForDate(date: Date = new Date()): SeasonId {
  return SEASON_BY_MONTH.get(jstMonth(date)) ?? DEFAULT_SEASON;
}

/** The neutral family is the shared canvas — identical in every season. */
export const NEUTRALS: { light: Swatch[]; dark: Swatch[] } = {
  light: [
    { name: "Cream Washi", hex: "#fdfbf7" },
    { name: "Bark Brown", hex: "#2e231c" },
  ],
  dark: [
    { name: "Midnight Slate", hex: "#0b0e14" },
    { name: "Ice Silver", hex: "#f3f5fa" },
  ],
};
