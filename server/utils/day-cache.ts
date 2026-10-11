/**
 * What a response may be cached for. Every word, calendar, part and pattern
 * answer, and every server-rendered page, is the same for every reader until the
 * next midnight in Japan (the season is applied in the browser, never in the
 * HTML), so a CDN may keep it until then and no longer: the day's word opens
 * exactly at the moment the cached copy expires.
 */

import { msUntilJstMidnight } from "~~/shared/jst";

/** Whole seconds from `now` to the next midnight in Japan, at least 1. */
export function secondsUntilJstMidnight(now: number = Date.now()): number {
  return Math.max(1, Math.ceil(msUntilJstMidnight(now) / 1000));
}

/** `s-maxage` only: shared caches keep it until midnight, a browser still
 *  revalidates, and there is no stale-while-revalidate, which would serve
 *  yesterday's word after the day had turned. */
export function dayCacheControl(now: number = Date.now()): string {
  return `public, max-age=0, s-maxage=${secondsUntilJstMidnight(now)}`;
}

/** Paths that are not ours to cache: the build's hashed assets. */
const NEVER = [/^\/_/];

/** A page, an API answer, the sitemap or robots.txt, as opposed to a file. */
export function isDayCacheable(path: string): boolean {
  if (NEVER.some((re) => re.test(path))) return false;
  if (path.startsWith("/api/")) return true;
  if (["/sitemap.xml", "/robots.txt"].includes(path)) return true;
  return !/\.[A-Za-z0-9]+$/.test(path);
}
