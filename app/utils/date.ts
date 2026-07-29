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
