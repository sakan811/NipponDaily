import { z } from "zod";
import { poolDataService } from "../services/pool-data";
import { safeGetQuery } from "../utils/http-query";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS } from "~~/shared/jlpt";

const vocabQuerySchema = z.object({
  // Defaults to N5; N4-N2 pools are seedable (see scripts/seed-pool-data.mjs).
  level: z
    .enum(JLPT_LEVELS)
    .nullable()
    .optional()
    .transform((val) => val ?? DEFAULT_JLPT_LEVEL),
});

/**
 * GET /api/pool-vocab — the full vocabulary pool for one JLPT level (N5 by
 * default), with shared/meanings.ts's corrections applied. Reference data no
 * page reads today; there's nothing per-date to compute or persist here.
 */
export default defineEventHandler(async (event) => {
  try {
    const { level } = vocabQuerySchema.parse(safeGetQuery(event));
    const vocab = await poolDataService.getVocabPool(level);

    return {
      success: true,
      data: vocab,
      count: vocab.length,
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

    console.error("Pool vocab API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch vocabulary",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to fetch vocabulary",
      },
    });
  }
});
