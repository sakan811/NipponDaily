import { describe, it, expect } from "vitest";
import {
  enrichedVocabMeaning,
  kanjiMeaningLabel,
  meaningsOverlap,
  pickDistractors,
} from "~~/shared/meanings";

describe("kanjiMeaningLabel", () => {
  it("joins the first few distinct meanings", () => {
    expect(kanjiMeaningLabel(["day", "sun", "Japan", "counter for days"])).toBe(
      "day, sun, Japan",
    );
    expect(kanjiMeaningLabel(["Up", "up", "above"], 2)).toBe("Up, above");
    expect(kanjiMeaningLabel([])).toBe("");
  });
});

describe("enrichedVocabMeaning", () => {
  it("fills in senses the source list left out, keyed by term and reading", () => {
    expect(
      enrichedVocabMeaning({ term: "早い", kana: "はやい", meaning: "early" }),
    ).toContain("quick");
    expect(
      enrichedVocabMeaning({
        term: "速い",
        kana: "はやい",
        meaning: "fast, quick",
      }),
    ).toBe("fast, quick");
  });
});

describe("meaningsOverlap", () => {
  it("flags answers that could both be right", () => {
    expect(meaningsOverlap("to be, to have", "to be, to have")).toBe(true);
    expect(meaningsOverlap("hot (objects)", "hot (weather), warm")).toBe(true);
    expect(meaningsOverlap("shoes, footwear", "shoe")).toBe(true);
  });

  it("does not match on filler words", () => {
    expect(meaningsOverlap("to eat", "to drink")).toBe(false);
    expect(meaningsOverlap("the sky", "the sea")).toBe(false);
  });
});

describe("pickDistractors", () => {
  it("skips overlapping candidates and duplicates", () => {
    expect(
      pickDistractors(
        "hot (objects)",
        ["hot (weather)", "cold", "cold", "blue", "red"],
        3,
      ),
    ).toEqual(["cold", "blue", "red"]);
  });

  it("tops up with any different answer when the pool is too small", () => {
    expect(
      pickDistractors("big", ["big, large", "very big", "small"], 3),
    ).toEqual(["small", "big, large", "very big"]);
  });
});
