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

    expect(wrapper.text()).toContain("Japan News, Smartly Delivered");
    expect(wrapper.text()).toContain(
      "Discover, translate, and verify Japanese news articles",
    );
  });

  it("renders hero section with CTA link to /news", () => {
    const wrapper = mount(IndexPage);

    const ctaLink = wrapper.find('a[href="/news"]');
    expect(ctaLink.exists()).toBe(true);
    expect(ctaLink.text()).toContain("Start Reading");
  });

  it("renders features section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Features");
    expect(wrapper.text()).toContain(
      "AI-powered tools for smarter Japanese news consumption.",
    );
  });

  it("renders all feature cards", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("AI-Powered Categorization");
    expect(wrapper.text()).toContain("Multi-Language Translation");
    expect(wrapper.text()).toContain("Credibility Scoring");
    expect(wrapper.text()).toContain("Flexible Filtering");
    expect(wrapper.text()).toContain("Daily Rate Limits");
  });

  it("renders feature descriptions", () => {
    const wrapper = mount(IndexPage);

    // AI-Powered Categorization
    expect(wrapper.text()).toContain(
      "Articles automatically sorted into Politics, Business",
    );

    // Multi-Language Translation
    expect(wrapper.text()).toContain("Read news in your preferred language");

    // Credibility Scoring
    expect(wrapper.text()).toContain(
      "Weighted score based on source reputation",
    );

    // Flexible Filtering
    expect(wrapper.text()).toContain("Filter by category and time range");

    // Daily Rate Limits
    expect(wrapper.text()).toContain("3 fetch requests per day");
  });

  it("renders AI-Powered badge in hero section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("AI-Powered News Aggregator");
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

  it("has 5 feature cards", () => {
    const wrapper = mount(IndexPage);

    const featureCards = wrapper.findAll(".u-page-card");
    expect(featureCards.length).toBe(5);
  });

  it("renders favicon image", () => {
    const wrapper = mount(IndexPage);

    const favicon = wrapper.find('img[alt="NipponDaily"]');
    expect(favicon.exists()).toBe(true);
    expect(favicon.attributes("src")).toBe("/favicon.ico");
  });
});
