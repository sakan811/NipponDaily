import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
    expect(result.data.parts[0]).toEqual({
      text: "日",
      count: 10,
      readings: ["び", "ひ", "か", "にち"],
    });
  });

  it("grows only as days arrive", async () => {
    const handler = await getParts();
    at("2026-03-08T12:00:00Z");
    const before = handler({} as any).data.parts.find(
      (p: any) => p.text === "日",
    );
    // 15:00 UTC on 2026-07-11 is already 2026-07-12 in Tokyo: 誕生日 opens.
    at("2026-07-11T15:00:00Z");
    const after = handler({} as any).data.parts.find(
      (p: any) => p.text === "日",
    );
    expect(after.count).toBe(before.count + 1);
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
    expect(result.data.count).toBe(10);
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
