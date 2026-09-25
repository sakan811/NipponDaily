import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LessonQuiz from "~/app/components/LessonQuiz.vue";
import type { N5Vocab } from "~~/types/index";

const word = (id: string, term: string, meaning: string): N5Vocab => ({
  id,
  term,
  kana: term,
  romaji: id,
  meaning,
  jlptLevel: "N5",
});

const words = [
  word("taberu", "食べる", "to eat"),
  word("nomu", "飲む", "to drink; to take (medicine)"),
];
const pool = [
  ...words,
  word("atsui", "暑い", "hot (weather)"),
  word("inu", "犬", "dog"),
  word("neko", "猫", "cat"),
  word("tori", "鳥", "bird; chicken"),
];

describe("LessonQuiz", () => {
  it("asks one question per lesson word, with four distinct choices including the answer", () => {
    const wrapper = mount(LessonQuiz, { props: { words, pool } });
    const questions = (wrapper.vm as any).questions;
    expect(questions).toHaveLength(2);
    for (const q of questions) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(q.answer);
    }
    // One question each way.
    expect(new Set(questions.map((q: any) => q.direction))).toEqual(
      new Set(["jp-en", "en-jp"]),
    );
  });

  it("emits a passing result after answering everything correctly", async () => {
    const wrapper = mount(LessonQuiz, { props: { words, pool } });
    const vm = wrapper.vm as any;
    for (const q of [...vm.questions]) {
      vm.selectChoice(q.answer);
      vm.advance();
    }
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("finished")?.[0]).toEqual([
      { correct: 2, total: 2, passed: true },
    ]);
    expect(wrapper.find('[data-testid="lesson-quiz-score"]').text()).toBe(
      "2/2",
    );
  });

  it("does not pass with wrong answers and lists words to review", async () => {
    const wrapper = mount(LessonQuiz, { props: { words, pool } });
    const vm = wrapper.vm as any;
    for (const q of [...vm.questions]) {
      vm.selectChoice(q.choices.find((c: string) => c !== q.answer));
      vm.advance();
    }
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("finished")?.[0]?.[0]).toMatchObject({
      passed: false,
    });
    expect(wrapper.text()).toContain("Review these");
  });
});
