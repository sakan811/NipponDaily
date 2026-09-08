import { describe, it, expect, beforeEach } from "vitest";

import {
  getHandler,
  setupDefaults,
  createMockLesson,
  mockGetLessons,
} from "./setup";

const mockEvent = {
  node: {
    req: {
      socket: { remoteAddress: "127.0.0.1" },
      headers: {},
    },
  },
};

const manyLessons = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    createMockLesson({ id: `lesson-${i}`, title: `Lesson ${i}` }),
  );

describe("News API - Limit Parameter", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("applies limit parameter", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "3" });
    mockGetLessons.mockResolvedValue(manyLessons(5));

    const response = await handler(mockEvent);

    expect(response.data.lessons).toHaveLength(3);
    expect(response.count).toBe(3);
  });

  it("falls back to the default of 20 for an invalid limit", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "invalid" });
    mockGetLessons.mockResolvedValue(manyLessons(25));

    const response = await handler(mockEvent);

    expect(response.data.lessons).toHaveLength(20);
  });

  it("uses the default limit when limit is null or undefined", async () => {
    mockGetLessons.mockResolvedValue(manyLessons(25));

    (global as any).getQuery.mockReturnValue({ limit: null });
    let response = await handler(mockEvent);
    expect(response.data.lessons).toHaveLength(20);

    (global as any).getQuery.mockReturnValue({ limit: undefined });
    response = await handler(mockEvent);
    expect(response.data.lessons).toHaveLength(20);
  });

  it("clamps limit above the maximum of 20", async () => {
    (global as any).getQuery.mockReturnValue({ limit: "50" });
    mockGetLessons.mockResolvedValue(manyLessons(25));

    const response = await handler(mockEvent);

    expect(response.data.lessons).toHaveLength(20);
  });
});
