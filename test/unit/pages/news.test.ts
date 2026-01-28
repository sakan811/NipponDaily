import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NewsPage from "~/app/pages/news.vue";

// Mock JapanNewsReader component
const JapanNewsReaderMock = {
  name: "JapanNewsReader",
  template: '<div class="japan-news-reader">JapanNewsReader</div>',
};

vi.mock("~/app/components/JapanNewsReader.vue", () => ({
  default: JapanNewsReaderMock,
}));

describe("News Page", () => {
  it("renders JapanNewsReader component", () => {
    const wrapper = mount(NewsPage, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
        },
      },
    });

    expect(wrapper.findComponent(JapanNewsReaderMock).exists()).toBe(true);
  });

  it("renders without errors", () => {
    expect(() =>
      mount(NewsPage, {
        global: {
          components: {
            JapanNewsReader: JapanNewsReaderMock,
          },
        },
      }),
    ).not.toThrow();
  });
});
