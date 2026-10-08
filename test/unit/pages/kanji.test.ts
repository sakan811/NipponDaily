import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute } from "#app";
import KanjiPage from "~/app/pages/kanji/index.vue";
import KanjiDetailPage from "~/app/pages/kanji/[char].vue";
import { kanjiDetail, kanjiIndex } from "~~/shared/kanji";

const TODAY = "2022-12-13";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2022-12-13T00:00:00Z",
});

describe("Kanji Page (/kanji)", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(
      respond({ kanji: kanjiIndex(TODAY) }),
    );
  });

  it("fetches the index", async () => {
    mount(KanjiPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/kanji");
  });

  it("lists kanji in more than one word with their count, linking to each", async () => {
    const wrapper = mount(KanjiPage);
    await flushPromises();

    const first = wrapper
      .find('[data-testid="kanji-recurring"]')
      .find('[data-testid="kanji-link"]');
    const top = kanjiIndex(TODAY)[0]!;
    expect(first.attributes("href")).toBe(
      `/kanji/${encodeURIComponent(top.char)}`,
    );
    expect(first.text()).toContain(top.char);
    expect(first.text()).toContain(`${top.count} words`);
  });

  it("lists the kanji of one word as chips", async () => {
    const wrapper = mount(KanjiPage);
    await flushPromises();

    const once = kanjiIndex(TODAY).filter((k) => k.count === 1);
    expect(
      wrapper.find('[data-testid="kanji-once"]').findAll("li"),
    ).toHaveLength(once.length);
  });

  it("shows the error state when the fetch fails", async () => {
    (global as any).$fetch.mockRejectedValue(new Error("boom"));
    const wrapper = mount(KanjiPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load the Kanji");
  });
});

describe("Kanji Detail Page (/kanji/[char])", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    vi.mocked(useRoute).mockReturnValue({ params: { char: "日" } } as any);
    (global as any).$fetch.mockResolvedValue(respond(kanjiDetail("日", TODAY)));
  });

  it("asks for the kanji in the route", async () => {
    mount(KanjiDetailPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/kanji-detail", {
      query: { char: "日" },
    });
  });

  it("shows the character, its readings, meanings, grade and words", async () => {
    const wrapper = mount(KanjiDetailPage);
    await flushPromises();

    const d = kanjiDetail("日", TODAY)!;
    expect(wrapper.find('[data-testid="kanji-char"]').text()).toBe("日");
    expect(wrapper.find('[data-testid="kanji-on"]').text()).toContain("ニチ");
    expect(wrapper.find('[data-testid="kanji-kun"]').text()).toContain("ひ");
    expect(wrapper.find('[data-testid="kanji-meanings"]').text()).toContain(
      "day",
    );
    expect(wrapper.find('[data-testid="kanji-facts"]').text()).toContain(
      "grade 1",
    );
    expect(wrapper.findAll('[data-testid="kanji-word"]')).toHaveLength(
      d.words.length,
    );
    expect(wrapper.text()).toContain("KANJIDIC2");
  });

  it("draws the strokes one by one, with KanjiVG credited", async () => {
    const wrapper = mount(KanjiDetailPage);
    await flushPromises();

    const d = kanjiDetail("日", TODAY)!;
    expect(wrapper.findAll('[data-testid="kanji-stroke"]')).toHaveLength(
      d.strokeCount,
    );
    expect(wrapper.text()).toContain("KanjiVG");
  });

  it("shows no stroke order for a kanji without strokes", async () => {
    (global as any).$fetch.mockResolvedValue(
      respond({ ...kanjiDetail("日", TODAY)!, strokes: undefined }),
    );
    const wrapper = mount(KanjiDetailPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="kanji-strokes"]').exists()).toBe(false);
  });

  it("links to the part page only when a word shows the kanji as a part", async () => {
    const wrapper = mount(KanjiDetailPage);
    await flushPromises();
    expect(wrapper.find('[data-testid="kanji-part-link"]').exists()).toBe(
      kanjiDetail("日", TODAY)!.isPart,
    );
  });

  it("shows the error state for a kanji no open word uses", async () => {
    (global as any).$fetch.mockRejectedValue({ statusCode: 404 });
    const wrapper = mount(KanjiDetailPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load This Kanji");
  });
});
