import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockLesson,
  mockGetLessons,
  mockGetLastIngestTime,
} from "./setup";

const mockEvent = {
  node: {
    req: {
      socket: { remoteAddress: "127.0.0.1" },
      headers: {},
    },
  },
};

describe("News API - Basic Functionality", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("returns an empty lessons list when there are none", async () => {
    (global as any).getQuery.mockReturnValue({});
    mockGetLessons.mockResolvedValue([]);

    const response = await handler(mockEvent);

    expect(response.success).toBe(true);
    expect(response.count).toBe(0);
    expect(response.timestamp).toBeDefined();
    expect(response.data.lessons).toEqual([]);
  });

  it("returns success response with correct structure", async () => {
    (global as any).getQuery.mockReturnValue({});
    mockGetLessons.mockResolvedValue([createMockLesson()]);

    const response = await handler(mockEvent);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("count", 1);
    expect(typeof response.timestamp).toBe("string");
    expect(response.data.lessons[0].title).toBe("Tech News");
    expect(response.data).toHaveProperty("lastIngestTime");
  });

  it("handles null parameters by coalescing to undefined or defaults", async () => {
    (global as any).getQuery.mockReturnValue({
      difficulty: null,
      query: null,
      limit: 5,
    });
    mockGetLessons.mockResolvedValue([createMockLesson()]);

    const response = await handler(mockEvent);

    expect(response.success).toBe(true);
  });

  it("handles getQuery error fallback to node req url parsing", async () => {
    (global as any).getQuery.mockImplementation(() => {
      throw new Error("getQuery not available");
    });
    mockGetLessons.mockResolvedValue([]);

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

  it("returns lessons from the Redis lesson database", async () => {
    mockGetLastIngestTime.mockResolvedValue(0);
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "prod-1", title: "Production Lesson 1" }),
    ]);
    (global as any).getQuery.mockReturnValue({});

    const response = await handler(mockEvent);

    expect(response.success).toBe(true);
    expect(response.data.lessons).toHaveLength(1);
    expect(response.data.lessons[0].id).toBe("prod-1");
  });
});
