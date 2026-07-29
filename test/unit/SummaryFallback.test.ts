import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SummaryFallback from "~/app/components/SummaryFallback.vue";

describe("SummaryFallback Component", () => {
  it("renders fallback header and raw sources list", () => {
    const mockSources = [
      {
        title: "Test Source 1",
        source: "Nikkei",
        url: "https://nikkei.com",
      },
      {
        title: "Test Source 2",
        source: "NHK",
        url: "https://nhk.or.jp",
      },
    ];

    const wrapper = mount(SummaryFallback, {
      props: {
        headline: "Sample Story Headline",
        sources: mockSources,
        loading: false,
        isDebug: false,
      },
    });

    expect(wrapper.text()).toContain("AI Summary Engine Fallback Mode");
    expect(wrapper.text()).toContain("Sample Story Headline");
    expect(wrapper.text()).toContain("Test Source 1");
    expect(wrapper.text()).toContain("Test Source 2");
  });

  it("emits retry event when Retry AI Summarization button is clicked", async () => {
    const wrapper = mount(SummaryFallback, {
      props: {
        headline: "Headline Test",
        sources: [],
        loading: false,
        isDebug: false,
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    await button.trigger("click");

    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("shows debug showcase when isDebug is true", () => {
    const wrapper = mount(SummaryFallback, {
      props: {
        headline: "Debug Story",
        sources: [],
        loading: false,
        isDebug: true,
      },
    });

    expect(wrapper.text()).toContain(
      "DEBUG_ERROR_UI: Summary Process Failure Preview",
    );
  });

  it("renders default topic coverage title when headline is missing and renders source without url", () => {
    const mockSourcesWithoutUrl = [
      {
        title: "No URL Source",
        source: "Offline Paper",
      },
    ];

    const wrapper = mount(SummaryFallback, {
      props: {
        sources: mockSourcesWithoutUrl,
      },
    });

    expect(wrapper.text()).toContain("Topic Coverage (Raw Sources)");
    expect(wrapper.text()).toContain("No URL Source");
    expect(wrapper.text()).toContain("Offline Paper");
  });
});
