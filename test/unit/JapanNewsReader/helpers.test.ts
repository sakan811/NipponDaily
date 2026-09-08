import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, mockNewsResponse } from "./setup";

describe("JapanNewsReader - Formatting helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(mockNewsResponse());
  });

  describe("getRelativeTime", () => {
    it("returns 'Just now' for a timestamp under a minute old", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getRelativeTime(Date.now())).toBe("Just now");
    });

    it("returns minutes-ago for a timestamp under an hour old", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getRelativeTime(Date.now() - 5 * 60 * 1000)).toBe(
        "5m ago",
      );
    });

    it("returns hours-ago for a timestamp under a day old", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.getRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe(
        "3h ago",
      );
    });

    it("returns days-ago for a timestamp a day or more old", () => {
      const wrapper = mountReader();
      expect(
        wrapper.vm.getRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ).toBe("2d ago");
    });
  });

  describe("displaySource", () => {
    it("strips protocol and www prefix from a source domain", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.displaySource("https://www3.nhk.or.jp")).toBe(
        "nhk.or.jp",
      );
    });

    it("returns the input unchanged when it is not a URL", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.displaySource("not a url")).toBe("not a url");
    });
  });

  describe("lastUpdatedText", () => {
    it("shows the awaiting message when there is no ingest time", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.lastUpdatedText).toBe("Awaiting first update");
    });
  });

  describe("selectedLesson", () => {
    it("is null when nothing is selected", () => {
      const wrapper = mountReader();
      expect(wrapper.vm.selectedLessonId).toBeNull();
      expect(wrapper.vm.selectedLesson).toBeNull();
    });
  });
});
