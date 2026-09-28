import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useRoute } from "#app";
import LearnPage from "~/app/pages/learn/index.vue";
import LessonPage from "~/app/pages/learn/[lesson].vue";
import { LESSONS, LESSON_STAGES } from "~/app/data/lessons";
import { N4_LESSONS } from "~/app/data/lessons-n4";

const mockRoute = (lesson: string, level?: string) => {
  (useRoute as any).mockReturnValue({
    path: `/learn/${lesson}`,
    query: level ? { level } : {},
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
      expect(
        wrapper.find(`a[href="/learn/${lesson.number}?level=N5"]`).exists(),
      ).toBe(true);
    }
  });

  it("explains how lessons, the vocab guide and the game differ", () => {
    const roles = mount(LearnPage).find('[data-testid="learn-roles"]');
    expect(roles.find('a[href="/vocab?level=N5"]').exists()).toBe(true);
    expect(roles.find('a[href="/game"]').exists()).toBe(true);
  });

  it("switches to the N4 lesson path and back", async () => {
    const wrapper = mount(LearnPage);
    await wrapper
      .find('[data-testid="learn-level-option-N4"]')
      .trigger("click");
    await flushPromises();

    expect((wrapper.vm as any).level).toBe("N4");
    expect(wrapper.text()).toContain("The N4 Lesson Path");
    expect(wrapper.find('a[href="/learn/1?level=N4"]').exists()).toBe(true);
  });

  it("never stores anything about the learner", async () => {
    mount(LearnPage);
    await flushPromises();
    expect(localStorage.length).toBe(0);
  });
});

describe("Lesson page (/learn/[lesson])", () => {
  beforeEach(() => {
    localStorage.clear();
    (global.$fetch as any).mockReset?.();
  });

  const mockPools = () =>
    (global.$fetch as any).mockImplementation(async (url: string) =>
      url === "/api/pool-kanji"
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

  it("renders the lesson's pattern, words, kanji breakdown, review and next link", async () => {
    const lesson = LESSONS.find((l) => l.clusterKey === "weekdays")!;
    mockRoute(String(lesson.number));
    mockPools();

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
    expect(wrapper.find('[data-testid="lesson-review-card"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="lesson-next"]').text()).toContain(
      `Next: Lesson ${lesson.number + 1}`,
    );
    expect(localStorage.length).toBe(0);
  });

  it("shows a kanji-by-kanji breakdown for a word that has one", async () => {
    const lesson = LESSONS.find((l) => l.wordIds.includes("天気"))!;
    mockRoute(String(lesson.number));
    (global.$fetch as any).mockImplementation(async (url: string) =>
      url === "/api/pool-kanji"
        ? { success: true, data: [] }
        : {
            success: true,
            data: [
              {
                id: "天気",
                term: "天気",
                kana: "てんき",
                romaji: "tenki",
                meaning: "weather",
                jlptLevel: "N5",
              },
            ],
          },
    );

    const wrapper = mount(LessonPage);
    await flushPromises();

    const breakdown = wrapper.find('[data-testid="lesson-word-breakdown"]');
    expect(breakdown.text()).toContain("天");
    expect(breakdown.text()).toContain("気");
    expect(breakdown.text()).toContain("heavens, sky");
  });

  it("shows a topic's examples and common mistake once, on its last part", () => {
    const first = LESSONS.find((l) => l.partCount > 1 && l.part === 1)!;
    const last = LESSONS.find(
      (l) => l.clusterKey === first.clusterKey && l.part === l.partCount,
    )!;

    mockRoute(String(first.number));
    expect(mount(LessonPage).text()).not.toContain(first.commonMistake);

    mockRoute(String(last.number));
    expect(mount(LessonPage).text()).toContain(last.commonMistake);
  });

  it("shows a not-found state for an unknown lesson", () => {
    mockRoute("9999");
    const wrapper = mount(LessonPage);
    expect(wrapper.text()).toContain("That lesson doesn't exist.");
  });

  it("renders the N4 lesson path when ?level=N4", async () => {
    const lesson = N4_LESSONS[0]!;
    mockRoute(String(lesson.number), "N4");
    (global.$fetch as any).mockResolvedValue({ success: true, data: [] });

    const wrapper = mount(LessonPage);
    await flushPromises();

    expect(wrapper.text()).toContain(lesson.title);
    expect(wrapper.find('a[href*="level=N4"]').exists()).toBe(true);
  });
});
