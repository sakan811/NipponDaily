import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockLesson,
  mockGetLessons,
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

  it("filters lessons by difficultyLevel", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "n5", difficultyLevel: "N5" }),
      createMockLesson({ id: "n2", difficultyLevel: "N2" }),
      createMockLesson({ id: "n3", difficultyLevel: "N3" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "N2" });

    const response = await callHandler(handler);

    expect(response.data.lessons).toHaveLength(1);
    expect(response.data.lessons[0].id).toBe("n2");
  });

  it("is case-insensitive on the level code", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "n3", difficultyLevel: "N3" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "n3" });

    const response = await callHandler(handler);

    expect(response.data.lessons).toHaveLength(1);
  });

  it("ignores an invalid difficulty value and returns everything", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", difficultyLevel: "N5" }),
      createMockLesson({ id: "b", difficultyLevel: "N3" }),
    ]);
    (global as any).getQuery.mockReturnValue({ difficulty: "N7" });

    const response = await callHandler(handler);

    expect(response.data.lessons).toHaveLength(2);
  });
});
