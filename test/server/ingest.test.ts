import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRelatedToJapan, ingestNewsTask } from "~/server/services/ingest";
import { tavilyService } from "~/server/services/tavily";
import { upstashVectorService } from "~/server/services/vector";
import { storiesService } from "~/server/services/stories";

vi.mock("~/server/services/tavily", () => ({
  tavilyService: {
    searchJapanNews: vi.fn(),
    formatTavilyResultsToNewsItems: vi.fn(),
  },
}));

vi.mock("~/server/services/vector", () => ({
  upstashVectorService: {
    getEmbedding: vi.fn(),
    upsertArticle: vi.fn(),
  },
}));

vi.mock("~/server/services/stories", () => ({
  storiesService: {
    isArticleProcessed: vi.fn(),
    markArticleProcessed: vi.fn(),
    setLastIngestTime: vi.fn(),
  },
}));

describe("Ingest Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isRelatedToJapan", () => {
    it("returns true for text containing Japanese characters (Kanji, Hiragana, Katakana)", () => {
      expect(isRelatedToJapan("東京ニュース", "日本の技術")).toBe(true);
      expect(isRelatedToJapan("Hello", "こんにちは")).toBe(true);
      expect(isRelatedToJapan("アニメ", "World")).toBe(true);
    });

    it("returns true for text containing Japan-related keywords in English", () => {
      expect(
        isRelatedToJapan("Tokyo prepares for summer festival", "Event details"),
      ).toBe(true);
      expect(
        isRelatedToJapan("Nintendo announces new game", "Gaming news"),
      ).toBe(true);
      expect(
        isRelatedToJapan("Shinkansen bullet train speed record", "Transport"),
      ).toBe(true);
      expect(isRelatedToJapan("Mount Fuji hiking guidelines", "Tourism")).toBe(
        true,
      );
    });

    it("returns false for text completely unrelated to Japan", () => {
      expect(
        isRelatedToJapan(
          "Global Market Update",
          "Stock prices fluctuate in New York and London.",
        ),
      ).toBe(false);
      expect(
        isRelatedToJapan(
          "Paris Fashion Week Highlights",
          "Models showcase new autumn collection.",
        ),
      ).toBe(false);
    });
  });

  describe("ingestNewsTask", () => {
    it("fetches, filters, embeds, and marks articles when new articles exist", async () => {
      vi.mocked(tavilyService.searchJapanNews).mockResolvedValue({
        results: [
          {
            title: "Tokyo Tech Summit",
            url: "https://example.com/tokyo-tech",
            content: "Tokyo tech updates",
            published_date: "2026-07-29T00:00:00Z",
          },
        ],
      } as any);

      vi.mocked(tavilyService.formatTavilyResultsToNewsItems).mockReturnValue([
        {
          title: "Tokyo Tech Summit",
          url: "https://example.com/tokyo-tech",
          summary: "Tokyo tech updates",
          content: "Tokyo tech updates",
          source: "Japan Times",
          publishedAt: "2026-07-29T00:00:00Z",
        },
      ]);

      vi.mocked(storiesService.isArticleProcessed).mockResolvedValue(false);
      vi.mocked(upstashVectorService.getEmbedding).mockResolvedValue([
        0.1, 0.2, 0.3,
      ]);
      vi.mocked(upstashVectorService.upsertArticle).mockResolvedValue(true);

      const result = await ingestNewsTask();

      expect(result.success).toBe(true);
      expect(result.articlesProcessed).toBeGreaterThan(0);
      expect(upstashVectorService.getEmbedding).toHaveBeenCalled();
      expect(upstashVectorService.upsertArticle).toHaveBeenCalled();
      expect(storiesService.markArticleProcessed).toHaveBeenCalledWith(
        "https://example.com/tokyo-tech",
      );
      expect(storiesService.setLastIngestTime).toHaveBeenCalled();
    });

    it("handles scenario where all fetched articles have already been processed", async () => {
      vi.mocked(tavilyService.searchJapanNews).mockResolvedValue({
        results: [],
      } as any);
      vi.mocked(tavilyService.formatTavilyResultsToNewsItems).mockReturnValue([
        {
          title: "Tokyo Tech Summit",
          url: "https://example.com/processed-url",
          summary: "Tokyo tech updates",
          content: "Tokyo tech updates",
          source: "Japan Times",
          publishedAt: "2026-07-29T00:00:00Z",
        },
      ]);

      vi.mocked(storiesService.isArticleProcessed).mockResolvedValue(true);

      const result = await ingestNewsTask();

      expect(result.success).toBe(true);
      expect(result.articlesProcessed).toBe(0);
      expect(storiesService.setLastIngestTime).toHaveBeenCalled();
    });

    it("handles category fetch errors gracefully", async () => {
      vi.mocked(tavilyService.searchJapanNews).mockRejectedValue(
        new Error("API network failure"),
      );

      const result = await ingestNewsTask();

      expect(result.success).toBe(true);
      expect(result.articlesProcessed).toBe(0);
      expect(storiesService.setLastIngestTime).toHaveBeenCalled();
    });

    it("handles embedding/upsert error for individual article without crashing pipeline", async () => {
      vi.mocked(tavilyService.searchJapanNews).mockResolvedValue({
        results: [],
      } as any);
      vi.mocked(tavilyService.formatTavilyResultsToNewsItems).mockReturnValue([
        {
          title: "Osaka Festival",
          url: "https://example.com/osaka-fest",
          summary: "Osaka festival",
          content: "Osaka festival",
          source: "Osaka News",
          publishedAt: "2026-07-29T00:00:00Z",
        },
      ]);

      vi.mocked(storiesService.isArticleProcessed).mockResolvedValue(false);
      vi.mocked(upstashVectorService.getEmbedding).mockRejectedValue(
        new Error("Gemini quota exceeded"),
      );

      const result = await ingestNewsTask();

      expect(result.success).toBe(true);
      expect(storiesService.setLastIngestTime).toHaveBeenCalled();
    });
  });
});
