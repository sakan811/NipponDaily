import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  getHandler,
  setupDefaults,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

import { storiesService } from "~/server/services/stories";

vi.mock("~/server/services/stories", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/stories")>();
  return {
    ...actual,
    storiesService: {
      getLastIngestTime: vi.fn(),
      getStoryIds: vi.fn(),
      getStories: vi.fn(),
    },
  };
});

describe("News API - Basic Functionality", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("returns news successfully with default parameters", async () => {
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue({});

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual({ publishTimeRange: "Recent" });
    expect(response.count).toBe(0);
    expect(response.timestamp).toBeDefined();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 20,
      category: undefined,
      timeRange: "week",
      startDate: undefined,
      endDate: undefined,
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith([], {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "en",
    });
  });

  it("returns success response with correct structure", async () => {
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue({});

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("count");
    expect(response).toHaveProperty("timestamp");
    expect(typeof response.timestamp).toBe("string");
  });

  it("handles null parameters by coalescing to undefined or defaults", async () => {
    (global as any).getQuery.mockReturnValue({
      category: null,
      timeRange: null,
      startDate: null,
      endDate: null,
      language: null,
      limit: 5,
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue({});

    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 5,
      category: undefined,
      timeRange: "week",
      startDate: undefined,
      endDate: undefined,
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith([], {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "en",
    });
  });

  it("handles getQuery error fallback to node req url parsing", async () => {
    (global as any).getQuery.mockImplementation(() => {
      throw new Error("getQuery not available");
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue({});

    const response = await handler({
      path: "/api/news?limit=10",
      node: {
        req: {
          url: "/api/news?limit=10",
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
  });

  it("executes production story database path when TEST_DB_MODE is true", async () => {
    const origDbMode = process.env.TEST_DB_MODE;
    process.env.TEST_DB_MODE = "true";

    vi.mocked(storiesService.getLastIngestTime).mockResolvedValue(0);
    vi.mocked(storiesService.getStoryIds).mockResolvedValue([]);
    vi.mocked(storiesService.getStories).mockResolvedValue([
      {
        id: "prod-story-1",
        headline: "Production Story 1",
        summary: "Production Summary 1",
        thematicAnalysis: "Thematic 1",
        articleCount: 2,
        firstSeen: Date.now() - 86400000,
        lastUpdated: Date.now(),
        trendScore: 5,
        isSummarized: true,
        sources: [
          {
            title: "Article A",
            source: "NHK",
            url: "https://example.com/a",
            publishedAt: "2026-07-28T00:00:00Z",
            credibilityScore: 0.9,
          },
        ],
        categories: ["tech"],
      },
    ]);

    (global as any).getQuery.mockReturnValue({
      category: "tech",
      timeRange: "month",
    });

    try {
      const response = await handler({
        waitUntil: vi.fn(),
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.stories).toHaveLength(1);
    } finally {
      process.env.TEST_DB_MODE = origDbMode;
    }
  });

  it("handles empty stories fallback in production mode", async () => {
    const origDbMode = process.env.TEST_DB_MODE;
    process.env.TEST_DB_MODE = "true";

    vi.mocked(storiesService.getLastIngestTime).mockResolvedValue(Date.now());
    vi.mocked(storiesService.getStoryIds).mockResolvedValue(["story-1"]);
    vi.mocked(storiesService.getStories).mockResolvedValue([]);

    (global as any).getQuery.mockReturnValue({});

    try {
      const response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.mainHeadline).toBe("Latest Japan News Briefing");
      expect(response.data.executiveSummary).toContain(
        "No news stories are currently available",
      );
    } finally {
      process.env.TEST_DB_MODE = origDbMode;
    }
  });
});
