import { describe, it, expect } from "vitest";
import { exploreWords, foldForSearch } from "~~/shared/explore";
import { posGroupsOf } from "~~/shared/word-labels";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-03-08";
const open = WORD_ENTRIES.filter((e) => e.date <= TODAY);
const FIRST = WORD_ENTRIES[0]!.date;
const SECOND = WORD_ENTRIES[1]!.date;
const dayBefore = (date: string) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - 864e5).toISOString().slice(0, 10);

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
    const result = exploreWords({}, SECOND);

    expect(result.words.map((w) => w.date)).toEqual([SECOND, FIRST]);
    expect(result.total).toBe(2);
    expect(result.facets.level.reduce((n, f) => n + f.count, 0)).toBe(2);
    expect(exploreWords({}, dayBefore(FIRST))).toMatchObject({
      total: 0,
      count: 0,
      words: [],
    });
  });

  it("filters by level, layer and process, and they narrow together", () => {
    const n5 = exploreWords({ level: ["N5"] }, TODAY);
    expect(n5.words.length).toBeGreaterThan(0);
    expect(n5.words.every((w) => w.level === "N5")).toBe(true);

    const native = exploreWords({ level: ["N5"], stratum: ["wago"] }, TODAY);
    expect(native.count).toBeLessThan(n5.count);
    expect(
      native.words.every((w) => w.level === "N5" && w.stratum === "wago"),
    ).toBe(true);

    const rendaku = exploreWords({ process: ["rendaku"] }, TODAY);
    expect(rendaku.words.every((w) => w.processes.includes("rendaku"))).toBe(
      true,
    );
    expect(rendaku.count).toBe(
      open.filter((e) => e.processes.includes("rendaku")).length,
    );
  });

  it("filters by the part a word is taken apart into", () => {
    const result = exploreWords({ part: "日" }, TODAY);

    expect(result.count).toBe(
      open.filter((e) => e.morphemes.some((m) => m.text === "日")).length,
    );
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
    const result = exploreWords({ level: ["N5"], stratum: ["wago"] }, TODAY);

    // The level facet ignores the level filter but honours the layer one …
    const wagoByLevel = (level: string) =>
      open.filter((e) => e.level === level && e.stratum === "wago").length;
    for (const f of result.facets.level) {
      expect(f.count).toBe(wagoByLevel(f.value));
    }
    // … and picking a facet option yields exactly that many words.
    for (const f of result.facets.stratum) {
      expect(
        exploreWords({ level: ["N5"], stratum: [f.value] }, TODAY).count,
      ).toBe(f.count);
    }
    for (const f of result.facets.process) {
      expect(
        exploreWords(
          { level: ["N5"], stratum: ["wago"], process: [f.value] },
          TODAY,
        ).count,
      ).toBe(f.count);
    }
  });

  it("keeps a word that has any of several choices, or all of them", () => {
    const either = exploreWords({ process: ["rendaku", "wasei"] }, TODAY);
    expect(either.count).toBe(
      open.filter(
        (e) => e.processes.includes("rendaku") || e.processes.includes("wasei"),
      ).length,
    );

    const both = exploreWords(
      { process: ["rendaku", "compound"], match: "all" },
      TODAY,
    );
    expect(both.count).toBe(
      open.filter(
        (e) =>
          e.processes.includes("rendaku") && e.processes.includes("compound"),
      ).length,
    );
    expect(both.count).toBeGreaterThan(0);
    expect(both.count).toBeLessThan(
      exploreWords({ process: ["rendaku", "compound"] }, TODAY).count,
    );
  });

  it("reads several levels or layers as any, even when asked for all", () => {
    const levels = exploreWords({ level: ["N5", "N4"], match: "all" }, TODAY);
    expect(levels.count).toBe(
      open.filter((e) => e.level === "N5" || e.level === "N4").length,
    );
  });

  it("finds the words with no stated layer under 'unstated'", () => {
    const unstated = exploreWords({ stratum: ["unstated"] }, TODAY);

    expect(unstated.count).toBe(open.filter((e) => !e.stratum).length);
    expect(unstated.count).toBeGreaterThan(0);
    expect(unstated.words.every((w) => w.stratum === undefined)).toBe(true);
    expect(
      exploreWords({}, TODAY).facets.stratum.map((f) => f.value),
    ).toContain("unstated");
    // Every open word is in exactly one layer facet.
    expect(
      exploreWords({}, TODAY).facets.stratum.reduce((n, f) => n + f.count, 0),
    ).toBe(open.length);
  });

  it("filters by part-of-speech group", () => {
    const verbs = exploreWords({ pos: ["verb"] }, TODAY);

    expect(verbs.count).toBe(
      open.filter((e) => posGroupsOf(e.pos).includes("verb")).length,
    );
    expect(verbs.count).toBeGreaterThan(0);
    expect(
      exploreWords({ pos: ["verb", "adjective"] }, TODAY).count,
    ).toBeGreaterThan(verbs.count);
    expect(
      exploreWords({ pos: ["verb", "noun"], match: "all" }, TODAY).count,
    ).toBe(
      open.filter((e) => {
        const g = posGroupsOf(e.pos);
        return g.includes("verb") && g.includes("noun");
      }).length,
    );
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
