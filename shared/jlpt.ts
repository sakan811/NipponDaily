/**
 * Single source of truth for which JLPT levels NipponDaily has a seeded
 * pool for — mirrors shared/seasons.ts's SEASON_IDS pattern. Consumed by the
 * level-aware API endpoints (server/api/pool-vocab.get.ts, pool-kanji.get.ts,
 * daily-game.get.ts) to validate a `?level=` query param, and by
 * server/services/pool-data.ts to build per-level Redis keys.
 */
import type { JlptLevel } from "~~/types/index";

/** Ordered easiest-to-hardest, matching how the site presents them. N5 is
 *  the default level for every call site that doesn't specify one. */
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2"] as const;

export const DEFAULT_JLPT_LEVEL: JlptLevel = "N5";

export function isJlptLevel(value: unknown): value is JlptLevel {
  return (
    typeof value === "string" &&
    (JLPT_LEVELS as readonly string[]).includes(value)
  );
}
