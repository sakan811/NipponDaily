import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

const getHandler = async () =>
  (await import("~/server/api/word-calendar.get")).default;

const thrownBy = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

const at = (isoUtc: string) => vi.setSystemTime(new Date(isoUtc));

const LAST = WORD_ENTRIES[WORD_ENTRIES.length - 1]!;

/** `n` days after (or before) a YYYY-MM-DD date. */
const addDays = (date: string, n: number) =>
  new Date(Date.parse(date) + n * 86_400_000).toISOString().slice(0, 10);

describe("GET /api/word-calendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (global as any).getQuery.mockReturnValue({});
  });
  afterEach(() => vi.useRealTimers());

  it("opens on the current month and lists every month that has words", async () => {
    at("2023-07-17T12:00:00Z");
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.month).toBe("2023-07");
    expect(data.months).toEqual([
      ...new Set(WORD_ENTRIES.map((e) => e.date.slice(0, 7))),
    ]);
    expect(data.today).toBe("2023-07-17");
    expect(data.days).toHaveLength(31);
  });

  it("shows a word only for days that have arrived", async () => {
    at("2023-07-10T12:00:00Z");
    const handler = await getHandler();
    const { days } = handler({} as any).data;

    const open = days.filter((d: any) => d.status === "open");
    expect(open.map((d: any) => d.date)).toEqual(
      WORD_ENTRIES.filter(
        (e) => e.date.startsWith("2023-07") && e.date <= "2023-07-10",
      ).map((e) => e.date),
    );
    expect(open.find((d: any) => d.date === "2023-07-08")).toMatchObject({
      term: "電話",
      kana: "でんわ",
      stratum: "kango",
    });

    for (const d of days.filter((x: any) => x.status === "upcoming")) {
      expect(d).toEqual({ date: d.date, status: "upcoming" });
    }
  });

  it("reveals nothing but dates before the first day", async () => {
    at("2023-06-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ month: "2023-07" });
    const handler = await getHandler();
    const { days } = handler({} as any).data;

    expect(days.every((d: any) => d.status === "upcoming")).toBe(true);
    expect(JSON.stringify(days)).not.toContain("電話");
  });

  it("opens on the current month once a lap has reached it, with the lap words", async () => {
    const today = addDays(LAST.date, 70);
    at(`${today}T12:00:00Z`);
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.month).toBe(today.slice(0, 7));
    expect(data.months.at(-1)).toBe(today.slice(0, 7));
    expect(data.days.every((d: any) => d.status === "open")).toBe(true);
    expect(data.days.at(-1)).toMatchObject({
      date: today,
      lap: 2,
      wordDate: expect.any(String),
    });
  });

  it("returns 400 for a malformed month", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2026-13" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 400,
    });
  });

  it("returns 404 for a month with no words", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2018-09" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
  });

  it("marks the days against filters read from the query", async () => {
    at("2022-12-13T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2022-12",
      level: "N2,N3",
      match: "all",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.filters).toEqual({ level: ["N2", "N3"], match: "all" });
    const open = data.days.filter((d: any) => d.status === "open");
    expect(open).toHaveLength(13);
    expect(open.every((d: any) => typeof d.match === "boolean")).toBe(true);
    expect(open.some((d: any) => d.match)).toBe(true);
    expect(open.some((d: any) => !d.match)).toBe(true);
    expect(data.count).toBe(
      Object.values(data.monthCounts as Record<string, number>).reduce(
        (n, c) => n + c,
        0,
      ),
    );
    expect(Object.keys(data.facets)).toEqual([
      "level",
      "stratum",
      "process",
      "pos",
      "frequency",
    ]);
  });

  it("treats empty filter values as no filter", async () => {
    at("2022-12-13T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2022-12",
      level: "",
      q: "",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.filters).toEqual({});
    expect(data.count).toBe(data.total);
  });

  it("returns 400 for a filter value the API does not know", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2022-12", level: "N9" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 400,
    });
  });

  it("never reveals an upcoming word through a filter", async () => {
    at("2023-06-27T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2023-07",
      q: "電話",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.count).toBe(0);
    expect(data.days.every((d: any) => d.status === "upcoming")).toBe(true);
    expect(JSON.stringify(data.days)).not.toContain("電話");
  });
});
