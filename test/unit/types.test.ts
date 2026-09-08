import { describe, it, expect } from "vitest";
import type { ApiResponse, Lesson } from "~~/types/index";

describe("Types", () => {
  it("validates the Lesson interface", () => {
    const lesson: Lesson = {
      id: "l1",
      title: "Test News",
      titleJa: "テストニュース",
      source: "https://www3.nhk.or.jp",
      url: "https://www3.nhk.or.jp/news/1",
      favicon: "https://www3.nhk.or.jp/favicon.ico",
      publishedAt: "2026-01-15T10:00:00Z",
      addedAt: 1736935200000,
      credibilityScore: 0.9,
      difficultyLevel: "N3",
      originalText: "日本語。",
      englishText: "Japanese.",
      furiganaText: "<ruby>日本語<rt>にほんご</rt></ruby>。",
      romajiText: "Nihongo.",
      vocabList: [],
      grammarNotes: [],
    };

    expect(lesson.title).toBe("Test News");
    expect(lesson.difficultyLevel).toBe("N3");
  });

  it("validates ApiResponse generic type", () => {
    const response: ApiResponse<Lesson[]> = {
      success: true,
      data: [],
      count: 0,
      timestamp: "2026-01-15T10:00:00Z",
    };

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
