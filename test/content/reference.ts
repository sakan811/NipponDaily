import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import kuromoji from "kuromoji";
import { toKatakana, toRomaji } from "wanakana";
import { meaningsOverlap } from "~~/shared/meanings";

/**
 * Shared loader + helpers for the content-truth tests: the committed
 * dictionary evidence (data/reference/n5-reference.json, built by
 * `pnpm data:reference`) and a Japanese tokenizer, so hand-written lesson
 * content is checked against real dictionary data on every run.
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

export const reference: Reference = JSON.parse(
  readFileSync(resolve(ROOT, "data/reference/n5-reference.json"), "utf8"),
);

export const vocabById = new Map(reference.vocab.map((v) => [v.id, v]));
export const vocabBySeedKey = new Map(
  reference.vocab.map((v) => [v.seedKey, v]),
);
/** The word list's own `term reading` — the key the seed overrides use. */
export const vocabByListKey = new Map(
  reference.vocab.map((v) => [`${v.listTerm} ${v.listReading}`, v]),
);

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
 *  affix dashes removed). */
export function kanjiReadings(char: string): string[] {
  const k = reference.kanji[char];
  if (!k) return [];
  return [...k.on, ...k.kun].map((r) =>
    toKatakana(r.replace(/[.-]/g, "").split(".")[0] ?? ""),
  );
}

/** Lower-case wāpuro rōmaji (the site's convention: ou/ei, no macrons)
 *  with spacing, hyphens, apostrophes and punctuation removed. */
export function normRomaji(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

/** Loanword digraphs this wanakana version splits (フォーク → "fuooku"). */
const DIGRAPHS: Record<string, string> = {
  ファ: "fa",
  フィ: "fi",
  フェ: "fe",
  フォ: "fo",
  ティ: "ti",
  ディ: "di",
  デュ: "dyu",
  トゥ: "tu",
  ウィ: "wi",
  ウェ: "we",
  ウォ: "wo",
  シェ: "she",
  ジェ: "je",
  チェ: "che",
};

export function kanaToRomaji(kana: string): string {
  const pattern = new RegExp(`(${Object.keys(DIGRAPHS).join("|")})(ー?)`, "gu");
  const k = toKatakana(kana).replace(
    pattern,
    (_m, pair: string, dash: string) => {
      const r = DIGRAPHS[pair]!;
      return `{${r}${dash ? r.slice(-1) : ""}}`;
    },
  );
  // Convert around the protected digraphs, then unwrap them.
  return normRomaji(
    k
      .split(/(\{[a-z]+\})/)
      .map((part) =>
        part.startsWith("{") ? part.slice(1, -1) : toRomaji(part),
      )
      .join(""),
  );
}

let tokenizerPromise: Promise<
  kuromoji.Tokenizer<kuromoji.IpadicFeatures>
> | null = null;
export function tokenizer() {
  tokenizerPromise ??= new Promise((res, rej) =>
    kuromoji
      .builder({ dicPath: resolve(ROOT, "node_modules/kuromoji/dict") })
      .build((err, t) => (err ? rej(err) : res(t))),
  );
  return tokenizerPromise;
}

export const KANJI_RE = /[㐀-䶿一-鿿々]/;
