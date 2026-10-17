/**
 * What a response may be cached for. Every word, calendar, part and pattern
 * answer, and every server-rendered page, is the same for every reader until the
 * next midnight in Japan (the season is applied in the browser, never in the
 * HTML), so a CDN may keep it until then and no longer: the day's word opens
 * exactly at the moment the cached copy expires.
 */

import { PAST_DAY_CACHE_DAYS } from "~~/shared/endpoints";
import { DAY_MS, msUntilJstMidnight } from "~~/shared/jst";
import { API_PREFIX, ROUTES } from "~~/shared/routes";
import { todayJst } from "~~/shared/words";

/** Whole seconds from `now` to the next midnight in Japan, at least 1. */
export function secondsUntilJstMidnight(now: number = Date.now()): number {
  return Math.max(1, Math.ceil(msUntilJstMidnight(now) / 1000));
}

/** The day a page or answer is about, when the path names one: `/words/<date>`,
 *  or `?date=` on the word and related endpoints. */
function dayOf(path: string): string | undefined {
  const [pathname = "", query = ""] = path.split("?");
  const page = /^\/words\/(\d{4}-\d{2}-\d{2})$/.exec(pathname);
  if (page) return page[1];
  if (pathname !== ROUTES.dailyWord && pathname !== ROUTES.related) return;
  return new URLSearchParams(query).get("date") ?? undefined;
}

/** `s-maxage` only: shared caches keep it until midnight, a browser still
 *  revalidates, and there is no stale-while-revalidate, which would serve
 *  yesterday's word after the day had turned. A day that has already passed
 *  keeps longer (`PAST_DAY_CACHE_DAYS`): a crawler walks every one of them, and
 *  rendering the whole archive again each midnight is what spends the quota. */
export function dayCacheControl(
  now: number = Date.now(),
  path: string = "",
): string {
  const day = dayOf(path);
  const seconds =
    day && day < todayJst(new Date(now))
      ? (PAST_DAY_CACHE_DAYS * DAY_MS) / 1000
      : secondsUntilJstMidnight(now);
  return `public, max-age=0, s-maxage=${seconds}`;
}

/** Paths that are not ours to cache: the build's hashed assets. */
const NEVER = [/^\/_/];

/** A page, an API answer, the sitemap or robots.txt, as opposed to a file. */
export function isDayCacheable(path: string): boolean {
  if (NEVER.some((re) => re.test(path))) return false;
  if (path.startsWith(API_PREFIX)) return true;
  if ([ROUTES.sitemap, ROUTES.robots].some((route) => route === path))
    return true;
  return !/\.[A-Za-z0-9]+$/.test(path);
}
