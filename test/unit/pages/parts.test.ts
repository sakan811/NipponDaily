import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute } from "#app";
import PartsPage from "~/app/pages/parts/index.vue";
import PartPage from "~/app/pages/parts/[text].vue";
import { partDetail, partsIndex } from "~~/shared/parts";

const TODAY = "2026-03-08";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2026-03-08T00:00:00Z",
});

describe("Parts Page (/parts)", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(
      respond({ parts: partsIndex(TODAY) }),
    );
  });

  it("fetches the index", async () => {
    mount(PartsPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/parts");
  });

  it("lists parts seen in more than one word with their readings, linking to each", async () => {
    const wrapper = mount(PartsPage);
    await flushPromises();

    const recurring = wrapper.find('[data-testid="parts-recurring"]');
    const first = recurring.find('[data-testid="part-link"]');
    expect(first.attributes("href")).toBe("/parts/%E6%97%A5");
    expect(first.text()).toContain("日");
    expect(first.text()).toContain("10 words");
    expect(first.text()).toContain("び · ひ · か · にち");
  });

  it("lists the parts seen once as chips", async () => {
    const wrapper = mount(PartsPage);
    await flushPromises();

    const once = wrapper.find('[data-testid="parts-once"]');
    expect(once.exists()).toBe(true);
    expect(once.findAll('[data-testid="part-link"]').length).toBeGreaterThan(0);
    expect(once.text()).toContain("二");
  });

  it("says so when nothing has turned up twice", async () => {
    (global as any).$fetch.mockResolvedValue(
      respond({ parts: partsIndex("2026-01-13") }),
    );
    const wrapper = mount(PartsPage);
    await flushPromises();

    expect(wrapper.text()).toContain("No part has turned up twice yet");
  });

  it("shows the fallback when the fetch fails", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 500 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(PartsPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load the Parts");
    consoleError.mockRestore();
  });

  it("shows a skeleton while loading", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(PartsPage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });
});

describe("Part Page (/parts/[text])", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    vi.mocked(useRoute).mockReturnValue({
      path: "/parts/日",
      query: {},
      params: { text: "日" },
    } as any);
    (global as any).$fetch.mockResolvedValue(
      respond(partDetail("日", "2026-05-10")),
    );
  });

  it("fetches the part named in the URL", async () => {
    mount(PartPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/part", {
      query: { text: "日" },
    });
  });

  it("groups the words by the reading the part has in them", async () => {
    const wrapper = mount(PartPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="part-text"]').text()).toBe("日");
    const groups = wrapper.findAll('[data-testid="part-reading"]');
    expect(groups.map((g) => g.find("h2").text().split(/\s/)[0])).toEqual([
      "び",
      "ひ",
      "か",
      "にち",
    ]);
    expect(groups[0]!.findAll('[data-testid="part-use"]')).toHaveLength(7);
  });

  it("links each use to its word and its other parts to their pages", async () => {
    const wrapper = mount(PartPage);
    await flushPromises();

    const monday = wrapper.findAll('[data-testid="part-use"]')[0]!;
    expect(monday.find('a[href="/words/2026-03-02"]').text()).toContain(
      "月曜日",
    );
    expect(monday.find('a[href="/parts/%E6%9C%88%E6%9B%9C"]').text()).toBe(
      "月曜",
    );
    // The page's own part is plain text, not a link back to itself.
    expect(monday.find('a[href="/parts/%E6%97%A5"]').exists()).toBe(false);
    // Rendaku is shown: び is ひ after a boundary.
    expect(monday.text()).toContain("(from ひ)");
  });

  it("lists spelling-only matches apart, saying nothing about their role", async () => {
    const wrapper = mount(PartPage);
    await flushPromises();

    const also = wrapper.find('[data-testid="part-also"]');
    expect(also.text()).toContain("三日月");
    expect(wrapper.text()).toContain("nothing is claimed about its role");
  });

  it("explains a 404", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 404 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(PartPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load This Part");
    expect(wrapper.text()).toContain(
      "No word has been taken apart into this part yet.",
    );
    consoleError.mockRestore();
  });
});
