import { vi } from "vitest";
import type { NewsItem } from "~~/types/index";
import { mockGenerateContent as _mockGenerateContent } from "../../setup";

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    geminiApiKey: "test-api-key",
    geminiModel: "gemini-1.5-flash",
  }));
  return { mockUseRuntimeConfig };
});

vi.mock("#app", () => ({
  useRuntimeConfig: mockUseRuntimeConfig,
}));

// Helper function to create mock news
export const createMockNews = (): NewsItem[] => [
  {
    title: "Tech News",
    summary: "Tech Summary",
    content: "Tech Content",
    source: "Tech Source",
    publishedAt: "2024-01-15T10:00:00Z",
    category: "Other",
  },
];

// Helper function to get the service
export const getService = async () => {
  vi.clearAllMocks();
  const module = await import("~/server/services/gemini");
  return module.geminiService;
};
