/**
 * The pages of the days that have already passed, for the build to prerender.
 *
 * A past day's word cannot change, so its page is written once as a static file
 * and served without running the app: a crawler that walks the whole archive
 * then costs the host no compute. Today is left out (and so is every day after
 * it, which must stay a 404 until it opens): the page of the day before today
 * is the last whose neighbouring links are all open already.
 *
 * Reads `data/words/*.json` directly instead of importing `shared/words`, which
 * needs the `~~` alias that `nuxt.config.ts` cannot resolve.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Today's date in Japan, as `YYYY-MM-DD` (the calendar a word opens by). */
export function jstToday(now: Date = new Date()): string {
  return new Date(now.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** `/words/<date>` for every entry dated before `today`, oldest first. */
export function pastDayRoutes(
  wordsDir: string,
  today: string = jstToday(),
): string[] {
  const dates: string[] = [];
  for (const file of readdirSync(wordsDir)) {
    if (!/^\d{4}-\d{2}\.json$/.test(file)) continue;
    const entries = JSON.parse(readFileSync(join(wordsDir, file), "utf8")) as {
      date: string;
    }[];
    for (const { date } of entries) if (date < today) dates.push(date);
  }
  return dates.sort().map((date) => `/words/${date}`);
}
