import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NewsItem } from "~~/types/index";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    geminiApiKey: "test-api-key",
    geminiModel: "gemini-1.5-flash",
    tavilyApiKey: "test-tavily-key",
    public: {
      apiBase: "/api",
    },
  }));
  return { mockUseRuntimeConfig };
});

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

// Mock services with correct method names
const mockTavilySearch = vi.fn();
const mockTavilyFormat = vi.fn();
const mockGeminiCategorize = vi.fn();

vi.mock("~/server/services/tavily", () => ({
  tavilyService: {
    searchJapanNews: mockTavilySearch,
    formatTavilyResultsToNewsItems: mockTavilyFormat,
  },
}));

vi.mock("~/server/services/gemini", () => ({
  geminiService: {
    categorizeNewsItems: mockGeminiCategorize,
  },
}));

describe("News API", () => {
  let handler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;

    const handlerModule = await import("~/server/api/news.get");
    handler = handlerModule.default;
    (global as any).getQuery.mockReturnValue({});
  });

  const createMockNews = (): NewsItem[] => [
    {
      title: "Tech News",
      summary: "Tech Summary",
      content: "Tech Content",
      source: "Tech Source",
      publishedAt: "2024-01-15T10:00:00Z",
      category: "Technology",
      url: "https://example.com",
    },
  ];

  it("returns news successfully with default parameters", async () => {
    (global as any).getQuery.mockReturnValue({});
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue([]);

    const response = await handler({});

    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
    expect(response.count).toBe(0);
    expect(response.timestamp).toBeDefined();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith([], {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
    });
  });

  it("filters news by category", async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "technology" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({});

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith(mockNews, {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
    });
  });

  it("applies limit parameter", async () => {
    const mockNews = Array.from({ length: 5 }, (_, i) => ({
      title: `News ${i}`,
      summary: `Summary ${i}`,
      content: `Content ${i}`,
      source: `Source ${i}`,
      publishedAt: "2024-01-15T10:00:00Z",
      category: "Technology",
      url: `https://example.com/${i}`,
    }));

    (global as any).getQuery.mockReturnValue({ limit: "3" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({});

    expect(response.data).toHaveLength(3);
    expect(response.count).toBe(3);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 3,
      apiKey: "test-tavily-key",
    });
  });

  it("handles invalid limit parameter", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "invalid" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue([]);

    const response = await handler({});

    expect(response.data).toHaveLength(0);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
  });

  it('returns all news when category is "all"', async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "all" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({});

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
  });

  it("handles service errors", async () => {
    const error = new Error("Service error");
    (global as any).getQuery.mockReturnValue({});
    mockTavilySearch.mockRejectedValue(error);

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Service error" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
  });

  it("logs errors in development environment", async () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Dev error");
    (global as any).getQuery.mockReturnValue({});
    mockTavilySearch.mockRejectedValue(error);

    try {
      await handler({});
    } catch {}

    expect(consoleSpy).toHaveBeenCalledWith("News API error:", error);
    consoleSpy.mockRestore();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
  });

  it("handles non-Error objects in error handling", async () => {
    (global as any).getQuery.mockReturnValue({});
    mockTavilySearch.mockRejectedValue("String error message");

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Unknown error occurred" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      apiKey: "test-tavily-key",
    });
  });
});
