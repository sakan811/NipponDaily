import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SeasonButton from "~/app/components/SeasonButton.vue";
import UButton from "~/app/components/UButton.vue";
import { SEASON_IDS } from "~~/shared/seasons";

const mountButton = () =>
  mount(SeasonButton, {
    attachTo: document.body,
    global: { components: { UButton, UIcon: { template: "<i />" } } },
  });

describe("SeasonButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-season");
    localStorage.clear();
  });

  it("starts closed, then lists every season plus follow-the-calendar", async () => {
    const wrapper = mountButton();
    expect(wrapper.find(".season-menu").exists()).toBe(false);

    await wrapper.find("button").trigger("click");

    const options = wrapper
      .findAll("[data-season-option]")
      .map((o) => o.attributes("data-season-option"));
    expect(options).toEqual([...SEASON_IDS, "auto"]);
  });

  it("applies and remembers the picked season, then closes", async () => {
    const wrapper = mountButton();
    await wrapper.find("button").trigger("click");

    await wrapper.find('[data-season-option="winter"]').trigger("click");

    expect(document.documentElement.getAttribute("data-season")).toBe("winter");
    expect(localStorage.getItem("season-choice")).toBe("winter");
    expect(wrapper.find(".season-menu").exists()).toBe(false);
  });

  it("marks the saved choice as pressed", async () => {
    localStorage.setItem("season-choice", "summer");
    const wrapper = mountButton();
    await wrapper.find("button").trigger("click");

    expect(
      wrapper.find('[data-season-option="summer"]').attributes("aria-pressed"),
    ).toBe("true");
    expect(
      wrapper.find('[data-season-option="auto"]').attributes("aria-pressed"),
    ).toBe("false");
  });

  it("'Follow the calendar' clears the saved choice", async () => {
    localStorage.setItem("season-choice", "summer");
    const wrapper = mountButton();
    await wrapper.find("button").trigger("click");

    await wrapper.find('[data-season-option="auto"]').trigger("click");

    expect(localStorage.getItem("season-choice")).toBeNull();
  });

  it("closes when the page outside it is clicked", async () => {
    const wrapper = mountButton();
    await wrapper.find("button").trigger("click");
    expect(wrapper.find(".season-menu").exists()).toBe(true);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".season-menu").exists()).toBe(false);
  });

  it("closes on Escape", async () => {
    const wrapper = mountButton();
    await wrapper.find("button").trigger("click");

    await wrapper.find(".season-menu").trigger("keydown", { key: "Escape" });

    expect(wrapper.find(".season-menu").exists()).toBe(false);
  });
});
