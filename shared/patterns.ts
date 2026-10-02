/**
 * Counts across the open words: how the vocabulary splits by layer, JLPT level
 * and process, and which processes turn up together. Derived entirely from the
 * entries' own `stratum`, `level`, `processes` and `morphemes` — it states
 * nothing about a word that its entry does not already say.
 *
 * Server and tests only: it reads every entry, so every function takes `today`
 * and counts open days only.
 */
import type {
  PatternCount,
  PatternRow,
  PatternsPayload,
  ProcessPair,
  StratumKey,
  WordEntry,
  WordProcess,
} from "~~/types/index";
import { JLPT_LEVELS } from "./jlpt";
import { PROCESS_IDS, STRATUM_IDS } from "./explore";
import { WORD_ENTRIES, todayJst } from "./words";

/** How many pairs to list and how many example words each carries. */
const PAIR_LIMIT = 10;
const EXAMPLE_LIMIT = 3;

const STRATUM_KEYS: StratumKey[] = [...STRATUM_IDS, "unstated"];

const stratumKey = (e: WordEntry): StratumKey => e.stratum ?? "unstated";

const emptyByStratum = (): Record<StratumKey, number> =>
  Object.fromEntries(STRATUM_KEYS.map((k) => [k, 0])) as Record<
    StratumKey,
    number
  >;

/** One row per value: how many of `entries` carry it, and their layer split. */
function rows<T extends string>(
  values: readonly T[],
  entries: WordEntry[],
  valuesOf: (e: WordEntry) => T[],
): PatternRow<T>[] {
  return values.map((value) => {
    const byStratum = emptyByStratum();
    let count = 0;
    for (const e of entries) {
      if (!valuesOf(e).includes(value)) continue;
      count++;
      byStratum[stratumKey(e)]++;
    }
    return { value, count, byStratum };
  });
}

export function patternsFor(today: string = todayJst()): PatternsPayload {
  const open = WORD_ENTRIES.filter((e) => e.date <= today);

  const strata: PatternCount<StratumKey>[] = STRATUM_KEYS.map((value) => ({
    value,
    count: open.filter((e) => stratumKey(e) === value).length,
  }));

  const processes = rows<WordProcess>(PROCESS_IDS, open, (e) => e.processes)
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  // Every unordered pair of distinct processes on the same word.
  const pairs = new Map<string, ProcessPair>();
  for (const e of open) {
    const tags = [...new Set(e.processes)].sort(
      (a, b) => PROCESS_IDS.indexOf(a) - PROCESS_IDS.indexOf(b),
    );
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const a = tags[i]!;
        const b = tags[j]!;
        const key = `${a}|${b}`;
        const pair = pairs.get(key) ?? { a, b, count: 0, examples: [] };
        pair.count++;
        if (pair.examples.length < EXAMPLE_LIMIT) {
          pair.examples.push({ date: e.date, term: e.term });
        }
        pairs.set(key, pair);
      }
    }
  }

  return {
    total: open.length,
    withParts: open.filter((e) => e.morphemes.length > 0).length,
    withBase: open.filter((e) => e.morphemes.some((m) => m.base)).length,
    strata,
    levels: rows(JLPT_LEVELS, open, (e) => [e.level]),
    processes,
    pairs: [...pairs.values()]
      .sort((x, y) => y.count - x.count)
      .slice(0, PAIR_LIMIT),
  };
}
