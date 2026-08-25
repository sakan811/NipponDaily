import { describe, it, expect, beforeEach } from "vitest";

import { getHandler, setupDefaults, createMockStory, mockGetStories } from "./setup";

describe("News API - Limit Parameter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("applies limit parameter", async () => {
    const mockStories = Array.from({ length: 5 }, (_, i) =>
      createMockStory({ id: `story-${i}`, headline: `Story ${i}` }),
    );

    (global as any).getQuery.mockReturnValue({ limit: "3" });
    mockGetStories.mockResolvedValue(mockStories);

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.data.stories).toHaveLength(3);
    expect(response.count).toBe(3);
  });

  it("handles invalid limit parameter", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "invalid" });
    mockGetStories.mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => createMockStory({ id: `story-${i}` })),
    );

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    // Invalid limit falls back to the default of 20
    expect(response.data.stories).toHaveLength(20);
  });

  it("uses default limit when limit is null or undefined", async () => {
    mockGetStories.mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => createMockStory({ id: `story-${i}` })),
    );

    (global as any).getQuery.mockReturnValue({ limit: null });
    let response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });
    expect(response.data.stories).toHaveLength(20);

    (global as any).getQuery.mockReturnValue({ limit: undefined });
    response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });
    expect(response.data.stories).toHaveLength(20);
  });

  it("handles NaN limit by defaulting to 20", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "not-a-number" });
    mockGetStories.mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => createMockStory({ id: `story-${i}` })),
    );

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.data.stories).toHaveLength(20);
  });

  it("clamps limit above the maximum of 20", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "50" });
    mockGetStories.mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => createMockStory({ id: `story-${i}` })),
    );

    const response = await handler({
      node: {
        req: {
          socket: { remoteAddress: "127.0.0.1" },
          headers: {},
        },
      },
    });

    expect(response.data.stories).toHaveLength(20);
  });
});
