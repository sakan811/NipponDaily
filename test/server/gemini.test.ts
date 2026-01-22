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
        text: '[{"category": "Technology", "translatedTitle": "Test News (Translated)", "summary": "Test summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
        model: "gemini-1.5-flash",
      });

      expect(result[0].category).toBe("Technology");
      expect(result[0].title).toBe("Test News (Translated)");
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

      await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to parse structured response from Gemini:",
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
        text: `[{"category": "Technology", "translatedTitle": "Japan Tech News", "summary": "Japan launches new AI initiative for technological advancement"}, {"category": "Business", "translatedTitle": "Business News", "summary": "Major corporation announces record quarterly earnings"}]`,
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
        config: expect.objectContaining({
          responseMimeType: "application/json",
          responseSchema: expect.objectContaining({
            type: "ARRAY",
          }),
        }),
      });
    });

    it("falls back to fallback message when AI fails", async () => {
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

      // Should fall back to fallback message
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Other");
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
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
      expect(callArgs.contents).toContain(
        "Detailed raw content with full article text",
      );
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

      // Test with whitespace-only AI summary (using escaped newlines for valid JSON)
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "      "}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to original summary/content when AI summary is whitespace only
      expect(result[0].summary).toBe("Tech Summary");
      expect(result[0].content).toBe("Tech Summary");
    });

    it("falls back to item.summary when aiSummary is empty string", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Original Summary Text",
          content: "Original Content Text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Mock AI response with empty summary (after trim becomes falsy)
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": ""}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Lines 180-181: should fall back to item.summary when aiSummary is empty
      expect(result[0].summary).toBe("Original Summary Text");
      expect(result[0].content).toBe("Original Summary Text");
    });

    it("falls back to item.content when both aiSummary and item.summary are empty", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "",
          content: "Fallback Content Text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Mock AI response with empty summary
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": ""}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Lines 180-181: should fall back to item.content when both aiSummary and item.summary are empty
      expect(result[0].summary).toBe("Fallback Content Text");
      expect(result[0].content).toBe("Fallback Content Text");
    });

    it("uses aiSummary when it is truthy and non-empty", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Original Summary",
          content: "Original Content",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      // Mock AI response with valid summary
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "AI Generated Summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Lines 180-181: should use aiSummary when it's truthy
      expect(result[0].summary).toBe("AI Generated Summary");
      expect(result[0].content).toBe("AI Generated Summary");
    });

    it("returns fallback message when JSON parsing fails", async () => {
      const mockNewsWithRawContent = [
        {
          title: "Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent:
            "This is a long article with multiple sentences. It contains important information. The article continues with more details about the situation.",
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

      // Should use fallback message
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
    });

    it("handles error fallback with fallback message", async () => {
      const mockNewsWithRawContent = [
        {
          title: "Error Test News",
          summary: "Original summary",
          content: "Original content",
          rawContent:
            "Detailed article content that should be used when API fails. This provides enough text for testing the error handling path.",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "InvalidCategory",
        },
      ];

      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNewsWithRawContent, {
        apiKey: "test-api-key",
      });

      // Should use fallback message and validate category in error path
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].category).toBe("Other"); // InvalidCategory should be normalized to Other
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

      // Should use fallback message in fallback path
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
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

      // Should use fallback message in error path
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
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

      // Should use fallback message
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
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

      // Should use fallback message
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
    });

    it("handles response.text when it's undefined", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: undefined,
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to fallback message when response.text is undefined
      expect(result[0].category).toBe("Other");
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
    });

    it("handles response.text when it's an empty string", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: "",
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      // Should fall back to fallback message when response.text is empty
      expect(result[0].category).toBe("Other");
      expect(result[0].summary).toBe(
        "No summary available. Read full article at source.",
      );
      expect(result[0].content).toBe(
        "No summary available. Read full article at source.",
      );
    });

    it("processes credibility scores from AI response", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "AI summary", "sourceReputation": 0.9, "domainTrust": 0.8, "contentQuality": 0.7, "aiConfidence": 0.8}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].credibilityScore).toBeDefined();
      expect(result[0].credibilityScore).toBeCloseTo(0.81, 2); // (0.9*0.3)+(0.8*0.3)+(0.7*0.2)+(0.8*0.2) = 0.27+0.24+0.14+0.16 = 0.81
      expect(result[0].credibilityMetadata).toEqual({
        sourceReputation: 0.9,
        domainTrust: 0.8,
        contentQuality: 0.7,
        aiConfidence: 0.8,
      });
    });

    it("handles missing credibility scores with defaults", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "AI summary"}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].credibilityScore).toBeDefined();
      expect(result[0].credibilityScore).toBeCloseTo(0.5, 2); // (0.5*0.3)+(0.5*0.3)+(0.5*0.2)+(0.5*0.2) = 0.15+0.15+0.1+0.1 = 0.5
      expect(result[0].credibilityMetadata).toEqual({
        sourceReputation: 0.5,
        domainTrust: 0.5,
        contentQuality: 0.5,
        aiConfidence: 0.5,
      });
    });

    it("clamps credibility scores to 0-1 range", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "AI summary", "sourceReputation": 1.5, "domainTrust": -0.2, "contentQuality": 2, "aiConfidence": 0}]',
      });

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].credibilityMetadata).toEqual({
        sourceReputation: 1, // Clamped to 1
        domainTrust: 0, // Clamped to 0
        contentQuality: 1, // Clamped to 1
        aiConfidence: 0, // Already valid
      });
    });

    it("provides default credibility scores when AI fails", async () => {
      const mockNews = createMockNews();
      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: "test-api-key",
      });

      expect(result[0].credibilityScore).toBeDefined();
      expect(result[0].credibilityMetadata).toBeDefined();
      expect(result[0].credibilityMetadata!.aiConfidence).toBe(0.3); // Lower confidence when AI fails
    });
  });

  describe("newsText mapping", () => {
    it("creates newsText with rawContent prioritized", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Test summary",
          content: "Test content",
          rawContent: "Raw content with full text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary"}]',
      });

      await service.categorizeNewsItems(mockNews, { apiKey: "test-api-key" });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("1. Title: Test News");
      expect(callArgs.contents).toContain(
        "Content: Raw content with full text",
      );
      expect(callArgs.contents).toContain("Source: Test Source");
    });

    it("creates newsText with content fallback when no rawContent", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Test summary",
          content: "Content fallback text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary"}]',
      });

      await service.categorizeNewsItems(mockNews, { apiKey: "test-api-key" });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("1. Title: Test News");
      expect(callArgs.contents).toContain("Content: Content fallback text");
      expect(callArgs.contents).toContain("Source: Test Source");
    });

    it("creates newsText with summary fallback when no content or rawContent", async () => {
      const mockNews = [
        {
          title: "Test News",
          summary: "Summary fallback text",
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary"}]',
      });

      await service.categorizeNewsItems(mockNews, { apiKey: "test-api-key" });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("1. Title: Test News");
      expect(callArgs.contents).toContain("Content: Summary fallback text");
      expect(callArgs.contents).toContain("Source: Test Source");
    });

    it("creates newsText with multiple items separated by double newlines", async () => {
      const mockNews = [
        {
          title: "First News",
          summary: "First summary",
          content: "First content",
          source: "Source 1",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
        {
          title: "Second News",
          summary: "Second summary",
          content: "Second content",
          source: "Source 2",
          publishedAt: "2024-01-15T11:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "First"}, {"category": "Business", "summary": "Second"}]',
      });

      await service.categorizeNewsItems(mockNews, { apiKey: "test-api-key" });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("1. Title: First News");
      expect(callArgs.contents).toContain("Content: First content");
      expect(callArgs.contents).toContain("Source: Source 1");
      expect(callArgs.contents).toContain("2. Title: Second News");
      expect(callArgs.contents).toContain("Content: Second content");
      expect(callArgs.contents).toContain("Source: Source 2");
      expect(callArgs.contents).toContain("\n\n"); // Double newline separator
    });

    it("handles newsText mapping with null/undefined content values", async () => {
      const mockNews = [
        {
          title: "News with nulls",
          summary: null,
          content: undefined,
          source: "Test Source",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Other",
        },
      ];

      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Other", "summary": "Fallback summary"}]',
      });

      await service.categorizeNewsItems(mockNews, { apiKey: "test-api-key" });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("1. Title: News with nulls");
      expect(callArgs.contents).toContain("Content: ");
      expect(callArgs.contents).toContain("Source: Test Source");
    });
  });

  describe("getDomainTrustScore", () => {
    it("returns high scores for trusted Japanese news domains", () => {
      // Test just one domain first to isolate the issue
      const score = service["getDomainTrustScore"]("https://nhk.or.jp/news");
      expect(score).toBe(0.95);

      // Then test others
      expect(service["getDomainTrustScore"]("https://www.nikkei.com")).toBe(
        0.95,
      );
      expect(service["getDomainTrustScore"]("https://japantimes.co.jp")).toBe(
        0.9,
      );
      expect(service["getDomainTrustScore"]("https://www.asahi.com")).toBe(0.9);
      expect(service["getDomainTrustScore"]("https://mainichi.jp")).toBe(0.9);
      expect(service["getDomainTrustScore"]("https://www.yomiuri.co.jp")).toBe(
        0.9,
      );
      expect(service["getDomainTrustScore"]("https://asia.nikkei.com")).toBe(
        0.95,
      );
      expect(service["getDomainTrustScore"]("https://kyodonews.net")).toBe(0.9);
      expect(service["getDomainTrustScore"]("https://www.tansa.jp")).toBe(0.9);
      expect(service["getDomainTrustScore"]("https://nhkworld.jp")).toBe(0.95);
    });

    it("returns high scores for trusted international news domains", () => {
      const trustedInternational = [
        { source: "https://reuters.com/world/asia-pacific", expected: 0.85 }, // Reuters - updated
        { source: "https://bbc.com/news/world/asia", expected: 0.8 }, // BBC
        { source: "https://apnews.com/japan", expected: 0.8 }, // Associated Press - new
        { source: "https://bloomberg.com/asia", expected: 0.85 }, // Bloomberg - business focus
        { source: "https://nippon.com/en/japan", expected: 0.85 }, // Nippon.com - new
        { source: "https://www.ft.com/japan", expected: 0.8 }, // Financial Times - new
        { source: "https://wsj.asia/japan", expected: 0.8 }, // WSJ Asia - new
        {
          source: "https://fortune.com/2024/01/15/japan-business",
          expected: 0.75,
        }, // Fortune
      ];

      trustedInternational.forEach(({ source, expected }) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(expected);
      });
    });

    it("returns moderate score for unknown domains", () => {
      const unknownDomains = [
        "https://unknown-news-site.com",
        "https://random-blog.org",
        "https://some-website.net",
      ];

      unknownDomains.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(0.6);
      });
    });

    it("returns low score for malformed sources", () => {
      const malformedSources = [
        "not-a-url",
        "",
        "htp://incomplete-url",
        "javascript:malicious",
      ];

      malformedSources.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(0.4);
      });
    });

    it("handles case insensitive domain matching", () => {
      const caseVariations = [
        "https://NHK.OR.JP/news",
        "https://Nikkei.com/article",
        "https://REUTERS.COM/world",
      ];

      caseVariations.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBeGreaterThanOrEqual(0.8); // Should still match trusted domains
      });
    });

    it("handles domain-only sources", () => {
      const domainOnlySources = ["nhk.or.jp", "nikkei.com", "reuters.com"];

      domainOnlySources.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it("handles subdomains of trusted domains", () => {
      const subdomains = [
        "https://news.nhk.or.jp",
        "https://asia.nikkei.com",
        "https://www.bbc.co.uk/news",
      ];

      subdomains.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it("returns appropriate scores for Japanese news aggregators", () => {
      const aggregators = [
        { source: "https://japantoday.com", expected: 0.75 }, // Japan Today
        { source: "https://newsonjapan.com", expected: 0.75 }, // News On Japan
      ];

      aggregators.forEach(({ source, expected }) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(expected);
      });
    });

    it("recognizes regional Japanese newspapers", () => {
      const regional = [
        { source: "https://hokkaido-np.co.jp", expected: 0.8 }, // Hokkaido Shimbun
        { source: "https://chugoku-np.co.jp", expected: 0.8 }, // Chugoku Shimbun
        { source: "https://kobe-np.co.jp", expected: 0.8 }, // Kobe Shimbun
      ];

      regional.forEach(({ source, expected }) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(expected);
      });
    });

    it("handles invalid URLs that throw during parsing", () => {
      const invalidUrls = ["https://", "http://", "https:///"];

      invalidUrls.forEach((source) => {
        const score = service["getDomainTrustScore"](source);
        expect(score).toBe(0.4);
      });
    });
  });
});
