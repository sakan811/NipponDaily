/**
 * The pinned Tatoeba export the example sentences are read from, and the
 * reader for it. Offline, like the Wiktionary dump: the build takes seconds
 * and a checksum decides which files it accepts.
 *
 * Tatoeba (https://tatoeba.org) is a public, community-built collection of
 * sentences with translations; its weekly exports are CC BY 2.0 FR. Five files
 * are used, each pinned below by size and SHA-256 of the extracted file:
 *
 *   jpn_sentences.tsv   id \t lang \t text            every Japanese sentence
 *   jpn-eng_links.tsv   jpn id \t eng id              which English sentences translate it
 *   eng_sentences.tsv   id \t lang \t text            every English sentence
 *   jpn_indices.csv     jpn id \t eng id \t words     the dictionary words of each Japanese
 *                                                     sentence, from the Tanaka corpus it began as
 *   jpn_transcriptions.tsv  id \t jpn \t Hrkt \t user \t text
 *                                                     the furigana of a sentence, `[漢字|か|ん|じ]`
 *                                                     with one reading per kanji; `user` is the
 *                                                     contributor who wrote it, blank when Tatoeba's
 *                                                     software (MeCab) did
 *
 * The exports are overwritten every week, so these bytes will not be served for
 * ever: the committed snapshot (data/reference/sentences/) is the evidence, and
 * the files are only needed to rebuild it. Bump the pin deliberately, re-run
 * `pnpm data:sentences` and review every diff.
 */
import { createHash } from "node:crypto";
import { createReadStream, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const TATOEBA_EXPORT = {
  /** The date the export was published (its files' Last-Modified). */
  date: "2026-10-03",
  /** Where the files are, relative to this root. Each is bzip2-compressed
   *  (the indices come in a tar); extract them into one directory. */
  baseUrl: "https://downloads.tatoeba.org/exports/",
  /** The default directory the builder looks in (git-ignored). */
  dir: "tatoeba",
  files: {
    "jpn_sentences.tsv": {
      url: "per_language/jpn/jpn_sentences.tsv.bz2",
      bytes: 16552301,
      sha256:
        "dfbbc536489c3525592abd02f570cb4c260d4210aa8b2d5c7b9cf8a26755e049",
    },
    "jpn-eng_links.tsv": {
      url: "per_language/jpn/jpn-eng_links.tsv.bz2",
      bytes: 4109578,
      sha256:
        "3e261b4371c6740d97017735af0f6cf11c2b509d09e8b532817253a8b45fad5b",
    },
    "eng_sentences.tsv": {
      url: "per_language/eng/eng_sentences.tsv.bz2",
      bytes: 108750953,
      sha256:
        "f0772a134c700e01eceef6d33c54531de26f9ea5af64fe00c56c5c49665f281c",
    },
    "jpn_indices.csv": {
      url: "jpn_indices.tar.bz2",
      bytes: 17434468,
      sha256:
        "8814689e026d86649565f6b08d83a3f2a6297481678c7e4d075ecfe2b1fc8d08",
    },
    "jpn_transcriptions.tsv": {
      url: "per_language/jpn/jpn_transcriptions.tsv.bz2",
      bytes: 28574803,
      sha256:
        "af8c8447f345adead11618f423a73bc71daa3280b8e48964d02dd0dd5606f59b",
    },
  },
};

/** Throws unless every file in `dir` is exactly the pinned export. */
export async function verifyExport(dir) {
  for (const [name, pin] of Object.entries(TATOEBA_EXPORT.files)) {
    const path = join(dir, name);
    let size;
    try {
      size = statSync(path).size;
    } catch {
      throw new Error(
        `${path} is missing. Download ${TATOEBA_EXPORT.baseUrl}${pin.url} and extract it there (or bump the pin in scripts/lib/tatoeba-export.mjs).`,
      );
    }
    if (size !== pin.bytes)
      throw new Error(
        `${path} is not the pinned ${name} (expected ${pin.bytes} bytes, got ${size}). Bump the pin in scripts/lib/tatoeba-export.mjs if you mean to use a newer export.`,
      );
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    const got = hash.digest("hex");
    if (got !== pin.sha256)
      throw new Error(
        `${path}: checksum mismatch, expected ${pin.sha256}, got ${got}`,
      );
  }
}

const lines = (path) => readFileSync(path, "utf8").split("\n").filter(Boolean);

/** One index token, "headword(reading)[sense]{form seen in the sentence}~":
 *  only the headword is always there. */
const TOKEN = /^([^([{~]+)(?:\(([^)]+)\))?(?:\[\d+\])?(?:\{([^}]+)\})?~?$/;

/** Reads the export from `dir`: the Japanese sentences, the dictionary words
 *  each is indexed under, the English translations those point to, and the
 *  furigana of each sentence. */
export function readExport(dir) {
  const jpn = new Map();
  for (const l of lines(join(dir, "jpn_sentences.tsv"))) {
    const [id, , text] = l.split("\t");
    jpn.set(id, text);
  }

  const links = new Map();
  for (const l of lines(join(dir, "jpn-eng_links.tsv"))) {
    const [a, b] = l.split("\t");
    const list = links.get(a);
    if (list) list.push(b);
    else links.set(a, [b]);
  }

  // headword → every sentence indexed under it.
  const index = new Map();
  for (const l of lines(join(dir, "jpn_indices.csv"))) {
    const [id, translation, body] = l.split("\t");
    for (const token of (body ?? "").split(" ")) {
      const m = TOKEN.exec(token);
      if (!m) continue;
      const [, headword, reading, form] = m;
      const hit = { id, translation, reading, form };
      const list = index.get(headword);
      if (list) list.push(hit);
      else index.set(headword, [hit]);
    }
  }

  // sentence id → its furigana, and whether a person wrote it.
  const transcriptions = new Map();
  for (const l of lines(join(dir, "jpn_transcriptions.tsv"))) {
    const [id, , script, user, text] = l.split("\t");
    if (script === "Hrkt" && text)
      transcriptions.set(id, { text, human: Boolean(user) });
  }

  // Only the English sentences some Japanese one links to are kept.
  const wanted = new Set([...links.values()].flat());
  const eng = new Map();
  for (const l of lines(join(dir, "eng_sentences.tsv"))) {
    const tab = l.indexOf("\t");
    const id = l.slice(0, tab);
    if (wanted.has(id)) eng.set(id, l.slice(l.indexOf("\t", tab + 1) + 1));
  }
  return { jpn, links, index, eng, transcriptions };
}
