import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getHandler, setupDefaults, mockCheckRateLimit } from "./setup";

/**
 * Tests for runtime config branches in news.get.ts (lines 167-172).
 *
 * The handler accesses useRuntimeConfig() as a global (injected by Nuxt's
 * auto-import). In tests, this resolves to (global as any).useRuntimeConfig.
 * We override it per-test to exercise different config branches.
 */

describe("News API - Runtime Config Branches", () => {
  let handler: any;
  const originalUseRuntimeConfig = (global as any).useRuntimeConfig;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  afterEach(() => {
    // Restore the original global mock after each test
    (global as any).useRuntimeConfig = originalUseRuntimeConfig;
  });

  it("passes rateLimitMaxRequests as undefined when not in config (falsy branch, line 170)", async () => {
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "mock-url",
      upstashRedisRestToken: "mock-token",
      // rateLimitMaxRequests absent → falsy branch
      tavilyApiKey: "test-tavily-key",
      geminiApiKey: "test-api-key",
      geminiModel: "gemini-1.5-flash",
    }));

    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      "127.0.0.1",
      expect.objectContaining({
        rateLimitMaxRequests: undefined,
      }),
    );
  });

  it("parses rateLimitMaxRequests string to number when truthy in config (truthy branch, lines 170-172)", async () => {
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "mock-url",
      upstashRedisRestToken: "mock-token",
      rateLimitMaxRequests: "5", // truthy string → parseInt to number
      tavilyApiKey: "test-tavily-key",
      geminiApiKey: "test-api-key",
      geminiModel: "gemini-1.5-flash",
    }));

    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      "127.0.0.1",
      expect.objectContaining({
        rateLimitMaxRequests: 5,
      }),
    );
  });
});
