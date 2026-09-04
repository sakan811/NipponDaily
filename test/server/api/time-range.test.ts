import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockStory,
  mockGetStories,
} from "./setup";

describe("News API - Time Range Validation", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  const storyWithSourceAge = (id: string, daysAgo: number) => {
    const publishedAt = new Date(
      Date.now() - daysAgo * 24 * 3600 * 1000,
    ).toISOString();
    return createMockStory({
      id,
      sources: [
        {
          title: `Source ${id}`,
          source: `Source ${id}`,
          url: `https://example.com/${id}`,
          publishedAt,
          credibilityScore: 0.9,
          addedAt: Date.now(),
        },
      ],
    });
  };

  it("accepts valid timeRange values", async () => {
    const validTimeRanges = ["none", "day", "week"];

    for (const timeRange of validTimeRanges) {
      (global as any).getQuery.mockReturnValue({
        timeRange,
        language: "en",
      });
      mockGetStories.mockResolvedValue([createMockStory()]);

      const response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
    }
  });

  it("defaults to 'week' when invalid timeRange is provided", async () => {
    // Story published 10 days ago is outside the "week" window
    mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
    (global as any).getQuery.mockReturnValue({
      timeRange: "invalid",
      language: "en",
    });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories).toHaveLength(0);
  });

  it("defaults to 'week' when timeRange is not provided", async () => {
    mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
    (global as any).getQuery.mockReturnValue({ language: "en" });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories).toHaveLength(0);
  });

  it("accepts timeRange case variations by normalizing to 'week'", async () => {
    const testCases = ["NONE", "Day", "WEEK"];

    for (const input of testCases) {
      mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
      (global as any).getQuery.mockReturnValue({
        timeRange: input,
        language: "en",
      });

      const response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
      // Every case variation is treated as invalid input and normalized to "week"
      expect(response.data.stories).toHaveLength(0);
    }
  });

  it("treats removed 'month' and 'year' values as invalid and normalizes to 'week'", async () => {
    const testCases = ["month", "year"];

    for (const timeRange of testCases) {
      mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
      (global as any).getQuery.mockReturnValue({
        timeRange,
        language: "en",
      });

      const response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
      // "month"/"year" are no longer supported (stories are pruned after 30 days),
      // so they fall back to the "week" default like any other invalid value.
      expect(response.data.stories).toHaveLength(0);
    }
  });

  it("handles empty string timeRange by defaulting to 'week'", async () => {
    mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
    (global as any).getQuery.mockReturnValue({
      timeRange: "",
      language: "en",
    });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories).toHaveLength(0);
  });

  it("handles null and undefined timeRange values by defaulting to 'week'", async () => {
    const testCases = [null, undefined];

    for (const timeRange of testCases) {
      mockGetStories.mockResolvedValue([storyWithSourceAge("old", 10)]);
      (global as any).getQuery.mockReturnValue({
        timeRange,
        language: "en",
      });

      const response = await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.stories).toHaveLength(0);
    }
  });

  it("validates timeRange alongside other parameters", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "recent", categories: ["tech"] }),
    ]);
    (global as any).getQuery.mockReturnValue({
      timeRange: "week",
      category: "tech",
      limit: "5",
      language: "en",
    });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories).toHaveLength(1);
  });

  it("includes a story within the 'day' window and excludes one outside it", async () => {
    mockGetStories.mockResolvedValue([
      storyWithSourceAge("recent", 0),
      storyWithSourceAge("old", 2),
    ]);
    (global as any).getQuery.mockReturnValue({ timeRange: "day" });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories.map((s: any) => s.id)).toEqual(["recent"]);
  });
});
