import { vi } from "vitest";
import type { Story } from "~~/types/index";

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

// Mock the stories service — news.get.ts reads exclusively from Redis via this service
export const mockGetLastIngestTime = vi.fn();
export const mockGetStories = vi.fn();

vi.mock("~/server/services/stories", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/services/stories")>();
  return {
    ...actual,
    storiesService: {
      getLastIngestTime: mockGetLastIngestTime,
      getStories: mockGetStories,
    },
  };
});

// Helper function to create mock stories. Defaults to "now" for all
// timestamps so category/limit/sorting tests aren't inadvertently filtered
// out by the timeRange window; pass explicit dates for time-range tests.
export const createMockStory = (overrides: Partial<Story> = {}): Story => {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  return {
    id: "story-1",
    headline: "Tech News",
    summary: "- Tech Summary",
    thematicAnalysis: "- Tech Analysis",
    articleCount: 1,
    firstSeen: now,
    lastUpdated: now,
    trendScore: 1,
    isSummarized: true,
    categories: ["tech"],
    sources: [
      {
        title: "Tech News",
        source: "Tech Source",
        url: "https://example.com",
        publishedAt: nowIso,
        credibilityScore: 0.9,
        addedAt: now,
        category: "tech",
      },
    ],
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
  (global as any).getQuery.mockReturnValue({ language: "en" });
  mockGetLastIngestTime.mockResolvedValue(Date.now());
  mockGetStories.mockResolvedValue([]);
};
