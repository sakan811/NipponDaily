import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as lib from "../../../scripts/lib/example-sentences.mjs";

const { pickExamples } = lib as {
  pickExamples: (word: any, corpus: any, max?: number) => any[];
};

/** A corpus in the shape readExport() returns. */
function corpus(
  sentences: Record<string, string>,
  index: Record<string, { id: string; reading?: string; form?: string }[]>,
  english: Record<string, string> = {},
) {
  return {
    jpn: new Map(Object.entries(sentences)),
    links: new Map(
      Object.keys(sentences).map((id) => [id, [`9${id}`] as string[]]),
    ),
    index: new Map(
      Object.entries(index).map(([k, v]) => [
        k,
        v.map((h) => ({ translation: `9${h.id}`, ...h })),
      ]),
    ),
    eng: new Map(
      Object.keys(sentences).map((id) => [
        `9${id}`,
        english[id] ?? `Translation ${id}.`,
      ]),
    ),
  };
}

describe("pickExamples", () => {
  const word = { term: "手紙", kana: "てがみ" };

  it("takes a sentence the index lists under the word, with its translation", () => {
    const c = corpus(
      { "1": "友達に手紙を書いた。" },
      { 手紙: [{ id: "1" }] },
      { "1": "I wrote a letter to a friend." },
    );
    expect(pickExamples(word, c)).toEqual([
      {
        id: 1,
        ja: "友達に手紙を書いた。",
        en: "I wrote a letter to a friend.",
        enId: 91,
        form: "手紙",
      },
    ]);
  });

  it("puts the shortest sentences first, then the lowest id, and keeps two", () => {
    const c = corpus(
      {
        "3": "昨日友達に長い手紙を書きました。",
        "2": "手紙を書きました。",
        "1": "手紙を出しました。",
      },
      { 手紙: [{ id: "3" }, { id: "2" }, { id: "1" }] },
    );
    expect(pickExamples(word, c).map((e) => e.id)).toEqual([1, 2]);
  });

  it("uses the inflected form the index records, and needs it in the sentence", () => {
    const eat = { term: "食べる", kana: "たべる" };
    const c = corpus(
      { "1": "朝ご飯を食べました。", "2": "朝ご飯を作りました。" },
      {
        食べる: [
          { id: "1", form: "食べました" },
          { id: "2", form: "食べた" },
        ],
      },
    );
    const [only, ...rest] = pickExamples(eat, c);
    expect(rest).toEqual([]);
    expect(only).toMatchObject({ id: 1, form: "食べました" });
  });

  it("refuses an index entry that names another reading", () => {
    const c = corpus(
      { "1": "今日は大人の日です。" },
      { 大人: [{ id: "1", reading: "おとな" }] },
    );
    expect(pickExamples({ term: "大人", kana: "たいじん" }, c)).toEqual([]);
    expect(pickExamples({ term: "大人", kana: "おとな" }, c)).toHaveLength(1);
  });

  it("takes a bare index entry for a spelling JMdict reads several ways only when the form is the reading", () => {
    const today = {
      term: "今日",
      kana: "きょう",
      spellingReadings: ["きょう", "こんにち"],
    };
    const c = corpus(
      {
        "1": "今日は雨が降っています。",
        "2": "今日ますます多くの人が来る。",
      },
      { 今日: [{ id: "1", form: "きょう" }, { id: "2" }] },
    );
    // Sentence 1's text has no きょう, so it fails; sentence 2 is bare and ambiguous.
    expect(pickExamples(today, c)).toEqual([]);
    const c2 = corpus(
      { "1": "きょうは雨が降っています。" },
      { 今日: [{ id: "1", form: "きょう" }] },
    );
    expect(pickExamples(today, c2)).toHaveLength(1);
  });

  it("refuses a lone kana standing for a word", () => {
    const c = corpus(
      { "1": "彼は夫人のいのままだった。" },
      { 意: [{ id: "1", form: "い" }] },
    );
    expect(pickExamples({ term: "意", kana: "い" }, c)).toEqual([]);
  });

  it("keeps sentences of a readable length and with a translation", () => {
    const c = corpus(
      { "1": "手紙。", "2": "手紙を".repeat(20), "3": "友達に手紙を書いた。" },
      { 手紙: [{ id: "1" }, { id: "2" }, { id: "3" }] },
    );
    c.links.set("3", []);
    expect(pickExamples(word, c)).toEqual([]);
  });

  it("prefers the translation the index points at", () => {
    const c = corpus({ "1": "友達に手紙を書いた。" }, { 手紙: [{ id: "1" }] });
    c.links.set("1", ["5", "91"]);
    c.eng.set("5", "Another translation.");
    expect(pickExamples(word, c)[0].enId).toBe(91);
  });

  it("filters words that do not belong on the page", () => {
    const c = corpus(
      { "1": "友達に手紙を書いた。", "2": "手紙を出して来ました。" },
      { 手紙: [{ id: "1" }, { id: "2" }] },
      { "1": "I wrote a letter to kill him." },
    );
    expect(pickExamples(word, c).map((e) => e.id)).toEqual([2]);
  });
});
