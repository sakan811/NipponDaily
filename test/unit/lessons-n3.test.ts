import { describe, it, expect } from "vitest";
import reference from "../../data/reference/n3-reference.json";
import {
  N3_FIRST_LESSON_BY_KANJI,
  N3_LESSON_NUMBER_BY_WORD,
  N3_LESSON_STAGES,
  N3_LESSONS,
  getN3Lesson,
} from "~/app/data/lessons-n3";
import { MAX_WORDS_PER_LESSON, kanjiInTerm } from "~/app/data/lessons";
import { N3_WORD_CLUSTERS } from "~/app/data/vocab-guide-n3";

// data/reference/n3-reference.json lists every PoolVocab id
// scripts/seed-pool-data.mjs produces for N3 (same parsing + slugify).
const ids = reference.vocab.map((v) => v.id);

describe("the N3 lesson path", () => {
  it("teaches every N3 word exactly once", () => {
    const taught = N3_LESSONS.flatMap((l) => l.wordIds);
    expect(new Set(taught).size).toBe(taught.length);
    const missing = ids.filter((id) => !N3_LESSON_NUMBER_BY_WORD.has(id));
    expect(missing).toEqual([]);
  });

  it("uses every word family in some stage, exactly once", () => {
    const staged = N3_LESSON_STAGES.flatMap((s) => s.clusters);
    expect(new Set(staged).size).toBe(staged.length);
    expect([...staged].sort()).toEqual(
      N3_WORD_CLUSTERS.map((c) => c.key).sort(),
    );
  });

  it("keeps lessons short and numbered in order", () => {
    N3_LESSONS.forEach((lesson, i) => {
      expect(lesson.number).toBe(i + 1);
      expect(lesson.wordIds.length).toBeGreaterThan(0);
      expect(lesson.wordIds.length).toBeLessThanOrEqual(MAX_WORDS_PER_LESSON);
      expect(lesson.part).toBeLessThanOrEqual(lesson.partCount);
    });
  });

  it("looks lessons up by number", () => {
    expect(getN3Lesson(1)?.number).toBe(1);
    expect(getN3Lesson(0)).toBeUndefined();
    expect(getN3Lesson(N3_LESSONS.length + 1)).toBeUndefined();
    expect(getN3Lesson(1.5)).toBeUndefined();
  });

  it("attaches every cluster's kanjiBreakdowns to exactly one lesson", () => {
    const attached = N3_LESSONS.flatMap((l) =>
      l.kanjiBreakdowns.map((b) => b.word),
    );
    const declared = N3_WORD_CLUSTERS.flatMap(
      (c) => c.kanjiBreakdowns?.map((b) => b.word) ?? [],
    );
    expect(attached.sort()).toEqual(declared.sort());
  });

  it("records the first lesson each kanji appears in", () => {
    for (const [, n] of N3_FIRST_LESSON_BY_KANJI) {
      expect(getN3Lesson(n)).toBeDefined();
    }
    const sample = N3_LESSONS.find(
      (l) => l.clusterKey === N3_WORD_CLUSTERS[0]!.key,
    )!;
    const char = kanjiInTerm(sample.wordIds[0]!)[0];
    if (char) {
      expect(N3_FIRST_LESSON_BY_KANJI.get(char)).toBeLessThanOrEqual(
        sample.number,
      );
    }
  });
});
