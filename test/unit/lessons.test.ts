import { describe, it, expect } from "vitest";
import ids from "../fixtures/n5-vocab-ids.json";
import {
  FIRST_LESSON_BY_KANJI,
  LESSONS,
  LESSON_NUMBER_BY_WORD,
  LESSON_STAGES,
  MAX_WORDS_PER_LESSON,
  getLesson,
  kanjiInTerm,
} from "~/app/data/lessons";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";

// test/fixtures/n5-vocab-ids.json is every N5Vocab id scripts/seed-n5-data.mjs
// produces from elzup/jlpt-word-list's n5.csv (same parsing + slugify).
describe("the N5 lesson path", () => {
  it("teaches every N5 word exactly once", () => {
    const taught = LESSONS.flatMap((l) => l.wordIds);
    expect(new Set(taught).size).toBe(taught.length);
    const missing = (ids as string[]).filter(
      (id) => !LESSON_NUMBER_BY_WORD.has(id),
    );
    expect(missing).toEqual([]);
  });

  it("uses every word family in some stage, exactly once", () => {
    const staged = LESSON_STAGES.flatMap((s) => s.clusters);
    expect(new Set(staged).size).toBe(staged.length);
    expect([...staged].sort()).toEqual(WORD_CLUSTERS.map((c) => c.key).sort());
  });

  it("keeps lessons short and numbered in order", () => {
    LESSONS.forEach((lesson, i) => {
      expect(lesson.number).toBe(i + 1);
      expect(lesson.wordIds.length).toBeGreaterThan(0);
      expect(lesson.wordIds.length).toBeLessThanOrEqual(MAX_WORDS_PER_LESSON);
      expect(lesson.part).toBeLessThanOrEqual(lesson.partCount);
    });
  });

  it("looks lessons up by number", () => {
    expect(getLesson(1)?.number).toBe(1);
    expect(getLesson(0)).toBeUndefined();
    expect(getLesson(LESSONS.length + 1)).toBeUndefined();
    expect(getLesson(1.5)).toBeUndefined();
  });

  it("splits a word into its kanji, ignoring kana and the 々 mark", () => {
    expect(kanjiInTerm("日曜日")).toEqual(["日", "曜"]);
    expect(kanjiInTerm("色々")).toEqual(["色"]);
    expect(kanjiInTerm("これ")).toEqual([]);
  });

  it("records the first lesson each kanji appears in", () => {
    const weekdays = LESSONS.find((l) => l.clusterKey === "weekdays")!;
    expect(FIRST_LESSON_BY_KANJI.get("曜")).toBe(weekdays.number);
    for (const [, n] of FIRST_LESSON_BY_KANJI) {
      expect(getLesson(n)).toBeDefined();
    }
  });
});
