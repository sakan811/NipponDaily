import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
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

  it("renders main wrapper and shoji grid", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".min-h-screen").exists()).toBe(true);
    expect(wrapper.find(".absolute.inset-0").exists()).toBe(true);
  });

  it("renders header with logo and navigation", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-header").exists()).toBe(true);
    expect(wrapper.text().toUpperCase()).toContain("NIPPONDAILY");
  });

  it("renders UColorModeButton in header", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-color-mode-button").exists()).toBe(true);
  });

  it("renders hero section with title and description", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Learn the language.");
    expect(wrapper.text()).toContain(
      "NipponDaily turns each week's Japanese-language news into self-contained lessons",
    );
  });

  it("renders hero section with CTA link to /news", () => {
    const wrapper = mount(IndexPage);

    const ctaLink = wrapper.find('[data-testid="hero-cta"]');
    expect(ctaLink.exists()).toBe(true);
    expect(ctaLink.text()).toContain("Start Reading");
  });

  it("renders the 'Inside Every Lesson' section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Inside Every Lesson");
    expect(wrapper.text()).toContain(
      "One Japanese-language article, turned into everything you need to read and understand it.",
    );
  });

  it("renders all six lesson components", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Furigana Passage");
    expect(wrapper.text()).toContain("Hepburn Rōmaji");
    expect(wrapper.text()).toContain("English Translation");
    expect(wrapper.text()).toContain("Vocabulary List");
    expect(wrapper.text()).toContain("Grammar Notes");
    expect(wrapper.text()).toContain("Trust Score & JLPT Level");
  });

  it("explains where lessons come from and links to the docs", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Where Lessons Come From");
    expect(wrapper.text()).toContain("a Claude web agent");
  });

  it("renders footer with copyright and license", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-footer").exists()).toBe(true);
    expect(wrapper.text()).toContain(
      "NipponDaily. All rights reserved. Released under the Apache-2.0 License.",
    );
  });

  it("renders without errors", () => {
    expect(() => mount(IndexPage)).not.toThrow();
  });

  it("does not render Developer Docs button on the UI", () => {
    const wrapper = mount(IndexPage);
    expect(wrapper.text()).not.toContain("Developer Docs");
  });

  it("renders header favicon logo correctly", () => {
    const wrapper = mount(IndexPage);
    const lightImg = wrapper.find('.u-header img[src="/favicon-light.ico"]');
    const darkImg = wrapper.find('.u-header img[src="/favicon-dark.ico"]');
    expect(lightImg.exists()).toBe(true);
    expect(lightImg.attributes("alt")).toBe("NipponDaily");
    expect(darkImg.exists()).toBe(true);
    expect(darkImg.attributes("alt")).toBe("NipponDaily");
  });
});
