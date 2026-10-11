/**
 * The only keys that ever sit in a reader's `localStorage`, written once. The
 * pre-hydration script in `nuxt.config.ts` reads the same names the
 * composables and buttons write, so they must not drift. Data-free and
 * import-free.
 */
export const STORAGE_KEYS = {
  /** `"light"` or `"dark"`, set by the colour-mode button. */
  colorTheme: "color-theme",
  /** The reader's own season pick; wins over the calendar's season. */
  seasonChoice: "season-choice",
  /** The music slider, 0 to 100. */
  bgmVolume: "bgm-volume",
} as const;
