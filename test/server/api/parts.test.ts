import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const getParts = async () => (await import("~/server/api/parts.get")).default;
const getPart = async () => (await import("~/server/api/part.get")).default;

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

describe("GET /api/parts", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("lists the parts of the words that have opened", async () => {
    at("2026-03-08T12:00:00Z");
    const result = (await getParts())({} as any);

    expect(result.success).toBe(true);
    expect(result.data.parts[0]).toMatchObject({
      text: "日",
      count: WORD_ENTRIES.filter(
        (e) =>
          e.date <= "2026-03-08" && e.morphemes.some((m) => m.text === "日"),
      ).length,
    });
    expect(result.data.parts[0].readings).toEqual(
      expect.arrayContaining(["び", "ひ", "か", "にち"]),
    );
  });

  it("grows only as days arrive", async () => {
    const handler = await getParts();
    const second = WORD_ENTRIES.filter((e) =>
      e.morphemes.some((m) => m.text === "日"),
    )[1]!;
    const countAt = (iso: string) => {
      at(iso);
      return handler({} as any).data.parts.find((p: any) => p.text === "日")
        .count;
    };
    // 15:00 UTC the day before is already `second.date` in Tokyo: that word opens.
    const eve = new Date(Date.parse(`${second.date}T00:00:00Z`) - 864e5)
      .toISOString()
      .slice(0, 10);
    const before = countAt(`${eve}T14:59:00Z`);
    expect(countAt(`${eve}T15:00:00Z`)).toBe(before + 1);
  });
});

describe("GET /api/part", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    at("2026-03-08T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ text: "日" });
  });
  afterEach(() => vi.useRealTimers());

  it("serves a part with its uses grouped by reading", async () => {
    const result = (await getPart())({} as any);

    expect(result.data.text).toBe("日");
    expect(result.data.count).toBe(
      WORD_ENTRIES.filter(
        (e) =>
          e.date <= "2026-03-08" && e.morphemes.some((m) => m.text === "日"),
      ).length,
    );
    expect(result.data.readings[0].reading).toBe("び");
  });

  it("400s a missing or over-long text", async () => {
    const handler = await getPart();
    (global as any).getQuery.mockReturnValue({});
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
    (global as any).getQuery.mockReturnValue({ text: "x".repeat(13) });
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
  });

  it("404s a part that no open word shows", async () => {
    const handler = await getPart();
    (global as any).getQuery.mockReturnValue({ text: "存在しない" });
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(404);
  });

  it("404s a part that only an upcoming word shows", async () => {
    // 曜 never stands alone, but 誕生 is a part only of 誕生日 (2026-07-12).
    const handler = await getPart();
    (global as any).getQuery.mockReturnValue({ text: "誕生" });
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(404);

    at("2026-07-12T00:00:00Z");
    expect(handler({} as any).data.count).toBe(1);
  });
});
