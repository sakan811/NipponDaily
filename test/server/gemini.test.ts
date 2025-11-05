import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NewsItem } from "~~/types/index";
import { mockGenerateContent } from "../setup";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    geminiApiKey: "test-api-key",
    geminiModel: "gemini-1.5-flash",
  }));
  return { mockUseRuntimeConfig };
});

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

describe("GeminiService", () => {
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import("~/server/services/gemini");
    service = module.geminiService;
  });

  const createMockNews = (): NewsItem[] => [
    {
      title: "Tech News",
      summary: "Tech Summary",
      content: "Tech Content",
      source: "Tech Source",
      publishedAt: "2024-01-15T10:00:00Z",
      category: "Other",
    },
  ];

  describe("categorizeNewsItems", () => {
    it("categorizes news items successfully", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
        model: "gemini-1.5-flash",
      });

      expect(result[0].category).toBe("Technology");
      expect(result[0].summary).toBe("Test summary");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("returns original items when client is not initialized", async () => {
      const module = await import("~/server/services/gemini");
      const serviceWithoutClient = new module.GeminiService();

      const mockNews = createMockNews();
      const result = await serviceWithoutClient.categorizeNewsItems(mockNews);

      expect(result).toEqual(
        mockNews.map((item) => ({
          ...item,
          category: "Other",
          summary: item.summary || item.content,
        })),
      );
    });

    it("returns empty array for empty input", async () => {
      const result = await service.categorizeNewsItems([], {
        apiKey: "test-api-key",
      });

      expect(result).toEqual([]);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it("handles malformed Gemini response", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: "invalid json response",
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].category).toBe("Other");
    });

    it("handles API errors gracefully", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].category).toBe("Other");
    });

    it("validates and normalizes category names", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "technology", "summary": "Test summary"}]', // lowercase
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].category).toBe("Technology");
    });

    it('defaults to "Other" for invalid categories', async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "InvalidCategory", "summary": "Test summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].category).toBe("Other");
    });

    it("logs warning when API key is not configured during initialization", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const module = await import("~/server/services/gemini");
      const serviceWithoutClient = new module.GeminiService();

      // Call initializeClient without API key to trigger the warning
      serviceWithoutClient["initializeClient"]();

      expect(consoleSpy).toHaveBeenCalledWith("GEMINI_API_KEY not configured");
      consoleSpy.mockRestore();
    });

    it("logs warning when JSON parsing fails", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockNews = createMockNews();

      // Mock response with valid JSON array structure but invalid JSON content
      // This will match the regex but fail JSON.parse()
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary", "invalid": json}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to parse categories and summaries from Gemini response:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('returns "Other" for falsy or non-string categories in validateCategory', async () => {
      const mockNews = createMockNews();
      // Mock response with null category to trigger validateCategory with falsy value
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": null, "summary": "Test summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].category).toBe("Other");
    });

    it("processes successful Gemini response with full coverage flow", async () => {
      const mockNews = [
        {
          title: "Japan Tech News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "Detailed raw content about technology in Japan",
          source: "Tech Source Japan",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
        {
          title: "Business News",
          summary: "Business summary",
          content: "Business content",
          source: "Business Source",
          publishedAt: "2024-01-15T11:00:00Z",
          category: "Other",
        },
      ];

      // Mock successful response that goes through the complete flow
      mockGenerateContent.mockResolvedValue({
        text: `Here are the categorized articles:
[{"category": "Technology", "summary": "Japan launches new AI initiative for technological advancement"}, {"category": "Business", "summary": "Major corporation announces record quarterly earnings"}]`,
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
        model: "gemini-2.5-flash",
      });

      // Verify the complete flow was executed
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("Technology");
      expect(result[0].summary).toBe(
        "Japan launches new AI initiative for technological advancement",
      );
      expect(result[0].content).toBe(
        "Japan launches new AI initiative for technological advancement",
      );
      expect(result[1].category).toBe("Business");
      expect(result[1].summary).toBe(
        "Major corporation announces record quarterly earnings",
      );
      expect(result[1].content).toBe(
        "Major corporation announces record quarterly earnings",
      );

      // Verify the mock was called with the expected parameters
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: "gemini-2.5-flash",
        contents: expect.stringContaining("Japan Tech News"),
      });
    });

    it("falls back to basic summary from rawContent when AI fails", async () => {
      const mockNews = [
        {
          title: "Japan Technology News",
          summary: "Brief summary",
          content: "Brief content",
          rawContent:
            "Japan has announced a major investment in artificial intelligence technology. The government plans to allocate $2 billion over the next five years to develop AI capabilities across various industries including healthcare, manufacturing, and transportation. This initiative aims to position Japan as a global leader in AI innovation and economic growth.",
          source: "Tech Source Japan",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Mock Gemini API to return a response that will fail JSON parsing
      mockGenerateContent.mockResolvedValue({
        text: "Invalid JSON response that will cause parsing to fail",
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to basic summary from rawContent
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Other");
      expect(result[0].summary).toContain(
        "Japan has announced a major investment in artificial intelligence",
      );
      expect(result[0].content).toContain(
        "Japan has announced a major investment in artificial intelligence",
      );
    });

    it("prioritizes AI-generated summaries over rawContent when AI succeeds", async () => {
      const mockNews = [
        {
          title: "Japan Technology News",
          summary: "Brief summary",
          content: "Brief content",
          rawContent:
            "Japan has announced a major investment in artificial intelligence technology. The government plans to allocate $2 billion over the next five years to develop AI capabilities across various industries including healthcare, manufacturing, and transportation. This initiative aims to position Japan as a global leader in AI innovation and economic growth.",
          source: "Tech Source Japan",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Mock successful Gemini API response
      mockGenerateContent.mockResolvedValue({
        text: `[{"category": "Technology", "summary": "Japan invests $2 billion in AI to boost technological leadership across key industries"}]`,
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should use AI-generated summary, not rawContent
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Technology");
      expect(result[0].summary).toBe(
        "Japan invests $2 billion in AI to boost technological leadership across key industries",
      );
      expect(result[0].content).toBe(
        "Japan invests $2 billion in AI to boost technological leadership across key industries",
      );
    });

    it("handles empty rawContent in createBasicSummary", async () => {
      // Test the private createBasicSummary method directly
      const result = service["createBasicSummary"]("");

      expect(result).toBe("No content available");
    });

    it("handles whitespace-only rawContent in createBasicSummary", async () => {
      // Test the private createBasicSummary method directly with whitespace
      const result = service["createBasicSummary"]("   \n\t   ");

      expect(result).toBe("No content available");
    });
  });
});
