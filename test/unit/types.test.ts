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

  it("allows optional furigana/rōmaji on vocab items and grammar notes", () => {
    const lesson: Lesson = {
      id: "l2",
      title: "T",
      source: "https://www3.nhk.or.jp",
      url: "https://www3.nhk.or.jp/news/2",
      publishedAt: "2026-01-15T10:00:00Z",
      addedAt: 1736935200000,
      credibilityScore: 0.9,
      difficultyLevel: "N4",
      originalText: "首相は表明した。",
      englishText: "The PM stated.",
      furiganaText: "<ruby>首相<rt>しゅしょう</rt></ruby>は",
      romajiText: "Shushō wa",
      vocabList: [
        {
          term: "首相",
          reading: "しゅしょう",
          romaji: "shushō",
          meaning: "prime minister",
          jlptLevel: "N3",
          partOfSpeech: "noun",
          exampleSentence: "首相は表明した。",
          exampleFurigana: "<ruby>首相<rt>しゅしょう</rt></ruby>は表明した。",
          exampleRomaji: "Shushō wa hyōmei shita.",
        },
      ],
      grammarNotes: [
        {
          pattern: "〜は",
          patternFurigana: "〜は",
          patternRomaji: "wa",
          partOfSpeech: "particle",
          explanation: "topic marker",
          exampleSentence: "首相は表明した。",
          romaji: "shushō wa hyōmei shita.",
          exampleFurigana: "<ruby>首相<rt>しゅしょう</rt></ruby>は表明した。",
        },
      ],
    };

    expect(lesson.vocabList[0]?.exampleRomaji).toBe("Shushō wa hyōmei shita.");
    expect(lesson.vocabList[0]?.partOfSpeech).toBe("noun");
    expect(lesson.grammarNotes[0]?.exampleFurigana).toContain("<ruby>");
    expect(lesson.grammarNotes[0]?.partOfSpeech).toBe("particle");
    expect(lesson.grammarNotes[0]?.patternRomaji).toBe("wa");
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
