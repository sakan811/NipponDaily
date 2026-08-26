import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockStory,
  mockGetStories,
} from "./setup";

const mockEvent = {
  node: {
    req: {
      socket: { remoteAddress: "127.0.0.1" },
      headers: {},
    },
  },
};

describe("News API - Free-text query search", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("matches stories whose headline contains the query, case-insensitively", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "a", headline: "Tokyo Earthquake Update" }),
      createMockStory({ id: "b", headline: "Osaka Food Festival" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "earthquake" });

    const response = await handler(mockEvent);

    expect(response.data.stories.map((s: any) => s.id)).toEqual(["a"]);
  });

  it("matches stories whose summary contains the query", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({
        id: "a",
        headline: "Unrelated Headline",
        summary: "- Discusses the new bullet train line",
      }),
      createMockStory({ id: "b", headline: "Other Story", summary: "- n/a" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "bullet train" });

    const response = await handler(mockEvent);

    expect(response.data.stories.map((s: any) => s.id)).toEqual(["a"]);
  });

  it("returns no stories when nothing matches the query", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "a", headline: "Tokyo Earthquake Update" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "nonexistent-topic" });

    const response = await handler(mockEvent);

    expect(response.data.stories).toEqual([]);
    expect(response.count).toBe(0);
  });

  it("treats a whitespace-only query as no query filter", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "a", headline: "Tokyo Earthquake Update" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "   " });

    const response = await handler(mockEvent);

    expect(response.data.stories.map((s: any) => s.id)).toEqual(["a"]);
  });

  it("excludes sourceless stories from a custom date-range filter", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "no-sources", sources: [] }),
    ]);
    (global as any).getQuery.mockReturnValue({
      startDate: "2020-01-01",
      endDate: "2020-01-31",
    });

    const response = await handler(mockEvent);

    expect(response.data.stories).toEqual([]);
  });

  it("excludes sourceless stories from a relative time-range filter", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "no-sources", sources: [] }),
    ]);
    (global as any).getQuery.mockReturnValue({ timeRange: "day" });

    const response = await handler(mockEvent);

    expect(response.data.stories).toEqual([]);
  });
});
