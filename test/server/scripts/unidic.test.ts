import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as lib from "../../../scripts/lib/unidic.mjs";

type Lindera = {
  surface: string;
  orthographicBaseForm: string;
  reading: string;
};
const { shapeTokens, openUnidic } = lib as {
  shapeTokens: (tokens: Lindera[]) => {
    surface_form: string;
    reading: string;
    basic_form: string;
  }[];
  openUnidic: () => {
    tokenize: (
      text: string,
    ) => { surface_form: string; reading: string; basic_form: string }[];
  };
};

const lt = (surface: string, base: string, reading: string): Lindera => ({
  surface,
  orthographicBaseForm: base,
  reading,
});

describe("shapeTokens", () => {
  it("keeps the dictionary reading of a token that is not inflected", () => {
    expect(shapeTokens([lt("手続き", "手続き", "テツヅキ")])).toEqual([
      { surface_form: "手続き", reading: "テツヅキ", basic_form: "手続き" },
    ]);
  });

  it("gives an inflected token the reading of its surface, not its dictionary form", () => {
    expect(
      shapeTokens([
        lt("済ま", "済む", "スム"),
        lt("乗り越え", "乗り越える", "ノリコエル"),
        lt("行っ", "行く", "イク"),
      ]).map((t) => t.reading),
    ).toEqual(["スマ", "ノリコエ", "イッ"]);
  });

  it("says nothing where the stem may change or the details are missing", () => {
    expect(
      shapeTokens([
        lt("来", "来る", "クル"),
        lt("1", "*", ""),
        { surface: "?" } as Lindera,
      ]).map((t) => t.reading),
    ).toEqual(["*", "*", "*"]);
  });
});

describe("openUnidic", () => {
  it("tokenizes a sentence into tokens that spell it", () => {
    const ja = "昨日、手続きを済ませた。";
    const tokens = openUnidic().tokenize(ja);
    expect(tokens.map((t) => t.surface_form).join("")).toBe(ja);
    expect(tokens.find((t) => t.surface_form === "手続き")?.reading).toBe(
      "テツヅキ",
    );
    expect(tokens.find((t) => t.surface_form === "済ま")?.reading).toBe("スマ");
  });
});
