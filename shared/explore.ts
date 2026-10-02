/**
 * Browse-and-filter over the open words: the same entries the calendar and the
 * parts index read, narrowed by search text, level, layer, process or part.
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
  WordEntry,
  WordProcess,
  WordStratum,
  WordSummary,
} from "~~/types/index";
import { JLPT_LEVELS } from "./jlpt";
import { WORD_PROCESSES, WORD_STRATA } from "./word-labels";
import { WORD_ENTRIES, todayJst } from "./words";

export const STRATUM_IDS = Object.keys(WORD_STRATA) as WordStratum[];
export const PROCESS_IDS = Object.keys(WORD_PROCESSES) as WordProcess[];

/** The longest search text the API accepts. */
export const MAX_QUERY_LENGTH = 50;

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

type Facet = "level" | "stratum" | "process";

/** Whether an entry passes every filter except `skip` (used for facet counts). */
function passes(
  e: WordEntry,
  f: ExploreFilters,
  q: string,
  skip?: Facet,
): boolean {
  if (skip !== "level" && f.level && e.level !== f.level) return false;
  if (skip !== "stratum" && f.stratum && e.stratum !== f.stratum) return false;
  if (skip !== "process" && f.process && !e.processes.includes(f.process))
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
  valuesOf: (e: WordEntry) => T[],
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
      stratum: facet<WordStratum>(
        STRATUM_IDS,
        open,
        filters,
        q,
        "stratum",
        (e) => (e.stratum ? [e.stratum] : []),
      ),
      process: facet<WordProcess>(
        PROCESS_IDS,
        open,
        filters,
        q,
        "process",
        (e) => e.processes,
      ),
    },
  };
}
