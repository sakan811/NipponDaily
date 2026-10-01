import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute } from "#app";
import WordPage from "~/app/pages/words/[date].vue";
import { WORD_ENTRIES, payloadFor } from "~~/shared/words";

const entryOn = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;

const respond = (date: string, today = "2026-10-31") => ({
  success: true,
  data: payloadFor(entryOn(date), today),
  timestamp: "2026-10-31T00:00:00Z",
});

describe("Word Page (/words/[date])", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    vi.mocked(useRoute).mockReturnValue({
      path: "/words/2026-10-13",
      query: {},
      params: { date: "2026-10-13" },
    } as any);
    (global as any).$fetch.mockResolvedValue(respond("2026-10-13"));
  });

  it("fetches the word for the date in the URL", async () => {
    mount(WordPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/daily-word", {
      query: { date: "2026-10-13" },
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
    expect(prev.attributes("to")).toBe("/words/2026-10-12");
    expect(prev.text()).toContain("出口");
    expect(next.attributes("to")).toBe("/words/2026-10-14");
    expect(next.text()).toContain("果物");
  });

  it("has no next link when the next day hasn't arrived", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/words/2026-10-05",
      query: {},
      params: { date: "2026-10-05" },
    } as any);
    (global as any).$fetch.mockResolvedValue(
      respond("2026-10-05", "2026-10-05"),
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

  it("shows a skeleton while loading", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(WordPage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });
});
