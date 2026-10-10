/**
 * The Explore filters as they travel in a URL or an API query: one parameter
 * per filter, several choices joined by commas (`?process=rendaku,compound`).
 * Data-free on purpose, so the page, the API handler and the links that point
 * into Explore all read and write the same format.
 */
import type { ExploreFilters, ExploreMatch } from "~~/types/index";
import { JLPT_LEVELS } from "./jlpt";
import { MAX_PART_LENGTH } from "./limits";
import {
  FREQUENCY_IDS,
  POS_GROUP_IDS,
  WORD_PROCESSES,
  WORD_STRATA,
} from "./word-labels";

/** The longest search text the API accepts. */
export const MAX_QUERY_LENGTH = 50;

export const STRATUM_KEY_IDS = [...Object.keys(WORD_STRATA), "unstated"];
export const PROCESS_KEY_IDS = Object.keys(WORD_PROCESSES);

/** "a,b" (or ["a,b", "c"]) as a list; blanks and repeats dropped. */
export function splitList(value: unknown): string[] {
  const parts = (Array.isArray(value) ? value : [value])
    .filter((v): v is string => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

const only = <T extends string>(
  value: unknown,
  allowed: readonly string[],
): T[] | undefined => {
  const list = splitList(value).filter((v) => allowed.includes(v)) as T[];
  return list.length ? list : undefined;
};

const text = (value: unknown, max: number): string | undefined => {
  const s = (Array.isArray(value) ? value[0] : value) as unknown;
  return typeof s === "string" && s.trim() ? s.trim().slice(0, max) : undefined;
};

/** The filters in a query, keeping only values the API would accept, so a stale
 *  or hand-edited link opens the page rather than an error. */
export function filtersFromQuery(
  query: Record<string, unknown>,
): ExploreFilters {
  const match = text(query.match, 3);
  const filters: ExploreFilters = {
    q: text(query.q, MAX_QUERY_LENGTH),
    level: only(query.level, JLPT_LEVELS),
    stratum: only(query.stratum, STRATUM_KEY_IDS),
    process: only(query.process, PROCESS_KEY_IDS),
    pos: only(query.pos, POS_GROUP_IDS),
    frequency: only(query.frequency, FREQUENCY_IDS),
    part: text(query.part, MAX_PART_LENGTH),
    match: match === "all" ? ("all" as ExploreMatch) : undefined,
  };
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined),
  );
}

/** The query that carries `filters`: lists comma-joined, empty filters left out.
 *  `match` is written only when it is not the default. */
export function queryFromFilters(
  filters: ExploreFilters,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) out[key] = value.join(",");
    } else if (key !== "match" || value !== "any") {
      out[key] = String(value);
    }
  }
  return out;
}
