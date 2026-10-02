import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import { useBgm } from "~/app/composables/useBgm";
import { useSiteTheme } from "~/app/composables/useSiteTheme";

const RATE = 1000;
const started: FakeSource[] = [];

class FakeSource {
  buffer: unknown = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  connect = vi.fn();
  disconnect = vi.fn();
  stop = vi.fn();
  start = vi.fn(() => {
    started.push(this);
  });
}

class FakeContext {
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createGain = () => ({
    gain: {
      value: 0,
      cancelScheduledValues: vi.fn(),
      setTargetAtTime: vi.fn(),
    },
    connect: vi.fn(),
  });
  createBufferSource = () => new FakeSource();
  // 100 samples of encoder-delay silence, 800 of sound, 100 of padding.
  decodeAudioData = () => {
    const data = new Float32Array(1000).fill(0.5);
    data.fill(0, 0, 100);
    data.fill(0, 900);
    return Promise.resolve({
      length: data.length,
      sampleRate: RATE,
      numberOfChannels: 1,
      getChannelData: () => data,
    });
  };
}

describe("useBgm gapless loop", () => {
  it("loops the decoded buffer between the first and last sound, not the padding", async () => {
    vi.stubGlobal("AudioContext", FakeContext);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, arrayBuffer: () => new ArrayBuffer(8) }),
      ),
    );
    useSiteTheme().activeSeason.value = "autumn";
    const bgm = useBgm();
    bgm.init();

    bgm.toggle();
    await vi.waitFor(() => expect(started).toHaveLength(1));
    await nextTick();

    const node = started[0]!;
    expect(node.loop).toBe(true);
    expect(node.loopStart).toBeCloseTo(0.1);
    expect(node.loopEnd).toBeCloseTo(0.9);
    expect(node.start).toHaveBeenCalledWith(0, expect.closeTo(0.1));
  });
});
