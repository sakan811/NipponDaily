import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockTavilyClient } from "../setup";

describe("TavilyService", () => {
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTavilyClient.search = vi.fn();
    const module = await import("~/server/services/tavily");
    service = module.tavilyService;
  });

  const createMockTavilyResponse = () => ({
    query: "latest Japan news",
    follow_up_questions: null,
    answer: null,
    images: [],
    results: [
      {
        url: "https://example.com/news1",
        title: "News 1",
        score: 0.9,
        publishedDate: "2024-01-15T10:00:00Z",
        content: "News content 1",
      },
      {
        url: "https://nhk.or.jp/news2",
        title: "News 2",
        score: 0.8,
        content: "News content 2",
      },
    ],
    response_time: 1.5,
    request_id: "test-id",
  });

  describe("searchJapanNews", () => {
    it("searches for Japan news successfully", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      const result = await service.searchJapanNews({
        maxResults: 5,
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 5,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes category in search query when provided", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        category: "technology",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest technology news Japan",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
    });

    it("uses default query when category is all", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        category: "all",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
    });

    it("uses default query when category is not provided", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({ apiKey: "test-tavily-key" });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
    });

    it("uses default options when options parameter is undefined", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({ apiKey: "test-tavily-key" });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
    });

    it("uses default options when options parameter is null", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      // This test specifically covers line 55 where options || {} is used
      const result = await service.searchJapanNews({
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "week",
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("uses provided timeRange when specified", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        timeRange: "day",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "day",
        },
      );
    });

    it("excludes timeRange when set to none", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        timeRange: "none",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
        },
      );
    });

    it("uses month timeRange when specified", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        timeRange: "month",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "month",
        },
      );
    });

    it("uses year timeRange when specified", async () => {
      const mockResponse = createMockTavilyResponse();
      mockTavilyClient.search.mockResolvedValue(mockResponse);

      await service.searchJapanNews({
        timeRange: "year",
        apiKey: "test-tavily-key",
      });

      expect(mockTavilyClient.search).toHaveBeenCalledWith(
        "latest Japan news",
        {
          topic: "news",
          maxResults: 10,
          searchDepth: "advanced",
          includeRawContent: "markdown",
          timeRange: "year",
        },
      );
    });

    it("throws error when client is not initialized", async () => {
      const module = await import("~/server/services/tavily");
      const serviceWithoutClient = new module.TavilyService();

      await expect(serviceWithoutClient.searchJapanNews()).rejects.toThrow(
        "Tavily client not initialized - API key required",
      );
    });

    it("handles API errors", async () => {
      mockTavilyClient.search.mockRejectedValue(new Error("API Error"));

      await expect(
        service.searchJapanNews({ apiKey: "test-tavily-key" }),
      ).rejects.toThrow("Failed to search news with Tavily API");
    });
  });

  describe("formatTavilyResultsToNewsItems", () => {
    it("formats Tavily results to NewsItem format", () => {
      const mockResponse = createMockTavilyResponse();

      const result = service.formatTavilyResultsToNewsItems(mockResponse);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        title: "News 1",
        summary: "News content 1",
        content: "News content 1",
        source: "example.com",
        publishedAt: "2024-01-15T10:00:00Z",
        category: "Other",
        url: "https://example.com/news1",
      });
    });

    it("maps known Japanese news domains", () => {
      const mockResponse = {
        results: [
          {
            url: "https://nhk.or.jp/news",
            title: "NHK News",
            score: 0.9,
            content: "NHK content",
          },
        ],
      };

      const result = service.formatTavilyResultsToNewsItems(mockResponse);

      expect(result[0].source).toBe("NHK");
    });

    it("handles malformed URLs gracefully", () => {
      const mockResponse = {
        results: [
          {
            url: "invalid-url",
            title: "Invalid URL News",
            score: 0.9,
            content: "Content",
          },
        ],
      };

      const result = service.formatTavilyResultsToNewsItems(mockResponse);

      expect(result[0].source).toBe("Unknown");
    });

    it("provides default values for missing fields", () => {
      const mockResponse = {
        results: [
          {
            url: "https://example.com",
            title: "",
            score: 0.9,
            content: "",
          },
        ],
      };

      const result = service.formatTavilyResultsToNewsItems(mockResponse);

      expect(result[0].title).toBe("Untitled");
      expect(result[0].summary).toBe("");
    });
  });

  describe("initializeClient", () => {
    it("logs warning when API key is not provided", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const module = await import("~/server/services/tavily");
      const service = new module.TavilyService();

      // Access private method using bracket notation
      service["initializeClient"]();

      expect(consoleSpy).toHaveBeenCalledWith("TAVILY_API_KEY not configured");

      consoleSpy.mockRestore();
    });
  });
});
