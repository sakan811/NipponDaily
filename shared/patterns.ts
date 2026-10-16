/**
 * Counts across the open words: how the vocabulary splits by layer, JLPT level
 * and process, which processes turn up together, how the pitch falls and which
 * readings several words share. Derived entirely from the entries' own fields
 * — it states nothing about a word that its entry does not already say.
 *
 * Server and tests only: it reads every entry, so every function takes `today`
 * and counts open days only.
 */
import type {
  LengthByLevel,
  PatternCount,
  PitchByLayer,
  PatternRow,
  PatternsPayload,
  ProcessPair,
  RendakuPayload,
  RendakuReading,
  RendakuSound,
  SoundAlikeGroup,
  SoundAlikesPayload,
  StratumKey,
  TagCombination,
  WordEntry,
  WordProcess,
  WordStratum,
} from "~~/types/index";
import { PITCH_TYPES, moraeOf, pitchTypesOf } from "../app/utils/pitch";
import type { PitchType } from "../app/utils/pitch";
import { JLPT_LEVELS } from "./jlpt";
import { kanjiIn } from "./japanese";
import {
  PATTERN_EXAMPLE_LIMIT,
  SOUND_ALIKE_GROUP_LIMIT,
  PATTERN_MAX_COMBINATION,
  PATTERN_MIN_COMBINATION,
} from "./limits";
import { PROCESS_IDS, STRATUM_IDS } from "./explore";
import { readingKey } from "./related";
import { WORD_ENTRIES, todayJst } from "./words";

/** How many pairs and larger combinations to list. */
const PAIR_LIMIT = 10;
const COMBINATION_LIMIT = 10;
// Combination sizes and the example limit are in shared/limits.ts.

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
      if (slot.reading.examples.length < PATTERN_EXAMPLE_LIMIT) {
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

/** Every way to choose `size` items from `items`, in order. */
function choose<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  const out: T[][] = [];
  items.forEach((item, i) => {
    for (const rest of choose(items.slice(i + 1), size - 1)) {
      out.push([item, ...rest]);
    }
  });
  return out;
}

/** The sets of three or four tags (a word's processes and its layer) that turn
 *  up together, with the words that carry them. A set is dropped when a
 *  larger one is carried by exactly the same words, so one word does not
 *  appear under every one of its sub-sets. */
function combinationsFor(open: WordEntry[]): TagCombination[] {
  const found = new Map<string, TagCombination>();

  for (const e of open) {
    const tags: string[] = [...new Set(e.processes)].sort(
      (a, b) =>
        PROCESS_IDS.indexOf(a as WordProcess) -
        PROCESS_IDS.indexOf(b as WordProcess),
    );
    if (e.stratum) tags.push(e.stratum);
    for (
      let size = PATTERN_MIN_COMBINATION;
      size <= PATTERN_MAX_COMBINATION;
      size++
    ) {
      for (const set of choose(tags, size)) {
        const key = set.join("|");
        const slot = found.get(key) ?? {
          stratum: set.find((t) => STRATUM_IDS.includes(t as WordStratum)) as
            WordStratum | undefined,
          processes: set.filter(
            (t) => !STRATUM_IDS.includes(t as WordStratum),
          ) as WordProcess[],
          count: 0,
          examples: [],
        };
        slot.count++;
        if (slot.examples.length < PATTERN_EXAMPLE_LIMIT) {
          slot.examples.push({ date: e.date, term: e.term });
        }
        found.set(key, slot);
      }
    }
  }

  // A set is redundant when a larger one has the same count: the same words
  // carry both. Only sets one tag larger need checking, grouped by count.
  const biggerByCount = new Map<number, string[][]>();
  for (const [key, c] of found) {
    const tags = key.split("|");
    if (tags.length <= PATTERN_MIN_COMBINATION) continue;
    const bucket = biggerByCount.get(c.count) ?? [];
    bucket.push(tags);
    biggerByCount.set(c.count, bucket);
  }
  const all = [...found.entries()];
  return all
    .filter(([key, c]) => {
      const tags = key.split("|");
      return !(biggerByCount.get(c.count) ?? []).some(
        (bigger) =>
          bigger.length > tags.length && tags.every((t) => bigger.includes(t)),
      );
    })
    .map(([, c]) => c)
    .sort(
      (x, y) =>
        y.count - x.count ||
        y.processes.length +
          (y.stratum ? 1 : 0) -
          (x.processes.length + (x.stratum ? 1 : 0)) ||
        x.processes.join().localeCompare(y.processes.join()),
    )
    .slice(0, COMBINATION_LIMIT);
}

const PITCH_PATTERNS = Object.keys(PITCH_TYPES) as PitchType[];

/** The accents the open entries show, split into patterns for each layer. A
 *  layer no open word with an accent belongs to is left out. */
function pitchByLayer(open: WordEntry[]): PitchByLayer[] {
  return STRATUM_KEYS.map((value) => {
    const accents = Object.fromEntries(
      PITCH_PATTERNS.map((p) => [p, 0]),
    ) as Record<PitchType, number>;
    let words = 0;
    for (const e of open) {
      if (stratumKey(e) !== value || !e.pitch?.length) continue;
      words++;
      for (const type of pitchTypesOf(e.kana, e.pitch)) accents[type]++;
    }
    return { value, words, accents };
  }).filter((row) => row.words > 0);
}

const oneDecimal = (n: number): number => Math.round(n * 10) / 10;

/** The mean length of the open words of each JLPT level: morae in the reading,
 *  kanji in the spelling. */
function lengthsByLevel(open: WordEntry[]): LengthByLevel[] {
  return JLPT_LEVELS.map((value) => {
    const words = open.filter((e) => e.level === value);
    const total = (f: (e: WordEntry) => number) =>
      words.reduce((sum, e) => sum + f(e), 0);
    const mean = (f: (e: WordEntry) => number) =>
      words.length ? oneDecimal(total(f) / words.length) : 0;
    return {
      value,
      words: words.length,
      meanMorae: mean((e) => moraeOf(e.kana.replace(/[～〜]/g, "")).length),
      meanKanji: mean((e) => kanjiIn(e.term).length),
      kanaOnly: words.filter((e) => kanjiIn(e.term).length === 0).length,
    };
  }).filter((row) => row.words > 0);
}

/** The readings two or more open words share, the readings with the most
 *  words first, and whether each word's pitch accent sets it apart. Only
 *  readings are compared; nothing is said about how the words are related. */
function soundAlikesFor(open: WordEntry[]): SoundAlikesPayload {
  const byReading = new Map<string, WordEntry[]>();
  for (const e of open) {
    const key = readingKey(e.kana);
    byReading.set(key, [...(byReading.get(key) ?? []), e]);
  }
  const groups: SoundAlikeGroup[] = [...byReading.entries()]
    .filter(([, words]) => words.length > 1)
    .map(([reading, words]) => {
      const accents = words.map((e) => e.pitch ?? []);
      const all = accents.flat();
      return {
        reading,
        words: words.map((e) =>
          e.pitch?.length
            ? { date: e.date, term: e.term, pitch: e.pitch }
            : { date: e.date, term: e.term },
        ),
        toldApart:
          accents.every((a) => a.length > 0) &&
          new Set(all).size === all.length,
      };
    });
  return {
    readings: groups.length,
    words: groups.reduce((n, g) => n + g.words.length, 0),
    withAccents: groups.filter((g) => g.words.every((w) => w.pitch)).length,
    toldApart: groups.filter((g) => g.toldApart).length,
    groups: groups
      .sort(
        (a, b) =>
          b.words.length - a.words.length || a.reading.localeCompare(b.reading),
      )
      .slice(0, SOUND_ALIKE_GROUP_LIMIT),
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
        if (pair.examples.length < PATTERN_EXAMPLE_LIMIT) {
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
    combinations: combinationsFor(open),
    rendaku: rendakuFor(open),
    pitch: pitchByLayer(open),
    lengths: lengthsByLevel(open),
    soundAlikes: soundAlikesFor(open),
  };
}
