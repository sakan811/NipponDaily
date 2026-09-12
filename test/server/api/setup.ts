import { vi } from "vitest";
import type { Lesson } from "~~/types/index";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    public: {
      apiBase: "/api",
    },
  }));
  return { mockUseRuntimeConfig };
});
export { mockUseRuntimeConfig };

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

// Mock the lessons service — news.get.ts reads exclusively from Redis via this service
export const mockGetLastIngestTime = vi.fn();
export const mockGetLessons = vi.fn();

vi.mock("~/server/services/lessons", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/lessons")>();
  return {
    ...actual,
    lessonsService: {
      getLastIngestTime: mockGetLastIngestTime,
      getLessons: mockGetLessons,
    },
  };
});

// Mock the tokenizer — news.get.ts tests shouldn't pay for loading the real
// kuromoji dictionary; the merge/POS logic itself is covered by tokenizer.test.ts.
export const mockAnalyzeJapanese = vi.fn().mockResolvedValue([]);

vi.mock("~/server/utils/tokenizer", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/utils/tokenizer")>();
  return {
    ...actual,
    analyzeJapanese: mockAnalyzeJapanese,
  };
});

// Helper to create a mock lesson. Defaults to "now" for publishedAt so
// difficulty/limit/search tests aren't affected by sort order unless they set
// explicit dates.
export const createMockLesson = (overrides: Partial<Lesson> = {}): Lesson => {
  const now = Date.now();
  return {
    id: "lesson-1",
    title: "Tech News",
    titleJa: "テックニュース",
    source: "https://example.com",
    url: "https://example.com/article",
    favicon: "https://example.com/favicon.ico",
    publishedAt: new Date(now).toISOString(),
    addedAt: now,
    credibilityScore: 0.9,
    difficultyLevel: "N3",
    originalText: "日本語の本文です。",
    englishText: "This is the Japanese body text.",
    furiganaText:
      "<ruby>日本語<rt>にほんご</rt></ruby>の<ruby>本文<rt>ほんぶん</rt></ruby>です。",
    romajiText: "Nihongo no honbun desu.",
    vocabList: [],
    grammarNotes: [],
    ...overrides,
  };
};

// Helper function to get the handler
export const getHandler = async () => {
  const handlerModule = await import("~/server/api/news.get");
  return handlerModule.default;
};

// Helper function to setup default mocks
export const setupDefaults = () => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  (global as any).getQuery.mockReturnValue({});
  mockGetLastIngestTime.mockResolvedValue(Date.now());
  mockGetLessons.mockResolvedValue([]);
  mockAnalyzeJapanese.mockResolvedValue([]);
};
