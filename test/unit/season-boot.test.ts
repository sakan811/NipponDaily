import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SEASON_BY_MONTH_INDEX,
  SEASON_IDS,
  seasonBootScript,
  seasonForDate,
} from "~~/shared/seasons";
import { STORAGE_KEYS } from "~~/shared/storage-keys";

/**
 * The inline script that sets `data-season` before first paint is plain
 * JavaScript pasted into <head>, with a twelve-entry table embedded in it.
 * These tests run that real source, so it cannot drift from `seasonForDate`.
 */
const run = () => new Function(seasonBootScript(STORAGE_KEYS.seasonChoice))();
const season = () => document.documentElement.getAttribute("data-season");

describe("the pre-paint season script", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-season");
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("has a table entry for every month, each a known season", () => {
    expect(SEASON_BY_MONTH_INDEX).toHaveLength(12);
    for (const s of SEASON_BY_MONTH_INDEX) expect(SEASON_IDS).toContain(s);
  });

  it.each(Array.from({ length: 12 }, (_, m) => m))(
    "sets the same season as seasonForDate() in month %i",
    (m) => {
      // The 15th at noon UTC is the 15th in Japan too.
      const date = new Date(Date.UTC(2026, m, 15, 12));
      vi.useFakeTimers();
      vi.setSystemTime(date);

      run();

      expect(season()).toBe(seasonForDate(date));
    },
  );

  it("reads the month in Japan at the boundary, not in UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-28T15:00:00Z")); // 1 March, 00:00 JST
    run();
    expect(season()).toBe("sakura");

    vi.setSystemTime(new Date("2026-02-28T14:59:59Z")); // still 28 Feb in Japan
    run();
    expect(season()).toBe("winter");
  });

  it("prefers the reader's pick over the calendar", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:00:00Z"));
    localStorage.setItem(STORAGE_KEYS.seasonChoice, "winter");

    run();

    expect(season()).toBe("winter");
  });

  it("ignores a stored pick that is not a season", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:00:00Z"));
    localStorage.setItem(STORAGE_KEYS.seasonChoice, "monsoon");

    run();

    expect(season()).toBe("summer");
  });

  it("still sets the calendar season when storage throws", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T00:00:00Z"));
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    run();

    expect(season()).toBe("autumn");
  });
});
