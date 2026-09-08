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

describe("News API - Free-text query search", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("matches lessons whose title contains the query, case-insensitively", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", title: "Tokyo Earthquake Update" }),
      createMockLesson({ id: "b", title: "Osaka Food Festival" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "earthquake" });

    const response = await handler(mockEvent);

    expect(response.data.lessons.map((l: any) => l.id)).toEqual(["a"]);
  });

  it("matches lessons whose titleJa or originalText contains the query", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({
        id: "a",
        title: "Unrelated",
        titleJa: "新幹線が九州で開業",
        originalText: "日本語の本文です。",
      }),
      createMockLesson({
        id: "b",
        title: "Something else",
        titleJa: "別の見出し",
        originalText: "関係ない文章。",
      }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "新幹線" });

    const response = await handler(mockEvent);

    expect(response.data.lessons.map((l: any) => l.id)).toEqual(["a"]);
  });

  it("returns no lessons when nothing matches the query", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", title: "Tokyo Earthquake Update" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "nonexistent-topic" });

    const response = await handler(mockEvent);

    expect(response.data.lessons).toEqual([]);
    expect(response.count).toBe(0);
  });

  it("treats a whitespace-only query as no query filter", async () => {
    mockGetLessons.mockResolvedValue([
      createMockLesson({ id: "a", title: "Tokyo Earthquake Update" }),
    ]);
    (global as any).getQuery.mockReturnValue({ query: "   " });

    const response = await handler(mockEvent);

    expect(response.data.lessons.map((l: any) => l.id)).toEqual(["a"]);
  });

  it("rejects a query longer than 100 characters", async () => {
    mockGetLessons.mockResolvedValue([createMockLesson()]);
    (global as any).getQuery.mockReturnValue({ query: "x".repeat(101) });

    await expect(handler(mockEvent)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
