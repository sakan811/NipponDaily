import { describe, it, expect } from "vitest";
import { partDetail, partsIndex } from "~~/shared/parts";
import { WORD_ENTRIES } from "~~/shared/words";

describe("partsIndex", () => {
  it("counts the open words that show a part, most-used first", () => {
    const index = partsIndex("2026-03-08");
    const day = index.find((p) => p.text === "日")!;

    // 月日, 二日, 日日, and the seven weekdays 月曜日…日曜日 so far.
    expect(day.count).toBe(10);
    expect(day.readings).toEqual(["び", "ひ", "か", "にち"]);
    expect(index[0]).toBe(day);
    expect(index.map((p) => p.count)).toEqual(
      [...index.map((p) => p.count)].sort((a, b) => b - a),
    );
  });

  it("never counts an upcoming word", () => {
    // 誕生日 (2026-07-12) is the eleventh word with 日 — not yet open.
    expect(partsIndex("2026-03-08").find((p) => p.text === "日")!.count).toBe(
      10,
    );
    expect(partsIndex("2026-07-12").find((p) => p.text === "日")!.count).toBe(
      11,
    );
    // Before the first word, nothing has been shown.
    expect(partsIndex("2025-12-31")).toEqual([]);
  });

  it("lists exactly the parts the open words show", () => {
    const today = "2026-12-31";
    const expected = new Set(
      WORD_ENTRIES.flatMap((e) => e.morphemes.map((m) => m.text)),
    );
    expect(new Set(partsIndex(today).map((p) => p.text))).toEqual(expected);
  });
});

describe("partDetail", () => {
  it("groups the uses by the reading the part has in each word", () => {
    const detail = partDetail("日", "2026-03-08")!;

    expect(detail.count).toBe(10);
    expect(detail.readings.map((r) => r.reading)).toEqual([
      "び",
      "ひ",
      "か",
      "にち",
    ]);
    const bi = detail.readings[0]!;
    expect(bi.uses.map((u) => u.word.term)).toEqual([
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
      "日曜日",
    ]);
    // Rendaku is shown, not hidden: び is ひ after a morpheme boundary.
    expect(bi.uses[0]).toMatchObject({
      reading: "び",
      base: "ひ",
      meaning: "day",
      parts: ["月曜", "日"],
      word: { date: "2026-03-02", kana: "げつようび", meaning: "Monday" },
    });
  });

  it("counts a word once even when it shows the part twice", () => {
    const detail = partDetail("日", "2026-03-01")!;
    // 日日 shows 日 twice (ひ and にち) but is one word.
    expect(detail.count).toBe(3);
    expect(detail.readings.flatMap((r) => r.uses)).toHaveLength(4);
  });

  it("lists words spelled with a kanji but not broken down with it", () => {
    const detail = partDetail("日", "2026-05-10")!;

    // 三日, 三日月, 平日, 八日: spelled with 日, but no breakdown names it.
    expect(detail.alsoIn.map((w) => w.term)).toEqual([
      "三日",
      "三日月",
      "平日",
      "八日",
    ]);
    const shown = detail.readings.flatMap((r) =>
      r.uses.map((u) => u.word.date),
    );
    for (const w of detail.alsoIn) expect(shown).not.toContain(w.date);
  });

  it("gives a kana part no spelling matches", () => {
    expect(partDetail("お", "2026-12-31")!.alsoIn).toEqual([]);
  });

  it("never lists an upcoming word, among the uses or the spelling matches", () => {
    const detail = partDetail("日", "2026-03-08")!;
    const dates = [
      ...detail.readings.flatMap((r) => r.uses.map((u) => u.word.date)),
      ...detail.alsoIn.map((w) => w.date),
    ];
    expect(dates.every((d) => d <= "2026-03-08")).toBe(true);
    // 三日 (2026-03-23) hasn't opened yet.
    expect(detail.alsoIn).toEqual([]);
  });

  it("is undefined for a part no open word shows", () => {
    expect(partDetail("日", "2026-01-12")).toBeUndefined();
    expect(partDetail("存在しない", "2026-12-31")).toBeUndefined();
  });
});
