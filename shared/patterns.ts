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
  RendakuPayload,
  RendakuReading,
  RendakuSound,
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

/** Where the four-kana merger left only one voiced sound: ち is voiced as じ, つ as ず. */
const MERGED_VOICED: Record<string, string> = { ち: "じ", つ: "ず" };

/** The voiced counterpart of a kana (か → が, ひ → び), when it has one. */
function voicedOf(kana: string): string | undefined {
  const voiced = (kana + "゙").normalize("NFC");
  return voiced.length === 1 ? voiced : undefined;
}

export type ReadingChange =
  | { kind: "voiced"; from: string; to: string }
  | { kind: "sokuon" }
  | { kind: "other" };

/** What happened to a part's reading, judged only from the two spellings. */
export function classifyChange(base: string, reading: string): ReadingChange {
  if (base.length === reading.length) {
    const first = base[0]!;
    const voiced = reading[0]!;
    if (
      base.slice(1) === reading.slice(1) &&
      (voiced === voicedOf(first) || voiced === MERGED_VOICED[first])
    ) {
      return { kind: "voiced", from: first, to: voiced };
    }
    if (reading.endsWith("っ") && base.slice(0, -1) === reading.slice(0, -1)) {
      return { kind: "sokuon" };
    }
  }
  return { kind: "other" };
}

/** The reading changes the open entries record (a part whose `base` differs
 *  from its `reading`), grouped by what changed. */
function rendakuFor(open: WordEntry[]): RendakuPayload {
  const byCount = (a: RendakuReading, b: RendakuReading) =>
    b.count - a.count || a.part.localeCompare(b.part, "ja");

  const readings = new Map<
    string,
    { reading: RendakuReading; change: ReadingChange }
  >();
  const words = new Set<string>();
  const wordsBySound = new Map<string, Set<string>>();

  for (const e of open) {
    e.morphemes.forEach((m, i) => {
      if (!m.base || m.base === m.reading) return;
      words.add(e.date);
      const position = i === 0 ? "first" : "later";
      const key = `${m.text}|${m.base}|${m.reading}|${position}`;
      const slot = readings.get(key) ?? {
        reading: {
          part: m.text,
          base: m.base,
          reading: m.reading,
          position,
          count: 0,
          examples: [],
        },
        change: classifyChange(m.base, m.reading),
      };
      slot.reading.count++;
      if (slot.reading.examples.length < EXAMPLE_LIMIT) {
        slot.reading.examples.push({ date: e.date, term: e.term });
      }
      readings.set(key, slot);

      if (slot.change.kind === "voiced") {
        const sound = `${slot.change.from}${slot.change.to}`;
        const dates = wordsBySound.get(sound) ?? new Set<string>();
        dates.add(e.date);
        wordsBySound.set(sound, dates);
      }
    });
  }

  const voiced = new Map<string, RendakuSound>();
  const sokuon: RendakuReading[] = [];
  const other: RendakuReading[] = [];
  for (const { reading, change } of readings.values()) {
    if (change.kind === "sokuon") sokuon.push(reading);
    else if (change.kind === "other") other.push(reading);
    else {
      const id = `${change.from}${change.to}`;
      const sound = voiced.get(id) ?? {
        from: change.from,
        to: change.to,
        // Words, not readings: a word shows a given sound change once.
        count: wordsBySound.get(id)!.size,
        readings: [],
      };
      sound.readings.push(reading);
      voiced.set(id, sound);
    }
  }

  return {
    words: words.size,
    voiced: [...voiced.values()]
      .map((s) => ({ ...s, readings: s.readings.sort(byCount) }))
      .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from, "ja")),
    sokuon: sokuon.sort(byCount),
    other: other.sort(byCount),
  };
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
    rendaku: rendakuFor(open),
  };
}
