/**
 * The daily-word catalogue and its date logic — imported by BOTH the server
 * (GET /api/daily-word, GET /api/word-calendar) and the content tests, so a
 * month's worth of entries is registered in exactly one place.
 *
 * Server and tests only — importing this from app/ would ship every future
 * word to the browser. The data-free labels live in shared/word-labels.ts.
 *
 * To add a month: write data/word-plan/YYYY-MM.json, pin its pages with
 * `pnpm data:etymology --terms …`, run `pnpm data:words` to generate
 * data/words/YYYY-MM.json, then add its import below.
 */
import type {
  DailyWordPayload,
  WordCalendarDay,
  WordEntry,
} from "~~/types/index";
import january2022 from "~~/data/words/2022-01.json";
import february2022 from "~~/data/words/2022-02.json";
import march2022 from "~~/data/words/2022-03.json";
import april2022 from "~~/data/words/2022-04.json";
import may2022 from "~~/data/words/2022-05.json";
import june2022 from "~~/data/words/2022-06.json";
import july2022 from "~~/data/words/2022-07.json";
import august2022 from "~~/data/words/2022-08.json";
import september2022 from "~~/data/words/2022-09.json";
import october2022 from "~~/data/words/2022-10.json";
import november2022 from "~~/data/words/2022-11.json";
import december2022 from "~~/data/words/2022-12.json";
import january2023 from "~~/data/words/2023-01.json";
import february2023 from "~~/data/words/2023-02.json";
import march2023 from "~~/data/words/2023-03.json";
import april2023 from "~~/data/words/2023-04.json";
import may2023 from "~~/data/words/2023-05.json";
import june2023 from "~~/data/words/2023-06.json";
import july2023 from "~~/data/words/2023-07.json";
import august2023 from "~~/data/words/2023-08.json";
import september2023 from "~~/data/words/2023-09.json";
import october2023 from "~~/data/words/2023-10.json";
import november2023 from "~~/data/words/2023-11.json";
import december2023 from "~~/data/words/2023-12.json";
import january2024 from "~~/data/words/2024-01.json";
import february2024 from "~~/data/words/2024-02.json";
import march2024 from "~~/data/words/2024-03.json";
import april2024 from "~~/data/words/2024-04.json";
import may2024 from "~~/data/words/2024-05.json";
import june2024 from "~~/data/words/2024-06.json";
import july2024 from "~~/data/words/2024-07.json";
import august2024 from "~~/data/words/2024-08.json";
import september2024 from "~~/data/words/2024-09.json";
import october2024 from "~~/data/words/2024-10.json";
import november2024 from "~~/data/words/2024-11.json";
import december2024 from "~~/data/words/2024-12.json";
import january2025 from "~~/data/words/2025-01.json";
import february2025 from "~~/data/words/2025-02.json";
import march2025 from "~~/data/words/2025-03.json";
import april2025 from "~~/data/words/2025-04.json";
import may2025 from "~~/data/words/2025-05.json";
import june2025 from "~~/data/words/2025-06.json";
import july2025 from "~~/data/words/2025-07.json";
import august2025 from "~~/data/words/2025-08.json";
import september2025 from "~~/data/words/2025-09.json";
import october2025 from "~~/data/words/2025-10.json";
import november2025 from "~~/data/words/2025-11.json";
import december2025 from "~~/data/words/2025-12.json";
import january2026 from "~~/data/words/2026-01.json";
import february2026 from "~~/data/words/2026-02.json";
import march2026 from "~~/data/words/2026-03.json";
import april2026 from "~~/data/words/2026-04.json";
import may2026 from "~~/data/words/2026-05.json";
import june2026 from "~~/data/words/2026-06.json";
import july2026 from "~~/data/words/2026-07.json";
import august2026 from "~~/data/words/2026-08.json";
import september2026 from "~~/data/words/2026-09.json";
import october2026 from "~~/data/words/2026-10.json";
import november2026 from "~~/data/words/2026-11.json";
import december2026 from "~~/data/words/2026-12.json";
import january2027 from "~~/data/words/2027-01.json";
import february2027 from "~~/data/words/2027-02.json";
import march2027 from "~~/data/words/2027-03.json";
import april2027 from "~~/data/words/2027-04.json";
import may2027 from "~~/data/words/2027-05.json";
import june2027 from "~~/data/words/2027-06.json";
import july2027 from "~~/data/words/2027-07.json";
import august2027 from "~~/data/words/2027-08.json";
import september2027 from "~~/data/words/2027-09.json";
import october2027 from "~~/data/words/2027-10.json";
import november2027 from "~~/data/words/2027-11.json";
import december2027 from "~~/data/words/2027-12.json";
import january2028 from "~~/data/words/2028-01.json";
import february2028 from "~~/data/words/2028-02.json";
import march2028 from "~~/data/words/2028-03.json";
import april2028 from "~~/data/words/2028-04.json";
import may2028 from "~~/data/words/2028-05.json";
import june2028 from "~~/data/words/2028-06.json";
import july2028 from "~~/data/words/2028-07.json";
import august2028 from "~~/data/words/2028-08.json";
import september2028 from "~~/data/words/2028-09.json";
import october2028 from "~~/data/words/2028-10.json";
import november2028 from "~~/data/words/2028-11.json";
import december2028 from "~~/data/words/2028-12.json";
import january2029 from "~~/data/words/2029-01.json";
import february2029 from "~~/data/words/2029-02.json";
import march2029 from "~~/data/words/2029-03.json";
import april2029 from "~~/data/words/2029-04.json";
import may2029 from "~~/data/words/2029-05.json";
import june2029 from "~~/data/words/2029-06.json";
import july2029 from "~~/data/words/2029-07.json";
import august2029 from "~~/data/words/2029-08.json";
import september2029 from "~~/data/words/2029-09.json";
import october2029 from "~~/data/words/2029-10.json";
import november2029 from "~~/data/words/2029-11.json";
import december2029 from "~~/data/words/2029-12.json";

/** Every month's entries, oldest first. */
const MONTHS: WordEntry[][] = [
  january2022 as WordEntry[],
  february2022 as WordEntry[],
  march2022 as WordEntry[],
  april2022 as WordEntry[],
  may2022 as WordEntry[],
  june2022 as WordEntry[],
  july2022 as WordEntry[],
  august2022 as WordEntry[],
  september2022 as WordEntry[],
  october2022 as WordEntry[],
  november2022 as WordEntry[],
  december2022 as WordEntry[],
  january2023 as WordEntry[],
  february2023 as WordEntry[],
  march2023 as WordEntry[],
  april2023 as WordEntry[],
  may2023 as WordEntry[],
  june2023 as WordEntry[],
  july2023 as WordEntry[],
  august2023 as WordEntry[],
  september2023 as WordEntry[],
  october2023 as WordEntry[],
  november2023 as WordEntry[],
  december2023 as WordEntry[],
  january2024 as WordEntry[],
  february2024 as WordEntry[],
  march2024 as WordEntry[],
  april2024 as WordEntry[],
  may2024 as WordEntry[],
  june2024 as WordEntry[],
  july2024 as WordEntry[],
  august2024 as WordEntry[],
  september2024 as WordEntry[],
  october2024 as WordEntry[],
  november2024 as WordEntry[],
  december2024 as WordEntry[],
  january2025 as WordEntry[],
  february2025 as WordEntry[],
  march2025 as WordEntry[],
  april2025 as WordEntry[],
  may2025 as WordEntry[],
  june2025 as WordEntry[],
  july2025 as WordEntry[],
  august2025 as WordEntry[],
  september2025 as WordEntry[],
  october2025 as WordEntry[],
  november2025 as WordEntry[],
  december2025 as WordEntry[],
  january2026 as WordEntry[],
  february2026 as WordEntry[],
  march2026 as WordEntry[],
  april2026 as WordEntry[],
  may2026 as WordEntry[],
  june2026 as WordEntry[],
  july2026 as WordEntry[],
  august2026 as WordEntry[],
  september2026 as WordEntry[],
  october2026 as WordEntry[],
  november2026 as WordEntry[],
  december2026 as WordEntry[],
  january2027 as WordEntry[],
  february2027 as WordEntry[],
  march2027 as WordEntry[],
  april2027 as WordEntry[],
  may2027 as WordEntry[],
  june2027 as WordEntry[],
  july2027 as WordEntry[],
  august2027 as WordEntry[],
  september2027 as WordEntry[],
  october2027 as WordEntry[],
  november2027 as WordEntry[],
  december2027 as WordEntry[],
  january2028 as WordEntry[],
  february2028 as WordEntry[],
  march2028 as WordEntry[],
  april2028 as WordEntry[],
  may2028 as WordEntry[],
  june2028 as WordEntry[],
  july2028 as WordEntry[],
  august2028 as WordEntry[],
  september2028 as WordEntry[],
  october2028 as WordEntry[],
  november2028 as WordEntry[],
  december2028 as WordEntry[],
  january2029 as WordEntry[],
  february2029 as WordEntry[],
  march2029 as WordEntry[],
  april2029 as WordEntry[],
  may2029 as WordEntry[],
  june2029 as WordEntry[],
  july2029 as WordEntry[],
  august2029 as WordEntry[],
  september2029 as WordEntry[],
  october2029 as WordEntry[],
  november2029 as WordEntry[],
  december2029 as WordEntry[],
];

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

/** The newest entry that is open on `date` — the word a day shows while the
 *  catalogue has yet to reach it (the days before the first word are the only
 *  ones with nothing to show). */
export function latestEntryOnOrBefore(date: string): WordEntry | undefined {
  return [...WORD_ENTRIES].reverse().find((e) => e.date <= date);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
}

/** The word for a day with no entry of its own and the lap it falls on.
 *
 *  Until the last written day the answer is the newest entry open on `date`,
 *  on lap 1. After it the words start again from the first one (a lap, 周):
 *  the day after the last entry shows the first word on lap 2, the next the
 *  second, and so on, then lap 3. The word depends only on the date, so every
 *  reader sees the same one, and every word shown has already been open. */
export function lapEntryForDate(
  date: string,
): { entry: WordEntry; lap: number } | undefined {
  const last = WORD_ENTRIES[WORD_ENTRIES.length - 1];
  if (!last || date <= last.date) {
    const entry = latestEntryOnOrBefore(date);
    return entry && { entry, lap: 1 };
  }
  const since = daysBetween(last.date, date) - 1;
  return {
    entry: WORD_ENTRIES[since % WORD_ENTRIES.length]!,
    lap: 2 + Math.floor(since / WORD_ENTRIES.length),
  };
}

/** An entry with the open days on either side of it. `next` stays null until
 *  that day has arrived, so navigating forward can never reveal a future word. */
export function payloadFor(
  entry: WordEntry,
  today: string = todayJst(),
  lap = 1,
): DailyWordPayload {
  const i = WORD_ENTRIES.indexOf(entry);
  const prev = WORD_ENTRIES[i - 1];
  const next = WORD_ENTRIES[i + 1];
  return {
    entry,
    lap,
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
