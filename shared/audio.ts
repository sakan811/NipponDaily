/**
 * The numbers the background music turns on, written once so the player, the
 * Seasons chapter and the test that measures the tracks read the same value.
 * Data-free and import-free.
 */

/** The integrated loudness every track is mastered to (`public/audio/*.mp3`). */
export const BGM_LOUDNESS_LUFS = -16;

/** One track fading out as the next fades in, when the season changes. */
export const BGM_CROSSFADE_MS = 2000;
