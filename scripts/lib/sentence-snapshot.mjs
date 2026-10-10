/**
 * The example-sentence snapshot, stored the way the Etymology one is: one file
 * per word-plan month under data/reference/sentences/, plus meta.json.
 *
 *   data/reference/sentences/meta.json     source, licence and the export pinned
 *   data/reference/sentences/YYYY-MM.json  { term: [{ id, ja, en, enId, form, furigana? }] }
 *
 * A term's shard comes only from the word plans, so the layout is
 * deterministic. A term with no sentence has no key. Readers get the merged
 * `{ meta, entries }` back from loadSentenceSnapshot().
 */
import { loadShards, writeShards } from "./month-shards.mjs";

export const SENTENCES_DIR = "data/reference/sentences";

/** One space of indent, except that a sentence's `furigana` parts stay on one
 *  line, so a diff of the snapshot shows a sentence, not a column of pieces. */
function stringify(data) {
  return (
    JSON.stringify(data, null, 1).replace(
      /^( {3}"furigana": )(\[[\s\S]*?\n {3}\])$/gm,
      (_, key, block) => key + JSON.stringify(JSON.parse(block)),
    ) + "\n"
  );
}

/** Every shard merged: `{ meta, entries }`; empty `entries` if none exists. */
export const loadSentenceSnapshot = (root) => loadShards(root, SENTENCES_DIR);

/** Write `entries` into their month shards (and `meta.json`), removing shards
 *  that no longer hold anything. A term no plan names goes in "unplanned". */
export const writeSentenceSnapshot = (root, meta, entries) =>
  writeShards(root, SENTENCES_DIR, meta, entries, stringify);
