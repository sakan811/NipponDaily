import { computed, effectScope, ref, watch } from "vue";
import type { SeasonId } from "~~/types/index";
import { useSiteTheme } from "./useSiteTheme";

/** The background track each season plays, if it has one. */
export const BGM_TRACKS: Partial<Record<SeasonId, string>> = {
  autumn: "/audio/autumn-bgm.mp3",
  winter: "/audio/winter-bgm.mp3",
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
let source: AudioBufferSourceNode | null = null;
/** Where the buffer source sits in its loop, so a pause can resume in place. */
let loopStart = 0;
let loopLength = 0;
let loopFrom = 0;
let loopStartedAt = 0;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;
const buffers = new Map<string, Promise<AudioBuffer>>();

/** Anything quieter than this at the ends of the file counts as padding. */
const SILENCE = 0.002;

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

/**
 * Web Audio where available. A looping <audio> element can't loop MP3 without
 * a gap (the element re-seeks, and the encoder's padding sits at both ends),
 * whereas a decoded buffer loops sample-accurately. It also gives volume
 * control on iOS Safari, which ignores HTMLMediaElement.volume.
 */
function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
  } catch {
    ctx = null;
    gain = null;
  }
  return ctx;
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;
  return audio;
}

function loadBuffer(src: string, context: AudioContext): Promise<AudioBuffer> {
  let pending = buffers.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data));
    // A failed load must be retried next time, not cached.
    pending.catch(() => buffers.delete(src));
    buffers.set(src, pending);
  }
  return pending;
}

/** The span of the buffer that actually holds sound, minus silent padding. */
function soundSpan(buf: AudioBuffer): { start: number; end: number } {
  const channels = Array.from({ length: buf.numberOfChannels }, (_, c) =>
    buf.getChannelData(c),
  );
  const loud = (i: number) => channels.some((ch) => Math.abs(ch[i]!) > SILENCE);
  let start = 0;
  while (start < buf.length - 1 && !loud(start)) start++;
  let end = buf.length;
  while (end > start + 1 && !loud(end - 1)) end--;
  return { start: start / buf.sampleRate, end: end / buf.sampleRate };
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

const isPlaying = (): boolean =>
  source !== null || (audio !== null && !audio.paused);

function startSource(buf: AudioBuffer): void {
  if (!ctx || !gain || source) return;
  const span = soundSpan(buf);
  const node = ctx.createBufferSource();
  node.buffer = buf;
  node.loop = true;
  node.loopStart = span.start;
  node.loopEnd = span.end;
  node.connect(gain);
  // Resume where a pause left off (the start of the sound on first play).
  const resumable = loopFrom >= span.start && loopFrom < span.end;
  loopStart = span.start;
  loopLength = span.end - span.start;
  loopFrom = resumable ? loopFrom : span.start;
  loopStartedAt = ctx.currentTime;
  node.start(0, loopFrom);
  source = node;
}

function stopSource(): void {
  if (!source || !ctx) return;
  const elapsed = ctx.currentTime - loopStartedAt;
  loopFrom = loopStart + ((loopFrom - loopStart + elapsed) % loopLength);
  source.stop();
  source.disconnect();
  source = null;
}

async function play(src: string): Promise<void> {
  clearTimeout(pauseTimer);
  try {
    const context = ensureContext();
    if (context) {
      // Called straight away so it still counts as part of the click.
      const resumed = context.resume();
      const buf = await loadBuffer(src, context);
      // Switched off while the file was still loading.
      if (!enabled.value) return;
      startSource(buf);
      await resumed;
    } else {
      const el = ensureAudio();
      if (el.getAttribute("src") !== src) el.src = src;
      await el.play();
    }
  } catch (err) {
    // Blocked or the file failed to load: show the music as off, not stuck on.
    console.error("Background music could not start:", err);
    enabled.value = false;
    return;
  }
  setLevel(gainFor(volume.value), FADE_MS);
}

function stop(): void {
  if (!isPlaying()) return;
  setLevel(0, FADE_MS);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => {
    stopSource();
    audio?.pause();
  }, FADE_MS + 100);
}

/**
 * Per-season background music: an on/off switch and a volume level. Music
 * only ever plays while the active season has a track (autumn and winter today), and
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
        if (isPlaying() && enabled.value) setLevel(gainFor(v), 80);
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
