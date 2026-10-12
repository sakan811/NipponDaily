import { describe, it, expect } from "vitest";
import {
  coverageOf,
  monthLabel,
  percentText,
  rangeMonthsText,
  rangeText,
  summariseCatalogue,
} from "~~/shared/catalogue";
import {
  DATA_SOURCES,
  LICENCES,
  SOURCES,
  wiktionaryPageUrl,
} from "~~/shared/sources";
import { WORD_ENTRIES } from "~~/shared/words";

describe("summariseCatalogue", () => {
  const dates = ["2026-03-02", "2026-03-01", "2026-03-03"];

  it("finds the first and last day however they are ordered", () => {
    const s = summariseCatalogue(dates, "2026-03-02");
    expect(s.first).toBe("2026-03-01");
    expect(s.last).toBe("2026-03-03");
    expect(s.total).toBe(3);
  });

  it("counts a day as open from its own date", () => {
    expect(summariseCatalogue(dates, "2026-02-28").open).toBe(0);
    expect(summariseCatalogue(dates, "2026-03-02").open).toBe(2);
    expect(summariseCatalogue(dates, "2030-01-01").open).toBe(3);
  });

  it("copes with an empty catalogue", () => {
    expect(summariseCatalogue([], "2026-03-02")).toEqual({
      first: "",
      last: "",
      total: 0,
      open: 0,
    });
  });

  it("formats the range both ways", () => {
    const s = summariseCatalogue(dates, "");
    expect(rangeText(s)).toBe("2026-03-01 to 2026-03-03");
    expect(rangeMonthsText(s)).toBe("March 2026 to March 2026");
    expect(monthLabel("2027-10")).toBe("October 2027");
    expect(monthLabel("2026-01-15")).toBe("January 2026");
  });

  it("agrees with the real catalogue", () => {
    const s = summariseCatalogue(
      WORD_ENTRIES.map((e) => e.date),
      "9999-12-31",
    );
    expect(s.total).toBe(WORD_ENTRIES.length);
    expect(s.open).toBe(s.total);
  });
});

describe("coverageOf", () => {
  const bare = { morphemes: [], processes: [], sources: [] };

  it("counts the words that carry each part", () => {
    const c = coverageOf([
      { ...bare, stratum: "wago", pitch: [0], examples: [{}] },
      { ...bare, morphemes: [{}], processes: ["compound"], sources: [{}] },
      { ...bare, pitch: [], examples: [] },
    ]);
    expect(c).toEqual({
      words: 3,
      layer: 1,
      pitch: 1,
      examples: 1,
      parts: 1,
      processes: 1,
      origin: 1,
    });
  });

  it("agrees with the real catalogue", () => {
    const c = coverageOf(WORD_ENTRIES);
    expect(c.words).toBe(WORD_ENTRIES.length);
    expect(c.parts).toBe(WORD_ENTRIES.filter((e) => e.morphemes.length).length);
    expect(c.parts).toBeLessThanOrEqual(c.words);
  });

  it("copes with no words", () => {
    expect(coverageOf([]).words).toBe(0);
  });
});

describe("percentText", () => {
  it("rounds to a whole percent and says nothing for no words", () => {
    expect(percentText(1, 3)).toBe("33%");
    expect(percentText(2, 3)).toBe("67%");
    expect(percentText(0, 0)).toBe("");
  });
});

describe("data sources", () => {
  it("credits every source with its own name, URL and licence", () => {
    expect(DATA_SOURCES.map((s) => s.id).sort()).toEqual(
      Object.keys(SOURCES).sort(),
    );
    for (const s of DATA_SOURCES) {
      expect(s.credit, s.id).toContain(s.url.replace(/\/$/, ""));
      expect(s.credit, s.id).toContain(s.licence.name);
    }
  });

  it("links the CC BY-SA licence text", () => {
    expect(LICENCES.ccBySa4.url).toContain("creativecommons.org");
    expect(SOURCES.wiktionary.credit).toContain(LICENCES.ccBySa4.url);
    expect(SOURCES.edrdg.credit).toContain(LICENCES.ccBySa4.url);
    expect(SOURCES.kanjivg.credit).toContain(LICENCES.ccBySa3.url);
  });

  it("builds a Wiktionary page link", () => {
    expect(wiktionaryPageUrl("手紙")).toBe(
      `https://en.wiktionary.org/wiki/${encodeURIComponent("手紙")}`,
    );
  });
});
