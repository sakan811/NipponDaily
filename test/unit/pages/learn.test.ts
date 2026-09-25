import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useRoute } from "#app";
import LearnPage from "~/app/pages/learn/index.vue";
import LessonPage from "~/app/pages/learn/[lesson].vue";
import { LESSONS, LESSON_STAGES } from "~/app/data/lessons";
import { LESSON_PROGRESS_STORAGE_KEY } from "~/app/composables/useLessonProgress";

const mockRoute = (lesson: string) => {
  (useRoute as any).mockReturnValue({
    path: `/learn/${lesson}`,
    query: {},
    params: { lesson },
  });
};

describe("Lesson path page (/learn)", () => {
  beforeEach(() => {
    localStorage.clear();
    (global.$fetch as any).mockReset?.();
  });

  it("lists every stage and links every lesson", () => {
    const wrapper = mount(LearnPage);
    for (const stage of LESSON_STAGES) {
      expect(wrapper.text()).toContain(stage.title);
    }
    for (const lesson of LESSONS) {
      expect(wrapper.find(`a[href="/learn/${lesson.number}"]`).exists()).toBe(
        true,
      );
    }
  });

  it("offers to start at lesson 1, then continue from saved progress", async () => {
    let wrapper = mount(LearnPage);
    await flushPromises();
    expect(wrapper.find('[data-testid="learn-continue"]').text()).toContain(
      "Start Lesson 1",
    );

    localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, "[1,2]");
    wrapper = mount(LearnPage);
    await flushPromises();
    expect(wrapper.find('[data-testid="learn-continue"]').text()).toContain(
      "Continue with Lesson 3",
    );
  });
});

describe("Lesson page (/learn/[lesson])", () => {
  beforeEach(() => {
    localStorage.clear();
    (global.$fetch as any).mockReset?.();
  });

  it("renders the lesson's pattern, words, kanji breakdown and next link", async () => {
    const lesson = LESSONS.find((l) => l.clusterKey === "weekdays")!;
    mockRoute(String(lesson.number));
    (global.$fetch as any).mockImplementation(async (url: string) =>
      url === "/api/n5-kanji"
        ? {
            success: true,
            data: [
              {
                id: "曜",
                character: "曜",
                meanings: ["weekday"],
                onyomi: ["ヨウ"],
                kunyomi: [],
                strokeCount: 18,
                jlptLevel: "N5",
              },
            ],
          }
        : {
            success: true,
            data: [
              {
                id: "月曜日",
                term: "月曜日",
                kana: "げつようび",
                romaji: "getsuyoubi",
                meaning: "Monday",
                jlptLevel: "N5",
              },
            ],
          },
    );

    const wrapper = mount(LessonPage);
    await flushPromises();

    expect(wrapper.text()).toContain(lesson.title);
    expect(wrapper.text()).toContain(lesson.insight);
    expect(wrapper.text()).toContain("Monday");
    expect(wrapper.find('[data-testid="lesson-word-kanji"]').text()).toContain(
      "月",
    );
    expect(wrapper.find('[data-testid="lesson-kanji"]').text()).toContain(
      "weekday",
    );
    expect(wrapper.find('[data-testid="lesson-next"]').text()).toContain(
      `Next: Lesson ${lesson.number + 1}`,
    );
  });

  it("can be marked complete by hand", async () => {
    mockRoute("1");
    const wrapper = mount(LessonPage);
    await flushPromises();
    await wrapper
      .find('[data-testid="lesson-toggle-complete"]')
      .trigger("click");
    expect(wrapper.find('[data-testid="lesson-done-badge"]').exists()).toBe(
      true,
    );
    expect(localStorage.getItem(LESSON_PROGRESS_STORAGE_KEY)).toBe("[1]");
  });

  it("shows a not-found state for an unknown lesson", () => {
    mockRoute("9999");
    const wrapper = mount(LessonPage);
    expect(wrapper.text()).toContain("That lesson doesn't exist.");
  });
});
