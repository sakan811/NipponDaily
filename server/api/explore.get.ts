import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import {
  MAX_QUERY_LENGTH,
  PROCESS_IDS,
  STRATUM_IDS,
  exploreWords,
} from "~~/shared/explore";
import { MAX_PART_LENGTH } from "~~/shared/parts";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import { todayJst } from "~~/shared/words";
import type { ExploreFilters } from "~~/types/index";

/** An empty value (`?level=`) means "no filter", the way a cleared form field sends it. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .nullable()
    .optional()
    .transform((val) => val || undefined);

const exploreQuerySchema = z.object({
  q: optional(z.string().trim().max(MAX_QUERY_LENGTH)),
  level: optional(z.enum(JLPT_LEVELS)),
  stratum: optional(z.enum(STRATUM_IDS as [string, ...string[]])),
  process: optional(z.enum(PROCESS_IDS as [string, ...string[]])),
  part: optional(z.string().trim().max(MAX_PART_LENGTH)),
});

export default defineEventHandler((event) => {
  let filters: ReturnType<typeof exploreQuerySchema.parse>;
  try {
    filters = exploreQuerySchema.parse(safeGetQuery(event));
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

  return {
    success: true,
    // Only open days are ever searched, so an upcoming word cannot be found early.
    data: exploreWords(
      Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined),
      ) as ExploreFilters,
      todayJst(),
    ),
    timestamp: new Date().toISOString(),
  };
});
