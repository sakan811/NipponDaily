import { describe, it, expect } from "vitest";
import { RELATED_LIMIT, relatedWords } from "~~/shared/related";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-12-31";
const entry = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;

describe("relatedWords", () => {
  it("offers at most a handful of other words, never the entry itself", () => {
    const words = relatedWords(entry("2026-03-02"), TODAY);

    expect(words.length).toBeGreaterThan(0);
    expect(words.length).toBeLessThanOrEqual(RELATED_LIMIT);
    expect(words.map((w) => w.date)).not.toContain("2026-03-02");
    expect(new Set(words.map((w) => w.date)).size).toBe(words.length);
  });

  it("ranks words that share a part first, and says which part", () => {
    // 月曜日 is 月 + 曜 + 日; the other weekdays share 曜 and 日.
    const words = relatedWords(entry("2026-03-02"), TODAY);

    expect(words[0]!.shared.parts.length).toBeGreaterThan(0);
    const partsShared = words.map((w) => w.shared.parts.length);
    expect(partsShared).toEqual([...partsShared].sort((a, b) => b - a));
    for (const w of words) {
      const own = new Set(entry(w.date).morphemes.map((m) => m.text));
      for (const part of w.shared.parts) {
        expect(own.has(part)).toBe(true);
        expect(entry("2026-03-02").morphemes.map((m) => m.text)).toContain(
          part,
        );
      }
    }
  });

  it("only reports sharing that is really there", () => {
    const base = entry("2026-10-03"); // 手紙
    for (const w of relatedWords(base, TODAY)) {
      const other = entry(w.date);
      for (const p of w.shared.processes) {
        expect(base.processes).toContain(p);
        expect(other.processes).toContain(p);
      }
      if (w.shared.stratum) {
        expect(base.stratum).toBe(w.shared.stratum);
        expect(other.stratum).toBe(w.shared.stratum);
      }
      expect(
        w.shared.parts.length || w.shared.processes.length || w.shared.stratum,
      ).toBeTruthy();
    }
  });

  it("does not pad the row with words that share only a very common tag", () => {
    // 今年 has no parts and no stated layer; every other open word sharing its
    // "compound" and "borrowing" tags is a weak match, so none is offered.
    expect(relatedWords(entry("2026-01-01"), TODAY)).toEqual([]);
  });

  it("carries the fields the card shows", () => {
    const [w] = relatedWords(entry("2026-10-03"), TODAY);
    const e = entry(w!.date);

    expect(w).toMatchObject({
      date: e.date,
      term: e.term,
      kana: e.kana,
      meaning: e.meaning,
    });
  });

  it("never offers a word that has not opened", () => {
    // On 2026-03-08 only the first 67 days are open.
    const words = relatedWords(entry("2026-03-02"), "2026-03-08");

    expect(words.length).toBeGreaterThan(0);
    for (const w of words) expect(w.date <= "2026-03-08").toBe(true);
    // Same entry, an earlier "today": nothing from after it can appear either.
    for (const w of relatedWords(entry("2026-01-04"), "2026-01-10")) {
      expect(w.date <= "2026-01-10").toBe(true);
    }
  });

  it("is empty when no other word has opened", () => {
    expect(relatedWords(entry("2026-01-01"), "2026-01-01")).toEqual([]);
  });
});
