import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import KanaPage from "~/app/pages/kana.vue";
import { KANA_ROWS } from "~/app/data/kana-guide";

describe("Kana Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders header and hero heading", () => {
    const wrapper = mount(KanaPage);

    expect(wrapper.find(".u-header").exists()).toBe(true);
    expect(wrapper.text()).toContain("Hiragana & Katakana");
  });

  it("renders every gojūon row with romaji, hiragana, and katakana", () => {
    const wrapper = mount(KanaPage);
    const text = wrapper.text();

    for (const group of KANA_ROWS) {
      for (const entry of group.entries) {
        expect(text).toContain(entry.hiragana);
        expect(text).toContain(entry.katakana);
      }
    }
  });

  it("renders a mnemonic for every entry", () => {
    const wrapper = mount(KanaPage);
    const text = wrapper.text();

    for (const group of KANA_ROWS) {
      for (const entry of group.entries) {
        expect(text).toContain(entry.hiraganaMnemonic);
        expect(text).toContain(entry.katakanaMnemonic);
      }
    }
  });

  it("renders the voicing marks and combo sections", () => {
    const wrapper = mount(KanaPage);

    expect(wrapper.text()).toContain("Voicing Marks");
    expect(wrapper.text()).toContain("Combos & Small Kana");
  });

  it("links to the daily game as a CTA", () => {
    const wrapper = mount(KanaPage);

    const cta = wrapper.find('[data-testid="kana-game-cta"]');
    expect(cta.exists()).toBe(true);
    expect(cta.text()).toContain("Play Today's Game");
  });
});
