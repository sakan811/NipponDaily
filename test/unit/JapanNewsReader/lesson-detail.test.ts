import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, makeLesson, mockNewsResponse } from "./setup";

const twoLessons = () =>
  mockNewsResponse([
    makeLesson({
      id: "lesson-a",
      title: "First Lesson",
      difficultyLevel: "N4",
    }),
    makeLesson({
      id: "lesson-b",
      title: "Second Lesson",
      difficultyLevel: "N2",
    }),
  ]);

describe("JapanNewsReader - Lesson detail navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(twoLessons());
  });

  it("lists lessons with their JLPT badge", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("First Lesson");
    expect(wrapper.text()).toContain("N4");
  });

  it("selects a lesson by clicking its row and shows the LessonCard", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll("li.cursor-pointer");
    expect(rows.length).toBe(2);
    await rows[0]!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedLessonId).toBe("lesson-a");
    expect(wrapper.find(".lesson-card").exists()).toBe(true);
  });

  it("navigates back to the list from the detail view", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedLessonId = "lesson-a";
    await wrapper.vm.$nextTick();

    const backButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Back to lessons"));
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedLessonId).toBeNull();
  });

  it("passes the selected lesson to LessonCard", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedLessonId = "lesson-b";
    await wrapper.vm.$nextTick();

    const card = wrapper.findComponent({ name: "LessonCard" });
    expect(card.exists()).toBe(true);
    expect(card.props("lesson").id).toBe("lesson-b");
  });
});
