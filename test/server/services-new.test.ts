import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock stories service and dependencies
vi.mock("~/server/services/vector", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/server/services/vector")>();
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
    // Override config
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "",
      upstashVectorRestToken: "",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const matches = await service.querySimilarity("test query");
    expect(matches).toEqual([]);
  });

  it("queries similarity correctly when configured", async () => {
    // Set config
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const mockResponse = {
      result: [
        {
          id: "article-1",
          score: 0.88,
          metadata: { story_id: "story-123", title: "Test Article" },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const matches = await service.querySimilarity("test query", { topK: 1 });
    expect(matches).toEqual(mockResponse.result);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://mock-vector.upstash.io/query",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });

  it("upserts articles correctly when configured", async () => {
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashVectorRestUrl: "https://mock-vector.upstash.io",
      upstashVectorRestToken: "mock-token",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });

    const success = await service.upsertArticle("id-123", "text contents", {
      story_id: "story-1",
    });

    expect(success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://mock-vector.upstash.io/upsert-data",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify([
          {
            id: "id-123",
            data: "text contents",
            metadata: { story_id: "story-1" },
          },
        ]),
      })
    );
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
    const mockUseRuntimeConfig = vi.fn(() => ({
      upstashRedisRestUrl: "",
      upstashRedisRestToken: "",
    }));
    (global as any).useRuntimeConfig = mockUseRuntimeConfig;

    const mockStory = {
      id: "mem-story",
      headlineEn: "Mem Story Headline",
      headlineJa: "Mem Story Headline",
      sources: [],
      regionBreakdown: {},
    };

    // Should save and retrieve from memory Map
    await service.saveStory(mockStory as any);
    const retrieved = await service.getStory("mem-story");
    expect(retrieved).toEqual(mockStory);

    const ids = await service.getStoryIds();
    expect(ids).toContain("mem-story");
  });
});
