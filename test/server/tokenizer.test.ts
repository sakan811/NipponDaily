import { describe, it, expect } from "vitest";
import {
  shouldMergeMorphemes,
  classifyPartOfSpeech,
  buildJpTokens,
  type Morph,
} from "~/server/utils/tokenizer";

/** Builds a fixture morpheme with sensible defaults, matching kuromoji's IpadicFeatures shape. */
const m = (
  overrides: Partial<Morph> & Pick<Morph, "surface_form" | "pos">,
): Morph => ({
  pos_detail_1: "*",
  basic_form: overrides.surface_form,
  conjugated_type: "*",
  reading: undefined,
  ...overrides,
});

// 首相は経済対策を表明した。東京都の学校で先生が話し合った。
const shushoMorphemes: Morph[] = [
  m({
    surface_form: "首相",
    pos: "名詞",
    pos_detail_1: "一般",
    reading: "シュショウ",
  }),
  m({ surface_form: "は", pos: "助詞", pos_detail_1: "係助詞", reading: "ハ" }),
  m({
    surface_form: "経済",
    pos: "名詞",
    pos_detail_1: "一般",
    reading: "ケイザイ",
  }),
  m({
    surface_form: "対策",
    pos: "名詞",
    pos_detail_1: "サ変接続",
    reading: "タイサク",
  }),
  m({ surface_form: "を", pos: "助詞", pos_detail_1: "格助詞", reading: "ヲ" }),
  m({
    surface_form: "表明",
    pos: "名詞",
    pos_detail_1: "サ変接続",
    reading: "ヒョウメイ",
  }),
  m({
    surface_form: "し",
    pos: "動詞",
    pos_detail_1: "自立",
    basic_form: "する",
    conjugated_type: "サ変・スル",
    reading: "シ",
  }),
  m({
    surface_form: "た",
    pos: "助動詞",
    basic_form: "た",
    conjugated_type: "特殊・タ",
    reading: "タ",
  }),
  m({ surface_form: "。", pos: "記号", pos_detail_1: "句点", reading: "。" }),
  m({
    surface_form: "東京",
    pos: "名詞",
    pos_detail_1: "固有名詞",
    reading: "トウキョウ",
  }),
  m({ surface_form: "都", pos: "名詞", pos_detail_1: "接尾", reading: "ト" }),
  m({ surface_form: "の", pos: "助詞", pos_detail_1: "連体化", reading: "ノ" }),
  m({
    surface_form: "学校",
    pos: "名詞",
    pos_detail_1: "一般",
    reading: "ガッコウ",
  }),
  m({ surface_form: "で", pos: "助詞", pos_detail_1: "格助詞", reading: "デ" }),
  m({
    surface_form: "先生",
    pos: "名詞",
    pos_detail_1: "一般",
    reading: "センセイ",
  }),
  m({ surface_form: "が", pos: "助詞", pos_detail_1: "格助詞", reading: "ガ" }),
  m({
    surface_form: "話し合っ",
    pos: "動詞",
    pos_detail_1: "自立",
    basic_form: "話し合う",
    conjugated_type: "五段・ワ行促音便",
    reading: "ハナシアッ",
  }),
  m({
    surface_form: "た",
    pos: "助動詞",
    basic_form: "た",
    conjugated_type: "特殊・タ",
    reading: "タ",
  }),
  m({ surface_form: "。", pos: "記号", pos_detail_1: "句点", reading: "。" }),
];

describe("shouldMergeMorphemes", () => {
  it("merges consecutive nouns into a compound noun", () => {
    expect(
      shouldMergeMorphemes(
        m({ surface_form: "東京", pos: "名詞" }),
        m({ surface_form: "都", pos: "名詞", pos_detail_1: "接尾" }),
      ),
    ).toBe(true);
  });

  it("merges a サ変接続 noun with a following する/できる verb", () => {
    expect(
      shouldMergeMorphemes(
        m({ surface_form: "表明", pos: "名詞", pos_detail_1: "サ変接続" }),
        m({ surface_form: "し", pos: "動詞", basic_form: "する" }),
      ),
    ).toBe(true);
  });

  it("merges a verb with a trailing auxiliary verb", () => {
    expect(
      shouldMergeMorphemes(
        m({ surface_form: "話し合っ", pos: "動詞" }),
        m({ surface_form: "た", pos: "助動詞" }),
      ),
    ).toBe(true);
  });

  it("does not merge a noun with a following particle", () => {
    expect(
      shouldMergeMorphemes(
        m({ surface_form: "首相", pos: "名詞" }),
        m({ surface_form: "は", pos: "助詞" }),
      ),
    ).toBe(false);
  });

  it("does not merge a plain noun with a following unrelated verb", () => {
    expect(
      shouldMergeMorphemes(
        m({ surface_form: "学校", pos: "名詞", pos_detail_1: "一般" }),
        m({ surface_form: "話し", pos: "動詞", basic_form: "話す" }),
      ),
    ).toBe(false);
  });
});

describe("groupMorphemes / buildJpTokens", () => {
  it("groups a full passage into learner-facing words", () => {
    const surfaces = buildJpTokens(shushoMorphemes).map((t) => t.surface);
    expect(surfaces).toEqual([
      "首相",
      "は",
      "経済対策",
      "を",
      "表明した",
      "東京都",
      "の",
      "学校",
      "で",
      "先生",
      "が",
      "話し合った",
    ]);
  });

  it("drops punctuation from the token list", () => {
    const surfaces = buildJpTokens(shushoMorphemes).map((t) => t.surface);
    expect(surfaces).not.toContain("。");
  });

  it("deduplicates repeated words, keeping the first occurrence", () => {
    const tokens = buildJpTokens([...shushoMorphemes, ...shushoMorphemes]);
    expect(tokens.filter((t) => t.surface === "首相")).toHaveLength(1);
  });

  it("derives hiragana readings and macron rōmaji for merged words", () => {
    const tokens = buildJpTokens(shushoMorphemes);
    const shusho = tokens.find((t) => t.surface === "首相");
    expect(shusho?.reading).toBe("しゅしょう");
    expect(shusho?.romaji).toBe("shushō");

    const hyomeishita = tokens.find((t) => t.surface === "表明した");
    expect(hyomeishita?.reading).toBe("ひょうめいした");
    expect(hyomeishita?.romaji).toBe("hyōmeishita");
  });

  it("romanizes は and を as particles by pronunciation, not literal kana", () => {
    const tokens = buildJpTokens(shushoMorphemes);
    expect(tokens.find((t) => t.surface === "は")?.romaji).toBe("wa");
    expect(tokens.find((t) => t.surface === "を")?.romaji).toBe("o");
  });
});

describe("buildJpTokens meaning lookup", () => {
  it("passes the dictionary-citation form (not the surface form) to lookupMeaning", () => {
    const calls: Array<[string, string]> = [];
    buildJpTokens(shushoMorphemes, (dictionaryForm, reading) => {
      calls.push([dictionaryForm, reading]);
      return undefined;
    });
    const forms = calls.map(([dictionaryForm]) => dictionaryForm);
    expect(forms).toContain("表明する"); // suru verb: noun stem + する
    expect(forms).toContain("話し合う"); // godan verb: basic_form, not surface
    expect(forms).toContain("首相"); // plain noun: surface === dictionary form
  });

  it("attaches a meaning when lookupMeaning returns one", () => {
    const tokens = buildJpTokens(shushoMorphemes, (dictionaryForm) =>
      dictionaryForm === "首相" ? "prime minister" : undefined,
    );
    expect(tokens.find((t) => t.surface === "首相")?.meaning).toBe(
      "prime minister",
    );
  });

  it("omits meaning when lookupMeaning returns undefined", () => {
    const tokens = buildJpTokens(shushoMorphemes, () => undefined);
    expect(tokens.find((t) => t.surface === "首相")?.meaning).toBeUndefined();
  });

  it("omits meaning entirely when no lookupMeaning callback is given", () => {
    const tokens = buildJpTokens(shushoMorphemes);
    expect(tokens.every((t) => t.meaning === undefined)).toBe(true);
  });
});

describe("classifyPartOfSpeech", () => {
  it("labels a godan verb", () => {
    expect(
      classifyPartOfSpeech([
        m({
          surface_form: "話し合っ",
          pos: "動詞",
          conjugated_type: "五段・ワ行促音便",
        }),
      ]),
    ).toBe("godan verb");
  });

  it("labels a noun+する group as a suru verb", () => {
    expect(
      classifyPartOfSpeech([
        m({ surface_form: "表明", pos: "名詞", pos_detail_1: "サ変接続" }),
        m({ surface_form: "し", pos: "動詞", conjugated_type: "サ変・スル" }),
      ]),
    ).toBe("suru verb");
  });

  it("labels a plain noun", () => {
    expect(
      classifyPartOfSpeech([m({ surface_form: "学校", pos: "名詞" })]),
    ).toBe("noun");
  });

  it("labels a particle", () => {
    expect(classifyPartOfSpeech([m({ surface_form: "は", pos: "助詞" })])).toBe(
      "particle",
    );
  });

  it("labels an i-adjective", () => {
    expect(
      classifyPartOfSpeech([m({ surface_form: "高い", pos: "形容詞" })]),
    ).toBe("i-adjective");
  });
});
