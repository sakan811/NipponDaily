/**
 * A reference snapshot stored as one file per word-plan month plus a
 * `meta.json`, instead of one large file. The etymology and example-sentence
 * snapshots share this layout:
 *
 *   <dir>/meta.json      where the data came from, and the pin
 *   <dir>/YYYY-MM.json   { term: … } for the terms of data/word-plan/YYYY-MM.json
 *   <dir>/unplanned.json terms that are in no word plan yet
 *
 * A term's shard comes only from the word plans, so the layout is
 * deterministic. Readers get the merged `{ meta, entries }` back.
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

export const UNPLANNED_SHARD = "unplanned";

export const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** One space of indent and a final newline: the way every snapshot is written. */
export const stringifyJson = (data) => JSON.stringify(data, null, 1) + "\n";

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

/** Every shard of `dir` merged: `{ meta, entries }`; empty `entries` if none exists. */
export function loadShards(root, dir) {
  const path = join(root, dir);
  if (!existsSync(path)) return { meta: undefined, entries: {} };
  const entries = {};
  for (const file of readdirSync(path).sort()) {
    if (!file.endsWith(".json") || file === "meta.json") continue;
    Object.assign(entries, readJson(join(path, file)));
  }
  const metaPath = join(path, "meta.json");
  return {
    meta: existsSync(metaPath) ? readJson(metaPath) : undefined,
    entries,
  };
}

/** Write `entries` into their month shards (and `meta.json`) under `dir`,
 *  removing shards that no longer hold anything. A term no plan names goes in
 *  "unplanned". Returns the number of shards written. */
export function writeShards(
  root,
  dir,
  meta,
  entries,
  serialize = stringifyJson,
) {
  const path = join(root, dir);
  mkdirSync(path, { recursive: true });
  const months = planMonths(root);
  const shards = {};
  for (const term of Object.keys(entries).sort())
    (shards[months[term] ?? UNPLANNED_SHARD] ??= {})[term] = entries[term];

  const write = (name, data) =>
    writeFileSync(join(path, name), serialize(data));
  write("meta.json", meta);
  for (const [name, shard] of Object.entries(shards))
    write(`${name}.json`, shard);
  for (const file of readdirSync(path))
    if (
      file.endsWith(".json") &&
      file !== "meta.json" &&
      !(file.slice(0, -".json".length) in shards)
    )
      rmSync(join(path, file));
  return Object.keys(shards).length;
}
