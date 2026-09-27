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

/**
 * Vercel Cron target (see vercel.json) that pre-generates today's
 * DailyGame right at the UTC day boundary, instead of waiting for the
 * first `GET /api/daily-game` request of the day to build it on demand.
 * Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on
 * requests it triggers from this schedule when CRON_SECRET is configured
 * (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)
 * — the same bearer-token pattern server/api/mcp.ts uses.
 *
 * Idempotent: skips generation when the day's game already exists, and
 * saveDailyGame writes with Redis NX anyway, so a re-run (manual trigger,
 * retry) never overwrites a game a player may have already started.
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

export default defineEventHandler(async (event) => {
  if (!isAuthorized(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const date = todayUtc();
  let game = await poolDataService.getDailyGame(date);
  let created = false;

  if (!game) {
    const pool = await poolDataService.getFullPool();
    const recentGames = await poolDataService.getDailyGames(
      recentDates(date, REPEAT_AVOIDANCE_DAYS),
    );
    game = buildDailyGame(pool, date, recentGames);
    await poolDataService.saveDailyGame(game);
    created = true;
  }

  return {
    success: true,
    data: { date, created },
    timestamp: new Date().toISOString(),
  };
});
