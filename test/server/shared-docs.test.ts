import { describe, it, expect } from "vitest";
import {
  DOC_CHAPTERS,
  DOC_PATHS,
  chapterNumber,
  docPath,
  kanjiNumeral,
  neighbours,
} from "~~/shared/docs";

describe("shared/docs", () => {
  it("numbers chapters from 1 in book order", () => {
    expect(chapterNumber(DOC_CHAPTERS[0]!.slug)).toBe(1);
    expect(chapterNumber(DOC_CHAPTERS[DOC_CHAPTERS.length - 1]!.slug)).toBe(
      DOC_CHAPTERS.length,
    );
    expect(chapterNumber("nope")).toBe(0);
  });

  it("writes chapter numbers in kanji", () => {
    expect([1, 9, 10, 11, 12, 20, 21].map((n) => kanjiNumeral(n))).toEqual([
      "一",
      "九",
      "十",
      "十一",
      "十二",
      "二十",
      "二十一",
    ]);
    expect(kanjiNumeral(0)).toBe("0");
  });

  it("finds the neighbours of a chapter, the first chapter after the front page", () => {
    expect(neighbours("core-theme")).toEqual({
      prev: null,
      next: DOC_CHAPTERS[1],
    });
    expect(neighbours()).toEqual({ prev: null, next: DOC_CHAPTERS[0] });
    expect(neighbours("nope")).toEqual({ prev: null, next: null });
  });

  it("lists the contents and every chapter as a path", () => {
    expect(DOC_PATHS[0]).toBe("/docs");
    expect(DOC_PATHS).toContain(docPath("api"));
    expect(DOC_PATHS).toHaveLength(DOC_CHAPTERS.length + 1);
  });
});
