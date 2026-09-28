import { timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { poolDataService } from "../../services/pool-data";
import { getEnvOrConfig } from "../../utils/config";
import {
  REPEAT_AVOIDANCE_DAYS,
  buildDailyGame,
  recentDates,
  todayUtc,
} from "../../utils/daily-game";
import { GAME_LEVELS } from "~~/shared/jlpt";
import type { DailyGameLevel } from "~~/types/index";

/**
 * Vercel Cron target (see vercel.json) that pre-generates today's
 * DailyGame for every level GAME_LEVELS lists (N5/N4/N3/N2, plus the merged
 * "ALL" round) right at the UTC day boundary, instead of waiting for each
 * level's first `GET /api/daily-game` request of the day to build it on
 * demand. Vercel automatically sends `Authorization: Bearer $CRON_SECRET`
 * on requests it triggers from this schedule when CRON_SECRET is configured
 * (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)
 * — the same bearer-token pattern server/api/mcp.ts uses.
 *
 * Idempotent per level: skips a level whose game already exists, and
 * saveDailyGame writes with Redis NX anyway, so a re-run (manual trigger,
 * retry) never overwrites a game a player may have already started. Levels
 * are generated independently (Promise.allSettled) so one level's failure
 * (e.g. an unseeded pool) never blocks the others from being pre-generated.
 */
function isAuthorized(event: H3Event): boolean {
  const expected = getEnvOrConfig("cronSecret", "CRON_SECRET");
  if (!expected) return false;

  const authHeader = getHeader(event, "authorization") || "";
  const provided = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Generates and persists `level`'s game for `date` if none exists yet.
 *  Returns whether it created one — false both when a game already existed
 *  and (via the caller's Promise.allSettled) implicitly on failure. */
async function generateIfMissing(
  date: string,
  level: DailyGameLevel,
): Promise<boolean> {
  const existing = await poolDataService.getDailyGame(date, level);
  if (existing) return false;

  const pool = await poolDataService.getFullPool(level);
  const recentGames = await poolDataService.getDailyGames(
    recentDates(date, REPEAT_AVOIDANCE_DAYS),
    level,
  );
  const game = buildDailyGame(pool, date, recentGames, level);
  await poolDataService.saveDailyGame(game);
  return true;
}

export default defineEventHandler(async (event) => {
  if (!isAuthorized(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const date = todayUtc();
  const settled = await Promise.allSettled(
    GAME_LEVELS.map((level) => generateIfMissing(date, level)),
  );
  const results = GAME_LEVELS.map((level, i) => {
    const outcome = settled[i]!;
    return outcome.status === "fulfilled"
      ? { level, created: outcome.value }
      : {
          level,
          created: false,
          error:
            outcome.reason instanceof Error
              ? outcome.reason.message
              : "Unknown error",
        };
  });

  return {
    success: true,
    data: { date, results },
    timestamp: new Date().toISOString(),
  };
});
