/**
 * The pool word of every day in the word plans, from the committed level
 * snapshots: the plans, not the entries, so a snapshot that entries are built
 * from (the example sentences, the pitch accents) can be made before
 * `pnpm data:words` has made them.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { JLPT_LEVELS, referenceFile } from "../../shared/jlpt.ts";

export function poolWords(root) {
  const vocab = [];
  for (const level of JLPT_LEVELS)
    vocab.push(
      ...JSON.parse(readFileSync(join(root, referenceFile(level)), "utf8"))
        .vocab,
    );
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
      });
    }
  return words;
}
