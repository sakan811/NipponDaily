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

    it("allows all requests when Upstash credentials are not configured", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      const result = await checkRateLimit("127.0.0.1");

      expect(result).toEqual({
        allowed: true,
        remaining: 3,
        resetTime: expect.any(Date),
        limit: 3,
      });
    });

    it("returns correct structure with remaining count", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      const result = await checkRateLimit("test-ip");

      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.remaining).toBeLessThanOrEqual(result.limit);
      expect(result.resetTime).toBeInstanceOf(Date);
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
