import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  mockTavilySearch,
  mockTavilyFormat,
  mockGeminiCategorize,
} from "./setup";

describe("News API - Sorting", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
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
});
