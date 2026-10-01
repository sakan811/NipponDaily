import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import {
  calendarForMonth,
  isValidMonth,
  monthsWithEntries,
  todayJst,
} from "~~/shared/words";

const wordCalendarQuerySchema = z.object({
  month: z
    .string()
    .refine(isValidMonth, "Must be a real YYYY-MM month")
    .nullable()
    .optional()
    .transform((val) => val || undefined),
});

export default defineEventHandler((event) => {
  let requestedMonth: string | undefined;
  try {
    ({ month: requestedMonth } = wordCalendarQuerySchema.parse(
      safeGetQuery(event),
    ));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }
    throw error;
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
    data: { month, months, today, days: calendarForMonth(month, today) },
    timestamp: new Date().toISOString(),
  };
});
