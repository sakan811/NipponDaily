/**
 * The morpheme index: which open words show a given part in their "Taken
 * apart" row. Derived entirely from the generated entries' `morphemes` — no new
 * claims, just the same verified data read across words instead of within one.
 *
 * Server and tests only, for the same reason as shared/words.ts: it reads every
 * entry, so every function here takes `today` and looks only at open days —
 * counts and lists never reveal an upcoming word.
 */
import type {
  PartDetail,
  PartSummary,
  PartUse,
  PartWordRef,
  WordEntry,
} from "~~/types/index";
import { WORD_ENTRIES, todayJst } from "./words";

/** The longest part text the API accepts (the longest in the data is far shorter). */
export const MAX_PART_LENGTH = 12;

const HAN = /\p{Script=Han}/u;

const openEntries = (today: string): WordEntry[] =>
  WORD_ENTRIES.filter((e) => e.date <= today);

const refOf = (e: WordEntry): PartWordRef => ({
  date: e.date,
  term: e.term,
  kana: e.kana,
  meaning: e.meaning,
  stratum: e.stratum,
});

/** Most-used first, ties by the order they were first seen. */
function byFrequency(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
}

/** Every morpheme shown by an open word, most-used first. */
export function partsIndex(today: string = todayJst()): PartSummary[] {
  const seen = new Map<string, { dates: Set<string>; readings: string[] }>();
  for (const e of openEntries(today)) {
    for (const m of e.morphemes) {
      const slot = seen.get(m.text) ?? { dates: new Set(), readings: [] };
      slot.dates.add(e.date);
      slot.readings.push(m.reading);
      seen.set(m.text, slot);
    }
  }
  return [...seen.entries()]
    .map(([text, { dates, readings }]) => ({
      text,
      count: dates.size,
      readings: byFrequency(readings),
    }))
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text, "ja"));
}

/** One morpheme with every open word that uses it, or undefined when no open
 *  word shows it as a part. */
export function partDetail(
  text: string,
  today: string = todayJst(),
): PartDetail | undefined {
  const uses: PartUse[] = [];
  const usedDates = new Set<string>();
  for (const e of openEntries(today)) {
    for (const m of e.morphemes) {
      if (m.text !== text) continue;
      usedDates.add(e.date);
      uses.push({
        reading: m.reading,
        base: m.base,
        meaning: m.meaning,
        irregular: m.irregular,
        word: refOf(e),
        parts: e.morphemes.map((p) => p.text),
      });
    }
  }
  if (!uses.length) return undefined;

  const readings = byFrequency(uses.map((u) => u.reading)).map((reading) => ({
    reading,
    uses: uses.filter((u) => u.reading === reading),
  }));

  // Spelling-only matches make sense for kanji parts; a kana part like お
  // would match half the catalogue.
  const alsoIn = HAN.test(text)
    ? openEntries(today)
        .filter((e) => e.term.includes(text) && !usedDates.has(e.date))
        .map(refOf)
    : [];

  return { text, count: usedDates.size, readings, alsoIn };
}
