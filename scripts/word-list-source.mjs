/**
 * The single pin for elzup/jlpt-word-list's per-level CSVs, shared by
 * scripts/seed-pool-data.mjs (the live seed), scripts/build-n5-reference.mjs
 * (N5's committed dictionary-evidence snapshot, checked in test/content/),
 * and scripts/build-jlpt-reference.mjs (N4-N2's evidence snapshots). All
 * three used to fetch independently — an upstream edit could land in a
 * freshly-seeded pool before the ground-truth tests had any evidence for
 * it. Importing the same pin from all of them closes that gap: they always
 * read the exact same bytes.
 *
 * One repo, one commit, four files — n3.csv and n2.csv don't carry a
 * reliable per-row "JLPT_N3"/"JLPT_N2" tag the way n5.csv/n4.csv do (they
 * use old pre-2010 level tags instead, inconsistently), so every level here
 * is identified by which file it came from, not by a tag inside it — see
 * parseJlptCsv in scripts/seed-pool-data.mjs.
 *
 * Bump a commit deliberately, then re-run `pnpm seed` and
 * `pnpm data:reference`/`pnpm data:reference:jlpt` together and review the
 * diffs.
 */
export const WORD_LIST_SOURCES = {
  N5: {
    repo: "elzup/jlpt-word-list",
    commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
    path: "src/n5.csv",
  },
  N4: {
    repo: "elzup/jlpt-word-list",
    commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
    path: "src/n4.csv",
  },
  N3: {
    repo: "elzup/jlpt-word-list",
    commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
    path: "src/n3.csv",
  },
  N2: {
    repo: "elzup/jlpt-word-list",
    commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
    path: "src/n2.csv",
  },
};

export function wordListUrl(level) {
  const { repo, commit, path } = WORD_LIST_SOURCES[level];
  return `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
}

/** Kept for the existing N5-only call sites (scripts/build-n5-reference.mjs,
 *  test imports) — identical to wordListUrl("N5"). */
export const WORD_LIST_SOURCE = WORD_LIST_SOURCES.N5;
export const N5_CSV_URL = wordListUrl("N5");
