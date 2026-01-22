import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

describe("News API - Time Range Validation", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("accepts valid timeRange values", async () => {
    const validTimeRanges = ["none", "day", "week", "month", "year"];

    for (const timeRange of validTimeRanges) {
      (global as any).getQuery.mockReturnValue({
        timeRange,
        language: "English",
      });
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

      expect(response.success).toBe(true);
      expect(mockTavilySearch).toHaveBeenCalledWith({
        maxResults: 10,
        category: undefined,
        timeRange: timeRange,
        apiKey: "test-tavily-key",
      });
    }
  });

  it("defaults to 'week' when invalid timeRange is provided", async () => {
    (global as any).getQuery.mockReturnValue({
      timeRange: "invalid",
      language: "English",
    });
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

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("defaults to 'week' when timeRange is not provided", async () => {
    (global as any).getQuery.mockReturnValue({ language: "English" });
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

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("accepts timeRange case variations", async () => {
    const testCases = [
      { input: "NONE", expected: "week" },
      { input: "Day", expected: "week" },
      { input: "WEEK", expected: "week" },
      { input: "Month", expected: "week" },
      { input: "YEAR", expected: "week" },
    ];

    for (const { input, expected } of testCases) {
      (global as any).getQuery.mockReturnValue({
        timeRange: input,
        language: "English",
      });
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

      expect(response.success).toBe(true);
      expect(mockTavilySearch).toHaveBeenCalledWith({
        maxResults: 10,
        category: undefined,
        timeRange: expected,
        apiKey: "test-tavily-key",
      });
    }
  });

  it("handles empty string timeRange", async () => {
    (global as any).getQuery.mockReturnValue({
      timeRange: "",
      language: "English",
    });
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

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles null and undefined timeRange values", async () => {
    const testCases = [null, undefined];

    for (const timeRange of testCases) {
      (global as any).getQuery.mockReturnValue({
        timeRange,
        language: "English",
      });
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

      expect(response.success).toBe(true);
      expect(mockTavilySearch).toHaveBeenCalledWith({
        maxResults: 10,
        category: undefined,
        timeRange: "week",
        apiKey: "test-tavily-key",
      });
    }
  });

  it("validates timeRange alongside other parameters", async () => {
    (global as any).getQuery.mockReturnValue({
      timeRange: "month",
      category: "technology",
      limit: "5",
      language: "English",
    });
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

    expect(response.success).toBe(true);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 5,
      category: "technology",
      timeRange: "month",
      apiKey: "test-tavily-key",
    });
  });
});
