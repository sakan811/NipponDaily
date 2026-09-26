/**
 * Builds data/reference/n5-reference.json — the committed, versioned
 * snapshot of dictionary facts that NipponDaily's hand-written learning
 * content is checked against in CI (see docs/content-accuracy.md and
 * test/content/).
 *
 * Why a committed snapshot: lesson copy, example sentences, meaning
 * enrichments and seed-time corrections are all written by hand, and the
 * dictionary data they depend on otherwise only exists inside Redis, where
 * no test can see it. Pinning the evidence into the repo means every claim
 * is verified on every PR, offline and deterministically, and any change to
 * the evidence itself shows up as a reviewable diff.
 *
 * Sources (pinned — bump deliberately, then re-run and review the diff):
 *   - JMdict + KANJIDIC2 via the jamdict-data package (PyPI), a checksum-
 *     verified SQLite build of the EDRDG files. © EDRDG, CC BY-SA 4.0.
 *   - The N5 word list (elzup/jlpt-word-list, MIT) at a fixed commit — the
 *     same list scripts/seed-n5-data.mjs seeds from, parsed with the same
 *     code so ids match the live pool exactly.
 *
 * Requires Node >= 22 (node:sqlite), plus `tar` and `xz` on PATH.
 * Usage: pnpm data:reference
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import kuromoji from "kuromoji";
import { parseN5Csv, slugify } from "./seed-n5-data.mjs";
import { servedVocab } from "../shared/meanings.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "data/reference/n5-reference.json");
const CACHE_DIR = join(ROOT, "node_modules/.cache/n5-reference");

export const JAMDICT_SOURCE = {
  package: "jamdict-data",
  version: "1.5",
  compiled: "2021-04-17",
  url: "https://files.pythonhosted.org/packages/97/a5/075928aed2b3b70459fc1db396397dfa6714d266c143c51af9b648551a4e/jamdict_data-1.5.tar.gz",
  sha256: "a4247dd9bb3148ab17c1b32fc56d7a7f1c35293b0d6ff2838c811f896d13f415",
};

export const WORD_LIST_SOURCE = {
  repo: "elzup/jlpt-word-list",
  commit: "13aa3c54b27115be72d8a62cd4071077c68d2171",
  path: "src/n5.csv",
};

/** Max adjacent tokens joined when looking up multi-token words (三日,
 *  二十日, 日曜日 …) that the tokenizer splits into pieces. */
export const MAX_SPAN_TOKENS = 3;

const KANJI_RE = /[㐀-䶿一-鿿々]/;
const KANJI_RE_G = /[㐀-䶿一-鿿]/gu;

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function ensureJamdictDb() {
  mkdirSync(CACHE_DIR, { recursive: true });
  const db = join(CACHE_DIR, "jamdict.db");
  if (existsSync(db)) return db;

  const tgz = join(CACHE_DIR, "jamdict_data.tar.gz");
  if (!existsSync(tgz)) {
    console.log(
      `Downloading ${JAMDICT_SOURCE.package} ${JAMDICT_SOURCE.version}…`,
    );
    await download(JAMDICT_SOURCE.url, tgz);
  }
  const sha = createHash("sha256").update(readFileSync(tgz)).digest("hex");
  if (sha !== JAMDICT_SOURCE.sha256) {
    throw new Error(
      `jamdict-data checksum mismatch: expected ${JAMDICT_SOURCE.sha256}, got ${sha}`,
    );
  }
  const member = `jamdict_data-${JAMDICT_SOURCE.version}/jamdict_data/jamdict.db.xz`;
  execFileSync("tar", ["-xzf", tgz, "-C", CACHE_DIR, member]);
  execFileSync("xz", ["-dk", join(CACHE_DIR, member)]);
  execFileSync("mv", [join(CACHE_DIR, member.replace(/\.xz$/, "")), db]);
  return db;
}

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
function contentKanji() {
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

/** Strips the word list's notation so a form can be looked up in JMdict. */
export function normalizeListForm(term, kana) {
  let t = term.replace(/[～〜~]/g, "").trim();
  let k = kana
    .replace(/[～〜~]/g, "")
    .replace(/\s*[(（]\s*する\s*[)）]\s*$/, "")
    .trim();
  if (t.endsWith("する") && t.length > 2 && k.endsWith("する")) {
    t = t.slice(0, -2);
    k = k.slice(0, -2);
  }
  return { term: t, kana: k };
}

function openDictionary(dbPath) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const q = {
    idsByKanji: db.prepare("SELECT DISTINCT idseq FROM Kanji WHERE text = ?"),
    idsByKana: db.prepare("SELECT DISTINCT idseq FROM Kana WHERE text = ?"),
    kanjiOf: db.prepare("SELECT text FROM Kanji WHERE idseq = ? ORDER BY ID"),
    kanaOf: db.prepare("SELECT text FROM Kana WHERE idseq = ? ORDER BY ID"),
    senses: db.prepare("SELECT ID FROM Sense WHERE idseq = ? ORDER BY ID"),
    glosses: db.prepare(
      "SELECT text FROM SenseGloss WHERE sid = ? AND lang = 'eng' ORDER BY rowid",
    ),
    pos: db.prepare("SELECT text FROM pos WHERE sid = ? ORDER BY rowid"),
    char: db.prepare(
      "SELECT ID, stroke_count FROM character WHERE literal = ?",
    ),
    groups: db.prepare("SELECT ID FROM rm_group WHERE cid = ? ORDER BY ID"),
    readings: db.prepare(
      "SELECT r_type, value FROM reading WHERE gid = ? AND r_type IN ('ja_on','ja_kun') ORDER BY rowid",
    ),
    meanings: db.prepare(
      "SELECT value FROM meaning WHERE gid = ? AND m_lang = '' ORDER BY rowid",
    ),
  };
  const col = (rows, key) => rows.map((r) => r[key]);

  function entry(idseq) {
    return {
      idseq,
      kanji: col(q.kanjiOf.all(idseq), "text"),
      readings: col(q.kanaOf.all(idseq), "text"),
      senses: q.senses.all(idseq).map(({ ID }) => ({
        pos: col(q.pos.all(ID), "text"),
        glosses: col(q.glosses.all(ID), "text"),
      })),
    };
  }

  return {
    /** JMdict entries for a word written `term` and read `kana`. The word
     *  list marks affixes with ～ (～円, お～) and suru-verbs with (する) /
     *  a する suffix; those markers are stripped before looking up. */
    lookupWord(rawTerm, rawKana) {
      const { term, kana } = normalizeListForm(rawTerm, rawKana);
      const byKana = new Set(col(q.idsByKana.all(kana), "idseq"));
      const ids = KANJI_RE.test(term)
        ? col(q.idsByKanji.all(term), "idseq").filter((id) => byKana.has(id))
        : [...byKana].filter(
            (id) =>
              // kana-only words: prefer entries not written with kanji at all,
              // falling back to any entry with this reading
              q.kanjiOf.all(id).length === 0,
          );
      const chosen = ids.length > 0 || KANJI_RE.test(term) ? ids : [...byKana];
      if (chosen.length === 0 && term.endsWith("と") && term.length > 2) {
        // Adverbs listed with their optional と (ゆっくりと): JMdict files
        // them under the bare form, tagged as taking と.
        const bare = this.lookupWord(term.slice(0, -1), kana.slice(0, -1));
        return bare.filter((e) =>
          e.senses.some((s) => s.pos.some((p) => /'to' particle/.test(p))),
        );
      }
      return chosen.sort((a, b) => a - b).map(entry);
    },
    /** True when JMdict has an entry written or read as `word`. */
    wordExists(word) {
      return (
        q.idsByKanji.all(word).length > 0 || q.idsByKana.all(word).length > 0
      );
    },
    /** All JMdict readings for a written form. */
    readingsOf(surface) {
      const out = new Set();
      for (const id of col(q.idsByKanji.all(surface), "idseq")) {
        for (const r of col(q.kanaOf.all(id), "text")) out.add(r);
      }
      return [...out];
    },
    kanji(char) {
      const c = q.char.get(char);
      if (!c) return null;
      const on = [];
      const kun = [];
      const meanings = [];
      for (const { ID } of q.groups.all(c.ID)) {
        for (const r of q.readings.all(ID)) {
          (r.r_type === "ja_on" ? on : kun).push(r.value);
        }
        meanings.push(...col(q.meanings.all(ID), "value"));
      }
      return { strokeCount: c.stroke_count, on, kun, meanings };
    },
  };
}

async function main() {
  const [dbPath, entries, tokenizer] = await Promise.all([
    ensureJamdictDb(),
    fetchWordList(),
    buildTokenizer(),
  ]);
  const dict = openDictionary(dbPath);

  // Vocab — same ids as the live pool (same parser, same slugify order).
  const seen = new Set();
  // Words are recorded as the site serves them (shared/meanings.ts form
  // corrections and enrichments applied), with the list's own values kept
  // alongside for review.
  const vocab = entries.map((e) => {
    const id = slugify(e.term, seen);
    const served = servedVocab({ ...e, romaji: "" });
    return {
      id,
      /** `term kana` as seeded — the key shared/meanings.ts and the seed
       *  overrides use. */
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
        "Dictionary evidence for NipponDaily's hand-written learning content. Generated by scripts/build-n5-reference.mjs — do not edit by hand; see docs/content-accuracy.md.",
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
