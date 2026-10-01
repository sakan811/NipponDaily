/**
 * Formats a calendar date object into YYYY-MM-DD string format.
 */
export function formatCalendarDateYMD(date: {
  year: number;
  month: number;
  day: number;
}): string {
  if (!date) return "";
  const yyyy = date.year.toString();
  const mm = date.month.toString().padStart(2, "0");
  const dd = date.day.toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * "Saturday, October 3, 2026" for a YYYY-MM-DD date. Formatted in UTC so the
 * calendar date never shifts with the reader's timezone.
 */
export function formatLongDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "October 2026" for a YYYY-MM month. */
export function formatMonthYear(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
  });
}
