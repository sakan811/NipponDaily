import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockLesson,
  mockGetLessons,
} from "./setup";

describe("News API - Sorting", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("returns lessons newest article first (publishedAt desc)", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({
        id: "older",
        publishedAt: "2026-01-01T00:00:00Z",
      }),
      createMockLesson({
        id: "newest",
        publishedAt: "2026-03-01T00:00:00Z",
      }),
      createMockLesson({
        id: "middle",
        publishedAt: "2026-02-01T00:00:00Z",
      }),
    ]);
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
    expect(response.data.lessons.map((l: any) => l.id)).toEqual([
      "newest",
      "middle",
      "older",
    ]);
  });
});
