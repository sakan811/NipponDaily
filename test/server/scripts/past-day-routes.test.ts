import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jstToday, pastDayRoutes } from "../../../scripts/lib/past-day-routes";
import { WORD_ENTRIES, todayJst } from "~~/shared/words";

const WORDS_DIR = join(__dirname, "../../../data/words");

describe("jstToday", () => {
  it("is the calendar day in Japan, which turns at 15:00 UTC", () => {
    expect(jstToday(new Date("2026-10-05T14:59:59Z"))).toBe("2026-10-05");
    expect(jstToday(new Date("2026-10-05T15:00:00Z"))).toBe("2026-10-06");
  });

  it("agrees with the app's own todayJst", () => {
    const now = new Date("2026-03-01T23:30:00Z");
    expect(jstToday(now)).toBe(todayJst(now));
  });
});

describe("pastDayRoutes", () => {
  it("lists every day before today, never today or an upcoming day", () => {
    const today = "2026-10-05";
    const routes = pastDayRoutes(WORDS_DIR, today);

    expect(routes).toEqual(
      WORD_ENTRIES.filter((e) => e.date < today).map((e) => `/words/${e.date}`),
    );
    expect(routes).toContain("/words/2026-10-04");
    expect(routes).not.toContain("/words/2026-10-05");
    expect(routes).not.toContain("/words/2026-10-06");
  });

  it("is empty when no day has passed", () => {
    expect(pastDayRoutes(WORDS_DIR, WORD_ENTRIES[0]!.date)).toEqual([]);
  });

  it("reads only the month files, in date order", () => {
    const dir = mkdtempSync(join(tmpdir(), "past-days-"));
    writeFileSync(
      join(dir, "2026-02.json"),
      JSON.stringify([{ date: "2026-02-01" }]),
    );
    writeFileSync(
      join(dir, "2026-01.json"),
      JSON.stringify([{ date: "2026-01-02" }, { date: "2026-01-01" }]),
    );
    writeFileSync(join(dir, "notes.json"), "not json");

    expect(pastDayRoutes(dir, "2026-02-01")).toEqual([
      "/words/2026-01-01",
      "/words/2026-01-02",
    ]);
  });
});
