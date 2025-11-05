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

    it("creates news text mapping with various content scenarios", async () => {
      const mockNewsWithContent = [
        {
          title: "News with rawContent",
          summary: "Original summary",
          content: "Original content",
          rawContent: "Detailed raw content with full article text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
        {
          title: "News without rawContent",
          summary: "News summary",
          content: "News content",
          rawContent: undefined,
          source: "Test Source 2",
          publishedAt: "2024-01-15T11:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Tech summary"}, {"category": "Business", "summary": "Business summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNewsWithContent, {
        apiKey: "test-api-key",
      });

      // Verify the result was processed successfully
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("Technology");
      expect(result[1].category).toBe("Business");

      // Verify the prompt was created and called with expected content structure
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe("gemini-2.5-flash");
      expect(callArgs.contents).toContain("News with rawContent");
      expect(callArgs.contents).toContain("Detailed raw content with full article text");
      expect(callArgs.contents).toContain("News without rawContent");
      expect(callArgs.contents).toContain("News content"); // This is what gets used when rawContent is undefined
    });

    it("handles AI summary validation and assignment logic", async () => {
      const mockNews = createMockNews();

      // Test with empty AI summary
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": ""}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to original summary/content when AI summary is empty
      expect(result[0].summary).toBe("Tech Summary");
      expect(result[0].content).toBe("Tech Summary");
    });

    it("handles AI summary with whitespace only", async () => {
      const mockNews = createMockNews();

      // Test with whitespace-only AI summary
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "   \n\t   "}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to original summary/content when AI summary is whitespace only
      expect(result[0].summary).toBe("Tech Summary");
      expect(result[0].content).toBe("Tech Summary");
    });

    it("creates basic summary from rawContent when JSON parsing fails", async () => {
      const mockNewsWithRawContent = [
        {
          title: "Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "This is a long article with multiple sentences. It contains important information. The article continues with more details about the situation.",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Force JSON parsing to fail
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary", "invalid": json}]',
      });

      const result = await service.categorizeNewsItems(mockNewsWithRawContent, {
        apiKey: "test-api-key",
      });

      // Should use basic summary from rawContent
      expect(result[0].summary).toContain("This is a long article with multiple sentences");
      expect(result[0].content).toContain("This is a long article with multiple sentences");
    });

    it("handles error fallback with rawContent processing", async () => {
      const mockNewsWithRawContent = [
        {
          title: "Error Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "Detailed article content that should be used when API fails. This provides enough text for testing the error handling path.",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "InvalidCategory",
        },
      ];

      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNewsWithRawContent, {
        apiKey: "test-api-key",
      });

      // Should use rawContent for summary and validate category in error path
      expect(result[0].summary).toContain("Detailed article content that should be used");
      expect(result[0].content).toContain("Detailed article content that should be used");
      expect(result[0].category).toBe("Other"); // InvalidCategory should be normalized to Other
    });

    it("processes sentence matching in createBasicSummary", async () => {
      // Test content with clear sentence structure
      const contentWithSentences = "First sentence. Second sentence! Third sentence? Fourth sentence.";
      const result = service["createBasicSummary"](contentWithSentences);

      expect(result).toBe("First sentence. Second sentence! Third sentence?");
    });

    it("handles final fallback in createBasicSummary", async () => {
      // Test content without sentence punctuation (should use substring fallback)
      const contentWithoutSentences = "This is a very long piece of text that has no sentence punctuation marks at all and should trigger the final fallback mechanism that takes the first 200 characters";
      const result = service["createBasicSummary"](contentWithoutSentences);

      // The result should be the full string since it's less than 200 characters and has no sentence punctuation
      expect(result).toBe(contentWithoutSentences);
      expect(result).toHaveLength(163);
    });

    it("handles content that exceeds both character and sentence limits", async () => {
      // Test content that exceeds both 200 characters and 3 sentences
      const longContent = "First sentence with some text. Second sentence with more text to make it longer. Third sentence with even more text. Fourth sentence that should not be included. Fifth sentence that should definitely not be included either.";
      const result = service["createBasicSummary"](longContent);

      // Should include first 3 sentences (under 200 chars) or stop at 200 chars
      expect(result.length).toBeLessThanOrEqual(200);
      expect(result).toContain("First sentence");
      expect(result).toContain("Second sentence");
      expect(result).toContain("Third sentence");
      expect(result).not.toContain("Fourth sentence");
    });

    it("covers line 118 fallback summary assignment when JSON parsing fails", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "Detailed article content for testing fallback behavior",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Force JSON parsing to fail to trigger fallback at line 108-119
      mockGenerateContent.mockResolvedValue({
        text: "Response without valid JSON array",
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Line 118: Should use createBasicSummary from rawContent in fallback path
      expect(result[0].summary).toContain("Detailed article content for testing");
      expect(result[0].content).toContain("Detailed article content for testing");
    });

    it("covers lines 129 and 133 in error handling fallback", async () => {
      const mockNews = [
        {
          title: "Error Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "Content for error handling test with sufficient length",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Force API error to trigger error handling at lines 120-134
      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Line 129: Should use createBasicSummary from rawContent in error path
      expect(result[0].summary).toContain("Content for error handling test");
      // Line 133: Should use createBasicSummary from rawContent in error path
      expect(result[0].content).toContain("Content for error handling test");
    });

    it("covers line 164 final substring fallback in createBasicSummary", async () => {
      // Test content that triggers the final substring fallback at line 164
      const veryLongContent = "This is a very long piece of text that goes on and on without any sentence punctuation so it will eventually exceed the 200 character limit and trigger the final substring fallback mechanism at line 164 which returns cleanContent.substring(0, 200).trim() when no sentences are found or the content is too long.";
      const result = service["createBasicSummary"](veryLongContent);

      // Line 164: Should trigger the final substring fallback - the result should be processed by sentence matching first
      // Since the content is very long without sentence punctuation, it should use the sentence regex matching first
      expect(result).toContain("This is a very long piece of text that goes on and on without any sentence punctuation");
      expect(result.length).toBeGreaterThan(100);
    });

    it("covers lines 114 and 118 fallback when no rawContent in JSON parsing failure", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent: "", // Empty rawContent
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Force JSON parsing to fail to trigger fallback at line 108-119
      mockGenerateContent.mockResolvedValue({
        text: "Response without valid JSON array",
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Lines 114 and 118: Should use summary/content when rawContent is empty
      expect(result[0].summary).toBe("Original summary");
      expect(result[0].content).toBe("Original summary"); // Both get set to summary when rawContent is empty
    });

    it("covers lines 129 and 133 fallback when no rawContent in error handling", async () => {
      const mockNews = [
        {
          title: "Error Test News",
          summary: "Error summary",
          content: "Error content",
          rawContent: null, // No rawContent
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Force API error to trigger error handling at lines 120-134
      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Lines 129 and 133: Should use summary/content when rawContent is null
      expect(result[0].summary).toBe("Error summary");
      expect(result[0].content).toBe("Error summary"); // Both get set to summary when rawContent is null
    });
  });
});
