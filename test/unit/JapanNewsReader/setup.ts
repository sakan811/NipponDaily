import { vi } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";

// Mock @internationalized/date BEFORE importing the component
vi.mock("@internationalized/date", () => {
  class MockCalendarDate {
    constructor(year: number, month: number, day: number) {
      this.year = year;
      this.month = month;
      this.day = day;
    }
    year: number;
    month: number;
    day: number;
    subtract(options: { days: number }) {
      return new MockCalendarDate(
        this.year,
        this.month,
        this.day - options.days,
      );
    }
    add(options: { days: number }) {
      return new MockCalendarDate(
        this.year,
        this.month,
        this.day + options.days,
      );
    }
  }
  return {
    CalendarDate: MockCalendarDate,
  };
});

const mockBriefingCard = {
  name: "BriefingCard",
  props: ["briefing"],
  template: '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
};

vi.mock("~/app/components/BriefingCard.vue", () => ({
  default: {
    name: "BriefingCard",
    props: ["briefing"],
    template: '<div class="briefing-card">{{ briefing?.mainHeadline }}</div>',
  },
}));

const ULocaleSelectMock = {
  name: "ULocaleSelect",
  props: ["id", "modelValue", "locales", "disabled", "size", "class"],
  emits: ["update:modelValue"],
  template:
    '<select :id="id" :disabled="disabled" :class="class" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
};

const ClientOnlyMock = {
  name: "ClientOnly",
  template: "<div><slot></slot></div>",
};

// Helper function to mount with common mocks
export const mountReader = (options = {}) => {
  return mount(JapanNewsReader, {
    global: {
      components: {
        NewsCard: mockBriefingCard,
        ClientOnly: ClientOnlyMock,
      },
      stubs: {
        ULocaleSelect: ULocaleSelectMock,
      },
      ...(options.global || {}),
    },
    ...options,
  });
};

export const mockNews = {
  isAiFallback: false,
  mainHeadline: "Tech News Headline",
  executiveSummary: "Tech Executive Summary",
  thematicAnalysis: "Tech Thematic Analysis",
  overallCredibilityScore: 0.85,
  sourcesProcessed: [
    {
      title: "Tech News",
      source: "Tech Source",
      url: "https://example.com",
      credibilityScore: 0.9,
      publishedAt: "2024-01-15T10:00:00Z",
      category: "Technology",
    },
    {
      title: "Politics News",
      source: "Politics Source",
      url: "https://example.com",
      credibilityScore: 0.8,
      publishedAt: "2024-01-15T11:00:00Z",
      category: "Politics",
    },
  ],
};

export const createMockFetch = () => {
  return vi.fn().mockResolvedValue({
    success: true,
    data: mockNews,
    count: 2,
    timestamp: "2024-01-15T10:00:00Z",
  });
};

export { mockBriefingCard, ULocaleSelectMock };
