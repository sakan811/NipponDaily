import { vi } from "vitest";
import type { NewsItem } from "~~/types/index";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    geminiApiKey: "test-api-key",
    geminiModel: "gemini-1.5-flash",
    tavilyApiKey: "test-tavily-key",
    public: {
      apiBase: "/api",
    },
  }));
  return { mockUseRuntimeConfig };
});

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

// Mock services with correct method names
export const mockTavilySearch = vi.fn();
export const mockTavilyFormat = vi.fn();
export const mockGeminiCategorize = vi.fn();

vi.mock("~/server/services/tavily", () => ({
  tavilyService: {
    searchJapanNews: mockTavilySearch,
    formatTavilyResultsToNewsItems: mockTavilyFormat,
  },
}));

vi.mock("~/server/services/gemini", () => ({
  geminiService: {
    categorizeNewsItems: mockGeminiCategorize,
  },
}));

// Mock rate limiter to always allow requests during tests
export const mockCheckRateLimit = vi.fn(() =>
  Promise.resolve({
    allowed: true,
    remaining: 3,
    resetTime: new Date(Date.now() + 86400000),
    limit: 3,
  }),
);

export const mockGetClientIp = vi.fn(() => "127.0.0.1");

vi.mock("~/server/utils/rate-limiter", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/server/utils/rate-limiter")>();
  return {
    ...actual,
    checkRateLimit: mockCheckRateLimit,
    getClientIp: mockGetClientIp,
  };
});

// Helper function to create mock news
export const createMockNews = (): NewsItem[] => [
  {
    title: "Tech News",
    summary: "Tech Summary",
    content: "Tech Content",
    source: "Tech Source",
    publishedAt: "2024-01-15T10:00:00Z",
    category: "Technology",
    url: "https://example.com",
  },
];

// Helper function to get the handler
export const getHandler = async () => {
  const handlerModule = await import("~/server/api/news.get");
  return handlerModule.default;
};

// Helper function to setup default mocks
export const setupDefaults = () => {
  vi.clearAllMocks();
  delete process.env.NODE_ENV;
  (global as any).getQuery.mockReturnValue({ language: "English" });
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 3,
    resetTime: new Date(Date.now() + 86400000),
    limit: 3,
  });
  mockGetClientIp.mockReturnValue("127.0.0.1");
};
