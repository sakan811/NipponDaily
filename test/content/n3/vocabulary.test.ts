import { describe, it, expect } from "vitest";
import { toKatakana } from "wanakana";
import { VOCAB_FORM_CORRECTIONS, servedVocab } from "~~/shared/meanings";
import {
  checkMeaning,
  // @ts-expect-error — untyped .mjs seed script
} from "~/scripts/seed-pool-data.mjs";
import {
  glossesOf,
  kanjiReadings,
  loadReference,
  unsupportedSenses,
  vocabIndexes,
} from "../reference";

/**
 * The N3 pool itself — every word it serves — checked against
 * JMdict/KANJIDIC2 evidence in
 * data/reference/n3-reference.json. Mirrors test/content/n4/vocabulary.test.ts's
 * N4 checks; see CLAUDE.md's Content Accuracy section.
 */

const reference = loadReference("N3");
const { vocabBySeedKey } = vocabIndexes(reference);

const stripAffix = (s: string) => s.replace(/[～〜~]/g, "");

describe("every served N3 word", () => {
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
  // N3 has no VOCAB_FORM_CORRECTIONS meaning overrides yet, so this is a
  // plain loop rather than it.each (vitest rejects an empty it.each table).
  it("every N3 form correction's meaning is a real JMdict gloss", () => {
    const unsupported = Object.entries(VOCAB_FORM_CORRECTIONS)
      .filter(([key, fix]) => fix.meaning && vocabBySeedKey.has(key))
      .flatMap(([key, fix]) =>
        unsupportedSenses(
          fix.meaning!,
          glossesOf(vocabBySeedKey.get(key)!),
        ).map((sense) => `${key}: ${sense}`),
      );
    expect(unsupported).toEqual([]);
  });
});

describe("data/reference/n3-reference.json", () => {
  it("is up to date with shared/meanings.ts (else run pnpm data:reference:jlpt)", () => {
    const stale = reference.vocab.filter((v) => {
      const seedKana = v.seedKey.slice(v.listTerm.length + 1);
      const served = servedVocab({
        term: v.listTerm,
        kana: seedKana,
        romaji: "",
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
