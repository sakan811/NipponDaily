/**
 * Japan Standard Time, written once. It is UTC+9 all year (no daylight
 * saving), so a calendar day in Japan is the UTC day shifted by a fixed
 * offset. The day's word, the season, the cache lifetime and the sitemap all
 * follow this calendar. Data-free and import-free.
 */

export const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** `date` shifted so its UTC fields read as the wall clock in Japan. */
export const toJst = (date: Date): Date =>
  new Date(date.getTime() + JST_OFFSET_MS);
