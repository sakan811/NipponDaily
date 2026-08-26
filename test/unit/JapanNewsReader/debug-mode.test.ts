import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { mockBriefingCard, mockNews } from "./setup";

const mountWithRoute = async (path: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  });
  router.push(path);
  await router.isReady();

  return mount(JapanNewsReader, {
    global: {
      plugins: [router],
      components: { BriefingCard: mockBriefingCard },
    },
  });
};

describe("JapanNewsReader - Debug mode (?debug_error_ui)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });
  });

  it("is not active for a normal route with no debug query", async () => {
    const wrapper = await mountWithRoute("/news");
    expect(wrapper.vm.isDebugErrorUi).toBe(false);
  });

  it("activates via debug_error_ui=true", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    expect(wrapper.vm.isDebugErrorUi).toBe(true);
  });

  it("activates via debug_error_ui=1", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=1");
    expect(wrapper.vm.isDebugErrorUi).toBe(true);
  });

  it("activates via debug=error", async () => {
    const wrapper = await mountWithRoute("/news?debug=error");
    expect(wrapper.vm.isDebugErrorUi).toBe(true);
  });

  it("shows the debug toolbar and can switch simulation modes by clicking its buttons", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("DEBUG_ERROR_UI Testing & Design Toolbar");

    const findByLabel = (label: string) =>
      wrapper.findAll("button").find((b) => b.text().includes(label));

    // isDebugErrorUi is already true at mount, so debugSimulationMode starts
    // as "trending_error" — switch to "none" first so the next click is an
    // actual change and the debugSimulationMode watcher fires.
    const liveModeBtnFirst = findByLabel("Standard / Live Mode");
    await liveModeBtnFirst!.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.debugSimulationMode).toBe("none");

    const trendingErrorBtn = findByLabel("Failed Trending Fetching");
    expect(trendingErrorBtn).toBeDefined();
    await trendingErrorBtn!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("trending_error");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.error).toContain("DEBUG_ERROR_UI");

    const summaryErrorBtn = findByLabel("Failed Summary Process");
    await summaryErrorBtn!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("summary_error");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.error).toBeNull();

    const aiFallbackBtn = findByLabel("AI Fallback Briefing Card");
    await aiFallbackBtn!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("ai_fallback");

    const liveModeBtn = findByLabel("Standard / Live Mode");
    await liveModeBtn!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("none");
  });

  it("fetchNews short-circuits with a synthetic error in trending_error debug mode", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    wrapper.vm.debugSimulationMode = "trending_error";
    await wrapper.vm.$nextTick();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toContain(
      "Failed to fetch trending stories from Redis database",
    );
    expect((global as any).$fetch).not.toHaveBeenCalled();
  });

  it("fetchNews short-circuits without calling the API in summary_error debug mode", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    wrapper.vm.debugSimulationMode = "summary_error";
    await wrapper.vm.$nextTick();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect((global as any).$fetch).not.toHaveBeenCalled();
  });

  it("fetchNews short-circuits without calling the API in ai_fallback debug mode", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    wrapper.vm.debugSimulationMode = "ai_fallback";
    await wrapper.vm.$nextTick();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect((global as any).$fetch).not.toHaveBeenCalled();
  });
});
