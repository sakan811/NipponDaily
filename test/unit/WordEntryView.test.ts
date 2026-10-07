import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WordEntryView from "~/app/components/WordEntryView.vue";
import type { WordEntry } from "~~/types/index";

/** A hand-built fixture: this tests the component, not the catalogue. */
const entry = (over: Partial<WordEntry> = {}): WordEntry => ({
  date: "2026-10-03",
  term: "手紙",
  kana: "てがみ",
  meaning: "letter",
  level: "N5",
  pos: ["noun (common) (futsuumeishi)"],
  stratum: "wago",
  processes: ["compound", "rendaku"],
  headline: "A letter is a “hand paper”.",
  morphemes: [
    { text: "手", reading: "て", meaning: "hand" },
    { text: "紙", reading: "がみ", base: "かみ", meaning: "paper" },
  ],
  sources: [
    { quote: "Compound of 手 (te, “hand”) + 紙 (kami, “paper”)." },
    { quote: "The kami changes to gami as an instance of rendaku (連濁)." },
  ],
  wiktionaryDump: "2026-09-02",
  ...over,
});

const render = (over: Partial<WordEntry> = {}) =>
  mount(WordEntryView, { props: { entry: entry(over) } });

describe("WordEntryView", () => {
  it("shows the word, reading, meaning, level and layer", () => {
    const wrapper = render();

    expect(wrapper.find('[data-testid="word-term"]').text()).toBe("手紙");
    expect(wrapper.find('[data-testid="word-kana"]').text()).toBe("てがみ");
    expect(wrapper.find('[data-testid="word-meaning"]').text()).toBe("letter");
    const badges = wrapper.find('[data-testid="word-badges"]').text();
    expect(badges).toContain("JLPT N5");
    expect(badges).toContain("和語");
    expect(badges).toContain("Native Japanese");
    expect(badges).toContain("Rendaku");
  });

  it("links each part to the page listing every word it appears in", () => {
    const wrapper = render();

    const parts = wrapper.findAll('[data-testid="word-morpheme"] a');
    expect(parts.map((a) => a.attributes("href"))).toEqual([
      "/parts/%E6%89%8B",
      "/parts/%E7%B4%99",
    ]);
  });

  it("shows JMdict's part-of-speech tags verbatim, one badge each", () => {
    const wrapper = render({ pos: ["Ichidan verb", "transitive verb"] });

    const tags = wrapper.findAll('[data-testid="word-pos"]');
    expect(tags.map((t) => t.text())).toEqual([
      "Ichidan verb",
      "transitive verb",
    ]);
  });

  it("shows no part-of-speech badge when JMdict gave none", () => {
    expect(render({ pos: [] }).find('[data-testid="word-pos"]').exists()).toBe(
      false,
    );
  });

  it("formats the date in a fixed calendar, not the reader's timezone", () => {
    expect(render().text()).toContain("Saturday, October 3, 2026");
  });

  it("lays out the morphemes left to right with plus signs between", () => {
    const wrapper = render();

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

  it("admits when the source gives no breakdown", () => {
    const wrapper = render({ morphemes: [] });

    expect(wrapper.find('[data-testid="word-morphemes"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="word-no-breakdown"]').text()).toContain(
      "any other split would be a guess",
    );
  });

  it("says why when the only proposed split is hedged", () => {
    const wrapper = render({
      morphemes: [],
      sources: [
        { quote: "/winaka/ → /inaka/" },
        {
          quote:
            "Possibly a compound of 居 (i, “to be”) + 中 (naka, “inside, middle”).",
        },
      ],
    });

    const text = wrapper.find('[data-testid="word-no-breakdown"]').text();
    expect(text).toContain("the only split Wiktionary offers is hedged");
    expect(text).not.toContain("doesn't give a split");
  });

  it("says where the meanings come from when the parts are KANJIDIC2's", () => {
    const wrapper = render({
      morphemes: [
        {
          text: "商",
          reading: "しょう",
          meaning: "merchant",
          glossSource: "kanjidic2",
        },
        {
          text: "人",
          reading: "にん",
          meaning: "person",
          glossSource: "kanjidic2",
        },
      ],
    });
    expect(wrapper.find('[data-testid="word-kanjidic-note"]').text()).toContain(
      "KANJIDIC2",
    );
    expect(wrapper.find('[data-testid="word-no-breakdown"]').exists()).toBe(
      false,
    );
    expect(render().find('[data-testid="word-kanjidic-note"]').exists()).toBe(
      false,
    );
  });

  it("quotes every source line verbatim, with no paraphrase around them", () => {
    const e = entry();
    const wrapper = render();

    const quotes = wrapper.findAll('[data-testid="word-sources"] li');
    expect(quotes).toHaveLength(e.sources.length);
    e.sources.forEach((s, i) => expect(quotes[i]!.text()).toContain(s.quote));
    expect(wrapper.text()).toContain("Nothing below is paraphrased");
  });

  it("flags a hedged line and shows the 'not settled' callout only then", () => {
    const hedged = render({
      sources: [
        { quote: "From Old Japanese." },
        { quote: "Probably a compound of 手 (te) + 紙 (kami)." },
      ],
    });
    expect(hedged.find('[data-testid="word-uncertainty"]').text()).toContain(
      "Not settled",
    );
    const lines = hedged.findAll('[data-testid="word-sources"] li');
    expect(lines[0]!.text()).not.toContain("Hedged");
    expect(lines[1]!.text()).toContain("Hedged");

    expect(render().find('[data-testid="word-uncertainty"]').exists()).toBe(
      false,
    );
  });

  it("links the Wiktionary page and names the dump it was quoted from", () => {
    const e = entry();
    const link = render().find(`a[href*="/wiki/"]`);

    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toContain("en.wiktionary.org");
    expect(link.attributes("href")).toContain(encodeURIComponent("手紙"));
    expect(link.text()).toContain(e.wiktionaryDump);
  });

  it("states the source licenses", () => {
    const text = render().text();

    expect(text).toContain("CC BY-SA 4.0");
    expect(text).toContain("JMdict");
    expect(text).toContain("KANJIDIC2");
  });

  it("defines each label it shows", () => {
    const wrapper = render({
      stratum: "gairaigo",
      processes: ["clipping"],
    });

    expect(wrapper.text()).toContain(
      "A longer word or phrase shortened in everyday use.",
    );
    expect(wrapper.text()).toContain("外来語");
  });

  it("shows example sentences with the word marked, a translation and Tatoeba links", () => {
    const wrapper = render({
      examples: [
        {
          id: 1234,
          ja: "手紙を書いた。",
          en: "I wrote a letter.",
          enId: 5678,
          form: "手紙",
        },
      ],
    });

    const ex = wrapper.find('[data-testid="word-example"]');
    expect(ex.text()).toContain("手紙を書いた。");
    expect(ex.find("mark").text()).toBe("手紙");
    expect(ex.text()).toContain("I wrote a letter.");
    const links = ex.findAll("a").map((a) => a.attributes("href"));
    expect(links[0]).toMatch(/\/sentences\/show\/1234$/);
    expect(links[1]).toMatch(/\/sentences\/show\/5678$/);
    expect(wrapper.text()).toContain("Nobody has reviewed them one by one");
  });

  it("draws the readings over their kanji, the word's own form still marked", () => {
    const wrapper = render({
      examples: [
        {
          id: 1234,
          ja: "手紙を書いた。",
          en: "I wrote a letter.",
          enId: 5678,
          form: "手紙",
          furigana: [["手紙", "てがみ"], ["を"], ["書", "か"], ["いた。"]],
        },
      ],
    });

    const sentence = wrapper.find('[data-testid="word-example"] p');
    expect(sentence.findAll("ruby").map((r) => r.find("rt").text())).toEqual([
      "てがみ",
      "か",
    ]);
    expect(sentence.find("mark ruby rt").text()).toBe("てがみ");
    expect(sentence.findAll("rp").length).toBe(4);
    expect(sentence.element.getAttribute("lang")).toBe("ja");
  });

  it("shows no sentence section when the word has none", () => {
    expect(render().find('[data-testid="word-examples"]').exists()).toBe(false);
  });

  it("links each kanji of the word to its page", () => {
    const links = render().findAll('[data-testid="word-kanji"] a');
    expect(links.map((a) => a.attributes("href"))).toEqual([
      "/kanji/%E6%89%8B",
      "/kanji/%E7%B4%99",
    ]);
  });

  it("marks a common word", () => {
    expect(
      render({ priority: ["ichi1", "news1"] })
        .find('[data-testid="word-common"]')
        .exists(),
    ).toBe(true);
    expect(
      render({ priority: ["news2"] })
        .find('[data-testid="word-common"]')
        .exists(),
    ).toBe(false);
    expect(render().find('[data-testid="word-common"]').exists()).toBe(false);
  });
});
