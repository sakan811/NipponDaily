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
      "NipponDaily turns hiragana, katakana, and N5 kanji",
    );
  });

  it("renders hero section with CTA link to /game", () => {
    const wrapper = mount(IndexPage);

    const ctaLink = wrapper.find('[data-testid="hero-cta"]');
    expect(ctaLink.exists()).toBe(true);
    expect(ctaLink.text()).toContain("Play Today's Game");
  });

  it("renders the 'Inside Every Round' section", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Inside Every Round");
    expect(wrapper.text()).toContain(
      "Twenty multiple-choice questions, drawn fresh from the N5 learning pool every day.",
    );
  });

  it("renders all six game-part components", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Hiragana & Katakana");
    expect(wrapper.text()).toContain("N5 Kanji");
    expect(wrapper.text()).toContain("N5 Vocabulary");
    expect(wrapper.text()).toContain("Instant Feedback");
    expect(wrapper.text()).toContain("Per-Kind Accuracy");
    expect(wrapper.text()).toContain("Replay Anytime");
  });

  it("explains where the game comes from", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("Where the Game Comes From");
    expect(wrapper.text()).toContain("a Claude web agent");
  });

  it("renders the Documentation section with links to every docs page", () => {
    const wrapper = mount(IndexPage);

    expect(wrapper.text()).toContain("How NipponDaily Works");
    expect(wrapper.text()).toContain("System Architecture");
    expect(wrapper.text()).toContain("Color Palette & System");
    expect(wrapper.text()).toContain("Core Features");
    expect(wrapper.text()).toContain("Error & Fallback States");

    const docsLinks = wrapper
      .findAll("a")
      .map((a) => a.attributes("href"))
      .filter((href): href is string => !!href?.startsWith("/docs/"));
    expect(docsLinks).toEqual(
      expect.arrayContaining([
        "/docs/architecture",
        "/docs/color-palette",
        "/docs/features",
        "/docs/error-states",
      ]),
    );
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
