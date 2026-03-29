import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BriefingCard from "~/app/components/BriefingCard.vue";

// Define some mocked components usually provided by Nuxt UI automatically
const NuxtUIComponents = {
  UCard: { template: '<div class="u-card"><slot /></div>' },
  UBadge: { template: '<div class="u-badge"><slot /></div>' },
  UTooltip: { template: '<div class="u-tooltip"><slot /></div>' },
  UIcon: { template: '<span class="u-icon" />' },
};

describe("BriefingCard", () => {
  const mountBriefingCard = (briefing: any = {}) => {
    return mount(BriefingCard, {
      props: {
        briefing: {
          mainHeadline: "Test Headline",
          executiveSummary: "Test Summary",
          thematicAnalysis: "Test Analysis",
          sourcesProcessed: [],
          ...briefing,
        },
      },
      global: {
        stubs: NuxtUIComponents,
      },
    });
  };

  it("renders correctly with standard briefing data", () => {
    const wrapper = mountBriefingCard({
      overallCredibilityScore: 0.85,
    });

    expect(wrapper.text()).toContain("Test Headline");
    expect(wrapper.text()).toContain("Test Summary");
    expect(wrapper.text()).toContain("Test Analysis");
    expect(wrapper.text()).toContain("85%");
  });

  it("renders the AI failure fallback ui correctly", () => {
    const wrapper = mountBriefingCard({
      isAiFallback: true,
      overallCredibilityScore: 0.5,
    });
    
    // UTooltip should be present
    expect(wrapper.findComponent(NuxtUIComponents.UTooltip).exists()).toBe(true);
    expect(wrapper.text()).toContain("50%");
  });

  it("calculates credibility color mapping correctly via component styles", () => {
    const wrapper = mountBriefingCard({
      overallCredibilityScore: 1.0, 
    });
    
    // A score of 1.0 -> hue 120
    expect(wrapper.html()).toContain("hsl(120, 70%, 45%)");

    const wrapperLow = mountBriefingCard({
      overallCredibilityScore: 0.0,
    });
    // A score of 0.0 -> hue 0
    expect(wrapperLow.html()).toContain("hsl(0, 70%, 45%)");
  });

  it("displays sources appropriately", () => {
    const wrapper = mountBriefingCard({
      sourcesProcessed: [
        { title: "Source 1", source: "Example News", url: "https://example.com/1", credibilityScore: 0.9 },
        { title: "Source 2", source: "Untrusted Blog", credibilityScore: 0.3 }
      ]
    });

    expect(wrapper.text()).toContain("Sources Consulted (2)");
    expect(wrapper.text()).toContain("Source 1");
    expect(wrapper.text()).toContain("Example News");
    
    // Source 1 has URL, so should render an 'a' tag
    const links = wrapper.findAll("a");
    // Could have 2 links for the first source (one reading title, one external icon link) 
    expect(links.length).toBeGreaterThan(0);
    expect(wrapper.html()).toContain("https://example.com/1");
    
    // Source 2 has no URL, so no a tag 
    expect(wrapper.text()).toContain("Source 2");
    expect(wrapper.text()).toContain("Untrusted Blog");
  });
});
