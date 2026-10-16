import { describe, it, expect } from "vitest";
import { SOUND_ALIKE_GROUP_LIMIT } from "~~/shared/limits";
import { classifyChange, patternsFor } from "~~/shared/patterns";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-12-31";
const open = (today: string) => WORD_ENTRIES.filter((e) => e.date <= today);
const addDays = (date: string, n: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + n * 864e5)
    .toISOString()
    .slice(0, 10);
const dayBefore = (date: string) => addDays(date, -1);

describe("patternsFor combinations", () => {
  const p = patternsFor(TODAY);
  const carries = (
    e: (typeof WORD_ENTRIES)[number],
    c: (typeof p.combinations)[number],
  ) =>
    c.processes.every((x) => e.processes.includes(x)) &&
    (!c.stratum || e.stratum === c.stratum);

  it("lists sets of three or four tags, most-shared first", () => {
    expect(p.combinations.length).toBeGreaterThan(0);
    expect(p.combinations.length).toBeLessThanOrEqual(10);
    expect(p.combinations.map((c) => c.count)).toEqual(
      [...p.combinations.map((c) => c.count)].sort((a, b) => b - a),
    );
    for (const c of p.combinations) {
      const size = c.processes.length + (c.stratum ? 1 : 0);
      expect(size).toBeGreaterThanOrEqual(3);
      expect(size).toBeLessThanOrEqual(4);
    }
  });

  it("counts exactly the open words that carry every tag, with examples that do", () => {
    for (const c of p.combinations) {
      const words = open(TODAY).filter((e) => carries(e, c));
      expect(c.count).toBe(words.length);
      expect(c.examples.length).toBeGreaterThan(0);
      for (const ex of c.examples) {
        expect(words.map((e) => e.date)).toContain(ex.date);
      }
    }
  });

  it("includes the layer, as in rendaku, compound and native together", () => {
    expect(
      p.combinations.some(
        (c) =>
          c.stratum === "wago" &&
          c.processes.includes("rendaku") &&
          c.processes.includes("compound"),
      ),
    ).toBe(true);
  });

  it("never lists a set whose words are exactly a larger listed set's", () => {
    const key = (c: (typeof p.combinations)[number]) =>
      [...c.processes, c.stratum].filter(Boolean);
    for (const a of p.combinations) {
      for (const b of p.combinations) {
        if (a === b) continue;
        const bigger =
          key(b).length > key(a).length &&
          key(a).every((t) => key(b).includes(t));
        expect(bigger && a.count === b.count).toBe(false);
      }
    }
  });

  it("counts open days only", () => {
    const first = WORD_ENTRIES[0]!.date;
    expect(patternsFor(dayBefore(first)).combinations).toEqual([]);
    for (const c of patternsFor(addDays(first, 30)).combinations) {
      expect(c.count).toBeLessThanOrEqual(31);
    }
  });
});

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

  it("accounts for every part whose reading changed, in exactly one group", () => {
    const { rendaku } = patternsFor(TODAY);
    const changed = open(TODAY).flatMap((e) =>
      e.morphemes.filter((m) => m.base && m.base !== m.reading),
    );
    const grouped = [
      ...rendaku.voiced.flatMap((s) => s.readings),
      ...rendaku.sokuon,
      ...rendaku.other,
    ];

    expect(grouped.reduce((n, r) => n + r.count, 0)).toBe(changed.length);
    expect(rendaku.words).toBe(
      open(TODAY).filter((e) =>
        e.morphemes.some((m) => m.base && m.base !== m.reading),
      ).length,
    );
    expect(rendaku.words).toBe(patternsFor(TODAY).withBase);
  });

  it("groups voiced readings by the sound that changed, most words first", () => {
    const { voiced } = patternsFor(TODAY).rendaku;
    const hi = voiced.find((s) => s.from === "ひ" && s.to === "び")!;

    expect(voiced.map((s) => s.count)).toEqual(
      [...voiced.map((s) => s.count)].sort((a, b) => b - a),
    );
    // 日 is ひ alone and び in the weekdays, 花火 and the like.
    expect(hi.readings.find((r) => r.part === "日")).toMatchObject({
      base: "ひ",
      reading: "び",
      position: "later",
    });
    for (const sound of voiced) {
      for (const r of sound.readings) {
        expect(r.reading[0]).toBe(sound.to);
        expect(r.base[0]).toBe(sound.from);
        expect(r.examples.length).toBeLessThanOrEqual(3);
        expect(r.examples.length).toBeLessThanOrEqual(r.count);
      }
    }
  });

  it("keeps a word-final っ change apart from voicing", () => {
    const { sokuon, voiced } = patternsFor(TODAY).rendaku;

    expect(sokuon.length).toBeGreaterThan(0);
    for (const r of sokuon) expect(r.reading.endsWith("っ")).toBe(true);
    for (const s of voiced) {
      for (const r of s.readings) expect(r.reading.endsWith("っ")).toBe(false);
    }
  });

  it("only reports changes from words that have opened", () => {
    const first = WORD_ENTRIES[0]!.date;
    const cutoff = addDays(first, 4);
    const early = patternsFor(cutoff).rendaku;
    const all = [
      ...early.voiced.flatMap((s) => s.readings),
      ...early.sokuon,
      ...early.other,
    ];

    expect(early.words).toBeLessThanOrEqual(5); // five days open
    for (const r of all) {
      for (const ex of r.examples) expect(ex.date <= cutoff).toBe(true);
    }
    expect(patternsFor(dayBefore(first)).rendaku).toEqual({
      words: 0,
      voiced: [],
      sokuon: [],
      other: [],
    });
  });

  it("never counts an upcoming word", () => {
    const first = WORD_ENTRIES[0]!.date;
    const early = patternsFor(addDays(first, 1));

    expect(early.total).toBe(2);
    expect(patternsFor(dayBefore(first))).toMatchObject({
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

describe("classifyChange", () => {
  it("recognises a voiced first kana", () => {
    expect(classifyChange("ひ", "び")).toEqual({
      kind: "voiced",
      from: "ひ",
      to: "び",
    });
    expect(classifyChange("かみ", "がみ")).toMatchObject({ kind: "voiced" });
    expect(classifyChange("つき", "づき")).toMatchObject({ kind: "voiced" });
    expect(classifyChange("せい", "ぜい")).toMatchObject({ kind: "voiced" });
  });

  it("treats ち→じ and つ→ず as voicing (the four-kana merger)", () => {
    expect(classifyChange("ち", "じ")).toMatchObject({ kind: "voiced" });
    expect(classifyChange("つ", "ず")).toMatchObject({ kind: "voiced" });
  });

  it("recognises a reading that ends in っ", () => {
    expect(classifyChange("みつ", "みっ")).toEqual({ kind: "sokuon" });
    expect(classifyChange("こく", "こっ")).toEqual({ kind: "sokuon" });
  });

  it("leaves anything else as other", () => {
    expect(classifyChange("かわ", "はな")).toEqual({ kind: "other" });
    expect(classifyChange("ひ", "ひい")).toEqual({ kind: "other" });
    // Voiced first kana but the rest also differs.
    expect(classifyChange("かみ", "がも")).toEqual({ kind: "other" });
  });
});

describe("patternsFor pitch by layer", () => {
  const p = patternsFor(TODAY);

  it("counts the accents the open entries show, by pattern and layer", () => {
    const shown = open(TODAY).filter((e) => e.pitch?.length);
    expect(p.pitch.reduce((n, r) => n + r.words, 0)).toBe(shown.length);
    const accents = shown.reduce((n, e) => n + e.pitch!.length, 0);
    expect(
      p.pitch.reduce(
        (n, r) => n + Object.values(r.accents).reduce((a, b) => a + b, 0),
        0,
      ),
    ).toBe(accents);
  });

  it("puts a flat accent under heiban and an accent on the first mora under atamadaka", () => {
    const flat = open(TODAY).filter((e) => e.pitch?.includes(0)).length;
    const head = open(TODAY).filter((e) => e.pitch?.includes(1)).length;
    const sum = (key: "heiban" | "atamadaka") =>
      p.pitch.reduce((n, r) => n + r.accents[key], 0);
    expect(sum("heiban")).toBe(flat);
    // A one-mora word falls after its first mora, which is also its last.
    expect(sum("atamadaka")).toBeLessThanOrEqual(head);
    expect(sum("atamadaka")).toBeGreaterThan(0);
  });

  it("counts nothing before a word with an accent has opened", () => {
    expect(patternsFor("2005-05-01").pitch).toEqual([]);
  });
});

describe("patternsFor sound-alikes", () => {
  const p = patternsFor(TODAY).soundAlikes;
  const fold = (kana: string) =>
    kana.replace(/[\u30a1-\u30f6]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0x60),
    );

  it("counts every reading two or more open words share", () => {
    const byReading = new Map<string, number>();
    for (const e of open(TODAY))
      byReading.set(fold(e.kana), (byReading.get(fold(e.kana)) ?? 0) + 1);
    const shared = [...byReading.values()].filter((n) => n > 1);
    expect(p.readings).toBe(shared.length);
    expect(p.words).toBe(shared.reduce((a, b) => a + b, 0));
  });

  it("lists the readings with the most words first, each word read so", () => {
    expect(p.groups.length).toBeGreaterThan(0);
    expect(p.groups.length).toBeLessThanOrEqual(SOUND_ALIKE_GROUP_LIMIT);
    const sizes = p.groups.map((g) => g.words.length);
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    for (const g of p.groups)
      for (const w of g.words) {
        const e = open(TODAY).find((x) => x.date === w.date)!;
        expect(fold(e.kana)).toBe(g.reading);
        expect(w.pitch).toEqual(e.pitch);
      }
  });

  it("says the pitch tells words apart only when every word shows an accent and none is shared", () => {
    expect(p.toldApart).toBeLessThanOrEqual(p.withAccents);
    expect(p.withAccents).toBeLessThanOrEqual(p.readings);
    for (const g of p.groups) {
      const all = g.words.flatMap((w) => w.pitch ?? []);
      expect(g.toldApart).toBe(
        g.words.every((w) => w.pitch) && new Set(all).size === all.length,
      );
    }
  });

  it("counts nothing that has not opened", () => {
    expect(patternsFor("2005-05-01").soundAlikes).toMatchObject({
      readings: 0,
      words: 0,
      groups: [],
    });
  });
});

describe("patternsFor lengths by level", () => {
  const p = patternsFor(TODAY);

  it("covers every open word once, under its own level", () => {
    for (const row of p.lengths)
      expect(row.words).toBe(
        open(TODAY).filter((e) => e.level === row.value).length,
      );
    expect(p.lengths.reduce((n, r) => n + r.words, 0)).toBe(open(TODAY).length);
  });

  it("gives the mean morae and kanji to one decimal, and counts words with no kanji", () => {
    for (const row of p.lengths) {
      const words = open(TODAY).filter((e) => e.level === row.value);
      const kanji = words.reduce(
        (n, e) => n + (e.term.match(/[㐀-䶿一-鿿]/gu)?.length ?? 0),
        0,
      );
      expect(row.meanKanji).toBeCloseTo(kanji / words.length, 1);
      expect(row.kanaOnly).toBe(
        words.filter((e) => !/[㐀-䶿一-鿿]/u.test(e.term)).length,
      );
      expect(row.meanMorae).toBeGreaterThan(1);
      expect(Number.isInteger(row.meanMorae * 10)).toBe(true);
    }
  });

  it("makes the higher levels' words longer in kanji than the first level's", () => {
    const by = Object.fromEntries(p.lengths.map((r) => [r.value, r]));
    expect(by.N1!.meanKanji).toBeGreaterThan(by.N5!.meanKanji);
  });
});
