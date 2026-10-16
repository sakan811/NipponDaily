/**
 * "More like this": the open words that most resemble one entry, for the row
 * under it. Derived entirely from fields the entries already carry — their
 * parts, processes and layer — so it states nothing a single entry doesn't.
 * Beside it, the words that opened on the same day of the year and the words
 * that share the entry's reading: a date and a reading compared, nothing more.
 *
 * Server and tests only, like shared/parts.ts: it reads every entry, so it
 * takes `today` and offers open days only.
 */
import type {
  PartWordRef,
  RelatedShared,
  RelatedWord,
  ResolvedReference,
  SoundAlike,
  WordEntry,
  WordReference,
  WordProcess,
  WordStratum,
} from "~~/types/index";
import {
  RELATED_LIMIT,
  RELATED_MIN_SCORE,
  RELATED_PART_WEIGHT,
} from "./limits";
import { katakanaToHiragana } from "./japanese";
import { WORD_ENTRIES, todayJst } from "./words";

/** The open words closest to `entry`, closest first, never the entry itself. */
export function relatedWords(
  entry: WordEntry,
  today: string = todayJst(),
): RelatedWord[] {
  const open = WORD_ENTRIES.filter((e) => e.date <= today);

  const share = (has: (e: WordEntry) => boolean): number =>
    open.filter(has).length / open.length;
  const processShare = (p: WordProcess) =>
    share((e) => e.processes.includes(p));
  const stratumShare = (s: WordStratum) => share((e) => e.stratum === s);

  const parts = new Set(entry.morphemes.map((m) => m.text));
  const processes = new Set(entry.processes);

  const scored = open
    .filter((e) => e.date !== entry.date)
    .map((e) => {
      const shared: RelatedShared = {
        parts: [...new Set(e.morphemes.map((m) => m.text))].filter((t) =>
          parts.has(t),
        ),
        processes: e.processes.filter((p) => processes.has(p)),
        stratum:
          entry.stratum && e.stratum === entry.stratum
            ? entry.stratum
            : undefined,
      };
      const score =
        shared.parts.length * RELATED_PART_WEIGHT +
        shared.processes.reduce((n, p) => n + 1 - processShare(p), 0) +
        (shared.stratum ? 1 - stratumShare(shared.stratum) : 0);
      return { e, shared, score };
    })
    .filter(({ score }) => score >= RELATED_MIN_SCORE);

  // Closest first; among equals, the newest.
  scored.sort((a, b) => b.score - a.score || b.e.date.localeCompare(a.e.date));

  return scored.slice(0, RELATED_LIMIT).map(({ e, shared }) => ({
    date: e.date,
    term: e.term,
    kana: e.kana,
    meaning: e.meaning,
    stratum: e.stratum,
    shared,
  }));
}

const refOf = (e: WordEntry): PartWordRef => ({
  date: e.date,
  term: e.term,
  kana: e.kana,
  meaning: e.meaning,
  stratum: e.stratum,
});

/** The open words whose day falls on the same month and day as the entry's, in
 *  other years, oldest first. Only the dates are compared: nothing about the
 *  words is said to link them. */
export function sameDayWords(
  entry: WordEntry,
  today: string = todayJst(),
): PartWordRef[] {
  const monthDay = entry.date.slice(5);
  return WORD_ENTRIES.filter(
    (e) =>
      e.date <= today && e.date !== entry.date && e.date.slice(5) === monthDay,
  ).map(refOf);
}

/** The reading two words are compared by: katakana folded to hiragana, so
 *  ハシ and はし are read alike. */
export const readingKey = (kana: string): string => katakanaToHiragana(kana);

/** The open words read exactly as the entry is, under another spelling, oldest
 *  first, each with the accents its own entry shows. Only the readings are
 *  compared, so nothing is claimed about how the words are related. */
export function soundAlikesOf(
  entry: WordEntry,
  today: string = todayJst(),
): SoundAlike[] {
  const reading = readingKey(entry.kana);
  return WORD_ENTRIES.filter(
    (e) =>
      e.date <= today &&
      e.date !== entry.date &&
      e.term !== entry.term &&
      readingKey(e.kana) === reading,
  ).map((e) => (e.pitch?.length ? { ...refOf(e), pitch: e.pitch } : refOf(e)));
}

/** The open daily word a JMdict reference points at: the spelling, and the
 *  reading too when JMdict names one. A reference to a kana-only word (just
 *  `term`) also matches a word written with that reading. Only a reference
 *  that fits exactly one open word is linked: 上 alone is うえ, かみ and じょう. */
function openWordFor(
  ref: WordReference,
  open: WordEntry[],
): WordEntry | undefined {
  const reading = katakanaToHiragana(ref.kana ?? ref.term);
  const hits = open.filter((e) =>
    ref.kana
      ? e.term === ref.term && katakanaToHiragana(e.kana) === reading
      : e.term === ref.term ||
        (e.term === e.kana && katakanaToHiragana(e.kana) === reading),
  );
  return hits.length === 1 ? hits[0] : undefined;
}

/** Where the words JMdict points an entry at stand among the open words, each
 *  with the open word it is (never an upcoming one). The references are the
 *  entry's own `antonyms` and `seeAlso`: nothing is added to them. */
export function referencesFor(
  entry: WordEntry,
  today: string = todayJst(),
): { antonyms: ResolvedReference[]; seeAlso: ResolvedReference[] } {
  const open = WORD_ENTRIES.filter((e) => e.date <= today);
  const resolve = (refs: WordReference[] = []): ResolvedReference[] =>
    refs.map((ref) => {
      const hit = openWordFor(ref, open);
      return hit ? { ...ref, word: refOf(hit) } : ref;
    });
  return { antonyms: resolve(entry.antonyms), seeAlso: resolve(entry.seeAlso) };
}
