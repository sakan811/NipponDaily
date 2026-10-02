import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import { relatedWords } from "~~/shared/related";
import { entryForDate, isValidIsoDate, todayJst } from "~~/shared/words";

const relatedQuerySchema = z.object({
  // A real calendar date, today or earlier (JST) — the same rule as
  // /api/daily-word, so an upcoming word is never read through this route.
  date: z
    .string()
    .refine(isValidIsoDate, "Must be a real YYYY-MM-DD date")
    .refine((d) => d <= todayJst(), "Date cannot be in the future"),
});

export default defineEventHandler((event) => {
  let date: string;
  try {
    ({ date } = relatedQuerySchema.parse(safeGetQuery(event)));
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

  const entry = entryForDate(date);
  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { error: `There is no word for ${date}.` },
    });
  }

  return {
    success: true,
    data: { date, words: relatedWords(entry, todayJst()) },
    timestamp: new Date().toISOString(),
  };
});
