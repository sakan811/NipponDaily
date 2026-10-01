import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
    expect(data.months).toEqual(["2026-10"]);
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
    at("2027-03-10T12:00:00Z");
    const handler = await getHandler();
    const { data } = handler({} as any);

    expect(data.month).toBe("2026-10");
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
    (global as any).getQuery.mockReturnValue({ month: "2025-01" });
    const handler = await getHandler();
    expect(thrownBy(() => handler({} as any))).toMatchObject({
      statusCode: 404,
    });
  });
});
