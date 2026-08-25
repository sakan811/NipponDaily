import { describe, it, expect, beforeEach } from "vitest";

import { getHandler, setupDefaults, mockGetStories } from "./setup";

describe("News API - Sorting", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("sorts stories primary by number of sources descending, and secondary by lastUpdated descending", async () => {
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
      categories: ["society"],
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
      categories: ["society"],
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
      categories: ["society"],
    };

    mockGetStories.mockResolvedValue([storyA, storyB, storyC]);

    (global as any).getQuery.mockReturnValue({
      language: "en",
      timeRange: "none",
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
    expect(response.data.stories).toBeDefined();
    expect(response.data.stories).toHaveLength(3);

    // Sort order should be: Story C (3 sources, lastUpdated 2000) > Story A (3 sources, lastUpdated 1000) > Story B (1 source, lastUpdated 3000)
    expect(response.data.stories[0].id).toBe("story-c");
    expect(response.data.stories[1].id).toBe("story-a");
    expect(response.data.stories[2].id).toBe("story-b");
  });
});
