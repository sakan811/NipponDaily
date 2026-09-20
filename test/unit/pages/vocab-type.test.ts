import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useRoute } from "#app";
import VocabTypePage from "~/app/pages/vocab/types/[key].vue";
import { WORD_TYPE_GROUPS } from "~/app/data/vocab-guide";
import type { N5Vocab } from "~~/types/index";

const createVocab = (overrides: Partial<N5Vocab> = {}): N5Vocab => ({
  id: "word",
  term: "言葉",
  kana: "ことば",
  romaji: "kotoba",
  meaning: "language; word(s)",
  jlptLevel: "N5",
  partOfSpeech: "noun (common) (futsuumeishi)",
  ...overrides,
});

const mockRoute = (key: string) => {
  (useRoute as any).mockReturnValue({
    path: `/vocab/types/${key}`,
    query: {},
    params: { key },
  });
};

describe("Vocab Type Page", () => {
  beforeEach(() => {
    (global.$fetch as any).mockReset?.();
    mockRoute("verb");
  });

  it("renders the group's label, insight, and extended insight", () => {
    const wrapper = mount(VocabTypePage);
    const group = WORD_TYPE_GROUPS.find((g) => g.key === "verb")!;

    expect(wrapper.text()).toContain(group.label);
    expect(wrapper.text()).toContain(group.insight);
    expect(wrapper.text()).toContain(group.extendedInsight);
  });

  it("renders example sentences and the common-mistake callout", () => {
    const wrapper = mount(VocabTypePage);
    const group = WORD_TYPE_GROUPS.find((g) => g.key === "verb")!;

    for (const example of group.examples ?? []) {
      expect(wrapper.text()).toContain(example.jp);
    }
    expect(wrapper.text()).toContain(group.commonMistake);
  });

  it("only lists words classified into this group", async () => {
    const vocab = [
      createVocab({
        id: "1",
        term: "食べる",
        kana: "たべる",
        meaning: "to eat",
        partOfSpeech: "Ichidan verb",
      }),
      createVocab({
        id: "2",
        term: "猫",
        kana: "ねこ",
        meaning: "cat",
        partOfSpeech: "noun (common) (futsuumeishi)",
      }),
    ];
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: vocab,
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabTypePage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    const results = wrapper.find('[data-testid="vocab-type-results"]');
    expect(results.text()).toContain("食べる");
    expect(results.text()).not.toContain("猫");
  });

  it("filters the group's word list by search query", async () => {
    const vocab = [
      createVocab({
        id: "1",
        term: "食べる",
        kana: "たべる",
        meaning: "to eat",
        partOfSpeech: "Ichidan verb",
      }),
      createVocab({
        id: "2",
        term: "飲む",
        kana: "のむ",
        meaning: "to drink",
        partOfSpeech: "Godan verb with 'mu' ending",
      }),
    ];
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: vocab,
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabTypePage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    const search = wrapper.find('[data-testid="vocab-type-search"]');
    await search.setValue("drink");
    await flushPromises();

    const results = wrapper.find('[data-testid="vocab-type-results"]');
    expect(results.text()).toContain("飲む");
    expect(results.text()).not.toContain("食べる");
  });

  it("shows a not-found state for an unknown group key", () => {
    mockRoute("does-not-exist");
    const wrapper = mount(VocabTypePage);

    expect(wrapper.text()).toContain("doesn't exist");
  });
});
