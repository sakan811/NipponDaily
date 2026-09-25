import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LessonReview from "~/app/components/LessonReview.vue";
import type { N5Vocab } from "~~/types/index";

const word = (id: string, term: string, meaning: string): N5Vocab => ({
  id,
  term,
  kana: term,
  romaji: id,
  meaning,
  jlptLevel: "N5",
});

const words = [word("inu", "犬", "dog"), word("neko", "猫", "cat")];

describe("LessonReview", () => {
  beforeEach(() => localStorage.clear());

  it("hides the answer until revealed", async () => {
    const wrapper = mount(LessonReview, { props: { words } });
    expect(wrapper.find('[data-testid="lesson-review-answer"]').exists()).toBe(
      false,
    );
    await wrapper.find('[data-testid="lesson-review-reveal"]').trigger("click");
    expect(wrapper.find('[data-testid="lesson-review-answer"]').exists()).toBe(
      true,
    );
  });

  it("sends 'Again' cards to the back and finishes once every card is known", async () => {
    const wrapper = mount(LessonReview, { props: { words } });
    const vm = wrapper.vm as any;
    const first = vm.deck[0].id;

    vm.revealed = true;
    vm.answer(false);
    expect(vm.deck.at(-1).id).toBe(first);
    expect(vm.deck).toHaveLength(2);

    for (let i = 0; i < 2; i++) {
      vm.revealed = true;
      vm.answer(true);
    }
    await wrapper.vm.$nextTick();
    expect(vm.isFinished).toBe(true);
    expect(wrapper.text()).toContain("1 took another pass");
    expect(localStorage.length).toBe(0);
  });

  it("can show English first", async () => {
    const wrapper = mount(LessonReview, { props: { words } });
    await wrapper
      .find('[data-testid="lesson-review-front-en"]')
      .trigger("click");
    const card = wrapper.find('[data-testid="lesson-review-card"]').text();
    expect(["dog", "cat"].some((m) => card.includes(m))).toBe(true);
  });
});
