import { describe, it, expect } from "vitest";
import reference from "../../data/reference/n2-reference.json";
import {
  N2_FIRST_LESSON_BY_KANJI,
  N2_LESSON_NUMBER_BY_WORD,
  N2_LESSON_STAGES,
  N2_LESSONS,
  getN2Lesson,
} from "~/app/data/lessons-n2";
import { MAX_WORDS_PER_LESSON, kanjiInTerm } from "~/app/data/lessons";
import { N2_WORD_CLUSTERS } from "~/app/data/vocab-guide-n2";

// data/reference/n2-reference.json lists every PoolVocab id
// scripts/seed-pool-data.mjs produces for N2 (same parsing + slugify).
const ids = reference.vocab.map((v) => v.id);

describe("the N2 lesson path", () => {
  it("teaches every N2 word exactly once", () => {
    const taught = N2_LESSONS.flatMap((l) => l.wordIds);
    expect(new Set(taught).size).toBe(taught.length);
    const missing = ids.filter((id) => !N2_LESSON_NUMBER_BY_WORD.has(id));
    expect(missing).toEqual([]);
  });

  it("uses every word family in some stage, exactly once", () => {
    const staged = N2_LESSON_STAGES.flatMap((s) => s.clusters);
    expect(new Set(staged).size).toBe(staged.length);
    expect([...staged].sort()).toEqual(
      N2_WORD_CLUSTERS.map((c) => c.key).sort(),
    );
  });

  it("keeps lessons short and numbered in order", () => {
    N2_LESSONS.forEach((lesson, i) => {
      expect(lesson.number).toBe(i + 1);
      expect(lesson.wordIds.length).toBeGreaterThan(0);
      expect(lesson.wordIds.length).toBeLessThanOrEqual(MAX_WORDS_PER_LESSON);
      expect(lesson.part).toBeLessThanOrEqual(lesson.partCount);
    });
  });

  it("looks lessons up by number", () => {
    expect(getN2Lesson(1)?.number).toBe(1);
    expect(getN2Lesson(0)).toBeUndefined();
    expect(getN2Lesson(N2_LESSONS.length + 1)).toBeUndefined();
    expect(getN2Lesson(1.5)).toBeUndefined();
  });

  it("attaches every cluster's kanjiBreakdowns to exactly one lesson", () => {
    const attached = N2_LESSONS.flatMap((l) =>
      l.kanjiBreakdowns.map((b) => b.word),
    );
    const declared = N2_WORD_CLUSTERS.flatMap(
      (c) => c.kanjiBreakdowns?.map((b) => b.word) ?? [],
    );
    expect(attached.sort()).toEqual(declared.sort());
  });

  it("records the first lesson each kanji appears in", () => {
    for (const [, n] of N2_FIRST_LESSON_BY_KANJI) {
      expect(getN2Lesson(n)).toBeDefined();
    }
    const sample = N2_LESSONS.find(
      (l) => l.clusterKey === N2_WORD_CLUSTERS[0]!.key,
    )!;
    const char = kanjiInTerm(sample.wordIds[0]!)[0];
    if (char) {
      expect(N2_FIRST_LESSON_BY_KANJI.get(char)).toBeLessThanOrEqual(
        sample.number,
      );
    }
  });
});
