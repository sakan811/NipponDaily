import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
    at("2030-01-01T12:00:00Z");
    query({ date: "2029-01-01" });
    const handler = await getRelated();

    expect(thrownBy(() => handler({} as any))?.statusCode).toBe(404);
  });
});
