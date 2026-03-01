import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

describe("News API - Limit Parameter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("applies limit parameter", async () => {
    const mockNews = Array.from({ length: 5 }, (_, i) => ({
      title: `News ${i}`,
      summary: `Summary ${i}`,
      content: `Content ${i}`,
      source: `Source ${i}`,
      publishedAt: "2024-01-15T10:00:00Z",
      category: "Technology",
      url: `https://example.com/${i}`,
    }));

    (global as any).getQuery.mockReturnValue({ limit: "3" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue(mockNews);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.data).toHaveLength(3);
    expect(response.count).toBe(3);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 3,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles invalid limit parameter", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "invalid" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue([]);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.data).toHaveLength(0);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("uses default limit when limit is null or undefined", async () => {
    (global as any).getQuery.mockReturnValue({ limit: null });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue([]);

    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockTavilySearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxResults: 10 }),
    );

    (global as any).getQuery.mockReturnValue({ limit: undefined });
    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockTavilySearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxResults: 10 }),
    );
  });

  it("handles NaN limit by defaulting to 10", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "not-a-number" });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue([]);
    mockGeminiCategorize.mockResolvedValue([]);

    await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(mockTavilySearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxResults: 10 }),
    );
  });
});
