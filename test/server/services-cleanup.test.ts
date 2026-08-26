import { describe, it, expect, vi, beforeEach } from "vitest";

import { cleanupOldDataTask } from "~/server/services/cleanup";

const { mockGetStories, mockDeleteStory } = vi.hoisted(() => ({
  mockGetStories: vi.fn(),
  mockDeleteStory: vi.fn(),
}));

vi.mock("~/server/services/stories", () => ({
  storiesService: {
    getStories: mockGetStories,
    deleteStory: mockDeleteStory,
  },
}));

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

describe("cleanupOldDataTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes only stories older than 30 days", async () => {
    const now = Date.now();
    mockGetStories.mockResolvedValue([
      { id: "stale", headline: "Old", lastUpdated: now - ONE_MONTH_MS - 1000 },
      { id: "fresh", headline: "New", lastUpdated: now },
    ]);

    const result = await cleanupOldDataTask();

    expect(result).toEqual({ success: true, storiesDeleted: 1 });
    expect(mockDeleteStory).toHaveBeenCalledTimes(1);
    expect(mockDeleteStory).toHaveBeenCalledWith("stale");
  });

  it("does not delete anything in dryRun mode, but still reports the count", async () => {
    const now = Date.now();
    mockGetStories.mockResolvedValue([
      { id: "stale", headline: "Old", lastUpdated: now - ONE_MONTH_MS - 1000 },
    ]);

    const result = await cleanupOldDataTask({ dryRun: true });

    expect(result).toEqual({ success: true, storiesDeleted: 1 });
    expect(mockDeleteStory).not.toHaveBeenCalled();
  });

  it("deletes nothing and reports zero when all stories are recent", async () => {
    mockGetStories.mockResolvedValue([
      { id: "fresh", headline: "New", lastUpdated: Date.now() },
    ]);

    const result = await cleanupOldDataTask();

    expect(result).toEqual({ success: true, storiesDeleted: 0 });
    expect(mockDeleteStory).not.toHaveBeenCalled();
  });
});
