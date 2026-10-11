/**
 * Every path the server answers, written once. `shared/endpoints.ts` says what
 * each returns; the composables that fetch them, the rate limiter, the cache
 * rule, `robots.txt` and the share-image link read the paths from here, so a
 * route renamed in one place cannot be left behind in another. Kept apart from
 * `endpoints.ts` because the browser imports it and must not carry that file's
 * prose. Data-free and import-free.
 */

/** What every JSON endpoint's path starts with. */
export const API_PREFIX = "/api/";

export const ROUTES = {
  dailyWord: "/api/daily-word",
  wordCalendar: "/api/word-calendar",
  parts: "/api/parts",
  part: "/api/part",
  kanji: "/api/kanji",
  kanjiDetail: "/api/kanji-detail",
  explore: "/api/explore",
  patterns: "/api/patterns",
  related: "/api/related",
  catalogue: "/api/catalogue",
  sitemap: "/sitemap.xml",
  shareImage: "/og.png",
  robots: "/robots.txt",
} as const;
