import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DailyGameBoard from "~/app/components/DailyGameBoard.vue";
import { makeDailyGame, mockFetchGame, mockFetchGameError } from "./setup";

describe("DailyGameBoard fetching", () => {
  it("fetches today's game on mount by default", async () => {
    const game = makeDailyGame();
    mockFetchGame(game);

    const wrapper = mount(DailyGameBoard);
    await vi.waitFor(() => expect(wrapper.text()).toContain("Question 1 / 2"));
  });

  it("loads and renders the first question after a successful fetch", async () => {
    const game = makeDailyGame();
    mockFetchGame(game);

    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Question 1 / 2");
  });

  it("shows the fallback error state on a failed fetch", async () => {
    mockFetchGameError({
      data: { error: "Service temporarily unavailable. Please try again." },
    });

    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(
      "Service temporarily unavailable. Please try again.",
    );
  });

  it("maps a 500 status with no message to a generic error", async () => {
    mockFetchGameError({ statusCode: 500 });

    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Service temporarily unavailable. Please try again.",
    );
  });

  it("retry re-fetches after TrendingFallback emits retry", async () => {
    mockFetchGameError({ statusCode: 500 });
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await wrapper.vm.fetchGame();
    await wrapper.vm.$nextTick();

    const game = makeDailyGame();
    mockFetchGame(game);

    const retryButton = wrapper.find('[data-testid="error-state"] button');
    await retryButton.trigger("click");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Question 1 / 2");
    });
  });
});
