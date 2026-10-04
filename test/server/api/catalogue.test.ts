import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const getCatalogue = async () =>
  (await import("~/server/api/catalogue.get")).default;

describe("GET /api/catalogue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reports the written range and how many words have opened", async () => {
    // 12:00 UTC on 2026-03-08 is 21:00 JST the same day.
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
    const result = (await getCatalogue())({} as any);

    expect(result.success).toBe(true);
    expect(result.data.first).toBe(WORD_ENTRIES[0]!.date);
    expect(result.data.last).toBe(WORD_ENTRIES[WORD_ENTRIES.length - 1]!.date);
    expect(result.data.total).toBe(WORD_ENTRIES.length);
    expect(result.data.open).toBe(
      WORD_ENTRIES.filter((e) => e.date <= "2026-03-08").length,
    );
  });

  it("opens a new day at midnight in Japan, not UTC", async () => {
    vi.setSystemTime(new Date("2026-03-08T14:59:00Z"));
    const before = (await getCatalogue())({} as any).data.open;
    vi.setSystemTime(new Date("2026-03-08T15:00:00Z"));
    const after = (await getCatalogue())({} as any).data.open;

    expect(after).toBe(before + 1);
  });
});
