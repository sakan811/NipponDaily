import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import PatternsPage from "~/app/pages/patterns.vue";
import { patternsFor } from "~~/shared/patterns";
import { WORD_ENTRIES } from "~~/shared/words";

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
    // The "not stated" layer is a filter too, so every row links.
    expect(hrefs("pattern-strata")).toContain("/explore?stratum=unstated");
    expect(hrefs("pattern-strata")).toHaveLength(5);
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

  it("lists sets of three or more tags, each opening Explore with 'all'", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const combo = patternsFor(TODAY).combinations[0]!;
    const list = wrapper.find('[data-testid="pattern-combinations"]');
    expect(list.text()).toContain(`${combo.count} words`);
    const links = list.findAll("a").map((a) => a.attributes("href"));
    expect(links[0]).toContain("/explore?");
    expect(links[0]).toContain("match=all");
    expect(links[0]).toContain(
      `process=${encodeURIComponent(combo.processes.join(","))}`,
    );
    expect(links).toContain(`/words/${combo.examples[0]!.date}`);
  });

  it("shows which readings change, with the words that show them", async () => {
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const { rendaku } = patternsFor(TODAY);
    const voiced = wrapper.find('[data-testid="rendaku-voiced"]');
    expect(voiced.text()).toContain("ひ → び");
    // 日 takes び in the weekdays; its row names the change and links the part.
    const row = voiced
      .findAll('[data-testid="rendaku-reading"]')
      .find((r) => r.text().startsWith("日"))!;
    expect(row.text()).toContain("ひ → び");
    expect(row.find("a").attributes("href")).toBe(
      `/parts/${encodeURIComponent("日")}`,
    );
    const hi = rendaku.voiced.find((s) => s.from === "ひ")!;
    expect(
      row
        .findAll("a")
        .slice(1)
        .map((a) => a.attributes("href")),
    ).toEqual(
      hi.readings
        .find((r) => r.part === "日")!
        .examples.map((ex) => `/words/${ex.date}`),
    );
  });

  it("calls the rendaku section a sample, not a rule of the language", async () => {
    // By year's end the っ endings (三日, 国境…) have opened too.
    (global as any).$fetch.mockResolvedValue(
      respond(patternsFor("2026-12-31")),
    );
    const wrapper = mount(PatternsPage);
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain("Readings that change inside a word");
    expect(text).toContain("not a rule of the language");
    expect(wrapper.find('[data-testid="rendaku-sokuon"]').exists()).toBe(true);
  });

  it("leaves the rendaku section out when no word records a change", async () => {
    // The first day of the catalogue is too early for any to have opened.
    const first = patternsFor(WORD_ENTRIES[0]!.date);
    expect(first.rendaku.words).toBe(0);
    (global as any).$fetch.mockResolvedValue(respond(first));
    const wrapper = mount(PatternsPage);
    await flushPromises();

    expect(wrapper.text()).not.toContain("Readings that change inside a word");
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
