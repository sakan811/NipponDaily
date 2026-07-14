import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/vector
const mockQuery = vi.fn();
const mockUpsert = vi.fn();
const mockRange = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@upstash/vector", () => {
  class Index {
    query = mockQuery;
    upsert = mockUpsert;
    range = mockRange;
    update = mockUpdate;
  }
  return {
    Index,
  };
});

// Mock @google/genai
const mockEmbedContent = vi.fn();
vi.mock("@google/genai", () => {
  class GoogleGenAI {
    models = {
      embedContent: mockEmbedContent,
    };
  }
  return {
    GoogleGenAI,
  };
});

// Mock stories service and dependencies
vi.mock("~/server/services/vector", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/vector")>();
  return actual;
});

describe("UpstashVectorService", () => {
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("~/server/services/vector");
    service = module.upstashVectorService;
  });

  it("returns empty matches array if credentials are not configured", async () => {
    const originalUrl = process.env.UPSTASH_VECTOR_REST_URL;
    const originalToken = process.env.UPSTASH_VECTOR_REST_TOKEN;
    process.env.UPSTASH_VECTOR_REST_URL = "";
    process.env.UPSTASH_VECTOR_REST_TOKEN = "";

    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "",
      upstashVectorRestToken: "",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    try {
      const matches = await service.querySimilarity("test query");
      expect(matches).toEqual([]);
    } finally {
      process.env.UPSTASH_VECTOR_REST_URL = originalUrl;
      process.env.UPSTASH_VECTOR_REST_TOKEN = originalToken;
    }
  });

  it("queries similarity correctly when configured", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
      geminiApiKey: "mock-gemini-key",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const mockVector = Array(1536).fill(0.1);
    mockEmbedContent.mockResolvedValueOnce({
      embeddings: [
        {
          values: mockVector,
        },
      ],
    });

    const mockResults = [
      {
        id: "article-1",
        score: 0.88,
        metadata: { story_id: "story-123", title: "Test Article" },
      },
    ];
    mockQuery.mockResolvedValueOnce(mockResults);

    const matches = await service.querySimilarity("test query", {
      topK: 1,
      namespace: "test-ns",
    });
    expect(matches).toEqual([
      {
        id: "article-1",
        score: 0.88,
        metadata: { story_id: "story-123", title: "Test Article" },
      },
    ]);

    expect(mockEmbedContent).toHaveBeenCalledWith({
      model: "gemini-embedding-2",
      contents: "test query",
      config: {
        outputDimensionality: 1536,
      },
    });

    expect(mockQuery).toHaveBeenCalledWith(
      {
        vector: mockVector,
        topK: 1,
        includeMetadata: true,
        filter: undefined,
      },
      {
        namespace: "test-ns",
      },
    );
  });

  it("upserts articles correctly when configured", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
      geminiApiKey: "mock-gemini-key",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const mockVector = Array(1536).fill(0.1);
    mockEmbedContent.mockResolvedValueOnce({
      embeddings: [
        {
          values: mockVector,
        },
      ],
    });

    mockUpsert.mockResolvedValueOnce(["id-123"]);

    const success = await service.upsertArticle(
      "id-123",
      "text contents",
      {
        story_id: "story-1",
      },
      { namespace: "test-ns" },
    );

    expect(success).toBe(true);
    expect(mockEmbedContent).toHaveBeenCalledWith({
      model: "gemini-embedding-2",
      contents: "text contents",
      config: {
        outputDimensionality: 1536,
      },
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        id: "id-123",
        vector: mockVector,
        metadata: { story_id: "story-1" },
      },
      {
        namespace: "test-ns",
      },
    );
  });

  it("fetches all articles with pagination", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    mockRange
      .mockResolvedValueOnce({
        nextCursor: "cursor-1",
        vectors: [{ id: "art-1", metadata: { story_id: "story-1" } }],
      })
      .mockResolvedValueOnce({
        nextCursor: "",
        vectors: [{ id: "art-2", metadata: { story_id: "story-2" } }],
      });

    const articles = await service.getAllArticles();
    expect(articles).toEqual([
      { id: "art-1", score: 1, metadata: { story_id: "story-1" } },
      { id: "art-2", score: 1, metadata: { story_id: "story-2" } },
    ]);
    expect(mockRange).toHaveBeenCalledTimes(2);
  });

  it("updates article story association", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    mockUpdate.mockResolvedValueOnce({ updated: 1 });

    const success = await service.updateArticleStory("https://example.com/article", "story-new");
    expect(success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      id: expect.any(String),
      metadata: { story_id: "story-new" },
      metadataUpdateMode: "PATCH",
    });
  });
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
        regionBreakdown: {},
      };

      // Should save and retrieve from memory Map
      await service.saveStory(mockStory as any);
      const retrieved = await service.getStory("mem-story");
      expect(retrieved).toEqual(mockStory);

      const ids = await service.getStoryIds();
      expect(ids).toContain("mem-story");
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("deletes story from memory fallback when Redis is not configured", async () => {
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
        id: "delete-me-story",
        headline: "Delete Me",
        sources: [],
        regionBreakdown: {},
      };

      await service.saveStory(mockStory as any);
      await service.deleteStory("delete-me-story");
      const retrieved = await service.getStory("delete-me-story");
      expect(retrieved).toBeNull();
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });

  it("clears all stories from memory fallback when Redis is not configured", async () => {
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
      const mockStory1 = { id: "story-c1", headline: "Story 1", sources: [], regionBreakdown: {} };
      const mockStory2 = { id: "story-c2", headline: "Story 2", sources: [], regionBreakdown: {} };

      await service.saveStory(mockStory1 as any);
      await service.saveStory(mockStory2 as any);
      await service.clearAllStories();

      const ids = await service.getStoryIds();
      expect(ids).toEqual([]);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    }
  });
});
