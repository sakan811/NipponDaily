import { timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { siteThemeService } from "../../services/site-theme";
import { ok } from "../../utils/api-response";
import { getEnvOrConfig } from "../../utils/config";
import { seasonForDate } from "~~/shared/seasons";
import type { SiteTheme } from "~~/types/index";

/**
 * Vercel Cron target (see vercel.json) that sets the site-wide season to the
 * one whose months cover today's date in Japan. It runs at midnight JST
 * (`test/server/cron-schedule.test.ts` holds vercel.json to that). Vercel
 * sends `Authorization: Bearer $CRON_SECRET` on
 * scheduled requests when CRON_SECRET is configured; anything else gets 401.
 *
 * Idempotent: it only writes when the season actually changes.
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

  const season = seasonForDate();
  const previous = await siteThemeService.getActiveTheme();
  const changed = previous?.season !== season;

  if (changed) {
    const theme: SiteTheme = { season, updatedAt: Date.now(), source: "cron" };
    await siteThemeService.saveActiveTheme(theme);
  }

  return ok({ season, previousSeason: previous?.season ?? null, changed });
});
