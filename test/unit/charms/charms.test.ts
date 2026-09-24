import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import OmamoriCharm from "~/app/components/OmamoriCharm.vue";
import EmaPlaque from "~/app/components/EmaPlaque.vue";
import HankoSeal from "~/app/components/HankoSeal.vue";

describe("OmamoriCharm", () => {
  it("renders slot content inside the charm face with its cord", () => {
    const wrapper = mount(OmamoriCharm, {
      props: { mark: "学", size: "sm", index: 3 },
      slots: { default: "<p>あ</p>" },
    });

    expect(wrapper.classes()).toContain("omamori--sm");
    expect(wrapper.find(".omamori__cord").exists()).toBe(true);
    expect(wrapper.find(".omamori__face").text()).toContain("あ");
    expect(wrapper.find(".omamori__mark").text()).toBe("学");
    expect(wrapper.attributes("style")).toContain("--charm-i: 3");
  });

  it("swings once on hover and settles after the animation ends", async () => {
    const wrapper = mount(OmamoriCharm);
    const swing = wrapper.find(".omamori__swing");

    await wrapper.trigger("mouseenter");
    expect(swing.classes()).toContain("is-swinging");

    await swing.trigger("animationend");
    expect(swing.classes()).not.toContain("is-swinging");
  });

  it("sways continuously when idle", () => {
    const wrapper = mount(OmamoriCharm, { props: { idle: true } });
    expect(wrapper.classes()).toContain("omamori--idle");
  });
});

describe("EmaPlaque", () => {
  it("renders content on the board and a stamp slot", () => {
    const wrapper = mount(EmaPlaque, {
      slots: { default: "<p>水</p>", stamp: "<span class='stamp'>印</span>" },
    });

    expect(wrapper.find(".ema__board").text()).toContain("水");
    expect(wrapper.find(".ema__cord").exists()).toBe(true);
    expect(wrapper.find(".stamp").exists()).toBe(true);
  });

  it("shakes when asked to", () => {
    const wrapper = mount(EmaPlaque, { props: { shake: true } });
    expect(wrapper.classes()).toContain("ema--shake");
  });
});

describe("HankoSeal", () => {
  it("defaults to a 合格 (passed) seal with an accessible label", () => {
    const wrapper = mount(HankoSeal);
    expect(wrapper.text()).toBe("合格");
    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe("Passed");
  });

  it("stacks each character of custom text", () => {
    const wrapper = mount(HankoSeal, {
      props: { text: "努力", label: "Keep practising" },
    });
    expect(wrapper.findAll(".hanko__text > span")).toHaveLength(2);
    expect(wrapper.attributes("aria-label")).toBe("Keep practising");
  });
});
