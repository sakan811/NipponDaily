import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { WORD_ENTRIES } from "~~/shared/words";

const FIRST = WORD_ENTRIES[0]!;
const LAST = WORD_ENTRIES[WORD_ENTRIES.length - 1]!;

/** `n` days after (or before) a YYYY-MM-DD date. */
const addDays = (date: string, n: number) =>
  new Date(Date.parse(date) + n * 86_400_000).toISOString().slice(0, 10);

const getHandler = async () =>
  (await import("~/server/api/daily-word.get")).default;

/** Runs the handler and returns whatever it throws (the mocked createError
 *  throws a plain object, not an Error). */
const thrownBy = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

/** Freezes "now" so the JST day is known. 12:00 UTC is 21:00 JST. */
const at = (isoUtc: string) => vi.setSystemTime(new Date(isoUtc));

describe("GET /api/daily-word", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (global as any).getQuery.mockReturnValue({});
  });
  afterEach(() => vi.useRealTimers());

  it("serves today's word, with its neighbours", async () => {
    at("2023-07-12T12:00:00Z");
    const handler = await getHandler();
    const result = handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.entry.date).toBe("2023-07-12");
    expect(result.data.entry.term).toBe("時計");
    expect(result.data.prev).toEqual({ date: "2023-07-11", term: "パン" });
    // 2023-07-13 is tomorrow: its existence is not revealed early.
    expect(result.data.next).toBeNull();
  });

  it("flips to the next day at midnight in Japan, not UTC", async () => {
    // 15:00 UTC on the 5th is already 00:00 on the 6th in Tokyo.
    at("2023-07-12T15:00:00Z");
    const handler = await getHandler();
    expect(handler({} as any).data.entry.date).toBe("2023-07-13");
  });

  it("serves a past word by ?date= and links forward to the next open day", async () => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2022-10-08" });
    const handler = await getHandler();
    const result = handler({} as any);

    const before =
      WORD_ENTRIES[WORD_ENTRIES.findIndex((e) => e.date === "2022-10-08") - 1]!;
    expect(result.data.entry.term).toBe("今年");
    expect(result.data.prev).toEqual({ date: before.date, term: before.term });
    expect(result.data.next).toEqual({ date: "2022-10-09", term: "チップ" });
  });

  it("has nothing before the first word of the catalogue", async () => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: FIRST.date });
    const handler = await getHandler();
    const result = handler({} as any);

    expect(result.data.entry.term).toBe(FIRST.term);
    expect(result.data.prev).toBeNull();
    expect(result.data.next).toEqual({
      date: WORD_ENTRIES[1]!.date,
      term: WORD_ENTRIES[1]!.term,
    });
  });

  it("links across the month boundary in both directions", async () => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2023-07-08" });
    const handler = await getHandler();
    const result = handler({} as any);

    expect(result.data.entry.term).toBe("電話");
    expect(result.data.prev).toEqual({ date: "2023-07-07", term: "蕎麦" });
    expect(result.data.next).toEqual({ date: "2023-07-09", term: "友達" });
  });

  it("carries the origin evidence a page needs", async () => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2023-07-20" });
    const handler = await getHandler();
    const { entry } = handler({} as any).data;

    expect(entry.term).toBe("ありがとう");
    // The generator gives no breakdown when the source offers no clean split.
    expect(Array.isArray(entry.morphemes)).toBe(true);
    expect(entry.pos.length).toBeGreaterThan(0);
    expect(entry.sources.length).toBeGreaterThan(0);
    expect(entry).not.toHaveProperty("story");
    expect(entry.wiktionaryDump).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.each([
    ["a future date", "2023-08-01"],
    ["an impossible calendar date", "2026-02-30"],
    ["an out-of-range month", "2026-13-01"],
    ["not a date at all", "yesterday"],
  ])("returns 400 for %s", async (_label, date) => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 400,
    });
  });

  it("never serves a future word, even when asked by exact date", async () => {
    at("2023-07-08T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2023-07-09" });
    const handler = await getHandler();
    const err = thrownBy(() => handler({} as any));
    expect(err).toMatchObject({ statusCode: 400 });
    expect(JSON.stringify(err)).not.toContain("友達");
  });

  it("returns 404 for a past date the catalogue does not cover", async () => {
    at("2023-07-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ date: "2018-10-07" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
  });

  it("is on lap 1 while the catalogue lasts", async () => {
    at(`${LAST.date}T12:00:00Z`);
    const handler = await getHandler();
    const { data } = handler({} as any);
    expect(data.entry.date).toBe(LAST.date);
    expect(data.lap).toBe(1);
  });

  it("starts again from the first word once the catalogue has run out", async () => {
    const handler = await getHandler();

    at(`${addDays(LAST.date, 1)}T12:00:00Z`);
    expect(handler({} as any).data).toMatchObject({
      entry: { date: FIRST.date },
      lap: 2,
      prev: null,
    });

    // 70 days after the last word: the 70th word, still on lap 2.
    at(`${addDays(LAST.date, 70)}T12:00:00Z`);
    expect(handler({} as any).data).toMatchObject({
      entry: { date: WORD_ENTRIES[69]!.date },
      lap: 2,
    });
  });

  it("answers an explicit date from lap 1 only", async () => {
    at(`${addDays(LAST.date, 70)}T12:00:00Z`);
    (global as any).getQuery.mockReturnValue({ date: "2023-02-15" });
    const handler = await getHandler();
    expect(handler({} as any).data.lap).toBe(1);
  });

  it("returns 404 before the first word has opened", async () => {
    at("2018-09-25T12:00:00Z");
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
  });
});
