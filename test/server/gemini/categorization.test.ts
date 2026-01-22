import { describe, it, expect, beforeEach } from "vitest";

import { getService, createMockNews } from "./setup";
import { mockGenerateContent } from "../../setup";

describe("GeminiService - Categorization", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
  });

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

  it("logs warning when API key is not configured during initialization", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const module = await import("~/server/services/gemini");
    const serviceWithoutClient = new module.GeminiService();

    // Call initializeClient without API key to trigger the warning
    serviceWithoutClient["initializeClient"]();

    expect(consoleSpy).toHaveBeenCalledWith("GEMINI_API_KEY not configured");
    consoleSpy.mockRestore();
  });
});
