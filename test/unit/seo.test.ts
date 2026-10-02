import { describe, it, expect } from "vitest";
import {
  partPath,
  truncate,
  wordDescription,
  wordTitle,
} from "~/app/utils/seo";

const entry = {
  term: "手紙",
  kana: "てがみ",
  meaning: "letter",
  headline: "A letter is a “hand paper”.",
  morphemes: [
    { text: "手", reading: "て", meaning: "hand" },
    { text: "紙", reading: "がみ", base: "かみ", meaning: "paper" },
  ],
};

describe("seo helpers", () => {
  it("titles a word with its reading and meaning", () => {
    expect(wordTitle(entry)).toBe("手紙 (てがみ) — letter");
  });

  it("describes a word from fields already on its page", () => {
    expect(wordDescription(entry)).toBe(
      "手紙 (てがみ), letter. Taken apart: 手 + 紙. A letter is a “hand paper”.",
    );
  });

  it("leaves out the breakdown when none is shown", () => {
    expect(wordDescription({ ...entry, morphemes: [] })).toBe(
      "手紙 (てがみ), letter. A letter is a “hand paper”.",
    );
  });

  it("truncates a long description at a word boundary", () => {
    const long = wordDescription({ ...entry, headline: "word ".repeat(60) });
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long.endsWith("…")).toBe(true);
    expect(long).not.toMatch(/wor…$/);
  });

  it("leaves short text alone", () => {
    expect(truncate("short")).toBe("short");
  });

  it("encodes a part's path", () => {
    expect(partPath("日")).toBe("/parts/%E6%97%A5");
  });
});
