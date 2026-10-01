import { z } from "zod";
import { poolDataService } from "../services/pool-data";
import { safeGetQuery } from "../utils/http-query";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS } from "~~/shared/jlpt";

const kanjiQuerySchema = z.object({
  // Defaults to N5; N4-N2 pools are seedable (see scripts/seed-pool-data.mjs).
  level: z
    .enum(JLPT_LEVELS)
    .nullable()
    .optional()
    .transform((val) => val ?? DEFAULT_JLPT_LEVEL),
});

/**
 * GET /api/pool-kanji — the full kanji pool (KANJIDIC2 meanings and readings)
 * for one JLPT level (N5 by default). Reference data no page reads today;
 * static pool, returned as-is.
 */
export default defineEventHandler(async (event) => {
  try {
    const { level } = kanjiQuerySchema.parse(safeGetQuery(event));
    const kanji = await poolDataService.getKanjiPool(level);

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

    console.error("Pool kanji API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch kanji",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to fetch kanji",
      },
    });
  }
});
