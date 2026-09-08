import { describe, it, expect, vi, beforeEach } from "vitest";

import { cleanupOldDataTask } from "~/server/services/cleanup";

const { mockGetLessons, mockDeleteLesson } = vi.hoisted(() => ({
  mockGetLessons: vi.fn(),
  mockDeleteLesson: vi.fn(),
}));

vi.mock("~/server/services/lessons", () => ({
  lessonsService: {
    getLessons: mockGetLessons,
    deleteLesson: mockDeleteLesson,
  },
}));

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

describe("cleanupOldDataTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes only lessons whose article is older than 30 days", async () => {
    const now = Date.now();
    mockGetLessons.mockResolvedValue([
      {
        id: "stale",
        title: "Old",
        publishedAt: new Date(now - ONE_MONTH_MS - 1000).toISOString(),
      },
      { id: "fresh", title: "New", publishedAt: new Date(now).toISOString() },
    ]);

    const result = await cleanupOldDataTask();

    expect(result).toEqual({ success: true, lessonsDeleted: 1 });
    expect(mockDeleteLesson).toHaveBeenCalledTimes(1);
    expect(mockDeleteLesson).toHaveBeenCalledWith("stale");
  });

  it("does not delete anything in dryRun mode, but still reports the count", async () => {
    const now = Date.now();
    mockGetLessons.mockResolvedValue([
      {
        id: "stale",
        title: "Old",
        publishedAt: new Date(now - ONE_MONTH_MS - 1000).toISOString(),
      },
    ]);

    const result = await cleanupOldDataTask({ dryRun: true });

    expect(result).toEqual({ success: true, lessonsDeleted: 1 });
    expect(mockDeleteLesson).not.toHaveBeenCalled();
  });

  it("deletes nothing and reports zero when all lessons are recent", async () => {
    mockGetLessons.mockResolvedValue([
      {
        id: "fresh",
        title: "New",
        publishedAt: new Date().toISOString(),
      },
    ]);

    const result = await cleanupOldDataTask();

    expect(result).toEqual({ success: true, lessonsDeleted: 0 });
    expect(mockDeleteLesson).not.toHaveBeenCalled();
  });
});
