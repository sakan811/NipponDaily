import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FeaturesPage from "~/app/pages/docs/features.vue";

const stubs = {
  UPageCard: {
    props: ["title", "description"],
    template:
      '<div class="u-page-card"><h3>{{ title }}</h3><p>{{ description }}</p></div>',
  },
  UFooter: {
    template: '<div class="u-footer"><slot name="left" /><slot /></div>',
  },
};

describe("Features Page", () => {
  it("describes the daily-word product", () => {
    const wrapper = mount(FeaturesPage, { global: { stubs } });
    const text = wrapper.text();

    for (const title of [
      "A New Word Every Day",
      "A Calendar to Look Back Through",
      "Taken Apart",
      "Evidence for Every Claim",
      "Verified in CI",
      "Nothing Stored About You",
    ]) {
      expect(text).toContain(title);
    }
    expect(text).toContain("midnight in Japan");
  });

  it("no longer advertises the game, lessons or vocabulary guide", () => {
    const wrapper = mount(FeaturesPage, { global: { stubs } });
    const text = wrapper.text();

    expect(text).not.toContain("daily game");
    expect(text).not.toContain("Lesson Paths");
    expect(text).not.toContain("hanko");
    expect(text).not.toContain("/api/daily-game");
  });
});
