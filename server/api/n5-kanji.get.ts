import { n5DataService } from "../services/n5-data";

/**
 * GET /api/n5-kanji — the full N5 kanji pool (KANJIDIC2 meanings and
 * readings), for the lesson pages (app/pages/learn/) to break every word
 * down into the characters it's written with. Static pool, returned as-is.
 */
export default defineEventHandler(async () => {
  try {
    const kanji = await n5DataService.getKanjiPool();

    return {
      success: true,
      data: kanji,
      count: kanji.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
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
