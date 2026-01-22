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

const NewsCardMock = {
  name: "NewsCard",
  props: ["news"],
  template: '<div class="news-card">{{ news.title }}</div>',
};

vi.mock("~/app/components/NewsCard.vue", () => ({
  default: NewsCardMock,
}));

// Mock ULocaleSelect component - define it but don't use vi.mock
const ULocaleSelectMock = {
  name: "ULocaleSelect",
  props: ["id", "modelValue", "locales", "disabled", "size", "class"],
  emits: ["update:modelValue"],
  template:
    '<select :id="id" :disabled="disabled" :class="class" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
};

// Helper function to mount with common mocks
export const mountReader = (options = {}) => {
  return mount(JapanNewsReader, {
    global: {
      components: {
        NewsCard: NewsCardMock,
      },
      stubs: {
        ULocaleSelect: ULocaleSelectMock,
      },
      ...(options.global || {}),
    },
    ...options,
  });
};

export const mockNews = [
  {
    title: "Tech News",
    summary: "Tech Summary",
    content: "Tech Content",
    source: "Tech Source",
    publishedAt: "2024-01-15T10:00:00Z",
    category: "Technology",
  },
  {
    title: "Politics News",
    summary: "Politics Summary",
    content: "Politics Content",
    source: "Politics Source",
    publishedAt: "2024-01-15T11:00:00Z",
    category: "Politics",
  },
];

export const createMockFetch = () => {
  return vi.fn().mockResolvedValue({
    success: true,
    data: mockNews,
    count: 2,
    timestamp: "2024-01-15T10:00:00Z",
  });
};

export { NewsCardMock, ULocaleSelectMock };
