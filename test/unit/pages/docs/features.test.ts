import { describe, it, expect } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import FeaturesPage from "~/app/pages/docs/features.vue";

const stubs = {
  UHeader: {
    template:
      '<div class="u-header"><slot name="left" /><slot name="right" /><slot name="body" /><slot /></div>',
  },
  UFooter: {
    template: '<div class="u-footer"><slot name="left" /><slot /></div>',
  },
};

describe("Features chapter", () => {
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
    const text = mount(FeaturesPage, { global: { stubs } }).text();

    for (const title of [
      "A New Word Every Day",
      "A Calendar to Look Back Through",
      "Taken Apart",
      "Evidence for Every Claim",
      "Verified in CI",
      "Four Seasons",
      "Pick Your Season",
      "Nothing Stored About You",
    ]) {
      expect(text).toContain(title);
    }
    expect(text).toContain("midnight in Japan");
  });

  it("no longer advertises the game, lessons or vocabulary guide", () => {
    const text = mount(FeaturesPage, { global: { stubs } }).text();

    expect(text).not.toContain("daily game");
    expect(text).not.toContain("Lesson Paths");
    expect(text).not.toContain("/api/daily-game");
    expect(text).not.toContain("MCP");
  });
});
