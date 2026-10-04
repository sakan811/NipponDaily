import { describe, it, expect } from "vitest";
import { partDetail, partsIndex } from "~~/shared/parts";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2026-03-08";
const dayBefore = (date: string) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - 864e5).toISOString().slice(0, 10);
const withDay = (today: string) =>
  WORD_ENTRIES.filter(
    (e) => e.date <= today && e.morphemes.some((m) => m.text === "日"),
  );

describe("partsIndex", () => {
  it("counts the open words that show a part, most-used first", () => {
    const index = partsIndex(TODAY);
    const day = index.find((p) => p.text === "日")!;

    expect(day.count).toBe(withDay(TODAY).length);
    // び leads: the seven weekdays 月曜日…日曜日 all read 日 that way.
    expect(day.readings[0]).toBe("び");
    expect(day.readings).toEqual(expect.arrayContaining(["ひ", "か", "にち"]));
    expect(index[0]).toBe(day);
    expect(index.map((p) => p.count)).toEqual(
      [...index.map((p) => p.count)].sort((a, b) => b - a),
    );
  });

  it("never counts an upcoming word", () => {
    const withHi = withDay("2999-12-31");
    const count = (today: string) =>
      partsIndex(today).find((p) => p.text === "日")?.count ?? 0;
    // The word after the first one that shows 日 is not counted until its day.
    const second = withHi[1]!;
    expect(count(second.date)).toBe(2);
    expect(count(dayBefore(second.date))).toBe(1);
    // Before the first word, nothing has been shown.
    expect(partsIndex(dayBefore(WORD_ENTRIES[0]!.date))).toEqual([]);
  });

  it("lists exactly the parts the open words show", () => {
    const today = WORD_ENTRIES[WORD_ENTRIES.length - 1]!.date;
    const expected = new Set(
      WORD_ENTRIES.flatMap((e) => e.morphemes.map((m) => m.text)),
    );
    expect(new Set(partsIndex(today).map((p) => p.text))).toEqual(expected);
  });
});

describe("partDetail", () => {
  it("groups the uses by the reading the part has in each word", () => {
    const detail = partDetail("日", TODAY)!;

    expect(detail.count).toBe(withDay(TODAY).length);
    expect(detail.readings.map((r) => r.reading)).toEqual(
      expect.arrayContaining(["び", "ひ", "か", "にち"]),
    );
    const bi = detail.readings.find((r) => r.reading === "び")!;
    expect(bi.uses.map((u) => u.word.term)).toEqual(
      expect.arrayContaining([
        "月曜日",
        "火曜日",
        "水曜日",
        "木曜日",
        "金曜日",
        "土曜日",
        "日曜日",
      ]),
    );
    // Rendaku is shown, not hidden: び is ひ after a morpheme boundary.
    expect(bi.uses.find((u) => u.word.term === "月曜日")).toMatchObject({
      reading: "び",
      base: "ひ",
      meaning: "day",
      parts: ["月曜", "日"],
      word: { date: "2026-03-02", kana: "げつようび", meaning: "Monday" },
    });
  });

  it("counts a word once even when it shows the part twice", () => {
    const detail = partDetail("日", "2026-03-01")!;
    const uses = detail.readings.flatMap((r) => r.uses);
    // 日日 shows 日 twice (ひ and にち) but is one word.
    expect(new Set(uses.map((u) => u.word.date)).size).toBe(detail.count);
    expect(uses.length).toBeGreaterThan(detail.count);
  });

  it("lists words spelled with a kanji but not broken down with it", () => {
    const detail = partDetail("日", "2026-05-10")!;

    // 三日月: spelled with 日, but no breakdown names it.
    expect(detail.alsoIn.map((w) => w.term)).toContain("三日月");
    const shown = detail.readings.flatMap((r) =>
      r.uses.map((u) => u.word.date),
    );
    for (const w of detail.alsoIn) expect(shown).not.toContain(w.date);
  });

  it("gives a kana part no spelling matches", () => {
    expect(partDetail("お", "2027-12-31")!.alsoIn).toEqual([]);
  });

  it("never lists an upcoming word, among the uses or the spelling matches", () => {
    const detail = partDetail("日", TODAY)!;
    const dates = [
      ...detail.readings.flatMap((r) => r.uses.map((u) => u.word.date)),
      ...detail.alsoIn.map((w) => w.date),
    ];
    expect(dates.every((d) => d <= TODAY)).toBe(true);
    // 三日月 (2026-03-23) hasn't opened yet.
    expect(detail.alsoIn.map((w) => w.term)).not.toContain("三日月");
  });

  it("is undefined for a part no open word shows", () => {
    const first = withDay("2999-12-31")[0]!;
    expect(partDetail("日", dayBefore(first.date))).toBeUndefined();
    expect(partDetail("存在しない", "2027-12-31")).toBeUndefined();
  });
});
