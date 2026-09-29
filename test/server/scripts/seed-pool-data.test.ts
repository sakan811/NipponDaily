import { describe, expect, it } from "vitest";
import {
  VOCAB_MEANING_OVERRIDES,
  VOCAB_READING_OVERRIDES,
  checkMeaning,
  findReversedMeaning,
  parseJlptCsv,
  parseN5Csv,
  assembleVocab,
  dedupeAcrossLevels,
  deriveKanjiChars,
  poolIdsKey,
  poolItemPrefix,
} from "../../../scripts/seed-pool-data.mjs";

// Guards against a known-bad gloss in the upstream elzup/jlpt-word-list N5
// CSV silently reappearing (see scripts/seed-pool-data.mjs for the story):
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
    expect(
      findReversedMeaning("this way (polite)", "that way; over there"),
    ).toBe("this <-> that");
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

// parseJlptCsv generalizes N5-only parseN5Csv to any level — n3.csv/n2.csv
// don't carry a reliable per-row level tag the way n5.csv/n4.csv do (see
// scripts/word-list-source.mjs), so it trusts the file itself rather
// than filtering by tag. This guards that generalization didn't change
// N5's own output, and that every parsed entry is tagged with the level
// its own file represents.
describe("parseJlptCsv", () => {
  const csv =
    "expression,reading,meaning,tags\n" +
    "食べる,たべる,to eat,JLPT JLPT_N5\n" +
    '踏む,ふむ,"to step on, to tread on",JLPT JLPT_N4\n';

  it("tags every row with the given level regardless of its own tags column", () => {
    const n5 = parseJlptCsv(csv, "N5");
    const n4 = parseJlptCsv(csv, "N4");
    expect(n5.every((e: { jlptLevel: string }) => e.jlptLevel === "N5")).toBe(
      true,
    );
    expect(n4.every((e: { jlptLevel: string }) => e.jlptLevel === "N4")).toBe(
      true,
    );
    // Same two rows either way — level tagging, not row filtering.
    expect(n5).toHaveLength(2);
    expect(n4).toHaveLength(2);
  });

  it('parseN5Csv is identical to parseJlptCsv(text, "N5")', () => {
    expect(parseN5Csv(csv)).toEqual(parseJlptCsv(csv, "N5"));
  });
});

describe("assembleVocab / deriveKanjiChars", () => {
  it("stamps the given level onto every assembled vocab entry", () => {
    const entries = [
      { term: "食べる", kana: "たべる", meaning: "to eat" },
      { term: "飲む", kana: "のむ", meaning: "to drink" },
    ];
    const { vocab } = assembleVocab(entries, new Map(), "N3");
    expect(
      vocab.every((v: { jlptLevel: string }) => v.jlptLevel === "N3"),
    ).toBe(true);
  });

  it("gives each level its own id namespace (no cross-level id suffixing)", () => {
    // Both levels happen to share a term — assembling them separately (as
    // seedLevel does, one call per level) must not suffix the second one
    // with "-2" the way a shared id set would.
    const entries = [{ term: "本", kana: "ほん", meaning: "book" }];
    const { vocab: n5 } = assembleVocab(entries, new Map(), "N5");
    const { vocab: n4 } = assembleVocab(entries, new Map(), "N4");
    expect(n5[0]!.id).toBe("本");
    expect(n4[0]!.id).toBe("本");
  });

  it("derives the union of kanji characters across the given vocab", () => {
    const vocab = [{ term: "食べる" }, { term: "飲む" }, { term: "水" }];
    expect(new Set(deriveKanjiChars(vocab))).toEqual(
      new Set(["食", "飲", "水"]),
    );
  });
});

// Real-world case (see data/reference/{n5,n4,n3}-reference.json): elzup's
// per-level CSVs are curated independently, so a handful of words end up
// listed at more than one level with the exact same reading — the lower
// (easier) level should keep them, per CLAUDE.md's Content Accuracy notes.
describe("dedupeAcrossLevels", () => {
  it("drops a later level's entry when an earlier level already claimed the same term+reading", () => {
    const seenByKey = new Map();
    dedupeAcrossLevels(
      [{ term: "在る", kana: "ある", meaning: "to be, to have" }],
      "N5",
      seenByKey,
    );
    const { kept, dropped } = dedupeAcrossLevels(
      [{ term: "在る", kana: "ある", meaning: "to live, to be, to exist" }],
      "N3",
      seenByKey,
    );
    expect(kept).toEqual([]);
    expect(dropped).toEqual([
      {
        term: "在る",
        kana: "ある",
        meaning: "to live, to be, to exist",
        keptAtLevel: "N5",
      },
    ]);
  });

  it("keeps entries whose term matches but reading differs (a different word, same spelling)", () => {
    const seenByKey = new Map();
    dedupeAcrossLevels(
      [{ term: "開く", kana: "あく", meaning: "to open, to become open" }],
      "N5",
      seenByKey,
    );
    const { kept, dropped } = dedupeAcrossLevels(
      [
        {
          term: "開く",
          kana: "ひらく",
          meaning: "to open; to hold (an event)",
        },
      ],
      "N4",
      seenByKey,
    );
    expect(dropped).toEqual([]);
    expect(kept).toHaveLength(1);
    expect(kept[0].kana).toBe("ひらく");
  });

  it("keeps an entry re-seen at its own owning level (idempotent re-run)", () => {
    const seenByKey = new Map();
    dedupeAcrossLevels(
      [{ term: "水", kana: "みず", meaning: "water" }],
      "N5",
      seenByKey,
    );
    const { kept, dropped } = dedupeAcrossLevels(
      [{ term: "水", kana: "みず", meaning: "water" }],
      "N5",
      seenByKey,
    );
    expect(kept).toHaveLength(1);
    expect(dropped).toEqual([]);
  });
});

// poolIdsKey/poolItemPrefix are duplicated (not shared, see the comment at
// their definition) between this script and
// server/services/pool-data.ts — this pins their exact shape so the two
// can't silently drift out of sync with each other.
describe("poolIdsKey / poolItemPrefix", () => {
  it("keeps N5's original, un-namespaced keys", () => {
    expect(poolIdsKey("vocab", "N5")).toBe("n5:vocab_ids");
    expect(poolItemPrefix("vocab", "N5")).toBe("n5:vocab:");
    expect(poolIdsKey("kanji", "N5")).toBe("n5:kanji_ids");
    expect(poolItemPrefix("kanji", "N5")).toBe("n5:kanji:");
  });

  it("namespaces other levels under their own key", () => {
    expect(poolIdsKey("vocab", "N4")).toBe("n5:vocab_ids:N4");
    expect(poolItemPrefix("vocab", "N4")).toBe("n5:vocab:N4:");
    expect(poolIdsKey("kanji", "N2")).toBe("n5:kanji_ids:N2");
    expect(poolItemPrefix("kanji", "N2")).toBe("n5:kanji:N2:");
  });
});

describe("checkMeaning", () => {
  it("skips entries where JMdict's reading doesn't match (homograph guard)", () => {
    // 外/そと ("outside") vs 外/ほか ("other") share a kanji but are
    // different words — checkMeaning must not compare across them.
    const entry = { term: "外", kana: "そと", meaning: "outside, exterior" };
    const jmdict = {
      kana: "ほか",
      meaning: "other, the rest",
      allGlosses: ["other", "the rest"],
    };
    expect(checkMeaning(entry, jmdict)).toBeNull();
  });

  it("flags a same-reading reversed gloss", () => {
    const entry = {
      term: "あちら",
      kana: "あちら",
      meaning: "this way (polite)",
    };
    const jmdict = {
      kana: "あちら",
      meaning: "that way",
      allGlosses: ["that way", "that direction", "over there"],
    };
    const warning = checkMeaning(entry, jmdict);
    expect(warning?.pair).toBe("this <-> that");
  });
});
