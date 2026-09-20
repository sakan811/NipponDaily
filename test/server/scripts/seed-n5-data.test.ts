import { describe, expect, it } from "vitest";
import {
  VOCAB_MEANING_OVERRIDES,
  VOCAB_READING_OVERRIDES,
  checkMeaning,
  findReversedMeaning,
} from "../../../scripts/seed-n5-data.mjs";

// Guards against a known-bad gloss in the upstream elzup/jlpt-word-list N5
// CSV silently reappearing (see scripts/seed-n5-data.mjs for the story):
// あちら is the far-from-both-parties direction word ("that way over
// there"), but the source list has it backwards as "this way (polite)".
describe("VOCAB_MEANING_OVERRIDES", () => {
  it("corrects あちら's reversed gloss", () => {
    expect(VOCAB_MEANING_OVERRIDES["あちら あちら"]).toBe(
      "that way, over there (polite)",
    );
  });
});

// Source list stores this reading as "(〜を) とお", bundling in a
// grammar usage note (object-marking を) rather than a bare reading —
// this override strips it down to the actual native reading, とお, so it
// can be surfaced as its own entry in the Numbers cluster's native
// counting row (see app/data/vocab-guide.ts).
describe("VOCAB_READING_OVERRIDES", () => {
  it("strips the usage-note annotation from 十's native とお reading", () => {
    expect(VOCAB_READING_OVERRIDES["十 (〜を) とお"]).toBe("とお");
  });

  it("gives 十's native reading a 'thing(s)' gloss matching the rest of the native counting set", () => {
    expect(VOCAB_MEANING_OVERRIDES["十 (〜を) とお"]).toBe("ten things");
  });
});

// findReversedMeaning/checkMeaning are the auto-check that would have
// caught the あちら bug at seed time, by comparing the CSV gloss against
// JMdict's own gloss for the same term+reading and flagging swapped
// antonym pairs (this/that, near/far, …) rather than a plain "no shared
// words" diff, which is far too noisy (~11% of the pool is synonym drift).
describe("findReversedMeaning", () => {
  it("flags a this/that swap, e.g. the original あちら bug", () => {
    expect(findReversedMeaning("this way (polite)", "that way; over there")).toBe(
      "this <-> that",
    );
  });

  it("does not flag ordinary synonym drift", () => {
    expect(findReversedMeaning("shoes, footwear", "shoe")).toBeNull();
    expect(findReversedMeaning("automobile", "car")).toBeNull();
  });

  it("does not flag when both sides mention both sides of a pair", () => {
    expect(
      findReversedMeaning("this and that", "this way; that way"),
    ).toBeNull();
  });
});

describe("checkMeaning", () => {
  it("skips entries where JMdict's reading doesn't match (homograph guard)", () => {
    // 外/そと ("outside") vs 外/ほか ("other") share a kanji but are
    // different words — checkMeaning must not compare across them.
    const entry = { term: "外", kana: "そと", meaning: "outside, exterior" };
    const jmdict = { kana: "ほか", meaning: "other, the rest", allGlosses: ["other", "the rest"] };
    expect(checkMeaning(entry, jmdict)).toBeNull();
  });

  it("flags a same-reading reversed gloss", () => {
    const entry = { term: "あちら", kana: "あちら", meaning: "this way (polite)" };
    const jmdict = {
      kana: "あちら",
      meaning: "that way",
      allGlosses: ["that way", "that direction", "over there"],
    };
    const warning = checkMeaning(entry, jmdict);
    expect(warning?.pair).toBe("this <-> that");
  });
});
