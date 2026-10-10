import { describe, expect, it } from "vitest";
import vercel from "~~/vercel.json";
import { DAY_MS, JST_OFFSET_MS } from "~~/shared/jst";

/**
 * The season is the one for the calendar day in Japan, so the cron that keeps
 * it must fire as that day turns. The docs read the schedule from vercel.json;
 * this holds it to the rule they state ("at midnight in Japan").
 */
describe("the season cron", () => {
  const cron = vercel.crons.find((c) => c.path === "/api/cron/update-season");

  it("is scheduled in vercel.json", () => {
    expect(cron).toBeDefined();
  });

  it("fires once a day, at midnight in Japan", () => {
    const [minute, hour, ...rest] = cron!.schedule.split(" ");
    expect(rest).toEqual(["*", "*", "*"]);
    const utcMs = (Number(hour) * 60 + Number(minute)) * 60_000;
    expect((utcMs + JST_OFFSET_MS) % DAY_MS).toBe(0);
  });
});
