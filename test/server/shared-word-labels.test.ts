import { describe, it, expect } from "vitest";
import {
  FREQUENCY_IDS,
  frequencyOf,
  POS_GROUP_IDS,
  posGroupOfTag,
  posGroupsOf,
} from "~~/shared/word-labels";
import { WORD_ENTRIES } from "~~/shared/words";

describe("posGroupOfTag", () => {
  it.each([
    ["noun (common) (futsuumeishi)", "noun"],
    ["noun or participle which takes the aux. verb suru", "noun"],
    ["nouns which may take the genitive case particle 'no'", "noun"],
    ["noun, used as a suffix", "affix"],
    ["noun, used as a prefix", "affix"],
    ["suffix", "affix"],
    ["prefix", "affix"],
    ["Godan verb with 'ku' ending", "verb"],
    ["Ichidan verb", "verb"],
    ["transitive verb", "verb"],
    ["Kuru verb - special class", "verb"],
    ["irregular nu verb", "verb"],
    ["adjective (keiyoushi)", "adjective"],
    ["adjectival nouns or quasi-adjectives (keiyodoshi)", "adjective"],
    ["pre-noun adjectival (rentaishi)", "adjective"],
    ["adverb (fukushi)", "adverb"],
    ["auxiliary verb", "other"],
    ["noun or verb acting prenominally", "other"],
    ["pronoun", "other"],
    ["counter", "other"],
    ["conjunction", "other"],
    ["expressions (phrases, clauses, etc.)", "other"],
  ])("puts %j under %s", (tag, group) => {
    expect(posGroupOfTag(tag)).toBe(group);
  });
});

describe("posGroupsOf", () => {
  it("lists each group once, in display order", () => {
    expect(
      posGroupsOf([
        "adverb (fukushi)",
        "noun (common) (futsuumeishi)",
        "noun, used as a suffix",
      ]),
    ).toEqual(["noun", "adverb", "affix"]);
  });

  it("marks a word with no tags as unstated", () => {
    expect(posGroupsOf([])).toEqual(["unstated"]);
  });

  it("gives every written word at least one group", () => {
    for (const e of WORD_ENTRIES) {
      const groups = posGroupsOf(e.pos);
      expect(groups.length).toBeGreaterThan(0);
      for (const g of groups) expect(POS_GROUP_IDS).toContain(g);
    }
  });
});

describe("frequencyOf", () => {
  it("is common for a first-tier priority code, less for any other, unlisted for none", () => {
    expect(frequencyOf(["ichi1", "news1", "nf06"])).toBe("common");
    expect(frequencyOf(["news2"])).toBe("less");
    expect(frequencyOf(["ichi2", "nf30"])).toBe("less");
    expect(frequencyOf(["gai1"])).toBe("common");
    expect(frequencyOf(["spec2"])).toBe("common");
    expect(frequencyOf([])).toBe("unlisted");
    expect(frequencyOf(undefined)).toBe("unlisted");
    expect(FREQUENCY_IDS).toEqual(["common", "less", "unlisted"]);
  });
});
