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
  let calculateTrendScore: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("~/server/services/stories");
    service = module.storiesService;
    calculateTrendScore = module.calculateTrendScore;
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

  it("falls back to memory when the Redis client constructor throws", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const RedisModule = await import("@upstash/redis");
    const originalRedis = RedisModule.Redis;
    // @ts-expect-error - reassigning the mocked class for this test only
    RedisModule.Redis = vi.fn(() => {
      throw new Error("bad client config");
    });

    try {
      const mockStory = { id: "ctor-fail-story", headline: "H", sources: [] };
      await service.saveStory(mockStory as any);
      expect(await service.getStory("ctor-fail-story")).toEqual(mockStory);
    } finally {
      // @ts-expect-error - restoring the mocked class
      RedisModule.Redis = originalRedis;
    }
  });

  it("gets and sets per-domain credibility scores using the in-memory fallback", async () => {
    (service as any).client = null;
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));

    try {
      expect(await service.getDomainCredibility("example.com")).toBeNull();
      await service.setDomainCredibility("example.com", 0.75);
      expect(await service.getDomainCredibility("example.com")).toBe(0.75);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("gets and sets per-domain credibility scores via Redis, falling back to memory on error", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    const mockRedisHget = vi.fn();
    const mockRedisHset = vi.fn();
    (service as any).client = {
      hget: mockRedisHget,
      hset: mockRedisHset,
    };

    mockRedisHget.mockResolvedValueOnce(0.42);
    expect(await service.getDomainCredibility("cached.com")).toBe(0.42);

    mockRedisHget.mockResolvedValueOnce(null);
    expect(await service.getDomainCredibility("unscored.com")).toBeNull();

    mockRedisHset.mockResolvedValueOnce(1);
    await service.setDomainCredibility("new.com", 0.9);
    expect(mockRedisHset).toHaveBeenCalledWith("news:domain_credibility", {
      "new.com": 0.9,
    });

    mockRedisHget.mockRejectedValueOnce(new Error("hget failed"));
    expect(await service.getDomainCredibility("err.com")).toBeNull();

    mockRedisHset.mockRejectedValueOnce(new Error("hset failed"));
    await service.setDomainCredibility("err.com", 0.5);
    mockRedisHget.mockRejectedValueOnce(new Error("hget failed again"));
    expect(await service.getDomainCredibility("err.com")).toBe(0.5);

    (service as any).client = null;
  });

  it("deletes a story from the in-memory store when Redis is not configured", async () => {
    (service as any).client = null;
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));

    try {
      const mockStory = { id: "mem-delete-story", headline: "H", sources: [] };
      await service.saveStory(mockStory as any);
      expect(await service.getStory("mem-delete-story")).toEqual(mockStory);
      await service.deleteStory("mem-delete-story");
      expect(await service.getStory("mem-delete-story")).toBeNull();
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("clears all stories", async () => {
    (service as any).client = null;
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));

    try {
      await service.saveStory({
        id: "clear-1",
        headline: "H1",
        sources: [],
      } as any);
      await service.saveStory({
        id: "clear-2",
        headline: "H2",
        sources: [],
      } as any);
      expect(await service.getStoryIds()).toEqual(
        expect.arrayContaining(["clear-1", "clear-2"]),
      );

      await service.clearAllStories();

      expect(await service.getStoryIds()).toEqual([]);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("skips story ids whose record is missing when listing all stories", async () => {
    (service as any).client = null;
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    (global as any).useRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));

    try {
      await service.saveStory({
        id: "present",
        headline: "H",
        sources: [],
      } as any);
      // Simulate a story id that's tracked but whose record was never saved / was removed.
      (service as any).memoryStories = new Map(
        Object.entries({
          present: { id: "present", headline: "H", sources: [] },
        }),
      );
      const originalGetStoryIds = service.getStoryIds.bind(service);
      service.getStoryIds = async () => ["present", "missing"];

      const stories = await service.getStories();

      expect(stories.map((s: any) => s.id)).toEqual(["present"]);
      service.getStoryIds = originalGetStoryIds;
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("calculates trend score using publishedAt when addedAt is missing, and excludes unparseable/old sources", async () => {
    const now = Date.now();
    const story = {
      id: "fallback-story",
      headline: "H",
      sources: [
        // No addedAt, recent publishedAt -> counts as recent
        {
          title: "A",
          source: "A",
          url: "a",
          publishedAt: new Date(now - 1000).toISOString(),
        },
        // No addedAt, unparseable publishedAt -> falls back to 0, treated as old
        { title: "B", source: "B", url: "b", publishedAt: "not-a-date" },
      ],
    };

    const score = calculateTrendScore(story as any, now);

    expect(score).toBe(1);
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
