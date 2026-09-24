import type { SeasonId } from "~~/types/index";

/**
 * Closed set of implemented seasonal presets — the MCP server's
 * save_site_theme tool only accepts one of these (see server/api/mcp.ts).
 * Extend this (and add matching [data-season="..."] palette + shape blocks
 * to app/assets/css/tailwind.css) to add a new season; never ship a preset
 * here before its CSS exists.
 */
export const SEASON_IDS = [
  "sakura",
  "summer",
  "autumn",
  "winter",
] as const satisfies readonly SeasonId[];

export interface SeasonInfo {
  id: SeasonId;
  label: string;
  /** Calendar months (1-12, Japan Standard Time) this preset belongs to. */
  months: number[];
  /** One-line description of the palette + shape language, for the agent. */
  motif: string;
}

/**
 * Human/agent-readable description of each preset. Surfaced verbatim by the
 * MCP get_active_theme tool so the theme agent never has to guess which
 * season a date maps to.
 */
export const SEASONS: Record<SeasonId, SeasonInfo> = {
  sakura: {
    id: "sakura",
    label: "Spring (sakura)",
    months: [3, 4, 5],
    motif:
      "Cherry-blossom rose and sage; soft petal-shaped cards, pill buttons, falling petals.",
  },
  summer: {
    id: "summer",
    label: "Summer (natsu)",
    months: [6, 7, 8],
    motif:
      "Asagi sea-teal and asagao violet; seigaiha wave edges, droplet accents, rising fireflies.",
  },
  autumn: {
    id: "autumn",
    label: "Autumn (koyo)",
    months: [9, 10, 11],
    motif:
      "Momiji red-orange and ginkgo gold; leaf-cut asymmetric corners, falling maple leaves, tsukimi moon at night.",
  },
  winter: {
    id: "winter",
    label: "Winter (fuyu)",
    months: [12, 1, 2],
    motif:
      "Ai indigo and silver wisteria; crisp frosted panels, hexagonal snow-crystal badges, falling snow.",
  },
};

/** Month (1-12) of the given instant in Japan Standard Time (UTC+9, no DST). */
function jstMonth(date: Date): number {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCMonth() + 1;
}

/** The preset whose months cover `date` in JST. */
export function seasonForDate(date: Date = new Date()): SeasonId {
  const month = jstMonth(date);
  const match = SEASON_IDS.find((id) => SEASONS[id].months.includes(month));
  return match ?? defaultSeason();
}

/** Deterministic default used by GET /api/site-theme when no agent has set
 *  a theme yet — sakura is NipponDaily's base palette (see :root in
 *  tailwind.css), so it's also the default season. */
export function defaultSeason(): SeasonId {
  return "sakura";
}
