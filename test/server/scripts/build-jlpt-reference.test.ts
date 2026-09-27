import { describe, expect, it } from "vitest";
import { buildLevelReference } from "../../../scripts/build-jlpt-reference.mjs";

/**
 * buildLevelReference is the per-level assembly step behind
 * `pnpm data:reference:jlpt` (N4/N3/N2's evidence snapshots, kept separate
 * from N5's gated data/reference/n5-reference.json — see this script's own
 * header comment for why). Exercised here against a stub dictionary so the
 * shape/diagnostics are covered without a real jamdict-data download.
 */
function fakeDict(known: Record<string, unknown[]>) {
  return {
    lookupWord: (term: string, kana: string) => known[`${term} ${kana}`] ?? [],
    kanji: (char: string) => ({
      strokeCount: 1,
      on: [],
      kun: [],
      meanings: [`meaning of ${char}`],
    }),
  };
}

describe("buildLevelReference", () => {
  const entries = [
    {
      term: "食べる",
      kana: "たべる",
      meaning: "to eat",
      listReading: "たべる",
      listMeaning: "to eat",
    },
    {
      term: "運動",
      kana: "うんどう",
      meaning: "exercise",
      listReading: "うんどうする",
      listMeaning: "exercise",
    },
  ];

  it("tags every vocab entry with the given level", () => {
    const ref = buildLevelReference(
      "N4",
      entries,
      fakeDict({ "食べる たべる": [{ idseq: 1 }] }),
    );
    expect(
      ref.vocab.every((v: { jlptLevel: string }) => v.jlptLevel === "N4"),
    ).toBe(true);
  });

  it("records a word with no JMdict match in meta.unresolvedInJmdict", () => {
    const ref = buildLevelReference(
      "N4",
      entries,
      fakeDict({ "食べる たべる": [{ idseq: 1 }] }),
    );
    expect(ref.meta.counts.unresolvedInJmdict).toBe(1);
    expect(ref.meta.unresolvedInJmdict[0]).toContain("運動");
  });

  it("derives kanji evidence from the vocab terms actually assembled", () => {
    const ref = buildLevelReference(
      "N4",
      entries,
      fakeDict({ "食べる たべる": [{ idseq: 1 }] }),
    );
    expect(Object.keys(ref.kanji).sort()).toEqual(["動", "運", "食"]);
  });
});
