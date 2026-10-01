/**
 * The daily-word catalogue and its date logic — imported by BOTH the server
 * (GET /api/daily-word, GET /api/word-calendar) and the content tests, so a
 * month's worth of entries is registered in exactly one place.
 *
 * Server and tests only — importing this from app/ would ship every future
 * word to the browser. The data-free labels live in shared/word-labels.ts.
 *
 * To add a month: write data/words/YYYY-MM.json (one WordEntry per day), add
 * its import below, then run `pnpm data:etymology` to pin the Wiktionary
 * evidence the entries quote.
 */
import type {
  DailyWordPayload,
  WordCalendarDay,
  WordEntry,
} from "~~/types/index";
import october2026 from "~~/data/words/2026-10.json";

/** Every month's entries, oldest first. */
const MONTHS: WordEntry[][] = [october2026 as WordEntry[]];

export const WORD_ENTRIES: readonly WordEntry[] = MONTHS.flat().sort((a, b) =>
  a.date.localeCompare(b.date),
);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real YYYY-MM-DD calendar date (no 2026-02-30). */
export function isValidIsoDate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d
  );
}

/** A real YYYY-MM month. */
export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Today's date in Japan (JST, UTC+9) — a new word opens at midnight there,
 *  the same calendar the seasonal theme follows. */
export function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export function entryForDate(date: string): WordEntry | undefined {
  return WORD_ENTRIES.find((e) => e.date === date);
}

/** The newest entry that is open on `date` — what "today's word" falls back
 *  to once the catalogue runs out, so the site never shows nothing. */
export function latestEntryOnOrBefore(date: string): WordEntry | undefined {
  return [...WORD_ENTRIES].reverse().find((e) => e.date <= date);
}

/** An entry with the open days on either side of it. `next` stays null until
 *  that day has arrived, so navigating forward can never reveal a future word. */
export function payloadFor(
  entry: WordEntry,
  today: string = todayJst(),
): DailyWordPayload {
  const i = WORD_ENTRIES.indexOf(entry);
  const prev = WORD_ENTRIES[i - 1];
  const next = WORD_ENTRIES[i + 1];
  return {
    entry,
    prev: prev ? { date: prev.date, term: prev.term } : null,
    next:
      next && next.date <= today ? { date: next.date, term: next.term } : null,
  };
}

/** Months (YYYY-MM) that have at least one entry, oldest first. */
export function monthsWithEntries(): string[] {
  return [...new Set(WORD_ENTRIES.map((e) => e.date.slice(0, 7)))];
}

/** Every day of a month as the calendar shows it: an open day carries its
 *  word, an upcoming day carries nothing, and a day with no entry is omitted. */
export function calendarForMonth(
  month: string,
  today: string = todayJst(),
): WordCalendarDay[] {
  return WORD_ENTRIES.filter((e) => e.date.startsWith(month)).map((e) =>
    e.date <= today
      ? {
          date: e.date,
          status: "open",
          term: e.term,
          kana: e.kana,
          stratum: e.stratum,
        }
      : { date: e.date, status: "upcoming" },
  );
}
