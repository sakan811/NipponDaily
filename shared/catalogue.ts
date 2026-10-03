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
}

const MONTH_NAMES = [
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
