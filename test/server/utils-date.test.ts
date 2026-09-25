import { describe, it, expect } from "vitest";
import { isValidIsoDate } from "~/server/utils/daily-game";

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
