import { z } from "zod";
import { n5DataService } from "../services/n5-data";
import {
  REPEAT_AVOIDANCE_DAYS,
  buildDailyGame,
  isValidIsoDate,
  recentDates,
  todayUtc,
} from "../utils/daily-game";
import { safeGetQuery } from "../utils/http-query";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS } from "~~/shared/jlpt";
import type { DailyGame } from "~~/types/index";

const dailyGameQuerySchema = z.object({
  // A real calendar date, today or earlier (UTC). Future dates are
  // rejected: generating one early would persist a game built without the
  // days before it, breaking the 7-day repeat avoidance, and would let
  // anyone write arbitrary keys into Redis.
  date: z
    .string()
    .refine(isValidIsoDate, "Must be a real YYYY-MM-DD date")
    .refine((d) => d <= todayUtc(), "Date cannot be in the future")
    .nullable()
    .optional()
    .transform((val) => val || undefined),
  // No UI lets a player choose a level yet — /game only ever calls this
  // with no `level`, which resolves to N5 exactly as before this param
  // existed. Exposed for programmatic/future use now that N4-N2 pools are
  // seedable (see scripts/seed-n5-data.mjs).
  level: z
    .enum(JLPT_LEVELS)
    .nullable()
    .optional()
    .transform((val) => val ?? undefined),
});

export default defineEventHandler(async (event) => {
  try {
    const { date: requestedDate, level = DEFAULT_JLPT_LEVEL } =
      dailyGameQuerySchema.parse(safeGetQuery(event));
    const date = requestedDate ?? todayUtc();

    let game: DailyGame | null = await n5DataService.getDailyGame(date, level);
    if (!game) {
      const pool = await n5DataService.getFullPool(level);
      const recentGames = await n5DataService.getDailyGames(
        recentDates(date, REPEAT_AVOIDANCE_DAYS),
        level,
      );
      game = buildDailyGame(pool, date, recentGames, level);
      // saveDailyGame only writes when nothing exists yet (Redis NX), so a
      // concurrent request for the same date+level never overwrites this one.
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

    console.error("Daily game API error:", error);

    // Internal details (Redis errors, stack traces) stay in the server log;
    // only development builds echo the message back to the client.
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch daily game",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Service temporarily unavailable. Please try again.",
      },
    });
  }
});
