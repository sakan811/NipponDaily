import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import {
  entryForDate,
  isValidIsoDate,
  latestEntryOnOrBefore,
  payloadFor,
  todayJst,
} from "~~/shared/words";

const dailyWordQuerySchema = z.object({
  // A real calendar date, today or earlier (JST). A future date is rejected
  // so an upcoming word is never served before its day arrives.
  date: z
    .string()
    .refine(isValidIsoDate, "Must be a real YYYY-MM-DD date")
    .refine((d) => d <= todayJst(), "Date cannot be in the future")
    .nullable()
    .optional()
    .transform((val) => val || undefined),
});

export default defineEventHandler((event) => {
  let requestedDate: string | undefined;
  try {
    ({ date: requestedDate } = dailyWordQuerySchema.parse(safeGetQuery(event)));
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

  const today = todayJst();
  // No ?date= means "today's word" — and if the catalogue has not reached
  // today yet (or has run out), the newest open word, so the page is never
  // empty. An explicit date must have its own entry.
  const entry = requestedDate
    ? entryForDate(requestedDate)
    : latestEntryOnOrBefore(today);

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: {
        error: requestedDate
          ? `There is no word for ${requestedDate}.`
          : "The first word has not opened yet.",
      },
    });
  }

  return {
    success: true,
    data: payloadFor(entry, today),
    timestamp: new Date().toISOString(),
  };
});
