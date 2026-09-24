import { describe, it, expect } from "vitest";
import {
  SEASON_IDS,
  SEASONS,
  seasonForDate,
  defaultSeason,
} from "~/server/utils/site-theme";

describe("server/utils/site-theme.ts", () => {
  it("describes every implemented preset", () => {
    for (const id of SEASON_IDS) {
      expect(SEASONS[id].id).toBe(id);
      expect(SEASONS[id].months.length).toBe(3);
    }
  });

  it.each([
    ["2026-04-01T00:00:00Z", "sakura"],
    ["2026-07-15T00:00:00Z", "summer"],
    ["2026-09-24T00:00:00Z", "autumn"],
    ["2026-01-10T00:00:00Z", "winter"],
    ["2026-12-31T12:00:00Z", "winter"],
  ])("maps %s to %s", (iso, expected) => {
    expect(seasonForDate(new Date(iso))).toBe(expected);
  });

  it("uses Japan time at month boundaries", () => {
    // 2026-02-28 20:00 UTC is already 2026-03-01 05:00 in JST → spring.
    expect(seasonForDate(new Date("2026-02-28T20:00:00Z"))).toBe("sakura");
    // 2026-05-31 14:00 UTC is 23:00 JST, still May → spring.
    expect(seasonForDate(new Date("2026-05-31T14:00:00Z"))).toBe("sakura");
  });

  it("keeps sakura as the no-agent default", () => {
    expect(defaultSeason()).toBe("sakura");
  });
});
