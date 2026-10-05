/**
 * What a response may be cached for. Every word, calendar, part and pattern
 * answer, and every server-rendered page, is the same for every reader until the
 * next midnight in Japan (the season is applied in the browser, never in the
 * HTML), so a CDN may keep it until then and no longer: the day's word opens
 * exactly at the moment the cached copy expires.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole seconds from `now` to the next midnight in Japan (15:00 UTC), at least 1. */
export function secondsUntilJstMidnight(now: number = Date.now()): number {
  const nextMidnight =
    (Math.floor((now + JST_OFFSET_MS) / DAY_MS) + 1) * DAY_MS;
  return Math.max(1, Math.ceil((nextMidnight - JST_OFFSET_MS - now) / 1000));
}

/** `s-maxage` only: shared caches keep it until midnight, a browser still
 *  revalidates, and there is no stale-while-revalidate, which would serve
 *  yesterday's word after the day had turned. */
export function dayCacheControl(now: number = Date.now()): string {
  return `public, max-age=0, s-maxage=${secondsUntilJstMidnight(now)}`;
}

/** Paths that change within a day, or are not ours to cache: the season (own
 *  rule in `nuxt.config.ts`), the cron, and the build's hashed assets. */
const NEVER = [/^\/api\/site-theme$/, /^\/api\/cron(\/|$)/, /^\/_/];

/** A page, an API answer, the sitemap or robots.txt, as opposed to a file. */
export function isDayCacheable(path: string): boolean {
  if (NEVER.some((re) => re.test(path))) return false;
  if (path.startsWith("/api/")) return true;
  if (["/sitemap.xml", "/robots.txt"].includes(path)) return true;
  return !/\.[A-Za-z0-9]+$/.test(path);
}
