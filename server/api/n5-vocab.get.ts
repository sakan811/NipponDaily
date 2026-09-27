import { z } from "zod";
import { n5DataService } from "../services/n5-data";
import { safeGetQuery } from "../utils/http-query";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS } from "~~/shared/jlpt";

const vocabQuerySchema = z.object({
  // The client-side vocab guide/lesson pages never pass this yet — they
  // only ever want N5, same as before this param existed. Exposed for
  // programmatic/future use now that N4-N2 pools are seedable (see
  // scripts/seed-n5-data.mjs).
  level: z
    .enum(JLPT_LEVELS)
    .nullable()
    .optional()
    .transform((val) => val ?? DEFAULT_JLPT_LEVEL),
});

/**
 * GET /api/n5-vocab — the full vocabulary pool for one JLPT level (N5 by
 * default), for the client-side vocab guide pages (app/pages/vocab/index.vue
 * and app/pages/vocab/types/[key].vue) and the lesson pages
 * (app/pages/learn/). Unlike /api/daily-game this returns the whole static
 * pool as-is; there's nothing per-date to compute or persist here.
 */
export default defineEventHandler(async (event) => {
  try {
    const { level } = vocabQuerySchema.parse(safeGetQuery(event));
    const vocab = await n5DataService.getVocabPool(level);

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

    console.error("N5 vocab API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch N5 vocabulary",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to fetch N5 vocabulary",
      },
    });
  }
});
