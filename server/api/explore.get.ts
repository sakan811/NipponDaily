import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import { exploreWords } from "~~/shared/explore";
import {
  MAX_QUERY_LENGTH,
  PROCESS_KEY_IDS,
  STRATUM_KEY_IDS,
  splitList,
} from "~~/shared/explore-query";
import { MAX_PART_LENGTH } from "~~/shared/part-limits";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import { POS_GROUP_IDS } from "~~/shared/word-labels";
import { todayJst } from "~~/shared/words";
import type { ExploreFilters } from "~~/types/index";

/** An empty value (`?level=`) means "no filter", the way a cleared form field sends it. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.literal(""), schema])
    .nullable()
    .optional()
    .transform((val) => val || undefined);

/** One or more choices, `?process=rendaku,compound`. An empty list means "no filter". */
const choices = <T extends [string, ...string[]]>(values: T) =>
  z
    .preprocess(
      (v) => (v === null || v === undefined ? [] : splitList(v)),
      z.array(z.enum(values)),
    )
    .transform((list) => (list.length ? list : undefined));

const exploreQuerySchema = z.object({
  q: optional(z.string().trim().max(MAX_QUERY_LENGTH)),
  level: choices(JLPT_LEVELS as unknown as [string, ...string[]]),
  stratum: choices(STRATUM_KEY_IDS as [string, ...string[]]),
  process: choices(PROCESS_KEY_IDS as [string, ...string[]]),
  pos: choices(POS_GROUP_IDS as [string, ...string[]]),
  part: optional(z.string().trim().max(MAX_PART_LENGTH)),
  // "any" is the default, so only "all" is kept in the echoed filters.
  match: optional(z.enum(["any", "all"])).transform((m) =>
    m === "all" ? m : undefined,
  ),
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
