import { describe, it, expect, vi, beforeEach } from "vitest";
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
const mockTavilySearch = vi.fn();
const mockTavilyFormat = vi.fn();
const mockGeminiCategorize = vi.fn();

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
const mockCheckRateLimit = vi.fn(() =>
  Promise.resolve({
    allowed: true,
    remaining: 3,
    resetTime: new Date(Date.now() + 86400000),
    limit: 3,
  }),
);

const mockGetClientIp = vi.fn(() => "127.0.0.1");

vi.mock("~/server/utils/rate-limiter", () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIp: mockGetClientIp,
}));

describe("News API", () => {
  let handler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;

    const handlerModule = await import("~/server/api/news.get");
    handler = handlerModule.default;
    (global as any).getQuery.mockReturnValue({ language: "English" });
    // Reset rate limiter mocks
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 3,
      resetTime: new Date(Date.now() + 86400000),
      limit: 3,
    });
    mockGetClientIp.mockReturnValue("127.0.0.1");
  });

  const createMockNews = (): NewsItem[] => [
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

  it("returns news successfully with default parameters", async () => {
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
    expect(response.data).toEqual([]);
    expect(response.count).toBe(0);
    expect(response.timestamp).toBeDefined();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith([], {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "English",
    });
  });

  it("filters news by category", async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "technology" });
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

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: "technology",
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
    expect(mockGeminiCategorize).toHaveBeenCalledWith(mockNews, {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      language: "English",
    });
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

  it('returns all news when category is "all"', async () => {
    const mockNews = createMockNews();
    (global as any).getQuery.mockReturnValue({ category: "all" });
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

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles service errors", async () => {
    const error = new Error("Service error");
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue(error);

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Service error" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("logs errors in development environment", async () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Dev error");
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue(error);

    try {
      await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });
    } catch {
      // Expected error - no action needed
    }

    expect(consoleSpy).toHaveBeenCalledWith("News API error:", error);
    consoleSpy.mockRestore();
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("handles non-Error objects in error handling", async () => {
    (global as any).getQuery.mockReturnValue({ language: "English" });
    mockTavilySearch.mockRejectedValue("String error message");

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Unknown error occurred" },
    });
    expect(mockTavilySearch).toHaveBeenCalledWith({
      maxResults: 10,
      category: undefined,
      timeRange: "week",
      apiKey: "test-tavily-key",
    });
  });

  it("sorts news by published date in descending order", async () => {
    const mockNews = [
      {
        title: "Old News",
        summary: "Old Summary",
        content: "Old Content",
        source: "Old Source",
        publishedAt: "2024-01-01T00:00:00Z",
        category: "Other",
        url: "https://example.com/old",
      },
      {
        title: "New News",
        summary: "New Summary",
        content: "New Content",
        source: "New Source",
        publishedAt: "2024-12-01T00:00:00Z",
        category: "Technology",
        url: "https://example.com/new",
      },
      {
        title: "Middle News",
        summary: "Middle Summary",
        content: "Middle Content",
        source: "Middle Source",
        publishedAt: "2024-06-01T00:00:00Z",
        category: "Business",
        url: "https://example.com/middle",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
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
    expect(response.data[0].publishedAt).toBe("2024-12-01T00:00:00Z");
    expect(response.data[1].publishedAt).toBe("2024-06-01T00:00:00Z");
    expect(response.data[2].publishedAt).toBe("2024-01-01T00:00:00Z");
  });

  it("handles invalid dates by treating them as oldest", async () => {
    const mockNews = [
      {
        title: "Invalid Date",
        summary: "Invalid Summary",
        content: "Invalid Content",
        source: "Invalid Source",
        publishedAt: "invalid-date",
        category: "Other",
        url: "https://example.com/invalid",
      },
      {
        title: "Valid News",
        summary: "Valid Summary",
        content: "Valid Content",
        source: "Valid Source",
        publishedAt: "2024-12-01T00:00:00Z",
        category: "Technology",
        url: "https://example.com/valid",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
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

    expect(response.data).toHaveLength(2);
    expect(response.data[0].publishedAt).toBe("2024-12-01T00:00:00Z");
    expect(response.data[1].publishedAt).toBe("invalid-date");
  });

  it("handles multiple invalid dates by treating them all as oldest (equal)", async () => {
    const mockNews = [
      {
        title: "First Invalid",
        summary: "First Summary",
        content: "First Content",
        source: "First Source",
        publishedAt: "not-a-date",
        category: "Other",
        url: "https://example.com/first-invalid",
      },
      {
        title: "Second Invalid",
        summary: "Second Summary",
        content: "Second Content",
        source: "Second Source",
        publishedAt: "also-invalid",
        category: "Technology",
        url: "https://example.com/second-invalid",
      },
      {
        title: "Third Invalid",
        summary: "Third Summary",
        content: "Third Content",
        source: "Third Source",
        publishedAt: "",
        category: "Business",
        url: "https://example.com/third-invalid",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
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
    // All should be treated as equal (date 0), so original order should be maintained
    expect(response.data[0].publishedAt).toBe("not-a-date");
    expect(response.data[1].publishedAt).toBe("also-invalid");
    expect(response.data[2].publishedAt).toBe("");
  });

  it("handles null and undefined dates by treating them as oldest", async () => {
    const mockNews = [
      {
        title: "Null Date",
        summary: "Null Summary",
        content: "Null Content",
        source: "Null Source",
        publishedAt: null as any,
        category: "Other",
        url: "https://example.com/null",
      },
      {
        title: "Undefined Date",
        summary: "Undefined Summary",
        content: "Undefined Content",
        source: "Undefined Source",
        publishedAt: undefined as any,
        category: "Technology",
        url: "https://example.com/undefined",
      },
      {
        title: "Valid News",
        summary: "Valid Summary",
        content: "Valid Content",
        source: "Valid Source",
        publishedAt: "2024-12-01T00:00:00Z",
        category: "Business",
        url: "https://example.com/valid",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
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
    expect(response.data[0].publishedAt).toBe("2024-12-01T00:00:00Z");
    expect(response.data[1].publishedAt).toBeNull();
    expect(response.data[2].publishedAt).toBeUndefined();
  });

  it("handles edge case date formats", async () => {
    const mockNews = [
      {
        title: "Epoch Zero",
        summary: "Epoch Summary",
        content: "Epoch Content",
        source: "Epoch Source",
        publishedAt: "1970-01-01T00:00:00Z",
        category: "Other",
        url: "https://example.com/epoch",
      },
      {
        title: "Negative Timestamp",
        summary: "Negative Summary",
        content: "Negative Content",
        source: "Negative Source",
        publishedAt: "1969-12-31T23:59:59Z",
        category: "Technology",
        url: "https://example.com/negative",
      },
      {
        title: "Invalid Format",
        summary: "Invalid Summary",
        content: "Invalid Content",
        source: "Invalid Source",
        publishedAt: "not-a-real-date-at-all",
        category: "Business",
        url: "https://example.com/invalid-format",
      },
      {
        title: "Future Date",
        summary: "Future Summary",
        content: "Future Content",
        source: "Future Source",
        publishedAt: "2025-12-01T00:00:00Z",
        category: "Culture",
        url: "https://example.com/future",
      },
    ];

    (global as any).getQuery.mockReturnValue({ language: "English" });
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

    expect(response.data).toHaveLength(4);
    // Should be sorted: Future > Epoch Zero > Invalid Format > Negative Timestamp
    // Future: 1764547200000, Epoch: 0, Invalid: treated as 0, Negative: -1000
    expect(response.data[0].publishedAt).toBe("2025-12-01T00:00:00Z"); // Future
    expect(response.data[1].publishedAt).toBe("1970-01-01T00:00:00Z"); // Epoch Zero
    expect(response.data[2].publishedAt).toBe("not-a-real-date-at-all"); // Invalid Format (treated as 0)
    expect(response.data[3].publishedAt).toBe("1969-12-31T23:59:59Z"); // Negative Timestamp
  });

  describe("timeRange validation", () => {
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
        { input: "NONE", expected: "week" }, // Should default to week as it's case-sensitive
        { input: "Day", expected: "week" }, // Should default to week as it's case-sensitive
        { input: "WEEK", expected: "week" }, // Should default to week as it's case-sensitive
        { input: "Month", expected: "week" }, // Should default to week as it's case-sensitive
        { input: "YEAR", expected: "week" }, // Should default to week as it's case-sensitive
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

  describe("Zod 4 validation", () => {
    it("rejects when only startDate is provided without endDate", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "2024-01-01",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining(
                "Both startDate and endDate must be provided together",
              ),
            }),
          ]),
        },
      });
    });

    it("rejects when only endDate is provided without startDate", async () => {
      (global as any).getQuery.mockReturnValue({
        endDate: "2024-01-31",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
            }),
          ]),
        },
      });
    });

    it("rejects invalid date format (not YYYY-MM-DD)", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "01/01/2024",
        endDate: "2024-01-31",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining("YYYY-MM-DD"),
            }),
          ]),
        },
      });
    });

    it("rejects date range before minimum date (2000-01-01)", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "1999-12-31",
        endDate: "2000-01-01",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining("Invalid date range"),
            }),
          ]),
        },
      });
    });

    it("rejects future dates", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      (global as any).getQuery.mockReturnValue({
        startDate: futureDateStr,
        endDate: futureDateStr,
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining("Invalid date range"),
            }),
          ]),
        },
      });
    });

    it("rejects when startDate is after endDate", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "2024-12-31",
        endDate: "2024-01-01",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining("Invalid date range"),
            }),
          ]),
        },
      });
    });

    it("rejects date range exceeding 365 days", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "2024-01-01",
        endDate: "2025-01-02", // 367 days later in 2024 (leap year)
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "startDate",
              message: expect.stringContaining("Invalid date range"),
            }),
          ]),
        },
      });
    });

    it("accepts valid date range within limits", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
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
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        apiKey: "test-tavily-key",
      });
    });

    it("handles empty category string", async () => {
      const mockNews = createMockNews();
      (global as any).getQuery.mockReturnValue({
        category: "",
        language: "English",
      });
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

      expect(response.success).toBe(true);
      expect(mockTavilySearch).toHaveBeenCalledWith({
        maxResults: 10,
        category: undefined,
        timeRange: "week",
        apiKey: "test-tavily-key",
      });
    });

    it("handles category with only whitespace", async () => {
      const mockNews = createMockNews();
      (global as any).getQuery.mockReturnValue({
        category: "   ",
        language: "English",
      });
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

      expect(response.success).toBe(true);
      expect(mockTavilySearch).toHaveBeenCalledWith({
        maxResults: 10,
        category: undefined,
        timeRange: "week",
        apiKey: "test-tavily-key",
      });
    });

    it("rejects invalid date format with random characters", async () => {
      (global as any).getQuery.mockReturnValue({
        startDate: "not-a-date",
        endDate: "2024-01-31",
        language: "English",
      });
      mockTavilySearch.mockResolvedValue({ results: [] });
      mockTavilyFormat.mockReturnValue([]);
      mockGeminiCategorize.mockResolvedValue([]);

      await expect(
        handler({
          node: {
            req: {
              socket: { remoteAddress: "127.0.0.1" },
              headers: {},
            },
          },
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Bad Request",
      });
    });
  });
});
