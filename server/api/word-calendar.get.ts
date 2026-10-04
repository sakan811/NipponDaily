import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import {
  exploreFilterShape,
  filtersOf,
  rejectQuery,
} from "../utils/explore-filters";
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
  let requestedMonth: string | undefined;
  let filters: ReturnType<typeof filtersOf>;
  try {
    const query = wordCalendarQuerySchema.parse(safeGetQuery(event));
    requestedMonth = query.month;
    filters = filtersOf(query);
  } catch (error) {
    return rejectQuery(error);
  }

  const months = monthsWithEntries();
  const today = todayJst();
  // Default: the current month if it has words, otherwise the newest month
  // that does — the calendar always opens on something readable.
  const month =
    requestedMonth ??
    (months.includes(today.slice(0, 7)) ? today.slice(0, 7) : months.at(-1));

  if (!month || !months.includes(month)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { error: `There are no words for ${month ?? "that month"}.` },
    });
  }

  return {
    success: true,
    // Only open days are ever matched, so an upcoming word cannot be found early.
    data: exploreCalendar(month, filters, today),
    timestamp: new Date().toISOString(),
  };
});
