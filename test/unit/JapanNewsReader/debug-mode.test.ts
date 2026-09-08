import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { mockLessonCard, mockNewsResponse } from "./setup";

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
      components: { LessonCard: mockLessonCard },
    },
  });
};

describe("JapanNewsReader - Debug mode (?debug_error_ui)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(mockNewsResponse());
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

  it("shows the debug toolbar and toggles the fetch-error simulation", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("DEBUG_ERROR_UI Testing & Design Toolbar");
    // Starts in fetch_error mode when debug UI is active.
    expect(wrapper.vm.debugSimulationMode).toBe("fetch_error");

    const findByLabel = (label: string) =>
      wrapper.findAll("button").find((b) => b.text().includes(label));

    await findByLabel("Standard / Live Mode")!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("none");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.error).toBeNull();

    await findByLabel("Failed News Fetching")!.trigger("click");
    expect(wrapper.vm.debugSimulationMode).toBe("fetch_error");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.error).toContain("DEBUG_ERROR_UI");
  });

  it("fetchNews short-circuits without calling the API in fetch_error debug mode", async () => {
    const wrapper = await mountWithRoute("/news?debug_error_ui=true");
    wrapper.vm.debugSimulationMode = "fetch_error";
    await wrapper.vm.$nextTick();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toContain(
      "Failed to fetch lessons from Redis database",
    );
    expect((global as any).$fetch).not.toHaveBeenCalled();
  });
});
