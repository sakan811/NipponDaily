import { describe, it, expect } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
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
  it("states the word range and count from /api/catalogue, not from the page", async () => {
    (global as any).$fetch.mockResolvedValue({
      success: true,
      data: { first: "2026-01-01", last: "2027-10-31", total: 669, open: 276 },
    });
    const wrapper = mount(FeaturesPage, { global: { stubs } });
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/catalogue");
    expect(wrapper.text()).toContain(
      "669 words are written, January 2026 to October 2027, and 276 have opened so far.",
    );
  });

  it("states no number when the catalogue can't be fetched", async () => {
    (global as any).$fetch.mockRejectedValue(new Error("offline"));
    const wrapper = mount(FeaturesPage, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain("A New Word Every Day");
    expect(wrapper.text()).not.toContain("are written");
  });

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

  it("describes the seasons without the removed MCP agent", () => {
    const wrapper = mount(FeaturesPage, { global: { stubs } });
    const text = wrapper.text();

    expect(text).toContain("Four Seasons");
    expect(text).toContain("Pick Your Season");
    expect(text).not.toContain("MCP");
    expect(text).not.toContain("agent");
  });
});
