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

describe("GET /api/word-calendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (global as any).getQuery.mockReturnValue({});
  });
  afterEach(() => vi.useRealTimers());

  it("opens on the current month and lists every month that has words", async () => {
    at("2026-10-10T12:00:00Z");
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.month).toBe("2026-10");
    expect(data.months).toEqual([
      ...new Set(WORD_ENTRIES.map((e) => e.date.slice(0, 7))),
    ]);
    expect(data.today).toBe("2026-10-10");
    expect(data.days).toHaveLength(31);
  });

  it("shows a word only for days that have arrived", async () => {
    at("2026-10-03T12:00:00Z");
    const handler = await getHandler();
    const { days } = handler({} as any).data;

    const open = days.filter((d: any) => d.status === "open");
    expect(open.map((d: any) => d.date)).toEqual([
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
    expect(open[0]).toMatchObject({
      term: "電話",
      kana: "でんわ",
      stratum: "kango",
    });

    for (const d of days.filter((x: any) => x.status === "upcoming")) {
      expect(d).toEqual({ date: d.date, status: "upcoming" });
    }
  });

  it("reveals nothing but dates before the first day", async () => {
    at("2026-09-20T12:00:00Z");
    (global as any).getQuery.mockReturnValue({ month: "2026-10" });
    const handler = await getHandler();
    const { days } = handler({} as any).data;

    expect(days.every((d: any) => d.status === "upcoming")).toBe(true);
    expect(JSON.stringify(days)).not.toContain("電話");
  });

  it("falls back to the newest month when the current one has no words", async () => {
    at("2028-03-10T12:00:00Z");
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.month).toBe("2027-12");
    expect(data.days).toHaveLength(31);
    expect(data.days.every((d: any) => d.status === "open")).toBe(true);
  });

  it("returns 400 for a malformed month", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2026-13" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 400,
    });
  });

  it("returns 404 for a month with no words", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2021-12" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
  });

  it("marks the days against filters read from the query", async () => {
    at("2026-03-08T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2026-03",
      level: "N2,N3",
      match: "all",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.filters).toEqual({ level: ["N2", "N3"], match: "all" });
    const open = data.days.filter((d: any) => d.status === "open");
    expect(open).toHaveLength(8);
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
    ]);
  });

  it("treats empty filter values as no filter", async () => {
    at("2026-03-08T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2026-03",
      level: "",
      q: "",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.filters).toEqual({});
    expect(data.count).toBe(data.total);
  });

  it("returns 400 for a filter value the API does not know", async () => {
    (global as any).getQuery.mockReturnValue({ month: "2026-03", level: "N9" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 400,
    });
  });

  it("never reveals an upcoming word through a filter", async () => {
    at("2026-09-20T12:00:00Z");
    (global as any).getQuery.mockReturnValue({
      month: "2026-10",
      q: "電話",
    });
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.count).toBe(0);
    expect(data.days.every((d: any) => d.status === "upcoming")).toBe(true);
    expect(JSON.stringify(data.days)).not.toContain("電話");
  });
});
