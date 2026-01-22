import { describe, it, expect, beforeEach, vi } from "vitest";

import { getService, createMockNews } from "./setup";
import { mockGenerateContent } from "../../setup";

describe("GeminiService - Error Handling", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
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
});
