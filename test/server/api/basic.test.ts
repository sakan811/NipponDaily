import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

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
      maxResults: 10,
      category: undefined,
      timeRange: "week",
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

  it("formats publishTimeRange using en-US when language param is null/empty", async () => {
    // This test exercises news.get.ts line 208: `if (validatedQuery.language)`
    // When language is null, it transforms to "en" via schema, so we need items with dates
    // to trigger the date formatting code path
    const mockNews = [
      {
        title: "News Item",
        summary: "Summary",
        content: "Content",
        source: "Source",
        publishedAt: "2024-06-15T00:00:00Z",
        category: "Technology",
        url: "https://example.com",
      },
    ];

    // Pass null language — schema transforms it to "en"
    (global as any).getQuery.mockReturnValue({
      language: null,
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue({ sourcesProcessed: [] });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    // publishTimeRange should be formatted using en-US when language resolved to "en"
    expect(typeof response.data.publishTimeRange).toBe("string");
    expect(response.data.publishTimeRange).not.toBe("Recent");
  });
});
