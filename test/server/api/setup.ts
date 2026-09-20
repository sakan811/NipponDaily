import { vi } from "vitest";
import type { DailyGame, SiteTheme } from "~~/types/index";

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

// Mock the N5 data service — daily-game.get.ts reads exclusively from Redis
// via this service (falling back to a generated game when none exists yet).
export const mockGetDailyGame = vi.fn();
export const mockSaveDailyGame = vi.fn();
export const mockGetFullPool = vi.fn();
export const mockGetVocabPool = vi.fn();

vi.mock("~/server/services/n5-data", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/n5-data")>();
  return {
    ...actual,
    n5DataService: {
      getDailyGame: mockGetDailyGame,
      saveDailyGame: mockSaveDailyGame,
      getFullPool: mockGetFullPool,
      getVocabPool: mockGetVocabPool,
    },
  };
});

// Mock the site theme service — site-theme.get.ts and the MCP server's
// theme tools read/write exclusively through this.
export const mockGetActiveTheme = vi.fn();
export const mockSaveActiveTheme = vi.fn();

vi.mock("~/server/services/site-theme", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/site-theme")>();
  return {
    ...actual,
    siteThemeService: {
      getActiveTheme: mockGetActiveTheme,
      saveActiveTheme: mockSaveActiveTheme,
    },
  };
});

export const createMockSiteTheme = (
  overrides: Partial<SiteTheme> = {},
): SiteTheme => ({
  season: "autumn",
  updatedAt: Date.now(),
  source: "agent",
  ...overrides,
});

// Helper function to get the site-theme handler
export const getSiteThemeHandler = async () => {
  const handlerModule = await import("~/server/api/site-theme.get");
  return handlerModule.default;
};

/** A pool with exactly enough items per kind for buildDailyGame to succeed. */
export const createMockPool = () => ({
  kanji: Array.from({ length: 6 }, (_, i) => ({
    id: `漢${i}`,
    character: `漢${i}`,
    meanings: [`meaning${i}`],
    onyomi: [],
    kunyomi: [],
    strokeCount: 5,
    jlptLevel: "N5" as const,
  })),
  vocab: Array.from({ length: 6 }, (_, i) => ({
    id: `vocab-${i}`,
    term: `語${i}`,
    kana: `ご${i}`,
    romaji: `go${i}`,
    meaning: `word${i}`,
    jlptLevel: "N5" as const,
  })),
  hiragana: Array.from({ length: 6 }, (_, i) => ({
    id: `ひ${i}`,
    char: `ひ${i}`,
    script: "hiragana" as const,
    romaji: `hi${i}`,
  })),
  katakana: Array.from({ length: 6 }, (_, i) => ({
    id: `ヒ${i}`,
    char: `ヒ${i}`,
    script: "katakana" as const,
    romaji: `hi${i}`,
  })),
});

export const createMockDailyGame = (
  overrides: Partial<DailyGame> = {},
): DailyGame => ({
  date: "2026-09-18",
  questions: [
    {
      id: "語0",
      kind: "vocab",
      prompt: "語0",
      promptSub: "ご0",
      correctAnswer: "word0",
      choices: ["word0", "word1", "word2", "word3"],
    },
  ],
  generatedAt: Date.now(),
  source: "agent",
  ...overrides,
});

// Helper function to get the handler
export const getHandler = async () => {
  const handlerModule = await import("~/server/api/daily-game.get");
  return handlerModule.default;
};

// Helper function to get the n5-vocab handler
export const getVocabHandler = async () => {
  const handlerModule = await import("~/server/api/n5-vocab.get");
  return handlerModule.default;
};

// Helper function to setup default mocks
export const setupDefaults = () => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  (global as any).getQuery.mockReturnValue({});
  mockGetDailyGame.mockResolvedValue(null);
  mockSaveDailyGame.mockResolvedValue(undefined);
  mockGetFullPool.mockResolvedValue(createMockPool());
  mockGetVocabPool.mockResolvedValue(createMockPool().vocab);
  mockGetActiveTheme.mockResolvedValue(null);
  mockSaveActiveTheme.mockResolvedValue(undefined);
};
