import { z } from "zod";
import { n5DataService } from "../services/n5-data";
import { safeGetQuery } from "../utils/http-query";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS } from "~~/shared/jlpt";

const kanjiQuerySchema = z.object({
  // The lesson pages never pass this yet — they only ever want N5, same as
  // before this param existed. Exposed for programmatic/future use now
  // that N4-N2 pools are seedable (see scripts/seed-n5-data.mjs).
  level: z
    .enum(JLPT_LEVELS)
    .nullable()
    .optional()
    .transform((val) => val ?? DEFAULT_JLPT_LEVEL),
});

/**
 * GET /api/n5-kanji — the full kanji pool (KANJIDIC2 meanings and readings)
 * for one JLPT level (N5 by default), for the lesson pages
 * (app/pages/learn/) to break every word down into the characters it's
 * written with. Static pool, returned as-is.
 */
export default defineEventHandler(async (event) => {
  try {
    const { level } = kanjiQuerySchema.parse(safeGetQuery(event));
    const kanji = await n5DataService.getKanjiPool(level);

    return {
      success: true,
      data: kanji,
      count: kanji.length,
      timestamp: new Date().toISOString(),
    };
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

    console.error("N5 kanji API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch N5 kanji",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to fetch N5 kanji",
      },
    });
  }
});
