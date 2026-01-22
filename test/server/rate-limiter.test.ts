import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Rate Limiter", () => {
  describe("checkRateLimit", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Clear Upstash environment variables to test without Redis
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    });

    it("throws RateLimitError when Redis is not configured", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");
      const testIp = "127.0.0.1";

      await expect(checkRateLimit(testIp)).rejects.toThrow(RateLimitError);
      await expect(checkRateLimit(testIp)).rejects.toThrow(
        "Redis not configured",
      );
    });

    it("throws RateLimitError when Redis URL is missing", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      // Only set token, not URL
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await expect(checkRateLimit("test-ip")).rejects.toThrow(RateLimitError);
      await expect(checkRateLimit("test-ip")).rejects.toThrow(
        "UPSTASH_REDIS_REST_URL",
      );
    });

    it("throws RateLimitError when Redis token is missing", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      // Only set URL, not token
      process.env.UPSTASH_REDIS_REST_URL = "https://test.redis.upstash.io";

      await expect(checkRateLimit("test-ip")).rejects.toThrow(RateLimitError);
      await expect(checkRateLimit("test-ip")).rejects.toThrow(
        "UPSTASH_REDIS_REST_TOKEN",
      );
    });

    it("logs error when Redis is not configured", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        await checkRateLimit("test-ip");
      } catch {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Rate limit error:",
        expect.stringContaining("Redis not configured"),
      );

      consoleErrorSpy.mockRestore();
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

    it("handles x-forwarded-for with multiple IPs (returns first)", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "192.168.1.1" },
            headers: {
              "x-forwarded-for": "192.168.0.1, 203.0.113.2, 203.0.113.3",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      // Should return the first IP in the chain
      expect(ip).toBe("192.168.0.1");
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

    it("handles x-forwarded-for with trailing comma", async () => {
      const { getClientIp } = await import("~/server/utils/rate-limiter");

      const mockEvent = {
        node: {
          req: {
            socket: { remoteAddress: "203.0.113.1" },
            headers: {
              "x-forwarded-for": "203.0.113.5,",
            } as Record<string, string | undefined>,
          },
        },
      };

      const ip = getClientIp(mockEvent);

      // Should extract the valid IP before the comma
      expect(ip).toBe("203.0.113.5");
    });
  });

  describe("checkRateLimit with Redis", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Configure Upstash Redis environment
      process.env.UPSTASH_REDIS_REST_URL = "https://test.redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    });

    afterEach(async () => {
      // Clean up Redis environment
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      // Clear module cache to reset state
      vi.resetModules();
    });

    it("throws RateLimitError when Redis connection fails", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Since we can't actually connect to the fake Redis URL,
      // it should throw a RateLimitError
      await expect(checkRateLimit("test-ip")).rejects.toThrow(RateLimitError);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Redis rate limit failed"),
      );

      consoleSpy.mockRestore();
    });

    it("throws RateLimitError when Redis is not available after configuration", async () => {
      const { checkRateLimit, RateLimitError } =
        await import("~/server/utils/rate-limiter");

      // The Redis URL is configured but not actually available
      await expect(checkRateLimit("test-ip")).rejects.toThrow(RateLimitError);
      await expect(checkRateLimit("test-ip")).rejects.toThrow(
        "Redis not available or not working",
      );
    });

    it("logs error when Redis fails", async () => {
      const { checkRateLimit } = await import("~/server/utils/rate-limiter");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        await checkRateLimit("test-ip");
      } catch {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Redis rate limit failed"),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("RateLimitError", () => {
    it("is exported and can be instantiated", async () => {
      const { RateLimitError } = await import("~/server/utils/rate-limiter");

      const error = new RateLimitError("Test error message");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("Test error message");
    });
  });
});
