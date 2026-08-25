import { describe, it, expect, beforeEach } from "vitest";

import { getHandler, setupDefaults, createMockStory, mockGetStories } from "./setup";

describe("News API - Category Filter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("filters stories by category", async () => {
    const techStory = createMockStory({ id: "tech-1", categories: ["tech"] });
    const foodStory = createMockStory({
      id: "food-1",
      categories: ["food"],
      sources: [
        {
          title: "Food Source",
          source: "Food Source",
          url: "https://example.com/food",
          publishedAt: new Date().toISOString(),
          credibilityScore: 0.9,
          addedAt: Date.now(),
          category: "food",
        },
      ],
    });
    mockGetStories.mockResolvedValue([techStory, foodStory]);
    (global as any).getQuery.mockReturnValue({ category: "tech" });

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
    expect(response.data.stories[0].id).toBe("tech-1");
  });

  it('returns all stories when category is "all"', async () => {
    const techStory = createMockStory({ id: "tech-1", categories: ["tech"] });
    const foodStory = createMockStory({ id: "food-1", categories: ["food"] });
    mockGetStories.mockResolvedValue([techStory, foodStory]);
    (global as any).getQuery.mockReturnValue({ category: "all" });

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.success).toBe(true);
    expect(response.data.stories).toHaveLength(2);
  });

  it("handles empty category string", async () => {
    const techStory = createMockStory({ id: "tech-1", categories: ["tech"] });
    mockGetStories.mockResolvedValue([techStory]);
    (global as any).getQuery.mockReturnValue({
      category: "",
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

  it("handles category with only whitespace", async () => {
    const techStory = createMockStory({ id: "tech-1", categories: ["tech"] });
    mockGetStories.mockResolvedValue([techStory]);
    (global as any).getQuery.mockReturnValue({
      category: "   ",
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

  it("matches by source category when story-level categories don't include it", async () => {
    const story = createMockStory({
      id: "mixed-1",
      categories: ["society"],
      sources: [
        {
          title: "Tech Source",
          source: "Tech Source",
          url: "https://example.com/tech",
          publishedAt: new Date().toISOString(),
          credibilityScore: 0.9,
          addedAt: Date.now(),
          category: "tech",
        },
      ],
    });
    mockGetStories.mockResolvedValue([story]);
    (global as any).getQuery.mockReturnValue({ category: "tech" });

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
});
