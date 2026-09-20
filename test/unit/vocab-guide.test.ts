import { describe, it, expect } from "vitest";
import {
  classifyPartOfSpeech,
  WORD_CLUSTERS,
  WORD_TYPE_GROUPS,
} from "~/app/data/vocab-guide";

describe("classifyPartOfSpeech", () => {
  it("buckets ordinary JMdict tags as expected", () => {
    expect(classifyPartOfSpeech("noun (common) (futsuumeishi)")).toBe("noun");
    expect(classifyPartOfSpeech("adjective (keiyoushi)")).toBe("i-adjective");
    expect(
      classifyPartOfSpeech("adjectival nouns or quasi-adjectives (keiyodoshi)"),
    ).toBe("na-adjective");
    expect(classifyPartOfSpeech("Godan verb with 'ru' ending")).toBe("verb");
    expect(classifyPartOfSpeech("adverb (fukushi)")).toBe("adverb");
    expect(classifyPartOfSpeech("pronoun")).toBe("pronoun");
    expect(classifyPartOfSpeech("pre-noun adjectival (rentaishi)")).toBe(
      "pronoun",
    );
    expect(classifyPartOfSpeech(undefined)).toBe("other");
  });

  // "adverb" contains "verb" as a substring, and "pronoun"/"pre-noun" both
  // contain "noun" — a naive substring check run in the wrong order lets
  // the broader verb/noun rule fire first and silently swallow the whole
  // Adverbs and Pronouns & Demonstratives buckets.
  it("does not let the generic verb/noun rules swallow adverb and pronoun tags", () => {
    expect(classifyPartOfSpeech("adverb (fukushi)")).not.toBe("verb");
    expect(classifyPartOfSpeech("pronoun")).not.toBe("noun");
    expect(classifyPartOfSpeech("pre-noun adjectival (rentaishi)")).not.toBe(
      "noun",
    );
  });

  // これ/おれ etc. are fine, but a handful of N5 terms collide by exact kana
  // with a far rarer, unrelated JMdict entry (この with 九's rare "この"
  // reading; どの with 殿's suffix reading; 頭 with the counter for large
  // animals) — see scripts/seed-n5-data.mjs's VOCAB_POS_OVERRIDES for the
  // seed-time fix this mirrors on the client.
  it("overrides known JMdict homograph collisions by term", () => {
    expect(classifyPartOfSpeech("numeric", "この")).toBe("pronoun");
    expect(classifyPartOfSpeech("suffix", "どの")).toBe("pronoun");
    expect(classifyPartOfSpeech("counter", "頭")).toBe("noun");
  });

  it("treats counter/prefix/suffix placeholder terms (～枚, ～歳, …) as counters even with no partOfSpeech match", () => {
    expect(classifyPartOfSpeech(undefined, "～枚")).toBe("counter");
    expect(classifyPartOfSpeech(undefined, "～歳")).toBe("counter");
  });

  it("buckets plain numbers (JMdict tag 'numeric') as nouns", () => {
    expect(classifyPartOfSpeech("numeric", "三")).toBe("noun");
    expect(classifyPartOfSpeech("numeric", "三つ")).toBe("noun");
  });

  it("does not misclassify adj-no words (同じ, …) as verbs just because JMdict's tag text contains the word 'verb'", () => {
    expect(
      classifyPartOfSpeech("noun or verb acting prenominally", "同じ"),
    ).toBe("noun");
  });
});

// Every cluster/group gets its own dedicated page at /vocab/families/[key]
// and /vocab/types/[key] (see app/pages/vocab/families/[key].vue and
// app/pages/vocab/types/[key].vue) — these guard against silently adding a
// new topic without the deep-dive content those pages are built around.
describe("Word Families and Word Types deep-dive content", () => {
  it("gives every word cluster an extended insight, at least one example, and a common mistake", () => {
    for (const cluster of WORD_CLUSTERS) {
      expect(
        cluster.extendedInsight,
        `${cluster.key} extendedInsight`,
      ).toBeTruthy();
      expect(
        cluster.examples?.length ?? 0,
        `${cluster.key} examples`,
      ).toBeGreaterThan(0);
      expect(
        cluster.commonMistake,
        `${cluster.key} commonMistake`,
      ).toBeTruthy();
    }
  });

  it("gives every word-type group except 'other' an extended insight, at least one example, and a common mistake", () => {
    for (const group of WORD_TYPE_GROUPS) {
      if (group.key === "other") continue;
      expect(
        group.extendedInsight,
        `${group.key} extendedInsight`,
      ).toBeTruthy();
      expect(
        group.examples?.length ?? 0,
        `${group.key} examples`,
      ).toBeGreaterThan(0);
      expect(group.commonMistake, `${group.key} commonMistake`).toBeTruthy();
    }
  });
});
