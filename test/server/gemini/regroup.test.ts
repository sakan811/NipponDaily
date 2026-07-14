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

describe("GeminiService - regroupStories", () => {
  let service: GeminiService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GeminiService();
    mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        stories: [
          {
            storyId: "story-1",
            headline: "Regrouped Headline 1",
            summary: "- Point 1\n- Point 2",
            thematicAnalysis: "- Analysis 1",
            categories: ["society"],
            regionsAffected: ["Tokyo"],
            overallCredibilityScore: 0.8,
            articleUrls: ["https://example.com/1", "https://example.com/2"],
          },
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

  it("regroups stories correctly using Gemini client", async () => {
    const currentStories = [
      {
        storyId: "story-1",
        headline: "Headline 1",
        summary: "Summary 1",
        categories: ["society"],
        articles: [
          {
            title: "Article 1",
            source: "NHK",
            url: "https://example.com/1",
            publishedAt: "2026-07-14",
          },
        ],
      },
    ];

    const orphanedArticles = [
      {
        title: "Article 2",
        source: "Bloomberg",
        url: "https://example.com/2",
        publishedAt: "2026-07-14",
      },
    ];

    const result = await service.regroupStories(currentStories, orphanedArticles, {
      apiKey: "test-key",
    });

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].storyId).toBe("story-1");
    expect(result.stories[0].articleUrls).toEqual(["https://example.com/1", "https://example.com/2"]);
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
