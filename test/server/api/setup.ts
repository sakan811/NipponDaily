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
export { mockUseRuntimeConfig };

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
    generateNewsBriefing: mockGeminiCategorize,
  },
}));

// Helper function to create mock news
export const createMockNews = (): NewsItem[] => [
  {
    title: "Tech News",
    summary: "Tech Summary",
    content: "Tech Content",
    source: "Tech Source",
    publishedAt: "2024-01-15T10:00:00Z",
    category: "Tech" as any,
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
  (global as any).getQuery.mockReturnValue({ language: "en" });
  mockTavilySearch.mockResolvedValue({});
  mockTavilyFormat.mockReturnValue([]);
  mockGeminiCategorize.mockResolvedValue([]);
};
