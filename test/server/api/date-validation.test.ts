import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockNews as _createMockNews,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

describe("News API - Zod Date Validation", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

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
