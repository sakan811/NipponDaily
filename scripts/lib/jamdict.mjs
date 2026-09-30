/**
 * Shared jamdict-data (JMdict + KANJIDIC2) access, extracted out of
 * scripts/build-n5-reference.mjs so scripts/build-jlpt-reference.mjs (N4-N2's
 * evidence snapshots) can reuse the exact same checksum-verified download and
 * SQLite query logic instead of duplicating it. build-n5-reference.mjs's own
 * behaviour/output is unchanged by this extraction — same source, same
 * queries, just moved.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const JAMDICT_SOURCE = {
  package: "jamdict-data",
  version: "1.5",
  compiled: "2021-04-17",
  url: "https://files.pythonhosted.org/packages/97/a5/075928aed2b3b70459fc1db396397dfa6714d266c143c51af9b648551a4e/jamdict_data-1.5.tar.gz",
  sha256: "a4247dd9bb3148ab17c1b32fc56d7a7f1c35293b0d6ff2838c811f896d13f415",
};

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

/** Downloads (if not already cached) and checksum-verifies jamdict-data,
 *  returning the path to its extracted SQLite db. `cacheDir` is shared by
 *  every caller in the same run, so build-n5-reference.mjs and
 *  build-jlpt-reference.mjs never download the ~tens-of-MB archive twice. */
export async function ensureJamdictDb(cacheDir) {
  mkdirSync(cacheDir, { recursive: true });
  const db = join(cacheDir, "jamdict.db");
  if (existsSync(db)) return db;

  const tgz = join(cacheDir, "jamdict_data.tar.gz");
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
  execFileSync("tar", ["-xzf", tgz, "-C", cacheDir, member]);
  execFileSync("xz", ["-dk", join(cacheDir, member)]);
  execFileSync("mv", [join(cacheDir, member.replace(/\.xz$/, "")), db]);
  return db;
}

const KANJI_RE = /[㐀-䶿一-鿿々]/;

/** Strips the word list's notation so a form can be looked up in JMdict —
 *  shared by every level's word list. Different files in elzup/
 *  jlpt-word-list mark suru-verbs differently: n5.csv annotates the reading
 *  as "けっこん (する)" (parenthesized, both sides bare), while n4/n3/n2.csv
 *  glue する directly onto the reading of an otherwise suru-less term
 *  (運動/うんどうする) — both get stripped down to the plain noun/verb JMdict
 *  actually indexes. */
export function normalizeListForm(term, kana) {
  let t = term.replace(/[～〜~]/g, "").trim();
  let k = kana
    .replace(/[～〜~]/g, "")
    .replace(/\s*[(（]\s*する\s*[)）]\s*$/, "")
    .trim();
  if (t.endsWith("する") && t.length > 2 && k.endsWith("する")) {
    t = t.slice(0, -2);
    k = k.slice(0, -2);
  } else if (!t.endsWith("する") && k.length > 2 && k.endsWith("する")) {
    k = k.slice(0, -2);
  }
  return { term: t, kana: k };
}

/** Opens the jamdict-data SQLite db and returns the same lookup surface
 *  build-n5-reference.mjs has always used: word/reading/kanji queries by
 *  written form + reading. */
export function openDictionary(dbPath) {
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
     *  a する suffix; those markers are stripped before looking up (see
     *  normalizeListForm). */
    lookupWord(rawTerm, rawKana) {
      // A する-final word can be a JMdict headword in its own right (達する,
      // 適する, 罰する are suru-verb entries, not 達/適/罰 + する) — try the
      // form exactly as listed before stripping する down to the bare noun.
      const listed = {
        term: rawTerm.replace(/[～〜~]/g, "").trim(),
        kana: rawKana.replace(/[～〜~]/g, "").trim(),
      };
      if (listed.term.endsWith("する") && listed.kana.endsWith("する")) {
        const exact = this.lookupNormalized(listed.term, listed.kana);
        if (exact.length > 0) return exact;
      }
      const { term, kana } = normalizeListForm(rawTerm, rawKana);
      return this.lookupNormalized(term, kana);
    },
    /** lookupWord's core, on an already-normalized term/kana pair. */
    lookupNormalized(term, kana) {
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
        const bare = this.lookupNormalized(
          term.slice(0, -1),
          kana.slice(0, -1),
        );
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
