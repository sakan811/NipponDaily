import type { SeasonId } from "~~/types/index";
import { DEFAULT_SEASON } from "~~/shared/seasons";

/**
 * Server-side entry point for the seasonal presets. The data itself lives in
 * shared/seasons.ts so the app (docs page, pre-hydration script) and the
 * server (MCP tools, GET /api/site-theme) can never disagree.
 */
export {
  SEASON_IDS,
  SEASONS,
  isSeasonId,
  seasonForDate,
} from "~~/shared/seasons";

/** Deterministic default used by GET /api/site-theme when no agent has set
 *  a theme yet — sakura is NipponDaily's base palette (see :root in
 *  tailwind.css), so it's also the default season. */
export function defaultSeason(): SeasonId {
  return DEFAULT_SEASON;
}
