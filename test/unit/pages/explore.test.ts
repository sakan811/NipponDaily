import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute, useRouter } from "#app";
import ExplorePage from "~/app/pages/explore.vue";
import { exploreWords } from "~~/shared/explore";
import { filtersFromQuery } from "~~/shared/explore-query";

const TODAY = "2026-03-08";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2026-03-08T00:00:00Z",
});

/** Answers each request the way the API would, from the real entries. */
const serve = () =>
  (global as any).$fetch.mockImplementation(
    async (_url: string, opts?: { query?: Record<string, string> }) =>
      respond(exploreWords(filtersFromQuery(opts?.query ?? {}), TODAY)),
  );

describe("Explore Page (/explore)", () => {
  const replace = vi.fn();

  beforeEach(() => {
    (global as any).$fetch.mockReset();
    replace.mockReset();
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: {},
      params: {},
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn(), replace } as any);
    serve();
  });
  afterEach(() => vi.useRealTimers());

  it("lists every open word with a count, each linking to its entry", async () => {
    const wrapper = mount(ExplorePage);
    await flushPromises();

    const total = exploreWords({}, TODAY).total;
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${total} of ${total} words`,
    );
    const first = wrapper.find('[data-testid="explore-word"]');
    expect(first.attributes("href")).toBe("/words/2026-03-08");
  });

  it("starts from the filters in the URL and ignores values the API would refuse", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: { level: "N5", stratum: "bogus", process: "compound" },
      params: {},
    } as any);
    mount(ExplorePage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/explore", {
      query: { level: "N5", process: "compound" },
    });
  });

  it("narrows by a chip, keeps the filter in the URL, and toggles it off again", async () => {
    const wrapper = mount(ExplorePage);
    await flushPromises();

    const chip = () =>
      wrapper.findAll('[data-testid="facet-level"] button')[0]!;
    await chip().trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { level: "N5" } });
    expect((global as any).$fetch).toHaveBeenLastCalledWith("/api/explore", {
      query: { level: "N5" },
    });
    expect(chip().attributes("aria-pressed")).toBe("true");
    const n5 = exploreWords({ level: ["N5"] }, TODAY).count;
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${n5} of`,
    );

    await chip().trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: {} });
  });

  it("lets several options be picked in one group and joins them in the URL", async () => {
    const wrapper = mount(ExplorePage);
    await flushPromises();

    const level = (i: number) =>
      wrapper.findAll('[data-testid="facet-level"] button')[i]!;
    await level(0).trigger("click");
    await flushPromises();
    await level(1).trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { level: "N5,N4" } });
    expect(level(0).attributes("aria-pressed")).toBe("true");
    expect(level(1).attributes("aria-pressed")).toBe("true");
    const both = exploreWords({ level: ["N5", "N4"] }, TODAY).count;
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${both} of`,
    );

    await level(0).trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: { level: "N4" } });
  });

  it("switches several processes from any to all and keeps it in the URL", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: { process: "compound,rendaku" },
      params: {},
    } as any);
    const wrapper = mount(ExplorePage);
    await flushPromises();

    const any = exploreWords({ process: ["compound", "rendaku"] }, TODAY);
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${any.count} of`,
    );

    await wrapper.find('[data-testid="match-all"]').trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({
      query: { process: "compound,rendaku", match: "all" },
    });
    const all = exploreWords(
      { process: ["compound", "rendaku"], match: "all" },
      TODAY,
    );
    expect(all.count).toBeLessThan(any.count);
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${all.count} of`,
    );
    expect(
      wrapper.find('[data-testid="match-all"]').attributes("aria-pressed"),
    ).toBe("true");

    await wrapper.find('[data-testid="match-any"]').trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      query: { process: "compound,rendaku" },
    });
  });

  it("offers a part-of-speech group and the layer-not-stated option", async () => {
    const wrapper = mount(ExplorePage);
    await flushPromises();

    const button = (facet: string, label: string) =>
      wrapper
        .findAll(`[data-testid="${facet}"] button`)
        .find((b) => b.text().includes(label))!;

    await button("facet-stratum", "Not stated").trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      query: { stratum: "unstated" },
    });

    await button("facet-pos", "Noun").trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      query: { stratum: "unstated", pos: "noun" },
    });
    expect((global as any).$fetch).toHaveBeenLastCalledWith("/api/explore", {
      query: { stratum: "unstated", pos: "noun" },
    });
  });

  it("searches after the reader stops typing", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExplorePage);
    await flushPromises();

    await wrapper.find('[data-testid="explore-search"]').setValue("らじお");
    expect(replace).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { q: "らじお" } });
  });

  it("clears every filter", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: { level: "N5", q: "water" },
      params: {},
    } as any);
    const wrapper = mount(ExplorePage);
    await flushPromises();

    await wrapper.find('[data-testid="explore-clear"]').trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: {} });
    expect(
      (
        wrapper.find('[data-testid="explore-search"]')
          .element as HTMLInputElement
      ).value,
    ).toBe("");
  });

  it("shows a part filter and lets it be removed", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: { part: "日" },
      params: {},
    } as any);
    const wrapper = mount(ExplorePage);
    await flushPromises();

    expect(wrapper.text()).toContain("Only words taken apart into");
    expect(wrapper.find('[data-testid="explore-count"]').text()).toContain(
      `${exploreWords({ part: "日" }, TODAY).count} of`,
    );
    await wrapper.find('[data-testid="explore-clear-part"]').trigger("click");
    expect(replace).toHaveBeenLastCalledWith({ query: {} });
  });

  it("says so when nothing matches", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/explore",
      query: { q: "zzzzzz-no-such-word" },
      params: {},
    } as any);
    const wrapper = mount(ExplorePage);
    await flushPromises();

    expect(wrapper.find('[data-testid="explore-empty"]').exists()).toBe(true);
  });

  it("shows the fallback when the fetch fails", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 500 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(ExplorePage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load the Words");
    consoleError.mockRestore();
  });

  it("shows a skeleton while loading", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(ExplorePage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });
});
