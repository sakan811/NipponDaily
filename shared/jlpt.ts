/**
 * The JLPT levels the daily words are drawn from — mirrors shared/seasons.ts's
 * SEASON_IDS pattern. Easiest first.
 */
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

/** The JMdict and KANJIDIC2 snapshot of a level's pool words, relative to the
 *  repo root: `data/reference/n4-reference.json`. */
export const referenceFile = (level: string): string =>
  `data/reference/${level.toLowerCase()}-reference.json`;

/** Every level's snapshot as one glob: `data/reference/{n5,n4,n3,n2,n1}-reference.json`. */
export const REFERENCE_FILES = referenceFile(`{${JLPT_LEVELS.join(",")}}`);

/** "N5–N1": the levels as docs and pages name them. */
export const JLPT_RANGE = `${JLPT_LEVELS[0]}–${JLPT_LEVELS[JLPT_LEVELS.length - 1]}`;
