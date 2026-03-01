import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/redis
const mockPipeline = {
  zremrangebyscore: vi.fn().mockReturnThis(),
  zcard: vi.fn().mockReturnThis(),
  zadd: vi.fn().mockReturnThis(),
  expire: vi.fn().mockReturnThis(),
  exec: vi.fn(),
};

vi.mock("@upstash/redis", () => {
  return {
    Redis: class {
      // eslint-disable-next-line @typescript-eslint/no-useless-constructor
      constructor() {}
      pipeline() {
        return mockPipeline;
      }
    },
  };
});

describe("Rate Limiter", () => {
  describe("checkRateLimit", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Clear Upstash environment variables to test without Redis
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
      vi.resetModules();
    });

    it("throws RateLimitError when Redis is not configured", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");
      const testIp = "127.0.0.1";

      await expect(checkRateLimit(testIp, {})).rejects.toThrow(RateLimitError);
    });

    it("throws RateLimitError when Redis URL is missing", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
      await expect(checkRateLimit("test-ip", {})).rejects.toThrow(
        RateLimitError,
      );
    });

    it("allows request when under limit", async () => {
      mockPipeline.exec.mockResolvedValueOnce([0, 1, "OK", true]);
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      const result = await checkRateLimit("test-ip", {
        upstashRedisRestUrl: "https://test.io",
        upstashRedisRestToken: "token",
        rateLimitMaxRequests: 3,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("blocks request when over limit", async () => {
      mockPipeline.exec.mockResolvedValueOnce([0, 3, "OK", true]);
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");

      const result = await checkRateLimit("test-ip", {
        upstashRedisRestUrl: "https://test.io",
        upstashRedisRestToken: "token",
        rateLimitMaxRequests: 3,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("handles null results from pipeline", async () => {
      mockPipeline.exec.mockResolvedValueOnce(null);
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test-ip", {
          upstashRedisRestUrl: "https://test.io",
          upstashRedisRestToken: "token",
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("handles Redis connection failure in pipeline", async () => {
      mockPipeline.exec.mockRejectedValueOnce(new Error("Connection failed"));
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test-ip", {
          upstashRedisRestUrl: "https://test.io",
          upstashRedisRestToken: "token",
        }),
      ).rejects.toThrow(RateLimitError);
    });

    it("handles Redis initialization error (line 79 coverage)", async () => {
      // Use vi.doMock to trigger line 79 error
      vi.doMock("@upstash/redis", () => ({
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        Redis: class {
          constructor() {
            throw new Error("Init failed");
          }
        },
      }));

      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      await expect(
        checkRateLimit("test-ip", {
          upstashRedisRestUrl: "https://test.io",
          upstashRedisRestToken: "token",
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
            headers: { "x-forwarded-for": "203.0.113.1, 203.0.113.2" },
          },
        },
      };
      expect(getClientIp(mockEvent as any)).toBe("203.0.113.1");
    });

    it("extracts IP from other headers", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");
      const headers = ["cf-connecting-ip", "fly-client-ip", "true-client-ip"];
      for (const header of headers) {
        const mockEvent = {
          node: { req: { headers: { [header]: "1.2.3.4" } } },
        };
        expect(getClientIp(mockEvent as any)).toBe("1.2.3.4");
      }
    });

    it("falls back to socket remote address", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");
      const mockEvent = {
        node: { req: { socket: { remoteAddress: "1.1.1.1" }, headers: {} } },
      };
      expect(getClientIp(mockEvent as any)).toBe("1.1.1.1");
    });

    it("returns unknown when no IP found", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");
      const mockEvent = {
        node: { req: { headers: {} } },
      };
      expect(getClientIp(mockEvent as any)).toBe("unknown");
    });

    it("handles empty x-forwarded-for after trimming (line 153 fallback)", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");
      const mockEvent = {
        node: {
          req: {
            headers: { "x-forwarded-for": "  " },
            socket: { remoteAddress: "1.1.1.1" },
          },
        },
      };
      expect(getClientIp(mockEvent as any)).toBe("unknown");
    });
  });

  describe("RateLimitError", () => {
    it("is exported and can be instantiated", async () => {
      const { RateLimitError } = await import("~/server/utils/rate-limiter");
      const error = new RateLimitError("Test error message");
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("RateLimitError");
    });
  });
});
