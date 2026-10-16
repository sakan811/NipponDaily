import { describe, it, expect } from "vitest";
import {
  WORD_ENTRIES,
  calendarForMonth,
  lapEntryForDate,
  latestEntryOnOrBefore,
  monthsWithEntries,
  payloadFor,
  sameDayWords,
} from "~~/shared/words";

const FIRST = WORD_ENTRIES[0]!;
const LAST = WORD_ENTRIES[WORD_ENTRIES.length - 1]!;
const entryOn = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;
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

describe("the calendar on a lap", () => {
  const month = LAST.date.slice(0, 7);

  it("fills the open days after the last entry with the lap word", () => {
    // Look at the month the first lap day falls in, wherever the last entry ends.
    const day = addDays(LAST.date, 1);
    const days = calendarForMonth(day.slice(0, 7), day);
    expect(days.find((d) => d.date === day)).toMatchObject({
      status: "open",
      term: FIRST.term,
      wordDate: FIRST.date,
      lap: 2,
    });
  });

  it("leaves the days still to come out and never shows a future word", () => {
    const days = calendarForMonth(month, LAST.date);
    expect(days.some((d) => d.date > LAST.date)).toBe(false);
  });

  it("adds the months a lap has reached to the picker", () => {
    expect(monthsWithEntries(LAST.date).at(-1)).toBe(month);
    expect(monthsWithEntries(addDays(LAST.date, 70)).at(-1)).toBe(
      addDays(LAST.date, 70).slice(0, 7),
    );
  });
});

describe("sameDayWords", () => {
  it("lists the open words of the same month and day in other years, oldest first", () => {
    const words = sameDayWords(entryOn("2010-02-20"), "2015-03-01");

    expect(words.map((w) => w.date)).toEqual([
      "2006-02-20",
      "2007-02-20",
      "2008-02-20",
      "2009-02-20",
      "2011-02-20",
      "2012-02-20",
      "2013-02-20",
      "2014-02-20",
      "2015-02-20",
    ]);
    expect(words[0]).toMatchObject({ term: entryOn("2006-02-20").term });
  });

  it("comes with the entry in its payload", () => {
    expect(payloadFor(entryOn("2010-02-20"), "2015-03-01").sameDay).toEqual(
      sameDayWords(entryOn("2010-02-20"), "2015-03-01"),
    );
  });

  it("never lists a day that has not arrived", () => {
    const words = sameDayWords(entryOn("2010-02-20"), "2013-02-19");

    expect(words.map((w) => w.date).at(-1)).toBe("2012-02-20");
    for (const e of WORD_ENTRIES.filter((x) => x.date <= "2010-05-10").slice(
      -40,
    ))
      for (const w of sameDayWords(e, "2010-05-10"))
        expect(w.date <= "2010-05-10").toBe(true);
  });
});
