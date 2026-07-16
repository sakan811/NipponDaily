import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("GeminiService - Fallback & Rate Limiting", () => {
  let service: GeminiService;
  let mockGenerateContent: ReturnType<typeof vi.fn>;
  let originalConfigValue: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent = vi.fn();
    (GoogleGenAI as unknown as any).mockImplementation(function () {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });
    service = new GeminiService();

    // Override the global useRuntimeConfig mock to return empty/undefined geminiModel
    if ((global as any).useRuntimeConfig) {
      originalConfigValue = (global as any).useRuntimeConfig();
      (global as any).useRuntimeConfig.mockReturnValue({
        ...originalConfigValue,
        geminiModel: undefined, // allow fallback to process.env.GEMINI_MODEL
      });
    }
  });

  afterEach(() => {
    delete process.env.GEMINI_MODEL;
    if ((global as any).useRuntimeConfig && originalConfigValue) {
      (global as any).useRuntimeConfig.mockReturnValue(originalConfigValue);
    }
  });

  describe("getModels helper method", () => {
    it("parses comma-separated models and filters out lite models", () => {
      process.env.GEMINI_MODEL =
        "gemini-3.5-flash,gemini-3.1-flash-lite,gemini-3-flash,gemini-2.5-flash-lite,gemini-2.5-flash";
      const models = (service as any).getModels();
      expect(models).toEqual([
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-2.5-flash",
      ]);
    });

    it("puts preferred model first and appends remaining configured models without duplicates and lite models", () => {
      process.env.GEMINI_MODEL =
        "gemini-3.5-flash,gemini-3-flash,gemini-2.5-flash";
      const models = (service as any).getModels("gemini-3-flash");
      expect(models).toEqual([
        "gemini-3-flash",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
      ]);
    });

    it("filters out lite preferred models", () => {
      process.env.GEMINI_MODEL =
        "gemini-3.5-flash,gemini-3-flash,gemini-2.5-flash";
      const models = (service as any).getModels(
        "gemini-3.1-flash-lite,gemini-3.5-flash",
      );
      expect(models).toEqual([
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-2.5-flash",
      ]);
    });

    it("falls back to default if process.env.GEMINI_MODEL is empty", () => {
      process.env.GEMINI_MODEL = "";
      const models = (service as any).getModels();
      expect(models).toEqual([
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-2.5-flash",
      ]);
    });
  });

  describe("rate-limiting immediate fallback", () => {
    it("immediately falls back to the next model when encountering a 429 on a non-last model", async () => {
      process.env.GEMINI_MODEL = "first-model,second-model";

      // First call (first-model) returns 429. Second call (second-model) succeeds.
      const error429 = new Error("RESOURCE_EXHAUSTED: Too Many Requests");
      (error429 as any).status = 429;

      mockGenerateContent
        .mockRejectedValueOnce(error429)
        .mockResolvedValueOnce({
          text: JSON.stringify({
            mainHeadline: "Success Headline",
            executiveSummary: "Success Summary",
            thematicAnalysis: "Success Analysis",
            overallCredibilityScore: 0.9,
            sourcesProcessed: [
              {
                title: "Test Source",
                source: "NHK",
                url: "https://nhk.jp",
              },
            ],
          }),
        });

      const newsItems = [
        {
          id: "1",
          title: "Test Article",
          summary: "Summary content",
          content: "Full content",
          category: "Other" as any,
          source: "NHK",
          url: "https://nhk.jp",
          publishedAt: "2026-07-14",
        },
      ];

      const start = Date.now();
      const result = await service.generateNewsBriefing(newsItems, {
        apiKey: "test-api-key",
      });
      const duration = Date.now() - start;

      // It should not wait for retry on the first model (delay is 2000ms by default),
      // so duration should be very small (less than 1000ms).
      expect(duration).toBeLessThan(1000);

      // Verify result
      expect(result.mainHeadline).toBe("Success Headline");
      expect(result.isAiFallback).toBeUndefined();

      // Verify SDK was called twice
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(mockGenerateContent.mock.calls[0][0].model).toBe("first-model");
      expect(mockGenerateContent.mock.calls[1][0].model).toBe("second-model");
    });

    it("retries on 429 when encountering it on the last model", async () => {
      process.env.GEMINI_MODEL = "only-model";

      const error429 = new Error("Too Many Requests");
      (error429 as any).status = 429;

      // Fail twice with 429, then succeed on the third try (first retry)
      mockGenerateContent
        .mockRejectedValueOnce(error429) // initial try
        .mockRejectedValueOnce(error429) // first retry (fails)
        .mockResolvedValueOnce({
          // second retry (succeeds)
          text: JSON.stringify({
            mainHeadline: "Success After Retry Headline",
            executiveSummary: "Success Summary",
            thematicAnalysis: "Success Analysis",
            overallCredibilityScore: 0.9,
            sourcesProcessed: [
              {
                title: "Test Source",
                source: "NHK",
                url: "https://nhk.jp",
              },
            ],
          }),
        });

      const newsItems = [
        {
          id: "1",
          title: "Test Article",
          summary: "Summary content",
          content: "Full content",
          category: "Other" as any,
          source: "NHK",
          url: "https://nhk.jp",
          publishedAt: "2026-07-14",
        },
      ];

      const result = await service.generateNewsBriefing(newsItems, {
        apiKey: "test-api-key",
      });

      expect(result.mainHeadline).toBe("Success After Retry Headline");
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    }, 15000); // 15s timeout because total wait time is 6s (2s first retry + 4s second retry)
  });
});
