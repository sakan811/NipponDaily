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
      kanjiReadings?: (k: string) => string[];
      transcription?: { text: string; human: boolean };
      unidicTokens?: Token[];
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

  describe("Tatoeba's transcription", () => {
    /** KANJIDIC2's readings, as it writes them. */
    const kanjidic = (k: string) =>
      ({
        手: ["シュ", "て"],
        紙: ["シ", "かみ"],
        中: ["チュウ", "なか"],
        心: ["シン", "こころ"],
        地: ["チ", "ジ"],
        乗: ["ジョウ", "の.る"],
        越: ["エツ", "こ.える"],
        柵: ["サク", "しがらみ"],
        何: ["カ", "なに", "なん"],
        後: ["ゴ", "のち", "あと"],
      })[k] ?? [];
    const sources = (
      text: string,
      human: boolean,
      more: Partial<{
        indexReadings: Map<string, string>;
        jmdict: Record<string, string[]>;
      }> = {},
    ) => ({
      indexReadings: more.indexReadings ?? none,
      jmdictReadings: jmdict(more.jmdict ?? {}),
      kanjiReadings: kanjidic,
      transcription: { text, human },
    });

    it("gives a contributor's reading of a spelling JMdict reads several ways", () => {
      const tokens = [tok("今日", "キョウ"), tok("は", "ハ")];
      expect(
        furiganaFor("今日は", "今日", tokens, {
          ...sources("[今日|きょう]は", true, {
            jmdict: { 今日: ["きょう", "こんにち"] },
          }),
        }),
      ).toEqual([["今日", "きょう"], ["は"]]);
    });

    it("checks each kanji's piece against KANJIDIC2, allowing rendaku", () => {
      const tokens = [tok("手紙", "テガミ")];
      // が for か is rendaku; ほ is not a reading of 手.
      expect(
        furiganaFor("手紙", "手紙", tokens, sources("[手紙|て|がみ]", true)),
      ).toEqual([["手紙", "てがみ"]]);
      expect(
        furiganaFor("手紙", "手紙", tokens, sources("[手紙|ほ|がみ]", true)),
      ).toBeUndefined();
    });

    it("trusts software only where kuromoji hears the same", () => {
      const agree = [tok("手紙", "テガミ")];
      const differ = [tok("手紙", "シュシ")];
      const text = "[手紙|て|がみ]";
      expect(furiganaFor("手紙", "手紙", agree, sources(text, false))).toEqual([
        ["手紙", "てがみ"],
      ]);
      expect(
        furiganaFor("手紙", "手紙", differ, sources(text, false)),
      ).toBeUndefined();
    });

    it("trusts software where UniDic hears the same, though kuromoji does not", () => {
      const kuromoji = [tok("手紙", "シュシ")];
      const unidic = [tok("手紙", "テガミ")];
      expect(
        furiganaFor("手紙", "手紙", kuromoji, {
          ...sources("[手紙|て|がみ]", false),
          unidicTokens: unidic,
        }),
      ).toEqual([["手紙", "てがみ"]]);
      // UniDic hearing something else is no support.
      expect(
        furiganaFor("手紙", "手紙", kuromoji, {
          ...sources("[手紙|て|がみ]", false),
          unidicTokens: [tok("手紙", "シュシ")],
        }),
      ).toBeUndefined();
    });

    it("lets UniDic correct software that kuromoji repeats", () => {
      // The software and kuromoji both say いが; JMdict gives 歪む one reading,
      // ゆがむ, which UniDic hears and so confirms.
      const tokens = [tok("歪ん", "イガン", "歪む"), tok("だ", "ダ")];
      const unidic = [tok("歪ん", "ユガン", "歪む"), tok("だ", "ダ")];
      expect(
        furiganaFor("歪んだ", "歪んだ", tokens, {
          ...sources("[歪|いが]んだ", false, { jmdict: { 歪む: ["ゆがむ"] } }),
          unidicTokens: unidic,
        }),
      ).toEqual([["歪", "ゆが"], ["んだ"]]);
    });

    it("lets UniDic read a run the transcription left bare", () => {
      const tokens = [tok("手紙", "シュシ")];
      expect(
        furiganaFor("手紙", "手紙", tokens, {
          indexReadings: none,
          jmdictReadings: jmdict({ 手紙: ["てがみ"] }),
          unidicTokens: [tok("手紙", "テガミ")],
        }),
      ).toEqual([["手紙", "てがみ"]]);
    });

    it("ignores UniDic tokens that do not spell the sentence", () => {
      expect(
        furiganaFor("手紙", "手紙", [tok("手紙", "シュシ")], {
          indexReadings: none,
          jmdictReadings: jmdict({ 手紙: ["てがみ"] }),
          unidicTokens: [tok("手", "テ"), tok("書", "ガキ")],
        }),
      ).toBeUndefined();
    });

    it("trusts software where Tatoeba's own index says so, whatever kuromoji hears", () => {
      const tokens = [tok("後", "ゴ"), tok("晴れ", "ハレ")];
      expect(
        furiganaFor(
          "後晴れ",
          "晴れ",
          tokens,
          sources("[後|のち][晴|は]れ", false, {
            indexReadings: new Map([["後", "のち"]]),
          }),
        ),
      ).toEqual([["後", "のち"], ["晴れ"]]);
    });

    it("refuses software's reading when JMdict gives the word another", () => {
      // The software and kuromoji both say しがらみ; JMdict reads 柵 さく.
      const tokens = [tok("柵", "シガラミ")];
      expect(
        furiganaFor(
          "柵",
          "柵",
          tokens,
          sources("[柵|しがらみ]", false, { jmdict: { 柵: ["さく"] } }),
        ),
      ).toBeUndefined();
    });

    it("lets a contributor correct the older sources, and software not", () => {
      // kuromoji and the index read 何 なに; the sentence is 何ですか.
      const tokens = [tok("何", "ナニ"), tok("です", "デス"), tok("か", "カ")];
      const index = new Map([["何", "なに"]]);
      const ja = "何ですか";
      expect(
        furiganaFor(
          ja,
          "です",
          tokens,
          sources("[何|なん]ですか", true, { indexReadings: index }),
        ),
      ).toEqual([["何", "なん"], ["ですか"]]);
      expect(
        furiganaFor(
          ja,
          "です",
          tokens,
          sources("[何|なん]ですか", false, { indexReadings: index }),
        ),
      ).toEqual([["何", "なに"], ["ですか"]]);
    });

    it("reads each part of a compound verb kuromoji makes one token", () => {
      const tokens = [
        tok("乗り越え", "ノリコエ", "乗り越える"),
        tok("た", "タ"),
      ];
      expect(
        furiganaFor(
          "乗り越えた",
          "乗り越えた",
          tokens,
          sources("[乗|の]り[越|こ]えた", false),
        ),
      ).toEqual([["乗", "の"], ["り"], ["越", "こ"], ["えた"]]);
    });

    it("cuts a reading at the edge of the word's form when it has one piece per kanji", () => {
      const tokens = [tok("中心地", "チュウシンチ")];
      const text = "[中心地|ちゅう|しん|ち]";
      expect(
        furiganaFor("中心地", "中心", tokens, sources(text, true)),
      ).toEqual([
        ["中心", "ちゅうしん"],
        ["地", "ち"],
      ]);
      // One piece for the whole word cannot be cut.
      expect(
        furiganaFor(
          "中心地",
          "中心",
          tokens,
          sources("[中心地|ちゅうしんち]", true, {
            jmdict: { 中心地: ["ちゅうしんち"] },
          }),
        ),
      ).toBeUndefined();
    });

    it("ignores a transcription that does not spell the sentence", () => {
      expect(
        furiganaFor(
          "手紙",
          "手紙",
          [tok("手紙", "テガミ")],
          sources("[本|ほん]", true),
        ),
      ).toBeUndefined();
    });
  });
});
