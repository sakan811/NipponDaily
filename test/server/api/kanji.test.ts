import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const getIndex = async () => (await import("~/server/api/kanji.get")).default;
const getDetail = async () =>
  (await import("~/server/api/kanji-detail.get")).default;

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

describe("GET /api/kanji", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("lists the kanji of the words that have opened", async () => {
    at("2022-12-13T12:00:00Z");
    const result = (await getIndex())({} as any);

    expect(result.success).toBe(true);
    const day = result.data.kanji.find((k: any) => k.char === "日");
    expect(day.count).toBe(
      WORD_ENTRIES.filter(
        (e) => e.date <= "2022-12-13" && e.term.includes("日"),
      ).length,
    );
  });
});

describe("GET /api/kanji-detail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    at("2022-12-13T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ char: "日" });
  });
  afterEach(() => vi.useRealTimers());

  it("serves a kanji with its readings and words", async () => {
    const result = (await getDetail())({} as any);

    expect(result.data.char).toBe("日");
    expect(result.data.on).toContain("ニチ");
    expect(result.data.words.length).toBe(result.data.count);
  });

  it("400s a missing value or more than one character", async () => {
    const handler = await getDetail();
    (global as any).getQuery.mockReturnValue({});
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
    (global as any).getQuery.mockReturnValue({ char: "日本" });
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
  });

  it("404s a character no open word is written with", async () => {
    const handler = await getDetail();
    (global as any).getQuery.mockReturnValue({ char: "あ" });
    expect(thrownBy(() => handler({} as any)).statusCode).toBe(404);
  });
});
