import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockStory,
  mockGetStories,
} from "./setup";

const callHandler = (handler: any) =>
  handler({
    node: {
      req: {
        socket: { remoteAddress: "127.0.0.1" },
        headers: {},
      },
    },
  });

describe("News API - Difficulty (JLPT) Filter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("filters stories by difficultyLevel", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "n5", difficultyLevel: "N5" }),
      createMockStory({ id: "n2", difficultyLevel: "N2" }),
      createMockStory({ id: "none" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "N2" });

    const response = await callHandler(handler);

    expect(response.data.stories).toHaveLength(1);
    expect(response.data.stories[0].id).toBe("n2");
  });

  it("is case-insensitive on the level code", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "n3", difficultyLevel: "N3" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "n3" });

    const response = await callHandler(handler);

    expect(response.data.stories).toHaveLength(1);
  });

  it("ignores an invalid difficulty value and returns everything", async () => {
    mockGetStories.mockResolvedValue([
      createMockStory({ id: "a", difficultyLevel: "N5" }),
      createMockStory({ id: "b" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "N7" });

    const response = await callHandler(handler);

    expect(response.data.stories).toHaveLength(2);
  });
});
