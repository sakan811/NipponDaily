import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as lib from "../../../scripts/lib/word-entry.mjs";

const {
  pickSections,
  evidenceLines,
  parseMorphemes,
  parseLiteral,
  parseKanji,
  parseLoan,
  processesOf,
  stratumOf,
  posOf,
} = lib as Record<string, (...args: any[]) => any>;

describe("pickSections", () => {
  const snap = {
    etymologies: [
      {
        text: "Appears in sources from the Heian period.",
        readings: ["おとな"],
      },
      { text: "Derivation unknown.", readings: ["うし"] },
    ],
  };

  it("takes only the section for this word's reading", () => {
    expect(pickSections(snap, "おとな")).toEqual([snap.etymologies[0]]);
  });

  it("refuses when no section is for that reading, rather than guessing", () => {
    expect(() => pickSections(snap, "たいじん")).toThrow(/none for たいじん/);
  });

  it("refuses a single section that is for a different reading", () => {
    expect(() =>
      pickSections({ etymologies: [snap.etymologies[1]] }, "おとな"),
    ).toThrow(/only section is for うし/);
  });

  it("accepts a lone section whose reading the page did not declare", () => {
    const lone = {
      etymologies: [{ text: "From English beer.", readings: [] }],
    };
    expect(pickSections(lone, "ビール")).toHaveLength(1);
  });
});

describe("evidenceLines", () => {
  it("quotes each line and drops Wikipedia furniture", () => {
    const lines = evidenceLines([
      {
        text: "English Wikipedia has an article on:Kawaii\nWikipedia\n/kawajui/ → /kawaiː/\nShift in pronunciation from kawayui below.",
      },
    ]);
    expect(lines).toEqual([
      "/kawajui/ → /kawaiː/",
      "Shift in pronunciation from kawayui below.",
    ]);
  });

  it("skips a loanword family-tree dump", () => {
    const lines = evidenceLines([
      {
        text: "Etymology tree\nProto-Indo-European *h₃sleydʰ-\nEnglish slidebor.\nJapanese スライド\nBorrowed from English slide.",
      },
    ]);
    expect(lines).toEqual(["Borrowed from English slide."]);
  });
});

describe("parseMorphemes", () => {
  it("reads the parts, glosses and rendaku from a compound sentence", () => {
    const lines = [
      "Compound of 花(はな) (hana, “flower”) + 火(ひ) (hi, “fire”). The hi changes to bi as an instance of rendaku (連濁).",
    ];
    expect(parseMorphemes(lines, "花火", "はなび")).toEqual([
      { text: "花", reading: "はな", meaning: "flower" },
      { text: "火", reading: "び", base: "ひ", meaning: "fire" },
    ]);
  });

  it("glosses a combining form with the gloss of the base it comes from", () => {
    const lines = [
      "Compound of 酒(さか) (saka-, 被(ひ)覆(ふく)形(けい) (hifukukei, “bound form”) of 酒(さけ) (sake, “alcohol”)) + 場(ば) (ba, “place”).",
    ];
    expect(parseMorphemes(lines, "酒場", "さかば")).toEqual([
      { text: "酒", reading: "さか", meaning: "alcohol" },
      { text: "場", reading: "ば", meaning: "place" },
    ]);
  });

  it("handles a three-part compound with okurigana in a part", () => {
    const lines = [
      "Compound of 男 (otoko, “man; male”) + の (no, appositional particle) + 子 (ko, “child”).",
    ];
    expect(
      parseMorphemes(lines, "男の子", "おとこのこ").map((m: any) => m.text),
    ).toEqual(["男", "の", "子"]);
  });

  it("reads romaji with a macron by trying both long-vowel spellings", () => {
    const lines = ["Compound of 大 (ō-, “large”) + 通り (tōri, “street”)."];
    const m = parseMorphemes(lines, "大通り", "おおどおり");
    expect(m.map((x: any) => x.reading)).toEqual(["おお", "どおり"]);
    expect(m[1].base).toBe("とおり");
  });

  it("accepts a plain-text descriptor as the gloss", () => {
    const lines = ["Compound of 御 (o-, honorific prefix) + 茶 (cha, “tea”)."];
    expect(parseMorphemes(lines, "お茶", "おちゃ")).toEqual([
      { text: "お", reading: "お", meaning: "honorific prefix" },
      { text: "茶", reading: "ちゃ", meaning: "tea" },
    ]);
  });

  it("gives no breakdown when the parts do not spell the word", () => {
    // 火傷: the source analyses 焼け + 処, which is not what the word is written with.
    const lines = [
      "From 焼(や)け (yake, “burn, burning”) + 処(と) (to, “place”). The to changes to do as an instance of rendaku.",
    ];
    expect(parseMorphemes(lines, "火傷", "やけど")).toEqual([]);
  });

  it("gives no breakdown when the parts do not join to the reading", () => {
    const lines = ["Compound of 花 (hana, “flower”) + 火 (hi, “fire”)."];
    expect(parseMorphemes(lines, "花火", "かび")).toEqual([]);
  });

  it("gives no breakdown when a part has no gloss", () => {
    const lines = ["From 一(いち) (ichi) + 番(ばん) (-ban)."];
    expect(parseMorphemes(lines, "一番", "いちばん")).toEqual([]);
  });
});

describe("parseMorphemes: stems, okurigana and honorifics", () => {
  it("gives a verb stem the gloss of the verb it comes from", () => {
    const lines = [
      "From 缶(かん) (kan, “can”) + 詰(つ)め (tsume, 連(れん)用(よう)形(けい) (ren'yōkei, “stem or continuative form”) of the verb 詰(つ)める (tsumeru, “to stuff”).). The tsume changes to zume as an instance of rendaku (連濁).",
    ];
    expect(parseMorphemes(lines, "缶詰", "かんづめ")).toEqual([
      { text: "缶", reading: "かん", meaning: "can" },
      { text: "詰", reading: "づめ", base: "つめ", meaning: "to stuff" },
    ]);
  });

  it("drops a part's okurigana, and its reading's, when the compound does", () => {
    const lines = [
      "Compound of 出る (deru, “to exit”) + 口 (kuchi, “opening, door”).",
    ];
    expect(parseMorphemes(lines, "出口", "でぐち")).toEqual([
      { text: "出", reading: "で", meaning: "to exit" },
      { text: "口", reading: "ぐち", base: "くち", meaning: "opening, door" },
    ]);
  });

  it("reads a bare kana part as its own reading", () => {
    const lines = [
      "Of お (honorific prefix) + 嬢 (jō, “unmarried woman; daughter”) + さん (honorific suffix)",
    ];
    expect(
      parseMorphemes(lines, "お嬢さん", "おじょうさん").map((m: any) => [
        m.text,
        m.reading,
      ]),
    ).toEqual([
      ["お", "お"],
      ["嬢", "じょう"],
      ["さん", "さん"],
    ]);
  });

  it("finds the split after a whole-word mention of the same line", () => {
    const lines = [
      "Borrowed from Chinese 英語 / 英语 (Yīngyǔ), or a compound coined in Japan of 英(えい) (ei, “England”) + 語(ご) (-go, “language”).",
    ];
    expect(
      parseMorphemes(lines, "英語", "えいご").map((m: any) => m.text),
    ).toEqual(["英", "語"]);
  });

  it("picks none when the lines name two different splits that both fit", () => {
    const lines = [
      "Analyzed as either a compound of 再来 (sarai, “two next”) + 月 (getsu, “month”), or of 再 (sa, “again”) + 来月 (raigetsu, “next month”).",
    ];
    expect(parseMorphemes(lines, "再来月", "さらいげつ")).toEqual([]);
  });
});

describe("parseLiteral: glossed kanji parts", () => {
  const kanji = {
    方: { on: ["ホウ"], kun: ["かた"], meanings: ["direction"] },
    針: { on: ["シン"], kun: ["はり"], meanings: ["needle"] },
  };
  it("pairs “gloss” parts that spell the word with KANJIDIC2's readings", () => {
    const lines = [
      "方 (“direction”) + 針 (“needle”), another name for the 磁針 (jishin, “magnetic needle”).",
    ];
    expect(parseLiteral(lines, "方針", "ほうしん", kanji)).toEqual([
      { text: "方", reading: "ほう", meaning: "direction" },
      { text: "針", reading: "しん", meaning: "needle" },
    ]);
  });
});

describe("parseKanji", () => {
  const kanji = {
    商: {
      on: ["ショウ"],
      kun: ["あきな.う"],
      meanings: ["make a deal", "merchant"],
    },
    人: { on: ["ジン", "ニン"], kun: ["ひと"], meanings: ["person"] },
    無: { on: ["ム", "ブ"], kun: ["な.い"], meanings: ["nothing"] },
    駄: { on: ["ダ", "タ"], kun: [], meanings: ["pack horse"] },
  };
  it("splits an all-kanji word into its characters with KANJIDIC2's own senses", () => {
    expect(
      parseKanji(
        "商人",
        "しょうにん",
        kanji,
        "From Middle Chinese.",
        "merchant",
      ),
    ).toEqual([
      {
        text: "商",
        reading: "しょう",
        meaning: "merchant",
        glossSource: "kanjidic2",
      },
      {
        text: "人",
        reading: "にん",
        meaning: "person",
        glossSource: "kanjidic2",
      },
    ]);
  });

  it("prefers a sense the Wiktionary text already uses", () => {
    const m = parseKanji(
      "商人",
      "しょうにん",
      kanji,
      "A make a deal kind of word.",
      "merchant",
    );
    expect(m[0].meaning).toBe("make a deal");
  });

  it("refuses ateji, and a spelling KANJIDIC2 can't read", () => {
    expect(
      parseKanji(
        "無駄",
        "むだ",
        kanji,
        "The kanji are ateji (当て字).",
        "waste",
      ),
    ).toEqual([]);
    expect(parseKanji("商人", "しょうじん", kanji, "", "x")).not.toEqual([]);
    expect(parseKanji("商人", "あきびと", kanji, "", "x")).toEqual([]);
  });

  it("needs two or more kanji", () => {
    expect(parseKanji("人", "ひと", kanji, "", "person")).toEqual([]);
  });
});

describe("parseLoan", () => {
  it("names the one source language and word", () => {
    expect(parseLoan(["Borrowed from Dutch lens."], "レンズ")).toEqual([
      { text: "レンズ", reading: "レンズ", meaning: "Dutch lens" },
    ]);
  });

  it("stays silent when the source hedges between origins", () => {
    expect(
      parseLoan(["Borrowed from Dutch lens or English lens."], "レンズ"),
    ).toEqual([]);
    expect(parseLoan(["Probably from Dutch Azië."], "アジア")).toEqual([]);
  });

  it("stays silent when two etymologies name different words", () => {
    expect(
      parseLoan(
        ["Borrowed from English tip.", "Borrowed from English chip."],
        "チップ",
      ),
    ).toEqual([]);
  });

  it("does nothing for a word that is not katakana", () => {
    expect(parseLoan(["Borrowed from Dutch kan."], "缶")).toEqual([]);
  });
});

describe("processesOf", () => {
  it("tags what the text says, and nothing else", () => {
    const text =
      "Compound of 花 (hana, “flower”) + 火 (hi, “fire”). The hi changes to bi as an instance of rendaku (連濁).";
    expect(
      processesOf(text, [{ text: "花" }, { text: "火", base: "ひ" }]),
    ).toEqual(["compound", "rendaku"]);
  });

  it("recognises borrowing, clipping, ateji and an unknown origin", () => {
    expect(
      processesOf(
        "Clipping of アパートメント, borrowed from English apartment.",
        [],
      ),
    ).toEqual(expect.arrayContaining(["clipping", "borrowing"]));
    expect(processesOf("The kanji are jukujikun.", [])).toContain("ateji");
    expect(processesOf("Derivation unknown.", [])).toContain("unclear");
  });
});

describe("stratumOf", () => {
  const kanji = {
    花: { on: ["カ", "ケ"], kun: ["はな"] },
    火: { on: ["カ"], kun: ["ひ", "-び", "ほ-"] },
    銀: { on: ["ギン"], kun: [] },
    行: {
      on: ["コウ", "ギョウ", "アン"],
      kun: ["い.く", "ゆ.く", "おこな.う"],
    },
    手: { on: ["シュ", "ズ"], kun: ["て", "た-"] },
    洗: { on: ["セン"], kun: ["あら.う"] },
  };

  it("is gairaigo for katakana and hybrid for kanji+katakana", () => {
    expect(stratumOf("ビール", "ビール", [], "", kanji)).toBe("gairaigo");
    expect(stratumOf("消しゴム", "けしゴム", [], "", kanji)).toBe("hybrid");
  });

  it("reads the layer from KANJIDIC2 readings: all kun is native, all on is Sino-Japanese", () => {
    expect(stratumOf("花火", "はなび", [], "", kanji)).toBe("wago");
    expect(stratumOf("銀行", "ぎんこう", [], "", kanji)).toBe("kango");
  });

  it("calls a mix of on and kun a hybrid", () => {
    expect(stratumOf("手洗", "てせん", [], "", kanji)).toBe("hybrid");
  });

  it("falls back to the evidence only when KANJIDIC2 can't account for the reading", () => {
    expect(stratumOf("花火", "ほげ", [], "From Old Japanese.", kanji)).toBe(
      "wago",
    );
    expect(stratumOf("花火", "ほげ", [], "", kanji)).toBeNull();
  });
});

describe("posOf", () => {
  const vocab = {
    term: "食べる",
    kana: "たべる",
    meaning: "to eat",
    jmdict: [
      {
        kanji: ["食べる"],
        readings: ["たべる"],
        senses: [
          { pos: ["Ichidan verb", "transitive verb"], glosses: ["to eat"] },
          { pos: ["Ichidan verb", "transitive verb"], glosses: ["to live on"] },
        ],
      },
    ],
  };

  it("copies JMdict's tags verbatim for the sense the pool meaning came from", () => {
    expect(posOf(vocab)).toEqual(["Ichidan verb", "transitive verb"]);
  });

  it("ignores a homograph with a different reading", () => {
    const other = {
      ...vocab,
      jmdict: [
        {
          kanji: ["食べる"],
          readings: ["くべる"],
          senses: [{ pos: ["noun"], glosses: ["to eat"] }],
        },
        ...vocab.jmdict,
      ],
    };
    expect(posOf(other)).toEqual(["Ichidan verb", "transitive verb"]);
  });

  it("is empty when JMdict has no entry", () => {
    expect(posOf({ ...vocab, jmdict: [] })).toEqual([]);
  });
});
