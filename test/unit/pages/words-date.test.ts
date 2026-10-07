import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useHead, useRoute, useSeoMeta } from "#app";
import WordPage from "~/app/pages/words/[date].vue";
import { relatedWords } from "~~/shared/related";
import { WORD_ENTRIES, payloadFor } from "~~/shared/words";

const entryOn = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;

const respond = (date: string, today = "2023-08-07") => ({
  success: true,
  data: payloadFor(entryOn(date), today),
  timestamp: "2023-08-07T00:00:00Z",
});

describe("Word Page (/words/[date])", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    vi.mocked(useRoute).mockReturnValue({
      path: "/words/2023-07-20",
      query: {},
      params: { date: "2023-07-20" },
    } as any);
    (global as any).$fetch.mockResolvedValue(respond("2023-07-20"));
  });

  it("fetches the word for the date in the URL", async () => {
    mount(WordPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/daily-word", {
      query: { date: "2023-07-20" },
    });
  });

  it("renders the entry", async () => {
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="word-term"]').text()).toBe("ありがとう");
    expect(wrapper.find('[data-testid="word-entry"]').exists()).toBe(true);
  });

  it("links to the previous and next word", async () => {
    const wrapper = mount(WordPage);
    await flushPromises();

    const prev = wrapper.find('[data-testid="word-prev"]');
    const next = wrapper.find('[data-testid="word-next"]');
    expect(prev.attributes("to")).toBe("/words/2023-07-19");
    expect(prev.text()).toContain("出口");
    expect(next.attributes("to")).toBe("/words/2023-07-21");
    expect(next.text()).toContain("果物");
  });

  it("offers related words beneath the entry", async () => {
    const date = "2023-07-20";
    (global as any).$fetch.mockImplementation(async (url: string) =>
      url === "/api/related"
        ? {
            success: true,
            data: {
              date,
              words: relatedWords(entryOn(date), "2023-08-07"),
            },
            timestamp: "2023-08-07T00:00:00Z",
          }
        : respond(date),
    );
    const wrapper = mount(WordPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/related", {
      query: { date },
    });
    expect(
      wrapper.findAll('[data-testid="related-word"]').length,
    ).toBeGreaterThan(0);
  });

  it("still shows the entry when the related words fail to load", async () => {
    (global as any).$fetch.mockImplementation(async (url: string) => {
      if (url === "/api/related") throw { statusCode: 500 };
      return respond("2023-07-20");
    });
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="word-term"]').text()).toBe("ありがとう");
    expect(wrapper.find('[data-testid="related-words"]').exists()).toBe(false);
  });

  it("has no next link when the next day hasn't arrived", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/words/2023-07-12",
      query: {},
      params: { date: "2023-07-12" },
    } as any);
    (global as any).$fetch.mockResolvedValue(
      respond("2023-07-12", "2023-07-12"),
    );
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="word-prev"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="word-next"]').exists()).toBe(false);
  });

  it("links back to the calendar", async () => {
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.find('a[href="/words"]').exists()).toBe(true);
  });

  it("says the day hasn't arrived on a 400", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 400 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load This Word");
    expect(wrapper.text()).toContain("That day hasn't arrived yet.");
    consoleError.mockRestore();
  });

  it("says there is no word on a 404", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 404 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(WordPage);
    await flushPromises();

    expect(wrapper.text()).toContain("There is no word for this day.");
    consoleError.mockRestore();
  });

  it("sets the page's title, description and canonical URL from the entry", async () => {
    vi.mocked(useSeoMeta).mockClear();
    vi.mocked(useHead).mockClear();
    mount(WordPage);
    await flushPromises();

    const meta = vi.mocked(useSeoMeta).mock.calls[0]![0] as Record<string, any>;
    expect(meta.title()).toBe("ありがとう (ありがとう) — Thank you");
    expect(meta.description()).toContain("ありがとう");
    expect(meta.ogType).toBe("article");
    expect(meta.ogUrl()).toBe("https://nippondaily.test/words/2023-07-20");
    expect(meta.articlePublishedTime()).toBe("2023-07-20T00:00:00+09:00");
    expect(meta.robots()).toBeUndefined();
    const head = vi.mocked(useHead).mock.calls[0]![0] as any;
    expect(head.link[0].href()).toBe(
      "https://nippondaily.test/words/2023-07-20",
    );
  });

  it("keeps an error page out of search results", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 404 });
    vi.mocked(useSeoMeta).mockClear();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mount(WordPage);
    await flushPromises();

    const meta = vi.mocked(useSeoMeta).mock.calls[0]![0] as Record<string, any>;
    expect(meta.robots()).toBe("noindex, nofollow");
    consoleError.mockRestore();
  });

  it("shows a skeleton while loading", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(WordPage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });
});
