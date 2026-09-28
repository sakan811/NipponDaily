import { describe, it, expect } from "vitest";
import reference from "../../data/reference/n4-reference.json";
import {
  N4_FIRST_LESSON_BY_KANJI,
  N4_LESSON_NUMBER_BY_WORD,
  N4_LESSON_STAGES,
  N4_LESSONS,
  getN4Lesson,
} from "~/app/data/lessons-n4";
import { MAX_WORDS_PER_LESSON, kanjiInTerm } from "~/app/data/lessons";
import { N4_WORD_CLUSTERS } from "~/app/data/vocab-guide-n4";

// data/reference/n4-reference.json lists every PoolVocab id
// scripts/seed-pool-data.mjs produces for N4 (same parsing + slugify).
const ids = reference.vocab.map((v) => v.id);

describe("the N4 lesson path", () => {
  it("teaches every N4 word exactly once", () => {
    const taught = N4_LESSONS.flatMap((l) => l.wordIds);
    expect(new Set(taught).size).toBe(taught.length);
    const missing = ids.filter((id) => !N4_LESSON_NUMBER_BY_WORD.has(id));
    expect(missing).toEqual([]);
  });

  it("uses every word family in some stage, exactly once", () => {
    const staged = N4_LESSON_STAGES.flatMap((s) => s.clusters);
    expect(new Set(staged).size).toBe(staged.length);
    expect([...staged].sort()).toEqual(
      N4_WORD_CLUSTERS.map((c) => c.key).sort(),
    );
  });

  it("keeps lessons short and numbered in order", () => {
    N4_LESSONS.forEach((lesson, i) => {
      expect(lesson.number).toBe(i + 1);
      expect(lesson.wordIds.length).toBeGreaterThan(0);
      expect(lesson.wordIds.length).toBeLessThanOrEqual(MAX_WORDS_PER_LESSON);
      expect(lesson.part).toBeLessThanOrEqual(lesson.partCount);
    });
  });

  it("looks lessons up by number", () => {
    expect(getN4Lesson(1)?.number).toBe(1);
    expect(getN4Lesson(0)).toBeUndefined();
    expect(getN4Lesson(N4_LESSONS.length + 1)).toBeUndefined();
    expect(getN4Lesson(1.5)).toBeUndefined();
  });

  it("attaches every cluster's kanjiBreakdowns to exactly one lesson", () => {
    const attached = N4_LESSONS.flatMap((l) =>
      l.kanjiBreakdowns.map((b) => b.word),
    );
    const declared = N4_WORD_CLUSTERS.flatMap(
      (c) => c.kanjiBreakdowns?.map((b) => b.word) ?? [],
    );
    expect(attached.sort()).toEqual(declared.sort());
  });

  it("records the first lesson each kanji appears in", () => {
    for (const [, n] of N4_FIRST_LESSON_BY_KANJI) {
      expect(getN4Lesson(n)).toBeDefined();
    }
    const sample = N4_LESSONS.find((l) => l.clusterKey === "keigo")!;
    const char = kanjiInTerm(sample.wordIds[0]!)[0];
    if (char) {
      expect(N4_FIRST_LESSON_BY_KANJI.get(char)).toBeLessThanOrEqual(
        sample.number,
      );
    }
  });
});
