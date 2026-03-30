import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import IndexPage from "~/app/pages/index.vue";

describe("Index Page (Landing)", () => {
  beforeEach(() => {
    // Reset the year for consistent copyright rendering
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders page structure with UPage", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-page").exists()).toBe(true);
  });

  it("renders header with logo and navigation", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-header").exists()).toBe(true);
    expect(wrapper.text()).toContain("NipponDaily");
  });

  it("renders UColorModeButton in header", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-color-mode-button").exists()).toBe(true);
  });

  it("renders hero section with title and description", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Japan News, Synthesized by AI");
    expect(wrapper.text()).toContain(
      "Stop scrolling through raw lists. Get AI-synthesized briefings",
    );
  });

  it("renders hero section with CTA link to /news", () => {
    const wrapper = mount(IndexPage);

    const ctaLink = wrapper.find('a[href="/news"]');
    expect(ctaLink.exists()).toBe(true);
    expect(ctaLink.text()).toContain("Generate Briefing");
  });

  it("renders features section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Intelligence at a Glance");
    expect(wrapper.text()).toContain(
      "AI-powered tools designed for deep news consumption without the noise.",
    );
  });

  it("renders all feature cards", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Executive Briefing");
    expect(wrapper.text()).toContain("Cross-Source Analysis");
    expect(wrapper.text()).toContain("AI Trust Scoring");
    expect(wrapper.text()).toContain("Multilingual Support");
    expect(wrapper.text()).toContain("Adaptive Discovery");
    expect(wrapper.text()).toContain("Fair Usage Limits");
  });

  it("renders feature descriptions", () => {
    const wrapper = mount(IndexPage);

    // Executive Briefing
    expect(wrapper.text()).toContain(
      "Synthesized reports that distill complex Japanese news",
    );

    // Cross-Source Analysis
    expect(wrapper.text()).toContain(
      "Identify relationships and contrasting viewpoints",
    );

    // AI Trust Scoring
    expect(wrapper.text()).toContain(
      "Automated evaluation of source reliability",
    );

    // Multilingual Support
    expect(wrapper.text()).toContain(
      "Read Japanese context in your preferred language",
    );

    // Adaptive Discovery
    expect(wrapper.text()).toContain(
      "Filter by category and custom time ranges",
    );

    // Fair Usage Limits
    expect(wrapper.text()).toContain(
      "Smart daily rate limits to ensure equitable access",
    );
  });

  it("renders AI-Powered badge in hero section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("AI Intelligence Aggregator");
    expect(wrapper.find(".u-badge").exists()).toBe(true);
  });

  it("renders footer with copyright", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-footer").exists()).toBe(true);
    expect(wrapper.text()).toContain(
      "NipponDaily. Released under the Apache-2.0 License.",
    );
  });

  it("renders divider between hero and features", () => {
    const wrapper = mount(IndexPage);

    const divider = wrapper.find(".border-t");
    expect(divider.exists()).toBe(true);
  });

  it("renders without errors", () => {
    expect(() => mount(IndexPage)).not.toThrow();
  });

  it("has 6 feature cards", () => {
    const wrapper = mount(IndexPage);

    const featureCards = wrapper.findAll(".u-page-card");
    expect(featureCards.length).toBe(6);
  });

  it("renders favicon image", () => {
    const wrapper = mount(IndexPage);

    const favicon = wrapper.find('img[alt="NipponDaily"]');
    expect(favicon.exists()).toBe(true);
    expect(favicon.attributes("src")).toBe("/favicon.ico");
  });
});
