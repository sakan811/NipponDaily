import { describe, it, expect, beforeEach } from "vitest";

import { getHandler, setupDefaults, mockCheckRateLimit } from "./setup";

describe("News API - Rate Limit Error Handling", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("returns 500 when rate limit service throws RateLimitError", async () => {
    const { RateLimitError } = await import("~/server/utils/rate-limiter");

    // Mock checkRateLimit to throw RateLimitError
    mockCheckRateLimit.mockRejectedValue(
      new RateLimitError(
        "Redis not configured: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required for rate limiting",
      ),
    );

    (global as any).getQuery.mockReturnValue({ language: "English" });

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Rate limit service unavailable",
      data: {
        error:
          "Redis not configured: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required for rate limiting",
      },
    });

    // Reset mock for other tests
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
  });

  it("returns 500 when rate limit service is unavailable", async () => {
    const { RateLimitError } = await import("~/server/utils/rate-limiter");

    // Mock checkRateLimit to throw RateLimitError for Redis unavailability
    mockCheckRateLimit.mockRejectedValue(
      new RateLimitError(
        "Redis not available or not working: Connection failed",
      ),
    );

    (global as any).getQuery.mockReturnValue({ language: "English" });

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Rate limit service unavailable",
      data: {
        error: "Redis not available or not working: Connection failed",
      },
    });

    // Reset mock for other tests
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
  });

  it("re-throws non-RateLimitError exceptions from checkRateLimit", async () => {
    // Mock checkRateLimit to throw a generic error
    mockCheckRateLimit.mockRejectedValue(new Error("Unexpected error"));

    (global as any).getQuery.mockReturnValue({ language: "English" });

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toThrow("Unexpected error");

    // Reset mock for other tests
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const resetTime = new Date(Date.now() + 86400000);

    // Mock checkRateLimit to return allowed: false
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime,
      limit: 3,
    });

    (global as any).getQuery.mockReturnValue({ language: "English" });

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: {
        error:
          "Daily rate limit exceeded (3 request/day). Please try again tomorrow.",
        retryAfter: 86400,
        resetTime: resetTime.toISOString(),
        limit: 3,
      },
    });

    // Reset mock for other tests
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
  });

  it("returns 429 with custom limit when rate limit is exceeded", async () => {
    const resetTime = new Date(Date.now() + 86400000);

    // Mock checkRateLimit with custom limit
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime,
      limit: 10,
    });

    (global as any).getQuery.mockReturnValue({ language: "English" });

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: {
        error:
          "Daily rate limit exceeded (10 request/day). Please try again tomorrow.",
        retryAfter: 86400,
        resetTime: resetTime.toISOString(),
        limit: 10,
      },
    });

    // Reset mock for other tests
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
  });
});
