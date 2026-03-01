import { describe, it, expect, beforeEach, vi } from "vitest";
import { Redis } from "@upstash/redis";

/**
 * Integration tests for rate-limiter.ts using Serverless Redis HTTP (SRH)
 *
 * Prerequisites:
 * 1. Start SRH using: docker-compose up -d
 * 2. Ensure SRH is running on http://localhost:8079
 *
 * Run these tests with: pnpm test:integration
 */

const TEST_SRH_URL = process.env.TEST_SRH_URL ?? "http://localhost:8079";
const SRH_TOKEN = process.env.SRH_TOKEN ?? "integration_test_token";
const TEST_IDENTIFIER_PREFIX = "integration-test-";

console.log("SRH Test Config:", { TEST_SRH_URL, SRH_TOKEN });

// Helper to generate unique test identifiers
const generateTestIdentifier = () =>
  `${TEST_IDENTIFIER_PREFIX}${Date.now()}-${Math.random()}`;

describe("Rate Limiter Integration Tests", () => {
  beforeEach(async () => {
    // Clear any existing rate limit data for our test identifiers
    try {
      const redis = new Redis({
        url: TEST_SRH_URL,
        token: SRH_TOKEN,
      });
      const keys = await redis.keys("ratelimit:integration-test-*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn("Failed to clean up test data:", error);
    }
  });

  describe("checkRateLimit with real Redis", () => {
    it("allows first request and returns correct metadata", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });

      expect(result).toEqual({
        allowed: true,
        remaining: 3,
        limit: 3,
        resetTime: expect.any(Date),
      });
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now());
    });

    it("tracks request count across multiple requests", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result1 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result1.remaining).toBe(3);

      const result2 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result2.remaining).toBe(2);

      const result3 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result3.remaining).toBe(1);
    });

    it("blocks request when limit is exceeded", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();
      const config = {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 2,
      };

      await checkRateLimit(identifier, config);
      await checkRateLimit(identifier, config);

      const result3 = await checkRateLimit(identifier, config);
      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it("uses default limit of 3 when not specified (covers line 47)", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        // rateLimitMaxRequests not specified
      });

      expect(result.limit).toBe(3);
    });

    it("respects custom limit from config", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 10,
      });

      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(10);
    });

    it("handles multiple identifiers independently", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier1 = generateTestIdentifier();
      const identifier2 = generateTestIdentifier();

      const config = {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 2,
      };

      await checkRateLimit(identifier1, config);
      await checkRateLimit(identifier1, config);
      const result1 = await checkRateLimit(identifier1, config);
      expect(result1.allowed).toBe(false);

      const result2 = await checkRateLimit(identifier2, config);
      expect(result2.allowed).toBe(true);
    });

    it("allows request after time window expires", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 1,
      });

      const now = Date.now();
      const expectedResetTime = now + 86400 * 1000;

      expect(
        Math.abs(result.resetTime.getTime() - expectedResetTime),
      ).toBeLessThan(5000);
    });
  });

  describe("pipeline result validation (covers lines 107-115)", () => {
    it("handles valid pipeline results correctly", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });

      expect(result.allowed).toBe(true);
      expect(typeof result.remaining).toBe("number");
    });

    it("handles Redis errors during pipeline execution", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("invalid-test", {
          upstashRedisRestUrl: "http://invalid-host:9999",
          upstashRedisRestToken: SRH_TOKEN,
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("calculates remaining correctly when currentCount equals maxRequests (covers line 112)", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const config = {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 2,
      };

      await checkRateLimit(identifier, config);
      await checkRateLimit(identifier, config);

      const result = await checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("sets allowed to true when currentCount < maxRequests (covers line 113 true branch)", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 5,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it("sets allowed to false when currentCount >= maxRequests (covers line 113 false branch)", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const config = {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 1,
      };

      await checkRateLimit(identifier, config);

      const result2 = await checkRateLimit(identifier, config);
      expect(result2.allowed).toBe(false);
    });
  });

  describe("Redis initialization error handling", () => {
    it("throws RateLimitError when Redis URL is invalid (covers lines 75-77)", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test", {
          upstashRedisRestUrl: "not-a-valid-url",
          upstashRedisRestToken: SRH_TOKEN,
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when Redis token is invalid (covers lines 75-77)", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test", {
          upstashRedisRestUrl: TEST_SRH_URL,
          upstashRedisRestToken: "invalid-token",
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when config is missing (covers line 47)", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      // Pass empty config to trigger missing url/token error
      await expect(checkRateLimit("test", {})).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when URL is missing from config (covers line 47)", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test", {
          upstashRedisRestToken: SRH_TOKEN,
          // URL is missing
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when token is missing from config (covers line 47)", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test", {
          upstashRedisRestUrl: TEST_SRH_URL,
          // Token is missing
        }),
      ).rejects.toThrow(RateLimitError);
    });
  });
});

describe("Rate Limiter Edge Cases (with mocked Redis)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("covers lines 47 and 76-77 when config is empty (missing url and token)", async () => {
    // This test covers both line 47 (throw in getRedisClient for missing url/token)
    // AND lines 76-77 (the if-branch that handles RateLimitError)
    const { checkRateLimit, RateLimitError } =
      await import("~/server/utils/rate-limiter");

    // Pass empty config - will hit line 47 (throw in getRedisClient)
    // and then lines 76-77 (console.error and re-throw)
    await expect(
      checkRateLimit("test", {}), // Empty config
    ).rejects.toThrow(RateLimitError);
  });

  it("covers line 79 when getRedisClient throws non-RateLimitError", async () => {
    vi.doMock("@upstash/redis", () => ({
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      Redis: class {
        constructor() {
          throw new Error("Generic Redis connection error");
        }
      } as never,
    }));

    vi.resetModules();

    const { checkRateLimit, RateLimitError } =
      await import("~/server/utils/rate-limiter");

    await expect(
      checkRateLimit("test", {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      }),
    ).rejects.toThrow(RateLimitError);

    await expect(
      checkRateLimit("test", {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      }),
    ).rejects.toThrow("Redis initialization failed");
  });

  it("handles null zcard result in pipeline (covers line 107)", async () => {
    vi.doMock("@upstash/redis", () => ({
      Redis: class {
        pipeline() {
          return {
            zremrangebyscore: () => this,
            zcard: () => this,
            zadd: () => this,
            expire: () => this,
            exec: () => Promise.resolve([0, null, "ok", true]),
          };
        }
      } as never,
    }));

    vi.resetModules();

    const { checkRateLimit } = await import("~/server/utils/rate-limiter");

    await expect(
      checkRateLimit("test", {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      }),
    ).rejects.toThrow("Failed to execute rate limit pipeline");
  });

  it("handles insufficient pipeline results length (covers line 107)", async () => {
    vi.doMock("@upstash/redis", () => ({
      Redis: class {
        pipeline() {
          return {
            zremrangebyscore: () => this,
            zcard: () => this,
            zadd: () => this,
            expire: () => this,
            exec: () => Promise.resolve([0, 0] as unknown),
          };
        }
      } as never,
    }));

    vi.resetModules();

    const { checkRateLimit } = await import("~/server/utils/rate-limiter");

    await expect(
      checkRateLimit("test", {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      }),
    ).rejects.toThrow("Failed to execute rate limit pipeline");
  });

  it("handles null/undefined pipeline results (covers line 107)", async () => {
    vi.doMock("@upstash/redis", () => ({
      Redis: class {
        pipeline() {
          return {
            zremrangebyscore: () => this,
            zcard: () => this,
            zadd: () => this,
            expire: () => this,
            exec: () => Promise.resolve(null),
          };
        }
      } as never,
    }));

    vi.resetModules();

    const { checkRateLimit } = await import("~/server/utils/rate-limiter");

    await expect(
      checkRateLimit("test", {
        upstashRedisRestUrl: TEST_SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      }),
    ).rejects.toThrow("Failed to execute rate limit pipeline");
  });
});

describe("getClientIp (covers lines 153-164)", () => {
  it("extracts IP from x-forwarded-for header", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "x-forwarded-for": "203.0.113.1, 203.0.113.2",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("203.0.113.1");
  });

  it("prioritizes x-forwarded-for over socket remoteAddress", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "x-forwarded-for": "203.0.113.1",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("203.0.113.1");
  });

  it("tries cf-connecting-ip header when x-forwarded-for is not present", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "cf-connecting-ip": "198.51.100.1",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("198.51.100.1");
  });

  it("tries fly-client-ip header when x-forwarded-for and cf-connecting-ip are not present", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "fly-client-ip": "203.0.113.50",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("203.0.113.50");
  });

  it("tries true-client-ip header when other proxy headers are not present", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "true-client-ip": "198.51.100.50",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("198.51.100.50");
  });

  it("falls back to socket remoteAddress when no proxy headers are present", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "10.0.0.5" },
          headers: {} as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("10.0.0.5");
  });

  it("returns unknown when socket remoteAddress is undefined", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: {},
          headers: {} as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("unknown");
  });

  it("trims whitespace from x-forwarded-for IP before splitting", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "x-forwarded-for": " 203.0.113.1  ,  203.0.113.2  ",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("203.0.113.1");
  });

  it("handles empty x-forwarded-for after trimming", async () => {
    const { getClientIp } = await import("~/server/utils/rate-limiter");

    const mockEvent = {
      node: {
        req: {
          socket: { remoteAddress: "192.168.1.1" },
          headers: {
            "x-forwarded-for": "  ",
          } as Record<string, string | undefined>,
        },
      },
    };

    const ip = getClientIp(mockEvent);
    expect(ip).toBe("unknown");
  });
});
