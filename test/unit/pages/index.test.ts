import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import IndexPage from "~/app/pages/index.vue";
import { WORD_ENTRIES } from "~~/shared/words";
import { DOC_CHAPTERS, docPath } from "~~/shared/docs";

const entry = WORD_ENTRIES.find((e) => e.date === "2026-10-01")!;

const payload = {
  success: true,
  data: { entry, lap: 1, prev: null, next: null },
  timestamp: "2026-10-01T00:00:00Z",
};

describe("Index Page (Landing)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-01T03:00:00Z"));
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(payload);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders main wrapper and season backdrop", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".min-h-screen").exists()).toBe(true);
    expect(wrapper.find(".season-backdrop").exists()).toBe(true);
  });

  it("renders header with logo and navigation", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-header").exists()).toBe(true);
    expect(wrapper.text().toUpperCase()).toContain("NIPPONDAILY");
  });

  it("renders UColorModeButton in header", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-color-mode-button").exists()).toBe(true);
  });

  it("renders the hero pitch", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("a story.");
    expect(wrapper.text()).toContain("takes it apart");
    expect(wrapper.text()).toContain("the calendar keeps them all");
  });

  it("fetches and shows today's word, linking to its page", async () => {
    const wrapper = mount(IndexPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/daily-word", {
      query: {},
    });
    const card = wrapper.find('[data-testid="today-word"]');
    expect(card.exists()).toBe(true);
    expect(card.attributes("href")).toBe("/words/2026-10-01");
    expect(wrapper.find('[data-testid="today-term"]').text()).toBe("電話");
    expect(card.text()).toContain("でんわ");
    expect(card.text()).toContain(entry.headline);
  });

  it("names the lap only once the words have started again", async () => {
    const wrapper = mount(IndexPage);
    await flushPromises();
    expect(wrapper.find('[data-testid="today-lap"]').exists()).toBe(false);

    (global as any).$fetch.mockResolvedValue({
      ...payload,
      data: { ...payload.data, lap: 2 },
    });
    const second = mount(IndexPage);
    await flushPromises();
    const lap = second.find('[data-testid="today-lap"]');
    expect(lap.text()).toContain("Lap 2");
    expect(lap.text()).toContain("first opened");
    expect(lap.text()).toContain("2026");
  });

  it("shows a skeleton, not an error, while the word loads", () => {
    (global as any).$fetch.mockReturnValue(new Promise(() => {}));
    const wrapper = mount(IndexPage);

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(false);
  });

  it("shows the error card when the word fails to load, and retries", async () => {
    (global as any).$fetch.mockRejectedValueOnce(new Error("offline"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(IndexPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Unable to Load Today's Word");

    await wrapper.find('[data-testid="error-state"] button').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-testid="today-word"]').exists()).toBe(true);
    consoleError.mockRestore();
  });

  it("links to the calendar and the kana guide", () => {
    const wrapper = mount(IndexPage);

    const calendar = wrapper.find('[data-testid="hero-calendar-cta"]');
    expect(calendar.attributes("to")).toBe("/words");
    expect(calendar.text()).toContain("Browse the Calendar");
    expect(wrapper.find('[data-testid="hero-kana-cta"]').attributes("to")).toBe(
      "/kana",
    );
  });

  it("no longer advertises the game or the lesson path", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find('[data-testid="hero-cta"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="hero-learn-cta"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Play Today's Game");
  });

  it("renders the six parts of every entry", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Inside Every Entry");
    for (const title of [
      "Taken Apart",
      "Which Layer",
      "The Process",
      "The Story",
      "What's Not Settled",
      "The Evidence",
    ]) {
      expect(wrapper.text()).toContain(title);
    }
  });

  it("explains where the claims come from", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Where the Claims Come From");
    expect(wrapper.text()).toContain("dated dump of Wiktionary");
  });

  it("renders the documentation section linking every chapter and the book", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("How NipponDaily Works");
    for (const chapter of DOC_CHAPTERS) {
      expect(wrapper.find(`a[href="${docPath(chapter.slug)}"]`).exists()).toBe(
        true,
      );
    }
    expect(wrapper.find('a[href="/docs"]').exists()).toBe(true);
  });

  it("renders the footer with license and Wiktionary attribution", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Apache-2.0 License");
    expect(wrapper.text()).toContain("Wiktionary");
    expect(wrapper.text()).toContain("CC BY-SA 4.0");
  });
});
