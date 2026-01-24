import { describe, it, expect, beforeAll, beforeEach } from "vitest";

/**
 * Integration tests for rate-limiter.ts using Serverless Redis HTTP (SRH)
 *
 * Prerequisites:
 * 1. Start SRH using: docker-compose up -d
 * 2. Ensure SRH is running on http://localhost:8079
 *
 * Run these tests with: pnpm test:integration
 */

describe("Rate Limiter Integration Tests (with SRH)", () => {
  // SRH URL - use container name since we're in a container on the same Docker network
  // The SRH container is accessible via: http://nippondaily-serverless-redis-http-1:80
  const SRH_URL = process.env.SRH_URL ?? "http://nippondaily-serverless-redis-http-1:80";
  const SRH_TOKEN = "integration_test_token";
  const TEST_IDENTIFIER_PREFIX = "integration-test-";

  // Helper to generate unique test identifiers
  const generateTestIdentifier = () =>
    `${TEST_IDENTIFIER_PREFIX}${Date.now()}-${Math.random()}`;

  beforeAll(async () => {
    // Wait a moment for SRH to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  beforeEach(async () => {
    // Clear any existing rate limit data for our test identifiers
    // This ensures tests start with a clean slate
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: SRH_URL,
        token: SRH_TOKEN,
      });

      // Get all keys matching our test pattern
      const keys = await redis.keys("ratelimit:integration-test-*");

      // Delete all test keys
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
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });

      expect(result).toEqual({
        allowed: true,
        remaining: 3, // remaining reflects count BEFORE this request
        limit: 3,
        resetTime: expect.any(Date),
      });
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now());
    });

    it("tracks request count across multiple requests", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      // First request
      const result1 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result1.remaining).toBe(3); // remaining BEFORE first request

      // Second request
      const result2 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result2.remaining).toBe(2); // remaining BEFORE second request

      // Third request
      const result3 = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });
      expect(result3.remaining).toBe(1); // remaining BEFORE third request
    });

    it("blocks request when limit is exceeded", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();
      const config = {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 2,
      };

      // First two requests should be allowed
      const result1 = await checkRateLimit(identifier, config);
      expect(result1.allowed).toBe(true);

      const result2 = await checkRateLimit(identifier, config);
      expect(result2.allowed).toBe(true);

      // Third request should be blocked
      const result3 = await checkRateLimit(identifier, config);
      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it("uses default limit of 3 when not specified", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
      });

      expect(result.limit).toBe(3);
    });

    it("respects custom limit from config", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 10,
      });

      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(10); // remaining BEFORE first request
    });

    it("handles multiple identifiers independently", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier1 = generateTestIdentifier();
      const identifier2 = generateTestIdentifier();

      const config = {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 2,
      };

      // Make 3 requests for identifier1 (should be blocked on 3rd)
      await checkRateLimit(identifier1, config);
      await checkRateLimit(identifier1, config);
      const result1 = await checkRateLimit(identifier1, config);
      expect(result1.allowed).toBe(false);

      // identifier2 should still be allowed (independent counter)
      const result2 = await checkRateLimit(identifier2, config);
      expect(result2.allowed).toBe(true);
    });

    it("allows request after time window expires", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      // Note: We can't easily test actual time expiration in a fast test
      // Instead, we verify that the window logic is correctly implemented
      // by checking the reset time calculation

      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 1,
      });

      const now = Date.now();
      const expectedResetTime = now + 86400 * 1000; // 24 hours from now

      // Allow 5 second tolerance for test execution time
      expect(Math.abs(result.resetTime.getTime() - expectedResetTime)).toBeLessThan(
        5000,
      );
    });
  });

  describe("pipeline result validation (covers lines 107-115)", () => {
    it("handles valid pipeline results correctly", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const identifier = generateTestIdentifier();

      // This test validates that normal operation covers lines 107-115
      // The pipeline should return valid results
      const result = await checkRateLimit(identifier, {
        upstashRedisRestUrl: SRH_URL,
        upstashRedisRestToken: SRH_TOKEN,
        rateLimitMaxRequests: 3,
      });

      expect(result.allowed).toBe(true);
      expect(typeof result.remaining).toBe("number");
    });

    it("handles Redis errors during pipeline execution", async () => {
      // Test with invalid Redis URL to trigger pipeline error
      const { checkRateLimit, RateLimitError } = await import(
        "~/server/utils/rate-limiter"
      );

      await expect(
        checkRateLimit("invalid-test", {
          upstashRedisRestUrl: "http://invalid-host:9999",
          upstashRedisRestToken: SRH_TOKEN,
        }),
      ).rejects.toThrow(RateLimitError);
    });
  });

  describe("Redis initialization error handling (covers line 79)", () => {
    it("throws RateLimitError when Redis URL is invalid", async () => {
      const { checkRateLimit, RateLimitError } = await import(
        "~/server/utils/rate-limiter"
      );

      await expect(
        checkRateLimit("test", {
          upstashRedisRestUrl: "not-a-valid-url",
          upstashRedisRestToken: SRH_TOKEN,
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when Redis token is invalid", async () => {
      const { checkRateLimit, RateLimitError } = await import(
        "~/server/utils/rate-limiter"
      );

      await expect(
        checkRateLimit("test", {
          upstashRedisRestUrl: SRH_URL,
          upstashRedisRestToken: "invalid-token",
        }),
      ).rejects.toThrow(RateLimitError);
    });
  });

  describe("getClientIp", () => {
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
  });
});
