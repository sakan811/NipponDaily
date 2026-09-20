import type { SeasonId } from "~~/types/index";

/**
 * Closed set of implemented seasonal presets — the MCP server's
 * save_site_theme tool only accepts one of these (see server/api/mcp.ts).
 * Extend this (and add a matching [data-season="..."] block to
 * app/assets/css/tailwind.css) to add a new season; deliberately starts
 * with just the current one rather than shipping unstyled presets.
 */
export const SEASON_IDS = [
  "sakura",
  "autumn",
] as const satisfies readonly SeasonId[];

/** Deterministic default used by GET /api/site-theme when no agent has set
 *  a theme yet — sakura is NipponDaily's base palette (see :root in
 *  tailwind.css), so it's also the default season. */
export function defaultSeason(): SeasonId {
  return "sakura";
}
