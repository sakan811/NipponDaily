import { computed, effectScope, ref, watch } from "vue";
import type { SeasonId } from "~~/types/index";
import { useSiteTheme } from "./useSiteTheme";

/** The background track each season plays, if it has one. */
export const BGM_TRACKS: Partial<Record<SeasonId, string>> = {
  autumn: "/audio/autumn-bgm.mp3",
};

/** Slider position (0-100) a first-time listener starts at — background level. */
export const DEFAULT_VOLUME = 50;

const VOLUME_KEY = "bgm-volume";
/** Loudest the slider can make the track (the master is already near full scale). */
const MAX_GAIN = 0.6;
const FADE_MS = 700;

// Shared by every caller (the header's music button, app.vue's init). The
// audio element outlives any one page's header, so the music carries on
// across client-side navigation. Only ever touched client-side.
/** The reader asked for music (never remembered across reloads — browsers
 * block unprompted sound, and nobody wants it to start by surprise). */
const enabled = ref(false);
const volume = ref(DEFAULT_VOLUME);
/** The tab is in the background: the music waits instead of playing on. */
const tabHidden = ref(false);

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;

/** Perceptual curve: equal slider steps sound like equal loudness steps. */
const gainFor = (v: number): number => MAX_GAIN * (v / 100) ** 2;

const clampVolume = (v: number): number =>
  Number.isFinite(v)
    ? Math.min(100, Math.max(0, Math.round(v)))
    : DEFAULT_VOLUME;

function readVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    return raw === null ? DEFAULT_VOLUME : clampVolume(Number(raw));
  } catch {
    return DEFAULT_VOLUME;
  }
}

function writeVolume(v: number): void {
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {
    // Blocked storage — the level still applies for this visit.
  }
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;
  // Volume goes through a GainNode where possible: iOS Safari ignores
  // HTMLMediaElement.volume, which would leave the slider doing nothing.
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (Ctor) {
    try {
      ctx = new Ctor();
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx
        .createMediaElementSource(audio)
        .connect(gain)
        .connect(ctx.destination);
      audio.volume = 1;
    } catch {
      ctx = null;
      gain = null;
    }
  }
  return audio;
}

/** Moves the level to `target` (0-1) over roughly `ms`. */
function setLevel(target: number, ms: number): void {
  if (gain && ctx) {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(target, now, ms / 1000 / 3);
  } else if (audio) {
    audio.volume = Math.min(1, Math.max(0, target));
  }
}

async function play(src: string): Promise<void> {
  clearTimeout(pauseTimer);
  const el = ensureAudio();
  if (el.getAttribute("src") !== src) el.src = src;
  try {
    await ctx?.resume();
    await el.play();
  } catch (err) {
    // Blocked or the file failed to load: show the music as off, not stuck on.
    console.error("Background music could not start:", err);
    enabled.value = false;
    return;
  }
  setLevel(gainFor(volume.value), FADE_MS);
}

function stop(): void {
  if (!audio || audio.paused) return;
  setLevel(0, FADE_MS);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => audio?.pause(), FADE_MS + 100);
}

/**
 * Per-season background music: an on/off switch and a volume level. Music
 * only ever plays while the active season has a track (autumn today), and
 * starts only when the reader switches it on. The volume lives in this
 * browser's `localStorage` (`bgm-volume`) and goes nowhere else.
 *
 * `init()` wires the playback side once from app.vue; the header button just
 * reads and sets the shared state.
 */
export function useBgm() {
  const { activeSeason } = useSiteTheme();

  const trackSrc = computed(() =>
    activeSeason.value ? (BGM_TRACKS[activeSeason.value] ?? null) : null,
  );
  /** Whether the current season has music at all (the button hides when not). */
  const available = computed(() => trackSrc.value !== null);

  const init = (): void => {
    if (started) return;
    started = true;
    volume.value = readVolume();
    tabHidden.value = document.hidden;
    document.addEventListener("visibilitychange", () => {
      tabHidden.value = document.hidden;
    });

    // Detached: this runs from a mounted hook, but must outlive the component.
    effectScope(true).run(() => {
      watch(
        [enabled, trackSrc, tabHidden],
        ([on, src, hidden]) => {
          if (on && src && !hidden) void play(src);
          else stop();
        },
        { flush: "post" },
      );
      watch(volume, (v) => {
        writeVolume(v);
        if (audio && !audio.paused && enabled.value) setLevel(gainFor(v), 80);
      });
    });
  };

  const toggle = (): void => {
    enabled.value = !enabled.value;
    // Start inside the click itself: Safari only lets audio begin from the
    // gesture's own call stack, not from the watcher's later flush.
    if (enabled.value && trackSrc.value && !tabHidden.value) {
      void play(trackSrc.value);
    }
  };

  const setVolume = (v: number): void => {
    volume.value = clampVolume(v);
  };

  return { enabled, volume, available, activeSeason, init, toggle, setVolume };
}
