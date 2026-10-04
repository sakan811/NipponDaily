import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BgmControl from "~/app/components/BgmControl.vue";
import UButton from "~/app/components/UButton.vue";
import { useBgm, BGM_TRACKS, DEFAULT_VOLUME } from "~/app/composables/useBgm";
import { useSiteTheme } from "~/app/composables/useSiteTheme";

const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

class FakeAudio {
  loop = false;
  preload = "";
  volume = 1;
  paused = true;
  src = "";
  getAttribute() {
    return this.src;
  }
  play() {
    this.paused = false;
    return play();
  }
  pause() {
    this.paused = true;
    pause();
  }
}

const mountControl = () =>
  mount(BgmControl, {
    attachTo: document.body,
    global: { components: { UButton, UIcon: { template: "<i />" } } },
  });

describe("BgmControl", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    play.mockClear();
    pause.mockClear();
    vi.stubGlobal("Audio", FakeAudio);
    // No Web Audio in happy-dom: exercises the plain element.volume path.
    vi.stubGlobal("AudioContext", undefined);
    const { enabled } = useBgm();
    enabled.value = false;
    useSiteTheme().activeSeason.value = "autumn";
    useBgm().init();
  });

  it("has a track for every season", () => {
    for (const season of ["sakura", "summer", "autumn", "winter"] as const) {
      expect(BGM_TRACKS[season]).toBe(`/audio/${season}-bgm.mp3`);
    }
  });

  it("is hidden until a season is active", async () => {
    useSiteTheme().activeSeason.value = null;
    const wrapper = mountControl();
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("opens a panel with an on/off switch and a volume slider at a background level", async () => {
    const wrapper = mountControl();
    expect(wrapper.find(".bgm-menu").exists()).toBe(false);

    await wrapper.find(".bgm-button-trigger").trigger("click");

    expect(wrapper.find("[data-bgm-toggle]").attributes("aria-checked")).toBe(
      "false",
    );
    const slider = wrapper.find<HTMLInputElement>("[data-bgm-volume]");
    expect(slider.element.value).toBe(String(DEFAULT_VOLUME));
    expect(DEFAULT_VOLUME).toBeLessThanOrEqual(60);
  });

  it("plays the autumn track when switched on and pauses when switched off", async () => {
    const wrapper = mountControl();
    await wrapper.find(".bgm-button-trigger").trigger("click");

    await wrapper.find("[data-bgm-toggle]").trigger("click");
    expect(play).toHaveBeenCalled();
    expect(wrapper.find("[data-bgm-toggle]").attributes("aria-checked")).toBe(
      "true",
    );

    vi.useFakeTimers();
    await wrapper.find("[data-bgm-toggle]").trigger("click");
    await nextTick();
    vi.advanceTimersByTime(1000);
    expect(pause).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("remembers the volume in localStorage and clamps it", async () => {
    const wrapper = mountControl();
    await wrapper.find(".bgm-button-trigger").trigger("click");

    await wrapper.find("[data-bgm-volume]").setValue("20");
    await nextTick();
    expect(localStorage.getItem("bgm-volume")).toBe("20");

    useBgm().setVolume(500);
    await nextTick();
    expect(useBgm().volume.value).toBe(100);
    useBgm().setVolume(DEFAULT_VOLUME);
  });

  it("shows the music as off when the browser blocks playback", async () => {
    play.mockRejectedValueOnce(new Error("NotAllowedError"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const wrapper = mountControl();
    await wrapper.find(".bgm-button-trigger").trigger("click");

    await wrapper.find("[data-bgm-toggle]").trigger("click");
    await nextTick();
    await nextTick();

    expect(useBgm().enabled.value).toBe(false);
  });
});
