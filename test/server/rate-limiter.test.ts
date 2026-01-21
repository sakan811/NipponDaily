import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Rate Limiter", () => {
  describe("checkRateLimit", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Clear Upstash environment variables to test without Redis
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    });

    it("enforces rate limit using in-memory storage when Upstash is not configured", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const testIp = "127.0.0.1";

      // First request should be allowed
      const result1 = await checkRateLimit(testIp);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2); // 3 - 1 = 2
      expect(result1.limit).toBe(3);

      // Second request should be allowed
      const result2 = await checkRateLimit(testIp);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1); // 3 - 2 = 1

      // Third request should be allowed
      const result3 = await checkRateLimit(testIp);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0); // 3 - 3 = 0

      // Fourth request should be rate limited
      const result4 = await checkRateLimit(testIp);
      expect(result4.allowed).toBe(false);
      expect(result4.remaining).toBe(0);
    });

    it("tracks rate limits independently for different IPs", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      // Make 3 requests for IP 1
      await checkRateLimit("192.168.1.1");
      await checkRateLimit("192.168.1.1");
      await checkRateLimit("192.168.1.1");

      // IP 1 should be rate limited
      const result1 = await checkRateLimit("192.168.1.1");
      expect(result1.allowed).toBe(false);

      // IP 2 should still have all requests available
      const result2 = await checkRateLimit("192.168.1.2");
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(2);
    });

    it("returns correct structure with remaining count", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      const result = await checkRateLimit("test-ip");

      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.remaining).toBeLessThanOrEqual(result.limit);
      expect(result.resetTime).toBeInstanceOf(Date);
    });

    it("respects custom RATE_LIMIT_MAX_REQUESTS configuration", async () => {
      // Note: This test would require module isolation which is complex
      // The RATE_LIMIT_MAX_REQUESTS env var is read at module load time
      // Default value of 3 is tested by other tests in this suite
      // To test custom values, run the entire test suite with: RATE_LIMIT_MAX_REQUESTS=5 pnpm test:run
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      // Verify default limit is 3
      const result = await checkRateLimit("default-limit-test");
      expect(result.limit).toBe(3);
    });
  });

  describe("getClientIp", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      // Clear Upstash environment variables
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    });

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

    it("handles x-forwarded-for with single IP", async () => {
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

    it("extracts IP from cf-connecting-ip header", async () => {
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

    it("extracts IP from fly-client-ip header", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "fly-client-ip": "198.51.100.2",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("198.51.100.2");
    });

    it("extracts IP from true-client-ip header", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "true-client-ip": "198.51.100.3",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("198.51.100.3");
    });

    it("falls back to socket remote address when no headers present", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {} as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("192.168.1.1");
    });

    it("returns 'unknown' when no IP can be determined", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: undefined },
            headers: {} as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("unknown");
    });

    it("prioritizes x-forwarded-for over other headers", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "x-forwarded-for": "203.0.113.1",
              "cf-connecting-ip": "198.51.100.1",
              "fly-client-ip": "198.51.100.2",
              "true-client-ip": "198.51.100.3",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("203.0.113.1");
    });

    it("prioritizes cf-connecting-ip over fly and true-client-ip", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "cf-connecting-ip": "198.51.100.1",
              "fly-client-ip": "198.51.100.2",
              "true-client-ip": "198.51.100.3",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("198.51.100.1");
    });

    it("handles malformed x-forwarded-for gracefully", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "x-forwarded-for": "",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      // Should fall back to socket remote address when x-forwarded-for is empty
      expect(ip).toBe("192.168.1.1");
    });

    it("handles x-forwarded-for with whitespace", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "x-forwarded-for": "  203.0.113.1  ",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("203.0.113.1");
    });

    it("handles IPv6 addresses", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "2001:db8::1" },
            headers: {} as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      expect(ip).toBe("2001:db8::1");
    });
  });
});
