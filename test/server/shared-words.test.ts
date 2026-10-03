import { describe, it, expect } from "vitest";
import {
  WORD_ENTRIES,
  lapEntryForDate,
  latestEntryOnOrBefore,
  payloadFor,
} from "~~/shared/words";

const FIRST = WORD_ENTRIES[0]!;
const LAST = WORD_ENTRIES[WORD_ENTRIES.length - 1]!;
const addDays = (date: string, n: number) =>
  new Date(Date.parse(date) + n * 86_400_000).toISOString().slice(0, 10);

describe("lapEntryForDate", () => {
  it("is the newest open word on lap 1 up to the last written day", () => {
    expect(lapEntryForDate(FIRST.date)).toEqual({ entry: FIRST, lap: 1 });
    expect(lapEntryForDate("2026-03-08")).toEqual({
      entry: latestEntryOnOrBefore("2026-03-08"),
      lap: 1,
    });
    expect(lapEntryForDate(LAST.date)).toEqual({ entry: LAST, lap: 1 });
  });

  it("has nothing before the first word", () => {
    expect(lapEntryForDate(addDays(FIRST.date, -1))).toBeUndefined();
  });

  it("starts again from the first word the day after the last", () => {
    expect(lapEntryForDate(addDays(LAST.date, 1))).toEqual({
      entry: FIRST,
      lap: 2,
    });
    expect(lapEntryForDate(addDays(LAST.date, 2))).toEqual({
      entry: WORD_ENTRIES[1],
      lap: 2,
    });
  });

  it("ends lap 2 on the last word and begins lap 3", () => {
    const n = WORD_ENTRIES.length;
    expect(lapEntryForDate(addDays(LAST.date, n))).toEqual({
      entry: LAST,
      lap: 2,
    });
    expect(lapEntryForDate(addDays(LAST.date, n + 1))).toEqual({
      entry: FIRST,
      lap: 3,
    });
  });

  it("only ever shows a word whose own day has already passed", () => {
    for (const offset of [1, 100, 669, 670, 2000]) {
      const date = addDays(LAST.date, offset);
      expect(lapEntryForDate(date)!.entry.date <= date).toBe(true);
    }
  });
});

describe("payloadFor", () => {
  it("carries the lap, defaulting to 1", () => {
    expect(payloadFor(FIRST, "2026-01-01").lap).toBe(1);
    expect(payloadFor(FIRST, "2028-01-01", 2).lap).toBe(2);
  });
});
