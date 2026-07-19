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

    (global as any).getQuery.mockReturnValue({ language: "en" });
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

    (global as any).getQuery.mockReturnValue({ language: "en" });
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

    (global as any).getQuery.mockReturnValue({ language: "en" });
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

    (global as any).getQuery.mockReturnValue({ language: "en" });
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

    (global as any).getQuery.mockReturnValue({ language: "en" });
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

  it("falls back to en-US locale when an unsupported language tag causes Intl.DateTimeFormat to throw", async () => {
    // Use a locale string that will cause Intl.DateTimeFormat to throw a RangeError
    // This exercises the catch block at news.get.ts line ~213
    const mockNews = [
      {
        title: "News A",
        summary: "Summary A",
        content: "Content A",
        source: "Source A",
        publishedAt: "2024-01-01T00:00:00Z",
        category: "Technology",
        url: "https://example.com/a",
      },
      {
        title: "News B",
        summary: "Summary B",
        content: "Content B",
        source: "Source B",
        publishedAt: "2024-06-15T00:00:00Z",
        category: "Business",
        url: "https://example.com/b",
      },
    ];

    // "x-invalid" is not a valid BCP 47 language tag and causes Intl.DateTimeFormat to throw
    (global as any).getQuery.mockReturnValue({
      language: "x-invalid",
    });
    mockTavilySearch.mockResolvedValue({ results: [] });
    mockTavilyFormat.mockReturnValue(mockNews);
    mockGeminiCategorize.mockResolvedValue({ sourcesProcessed: [] });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    // The request should still succeed even with an invalid locale
    expect(response.success).toBe(true);
    // The date range should still be formatted (using en-US fallback)
    expect(typeof response.data.publishTimeRange).toBe("string");
    expect(response.data.publishTimeRange).not.toBe("Recent");
  });

  it("sorts stories primary by number of sources descending, and secondary by lastUpdated descending", async () => {
    // @ts-expect-error - alias resolution in vitest
    const { storiesService } = await import("~/server/services/stories");

    // Clear all stories first
    await storiesService.clearAllStories();

    const now = Date.now();

    // Story A: 3 sources, lastUpdated = 1000
    const storyA = {
      id: "story-a",
      headline: "Story A with 3 sources",
      summary: "Summary A",
      thematicAnalysis: "Analysis A",
      articleCount: 3,
      firstSeen: 1000,
      lastUpdated: 1000,
      trendScore: 3,
      sources: [
        {
          title: "S1",
          source: "S1",
          url: "url1",
          publishedAt: "2024-01-01",
          credibilityScore: 0.8,
          addedAt: now - 1 * 3600 * 1000,
        },
        {
          title: "S2",
          source: "S2",
          url: "url2",
          publishedAt: "2024-01-02",
          credibilityScore: 0.8,
          addedAt: now - 2 * 3600 * 1000,
        },
        {
          title: "S3",
          source: "S3",
          url: "url3",
          publishedAt: "2024-01-03",
          credibilityScore: 0.8,
          addedAt: now - 3 * 3600 * 1000,
        },
      ],
      categories: ["other"],
    };

    // Story B: 1 source, lastUpdated = 3000
    const storyB = {
      id: "story-b",
      headline: "Story B with 1 source",
      summary: "Summary B",
      thematicAnalysis: "Analysis B",
      articleCount: 1,
      firstSeen: 3000,
      lastUpdated: 3000,
      trendScore: 1,
      sources: [
        {
          title: "S4",
          source: "S4",
          url: "url4",
          publishedAt: "2024-01-04",
          credibilityScore: 0.8,
          addedAt: now - 4 * 3600 * 1000,
        },
      ],
      categories: ["other"],
    };

    // Story C: 3 sources, lastUpdated = 2000 (same sources count as Story A but more recently updated)
    const storyC = {
      id: "story-c",
      headline: "Story C with 3 sources but newer",
      summary: "Summary C",
      thematicAnalysis: "Analysis C",
      articleCount: 3,
      firstSeen: 2000,
      lastUpdated: 2000,
      trendScore: 3,
      sources: [
        {
          title: "S5",
          source: "S5",
          url: "url5",
          publishedAt: "2024-01-05",
          credibilityScore: 0.8,
          addedAt: now - 5 * 3600 * 1000,
        },
        {
          title: "S6",
          source: "S6",
          url: "url6",
          publishedAt: "2024-01-06",
          credibilityScore: 0.8,
          addedAt: now - 6 * 3600 * 1000,
        },
        {
          title: "S7",
          source: "S7",
          url: "url7",
          publishedAt: "2024-01-07",
          credibilityScore: 0.8,
          addedAt: now - 7 * 3600 * 1000,
        },
      ],
      categories: ["other"],
    };

    await storiesService.saveStory(storyA);
    await storiesService.saveStory(storyB);
    await storiesService.saveStory(storyC);

    (global as any).getQuery.mockReturnValue({
      language: "en",
      timeRange: "none",
    });

    // Enable DB mode for testing the endpoint
    process.env.TEST_DB_MODE = "true";

    let response;
    try {
      response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
        waitUntil: () => {},
      });
    } finally {
      delete process.env.TEST_DB_MODE;
    }

    expect(response.success).toBe(true);
    expect(response.data.stories).toBeDefined();
    expect(response.data.stories).toHaveLength(3);

    // Sort order should be: Story C (3 sources, lastUpdated 2000) > Story A (3 sources, lastUpdated 1000) > Story B (1 source, lastUpdated 3000)
    expect(response.data.stories[0].id).toBe("story-c");
    expect(response.data.stories[1].id).toBe("story-a");
    expect(response.data.stories[2].id).toBe("story-b");

    // Clean up
    await storiesService.clearAllStories();
  });
});
