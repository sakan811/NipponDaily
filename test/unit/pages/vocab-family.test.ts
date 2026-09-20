import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useRoute } from "#app";
import VocabFamilyPage from "~/app/pages/vocab/families/[key].vue";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";
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

const mockRoute = (key: string) => {
  (useRoute as any).mockReturnValue({
    path: `/vocab/families/${key}`,
    query: {},
    params: { key },
  });
};

describe("Vocab Family Page", () => {
  beforeEach(() => {
    (global.$fetch as any).mockReset?.();
    mockRoute("kosoado");
  });

  it("renders the cluster's title, insight, and extended insight", () => {
    const wrapper = mount(VocabFamilyPage);
    const cluster = WORD_CLUSTERS.find((c) => c.key === "kosoado")!;

    expect(wrapper.text()).toContain(cluster.title);
    expect(wrapper.text()).toContain(cluster.insight);
    expect(wrapper.text()).toContain(cluster.extendedInsight);
  });

  it("renders example sentences and the common-mistake callout", () => {
    const wrapper = mount(VocabFamilyPage);
    const cluster = WORD_CLUSTERS.find((c) => c.key === "kosoado")!;

    for (const example of cluster.examples ?? []) {
      expect(wrapper.text()).toContain(example.jp);
      expect(wrapper.text()).toContain(example.en);
    }
    expect(wrapper.text()).toContain(cluster.commonMistake);
  });

  it("links to the previous/next topic, with no previous link on the first topic", () => {
    const wrapper = mount(VocabFamilyPage);
    const secondCluster = WORD_CLUSTERS[1];

    expect(
      wrapper.find(`a[href="/vocab/families/${secondCluster.key}"]`).exists(),
    ).toBe(true);
  });

  it("renders matched cluster words once the pool loads", async () => {
    const vocab = [
      createVocab({ id: "これ", term: "これ", kana: "これ", meaning: "this" }),
    ];
    (global.$fetch as any).mockResolvedValue({
      success: true,
      data: vocab,
      timestamp: new Date().toISOString(),
    });

    const wrapper = mount(VocabFamilyPage);
    await (wrapper.vm as any).fetchVocab();
    await flushPromises();

    expect(wrapper.text()).toContain("これ");
  });

  it("shows a not-found state for an unknown topic key", () => {
    mockRoute("does-not-exist");
    const wrapper = mount(VocabFamilyPage);

    expect(wrapper.text()).toContain("doesn't exist");
  });
});
