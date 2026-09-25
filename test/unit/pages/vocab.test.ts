import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import VocabPage from "~/app/pages/vocab/index.vue";
import { WORD_TYPE_GROUPS } from "~/app/data/vocab-guide";
import { LESSON_NUMBER_BY_WORD } from "~/app/data/lessons";
import type { N5Vocab } from "~~/types/index";

const createVocab = (overrides: Partial<N5Vocab> = {}): N5Vocab => ({
  id: "word",
  term: "言葉",
  kana: "ことば",
  romaji: "kotoba",
  meaning: "language; word(s)",
  jlptLevel: "N5",
  ...overrides,
});

describe("Vocab Page", () => {
  beforeEach(() => {
    (global.$fetch as any).mockReset?.();
  });

  it("renders header and hero heading", () => {
    const wrapper = mount(VocabPage);

    expect(wrapper.find(".u-header").exists()).toBe(true);
    expect(wrapper.text()).toContain("N5 Vocabulary");
  });

  it("points learners to the lesson path instead of repeating the word families", () => {
    const wrapper = mount(VocabPage);

    expect(
      wrapper.find('[data-testid="vocab-learn-cta"]').attributes("href"),
    ).toBe("/learn");
    expect(wrapper.find('a[href^="/vocab/families/"]').exists()).toBe(false);
  });

  it("renders a filter pill for every word-type group", () => {
    const wrapper = mount(VocabPage);

    for (const group of WORD_TYPE_GROUPS) {
      expect(
        wrapper.find(`[data-testid="vocab-filter-${group.key}"]`).exists(),
      ).toBe(true);
    }
  });

  it("links each word to the lesson that teaches it", async () => {
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: [createVocab({ id: "これ", term: "これ", kana: "これ" })],
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabPage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    const link = wrapper.find('[data-testid="vocab-word-lesson"]');
    expect(link.attributes("href")).toBe(
      `/learn/${LESSON_NUMBER_BY_WORD.get("これ")}`,
    );
  });

  it("links the active word-type group to its dedicated /vocab/types page", async () => {
    const wrapper = mount(VocabPage);

    await wrapper.find('[data-testid="vocab-filter-verb"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('a[href="/vocab/types/verb"]').exists()).toBe(true);
  });

  it("links to the daily game and kana page as CTAs", () => {
    const wrapper = mount(VocabPage);

    const gameCta = wrapper.find('[data-testid="vocab-game-cta"]');
    expect(gameCta.exists()).toBe(true);
    expect(gameCta.text()).toContain("Play Today's Game");
  });

  it("fetches the vocab pool and renders matched cluster words", async () => {
    const vocab = [createVocab({ id: "1", term: "大きい", meaning: "big" })];
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: vocab,
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabPage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    expect(wrapper.text()).toContain("大きい");
  });

  it("filters the browsable list by search query", async () => {
    const vocab = [
      createVocab({ id: "1", term: "犬", kana: "いぬ", meaning: "dog" }),
      createVocab({ id: "2", term: "猫", kana: "ねこ", meaning: "cat" }),
    ];
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: vocab,
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabPage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    const search = wrapper.find('[data-testid="vocab-search"]');
    await search.setValue("dog");
    await flushPromises();

    expect(wrapper.text()).toContain("犬");
    expect(wrapper.text()).not.toContain("猫");
  });
});
