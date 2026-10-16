import { describe, it, expect } from "vitest";
import { formatCalendarDateYMD, formatMonthDay } from "~/app/utils/date";

describe("date utils", () => {
  it("formats calendar date object correctly", () => {
    expect(formatCalendarDateYMD({ year: 2026, month: 7, day: 29 })).toBe(
      "2026-07-29",
    );
    expect(formatCalendarDateYMD({ year: 2025, month: 12, day: 5 })).toBe(
      "2025-12-05",
    );
  });

  it("handles null or undefined date gracefully", () => {
    // @ts-expect-error testing invalid input
    expect(formatCalendarDateYMD(null)).toBe("");
    // @ts-expect-error testing invalid input
    expect(formatCalendarDateYMD(undefined)).toBe("");
  });
});

describe("formatMonthDay", () => {
  it("names the month and day only, whatever the reader's timezone", () => {
    expect(formatMonthDay("2010-02-20")).toBe("February 20");
    expect(formatMonthDay("2026-10-01")).toBe("October 1");
  });
});
