/**
 * The pinned Wiktionary dump the Etymology snapshot is built from, and the
 * reader for it. Replaces the per-page Wikimedia API fetch: the whole run is
 * offline and takes seconds.
 *
 * The file is Kaikki.org's wiktextract output for the Japanese entries of
 * English Wiktionary (one JSON object per line). It is 367 MB, so it is never
 * committed: only the per-word sections that entries quote are, in
 * data/reference/etymology/, and CI checks every quote against those. The pin
 * below says which dump they came from, and the builder refuses any other file.
 *
 * Kaikki marks this postprocessed file deprecated and overwrites it on every
 * extraction, so the URL will not serve these bytes for ever; keep the file if
 * you need to rebuild. Bump the pin deliberately, then re-run
 * `pnpm data:etymology` and review every diff.
 */
import { createHash } from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import { createInterface } from "node:readline";
import { toHiragana } from "wanakana";

export const WIKTIONARY_DUMP = {
  file: "kaikki.org-dictionary-Japanese.jsonl",
  url: "https://kaikki.org/dictionary/Japanese/kaikki.org-dictionary-Japanese.jsonl",
  /** Date of the enwiktionary dump wiktextract read. */
  dump: "2026-09-02",
  /** Date wiktextract ran over it. */
  extracted: "2026-09-28",
  bytes: 384872852,
  sha256: "65be27d6c84f09ea2fa7622af56a7bfeba5dc807c88fd87b3d14dfc8fc112cc5",
};

/** Throws unless the file at `path` is exactly the pinned dump. */
export async function verifyDump(path) {
  const { bytes, sha256, file } = WIKTIONARY_DUMP;
  if (statSync(path).size !== bytes)
    throw new Error(
      `${path} is not the pinned ${file} (expected ${bytes} bytes, got ${statSync(path).size}). Download it from ${WIKTIONARY_DUMP.url} or bump the pin in scripts/lib/wiktionary-dump.mjs.`,
    );
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  const got = hash.digest("hex");
  if (got !== sha256)
    throw new Error(
      `${path}: checksum mismatch, expected ${sha256}, got ${got}`,
    );
}

/** The readings a record's headword templates declare, as hiragana, deduplicated.
 *  `ja-noun` and `ja-verb` put the reading first; `ja-pos` puts the part of
 *  speech first and the reading second, so the first three positional
 *  arguments are all tried and only kana survive. A hyphen or dot marks an okurigana
 *  or prefix boundary (お-れい, ほの.お) and `%`/`^` mark pitch accent. Romaji is left
 *  alone: wanakana would otherwise turn "pronoun" into ぷろのうん. */
export function readingsOfRecord(record) {
  const out = [];
  for (const t of record.head_templates ?? []) {
    if (!t.name?.startsWith("ja-")) continue;
    for (const key of ["1", "2", "3"]) {
      const raw = String(t.args?.[key] ?? "")
        .replace(/[<_].*$/, "")
        .replace(/[%^.\-－]/g, "")
        .trim();
      const kana = toHiragana(raw, { passRomaji: true });
      if (/^[\p{sc=Hiragana}ー]+$/u.test(kana) && !out.includes(kana))
        out.push(kana);
    }
  }
  return out;
}

/** Records of one term → its Etymology sections. Records that share an
 *  etymology text (the noun and the verb of one origin) are one section whose
 *  readings are the union; records with no etymology are skipped. */
export function sectionsOf(records) {
  const sections = new Map();
  for (const r of records) {
    if (r.lang_code !== "ja" || !r.etymology_text) continue;
    const text = r.etymology_text.trim();
    const section = sections.get(text) ?? {
      heading: "Etymology",
      text,
      readings: [],
    };
    for (const k of readingsOfRecord(r))
      if (!section.readings.includes(k)) section.readings.push(k);
    sections.set(text, section);
  }
  return [...sections.values()];
}

/** One streaming pass over the dump: `Map(term → sections)` for the terms
 *  asked for, and only those that have at least one section. */
export async function readSections(path, terms) {
  const wanted = new Set(terms);
  const records = new Map();
  const lines = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (!wanted.has(record.word)) continue;
    if (!records.has(record.word)) records.set(record.word, []);
    records.get(record.word).push(record);
  }
  const out = new Map();
  for (const [term, recs] of records) {
    const sections = sectionsOf(recs);
    if (sections.length) out.set(term, sections);
  }
  return out;
}
