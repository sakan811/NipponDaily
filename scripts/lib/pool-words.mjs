/**
 * The pool word of every day in the word plans, from the committed level
 * snapshots: the plans, not the entries, so a snapshot that entries are built
 * from (the example sentences, the pitch accents) can be made before
 * `pnpm data:words` has made them.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function poolWords(root) {
  const vocab = [];
  for (const level of ["n5", "n4", "n3", "n2", "n1"])
    vocab.push(
      ...JSON.parse(
        readFileSync(
          join(root, `data/reference/${level}-reference.json`),
          "utf8",
        ),
      ).vocab,
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
