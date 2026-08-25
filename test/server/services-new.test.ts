import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/redis
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();
const mockRedisDel = vi.fn();
const mockRedisSadd = vi.fn();
const mockRedisSrem = vi.fn();
const mockRedisSmembers = vi.fn();
const mockRedisSismember = vi.fn();

vi.mock("@upstash/redis", () => {
  class Redis {
    get = mockRedisGet;
    set = mockRedisSet;
    del = mockRedisDel;
    sadd = mockRedisSadd;
    srem = mockRedisSrem;
    smembers = mockRedisSmembers;
    sismember = mockRedisSismember;
  }
  return {
    Redis,
  };
});

describe("StoriesService", () => {
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("~/server/services/stories");
    service = module.storiesService;
  });

  it("uses in-memory fallback if Redis is not configured", async () => {
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";

    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    try {
      const mockStory = {
        id: "mem-story",
        headline: "Mem Story Headline",
        sources: [],
      };

      await service.saveStory(mockStory as any);
      const retrieved = await service.getStory("mem-story");
      expect(retrieved).toEqual(mockStory);

      const ids = await service.getStoryIds();
      expect(ids).toContain("mem-story");

      expect(await service.isArticleProcessed("http://test-url.com")).toBe(
        false,
      );
      await service.markArticleProcessed("http://test-url.com");
      expect(await service.isArticleProcessed("http://test-url.com")).toBe(
        true,
      );
      await service.removeProcessedArticle("http://test-url.com");
      expect(await service.isArticleProcessed("http://test-url.com")).toBe(
        false,
      );

      expect(await service.getLastIngestTime()).toBe(0);
      await service.setLastIngestTime(123456789);
      expect(await service.getLastIngestTime()).toBe(123456789);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("interacts with Redis client when configured and handles errors", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const mockStory = {
      id: "redis-story-1",
      headline: "Redis Headline",
      sources: [],
    };

    // Redis success path
    mockRedisGet
      .mockResolvedValueOnce(mockStory)
      .mockResolvedValueOnce("12345");
    mockRedisSet.mockResolvedValue("OK");
    mockRedisSadd.mockResolvedValue(1);
    mockRedisSmembers.mockResolvedValue(["redis-story-1"]);
    mockRedisSismember.mockResolvedValue(1);
    mockRedisSrem.mockResolvedValue(1);
    mockRedisDel.mockResolvedValue(1);

    await service.saveStory(mockStory as any);
    expect(await service.getStory("redis-story-1")).toEqual(mockStory);
    expect(await service.getStoryIds()).toEqual(["redis-story-1"]);
    expect(await service.isArticleProcessed("http://url.com")).toBe(true);
    await service.markArticleProcessed("http://url.com");
    await service.removeProcessedArticle("http://url.com");
    expect(await service.getLastIngestTime()).toBe(12345);
    await service.setLastIngestTime(99999);
    await service.deleteStory("redis-story-1");

    // Redis error path (falls back to memory)
    mockRedisGet.mockRejectedValue(new Error("Redis get failed"));
    mockRedisSet.mockRejectedValue(new Error("Redis set failed"));
    mockRedisSadd.mockRejectedValue(new Error("Redis sadd failed"));
    mockRedisSmembers.mockRejectedValue(new Error("Redis smembers failed"));
    mockRedisSismember.mockRejectedValue(new Error("Redis sismember failed"));
    mockRedisSrem.mockRejectedValue(new Error("Redis srem failed"));
    mockRedisDel.mockRejectedValue(new Error("Redis del failed"));

    await service.saveStory(mockStory as any);
    expect(await service.getStory("redis-story-1")).toEqual(mockStory);
    expect(await service.getStoryIds()).toContain("redis-story-1");
    expect(await service.isArticleProcessed("http://url.com")).toBe(false);
    await service.markArticleProcessed("http://url.com");
    await service.removeProcessedArticle("http://url.com");
    expect(typeof (await service.getLastIngestTime())).toBe("number");
    await service.setLastIngestTime(111);
    await service.deleteStory("redis-story-1");
  });

  it("calculates trend score based on sources from the last 14 days", async () => {
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";

    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    try {
      const now = Date.now();
      const mockStory = {
        id: "trend-story",
        headline: "Trend Story",
        trendScore: 0,
        sources: [
          {
            title: "S1",
            source: "S1",
            url: "url1",
            publishedAt: "2024-01-01",
            credibilityScore: 0.8,
            addedAt: now - 2 * 24 * 3600 * 1000,
          },
          {
            title: "S2",
            source: "S2",
            url: "url2",
            publishedAt: "2024-01-02",
            credibilityScore: 0.8,
            addedAt: now - 5 * 24 * 3600 * 1000,
          },
        ],
      };

      await service.saveStory(mockStory as any);
      await service.updateVelocityScores();

      const retrieved = await service.getStory("trend-story");
      expect(retrieved?.trendScore).toBe(2);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });
});
