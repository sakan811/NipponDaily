import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import PatternsPage from "~/app/pages/patterns.vue";
import { patternsFor } from "~~/shared/patterns";

const TODAY = "2026-03-08";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2026-03-08T00:00:00Z",
});

describe("Patterns Page (/patterns)", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(respond(patternsFor(TODAY)));
  });

  it("fetches the patterns", async () => {
    mount(PatternsPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/patterns");
  });

  it("shows how many words are open and how many show parts", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const p = patternsFor(TODAY);
    const totals = wrapper.find('[data-testid="pattern-totals"]').text();
    expect(totals).toContain(String(p.total));
    expect(totals).toContain(String(p.withParts));
  });

  it("links each layer, level and process into Explore", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const hrefs = (id: string) =>
      wrapper
        .find(`[data-testid="${id}"]`)
        .findAll("a")
        .map((a) => a.attributes("href"));

    expect(hrefs("pattern-strata")).toContain("/explore?stratum=wago");
    // The "not stated" layer is not a filter, so it is not a link.
    expect(hrefs("pattern-strata")).toHaveLength(4);
    expect(hrefs("pattern-levels")).toEqual([
      "/explore?level=N5",
      "/explore?level=N4",
      "/explore?level=N3",
      "/explore?level=N2",
    ]);
    expect(hrefs("pattern-processes")).toContain("/explore?process=compound");
  });

  it("describes each level's layer mix for screen readers", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const bar = wrapper
      .find('[data-testid="pattern-levels"]')
      .find('[role="img"]');
    expect(bar.attributes("aria-label")).toMatch(/^N5: /);
    expect(bar.attributes("aria-label")).toContain("Native Japanese");
  });

  it("lists process pairs with example words linking to their entries", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const pair = patternsFor(TODAY).pairs[0]!;
    const pairs = wrapper.find('[data-testid="pattern-pairs"]');
    expect(pairs.text()).toContain(`${pair.count} words`);
    expect(pairs.find("a").attributes("href")).toBe(
      `/words/${pair.examples[0]!.date}`,
    );
  });

  it("says what the counts can't tell you", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    expect(wrapper.text()).toContain("not the Japanese language as a whole");
  });

  it("shows the fallback when the fetch fails", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 500 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(PatternsPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load the Patterns");
    consoleError.mockRestore();
  });

  it("shows a skeleton while loading", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(PatternsPage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });
});
