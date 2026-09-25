import { timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { n5DataService } from "../../services/n5-data";
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
  let game = await n5DataService.getDailyGame(date);
  let created = false;

  if (!game) {
    const pool = await n5DataService.getFullPool();
    const recentGames = await n5DataService.getDailyGames(
      recentDates(date, REPEAT_AVOIDANCE_DAYS),
    );
    game = buildDailyGame(pool, date, recentGames);
    await n5DataService.saveDailyGame(game);
    created = true;
  }

  return {
    success: true,
    data: { date, created },
    timestamp: new Date().toISOString(),
  };
});
