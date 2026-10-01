import { describe, it, expect } from "vitest";
import { enrichedVocabMeaning, meaningsOverlap } from "~~/shared/meanings";

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
