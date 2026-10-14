import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WordReferences from "~/app/components/WordReferences.vue";
import type { ResolvedReference } from "~~/types/index";

const open: ResolvedReference = {
  term: "正常",
  word: {
    date: "2011-11-24",
    term: "正常",
    kana: "せいじょう",
    meaning: "normal",
    stratum: "kango",
  },
};
const unopened: ResolvedReference = { term: "寡", kana: "か" };

describe("WordReferences", () => {
  it("links a word that has opened to its day, with its reading and meaning", () => {
    const wrapper = mount(WordReferences, {
      props: { antonyms: [open], seeAlso: [] },
    });
    const card = wrapper.find('[data-testid="word-reference"]');

    expect(card.find("a").attributes("href")).toBe("/words/2011-11-24");
    expect(card.text()).toContain("せいじょう");
    expect(card.text()).toContain("normal");
  });

  it("names a word that has not opened as JMdict writes it, with no link", () => {
    const wrapper = mount(WordReferences, {
      props: { antonyms: [], seeAlso: [unopened] },
    });
    const card = wrapper.find('[data-testid="word-reference"]');

    expect(card.find("a").exists()).toBe(false);
    expect(card.text()).toContain("寡");
    expect(card.text()).toContain("か");
  });

  it("labels each group and leaves out an empty one", () => {
    const wrapper = mount(WordReferences, {
      props: { antonyms: [open], seeAlso: [] },
    });

    expect(wrapper.text()).toContain("Opposite");
    expect(wrapper.text()).not.toContain("See also");
  });
});
