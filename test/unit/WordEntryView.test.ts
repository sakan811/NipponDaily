import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WordEntryView from "~/app/components/WordEntryView.vue";
import { WORD_ENTRIES } from "~~/shared/words";

const entryOn = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;
const render = (date: string) =>
  mount(WordEntryView, { props: { entry: entryOn(date) } });

describe("WordEntryView", () => {
  it("shows the word, reading, meaning, level and layer", () => {
    const wrapper = render("2026-10-03");

    expect(wrapper.find('[data-testid="word-term"]').text()).toBe("手紙");
    expect(wrapper.find('[data-testid="word-kana"]').text()).toBe("てがみ");
    expect(wrapper.find('[data-testid="word-meaning"]').text()).toBe("letter");
    const badges = wrapper.find('[data-testid="word-badges"]').text();
    expect(badges).toContain("JLPT N5");
    expect(badges).toContain("和語");
    expect(badges).toContain("Native Japanese");
    expect(badges).toContain("Rendaku");
  });

  it("formats the date in a fixed calendar, not the reader's timezone", () => {
    const wrapper = render("2026-10-03");

    expect(wrapper.text()).toContain("Saturday, October 3, 2026");
  });

  it("lays out the morphemes left to right with plus signs between", () => {
    const wrapper = render("2026-10-03");

    const parts = wrapper.findAll('[data-testid="word-morpheme"]');
    expect(parts).toHaveLength(2);
    expect(parts[0]!.text()).toContain("手");
    expect(parts[0]!.text()).toContain("hand");
    expect(parts[1]!.text()).toContain("がみ");
    // The rendaku'd reading says where it came from.
    expect(parts[1]!.text()).toContain("from かみ");
    expect(wrapper.find('[data-testid="word-morphemes"]').text()).toContain(
      "+",
    );
  });

  it("explains a gap between the parts' reading and the word's", () => {
    const wrapper = render("2026-10-23");

    const note = wrapper.find('[data-testid="word-parts-reading"]');
    expect(note.exists()).toBe(true);
    expect(note.text()).toContain("いめ");
    expect(note.text()).toContain("ゆめ");
  });

  it("omits that note when the parts read as the word does", () => {
    const wrapper = render("2026-10-03");

    expect(wrapper.find('[data-testid="word-parts-reading"]').exists()).toBe(
      false,
    );
  });

  it("shows every story paragraph", () => {
    const entry = entryOn("2026-10-13");
    const wrapper = render("2026-10-13");

    expect(entry.story.length).toBeGreaterThan(1);
    for (const para of entry.story) {
      expect(wrapper.text()).toContain(para);
    }
  });

  it("shows a 'not settled' callout only when the entry has an uncertainty", () => {
    expect(
      render("2026-10-19").find('[data-testid="word-uncertainty"]').text(),
    ).toContain("Not settled");
    expect(
      render("2026-10-02").find('[data-testid="word-uncertainty"]').exists(),
    ).toBe(false);
  });

  it("admits when there is no safe breakdown", () => {
    const wrapper = render("2026-10-19");

    expect(wrapper.find('[data-testid="word-morphemes"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="word-no-breakdown"]').text()).toContain(
      "any split would be a guess",
    );
  });

  it("quotes every source and links the pinned Wiktionary revision", () => {
    const entry = entryOn("2026-10-01");
    const wrapper = render("2026-10-01");

    const quotes = wrapper.findAll('[data-testid="word-sources"] li');
    expect(quotes).toHaveLength(entry.sources.length);
    expect(quotes[0]!.text()).toContain(entry.sources[0]!.quote);

    const link = wrapper.find(`a[href*="oldid=${entry.wiktionaryRev}"]`);
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toContain("en.wiktionary.org");
    expect(link.attributes("href")).toContain(encodeURIComponent("電話"));
  });

  it("states the source license", () => {
    const wrapper = render("2026-10-01");

    expect(wrapper.text()).toContain("CC BY-SA 4.0");
  });

  it("defines each label it shows", () => {
    const wrapper = render("2026-10-11");

    expect(wrapper.text()).toContain(
      "A longer word or phrase shortened in everyday use.",
    );
    expect(wrapper.text()).toContain("外来語");
  });
});
