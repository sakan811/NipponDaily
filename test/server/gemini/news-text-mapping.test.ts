import { describe, it, expect, beforeEach } from "vitest";

import { getService } from "./setup";
import { mockGenerateContent } from "../../setup";

describe("GeminiService - News Text Mapping", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
  });

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
    expect(callArgs.contents).toContain("Content: Raw content with full text");
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
});
