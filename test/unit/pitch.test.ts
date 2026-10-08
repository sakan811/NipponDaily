import { describe, it, expect } from "vitest";
import { moraeOf, pitchContour, pitchType } from "~/app/utils/pitch";

describe("moraeOf", () => {
  it("counts one mora for each kana, joining the small ones to the kana before", () => {
    expect(moraeOf("たべる")).toEqual(["た", "べ", "る"]);
    expect(moraeOf("ちょっと")).toEqual(["ちょ", "っ", "と"]);
    expect(moraeOf("ファイル")).toEqual(["ファ", "イ", "ル"]);
  });

  it("counts the small tsu, ん and the long vowel mark as morae of their own", () => {
    expect(moraeOf("にっぽん")).toEqual(["に", "っ", "ぽ", "ん"]);
    expect(moraeOf("ラーメン")).toEqual(["ラ", "ー", "メ", "ン"]);
  });
});

describe("pitchContour", () => {
  it("is low then high for a flat word", () => {
    expect(pitchContour(3, 0)).toEqual([false, true, true]);
  });
  it("is high on the first mora only for a head-high word", () => {
    expect(pitchContour(3, 1)).toEqual([true, false, false]);
  });
  it("is high from the second mora to the accented one otherwise", () => {
    expect(pitchContour(4, 3)).toEqual([false, true, true, false]);
    expect(pitchContour(3, 3)).toEqual([false, true, true]);
  });
});

describe("pitchType", () => {
  it("names the four patterns", () => {
    expect(pitchType(3, 0)).toBe("heiban");
    expect(pitchType(3, 1)).toBe("atamadaka");
    expect(pitchType(3, 2)).toBe("nakadaka");
    expect(pitchType(3, 3)).toBe("odaka");
  });
});
