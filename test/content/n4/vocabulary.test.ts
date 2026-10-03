import { describe, it, expect } from "vitest";
import { toKatakana } from "wanakana";
import { VOCAB_FORM_CORRECTIONS, servedVocab } from "~~/shared/meanings";
import {
  checkMeaning,
  // @ts-expect-error — untyped .mjs script
} from "~/scripts/lib/word-list.mjs";
import {
  glossesOf,
  kanjiReadings,
  loadReference,
  unsupportedSenses,
  vocabIndexes,
} from "../reference";

/**
 * The N4 pool itself — every word it serves — checked against
 * JMdict/KANJIDIC2 evidence in data/reference/n4-reference.json. Mirrors
 * test/content/vocabulary.test.ts's N5 checks; see docs/content.md.
 */

const reference = loadReference("N4");
const { vocabBySeedKey } = vocabIndexes(reference);

const stripAffix = (s: string) => s.replace(/[～〜~]/g, "");

describe("every served N4 word", () => {
  it("is a real dictionary word with that reading", () => {
    const unknown = reference.vocab.filter((v) => {
      if (v.jmdict.length > 0) return false;
      const term = stripAffix(v.term);
      return !(
        [...term].length === 1 &&
        kanjiReadings(term, reference).includes(toKatakana(stripAffix(v.kana)))
      );
    });
    expect(
      unknown.map((v) => `${v.id}: ${v.term} (${v.kana})`),
      "not in JMdict — fix it in shared/meanings.ts VOCAB_FORM_CORRECTIONS",
    ).toEqual([]);
  });

  it("has no meaning that reverses JMdict's (this ↔ that, …)", () => {
    const reversed = reference.vocab
      .map((v) =>
        checkMeaning(
          { term: v.term, kana: v.kana, meaning: v.meaning },
          { kana: v.kana, allGlosses: glossesOf(v) },
        ),
      )
      .filter(Boolean);
    expect(reversed).toEqual([]);
  });
});

describe("hand-written meanings are backed by JMdict", () => {
  it.each(
    Object.entries(VOCAB_FORM_CORRECTIONS).filter(
      ([key, fix]) => fix.meaning && vocabBySeedKey.has(key),
    ),
  )("form correction %s", (key, fix) => {
    const v = vocabBySeedKey.get(key);
    expect(v).toBeDefined();
    expect(unsupportedSenses(fix.meaning!, glossesOf(v!))).toEqual([]);
  });
});

describe("data/reference/n4-reference.json", () => {
  it("is up to date with shared/meanings.ts (else run pnpm data:reference:jlpt)", () => {
    const stale = reference.vocab.filter((v) => {
      const seedKana = v.seedKey.slice(v.listTerm.length + 1);
      const served = servedVocab({
        term: v.listTerm,
        kana: seedKana,
        meaning: v.meaning,
      });
      return served.term !== v.term || served.kana !== v.kana;
    });
    expect(stale.map((v) => v.id)).toEqual([]);
  });

  it("records where its evidence came from", () => {
    expect(Object.keys(reference.meta.sources).sort()).toEqual([
      "jmdict",
      "wordList",
    ]);
  });
});
