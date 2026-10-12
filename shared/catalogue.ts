/**
 * Facts about the written catalogue (first and last day, how many words, how
 * many have opened), computed from the entries' dates rather than typed into
 * any doc. Pure and data-free: the server and `pnpm docs:sync` pass the dates
 * in, so `app/` can import it without carrying a single entry.
 */

export interface CatalogueSummary {
  /** First written day, YYYY-MM-DD. */
  first: string;
  /** Last written day, YYYY-MM-DD. */
  last: string;
  /** Every written word, including days that haven't opened. */
  total: number;
  /** Words whose day (JST) has arrived. */
  open: number;
  /** How much of each part of an entry the open words carry. Sent by
   *  `GET /api/catalogue`; absent from a bare `summariseCatalogue()`. */
  coverage?: Coverage;
}

/** How many words carry each part of an entry. Reading, meaning and level are
 *  on every word, so they have no count. */
export interface Coverage {
  /** The words counted: every open word. */
  words: number;
  layer: number;
  pitch: number;
  examples: number;
  parts: number;
  processes: number;
  /** Words with at least one quoted Wiktionary line about their origin. */
  origin: number;
}

/** The parts of an entry `coverageOf` looks at (a `WordEntry` has them all). */
interface CoverageEntry {
  stratum?: string;
  pitch?: readonly number[];
  examples?: readonly unknown[];
  morphemes: readonly unknown[];
  processes: readonly unknown[];
  sources: readonly unknown[];
}

/** Counts, over `entries`, the words that carry each part of an entry. */
export function coverageOf(entries: readonly CoverageEntry[]): Coverage {
  const count = (has: (e: CoverageEntry) => boolean): number =>
    entries.filter(has).length;
  return {
    words: entries.length,
    layer: count((e) => Boolean(e.stratum)),
    pitch: count((e) => Boolean(e.pitch?.length)),
    examples: count((e) => Boolean(e.examples?.length)),
    parts: count((e) => e.morphemes.length > 0),
    processes: count((e) => e.processes.length > 0),
    origin: count((e) => e.sources.length > 0),
  };
}

/** "73%": `n` of `total`, rounded to a whole percent; "" when there are no words. */
export function percentText(n: number, total: number): string {
  return total > 0 ? `${Math.round((100 * n) / total)}%` : "";
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "Jan"…"Dec": the first three letters of each month. */
export const MONTH_SHORT = MONTH_NAMES.map((name) => name.slice(0, 3));

export function summariseCatalogue(
  dates: readonly string[],
  today: string,
): CatalogueSummary {
  const sorted = [...dates].sort();
  return {
    first: sorted[0] ?? "",
    last: sorted[sorted.length - 1] ?? "",
    total: sorted.length,
    open: sorted.filter((d) => d <= today).length,
  };
}

/** "October 2027" for a YYYY-MM or YYYY-MM-DD string. */
export function monthLabel(isoOrMonth: string): string {
  const name = MONTH_NAMES[Number(isoOrMonth.slice(5, 7)) - 1] ?? "";
  return `${name} ${isoOrMonth.slice(0, 4)}`.trim();
}

/** "2026-01-01 to 2027-10-31" */
export function rangeText(s: Pick<CatalogueSummary, "first" | "last">): string {
  return `${s.first} to ${s.last}`;
}

/** "January 2026 to October 2027" */
export function rangeMonthsText(
  s: Pick<CatalogueSummary, "first" | "last">,
): string {
  return `${monthLabel(s.first)} to ${monthLabel(s.last)}`;
}
