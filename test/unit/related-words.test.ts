import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RelatedWords from "~/app/components/RelatedWords.vue";
import type { RelatedWord } from "~~/types/index";

const words: RelatedWord[] = [
  {
    date: "2026-03-03",
    term: "火曜日",
    kana: "かようび",
    meaning: "Tuesday",
    stratum: "kango",
    shared: { parts: ["曜", "日"], processes: ["rendaku"], stratum: "kango" },
  },
  {
    date: "2026-09-06",
    term: "花火",
    kana: "はなび",
    meaning: "fireworks",
    stratum: "wago",
    shared: { parts: [], processes: ["compound"] },
  },
];

describe("RelatedWords", () => {
  it("links each word to its entry", () => {
    const wrapper = mount(RelatedWords, { props: { words } });
    const cards = wrapper.findAll('[data-testid="related-word"]');

    expect(cards).toHaveLength(2);
    expect(cards[0]!.find("a").attributes("href")).toBe("/words/2026-03-03");
    expect(cards[0]!.text()).toContain("かようび");
    expect(cards[0]!.text()).toContain("Tuesday");
  });

  it("names what is shared, each tag linking to where you can see more", () => {
    const wrapper = mount(RelatedWords, { props: { words } });
    const hrefs = wrapper
      .findAll('[data-testid="related-word"]')[0]!
      .findAll("a")
      .map((a) => a.attributes("href"));

    expect(hrefs).toContain(`/parts/${encodeURIComponent("曜")}`);
    expect(hrefs).toContain(`/parts/${encodeURIComponent("日")}`);
    expect(hrefs).toContain("/explore?process=rendaku");
    expect(hrefs).toContain("/explore?stratum=kango");
  });

  it("shows only the tags a word actually shares", () => {
    const wrapper = mount(RelatedWords, { props: { words } });
    const second = wrapper.findAll('[data-testid="related-word"]')[1]!;

    expect(second.text()).not.toContain("Part");
    expect(second.findAll("a").map((a) => a.attributes("href"))).toEqual([
      "/words/2026-09-06",
      "/explore?process=compound",
    ]);
  });
});
