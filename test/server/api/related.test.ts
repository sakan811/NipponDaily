import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const LAST = WORD_ENTRIES[WORD_ENTRIES.length - 1]!;

/** `n` days after (or before) a YYYY-MM-DD date. */
const addDays = (date: string, n: number) =>
  new Date(Date.parse(date) + n * 86_400_000).toISOString().slice(0, 10);

const getRelated = async () =>
  (await import("~/server/api/related.get")).default;

const thrownBy = (fn: () => unknown): any => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

/** Freezes "now". 12:00 UTC is 21:00 JST on the same date. */
const at = (isoUtc: string) => vi.setSystemTime(new Date(isoUtc));

const query = (value: Record<string, string>) =>
  (global as any).getQuery.mockReturnValue(value);

describe("GET /api/related", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    at("2026-03-08T12:00:00Z");
    query({ date: "2026-03-02" });
  });
  afterEach(() => vi.useRealTimers());

  it("serves the open words closest to the entry", async () => {
    const result = (await getRelated())({} as any);

    expect(result.success).toBe(true);
    expect(result.data.date).toBe("2026-03-02");
    expect(result.data.words.length).toBeGreaterThan(0);
    for (const w of result.data.words) {
      expect(w.date).not.toBe("2026-03-02");
      expect(w.date <= "2026-03-08").toBe(true);
    }
  });

  it("rejects a day that has not arrived", async () => {
    query({ date: "2026-03-09" });
    const handler = await getRelated();

    expect(thrownBy(() => handler({} as any))?.statusCode).toBe(400);
  });

  it("rejects a missing or malformed date", async () => {
    const handler = await getRelated();
    for (const bad of [{}, { date: "soon" }, { date: "2026-02-30" }]) {
      query(bad);
      expect(thrownBy(() => handler({} as any))?.statusCode).toBe(400);
    }
  });

  it("is a 404 for a past date the catalogue does not cover", async () => {
    at(`${addDays(LAST.date, 10)}T12:00:00Z`);
    query({ date: addDays(LAST.date, 1) });
    const handler = await getRelated();

    expect(thrownBy(() => handler({} as any))?.statusCode).toBe(404);
  });
});
