import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { exploreFilterShape, filtersOf } from "../utils/explore-filters";
import { parseQuery } from "../utils/http-query";
import { exploreCalendar } from "~~/shared/explore";
import { isValidMonth, monthsWithEntries, todayJst } from "~~/shared/words";

const wordCalendarQuerySchema = z.object({
  month: z
    .string()
    .refine(isValidMonth, "Must be a real YYYY-MM month")
    .nullable()
    .optional()
    .transform((val) => val || undefined),
  ...exploreFilterShape,
});

export default defineEventHandler((event) => {
  const query = parseQuery(event, wordCalendarQuerySchema);
  const requestedMonth = query.month;
  const filters = filtersOf(query);

  const today = todayJst();
  const months = monthsWithEntries(today);
  // Default: the current month if it has words, otherwise the newest month
  // that does — the calendar always opens on something readable.
  const month =
    requestedMonth ??
    (months.includes(today.slice(0, 7)) ? today.slice(0, 7) : months.at(-1));

  if (!month || !months.includes(month))
    throw notFound(`There are no words for ${month ?? "that month"}.`);

  // Only open days are ever matched, so an upcoming word cannot be found early.
  return ok(exploreCalendar(month, filters, today));
});
