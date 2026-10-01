import { vi } from "vitest";
import type { SiteTheme } from "~~/types/index";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({ public: {} }));
  return { mockUseRuntimeConfig };
});
export { mockUseRuntimeConfig };

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

// Mock the site theme service — site-theme.get.ts and the season cron
// read/write exclusively through this.
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
  source: "cron",
  ...overrides,
});

// Helper function to get the site-theme handler
export const getSiteThemeHandler = async () => {
  const handlerModule = await import("~/server/api/site-theme.get");
  return handlerModule.default;
};

// Helper function to get the season cron handler
export const getUpdateSeasonHandler = async () => {
  const handlerModule = await import("~/server/api/cron/update-season.get");
  return handlerModule.default;
};

// Helper function to setup default mocks
export const setupDefaults = () => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  (global as any).getQuery.mockReturnValue({});
  mockGetActiveTheme.mockResolvedValue(null);
  mockSaveActiveTheme.mockResolvedValue(undefined);
};
