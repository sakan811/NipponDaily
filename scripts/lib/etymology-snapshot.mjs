/**
 * The pinned Wiktionary snapshot, stored as one file per month under
 * data/reference/etymology/ instead of a single large file.
 *
 *   data/reference/etymology/meta.json      source + license
 *   data/reference/etymology/YYYY-MM.json   { term: { revid, url, etymologies } }
 *                                           for the terms of data/word-plan/YYYY-MM.json
 *   data/reference/etymology/unplanned.json pins whose term is in no word plan yet
 *                                           (bootstrapped with `--terms`)
 *
 * A term's shard comes only from the word plans, so the layout is
 * deterministic. Readers get the merged `{ meta, entries }` back from
 * loadEtymologySnapshot(), the shape the single file used to have.
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

export const ETYMOLOGY_DIR = "data/reference/etymology";
export const UNPLANNED_SHARD = "unplanned";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** { term → "YYYY-MM" } from data/word-plan/*.json. */
export function planMonths(root) {
  const dir = join(root, "data/word-plan");
  const months = {};
  if (!existsSync(dir)) return months;
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue;
    const month = file.slice(0, -".json".length);
    for (const { term } of readJson(join(dir, file))) months[term] ??= month;
  }
  return months;
}

/** Every shard merged: `{ meta, entries }`; empty `entries` if none exists. */
export function loadEtymologySnapshot(root) {
  const dir = join(root, ETYMOLOGY_DIR);
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
 *  that no longer hold anything. */
export function writeEtymologySnapshot(root, meta, entries) {
  const dir = join(root, ETYMOLOGY_DIR);
  mkdirSync(dir, { recursive: true });
  const months = planMonths(root);
  const shards = {};
  for (const term of Object.keys(entries).sort())
    (shards[months[term] ?? UNPLANNED_SHARD] ??= {})[term] = entries[term];

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
