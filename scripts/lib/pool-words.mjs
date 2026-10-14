/**
 * The pool word of every day in the word plans, from the committed level
 * snapshots: the plans, not the entries, so a snapshot that entries are built
 * from (the example sentences, the pitch accents) can be made before
 * `pnpm data:words` has made them.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { JLPT_LEVELS, referenceFile } from "../../shared/jlpt.ts";

/** The key of a word in every snapshot that holds one record per word (the
 *  sentences, the pitch accents): its spelling and reading, since one spelling
 *  can be several words (後 あと, 後 ご). `meanings.ts` keys by the same pair. */
export const wordKey = (term, kana) => `${term} ${kana}`;

/** The spelling and reading a `wordKey` was made from. */
export function splitWordKey(key) {
  const at = key.indexOf(" ");
  return { term: key.slice(0, at), kana: key.slice(at + 1) };
}

const snapshots = new Map();
const snapshotOf = (root, level) => {
  const path = join(root, referenceFile(level));
  if (!snapshots.has(path))
    snapshots.set(path, JSON.parse(readFileSync(path, "utf8")));
  return snapshots.get(path);
};

/** Every list word once, with the level of the easiest list that holds it (a
 *  word on two lists, or twice on one, is one pool word). */
export function poolVocab(root) {
  const seen = new Set();
  const vocab = [];
  for (const level of JLPT_LEVELS)
    for (const v of snapshotOf(root, level).vocab) {
      const key = wordKey(v.term, v.kana);
      if (seen.has(key)) continue;
      seen.add(key);
      vocab.push({ ...v, level });
    }
  return vocab;
}

/** KANJIDIC2's record of every kanji the level snapshots hold. */
export function poolKanji(root) {
  const kanji = {};
  for (const level of JLPT_LEVELS)
    Object.assign(kanji, snapshotOf(root, level).kanji);
  return kanji;
}

export function poolWords(root) {
  const vocab = poolVocab(root);
  const words = [];
  const dir = join(root, "data/word-plan");
  for (const f of readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort())
    for (const plan of JSON.parse(readFileSync(join(dir, f), "utf8"))) {
      const found = vocab.filter(
        (v) => v.term === plan.term && (!plan.kana || v.kana === plan.kana),
      );
      if (found.length !== 1)
        throw new Error(
          `${plan.term}: ${found.length} pool words with that spelling${plan.kana ? ` and reading ${plan.kana}` : "; name the reading as `kana` in the plan"}`,
        );
      words.push({
        term: plan.term,
        kana: found[0].kana,
        spellingReadings: found[0].spellingReadings,
        month: f.slice(0, -".json".length),
      });
    }
  return words;
}

/** { wordKey → "YYYY-MM" }: the month of the word plans that holds each word. */
export function wordMonths(root) {
  const months = {};
  for (const w of poolWords(root)) months[wordKey(w.term, w.kana)] ??= w.month;
  return months;
}
