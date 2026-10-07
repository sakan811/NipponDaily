import { describe, it, expect } from "vitest";
import {
  createRateLimiter,
  isRateLimited,
  RATE_LIMIT,
} from "~/server/utils/rate-limit";

describe("isRateLimited", () => {
  it("guards the API and the share images", () => {
    expect(isRateLimited("/api/daily-word")).toBe(true);
    expect(isRateLimited("/api/explore")).toBe(true);
    expect(isRateLimited("/og.png")).toBe(true);
  });

  it("leaves pages, files and the cron alone", () => {
    expect(isRateLimited("/")).toBe(false);
    expect(isRateLimited("/docs/api")).toBe(false);
    expect(isRateLimited("/sitemap.xml")).toBe(false);
    expect(isRateLimited("/api/cron/update-season")).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit, then refuses until the window resets", () => {
    const l = createRateLimiter(3, 60_000);
    expect(l.hit("a", 0).allowed).toBe(true);
    expect(l.hit("a", 1000).allowed).toBe(true);
    expect(l.hit("a", 2000).allowed).toBe(true);
    const refused = l.hit("a", 3000);
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfter).toBe(57);
    expect(l.hit("a", 60_000).allowed).toBe(true);
  });

  it("counts each address separately", () => {
    const l = createRateLimiter(1, 60_000);
    expect(l.hit("a", 0).allowed).toBe(true);
    expect(l.hit("a", 1).allowed).toBe(false);
    expect(l.hit("b", 2).allowed).toBe(true);
  });

  it("never reports less than one second to wait", () => {
    const l = createRateLimiter(1, 60_000);
    l.hit("a", 0);
    expect(l.hit("a", 59_999.5).retryAfter).toBe(1);
  });

  it("forgets expired windows instead of growing without bound", () => {
    const l = createRateLimiter(5, 1000);
    for (let i = 0; i < 1001; i++) l.hit(`ip${i}`, 0);
    expect(l.size).toBe(1001);
    l.hit("late", 5000);
    expect(l.size).toBe(1);
  });

  it("defaults to a limit a person browsing will not reach", () => {
    expect(RATE_LIMIT.limit).toBeGreaterThanOrEqual(60);
    const l = createRateLimiter();
    for (let i = 0; i < RATE_LIMIT.limit; i++) l.hit("a", 0);
    expect(l.hit("a", 1).allowed).toBe(false);
  });
});
