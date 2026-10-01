import { vi } from "vitest";
import type { SiteTheme } from "~~/types/index";

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

// Mock the pool data service — pool-vocab.get.ts and pool-kanji.get.ts read
// exclusively from Redis via this service.
export const mockGetVocabPool = vi.fn();
export const mockGetKanjiPool = vi.fn();

vi.mock("~/server/services/pool-data", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/pool-data")>();
  return {
    ...actual,
    poolDataService: {
      getVocabPool: mockGetVocabPool,
      getKanjiPool: mockGetKanjiPool,
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

/** A small kanji + vocab pool for the pool endpoints' tests. */
export const createMockPool = () => ({
  kanji: Array.from({ length: 12 }, (_, i) => ({
    id: `漢${i}`,
    character: `漢${i}`,
    meanings: [`meaning${i}`],
    onyomi: [],
    kunyomi: [],
    strokeCount: 5,
    jlptLevel: "N5" as const,
  })),
  vocab: Array.from({ length: 12 }, (_, i) => ({
    id: `vocab-${i}`,
    term: `語${i}`,
    kana: `ご${i}`,
    romaji: `go${i}`,
    meaning: `word${i}`,
    jlptLevel: "N5" as const,
  })),
});

// Helper function to get the pool-vocab handler
export const getVocabHandler = async () => {
  const handlerModule = await import("~/server/api/pool-vocab.get");
  return handlerModule.default;
};

// Helper function to get the pool-kanji handler
export const getKanjiHandler = async () => {
  const handlerModule = await import("~/server/api/pool-kanji.get");
  return handlerModule.default;
};

// Helper function to setup default mocks
export const setupDefaults = () => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  (global as any).getQuery.mockReturnValue({});
  mockGetVocabPool.mockResolvedValue(createMockPool().vocab);
  mockGetKanjiPool.mockResolvedValue(createMockPool().kanji);
  mockGetActiveTheme.mockResolvedValue(null);
  mockSaveActiveTheme.mockResolvedValue(undefined);
};
