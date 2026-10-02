import { describe, it, expect } from "vitest";
import { exploreWords, foldForSearch } from "~~/shared/explore";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-03-08";
const open = WORD_ENTRIES.filter((e) => e.date <= TODAY);

describe("foldForSearch", () => {
  it("folds katakana to hiragana and lower-cases", () => {
    expect(foldForSearch("ラジオ")).toBe("らじお");
    expect(foldForSearch(" Telephone ")).toBe("telephone");
  });
});

describe("exploreWords", () => {
  it("with no filters returns every open word, newest first", () => {
    const result = exploreWords({}, TODAY);

    expect(result.total).toBe(open.length);
    expect(result.count).toBe(open.length);
    expect(result.words.map((w) => w.date)).toEqual(
      open.map((e) => e.date).reverse(),
    );
  });

  it("never returns or counts an upcoming word", () => {
    const result = exploreWords({}, "2026-01-02");

    expect(result.words.map((w) => w.date)).toEqual([
      "2026-01-02",
      "2026-01-01",
    ]);
    expect(result.total).toBe(2);
    expect(result.facets.level.reduce((n, f) => n + f.count, 0)).toBe(2);
    expect(exploreWords({}, "2025-12-31")).toMatchObject({
      total: 0,
      count: 0,
      words: [],
    });
  });

  it("filters by level, layer and process, and they narrow together", () => {
    const n5 = exploreWords({ level: "N5" }, TODAY);
    expect(n5.words.length).toBeGreaterThan(0);
    expect(n5.words.every((w) => w.level === "N5")).toBe(true);

    const native = exploreWords({ level: "N5", stratum: "wago" }, TODAY);
    expect(native.count).toBeLessThan(n5.count);
    expect(
      native.words.every((w) => w.level === "N5" && w.stratum === "wago"),
    ).toBe(true);

    const rendaku = exploreWords({ process: "rendaku" }, TODAY);
    expect(rendaku.words.every((w) => w.processes.includes("rendaku"))).toBe(
      true,
    );
    expect(rendaku.count).toBe(
      open.filter((e) => e.processes.includes("rendaku")).length,
    );
  });

  it("filters by the part a word is taken apart into", () => {
    const result = exploreWords({ part: "日" }, TODAY);

    expect(result.count).toBe(10);
    expect(result.words.every((w) => w.hasParts)).toBe(true);
  });

  it("searches the term, the reading and the meaning", () => {
    const entry = open.find((e) => /[ァ-ヶ]/.test(e.term))!;

    const byTerm = exploreWords({ q: entry.term }, TODAY);
    expect(byTerm.words.map((w) => w.date)).toContain(entry.date);

    // Hiragana finds a katakana word.
    const byKana = exploreWords({ q: foldForSearch(entry.term) }, TODAY);
    expect(byKana.words.map((w) => w.date)).toContain(entry.date);

    const meaningWord = entry.meaning
      .split(/[\s;,]+/)
      .find((w) => w.length > 3)!;
    const byMeaning = exploreWords({ q: meaningWord.toUpperCase() }, TODAY);
    expect(byMeaning.words.map((w) => w.date)).toContain(entry.date);

    expect(exploreWords({ q: "zzzzzz-no-such-word" }, TODAY).count).toBe(0);
  });

  it("counts each facet over the words the *other* filters leave", () => {
    const result = exploreWords({ level: "N5", stratum: "wago" }, TODAY);

    // The level facet ignores the level filter but honours the layer one …
    const wagoByLevel = (level: string) =>
      open.filter((e) => e.level === level && e.stratum === "wago").length;
    for (const f of result.facets.level) {
      expect(f.count).toBe(wagoByLevel(f.value));
    }
    // … and picking a facet option yields exactly that many words.
    for (const f of result.facets.stratum) {
      expect(exploreWords({ level: "N5", stratum: f.value }, TODAY).count).toBe(
        f.count,
      );
    }
    for (const f of result.facets.process) {
      expect(
        exploreWords({ level: "N5", stratum: "wago", process: f.value }, TODAY)
          .count,
      ).toBe(f.count);
    }
  });

  it("summarises a word without its sources or morphemes", () => {
    const [first] = exploreWords({}, "2026-01-01").words;

    expect(Object.keys(first!).sort()).toEqual(
      [
        "date",
        "hasParts",
        "kana",
        "level",
        "meaning",
        "processes",
        "stratum",
        "term",
      ].sort(),
    );
  });
});
