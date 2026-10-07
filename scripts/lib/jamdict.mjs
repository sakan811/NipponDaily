/**
 * Shared jamdict-data (JMdict + KANJIDIC2) access, extracted out of
 * scripts/build-n5-reference.mjs so scripts/build-jlpt-reference.mjs (N4-N1's
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

/** Every reading JMdict gives a written form, when it gives more than one
 *  (今日: きょう, こんにち, こんじつ). A sentence corpus that indexes the bare
 *  spelling cannot say which of them it means, so the sentence builder reads
 *  this to refuse such an index entry. */
export function spellingReadings(dict, term) {
  if (!KANJI_RE.test(term)) return undefined;
  const readings = dict.readingsOf(term);
  return readings.length > 1 ? readings : undefined;
}

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
    // Priority tags (ke_pri / re_pri) and form notes (ke_inf / re_inf) hang
    // off one spelling or one reading, not off the entry.
    kanjiPri: db.prepare(
      "SELECT k.text AS form, p.text AS tag FROM Kanji k JOIN KJP p ON p.kid = k.ID WHERE k.idseq = ? ORDER BY k.ID, p.rowid",
    ),
    kanaPri: db.prepare(
      "SELECT k.text AS form, p.text AS tag FROM Kana k JOIN KNP p ON p.kid = k.ID WHERE k.idseq = ? ORDER BY k.ID, p.rowid",
    ),
    kanjiInfo: db.prepare(
      "SELECT k.text AS form, p.text AS tag FROM Kanji k JOIN KJI p ON p.kid = k.ID WHERE k.idseq = ? ORDER BY k.ID, p.rowid",
    ),
    kanaInfo: db.prepare(
      "SELECT k.text AS form, p.text AS tag FROM Kana k JOIN KNI p ON p.kid = k.ID WHERE k.idseq = ? ORDER BY k.ID, p.rowid",
    ),
    loanSources: db.prepare(
      "SELECT text, lang, lstype, wasei FROM SenseSource WHERE sid = ? ORDER BY rowid",
    ),
    senses: db.prepare("SELECT ID FROM Sense WHERE idseq = ? ORDER BY ID"),
    glosses: db.prepare(
      "SELECT text FROM SenseGloss WHERE sid = ? AND lang = 'eng' ORDER BY rowid",
    ),
    pos: db.prepare("SELECT text FROM pos WHERE sid = ? ORDER BY rowid"),
    misc: db.prepare("SELECT text FROM misc WHERE sid = ?"),
    char: db.prepare(
      "SELECT ID, stroke_count, grade, freq FROM character WHERE literal = ?",
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

  /** `[{ form, tag }]` rows as `{ form: [tag, …] }`, in JMdict's order. */
  const byForm = (rows) => {
    const out = {};
    for (const { form, tag } of rows) (out[form] ??= []).push(tag);
    return out;
  };

  /** Every tag JMdict writes verbatim; a key is left out when it has nothing,
   *  so an entry only grows where JMdict says something. `priority` holds the
   *  ke_pri / re_pri codes of each spelling and reading (ichi1, news1, nf05…),
   *  `info` its ke_inf / re_inf notes (ateji, irregular kanji usage…), and a
   *  sense's `misc` its misc tags (abbreviation, archaism…) and `loan` the
   *  language it was borrowed from (`wasei` for a coinage made in Japan). */
  function entry(idseq) {
    const priority = byForm([
      ...q.kanjiPri.all(idseq),
      ...q.kanaPri.all(idseq),
    ]);
    const info = byForm([...q.kanjiInfo.all(idseq), ...q.kanaInfo.all(idseq)]);
    return {
      idseq,
      kanji: col(q.kanjiOf.all(idseq), "text"),
      readings: col(q.kanaOf.all(idseq), "text"),
      ...(Object.keys(priority).length ? { priority } : {}),
      ...(Object.keys(info).length ? { info } : {}),
      senses: q.senses.all(idseq).map(({ ID }) => {
        const misc = col(q.misc.all(ID), "text");
        const loan = q.loanSources.all(ID).map((l) => ({
          lang: l.lang,
          ...(l.text ? { text: l.text } : {}),
          ...(l.lstype === "part" ? { partial: true } : {}),
          ...(l.wasei === "y" ? { wasei: true } : {}),
        }));
        return {
          pos: col(q.pos.all(ID), "text"),
          glosses: col(q.glosses.all(ID), "text"),
          ...(misc.length ? { misc } : {}),
          ...(loan.length ? { loan } : {}),
        };
      }),
    };
  }

  return {
    /** JMdict entries for a word written `term` and read `kana`. The word
     *  list marks affixes with ～ (～円, お～) and suru-verbs with (する) /
     *  a する suffix; those markers are stripped before looking up (see
     *  normalizeListForm). */
    lookupWord(rawTerm, rawKana) {
      // The form exactly as listed always gets the first try: a word whose
      // reading merely ends in する (擦る/こする "to rub") is not a suru-noun,
      // and a する-final headword can be an entry in its own right (達する,
      // 適する, 罰する) — stripping する down to a bare noun is the fallback,
      // for words listed like 運動/うんどうする.
      const listed = {
        term: rawTerm.replace(/[～〜~]/g, "").trim(),
        kana: rawKana.replace(/[～〜~]/g, "").trim(),
      };
      if (listed.term && listed.kana) {
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
      // A kana-only list word is often the kana spelling of a kanji headword
      // JMdict marks "usually written using kana alone" (トン is 屯/噸/瓲,
      // これ is 此れ/是, コップ is 洋杯) — the real word — while the kana-only
      // entries that share the reading are unrelated homographs (トン = a
      // Morse-code dot, これ = "hey!", コップ = "cop"). Both belong in the
      // evidence, otherwise a word's own meaning has nothing to be checked
      // against.
      if (!KANJI_RE.test(term) && ids.length > 0) {
        for (const id of byKana) {
          if (ids.includes(id)) continue;
          const usuallyKana = q.senses
            .all(id)
            .some(({ ID }) =>
              q.misc
                .all(ID)
                .some((m) => /usually written using kana/.test(m.text)),
            );
          if (usuallyKana) ids.push(id);
        }
      }
      const chosen = ids.length > 0 || KANJI_RE.test(term) ? ids : [...byKana];
      const particle = term.endsWith("と")
        ? "と"
        : term.endsWith("に")
          ? "に"
          : "";
      if (chosen.length === 0 && particle && term.length > 2) {
        // Adverbs listed with their optional と/に (ゆっくりと, やたらに):
        // JMdict files them under the bare form, tagged as adverbs (often
        // "taking the 'to' particle").
        const bare = this.lookupNormalized(
          term.slice(0, -1),
          kana.slice(0, -1),
        );
        return bare.filter((e) =>
          e.senses.some((s) =>
            s.pos.some((p) => /'to' particle|adverb/.test(p)),
          ),
        );
      }
      return chosen.sort((a, b) => a - b).map(entry);
    },
    /**
     * True when a bound affix kanji (～船 ～せん, 防～ ぼう～, ～遣い ～づかい) is
     * read the way KANJIDIC2 says that character can be read. JMdict indexes
     * few of these bound forms as headwords of their own, so the character's
     * own KANJIDIC2 readings are the evidence — the same rule test/content/
     * applies to N3's bound kanji. Allows rendaku (しょ → じょ, つか → づか)
     * and trailing okurigana.
     */
    boundKanjiAttested(rawTerm, rawKana) {
      const term = rawTerm.replace(/[～〜~\s]/g, "");
      const m = term.match(/^([㐀-䶿一-鿿々])([\u3040-\u309f]*)$/);
      if (!m) return false;
      const info = this.kanji(m[1]);
      if (!info) return false;
      const okuri = m[2];
      let reading = rawKana.replace(/[～〜~\s]/g, "");
      if (okuri) {
        if (!reading.endsWith(okuri)) return false;
        reading = reading.slice(0, -okuri.length);
      }
      const hira = (str) =>
        str.replace(/[ァ-ヶ]/g, (c) =>
          String.fromCharCode(c.charCodeAt(0) - 0x60),
        );
      const unvoice = (str) =>
        [...str]
          .map((c) => {
            const i = "がぎぐげござじずぜぞだぢづでどばびぶべぼ".indexOf(c);
            return i >= 0 ? "かきくけこさしすせそたちつてとはひふへほ"[i] : c;
          })
          .join("");
      const candidates = new Set(
        [...info.on, ...info.kun].map((r) =>
          hira(r.replace(/-/g, "").split(".")[0]),
        ),
      );
      const target = hira(reading);
      return candidates.has(target) || candidates.has(unvoice(target));
    },
    /** True when JMdict has an entry written or read as `word`. */
    wordExists(word) {
      return (
        q.idsByKanji.all(word).length > 0 || q.idsByKana.all(word).length > 0
      );
    },
    /** Every reading of one JMdict entry, by its sequence number. */
    readingsOfEntry(idseq) {
      return col(q.kanaOf.all(idseq), "text");
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
      return {
        strokeCount: c.stroke_count,
        // KANJIDIC2's school grade (1–6 taught in elementary school, 8 the
        // rest of the jōyō list, 9–10 name kanji) and its rank by newspaper
        // frequency (1–2500); either is left out when KANJIDIC2 has none.
        ...(c.grade ? { grade: Number(c.grade) } : {}),
        ...(c.freq ? { freq: Number(c.freq) } : {}),
        on,
        kun,
        meanings,
      };
    },
  };
}
