import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiService } from "../../../server/services/gemini";
import { GoogleGenAI } from "@google/genai";

vi.mock("@google/genai", () => {
  return {
    Type: {
      OBJECT: "OBJECT",
      STRING: "STRING",
      NUMBER: "NUMBER",
      ARRAY: "ARRAY",
    },
    GoogleGenAI: vi.fn(),
  };
});

describe("GeminiService", () => {
  let service: GeminiService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GeminiService();
    mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        mainHeadline: "Test Headline",
        executiveSummary: "Test Summary",
        thematicAnalysis: "Test Analysis",
        overallCredibilityScore: 0.8,
        sourcesProcessed: [
          { title: "Test", source: "NHK", url: "https://nhk.jp" },
        ],
      }),
    });

    (GoogleGenAI as unknown as any).mockImplementation(function () {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });
  });

  it("returns fallback briefing when API key is missing", async () => {
    const newsItems = [
      {
        id: "1",
        title: "Test",
        summary: "",
        content: "",
        category: "Technology" as any,
        source: "NHK",
        url: "https://nhk.jp",
        publishedAt: "2024-01-01",
      },
    ];

    // No API key provided
    const result = await service.generateNewsBriefing(newsItems);

    expect(result.isAiFallback).toBe(true);
    expect(result.mainHeadline).toBe("Latest News Unprocessed");
    expect(result.sourcesProcessed.length).toBe(1);
    expect(result.sourcesProcessed[0].credibilityScore).toBe(0.95); // NHK gets 0.95
  });

  it("handles successful AI generation", async () => {
    const newsItems = [
      {
        id: "1",
        title: "Test",
        summary: "",
        content: "",
        category: "Technology" as any,
        source: "NHK",
        url: "https://nhk.jp",
        publishedAt: "2024-01-01",
      },
    ];

    const result = await service.generateNewsBriefing(newsItems, {
      apiKey: "test-key",
    });

    expect(result.mainHeadline).toBe("Test Headline");
    expect(result.overallCredibilityScore).toBe(0.8);
    expect(result.sourcesProcessed[0].credibilityScore).toBe(0.95);
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it("falls back to empty response if generation fails", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    const newsItems = [
      {
        id: "1",
        title: "Test Error",
        summary: "",
        content: "",
        category: "Technology" as any,
        source: "Unknown",
        url: "https://example.com",
        publishedAt: "2024-01-01",
      },
    ];

    const result = await service.generateNewsBriefing(newsItems, {
      apiKey: "test-key",
    });

    expect(result.isAiFallback).toBe(true);
    expect(result.sourcesProcessed[0].credibilityScore).toBe(0.6); // Unknown domain gets 0.6
  });
});
