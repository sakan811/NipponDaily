import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const SECOND = WORD_ENTRIES[1]!.date;

const getExplore = async () =>
  (await import("~/server/api/explore.get")).default;
const getPatterns = async () =>
  (await import("~/server/api/patterns.get")).default;

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

describe("GET /api/explore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    at("2026-03-08T12:00:00Z");
    (global as any).getQuery.mockReturnValue({});
  });
  afterEach(() => vi.useRealTimers());

  it("serves every open word when nothing is filtered", async () => {
    const result = (await getExplore())({} as any);

    expect(result.success).toBe(true);
    expect(result.data.words[0].date).toBe("2026-03-08");
    expect(result.data.count).toBe(result.data.total);
    expect(result.data.filters).toEqual({});
  });

  it("applies the filters it is given", async () => {
    (global as any).getQuery.mockReturnValue({
      level: "N5",
      stratum: "wago",
      process: "compound",
      q: "",
    });
    const result = (await getExplore())({} as any);

    expect(result.data.filters).toEqual({
      level: ["N5"],
      stratum: ["wago"],
      process: ["compound"],
    });
    expect(
      result.data.words.every(
        (w: any) =>
          w.level === "N5" &&
          w.stratum === "wago" &&
          w.processes.includes("compound"),
      ),
    ).toBe(true);
  });

  it("400s a value that is not a level, layer or process", async () => {
    const handler = await getExplore();
    for (const query of [
      { level: "N1" },
      { stratum: "kun" },
      { process: "magic" },
      { q: "x".repeat(51) },
      { part: "x".repeat(13) },
    ]) {
      (global as any).getQuery.mockReturnValue(query);
      expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
    }
  });

  it("only searches days that have opened", async () => {
    const handler = await getExplore();
    const total = () => handler({} as any).data.total;

    at(`${SECOND}T12:00:00Z`);
    expect(total()).toBe(2);
    // 15:00 UTC the day before is already the next day in Tokyo.
    at(`${SECOND}T15:00:00Z`);
    expect(total()).toBe(3);
  });
});

describe("GET /api/patterns", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts the words that have opened", async () => {
    at(`${SECOND}T12:00:00Z`);
    const result = (await getPatterns())({} as any);

    expect(result.success).toBe(true);
    expect(result.data.total).toBe(2);
  });

  it("grows as days arrive", async () => {
    const handler = await getPatterns();
    at("2026-03-08T12:00:00Z");
    const march = handler({} as any).data.total;
    at("2026-03-09T12:00:00Z");
    expect(handler({} as any).data.total).toBe(march + 1);
  });
});

describe("GET /api/explore with several choices", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("accepts comma-joined lists, a part of speech and match=all", async () => {
    (global as any).getQuery.mockReturnValue({
      level: "N5,N4",
      process: "compound,rendaku",
      pos: "noun",
      stratum: "unstated",
      match: "all",
    });
    const result = (await getExplore())({} as any);

    expect(result.data.filters).toEqual({
      level: ["N5", "N4"],
      process: ["compound", "rendaku"],
      pos: ["noun"],
      stratum: ["unstated"],
      match: "all",
    });
    expect(result.data.facets.pos.map((f: any) => f.value)).toContain("verb");
  });

  it("treats match=any as the default and leaves it out", async () => {
    (global as any).getQuery.mockReturnValue({ match: "any" });
    expect((await getExplore())({} as any).data.filters).toEqual({});
  });

  it("400s one bad value inside a list and a bad match", async () => {
    const handler = await getExplore();
    for (const query of [
      { level: "N5,N1" },
      { pos: "verb,noun-ish" },
      { match: "some" },
    ]) {
      (global as any).getQuery.mockReturnValue(query);
      expect(thrownBy(() => handler({} as any)).statusCode).toBe(400);
    }
  });
});
