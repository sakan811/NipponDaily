import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockNews,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

describe("News API - Category Filter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("filters news by category", async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "technology" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: "technology",
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith(mockNews, {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "English",
    });
  });

  it('returns all news when category is "all"', async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "all" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles empty category string", async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({
      category: "",
      language: "English",
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles category with only whitespace", async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({
      category: "   ",
      language: "English",
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });
});
