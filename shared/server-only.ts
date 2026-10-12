/**
 * The import rule, written once: these `shared/` modules read every entry,
 * upcoming days included, so nothing under `app/` may import them (or
 * `data/words`) or the browser bundle would carry words before their day.
 * `test/unit/no-future-leak.test.ts` enforces it on `app/`, and
 * `test/server/server-only-modules.test.ts` fails when a `shared/` module
 * reaches the data and is missing from this list. The Architecture chapter
 * reads it. Data-free and import-free.
 */

export const SERVER_ONLY_MODULES = [
  "words",
  "parts",
  "kanji",
  "explore",
  "patterns",
  "related",
  "sitemap",
] as const;

/** Where the entries are, as an import specifier names them. */
export const ENTRIES_DIR = "data/words";

/** Whether an import specifier names a server-only module or the entries. */
export const isServerOnlyImport = (specifier: string): boolean =>
  new RegExp(
    `(shared/(?:${SERVER_ONLY_MODULES.join("|")})|${ENTRIES_DIR})(?:["'/.]|$)`,
  ).test(specifier);

/** `shared/words|parts|…`, as prose writes the rule. */
export const SERVER_ONLY_TEXT = `shared/${SERVER_ONLY_MODULES.join("|")}`;
