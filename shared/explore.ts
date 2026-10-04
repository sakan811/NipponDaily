/**
 * Browse-and-filter over the open words: the same entries the calendar and the
 * parts index read, narrowed by search text, level, layer, process, part of
 * speech or part. Several choices in one filter combine as "any" or "all".
 * Nothing here is a claim of its own — it selects and counts fields the
 * entries already carry.
 *
 * Server and tests only, like shared/words.ts: every function takes `today`
 * and reads open days, so an upcoming word is never matched or counted.
 */
import type {
  ExploreFilters,
  ExplorePayload,
  FacetCount,
  JlptLevel,
  PosGroup,
  StratumKey,
  WordEntry,
  WordProcess,
  WordStratum,
  WordCalendarDay,
  WordCalendarPayload,
  WordSummary,
} from "~~/types/index";
import { JLPT_LEVELS } from "./jlpt";
import {
  POS_GROUP_IDS,
  WORD_PROCESSES,
  WORD_STRATA,
  posGroupsOf,
} from "./word-labels";
import {
  WORD_ENTRIES,
  calendarForMonth,
  monthsWithEntries,
  todayJst,
} from "./words";

export { MAX_QUERY_LENGTH } from "./explore-query";

export const STRATUM_IDS = Object.keys(WORD_STRATA) as WordStratum[];
export const PROCESS_IDS = Object.keys(WORD_PROCESSES) as WordProcess[];
/** The layers Explore offers: the four, then the words with none stated. */
export const STRATUM_KEYS: StratumKey[] = [...STRATUM_IDS, "unstated"];

/** Lower-case, with katakana folded to hiragana, so ラジオ is found by らじお. */
export function foldForSearch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .trim();
}

const summaryOf = (e: WordEntry): WordSummary => ({
  date: e.date,
  term: e.term,
  kana: e.kana,
  meaning: e.meaning,
  level: e.level,
  stratum: e.stratum,
  processes: e.processes,
  hasParts: e.morphemes.length > 0,
});

type Facet = "level" | "stratum" | "process" | "pos";

const strataOf = (e: WordEntry): StratumKey[] => [e.stratum ?? "unstated"];

/** Whether `have` satisfies the choices: any one of them, or every one. */
const satisfies = (
  chosen: readonly string[] | undefined,
  have: readonly string[],
  match: "any" | "all",
): boolean =>
  !chosen?.length ||
  (match === "all"
    ? chosen.every((c) => have.includes(c))
    : chosen.some((c) => have.includes(c)));

/** Whether an entry passes every filter except `skip` (used for facet counts).
 *  A word has one level and one layer, so those read "any" whatever `match`
 *  says: "all" of two levels could never match. */
function passes(
  e: WordEntry,
  f: ExploreFilters,
  q: string,
  skip?: Facet,
): boolean {
  const match = f.match ?? "any";
  if (skip !== "level" && !satisfies(f.level, [e.level], "any")) return false;
  if (skip !== "stratum" && !satisfies(f.stratum, strataOf(e), "any"))
    return false;
  if (skip !== "process" && !satisfies(f.process, e.processes, match))
    return false;
  if (skip !== "pos" && !satisfies(f.pos, posGroupsOf(e.pos), match))
    return false;
  if (f.part && !e.morphemes.some((m) => m.text === f.part)) return false;
  if (q) {
    const haystack = [e.term, e.kana, e.meaning].map(foldForSearch);
    if (!haystack.some((h) => h.includes(q))) return false;
  }
  return true;
}

function facet<T extends string>(
  values: readonly T[],
  entries: WordEntry[],
  f: ExploreFilters,
  q: string,
  key: Facet,
  valuesOf: (e: WordEntry) => readonly string[],
): FacetCount<T>[] {
  const pool = entries.filter((e) => passes(e, f, q, key));
  return values.map((value) => ({
    value,
    count: pool.filter((e) => valuesOf(e).includes(value)).length,
  }));
}

/** The open words matching every filter, newest first, with each facet's counts. */
export function exploreWords(
  filters: ExploreFilters = {},
  today: string = todayJst(),
): ExplorePayload {
  const open = WORD_ENTRIES.filter((e) => e.date <= today);
  const q = foldForSearch(filters.q ?? "");
  const matches = open.filter((e) => passes(e, filters, q));

  return {
    filters,
    total: open.length,
    count: matches.length,
    words: [...matches].reverse().map(summaryOf),
    facets: {
      level: facet<JlptLevel>(JLPT_LEVELS, open, filters, q, "level", (e) => [
        e.level,
      ]),
      stratum: facet<StratumKey>(
        STRATUM_KEYS,
        open,
        filters,
        q,
        "stratum",
        strataOf,
      ),
      process: facet<WordProcess>(
        PROCESS_IDS,
        open,
        filters,
        q,
        "process",
        (e) => e.processes,
      ),
      pos: facet<PosGroup>(POS_GROUP_IDS, open, filters, q, "pos", (e) =>
        posGroupsOf(e.pos),
      ),
    },
  };
}

/** One month of the calendar marked against the filters. An open day carries
 *  `match`; an upcoming day carries nothing, so a word that has not opened
 *  cannot be found by filtering for it. The counts (overall, per month and per
 *  option) are the Explore ones, so both pages agree on every number. */
export function exploreCalendar(
  month: string,
  filters: ExploreFilters = {},
  today: string = todayJst(),
): WordCalendarPayload {
  const explored = exploreWords(filters, today);
  const matched = new Set(explored.words.map((w) => w.date));
  const months = monthsWithEntries();
  const monthCounts = Object.fromEntries(months.map((m) => [m, 0]));
  for (const date of matched) monthCounts[date.slice(0, 7)]!++;

  const days: WordCalendarDay[] = calendarForMonth(month, today).map((d) =>
    d.status === "open" ? { ...d, match: matched.has(d.date) } : d,
  );
  return {
    month,
    months,
    today,
    days,
    filters,
    total: explored.total,
    count: explored.count,
    monthCounts,
    facets: explored.facets,
  };
}
