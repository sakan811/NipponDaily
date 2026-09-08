import { vi } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import type { Lesson } from "~~/types/index";

export const mockLessonCard = {
  name: "LessonCard",
  props: ["lesson"],
  template: '<div class="lesson-card">{{ lesson?.title }}</div>',
};

vi.mock("~/app/components/LessonCard.vue", () => ({
  default: {
    name: "LessonCard",
    props: ["lesson"],
    template: '<div class="lesson-card">{{ lesson?.title }}</div>',
  },
}));

export const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => {
  const now = Date.now();
  return {
    id: "lesson-1",
    title: "Tech News Headline",
    titleJa: "テックニュースの見出し",
    source: "https://www3.nhk.or.jp",
    url: "https://www3.nhk.or.jp/news/1",
    favicon: "https://www3.nhk.or.jp/favicon.ico",
    publishedAt: new Date(now - 3600000).toISOString(),
    addedAt: now,
    credibilityScore: 0.9,
    difficultyLevel: "N3",
    originalText: "日本語の本文です。",
    englishText: "This is the Japanese body text.",
    furiganaText:
      "<ruby>日本語<rt>にほんご</rt></ruby>の<ruby>本文<rt>ほんぶん</rt></ruby>です。",
    romajiText: "Nihongo no honbun desu.",
    vocabList: [],
    grammarNotes: [],
    ...overrides,
  };
};

export const mockNewsResponse = (lessons: Lesson[] = [makeLesson()]) => ({
  success: true,
  data: {
    lessons,
    lastIngestTime: Date.now(),
  },
  count: lessons.length,
  timestamp: new Date().toISOString(),
});

export const mountReader = (options: any = {}) =>
  mount(JapanNewsReader, {
    global: {
      components: { LessonCard: mockLessonCard },
      ...(options.global || {}),
    },
    ...options,
  });
