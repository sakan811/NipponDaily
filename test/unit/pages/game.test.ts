import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GamePage from "~/app/pages/game.vue";
import DailyGameBoard from "~/app/components/DailyGameBoard.vue";

describe("Game Page", () => {
  it("renders the DailyGameBoard component", () => {
    const wrapper = mount(GamePage);
    expect(wrapper.findComponent(DailyGameBoard).exists()).toBe(true);
  });
});
