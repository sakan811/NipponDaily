import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Formatting helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });
  });

  describe("getStoryTimeRange", () => {
    it("returns 'Recent' for a null story", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getStoryTimeRange(null)).toBe("Recent");
    });

    it("returns 'Recent' for a story with no sources", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getStoryTimeRange({ sources: [] } as any)).toBe(
        "Recent",
      );
    });

    it("returns 'Recent' when every source has an unparseable publishedAt", () => {
      const wrapper = mountReader();
      expect(
        wrapper.vm.getStoryTimeRange({
          sources: [{ publishedAt: "not-a-date" }],
        } as any),
      ).toBe("Recent");
    });

    it("formats a single-day range as one date", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getStoryTimeRange({
        sources: [
          { publishedAt: "2026-03-05T08:00:00Z" },
          { publishedAt: "2026-03-05T18:00:00Z" },
        ],
      } as any);
      expect(result).toMatch(/Mar 5, 2026/);
    });

    it("formats a same-month range as 'Mon D - D, YYYY'", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getStoryTimeRange({
        sources: [
          { publishedAt: "2026-03-05T08:00:00Z" },
          { publishedAt: "2026-03-09T08:00:00Z" },
        ],
      } as any);
      expect(result).toBe("Mar 5 - 9, 2026");
    });

    it("formats a same-year, different-month range as 'Mon D - Mon D, YYYY'", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getStoryTimeRange({
        sources: [
          { publishedAt: "2026-03-05T08:00:00Z" },
          { publishedAt: "2026-05-09T08:00:00Z" },
        ],
      } as any);
      expect(result).toBe("Mar 5 - May 9, 2026");
    });

    it("formats a cross-year range as 'Mon D, YYYY - Mon D, YYYY'", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getStoryTimeRange({
        sources: [
          { publishedAt: "2025-12-01T08:00:00Z" },
          { publishedAt: "2026-01-20T08:00:00Z" },
        ],
      } as any);
      expect(result).toBe("Dec 1, 2025 - Jan 20, 2026");
    });
  });

  describe("getRelativeTime", () => {
    it("returns 'Just now' for a timestamp under a minute old", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getRelativeTime(Date.now())).toBe("Just now");
    });

    it("returns minutes-ago for a timestamp under an hour old", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getRelativeTime(Date.now() - 5 * 60 * 1000);
      expect(result).toBe("5m ago");
    });

    it("returns hours-ago for a timestamp under a day old", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getRelativeTime(
        Date.now() - 3 * 60 * 60 * 1000,
      );
      expect(result).toBe("3h ago");
    });

    it("returns days-ago for a timestamp a day or more old", () => {
      const wrapper = mountReader();
      const result = wrapper.vm.getRelativeTime(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      );
      expect(result).toBe("2d ago");
    });
  });

  describe("getTimeRangeLabel", () => {
    it("returns the raw id for an unrecognized time range id", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getTimeRangeLabel("unknown-range")).toBe(
        "unknown-range",
      );
    });
  });

  describe("null-story computed fallbacks", () => {
    it("activeStory, activeBriefingData, and chronologicalSources fall back when nothing is selected", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.selectedStoryId).toBeNull();
      expect(wrapper.vm.activeStory).toBeNull();
      expect(wrapper.vm.activeBriefingData).toBeNull();
      expect(wrapper.vm.chronologicalSources).toEqual([]);
    });
  });
});
