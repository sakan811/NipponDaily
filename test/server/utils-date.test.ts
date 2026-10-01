import { describe, it, expect } from "vitest";
import { isValidIsoDate, isValidMonth, todayJst } from "~~/shared/words";

describe("isValidIsoDate", () => {
  it.each(["2026-01-01", "2024-02-29", "2026-12-31"])("accepts %s", (d) => {
    expect(isValidIsoDate(d)).toBe(true);
  });

  it.each(["2026-02-29", "2026-02-30", "2026-13-01", "2026-1-1", "nope", ""])(
    "rejects %s",
    (d) => {
      expect(isValidIsoDate(d)).toBe(false);
    },
  );
});

describe("isValidMonth", () => {
  it.each(["2026-01", "2026-10", "2026-12"])("accepts %s", (m) => {
    expect(isValidMonth(m)).toBe(true);
  });

  it.each(["2026-00", "2026-13", "2026-1", "2026-10-01", "nope", ""])(
    "rejects %s",
    (m) => {
      expect(isValidMonth(m)).toBe(false);
    },
  );
});

describe("todayJst", () => {
  it("is the same day as UTC before 15:00 UTC", () => {
    expect(todayJst(new Date("2026-10-05T14:59:59Z"))).toBe("2026-10-05");
  });

  it("rolls over at 15:00 UTC, which is midnight in Japan", () => {
    expect(todayJst(new Date("2026-10-05T15:00:00Z"))).toBe("2026-10-06");
  });

  it("rolls the month and year over correctly", () => {
    expect(todayJst(new Date("2026-12-31T15:00:00Z"))).toBe("2027-01-01");
  });
});
