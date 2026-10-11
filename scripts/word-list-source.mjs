/**
 * The single pin for elzup/jlpt-word-list's per-level CSVs, shared by
 * scripts/build-n5-reference.mjs (N5's committed dictionary-evidence
 * snapshot, checked in test/content/) and scripts/build-jlpt-reference.mjs
 * (N4-N1's evidence snapshots). Importing the same pin from both means they
 * always read the exact same bytes.
 *
 * One repo, one commit, five files — n3.csv, n2.csv and n1.csv don't carry a
 * reliable per-row "JLPT_N3"/"JLPT_N2" tag the way n5.csv/n4.csv do (they
 * use old pre-2010 level tags instead, inconsistently), so every level here
 * is identified by which file it came from, not by a tag inside it — see
 * parseJlptCsv in scripts/lib/word-list.mjs.
 *
 * Bump a commit deliberately, then re-run
 * `pnpm data:reference`/`pnpm data:reference:jlpt` together and review the
 * diffs.
 */
const REPO = "elzup/jlpt-word-list";
const COMMIT = "13aa3c54b27115be72d8a62cd4071077c68d2171";
const source = (file) => ({ repo: REPO, commit: COMMIT, path: `src/${file}` });

export const WORD_LIST_SOURCES = {
  N1: source("n1.csv"),
  N5: source("n5.csv"),
  N4: source("n4.csv"),
  N3: source("n3.csv"),
  N2: source("n2.csv"),
};

export function wordListUrl(level) {
  const { repo, commit, path } = WORD_LIST_SOURCES[level];
  return `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
}

/** A level's CSV at the pinned commit, as text. */
export async function fetchWordListText(level) {
  const res = await fetch(wordListUrl(level));
  if (!res.ok) throw new Error(`GET ${wordListUrl(level)} → ${res.status}`);
  return res.text();
}
