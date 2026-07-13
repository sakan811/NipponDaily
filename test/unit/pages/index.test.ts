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
    expect(wrapper.text().toUpperCase()).toContain("NIPPON DAILY");
    expect(wrapper.text()).toContain("日本日報");
  });

  it("renders UColorModeButton in header", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-color-mode-button").exists()).toBe(true);
  });

  it("renders hero section with title and description", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Japan, Synthesized.");
    expect(wrapper.text()).toContain(
      "Bypassing the generic noise. NipponDaily aggregates, synthesizes, and analyzes",
    );
  });

  it("renders hero section with CTA link to /news", () => {
    const wrapper = mount(IndexPage);

    const ctaLink = wrapper.find('[to="/news"]');
    expect(ctaLink.exists()).toBe(true);
    expect(ctaLink.text()).toContain("Enter Intelligence Hub");
  });

  it("renders six specialty channels section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Six Specialty Channels");
    expect(wrapper.text()).toContain(
      "Curated streams capturing the true multi-faceted heart and pulse of modern Japan.",
    );
  });

  it("renders all six custom Japanese channels", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Society & Prefectures");
    expect(wrapper.text()).toContain("Tech & Mobility");
    expect(wrapper.text()).toContain("Pop Culture & Gaming");
    expect(wrapper.text()).toContain("Travel & Heritage");
    expect(wrapper.text()).toContain("Food & Gastronomy");
    expect(wrapper.text()).toContain("Nature & Resilience");
  });

  it("renders channel Japanese tags", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("地方・社会");
    expect(wrapper.text()).toContain("技術・産業");
    expect(wrapper.text()).toContain("ポップカルチャー");
    expect(wrapper.text()).toContain("観光・遺産");
    expect(wrapper.text()).toContain("和食・食文化");
    expect(wrapper.text()).toContain("自然・防災");
  });

  it("renders aesthetic philosophy section with Japanese pigments", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Aesthetic Philosophy");
    expect(wrapper.text()).toContain("Torii Vermilion");
    expect(wrapper.text()).toContain("Serene Sky");
    expect(wrapper.text()).toContain("Amber Gold");
    expect(wrapper.text()).toContain("Zen Stone");
  });

  it("renders footer with copyright and license", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.find(".u-footer").exists()).toBe(true);
    expect(wrapper.text()).toContain(
      "NIPPON DAILY (日本日報). All rights reserved. Released under the Apache-2.0 License.",
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
    const img = wrapper.find('.u-header img[src="/favicon.ico"]');
    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toBe("NipponDaily");
  });
});
