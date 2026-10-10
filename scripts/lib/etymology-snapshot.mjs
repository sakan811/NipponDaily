/**
 * The pinned Wiktionary snapshot, stored as one file per month under
 * data/reference/etymology/ instead of a single large file (the layout is in
 * month-shards.mjs).
 *
 *   data/reference/etymology/meta.json      source + license
 *   data/reference/etymology/YYYY-MM.json   { term: { revid, url, etymologies } }
 *   data/reference/etymology/unplanned.json pins whose term is in no word plan yet
 *                                           (bootstrapped with `--terms`)
 *
 * Readers get the merged `{ meta, entries }` back from
 * loadEtymologySnapshot(), the shape the single file used to have.
 */
import { loadShards, writeShards } from "./month-shards.mjs";

export const ETYMOLOGY_DIR = "data/reference/etymology";

/** Every shard merged: `{ meta, entries }`; empty `entries` if none exists. */
export const loadEtymologySnapshot = (root) => loadShards(root, ETYMOLOGY_DIR);

/** Write `entries` into their month shards (and `meta.json`), removing shards
 *  that no longer hold anything. */
export const writeEtymologySnapshot = (root, meta, entries) =>
  writeShards(root, ETYMOLOGY_DIR, meta, entries);
