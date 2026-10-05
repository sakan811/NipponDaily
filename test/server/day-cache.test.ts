import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  dayCacheControl,
  isDayCacheable,
  secondsUntilJstMidnight,
} from "~/server/utils/day-cache";

const utc = (iso: string) => Date.parse(iso);

describe("secondsUntilJstMidnight", () => {
  it("counts down to 15:00 UTC, which is midnight in Japan", () => {
    expect(secondsUntilJstMidnight(utc("2026-10-05T12:00:00Z"))).toBe(3 * 3600);
    expect(secondsUntilJstMidnight(utc("2026-10-05T14:59:59Z"))).toBe(1);
  });

  it("is a full day just after the day has turned", () => {
    expect(secondsUntilJstMidnight(utc("2026-10-05T15:00:00Z"))).toBe(86400);
    expect(secondsUntilJstMidnight(utc("2026-10-05T15:00:01Z"))).toBe(86399);
  });

  it("never reaches 0", () => {
    expect(secondsUntilJstMidnight(utc("2026-10-05T14:59:59.900Z"))).toBe(1);
  });

  it("follows the Japanese day across a UTC month and year end", () => {
    expect(secondsUntilJstMidnight(utc("2026-12-31T20:00:00Z"))).toBe(
      19 * 3600,
    );
  });
});

describe("dayCacheControl", () => {
  it("lets a shared cache keep the answer until midnight and no longer", () => {
    expect(dayCacheControl(utc("2026-10-05T12:00:00Z"))).toBe(
      "public, max-age=0, s-maxage=10800",
    );
  });

  it("never serves stale, which would show yesterday's word after midnight", () => {
    expect(dayCacheControl()).not.toContain("stale-while-revalidate");
  });
});

describe("isDayCacheable", () => {
  it("covers pages, the API, the sitemap and robots.txt", () => {
    for (const path of [
      "/",
      "/words",
      "/words/2026-10-01",
      "/parts/%E6%97%A5",
      "/docs/architecture",
      "/api/daily-word",
      "/api/explore",
      "/sitemap.xml",
      "/robots.txt",
    ])
      expect(isDayCacheable(path), path).toBe(true);
  });

  it("leaves out what changes within a day and what is not ours", () => {
    for (const path of [
      "/api/site-theme",
      "/api/cron/update-season",
      "/_nuxt/entry.abc123.js",
      "/favicon-light.ico",
      "/light/site.webmanifest",
      "/music/spring.mp3",
    ])
      expect(isDayCacheable(path), path).toBe(false);
  });
});

describe("the day-cache Nitro plugin", () => {
  type Hook = (event: unknown) => void;
  const headers = new Map<string, string>();

  const run = async (event: {
    method: string;
    path: string;
    node: { res: { statusCode: number } };
  }) => {
    let hook: Hook | undefined;
    (global as any).defineNitroPlugin = (fn: (app: unknown) => void) => fn;
    (global as any).getResponseHeader = (_e: unknown, name: string) =>
      headers.get(name);
    (global as any).setResponseHeader = (
      _e: unknown,
      name: string,
      v: string,
    ) => headers.set(name, v);
    const plugin = (await import("~/server/plugins/day-cache")).default as (
      app: unknown,
    ) => void;
    plugin({ hooks: { hook: (_name: string, fn: Hook) => (hook = fn) } });
    hook!(event);
  };

  const ok = (path: string, method = "GET", statusCode = 200) => ({
    method,
    path,
    node: { res: { statusCode } },
  });

  beforeEach(() => {
    headers.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T12:00:00Z"));
  });

  it("marks a successful GET until midnight in Japan", async () => {
    await run(ok("/api/daily-word?date=2026-10-01"));
    expect(headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=10800",
    );
  });

  it("never marks an error, so a 400 or a 404 is not kept", async () => {
    await run(ok("/api/daily-word", "GET", 400));
    await run(ok("/words/2099-01-01", "GET", 404));
    await run(ok("/api/explore", "GET", 500));
    expect(headers.size).toBe(0);
  });

  it("leaves other methods and uncacheable paths alone", async () => {
    await run(ok("/api/explore", "POST"));
    await run(ok("/api/site-theme"));
    expect(headers.size).toBe(0);
  });

  it("keeps a cache-control a route already set", async () => {
    headers.set("cache-control", "public, s-maxage=60");
    await run(ok("/api/explore"));
    expect(headers.get("cache-control")).toBe("public, s-maxage=60");
  });
});
