import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as lib from "../../../scripts/lib/furigana.mjs";

type Token = { surface_form: string; reading?: string; basic_form?: string };
const { furiganaFor } = lib as {
  furiganaFor: (
    ja: string,
    form: string,
    tokens: Token[],
    sources: {
      indexReadings: Map<string, string>;
      jmdictReadings: (s: string) => string[];
    },
  ) => string[][] | undefined;
};

/** kuromoji's token shape: the reading is in katakana, `*` for a base form it lacks. */
const tok = (surface: string, reading: string, base = "*"): Token => ({
  surface_form: surface,
  reading,
  basic_form: base,
});
const jmdict = (table: Record<string, string[]>) => (s: string) =>
  table[s] ?? [];
const none = new Map<string, string>();

describe("furiganaFor", () => {
  it("reads kanji whose spelling JMdict reads one way, and joins back to the sentence", () => {
    const ja = "友達に手紙を書いた。";
    const tokens = [
      tok("友達", "トモダチ", "友達"),
      tok("に", "ニ"),
      tok("手紙", "テガミ"),
      tok("を", "ヲ"),
      tok("書い", "カイ", "書く"),
      tok("た", "タ"),
      tok("。", "。"),
    ];
    const parts = furiganaFor(ja, "手紙", tokens, {
      indexReadings: none,
      jmdictReadings: jmdict({
        友達: ["ともだち"],
        手紙: ["てがみ"],
        書く: ["かく"],
      }),
    })!;
    expect(parts).toEqual([
      ["友達", "ともだち"],
      ["に"],
      ["手紙", "てがみ"],
      ["を"],
      ["書", "か"],
      ["いた。"],
    ]);
    expect(parts.map((p) => p[0]).join("")).toBe(ja);
  });

  it("leaves a spelling JMdict reads several ways plain unless the index says which", () => {
    const tokens = [tok("今日", "キョウ"), tok("は", "ハ")];
    const many = jmdict({ 今日: ["きょう", "こんにち", "こんじつ"] });
    expect(
      furiganaFor("今日は", "今日", tokens, {
        indexReadings: none,
        jmdictReadings: many,
      }),
    ).toBeUndefined();
    expect(
      furiganaFor("今日は", "今日", tokens, {
        indexReadings: new Map([["今日", "きょう"]]),
        jmdictReadings: many,
      }),
    ).toEqual([["今日", "きょう"], ["は"]]);
  });

  it("drops a reading kuromoji and the index disagree on", () => {
    // kuromoji hears 後 as ご; the index says のち.
    const tokens = [tok("後", "ゴ"), tok("晴れ", "ハレ")];
    expect(
      furiganaFor("後晴れ", "晴れ", tokens, {
        indexReadings: new Map([["後", "のち"]]),
        jmdictReadings: jmdict({ 後: ["のち", "ご", "あと"] }),
      }),
    ).toBeUndefined();
  });

  it("drops a reading JMdict's only reading contradicts", () => {
    const tokens = [tok("柵", "シガラミ")];
    expect(
      furiganaFor("柵", "柵", tokens, {
        indexReadings: none,
        jmdictReadings: jmdict({ 柵: ["さく"] }),
      }),
    ).toBeUndefined();
  });

  it("checks an inflected token against its dictionary word's stem", () => {
    const sources = (dictionary: string[]) => ({
      indexReadings: none,
      jmdictReadings: jmdict({ 怒る: dictionary }),
    });
    const tokens = [tok("怒っ", "オコッ", "怒る"), tok("た", "タ")];
    expect(
      furiganaFor("怒った", "怒った", tokens, sources(["おこる"])),
    ).toEqual([["怒", "おこ"], ["った"]]);
    // A different stem (怒る read いかる) is no confirmation.
    expect(
      furiganaFor("怒った", "怒った", tokens, sources(["いかる"])),
    ).toBeUndefined();
  });

  it("leaves a token plain when a reading would straddle the edge of the word's form", () => {
    // 中心地 is one token, but the word shown is 中心: marking it would cut the ruby.
    const tokens = [tok("中心地", "チュウシンチ")];
    expect(
      furiganaFor("中心地", "中心", tokens, {
        indexReadings: none,
        jmdictReadings: jmdict({ 中心地: ["ちゅうしんち"] }),
      }),
    ).toBeUndefined();
  });

  it("gives nothing when the tokens do not spell the sentence", () => {
    expect(
      furiganaFor("手紙", "手紙", [tok("手", "テ")], {
        indexReadings: none,
        jmdictReadings: jmdict({ 手: ["て"] }),
      }),
    ).toBeUndefined();
  });
});
