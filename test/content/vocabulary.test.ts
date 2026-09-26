import { describe, it, expect } from "vitest";
import { toKatakana } from "wanakana";
import {
  VOCAB_FORM_CORRECTIONS,
  VOCAB_MEANING_ENRICHMENTS,
  servedVocab,
} from "~~/shared/meanings";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";
import { LESSON_NUMBER_BY_WORD } from "~/app/data/lessons";
import {
  VOCAB_MEANING_OVERRIDES,
  VOCAB_POS_OVERRIDES,
  VOCAB_READING_OVERRIDES,
  checkMeaning,
  // @ts-expect-error — untyped .mjs seed script
} from "~/scripts/seed-n5-data.mjs";
import {
  glossesOf,
  kanjiReadings,
  reference,
  unsupportedSenses,
  vocabById,
  vocabByListKey,
  vocabBySeedKey,
} from "./reference";

/**
 * The N5 pool itself — every word the lessons, vocab guide and daily game
 * show — checked against JMdict/KANJIDIC2 evidence in
 * data/reference/n5-reference.json. A wrong form or reading in the source
 * word list, or a hand-written meaning JMdict doesn't back, fails here.
 */

const stripAffix = (s: string) => s.replace(/[～〜~]/g, "");

describe("every served N5 word", () => {
  it("is a real dictionary word with that reading", () => {
    const unknown = reference.vocab.filter((v) => {
      if (v.jmdict.length > 0) return false;
      // Single-kanji affixes (～月 がつ, ～回 かい) are checked against the
      // character's own KANJIDIC2 readings instead.
      const term = stripAffix(v.term);
      return !(
        [...term].length === 1 &&
        kanjiReadings(term).includes(toKatakana(stripAffix(v.kana)))
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

  it("is taught by a lesson, and every lesson word is a real pool word", () => {
    const untaught = reference.vocab
      .map((v) => v.id)
      .filter((id) => !LESSON_NUMBER_BY_WORD.has(id));
    expect(untaught, "N5 words missing from the lesson path").toEqual([]);

    const unknownIds = WORD_CLUSTERS.flatMap((c) =>
      c.rows.flatMap((r) => r.terms),
    ).filter((id) => !vocabById.has(id));
    expect(unknownIds, "cluster terms that aren't pool ids").toEqual([]);
  });
});

describe("hand-written meanings are backed by JMdict", () => {
  it.each(Object.entries(VOCAB_MEANING_ENRICHMENTS))(
    "enrichment %s → %s",
    (key, meaning) => {
      const v = vocabBySeedKey.get(key);
      expect(v, `${key} is not an N5 pool word`).toBeDefined();
      expect(unsupportedSenses(meaning, glossesOf(v!))).toEqual([]);
    },
  );

  it.each(Object.entries(VOCAB_MEANING_OVERRIDES as Record<string, string>))(
    "seed override %s → %s",
    (key, meaning) => {
      const v = vocabByListKey.get(key);
      expect(v, `${key} is not in the word list`).toBeDefined();
      expect(unsupportedSenses(meaning, glossesOf(v!))).toEqual([]);
    },
  );

  it.each(
    Object.entries(VOCAB_FORM_CORRECTIONS).filter(([, fix]) => fix.meaning),
  )("form correction %s", (key, fix) => {
    const v = vocabBySeedKey.get(key);
    expect(v).toBeDefined();
    expect(unsupportedSenses(fix.meaning!, glossesOf(v!))).toEqual([]);
  });

  it.each(Object.entries(VOCAB_READING_OVERRIDES as Record<string, string>))(
    "seed reading override %s → %s is a JMdict reading",
    (key, reading) => {
      const v = vocabByListKey.get(key);
      expect(v).toBeDefined();
      expect(v!.jmdict.flatMap((e) => e.readings)).toContain(reading);
    },
  );

  it.each(Object.entries(VOCAB_POS_OVERRIDES as Record<string, string>))(
    "seed part-of-speech override %s → %s is a JMdict tag",
    (key, pos) => {
      const v = vocabBySeedKey.get(key);
      expect(v).toBeDefined();
      expect(
        v!.jmdict.flatMap((e) => e.senses.flatMap((s) => s.pos)),
      ).toContain(pos);
    },
  );
});

describe("data/reference/n5-reference.json", () => {
  it("is up to date with shared/meanings.ts (else run pnpm data:reference)", () => {
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
