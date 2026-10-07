import { describe, it, expect } from "vitest";
import { sentencePieces } from "~/app/utils/sentence";
import type { SentencePart } from "~~/types/index";

describe("sentencePieces", () => {
  it("marks the word's own form in a plain sentence", () => {
    expect(sentencePieces("彼女は手紙を書いた。", "手紙")).toEqual([
      { text: "彼女は", hit: false },
      { text: "手紙", hit: true },
      { text: "を書いた。", hit: false },
    ]);
  });

  it("keeps a sentence whole when the form is not in it", () => {
    expect(sentencePieces("書いた。", "手紙")).toEqual([
      { text: "書いた。", hit: false },
    ]);
  });

  it("carries the readings and marks the pieces inside the form", () => {
    const furigana: SentencePart[] = [
      ["手紙", "てがみ"],
      ["を"],
      ["書", "か"],
      ["いた。"],
    ];
    expect(sentencePieces("手紙を書いた。", "手紙", furigana)).toEqual([
      { text: "手紙", reading: "てがみ", hit: true },
      { text: "を", reading: undefined, hit: false },
      { text: "書", reading: "か", hit: false },
      { text: "いた。", reading: undefined, hit: false },
    ]);
  });

  it("cuts plain text at the edge of the form", () => {
    const furigana: SentencePart[] = [["彼", "かれ"], ["は笑った。"]];
    expect(sentencePieces("彼は笑った。", "笑った", furigana)).toEqual([
      { text: "彼", reading: "かれ", hit: false },
      { text: "は", hit: false },
      { text: "笑った", hit: true },
      { text: "。", hit: false },
    ]);
  });

  it("ignores furigana that does not join back to the sentence", () => {
    expect(sentencePieces("手紙を書いた。", "手紙", [["別の文"]])).toEqual([
      { text: "手紙", hit: true },
      { text: "を書いた。", hit: false },
    ]);
  });
});
