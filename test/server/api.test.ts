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
    (global as any).getQuery.mockReturnValue({ language: "English" });
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
    (global as any).getQuery.mockReturnValue({ language: "English" });
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
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith([], {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "English",
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
      category: undefined,
      timeRange: "week",
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
      category: undefined,
      timeRange: "week",
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
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles service errors", async () => {
    const error = new Error("Service error");
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue(error);

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Service error" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("logs errors in development environment", async () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Dev error");
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue(error);

    try {
      await handler({});
    } catch {
      // Expected error - no action needed
    }

    expect(consoleSpy).toHaveBeenCalledWith("News API error:", error);
    consoleSpy.mockRestore();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles non-Error objects in error handling", async () => {
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue("String error message");

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Unknown error occurred" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("sorts news by published date in descending order", async () => {
    const mockNews = [
      {
        title: "Old News",
        summary: "Old Summary",
        content: "Old Content",
        source: "Old Source",
        publishedAt: "2024-01-01T00:00:00Z",
        category: "Other",
        url: "https://example.com/old",
      },
      {
        title: "New News",
        summary: "New Summary",
        content: "New Content",
        source: "New Source",
        publishedAt: "2024-12-01T00:00:00Z",
        category: "Technology",
        url: "https://example.com/new",
      },
      {
        title: "Middle News",
        summary: "Middle Summary",
        content: "Middle Content",
        source: "Middle Source",
        publishedAt: "2024-06-01T00:00:00Z",
        category: "Business",
        url: "https://example.com/middle",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({});

    expect(response.data).toHaveLength(3);
    expect(response.data[0].publishedAt).toBe("2024-12-01T00:00:00Z");
    expect(response.data[1].publishedAt).toBe("2024-06-01T00:00:00Z");
    expect(response.data[2].publishedAt).toBe("2024-01-01T00:00:00Z");
  });

  it("handles invalid dates by treating them as oldest", async () => {
    const mockNews = [
      {
        title: "Invalid Date",
        summary: "Invalid Summary",
        content: "Invalid Content",
        source: "Invalid Source",
        publishedAt: "invalid-date",
        category: "Other",
        url: "https://example.com/invalid",
      },
      {
        title: "Valid News",
        summary: "Valid Summary",
        content: "Valid Content",
        source: "Valid Source",
        publishedAt: "2024-12-01T00:00:00Z",
        category: "Technology",
        url: "https://example.com/valid",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({});

    expect(response.data).toHaveLength(2);
    expect(response.data[0].publishedAt).toBe("2024-12-01T00:00:00Z");
    expect(response.data[1].publishedAt).toBe("invalid-date");
  });
});
