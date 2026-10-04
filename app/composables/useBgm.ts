import { computed, effectScope, ref, watch } from "vue";
import type { SeasonId } from "~~/types/index";
import { useSiteTheme } from "./useSiteTheme";

/**
 * The background track each season plays. All four are mastered to the same
 * integrated loudness (-16 LUFS, measured on the MP3s), so changing season
 * never changes how loud the music is.
 */
export const BGM_TRACKS: Record<SeasonId, string> = {
  sakura: "/audio/sakura-bgm.mp3",
  summer: "/audio/summer-bgm.mp3",
  autumn: "/audio/autumn-bgm.mp3",
  winter: "/audio/winter-bgm.mp3",
};

/** Slider position (0-100) a first-time listener starts at — background level. */
export const DEFAULT_VOLUME = 50;

const VOLUME_KEY = "bgm-volume";
/** Loudest the slider can make the track (the master is already near full scale). */
const MAX_GAIN = 0.6;
/** Fade for switching the music on or off. */
const FADE_MS = 700;
/** One track fading out as the next fades in, when the season changes. */
const CROSSFADE_MS = 2000;
const CURVE_STEPS = 64;
/** Equal-power quarter sine: two unrelated tracks keep a steady loudness. */
const CURVE = Float32Array.from({ length: CURVE_STEPS }, (_, i) =>
  Math.sin((i / (CURVE_STEPS - 1)) * (Math.PI / 2)),
);

/** One playing copy of a track: its own loop and its own fade level. */
interface Voice {
  src: string;
  node: AudioBufferSourceNode;
  gain: GainNode;
  /** Loop bounds and position, so a stop can resume in place. */
  start: number;
  length: number;
  from: number;
  startedAt: number;
  fading: boolean;
}

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
/** Every voice still sounding: the current one, plus any fading out. */
const voices = new Set<Voice>();
/** The voice the reader should be hearing (the others are on their way out). */
let current: Voice | null = null;
/** Where each track last stopped, so it picks up there next time. */
const resumeAt = new Map<string, number>();
/** The track the latest request asked for; a slower, older load must not win. */
let wanted: string | null = null;
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
  voices.size > 0 || (audio !== null && !audio.paused);

/** Fades a voice in (0 -> 1) or out (its current level -> 0) over `ms`. */
function fadeVoice(voice: Voice, dir: "in" | "out", ms: number): void {
  if (!ctx) return;
  const param = voice.gain.gain;
  const now = ctx.currentTime;
  // Hold wherever a fade already under way has got to, so a quick second
  // switch continues from there instead of jumping.
  const level = dir === "out" ? param.value : 1;
  param.cancelScheduledValues(now);
  const curve =
    dir === "in"
      ? CURVE
      : Float32Array.from(CURVE, (_, i) => level * CURVE[CURVE_STEPS - 1 - i]!);
  param.setValueCurveAtTime(curve, now, ms / 1000);
}

function startVoice(src: string, buf: AudioBuffer): void {
  if (!ctx || !gain) return;
  const span = soundSpan(buf);
  const node = ctx.createBufferSource();
  node.buffer = buf;
  node.loop = true;
  node.loopStart = span.start;
  node.loopEnd = span.end;
  const voiceGain = ctx.createGain();
  voiceGain.gain.value = 0;
  node.connect(voiceGain);
  voiceGain.connect(gain);
  // Resume where this track last stopped (the start of the sound at first).
  const saved = resumeAt.get(src);
  const from =
    saved !== undefined && saved >= span.start && saved < span.end
      ? saved
      : span.start;
  const voice: Voice = {
    src,
    node,
    gain: voiceGain,
    start: span.start,
    length: span.end - span.start,
    from,
    startedAt: ctx.currentTime,
    fading: false,
  };
  node.start(0, from);
  voices.add(voice);
  current = voice;
  fadeVoice(voice, "in", CROSSFADE_MS);
}

function stopVoice(voice: Voice): void {
  if (!voices.delete(voice) || !ctx) return;
  const elapsed = ctx.currentTime - voice.startedAt;
  resumeAt.set(
    voice.src,
    voice.start + ((voice.from - voice.start + elapsed) % voice.length),
  );
  voice.node.stop();
  voice.node.disconnect();
  voice.gain.disconnect();
  if (current === voice) current = null;
}

/** Fades a voice out and stops it once it can no longer be heard. */
function retireVoice(voice: Voice): void {
  voice.fading = true;
  fadeVoice(voice, "out", CROSSFADE_MS);
  setTimeout(() => stopVoice(voice), CROSSFADE_MS + 100);
}

function stopAllVoices(): void {
  for (const voice of [...voices]) stopVoice(voice);
}

async function play(src: string): Promise<void> {
  clearTimeout(pauseTimer);
  wanted = src;
  try {
    const context = ensureContext();
    if (context) {
      // Called straight away so it still counts as part of the click.
      const resumed = context.resume();
      const buf = await loadBuffer(src, context);
      // Switched off, or on to another season, while the file was loading.
      if (!enabled.value || wanted !== src) return;
      if (!current || current.src !== src) {
        // The old track keeps playing until the new one is ready, then the
        // two cross over.
        if (current) retireVoice(current);
        startVoice(src, buf);
      }
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
  wanted = null;
  if (!isPlaying()) return;
  setLevel(0, FADE_MS);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => {
    stopAllVoices();
    audio?.pause();
  }, FADE_MS + 100);
}

/**
 * Per-season background music: an on/off switch and a volume level. Music
 * plays the active season's track and starts only when the reader switches it
 * on; changing season while it plays crossfades into the new season's track. The volume lives in this
 * browser's `localStorage` (`bgm-volume`) and goes nowhere else.
 *
 * `init()` wires the playback side once from app.vue; the header button just
 * reads and sets the shared state.
 */
export function useBgm() {
  const { activeSeason } = useSiteTheme();

  const trackSrc = computed(() =>
    activeSeason.value ? BGM_TRACKS[activeSeason.value] : null,
  );
  /** Whether a season is active yet (the button hides until one is). */
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
