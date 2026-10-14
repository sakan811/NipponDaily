import { describe, it, expect } from "vitest";
import { kanjiDetail, kanjiIndex } from "~~/shared/kanji";
import { KANJI_ALSO_LIMIT } from "~~/shared/limits";
import { partDetail } from "~~/shared/parts";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2022-12-13";
const open = WORD_ENTRIES.filter((e) => e.date <= TODAY);
const withChar = (c: string, today = TODAY) =>
  WORD_ENTRIES.filter((e) => e.date <= today && e.term.includes(c));

describe("kanjiIndex", () => {
  it("lists the kanji of the open words, most-used first, with their grade", () => {
    const index = kanjiIndex(TODAY);

    expect(index[0]!.count).toBeGreaterThanOrEqual(index[1]!.count);
    const day = index.find((k) => k.char === "日")!;
    expect(day.count).toBe(withChar("日").length);
    expect(day.grade).toBe(1);
    // Every character of every open term is listed once.
    const chars = new Set(
      open.flatMap((e) => e.term.match(/[㐀-䶿一-鿿]/gu) ?? []),
    );
    expect(index.map((k) => k.char).sort()).toEqual([...chars].sort());
  });

  it("never lists a kanji only an upcoming word uses", () => {
    const first = WORD_ENTRIES[0]!;
    const later = WORD_ENTRIES.find(
      (e) => e.date > first.date && /[㐀-䶿一-鿿]/u.test(e.term),
    )!;
    const only = [...later.term.match(/[㐀-䶿一-鿿]/gu)!].find(
      (c) =>
        !WORD_ENTRIES.some((e) => e.date <= first.date && e.term.includes(c)),
    )!;
    expect(kanjiIndex(first.date).map((k) => k.char)).not.toContain(only);
    expect(kanjiIndex(later.date).map((k) => k.char)).toContain(only);
  });
});

describe("kanjiDetail", () => {
  it("gives KANJIDIC2's record and the open words written with it", () => {
    const d = kanjiDetail("日", TODAY)!;

    expect(d).toMatchObject({ char: "日", strokeCount: 4, grade: 1 });
    expect(d.on).toContain("ニチ");
    expect(d.kun).toContain("ひ");
    expect(d.meanings).toContain("day");
    expect(d.count).toBe(withChar("日").length);
    expect(d.words.map((w) => w.date)).toEqual(
      withChar("日").map((e) => e.date),
    );
    expect(d.isPart).toBe(partDetail("日", TODAY) !== undefined);
  });

  it("gives the shapes KRADFILE lists, each with other open kanji that contain it", () => {
    const d = kanjiDetail("明", TODAY)!;

    expect(d.components!.map((c) => c.text)).toEqual(["月", "日"]);
    const sun = d.components!.find((c) => c.text === "日")!;
    expect(sun.isKanji).toBe(true);
    expect(sun.also).not.toContain("明");
    // The shape 日 is the kanji 日: it is not listed as another kanji with it.
    expect(sun.also).not.toContain("日");
    expect(sun.also.length).toBeLessThanOrEqual(KANJI_ALSO_LIMIT);
    expect(sun.alsoCount).toBeGreaterThanOrEqual(sun.also.length);
    // Every kanji named has an open word, so it has a page.
    const open = new Set(kanjiIndex(TODAY).map((k) => k.char));
    for (const c of sun.also) expect(open.has(c), c).toBe(true);
  });

  it("names a shape that is not a kanji without claiming a page for it", () => {
    const strokeShapes = kanjiDetail("語", TODAY)!.components!.filter(
      (c) => !c.isKanji,
    );
    const everything = kanjiDetail("親", TODAY)!.components!;
    expect(everything.some((c) => c.text === "亠" && !c.isKanji)).toBe(true);
    for (const c of strokeShapes)
      expect(kanjiDetail(c.text, TODAY)).toBeUndefined();
  });

  it("never offers a kanji only an upcoming word uses as one that shares a shape", () => {
    const early = "2005-07-31";
    const index = new Set(kanjiIndex(early).map((k) => k.char));
    for (const char of index)
      for (const c of kanjiDetail(char, early)?.components ?? [])
        for (const other of c.also) expect(index.has(other), other).toBe(true);
  });

  it("gives KanjiVG's strokes, as many as KANJIDIC2 counts", () => {
    const d = kanjiDetail("日", TODAY)!;
    expect(d.strokes).toHaveLength(d.strokeCount);
    expect(d.strokes![0]).toMatch(/^[Mm]/);
  });

  it("gives no strokes where the two sources count differently", () => {
    const entry = WORD_ENTRIES.find((e) => e.term.includes("飴"))!;
    const d = kanjiDetail("飴", entry.date);
    expect(d).toBeDefined();
    expect(d!.strokes).toBeUndefined();
  });

  it("is undefined for a kanji no open word uses, and for a non-kanji", () => {
    const first = WORD_ENTRIES[0]!.date;
    const later = WORD_ENTRIES.find(
      (e) => e.date > first && e.term.length > 1,
    )!;
    const char = [...later.term].find(
      (c) =>
        /[㐀-䶿一-鿿]/u.test(c) &&
        !WORD_ENTRIES.some((e) => e.date <= first && e.term.includes(c)),
    );
    if (char) {
      expect(kanjiDetail(char, first)).toBeUndefined();
      expect(kanjiDetail(char, later.date)).toBeDefined();
    }
    expect(kanjiDetail("あ", TODAY)).toBeUndefined();
    expect(kanjiDetail("x", TODAY)).toBeUndefined();
  });
});
