import { describe, it, expect } from "vitest";
import { VOCAB_FORM_CORRECTIONS, servedVocab } from "~~/shared/meanings";
import { N2_WORD_CLUSTERS } from "~/app/data/vocab-guide-n2";
import { N2_LESSON_NUMBER_BY_WORD } from "~/app/data/lessons-n2";
import {
  checkMeaning,
  // @ts-expect-error — untyped .mjs seed script
} from "~/scripts/seed-pool-data.mjs";
import {
  glossesOf,
  loadReference,
  unsupportedSenses,
  vocabIndexes,
} from "../reference";

/**
 * The N2 pool — every word the N2 lessons, /vocab and the daily game serve —
 * checked against JMdict/KANJIDIC2 evidence in data/reference/n2-reference.json.
 * Mirrors test/content/n3/vocabulary.test.ts; see CLAUDE.md's Content Accuracy
 * section.
 */

const reference = loadReference("N2");
const { vocabBySeedKey } = vocabIndexes(reference);

describe("every served N2 word", () => {
  it("is a real dictionary word with that reading", () => {
    // Evidence is a JMdict headword, or (recorded by the reference builder)
    // a bound affix kanji read as KANJIDIC2 says it can be, or a set phrase
    // made only of real words.
    const unknown = reference.vocab.filter(
      (v) => v.jmdict.length === 0 && !v.evidence,
    );
    expect(
      unknown.map((v) => `${v.id}: ${v.term} (${v.kana})`),
      "not in JMdict — fix it in shared/meanings.ts VOCAB_FORM_CORRECTIONS",
    ).toEqual([]);
    expect(reference.meta.unresolvedInJmdict).toEqual([]);
  });

  it("is taught by a lesson, and every lesson word is a real pool word", () => {
    const untaught = reference.vocab
      .map((v) => v.id)
      .filter((id) => !N2_LESSON_NUMBER_BY_WORD.has(id));
    expect(untaught, "N2 words missing from the lesson path").toEqual([]);

    const vocabByIdSet = new Set(reference.vocab.map((v) => v.id));
    const unknownIds = N2_WORD_CLUSTERS.flatMap((c) =>
      c.rows.flatMap((r) => r.terms),
    ).filter((id) => !vocabByIdSet.has(id));
    expect(unknownIds, "cluster terms that aren't pool ids").toEqual([]);
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
  it("every N2 form correction's meaning is a real JMdict gloss", () => {
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

describe("data/reference/n2-reference.json", () => {
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
