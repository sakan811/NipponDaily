import { describe, it, expect } from "vitest";
import { lookupMeaning, type JmdictIndex } from "~/server/utils/dictionary";

describe("lookupMeaning", () => {
  it("returns undefined when the dictionary form has no entry", () => {
    const index: JmdictIndex = new Map();
    expect(lookupMeaning(index, "存在しない", "そんざいしない")).toBeUndefined();
  });

  it("prefers the candidate whose reading matches, to disambiguate homographs", () => {
    const index: JmdictIndex = new Map([
      [
        "上",
        [
          ["うえ", "above; up", 1],
          ["かみ", "upper part", 0],
        ],
      ],
    ]);
    expect(lookupMeaning(index, "上", "かみ")).toBe("upper part");
    expect(lookupMeaning(index, "上", "うえ")).toBe("above; up");
  });

  it("falls back to the first (most common) candidate when no reading matches", () => {
    const index: JmdictIndex = new Map([
      [
        "先生",
        [
          ["せんせい", "teacher", 1],
          ["せんせい", "master", 0],
        ],
      ],
    ]);
    expect(lookupMeaning(index, "先生", "しょうせい")).toBe("teacher");
  });
});
