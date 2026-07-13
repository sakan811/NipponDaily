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
          {
            title: "Test",
            source: "NHK",
            url: "https://nhk.jp",
            regions: ["Tokyo"],
          },
        ],
        regionsAffected: ["Tokyo"],
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
    expect(result.sourcesProcessed[0].credibilityScore).toBe(0.5); // fallback always uses 0.5
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
    // credibilityScore is whatever the AI returns; mock omits it so it is undefined
    expect(result.sourcesProcessed[0].credibilityScore).toBeUndefined();
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
    expect(result.sourcesProcessed[0].credibilityScore).toBe(0.5); // fallback always uses 0.5
  });

  it("returns fallback briefing when newsItems is empty", async () => {
    // Even with a valid API key, empty newsItems should produce a fallback
    const result = await service.generateNewsBriefing([], {
      apiKey: "test-key",
    });

    expect(result.isAiFallback).toBe(true);
    expect(result.mainHeadline).toBe("Latest News Unprocessed");
    expect(result.sourcesProcessed).toHaveLength(0);
    // The AI should NOT have been called for an empty array
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("passes language option through validateLocaleCode for valid locale codes", async () => {
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

    // 'ja' is a valid 2-letter locale code - exercises normalized path + LOCALE_PATTERN match
    const result = await service.generateNewsBriefing(newsItems, {
      apiKey: "test-key",
      language: "ja",
    });

    expect(result.mainHeadline).toBe("Test Headline");
    expect(mockGenerateContent).toHaveBeenCalled();
    // Verify the prompt contains the correct locale code
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain("ja");
  });

  it("falls back to 'en' locale when invalid locale code is provided", async () => {
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

    // An invalid locale code should default to 'en'
    const result = await service.generateNewsBriefing(newsItems, {
      apiKey: "test-key",
      language: "!!!invalid!!!",
    });

    expect(result.mainHeadline).toBe("Test Headline");
    const callArgs = mockGenerateContent.mock.calls[0][0];
    // The prompt should contain the fallback locale 'en'
    expect(callArgs.contents).toContain("en");
  });

  it("matches source by title instead of URL when sourcesProcessed entry has no url", async () => {
    // When the AI returns a source without a URL, the favicon matching
    // should fall back to matching by title (covers gemini.ts line 118)
    const favicon = "https://nhk.jp/favicon.ico";
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        mainHeadline: "Test Headline",
        executiveSummary: "Test Summary",
        thematicAnalysis: "Test Analysis",
        overallCredibilityScore: 0.8,
        sourcesProcessed: [
          // No url field here — should match by title
          {
            title: "Test NHK Article",
            source: "NHK",
            credibilityScore: 0.9,
            regions: [],
          },
        ],
        regionsAffected: [],
      }),
    });

    const newsItems = [
      {
        id: "1",
        title: "Test NHK Article",
        summary: "",
        content: "",
        category: "Technology" as any,
        source: "NHK",
        url: "https://nhk.jp/article",
        favicon,
        publishedAt: "2024-01-01",
      },
    ];

    const result = await service.generateNewsBriefing(newsItems, {
      apiKey: "test-key",
    });

    // The favicon should be attached from the matched news item by title
    expect(result.sourcesProcessed[0].favicon).toBe(favicon);
  });

  describe("batchProcessStories", () => {
    it("returns empty object when storiesToProcess is empty", async () => {
      const result = await service.batchProcessStories([], {
        apiKey: "test-key",
      });
      expect(result).toEqual({});
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it("sends structured batch prompt and returns parsed results", async () => {
      const mockBatchResponse = {
        results: [
          {
            storyId: "story-1",
            headline: "Tech Breakthrough",
            summary: "- New AI model released",
            thematicAnalysis: "- Industry-wide impact",
            regionsAffected: ["Tokyo"],
            overallCredibilityScore: 0.9,
            categories: ["tech"],
          },
          {
            storyId: "story-2",
            headline: "Kyoto Tourism Surge",
            summary: "- Record visitors in Kyoto",
            thematicAnalysis: "- Local economy boosts",
            regionsAffected: ["Kyoto"],
            overallCredibilityScore: 0.85,
            categories: ["tourism"],
          },
        ],
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockBatchResponse),
      });

      const storiesToProcess = [
        {
          storyId: "story-1",
          articles: [
            {
              title: "Article 1",
              summary: "Details about AI",
              content: "Details about AI",
              source: "Tech News",
              publishedAt: "2024-01-01",
              category: "Tech" as any,
            },
          ],
        },
        {
          storyId: "story-2",
          existingStory: {
            id: "story-2",
            headline: "Old Kyoto Headline",
            summary: "- Old summary",
            thematicAnalysis: "- Old analysis",
            articleCount: 1,
            regionBreakdown: { Kyoto: 1 },
            firstSeen: 12345,
            lastUpdated: 12345,
            trendScore: 0,
            sources: [],
            categories: ["tourism"],
          },
          articles: [
            {
              title: "Article 2",
              summary: "Details about Kyoto",
              content: "Details about Kyoto",
              source: "Travel Guide",
              publishedAt: "2024-01-02",
              category: "Tourism" as any,
            },
          ],
        },
      ];

      const result = await service.batchProcessStories(storiesToProcess, {
        apiKey: "test-key",
      });

      expect(result["story-1"]).toBeDefined();
      expect(result["story-1"].headline).toBe("Tech Breakthrough");
      expect(result["story-2"].headline).toBe("Kyoto Tourism Surge");
      expect(mockGenerateContent).toHaveBeenCalled();

      // Check that the prompt contains instructions for UPDATE and NEW
      const prompt = mockGenerateContent.mock.calls[0][0].contents;
      expect(prompt).toContain("Story Cluster #1");
      expect(prompt).toContain("[Type: NEW]");
      expect(prompt).toContain("Story Cluster #2");
      expect(prompt).toContain("[Type: UPDATE]");
    });
  });
});
