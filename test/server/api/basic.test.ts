import { describe, it, expect, beforeEach } from "vitest";

import { getHandler, setupDefaults, createMockStory, mockGetStories, mockGetLastIngestTime } from "./setup";

describe("News API - Basic Functionality", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("returns empty-state briefing when there are no stories", async () => {
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockGetStories.mockResolvedValue([]);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.count).toBe(0);
    expect(response.timestamp).toBeDefined();
    expect(response.data.stories).toEqual([]);
    expect(response.data.mainHeadline).toBe("Latest Japan News Briefing");
    expect(response.data.executiveSummary).toContain(
      "No news stories are currently available",
    );
  });

  it("returns success response with correct structure", async () => {
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockGetStories.mockResolvedValue([createMockStory()]);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("count");
    expect(response).toHaveProperty("timestamp");
    expect(typeof response.timestamp).toBe("string");
  });

  it("handles null parameters by coalescing to undefined or defaults", async () => {
    (global as any).getQuery.mockReturnValue({
      category: null,
      timeRange: null,
      startDate: null,
      endDate: null,
      language: null,
      limit: 5,
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
  });

  it("handles getQuery error fallback to node req url parsing", async () => {
    (global as any).getQuery.mockImplementation(() => {
      throw new Error("getQuery not available");
    });
    mockGetStories.mockResolvedValue([]);

    const response = await handler({
      path: "/api/news?limit=10",
      node: {
        req: {
          url: "/api/news?limit=10",
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
  });

  it("returns stories from the Redis story database", async () => {
    mockGetLastIngestTime.mockResolvedValue(0);
    mockGetStories.mockResolvedValue([
      createMockStory({
        id: "prod-story-1",
        headline: "Production Story 1",
        categories: ["tech"],
      }),
    ]);

    (global as any).getQuery.mockReturnValue({
      category: "tech",
      timeRange: "month",
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

  it("handles empty stories fallback", async () => {
    mockGetLastIngestTime.mockResolvedValue(Date.now());
    mockGetStories.mockResolvedValue([]);

    (global as any).getQuery.mockReturnValue({});

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.mainHeadline).toBe("Latest Japan News Briefing");
    expect(response.data.executiveSummary).toContain(
      "No news stories are currently available",
    );
  });
});
