import { describe, it, expect, beforeEach } from "vitest";

import { getService, createMockNews } from "./setup";
import { mockGenerateContent } from "../../setup";

describe("GeminiService - Summary Handling", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
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
});
