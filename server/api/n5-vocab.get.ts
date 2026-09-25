import { n5DataService } from "../services/n5-data";

/**
 * GET /api/n5-vocab — the full N5 vocabulary pool, for the client-side
 * vocab guide pages (app/pages/vocab/index.vue and
 * app/pages/vocab/types/[key].vue) and the lesson pages (app/pages/learn/).
 * Unlike /api/daily-game this returns the whole static pool as-is;
 * there's nothing per-date to compute or persist here.
 */
export default defineEventHandler(async () => {
  try {
    const vocab = await n5DataService.getVocabPool();

    return {
      success: true,
      data: vocab,
      count: vocab.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
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
