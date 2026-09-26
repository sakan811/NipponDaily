/**
 * The single pin for elzup/jlpt-word-list's N5 CSV, shared by
 * scripts/seed-n5-data.mjs (the live seed) and scripts/build-n5-reference.mjs
 * (the committed dictionary-evidence snapshot test/content/ checks every
 * served word against). Both used to fetch this list independently — the
 * seed from `master`, the reference from a pinned commit — so an upstream
 * edit to n5.csv could land in a freshly-seeded pool before the ground-truth
 * tests had any evidence for it. Importing the same pin from both closes
 * that gap: they always read the exact same bytes.
 *
 * Bump the commit deliberately, then re-run `pnpm seed:n5` and
 * `pnpm data:reference` together and review both diffs.
 */
export const WORD_LIST_SOURCE = {
  repo: "elzup/jlpt-word-list",
  commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
  path: "src/n5.csv",
};

export const N5_CSV_URL = `https://raw.githubusercontent.com/${WORD_LIST_SOURCE.repo}/${WORD_LIST_SOURCE.commit}/${WORD_LIST_SOURCE.path}`;
