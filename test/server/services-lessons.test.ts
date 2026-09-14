import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAnalyzeJapanese = vi.fn();
vi.mock("~/server/utils/tokenizer", () => ({
  analyzeJapanese: mockAnalyzeJapanese,
}));

// Mock @upstash/redis
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();
const mockRedisDel = vi.fn();
const mockRedisSadd = vi.fn();
const mockRedisSrem = vi.fn();
const mockRedisSmembers = vi.fn();
const mockRedisSismember = vi.fn();
const mockRedisSmismember = vi.fn();
const mockRedisMget = vi.fn();
const mockRedisHset = vi.fn();
const mockRedisHget = vi.fn();
const mockRedisHdel = vi.fn();

vi.mock("@upstash/redis", () => {
  class Redis {
    get = mockRedisGet;
    set = mockRedisSet;
    del = mockRedisDel;
    sadd = mockRedisSadd;
    srem = mockRedisSrem;
    smembers = mockRedisSmembers;
    sismember = mockRedisSismember;
    smismember = mockRedisSmismember;
    mget = mockRedisMget;
    hset = mockRedisHset;
    hget = mockRedisHget;
    hdel = mockRedisHdel;
  }
  return {
    Redis,
  };
});

describe("LessonsService", () => {
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("~/server/services/lessons");
    service = module.lessonsService;
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
      const mockLesson = { id: "mem-lesson", title: "Mem Lesson" };

      await service.saveLesson(mockLesson as any);
      const retrieved = await service.getLesson("mem-lesson");
      expect(retrieved).toEqual(mockLesson);

      const ids = await service.getLessonIds();
      expect(ids).toContain("mem-lesson");

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

    const mockLesson = { id: "redis-lesson-1", title: "Redis Lesson" };

    // Redis success path
    mockRedisGet
      .mockResolvedValueOnce(mockLesson)
      .mockResolvedValueOnce("12345");
    mockRedisSet.mockResolvedValue("OK");
    mockRedisSadd.mockResolvedValue(1);
    mockRedisSmembers.mockResolvedValue(["redis-lesson-1"]);
    mockRedisSismember.mockResolvedValue(1);
    mockRedisSrem.mockResolvedValue(1);
    mockRedisDel.mockResolvedValue(1);
    mockRedisHset.mockResolvedValue(1);
    mockRedisHget.mockResolvedValue(null);
    mockRedisHdel.mockResolvedValue(1);

    await service.saveLesson(mockLesson as any);
    expect(await service.getLesson("redis-lesson-1")).toEqual(mockLesson);
    expect(await service.getLessonIds()).toEqual(["redis-lesson-1"]);
    expect(await service.isArticleProcessed("http://url.com")).toBe(true);
    await service.markArticleProcessed("http://url.com");
    await service.removeProcessedArticle("http://url.com");
    expect(await service.getLastIngestTime()).toBe(12345);
    await service.setLastIngestTime(99999);
    await service.deleteLesson("redis-lesson-1");

    // Redis error path (falls back to memory)
    mockRedisGet.mockRejectedValue(new Error("Redis get failed"));
    mockRedisSet.mockRejectedValue(new Error("Redis set failed"));
    mockRedisSadd.mockRejectedValue(new Error("Redis sadd failed"));
    mockRedisSmembers.mockRejectedValue(new Error("Redis smembers failed"));
    mockRedisSismember.mockRejectedValue(new Error("Redis sismember failed"));
    mockRedisSrem.mockRejectedValue(new Error("Redis srem failed"));
    mockRedisDel.mockRejectedValue(new Error("Redis del failed"));
    mockRedisHset.mockRejectedValue(new Error("Redis hset failed"));
    mockRedisHget.mockRejectedValue(new Error("Redis hget failed"));
    mockRedisHdel.mockRejectedValue(new Error("Redis hdel failed"));

    await service.saveLesson(mockLesson as any);
    expect(await service.getLesson("redis-lesson-1")).toEqual(mockLesson);
    expect(await service.getLessonIds()).toContain("redis-lesson-1");
    expect(await service.isArticleProcessed("http://url.com")).toBe(false);
    await service.markArticleProcessed("http://url.com");
    await service.removeProcessedArticle("http://url.com");
    expect(typeof (await service.getLastIngestTime())).toBe("number");
    await service.setLastIngestTime(111);
    await service.deleteLesson("redis-lesson-1");
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
      const mockLesson = { id: "ctor-fail-lesson", title: "H" };
      await service.saveLesson(mockLesson as any);
      expect(await service.getLesson("ctor-fail-lesson")).toEqual(mockLesson);
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

  it("deletes a lesson from the in-memory store when Redis is not configured", async () => {
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
      const mockLesson = { id: "mem-delete-lesson", title: "H" };
      await service.saveLesson(mockLesson as any);
      expect(await service.getLesson("mem-delete-lesson")).toEqual(mockLesson);
      await service.deleteLesson("mem-delete-lesson");
      expect(await service.getLesson("mem-delete-lesson")).toBeNull();
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("skips lesson ids whose record is missing when listing all lessons", async () => {
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
      await service.saveLesson({ id: "present", title: "H" } as any);
      (service as any).memoryLessons = new Map(
        Object.entries({ present: { id: "present", title: "H" } }),
      );
      const originalGetLessonIds = service.getLessonIds.bind(service);
      service.getLessonIds = async () => ["present", "missing"];

      const lessons = await service.getLessons();

      expect(lessons.map((l: any) => l.id)).toEqual(["present"]);
      service.getLessonIds = originalGetLessonIds;
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("fetches all lessons in a single mget round-trip instead of one get per id", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const lessonA = { id: "a", title: "A" };
    const lessonB = { id: "b", title: "B" };
    mockRedisSmembers.mockResolvedValueOnce(["a", "b", "missing"]);
    mockRedisMget.mockResolvedValueOnce([lessonA, lessonB, null]);

    const lessons = await service.getLessons();

    expect(mockRedisMget).toHaveBeenCalledWith(
      "lesson:a",
      "lesson:b",
      "lesson:missing",
    );
    expect(mockRedisGet).not.toHaveBeenCalled();
    expect(lessons).toEqual([lessonA, lessonB]);

    (service as any).client = null;
  });

  it("returns an empty array without calling Redis when there are no lesson ids", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    mockRedisSmembers.mockResolvedValueOnce([]);

    const lessons = await service.getLessons();

    expect(lessons).toEqual([]);
    expect(mockRedisMget).not.toHaveBeenCalled();

    (service as any).client = null;
  });

  it("falls back to memory when mget fails", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    mockRedisSmembers.mockResolvedValueOnce(["fallback-id"]);
    mockRedisMget.mockRejectedValueOnce(new Error("mget failed"));
    (service as any).memoryLessons.set("fallback-id", {
      id: "fallback-id",
      title: "Fallback",
    });

    const lessons = await service.getLessons();

    expect(lessons.map((l: any) => l.id)).toEqual(["fallback-id"]);

    (service as any).client = null;
  });

  it("checks processed urls in a single smismember call via Redis", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    mockRedisSmismember.mockResolvedValueOnce([1, 0]);

    const flags = await service.areUrlsProcessed([
      "http://a.com",
      "http://b.com",
    ]);

    expect(mockRedisSmismember).toHaveBeenCalledWith(
      "news:processed_articles",
      ["http://a.com", "http://b.com"],
    );
    expect(flags).toEqual([true, false]);

    (service as any).client = null;
  });

  it("falls back to memory when smismember fails, and short-circuits on an empty url list", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    mockRedisSmismember.mockRejectedValueOnce(new Error("smismember failed"));

    expect(await service.areUrlsProcessed([])).toEqual([]);
    expect(await service.areUrlsProcessed(["http://c.com"])).toEqual([false]);

    (service as any).client = null;
  });

  it("looks up a lesson id by url via the url index, backfilling it once from existing lessons", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    // Not migrated yet: backfill scans existing lessons and hsets the index.
    mockRedisGet.mockResolvedValueOnce(null);
    mockRedisSmembers.mockResolvedValueOnce(["legacy-id"]);
    mockRedisMget.mockResolvedValueOnce([
      { id: "legacy-id", url: "http://legacy.com/a" },
    ]);
    mockRedisSet.mockResolvedValue("OK");
    mockRedisHset.mockResolvedValue(1);
    mockRedisHget.mockResolvedValueOnce("legacy-id");

    const id = await service.getLessonIdByUrl("http://legacy.com/a");

    expect(mockRedisHset).toHaveBeenCalledWith("news:url_index", {
      "http://legacy.com/a": "legacy-id",
    });
    expect(mockRedisSet).toHaveBeenCalledWith("news:url_index_backfilled", "1");
    expect(id).toBe("legacy-id");

    // Already migrated: skips the backfill scan entirely.
    mockRedisGet.mockResolvedValueOnce("1");
    mockRedisHget.mockResolvedValueOnce("some-id");
    mockRedisSmembers.mockClear();

    expect(await service.getLessonIdByUrl("http://new.com/a")).toBe("some-id");
    expect(mockRedisSmembers).not.toHaveBeenCalled();

    (service as any).client = null;
  });

  it("returns null and falls back to memory when the url index lookup errors", async () => {
    (service as any).client = null;
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "https://mock-redis.upstash.io",
      upstashRedisRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;
    mockRedisGet.mockRejectedValueOnce(new Error("get failed"));
    mockRedisHget.mockRejectedValueOnce(new Error("hget failed"));

    expect(await service.getLessonIdByUrl("http://err.com")).toBeNull();

    (service as any).client = null;
  });

  it("uses the in-memory url index when Redis is not configured", async () => {
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
      expect(await service.getLessonIdByUrl("http://mem.com/a")).toBeNull();
      await service.saveLesson({
        id: "mem-url-lesson",
        url: "http://mem.com/a",
      } as any);
      expect(await service.getLessonIdByUrl("http://mem.com/a")).toBe(
        "mem-url-lesson",
      );
      await service.deleteLesson("mem-url-lesson", "http://mem.com/a");
      expect(await service.getLessonIdByUrl("http://mem.com/a")).toBeNull();
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  describe("auto-tokenization on save", () => {
    it("tokenizes originalText into a draft when the lesson has no tokens of its own", async () => {
      const draft = [
        {
          surface: "首相",
          reading: "しゅしょう",
          romaji: "shushō",
          partOfSpeech: "noun",
        },
      ];
      mockAnalyzeJapanese.mockResolvedValue(draft);

      const lesson = { id: "a", originalText: "首相は表明した。" } as any;
      await service.saveLesson(lesson);

      expect(mockAnalyzeJapanese).toHaveBeenCalledWith("首相は表明した。");
      expect(lesson.tokens).toEqual(draft);
    });

    it("does not tokenize when originalText is missing", async () => {
      await service.saveLesson({ id: "b" } as any);
      expect(mockAnalyzeJapanese).not.toHaveBeenCalled();
    });

    it("does not overwrite tokens the agent already authored", async () => {
      const authored = [
        {
          surface: "経済対策",
          reading: "けいざいたいさく",
          romaji: "keizaitaisaku",
          partOfSpeech: "noun",
          meaning: "economic policy",
        },
      ];
      const lesson = {
        id: "c",
        originalText: "経済対策を表明した。",
        tokens: authored,
      } as any;

      await service.saveLesson(lesson);

      expect(mockAnalyzeJapanese).not.toHaveBeenCalled();
      expect(lesson.tokens).toBe(authored);
    });

    it("re-tokenizes when the stored tokens array is empty", async () => {
      mockAnalyzeJapanese.mockResolvedValue([]);
      const lesson = {
        id: "d",
        originalText: "日本語。",
        tokens: [],
      } as any;

      await service.saveLesson(lesson);

      expect(mockAnalyzeJapanese).toHaveBeenCalledWith("日本語。");
    });
  });
});
