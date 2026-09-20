import { z } from "zod";
import { n5DataService } from "../services/n5-data";
import { buildDailyGame, todayUtc } from "../utils/daily-game";
import type { DailyGame } from "~~/types/index";

const dailyGameQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .transform((val) => val || undefined),
});

export default defineEventHandler(async (event) => {
  try {
    let query: Record<string, unknown>;
    try {
      query = getQuery(event);
    } catch {
      const urlObj = new URL(
        event.path || event.node?.req?.url || "",
        "http://localhost",
      );
      query = Object.fromEntries(urlObj.searchParams.entries());
    }
    const { date: requestedDate } = dailyGameQuerySchema.parse(query);
    const date = requestedDate ?? todayUtc();

    let game: DailyGame | null = await n5DataService.getDailyGame(date);
    if (!game) {
      const pool = await n5DataService.getFullPool();
      game = buildDailyGame(pool, date);
      // Only persist when nothing exists yet, so a concurrent request for
      // the same not-yet-generated date doesn't overwrite this one.
      await n5DataService.saveDailyGame(game);
    }

    return {
      success: true,
      data: game,
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

    if (process.env.NODE_ENV === "development") {
      console.error("Daily game API error:", error);
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch daily game",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});
