/**
 * Builds data/reference/n5-reference.json — the committed, versioned
 * snapshot of dictionary facts that NipponDaily's hand-written learning
 * content is checked against in CI (see the "Data Integrity & Attribution"
 * docs page, app/pages/docs/data-integrity.vue, and test/content/).
 *
 * Why a committed snapshot: meaning enrichments and form corrections are
 * written by hand, and the dictionary data they depend on is otherwise
 * outside the repo, where no test can see it. Pinning the evidence into the
 * repo means every claim is verified on every PR, offline and
 * deterministically, and any change to the evidence itself shows up as a
 * reviewable diff.
 *
 * Sources (pinned — bump deliberately, then re-run and review the diff):
 *   - JMdict + KANJIDIC2 via the jamdict-data package (PyPI), a checksum-
 *     verified SQLite build of the EDRDG files. © EDRDG, CC BY-SA 4.0.
 *   - The N5 word list (elzup/jlpt-word-list, MIT), pinned in
 *     scripts/word-list-source.mjs and parsed by scripts/lib/word-list.mjs.
 *
 * Requires Node >= 22 (node:sqlite), plus `tar` and `xz` on PATH.
 * Usage: pnpm data:reference
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import kuromoji from "kuromoji";
import { parseN5Csv, slugify } from "./lib/word-list.mjs";
import { WORD_LIST_SOURCE } from "./word-list-source.mjs";
import {
  JAMDICT_SOURCE,
  ensureJamdictDb,
  openDictionary,
} from "./lib/jamdict.mjs";
import { servedVocab } from "../shared/meanings.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "data/reference/n5-reference.json");
const CACHE_DIR = join(ROOT, "node_modules/.cache/n5-reference");

export { WORD_LIST_SOURCE, JAMDICT_SOURCE };

/** Max adjacent tokens joined when looking up multi-token words (三日,
 *  二十日, 日曜日 …) that the tokenizer splits into pieces. */
export const MAX_SPAN_TOKENS = 3;

const KANJI_RE = /[㐀-䶿一-鿿々]/;
const KANJI_RE_G = /[㐀-䶿一-鿿]/gu;

async function fetchWordList() {
  const { repo, commit, path } = WORD_LIST_SOURCE;
  const url = `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return parseN5Csv(await res.text());
}

export function buildTokenizer() {
  return new Promise((res, rej) =>
    kuromoji
      .builder({ dicPath: join(ROOT, "node_modules/kuromoji/dict") })
      .build((err, t) => (err ? rej(err) : res(t))),
  );
}

/** Every Japanese example sentence (`jp: "…"`) in the hand-written content. */
export function contentSentences() {
  const dir = join(ROOT, "app/data");
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const text = readFileSync(join(dir, file), "utf8");
    for (const m of text.matchAll(/\bjp:\s*"([^"]+)"/g)) out.push(m[1]);
  }
  return out;
}

/** Every run of Japanese text anywhere in the hand-written content. */
export function contentJapanese() {
  const dir = join(ROOT, "app/data");
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const text = readFileSync(join(dir, file), "utf8");
    for (const m of text.matchAll(/[\u3040-\u30ff\u4e00-\u9fff々ー]+/gu))
      out.push(m[0]);
  }
  return out;
}

/** Every kanji the hand-written content or shared glosses mention. */
export function contentKanji() {
  const chars = new Set();
  for (const dir of ["app/data", "shared", "app/pages/learn"]) {
    const abs = join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of readdirSync(abs)) {
      if (!/\.(ts|vue)$/.test(file)) continue;
      for (const c of readFileSync(join(abs, file), "utf8").match(KANJI_RE_G) ??
        [])
        chars.add(c);
    }
  }
  return chars;
}

async function main() {
  const [dbPath, entries, tokenizer] = await Promise.all([
    ensureJamdictDb(CACHE_DIR),
    fetchWordList(),
    buildTokenizer(),
  ]);
  const dict = openDictionary(dbPath);

  // Vocab — ids from the shared parser and slugify order.
  const seen = new Set();
  // Words are recorded as the site serves them (shared/meanings.ts form
  // corrections and enrichments applied), with the list's own values kept
  // alongside for review.
  const vocab = entries.map((e) => {
    const id = slugify(e.term, seen);
    const served = servedVocab(e);
    return {
      id,
      /** `term kana` as listed — the key shared/meanings.ts and the
       *  word-list overrides use. */
      seedKey: `${e.term} ${e.kana}`,
      term: served.term,
      kana: served.kana,
      meaning: served.meaning,
      listTerm: e.term,
      listReading: e.listReading,
      listMeaning: e.listMeaning,
      jmdict: dict.lookupWord(served.term, served.kana),
    };
  });

  // Readings for every kanji-bearing word or 2–3 token span in the example
  // sentences, so the rōmaji check accepts any reading JMdict lists (e.g.
  // 三日 みっか, 七 しち/なな) — not just the tokenizer's single guess.
  const surfaces = new Set(
    vocab.map((v) => v.term).filter((t) => KANJI_RE.test(t)),
  );
  for (const sentence of contentSentences()) {
    const tokens = tokenizer.tokenize(sentence).map((t) => t.surface_form);
    for (let i = 0; i < tokens.length; i++) {
      let span = "";
      for (let j = i; j < Math.min(tokens.length, i + MAX_SPAN_TOKENS); j++) {
        span += tokens[j];
        if (KANJI_RE.test(span)) surfaces.add(span);
      }
    }
  }
  const readings = {};
  for (const s of [...surfaces].sort()) {
    const r = dict.readingsOf(s);
    if (r.length > 0) readings[s] = r;
  }

  // Words the tokenizer's own dictionary doesn't know (e.g. キロメートル)
  // but JMdict does — so the prose check can tell a rare real word from a
  // misspelling.
  const words = new Set();
  for (const run of contentJapanese()) {
    for (const t of tokenizer.tokenize(run)) {
      if (t.word_type === "UNKNOWN" && dict.wordExists(t.surface_form)) {
        words.add(t.surface_form);
      }
    }
  }

  // Kanji — every character in N5 terms or anywhere in the content.
  const kanjiChars = contentKanji();
  for (const v of vocab)
    for (const c of v.term.match(KANJI_RE_G) ?? []) kanjiChars.add(c);
  const kanji = {};
  for (const c of [...kanjiChars].sort()) {
    const info = dict.kanji(c);
    if (info) kanji[c] = info;
  }

  const reference = {
    meta: {
      description:
        "Dictionary evidence for NipponDaily's hand-written learning content. Generated by scripts/build-n5-reference.mjs — do not edit by hand; see the Data Integrity & Attribution docs page (app/pages/docs/data-integrity.vue).",
      sources: {
        jmdict: {
          ...JAMDICT_SOURCE,
          licence: "JMdict/KANJIDIC2 © EDRDG, CC BY-SA 4.0",
        },
        wordList: { ...WORD_LIST_SOURCE, licence: "MIT" },
      },
      counts: {
        vocab: vocab.length,
        readings: Object.keys(readings).length,
        words: words.size,
        kanji: Object.keys(kanji).length,
      },
    },
    vocab,
    readings,
    words: [...words].sort(),
    kanji,
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, `${JSON.stringify(reference, null, 1)}\n`);
  console.log(
    `Wrote ${OUT_FILE}: ${vocab.length} vocab, ${Object.keys(readings).length} readings, ${Object.keys(kanji).length} kanji`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
