import { describe, expect, it } from "vitest";
import {
  entriesForReading,
  glossesAgree,
  homophoneGroups,
  meaningSupport,
  posTags,
  readingCandidates,
  readingIsAttested,
  transitivityPairs,
  // @ts-expect-error — untyped .mjs authoring helper
} from "../../../scripts/lib/authoring-evidence.mjs";

interface Entry {
  readings: string[];
  senses: { pos: string[]; glosses: string[] }[];
}
const word = (
  term: string,
  kana: string,
  meaning: string,
  entries: Entry[],
  id = term,
) => ({ id, term, kana, meaning, jmdict: entries });

const entry = (
  readings: string[],
  glosses: string[],
  pos: string[] = ["noun (common) (futsuumeishi)"],
): Entry => ({ readings, senses: [{ pos, glosses }] });

describe("readingCandidates / readingIsAttested", () => {
  it("strips suru markers, affixes and trailing adverb particles", () => {
    expect(readingCandidates("べんきょう (する)")).toContain("べんきょう");
    expect(readingCandidates("コピーする")).toContain("こぴー");
    expect(readingCandidates("ゆっくりと")).toContain("ゆっくり");
    expect(readingCandidates("～ころ")).toEqual(["ころ"]);
  });

  it("accepts a reading JMdict gives, rejects one it doesn't", () => {
    const ok = word("運動", "うんどうする", "exercise", [
      entry(["うんどう"], ["exercise"]),
    ]);
    const bad = word("本", "ぽん", "book", [entry(["ほん"], ["book"])]);
    expect(readingIsAttested(ok)).toBe(true);
    expect(readingIsAttested(bad)).toBe(false);
  });
});

describe("glossesAgree", () => {
  it("treats inflections and derivations as the same word", () => {
    expect(glossesAgree("honesty, integrity", "honest")).toBe(true);
    expect(glossesAgree("preparation", "to prepare")).toBe(true);
    expect(glossesAgree("to hesitate", "to be hesitant")).toBe(true);
  });

  it("does not match unrelated glosses", () => {
    expect(glossesAgree("helping, serving", "peak of the season")).toBe(false);
    expect(glossesAgree("ton (1000 lbs.)", "dot (in Morse code)")).toBe(false);
  });
});

describe("meaningSupport", () => {
  it("flags a gloss that belongs to a different reading of the same kanji", () => {
    // 盛り read さかり ("peak") carrying もり's "helping, serving".
    const v = word("盛り", "さかり", "helping, serving", [
      entry(
        ["さかり"],
        ["height (of summer)", "peak", "prime (of one's life)"],
      ),
    ]);
    expect(meaningSupport(v).status).toBe("unsupported");
  });

  it("judges against the entry that has the word's own reading", () => {
    const v = word("退く", "どく", "to retreat", [
      entry(["しりぞく"], ["to retreat", "to withdraw"]),
      entry(["どく"], ["to step aside", "to make way"]),
    ]);
    expect(entriesForReading(v)).toHaveLength(1);
    expect(meaningSupport(v).status).toBe("unsupported");
  });

  it("reports partly-backed, backed and usage-note meanings apart", () => {
    const glosses = ["to eat", "to drink"];
    const partial = word("食う", "くう", "to eat; to fly", [
      entry(["くう"], glosses),
    ]);
    expect(meaningSupport(partial)).toEqual({
      status: "partial",
      unbacked: ["to fly"],
    });
    const backed = word("食う", "くう", "to eat", [entry(["くう"], glosses)]);
    expect(meaningSupport(backed).status).toBe("backed");
    const note = word(
      "召し上がる",
      "めしあがる",
      "-- honorific form of 食べる --",
      [entry(["めしあがる"], glosses)],
    );
    expect(meaningSupport(note).status).toBe("usage-note");
    expect(meaningSupport(word("x", "x", "y", [])).status).toBe("no-evidence");
  });
});

describe("posTags / transitivityPairs / homophoneGroups", () => {
  const vt = ["Ichidan verb", "transitive verb"];
  const vi = ["Godan verb with 'ru' ending", "intransitive verb"];

  it("summarises JMdict's POS labels as short tags", () => {
    expect(posTags(word("a", "a", "m", [entry(["a"], ["m"], vt)]))).toEqual([
      "v1",
      "vt",
    ]);
    expect(
      posTags(
        word("b", "b", "m", [
          entry(
            ["b"],
            ["m"],
            ["adjectival nouns or quasi-adjectives (keiyodoshi)"],
          ),
        ]),
      ),
    ).toEqual(["adj-na"]);
  });

  it("pairs a transitive and an intransitive verb sharing kanji and a kana stem", () => {
    const open = word("開ける", "あける", "to open", [
      entry(["あける"], ["to open"], vt),
    ]);
    const opens = word("開く", "あく", "to be open", [
      entry(["あく"], ["to open"], vi),
    ]);
    const unrelated = word("消す", "けす", "to erase", [
      entry(["けす"], ["to erase"], vt),
    ]);
    const pairs = transitivityPairs([open, opens, unrelated]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].map((v: { term: string }) => v.term)).toEqual([
      "開ける",
      "開く",
    ]);
  });

  it("groups words that share a reading but not a written form", () => {
    const a = word("冷ます", "さます", "to cool", [
      entry(["さます"], ["cool"]),
    ]);
    const b = word("覚ます", "さます", "to wake", [
      entry(["さます"], ["wake"]),
    ]);
    const c = word("猿", "さる", "monkey", [entry(["さる"], ["monkey"])]);
    const groups = homophoneGroups([a, b, c]);
    expect(groups).toHaveLength(1);
    expect(groups[0][0]).toBe("さます");
  });
});
