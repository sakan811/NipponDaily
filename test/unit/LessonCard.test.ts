import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LessonCard from "~/app/components/LessonCard.vue";
import type { Lesson } from "~~/types/index";

const NuxtUIComponents = {
  UCard: { template: '<div class="u-card"><slot /></div>' },
  UBadge: { template: '<div class="u-badge"><slot /></div>' },
  UTooltip: { template: '<div class="u-tooltip"><slot /></div>' },
  UIcon: { template: '<span class="u-icon" />' },
};

const baseLesson: Lesson = {
  id: "l1",
  title: "Test Headline",
  titleJa: "テスト見出し",
  source: "https://www3.nhk.or.jp",
  url: "https://www3.nhk.or.jp/news/1",
  favicon: "https://www3.nhk.or.jp/favicon.ico",
  publishedAt: "2026-01-15T10:00:00Z",
  addedAt: 1736935200000,
  credibilityScore: 0.85,
  difficultyLevel: "N3",
  originalText: "首相は表明した。",
  englishText: "The prime minister made a statement.",
  furiganaText: "<ruby>首相<rt>しゅしょう</rt></ruby>は",
  romajiText: "Shushō wa",
  vocabList: [
    {
      term: "首相",
      reading: "しゅしょう",
      romaji: "shushō",
      meaning: "prime minister",
      jlptLevel: "N3",
      exampleSentence: "首相は表明した。",
    },
  ],
  grammarNotes: [
    {
      pattern: "〜は",
      explanation: "topic marker",
      exampleSentence: "首相は表明した。",
      romaji: "shushō wa hyōmei shita.",
    },
  ],
};

const mountCard = (overrides: Partial<Lesson> = {}) =>
  mount(LessonCard, {
    props: { lesson: { ...baseLesson, ...overrides } },
    global: { stubs: NuxtUIComponents },
  });

describe("LessonCard", () => {
  it("renders the title, Japanese title, difficulty and trust score", () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain("Test Headline");
    expect(wrapper.text()).toContain("テスト見出し");
    expect(wrapper.text()).toContain("N3");
    expect(wrapper.text()).toContain("85%");
  });

  it("maps credibility score to an HSL colour", () => {
    expect(mountCard({ credibilityScore: 1 }).html()).toContain(
      "hsl(120, 70%, 45%)",
    );
    expect(mountCard({ credibilityScore: 0 }).html()).toContain(
      "hsl(0, 70%, 45%)",
    );
  });

  it("links to the original article and renders the favicon", () => {
    const wrapper = mountCard();
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://www3.nhk.or.jp/favicon.ico");
    const link = wrapper.find('a[href="https://www3.nhk.or.jp/news/1"]');
    expect(link.exists()).toBe(true);
    expect(wrapper.text()).toContain("nhk.or.jp");
  });

  it("renders the passage, rōmaji, vocab and grammar", () => {
    const wrapper = mountCard();
    const text = wrapper.text();
    expect(text).toContain("prime minister");
    expect(text).toContain("topic marker");
    expect(text).toContain("shushō");
    expect(text).toContain("Shushō wa");
    expect(wrapper.html()).toContain("<ruby>");
    expect(wrapper.html()).toContain("<rt>しゅしょう</rt>");
  });

  it("renders the English translation of the passage when present", () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain("English translation");
    expect(wrapper.text()).toContain("The prime minister made a statement.");
  });

  it("omits the translation section when englishText is empty", () => {
    const wrapper = mountCard({ englishText: "" });
    expect(wrapper.text()).not.toContain("English translation");
  });

  it("escapes disallowed markup in furiganaText but keeps ruby tags", () => {
    const wrapper = mountCard({
      favicon: undefined,
      furiganaText: "<img src=x onerror=alert(1)><ruby>水<rt>みず</rt></ruby>",
    });
    const passage = wrapper.find(".furigana-text");
    // The <img> is neutralised into escaped text, not a real element…
    expect(passage.find("img").exists()).toBe(false);
    expect(passage.html()).toContain("&lt;img src=x onerror=alert(1)&gt;");
    // …while the ruby markup is preserved as real elements.
    expect(passage.find("ruby rt").text()).toBe("みず");
  });

  it("falls back to plain originalText when there is no furiganaText", () => {
    const wrapper = mountCard({ furiganaText: "" });
    expect(wrapper.text()).toContain("首相は表明した。");
  });

  it("renders vocab terms with furigana over the kanji", () => {
    const wrapper = mountCard();
    const vocabRuby = wrapper.findAll("li ruby");
    expect(vocabRuby.length).toBeGreaterThan(0);
    expect(wrapper.html()).toContain("<rt>しゅしょう</rt>");
  });

  it("renders furigana and rōmaji for vocab and grammar examples", () => {
    const wrapper = mountCard({
      vocabList: [
        {
          term: "首相",
          reading: "しゅしょう",
          romaji: "shushō",
          meaning: "prime minister",
          jlptLevel: "N3",
          exampleSentence: "首相は表明した。",
          exampleFurigana:
            "<ruby>首相<rt>しゅしょう</rt></ruby>は<ruby>表明<rt>ひょうめい</rt></ruby>した。",
          exampleRomaji: "Shushō wa hyōmei shita.",
        },
      ],
      grammarNotes: [
        {
          pattern: "〜は",
          explanation: "topic marker",
          exampleSentence: "首相は表明した。",
          romaji: "shushō wa hyōmei shita.",
          exampleFurigana: "首相は<ruby>表明<rt>ひょうめい</rt></ruby>した。",
        },
      ],
    });
    expect(wrapper.html()).toContain("<rt>ひょうめい</rt>");
    expect(wrapper.text()).toContain("Shushō wa hyōmei shita.");
  });

  it("renders part of speech for vocab and grammar, and furigana on the grammar pattern", () => {
    const wrapper = mountCard({
      vocabList: [
        {
          term: "表明",
          reading: "ひょうめい",
          romaji: "hyōmei",
          meaning: "declaration",
          partOfSpeech: "suru verb",
          jlptLevel: "N2",
          exampleSentence: "首相は表明した。",
        },
      ],
      grammarNotes: [
        {
          pattern: "表明する",
          patternFurigana: "<ruby>表明<rt>ひょうめい</rt></ruby>する",
          partOfSpeech: "suru verb",
          explanation: "to declare",
          exampleSentence: "首相は表明した。",
          romaji: "shushō wa hyōmei shita.",
        },
      ],
    });
    expect(wrapper.text()).toContain("suru verb");
    expect(wrapper.html()).toContain("<rt>ひょうめい</rt>");
  });

  it("marks passage occurrences of vocab terms as clickable tokens", () => {
    const wrapper = mountCard();
    const token = wrapper.find(".jp-token");
    expect(token.exists()).toBe(true);
    expect(token.attributes("data-vi")).toBe("0");
  });

  it("opens a word popover with reading, rōmaji and meaning on token click", async () => {
    const wrapper = mountCard({
      vocabList: [
        {
          term: "首相",
          reading: "しゅしょう",
          romaji: "shushō",
          meaning: "cabinet chief minister",
          jlptLevel: "N3",
          exampleSentence: "首相は表明した。",
        },
      ],
    });
    await wrapper.find(".jp-token").trigger("click");
    await wrapper.vm.$nextTick();
    const popover = document.querySelector(".jp-popover");
    expect(popover).not.toBeNull();
    expect(popover?.textContent).toContain("cabinet chief minister");
    expect(popover?.textContent).toContain("shushō");
    expect(popover?.textContent).toContain("しゅしょう");
    wrapper.unmount();
  });
});
