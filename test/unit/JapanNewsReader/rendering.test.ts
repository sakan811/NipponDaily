import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, makeLesson, mockNewsResponse } from "./setup";

describe("JapanNewsReader - Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(mockNewsResponse());
  });

  it("renders the main component structure", () => {
    const wrapper = mountReader();
    expect(wrapper.find(".container").exists()).toBe(true);
  });

  it("renders the JLPT difficulty filter buttons", () => {
    const wrapper = mountReader();
    const labels = wrapper.findAll("button").map((b) => b.text());
    expect(labels).toEqual(
      expect.arrayContaining(["All Levels", "N5", "N4", "N3", "N2", "N1"]),
    );
  });

  it("exposes refreshNews", () => {
    const wrapper = mountReader();
    expect(typeof wrapper.vm.refreshNews).toBe("function");
  });

  it("renders a list of lessons after fetching", async () => {
    (global as any).$fetch = vi
      .fn()
      .mockResolvedValue(
        mockNewsResponse([
          makeLesson({ id: "a", title: "First Lesson" }),
          makeLesson({ id: "b", title: "Second Lesson" }),
        ]),
      );
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.lessons).toHaveLength(2);
    expect(wrapper.text()).toContain("First Lesson");
    expect(wrapper.text()).toContain("Second Lesson");
  });

  it("shows the LessonCard when a lesson is selected", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedLessonId = "lesson-1";
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".lesson-card").exists()).toBe(true);
  });

  it("binds mobileMenuOpen to the header", () => {
    const wrapper = mountReader();
    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find(".u-header").exists()).toBe(true);
  });

  it("passes the difficulty filter to the API query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockNewsResponse());
    (global as any).$fetch = fetchMock;
    const wrapper = mountReader();

    wrapper.vm.selectedDifficulty = "N4";
    await wrapper.vm.$nextTick();
    await wrapper.vm.refreshNews();

    const lastCall = fetchMock.mock.calls.at(-1);
    expect(lastCall[0]).toBe("/api/news");
    expect(lastCall[1].query.difficulty).toBe("N4");
  });
});
