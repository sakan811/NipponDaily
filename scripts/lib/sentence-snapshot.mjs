/**
 * The example-sentence snapshot, stored the way the Etymology one is: one file
 * per word-plan month under data/reference/sentences/, plus meta.json.
 *
 *   data/reference/sentences/meta.json     source, licence and the export pinned
 *   data/reference/sentences/YYYY-MM.json  { term: [{ id, ja, en, enId, form }] }
 *
 * A term's shard comes only from the word plans, so the layout is
 * deterministic. A term with no sentence has no key. Readers get the merged
 * `{ meta, entries }` back from loadSentenceSnapshot().
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { planMonths } from "./etymology-snapshot.mjs";

export const SENTENCES_DIR = "data/reference/sentences";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** Every shard merged: `{ meta, entries }`; empty `entries` if none exists. */
export function loadSentenceSnapshot(root) {
  const dir = join(root, SENTENCES_DIR);
  if (!existsSync(dir)) return { meta: undefined, entries: {} };
  const entries = {};
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".json") || file === "meta.json") continue;
    Object.assign(entries, readJson(join(dir, file)));
  }
  const metaPath = join(dir, "meta.json");
  return {
    meta: existsSync(metaPath) ? readJson(metaPath) : undefined,
    entries,
  };
}

/** Write `entries` into their month shards (and `meta.json`), removing shards
 *  that no longer hold anything. A term no plan names goes in "unplanned". */
export function writeSentenceSnapshot(root, meta, entries) {
  const dir = join(root, SENTENCES_DIR);
  mkdirSync(dir, { recursive: true });
  const months = planMonths(root);
  const shards = {};
  for (const term of Object.keys(entries).sort())
    (shards[months[term] ?? "unplanned"] ??= {})[term] = entries[term];

  const write = (name, data) =>
    writeFileSync(join(dir, name), JSON.stringify(data, null, 1) + "\n");
  write("meta.json", meta);
  for (const [name, shard] of Object.entries(shards))
    write(`${name}.json`, shard);
  for (const file of readdirSync(dir))
    if (
      file.endsWith(".json") &&
      file !== "meta.json" &&
      !(file.slice(0, -".json".length) in shards)
    )
      rmSync(join(dir, file));
  return Object.keys(shards).length;
}
