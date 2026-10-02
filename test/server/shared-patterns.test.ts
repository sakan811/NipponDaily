import { describe, it, expect } from "vitest";
import { patternsFor } from "~~/shared/patterns";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-12-31";
const open = (today: string) => WORD_ENTRIES.filter((e) => e.date <= today);

describe("patternsFor", () => {
  it("counts every open word once in each breakdown", () => {
    const p = patternsFor(TODAY);

    expect(p.total).toBe(open(TODAY).length);
    expect(p.strata.reduce((n, s) => n + s.count, 0)).toBe(p.total);
    expect(p.levels.reduce((n, l) => n + l.count, 0)).toBe(p.total);
    for (const level of p.levels) {
      expect(Object.values(level.byStratum).reduce((a, b) => a + b, 0)).toBe(
        level.count,
      );
    }
  });

  it("counts a process once per word that carries it, most-used first", () => {
    const p = patternsFor(TODAY);

    for (const row of p.processes) {
      expect(row.count).toBe(
        open(TODAY).filter((e) => e.processes.includes(row.value)).length,
      );
      expect(Object.values(row.byStratum).reduce((a, b) => a + b, 0)).toBe(
        row.count,
      );
    }
    expect(p.processes.map((r) => r.count)).toEqual(
      [...p.processes.map((r) => r.count)].sort((a, b) => b - a),
    );
  });

  it("reports how many words show parts and a changed reading", () => {
    const p = patternsFor(TODAY);

    expect(p.withParts).toBe(
      open(TODAY).filter((e) => e.morphemes.length).length,
    );
    expect(p.withBase).toBe(
      open(TODAY).filter((e) => e.morphemes.some((m) => m.base)).length,
    );
    expect(p.withBase).toBeLessThanOrEqual(p.withParts);
  });

  it("lists process pairs with the words that carry both", () => {
    const p = patternsFor(TODAY);

    expect(p.pairs.length).toBeGreaterThan(0);
    expect(p.pairs.map((x) => x.count)).toEqual(
      [...p.pairs.map((x) => x.count)].sort((a, b) => b - a),
    );
    for (const pair of p.pairs) {
      expect(pair.a).not.toBe(pair.b);
      const both = open(TODAY).filter(
        (e) => e.processes.includes(pair.a) && e.processes.includes(pair.b),
      );
      expect(pair.count).toBe(both.length);
      expect(pair.examples.length).toBeLessThanOrEqual(3);
      for (const ex of pair.examples) {
        expect(both.map((e) => e.date)).toContain(ex.date);
      }
    }
  });

  it("never counts an upcoming word", () => {
    const early = patternsFor("2026-01-02");

    expect(early.total).toBe(2);
    expect(patternsFor("2025-12-31")).toMatchObject({
      total: 0,
      withParts: 0,
      pairs: [],
      processes: [],
    });
    // Everything an upcoming-day example names has itself opened.
    const mid = patternsFor("2026-03-08");
    for (const pair of mid.pairs) {
      for (const ex of pair.examples) {
        expect(ex.date <= "2026-03-08").toBe(true);
      }
    }
  });
});
