import { z } from "zod";
import {
  MAX_QUERY_LENGTH,
  PROCESS_KEY_IDS,
  STRATUM_KEY_IDS,
  splitList,
} from "~~/shared/explore-query";
import { MAX_PART_LENGTH } from "~~/shared/part-limits";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import { FREQUENCY_IDS, POS_GROUP_IDS } from "~~/shared/word-labels";
import type { ExploreFilters } from "~~/types/index";

/**
 * The Explore filters as an API accepts them, shared by every endpoint that
 * filters words (`/api/explore`, `/api/word-calendar`) so a filter means the
 * same thing in each.
 */

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

/** The filter fields of a query schema; spread it into the endpoint's own. */
export const exploreFilterShape = {
  q: optional(z.string().trim().max(MAX_QUERY_LENGTH)),
  level: choices(JLPT_LEVELS as unknown as [string, ...string[]]),
  stratum: choices(STRATUM_KEY_IDS as [string, ...string[]]),
  process: choices(PROCESS_KEY_IDS as [string, ...string[]]),
  pos: choices(POS_GROUP_IDS as [string, ...string[]]),
  frequency: choices(FREQUENCY_IDS as [string, ...string[]]),
  part: optional(z.string().trim().max(MAX_PART_LENGTH)),
  // "any" is the default, so only "all" is kept in the echoed filters.
  match: optional(z.enum(["any", "all"])).transform((m) =>
    m === "all" ? m : undefined,
  ),
};

/** The filters of a parsed query, with the fields it left empty dropped. */
export const filtersOf = (parsed: Record<string, unknown>): ExploreFilters =>
  Object.fromEntries(
    Object.keys(exploreFilterShape)
      .filter((key) => parsed[key] !== undefined)
      .map((key) => [key, parsed[key]]),
  ) as ExploreFilters;

/** Turns a failed query parse into the `400` every endpoint answers with. */
export function rejectQuery(error: unknown): never {
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
