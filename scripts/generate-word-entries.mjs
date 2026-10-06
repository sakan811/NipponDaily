/**
 * Generates data/words/YYYY-MM.json from data/word-plan/YYYY-MM.json
 * (`pnpm data:words`).
 *
 * The plan holds the ONLY hand-written text — per day: the date, the word and
 * its one-line headline. Everything else (reading, meaning, level, part of
 * speech, layer, processes, morphemes, the Wiktionary lines, the dump they came from) is
 * derived from the committed sources by scripts/lib/word-entry.mjs. Output is
 * deterministic; test/content/word-generation.test.ts re-runs this in CI.
 *
 *   node scripts/generate-word-entries.mjs            write every month
 *   node scripts/generate-word-entries.mjs --check    fail if a file would change
 *   node scripts/generate-word-entries.mjs --keep-going   write the months that built, list the failures
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEntry } from "./lib/word-entry.mjs";
import { loadEtymologySnapshot } from "./lib/etymology-snapshot.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

export function loadContext(root = ROOT) {
  const vocab = [];
  const kanji = {};
  for (const level of ["N5", "N4", "N3", "N2", "N1"]) {
    const ref = JSON.parse(
      readFileSync(
        join(root, `data/reference/${level.toLowerCase()}-reference.json`),
        "utf8",
      ),
    );
    for (const v of ref.vocab) vocab.push({ ...v, level });
    Object.assign(kanji, ref.kanji);
  }
  const snapshot = loadEtymologySnapshot(root);
  return {
    vocab: (term) => vocab.filter((v) => v.term === term),
    kanji,
    snapshot,
  };
}

export function generateAll(root = ROOT) {
  const ctx = loadContext(root);
  const planDir = join(root, "data/word-plan");
  const months = {};
  const failures = [];
  for (const file of readdirSync(planDir)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const out = [];
    for (const plan of JSON.parse(readFileSync(join(planDir, file), "utf8"))) {
      try {
        out.push(buildEntry(plan, ctx));
      } catch (e) {
        failures.push(`${plan.date} ${plan.term}: ${e.message}`);
      }
    }
    months[file] = out;
  }
  return { months, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { months, failures } = generateAll();
  for (const f of failures) console.error(`FAIL ${f}`);
  if (failures.length && !args.includes("--keep-going")) {
    console.error(
      `${failures.length} entr${failures.length === 1 ? "y" : "ies"} could not be built; nothing written`,
    );
    process.exit(1);
  }
  let changed = 0;
  for (const [file, entries] of Object.entries(months)) {
    const out = join(ROOT, "data/words", file);
    const next = JSON.stringify(entries, null, 2) + "\n";
    const prev = existsSync(out) ? readFileSync(out, "utf8") : "";
    if (args.includes("--check")) {
      if (
        JSON.stringify(JSON.parse(prev || "[]")) !== JSON.stringify(entries)
      ) {
        console.error(`${file} is out of date — run pnpm data:words`);
        changed++;
      }
    } else {
      writeFileSync(out, next);
    }
  }
  if (args.includes("--check") && changed) process.exit(1);
  console.log(
    `${args.includes("--check") ? "Checked" : "Wrote"} ${Object.keys(months).length} months, ${Object.values(months).flat().length} entries`,
  );
}
