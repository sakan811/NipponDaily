import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DailyGameBoard from "~/app/components/DailyGameBoard.vue";
import { makeDailyGame, mockFetchGame } from "./setup";

describe("DailyGameBoard level select", () => {
  it("defaults to N5 and fetches with no other level touched", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();

    expect(wrapper.vm.level).toBe("N5");
    expect(global.$fetch).toHaveBeenCalledWith("/api/daily-game", {
      query: { level: "N5" },
    });
  });

  it("shows a button for every JLPT level, N5 active by default", () => {
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    const select = wrapper.find('[data-testid="game-level-select"]');

    for (const lvl of ["N5", "N4", "N3", "N2"]) {
      expect(select.find(`[data-testid="level-option-${lvl}"]`).exists()).toBe(
        true,
      );
    }
  });

  it("switching level refetches the game for that level and resets the round", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    wrapper.vm.startRound();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.started).toBe(true);

    const n4Game = makeDailyGame();
    n4Game.level = "N4";
    mockFetchGame(n4Game);

    await wrapper.find('[data-testid="level-option-N4"]').trigger("click");
    expect(wrapper.vm.level).toBe("N4");

    await vi.waitFor(() => expect(wrapper.vm.started).toBe(false));
    expect(global.$fetch).toHaveBeenCalledWith("/api/daily-game", {
      query: { level: "N4" },
    });
  });

  it("clicking the already-active level is a no-op", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    (global.$fetch as ReturnType<typeof vi.fn>).mockClear();

    await wrapper.find('[data-testid="level-option-N5"]').trigger("click");

    expect(global.$fetch).not.toHaveBeenCalled();
  });
});
