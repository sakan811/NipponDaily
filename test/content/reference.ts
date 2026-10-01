import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { toKatakana } from "wanakana";
import { meaningsOverlap } from "~~/shared/meanings";

/**
 * Shared loader + helpers for the content-truth tests: the committed
 * dictionary evidence (data/reference/n5-reference.json, built by
 * `pnpm data:reference`), so the daily words and the word lists are checked
 * against real dictionary data on every run.
 */

export interface RefSense {
  pos: string[];
  glosses: string[];
}
export interface RefEntry {
  idseq: number;
  kanji: string[];
  readings: string[];
  senses: RefSense[];
}
export interface RefVocab {
  id: string;
  seedKey: string;
  term: string;
  kana: string;
  meaning: string;
  listTerm: string;
  listReading: string;
  listMeaning: string;
  jmdict: RefEntry[];
  /** Set only when JMdict has no headword for the word — see
   *  scripts/build-jlpt-reference.mjs. */
  evidence?: { kind: "bound-kanji" | "composed-phrase"; tokens?: string[] };
}
export interface RefKanji {
  strokeCount: number;
  on: string[];
  kun: string[];
  meanings: string[];
}
export interface Reference {
  meta: { sources: Record<string, unknown> };
  vocab: RefVocab[];
  readings: Record<string, string[]>;
  words: string[];
  kanji: Record<string, RefKanji>;
}

const ROOT = resolve(import.meta.dirname, "../..");

/** Loads a level's committed reference snapshot (data/reference/{level}-reference.json).
 *  Cached per level since several test files each import it. */
const referenceCache = new Map<string, Reference>();
export function loadReference(level: string): Reference {
  const cached = referenceCache.get(level);
  if (cached) return cached;
  const ref: Reference = JSON.parse(
    readFileSync(
      resolve(ROOT, `data/reference/${level.toLowerCase()}-reference.json`),
      "utf8",
    ),
  );
  referenceCache.set(level, ref);
  return ref;
}

/** Index helpers for one level's reference — seedKey/listKey -> vocab
 *  entry, so per-level test suites (e.g. test/content/n4/) don't need to
 *  rebuild these Maps themselves. */
export function vocabIndexes(ref: Reference) {
  return {
    vocabBySeedKey: new Map(ref.vocab.map((v) => [v.seedKey, v])),
    vocabByListKey: new Map(
      ref.vocab.map((v) => [`${v.listTerm} ${v.listReading}`, v]),
    ),
  };
}

export const reference: Reference = loadReference("N5");

const n5Indexes = vocabIndexes(reference);
export const vocabBySeedKey = n5Indexes.vocabBySeedKey;
/** The word list's own `term reading` — the key the word-list overrides use. */
export const vocabByListKey = n5Indexes.vocabByListKey;

/** Every English gloss JMdict gives a word, across all matched entries. */
export function glossesOf(v: RefVocab): string[] {
  return v.jmdict.flatMap((e) => e.senses.flatMap((s) => s.glosses));
}

/** True when a hand-written English meaning is backed by JMdict: every
 *  `;`-separated sense shares a content word with some JMdict gloss. */
export function unsupportedSenses(
  meaning: string,
  glosses: string[],
): string[] {
  const all = glosses.join("; ");
  return meaning
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter(
      (sense) =>
        !glosses.some((g) => meaningsOverlap(sense, g)) &&
        !meaningsOverlap(sense, all),
    );
}

/** KANJIDIC2 readings of a kanji as bare katakana (okurigana dots and
 *  affix dashes removed). Defaults to N5's reference; pass another level's
 *  Reference (from loadReference()) to check against its own kanji data. */
export function kanjiReadings(
  char: string,
  ref: Reference = reference,
): string[] {
  const k = ref.kanji[char];
  if (!k) return [];
  return [...k.on, ...k.kun].map((r) =>
    toKatakana(r.replace(/[.-]/g, "").split(".")[0] ?? ""),
  );
}
