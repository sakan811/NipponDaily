/**
 * JMdict and KANJIDIC2 access for every builder (the level snapshots, the kanji
 * snapshot and the sentence furigana). Both are read from the files the
 * Electronic Dictionary Research and Development Group publishes itself
 * (https://www.edrdg.org/), pinned here by size and checksum.
 *
 * EDRDG rebuilds and overwrites both files every day, so the URLs will not
 * serve these bytes for ever. Keep the two files in the repo root (they are
 * git-ignored, like the Wiktionary dump) if you need to rebuild: the committed
 * snapshots, not the files, are what CI checks. Bump the pin deliberately, then
 * re-run every `data:` script and review each diff.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

export const JMDICT_SOURCE = {
  jmdict: {
    file: "JMdict_e.gz",
    url: "http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz",
    /** The date in the file's own `JMdict created` comment. */
    created: "2026-10-08",
    bytes: 10582530,
    sha256: "3d5fc0a0f768df4d044744732348f09a47db97a6286c2de1d565e5766212a1ea",
  },
  kanjidic2: {
    file: "kanjidic2.xml.gz",
    url: "http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz",
    /** `database_version` 2026-281 in the file's header. */
    created: "2026-10-08",
    bytes: 1488582,
    sha256: "5fc25740c21180e0c2983d3ed546a8009d7891d9dceb4714cd36dd528be2bb58",
  },
};

async function ensureFile(root, pin) {
  const path = join(root, pin.file);
  if (!existsSync(path)) {
    console.log(`Downloading ${pin.file}…`);
    const res = await fetch(pin.url);
    if (!res.ok) throw new Error(`GET ${pin.url} → ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  const data = readFileSync(path);
  const sha = createHash("sha256").update(data).digest("hex");
  if (statSync(path).size !== pin.bytes || sha !== pin.sha256)
    throw new Error(
      `${path} is not the pinned ${pin.file} (expected ${pin.bytes} bytes and sha256 ${pin.sha256}, got ${statSync(path).size} and ${sha}). EDRDG overwrites it daily: restore the pinned copy, or bump the pin in scripts/lib/jmdict.mjs and re-run every data: script.`,
    );
  return data;
}

/** Reads both pinned files from `root` (downloading a missing one, then
 *  checking its size and checksum) and returns their text. */
export async function ensureJmdictFiles(root) {
  const [jmdict, kanjidic2] = await Promise.all([
    ensureFile(root, JMDICT_SOURCE.jmdict),
    ensureFile(root, JMDICT_SOURCE.kanjidic2),
  ]);
  return {
    jmdict: gunzipSync(jmdict).toString("utf8"),
    kanjidic2: gunzipSync(kanjidic2).toString("utf8"),
  };
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

const XML_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** Decodes the five predefined entities and numeric references. */
function unescapeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, name) => {
    if (name[0] === "#")
      return String.fromCodePoint(
        name[1].toLowerCase() === "x"
          ? parseInt(name.slice(2), 16)
          : Number(name.slice(1)),
      );
    return XML_ENTITIES[name] ?? m;
  });
}

/** Every `<tag …>text</tag>` in `xml`, as `{ attrs, text }`. */
function elements(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  for (const m of xml.matchAll(re)) out.push({ attrs: m[1] ?? "", text: m[2] });
  return out;
}

const attr = (attrs, name) =>
  attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

/**
 * JMdict as a model: `entries` by sequence number, and the sequence numbers
 * each written form and each reading belongs to. Tags are the descriptions
 * the file's own DOCTYPE gives them (`&n;` is "noun (common) (futsuumeishi)").
 * A sense with no part of speech has the previous sense's, as JMdict says.
 */
export function parseJmdict(xml) {
  const entities = {};
  for (const m of xml.matchAll(/<!ENTITY ([\w-]+) "([^"]*)">/g))
    entities[m[1]] = unescapeXml(m[2]);
  const tag = (text) => {
    const m = /^&([\w-]+);$/.exec(text.trim());
    if (!m) return unescapeXml(text);
    if (!(m[1] in entities))
      throw new Error(`JMdict entity &${m[1]}; undefined`);
    return entities[m[1]];
  };

  const entries = new Map();
  const byKanji = new Map();
  const byKana = new Map();
  const index = (map, form, id) => {
    const ids = map.get(form);
    if (!ids) map.set(form, [id]);
    else if (!ids.includes(id)) ids.push(id);
  };
  for (const [, body] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const idseq = Number(elements(body, "ent_seq")[0].text);
    const priority = {};
    const info = {};
    const forms = (tagName, formTag, priTag, infTag) =>
      elements(body, tagName).map(({ text }) => {
        const form = unescapeXml(elements(text, formTag)[0].text);
        for (const [store, name] of [
          [priority, priTag],
          [info, infTag],
        ]) {
          const tags = elements(text, name).map((e) =>
            name.endsWith("pri") ? e.text : tag(e.text),
          );
          if (tags.length) (store[form] ??= []).push(...tags);
        }
        return form;
      });
    const kanji = forms("k_ele", "keb", "ke_pri", "ke_inf");
    const readings = forms("r_ele", "reb", "re_pri", "re_inf");
    let pos = [];
    const senses = elements(body, "sense").map(({ text }) => {
      const own = elements(text, "pos").map((e) => tag(e.text));
      if (own.length) pos = own;
      const misc = elements(text, "misc").map((e) => tag(e.text));
      const field = elements(text, "field").map((e) => tag(e.text));
      const dialect = elements(text, "dial").map((e) => tag(e.text));
      const loan = elements(text, "lsource").map(({ attrs, text: t }) => ({
        lang: attr(attrs, "xml:lang") ?? "eng",
        ...(t ? { text: unescapeXml(t) } : {}),
        ...(attr(attrs, "ls_type") === "part" ? { partial: true } : {}),
        ...(attr(attrs, "ls_wasei") === "y" ? { wasei: true } : {}),
      }));
      return {
        pos,
        glosses: elements(text, "gloss").map((e) => unescapeXml(e.text)),
        ...(misc.length ? { misc } : {}),
        ...(field.length ? { field } : {}),
        ...(dialect.length ? { dialect } : {}),
        ...(loan.length ? { loan } : {}),
      };
    });
    entries.set(idseq, { idseq, kanji, readings, priority, info, senses });
    for (const k of kanji) index(byKanji, k, idseq);
    for (const r of readings) index(byKana, r, idseq);
  }
  return { entries, byKanji, byKana };
}

/** KANJIDIC2 as a map from character to `{ strokeCount, grade?, freq?, on,
 *  kun, meanings }`: the readings and English meanings in the file's order. */
export function parseKanjidic(xml) {
  const out = new Map();
  for (const { text: body } of elements(xml, "character")) {
    const literal = elements(body, "literal")[0].text;
    const on = [];
    const kun = [];
    const meanings = [];
    for (const { text: group } of elements(body, "rmgroup")) {
      for (const { attrs, text } of elements(group, "reading")) {
        const type = attr(attrs, "r_type");
        if (type === "ja_on") on.push(text);
        else if (type === "ja_kun") kun.push(text);
      }
      for (const { attrs, text } of elements(group, "meaning"))
        if (!attr(attrs, "m_lang")) meanings.push(unescapeXml(text));
    }
    const misc = elements(body, "misc")[0]?.text ?? "";
    const grade = elements(misc, "grade")[0]?.text;
    const freq = elements(misc, "freq")[0]?.text;
    out.set(literal, {
      strokeCount: Number(elements(misc, "stroke_count")[0].text),
      // KANJIDIC2's school grade (1–6 taught in elementary school, 8 the
      // rest of the jōyō list, 9–10 name kanji) and its rank by newspaper
      // frequency (1–2500); either is left out when KANJIDIC2 has none.
      ...(grade ? { grade: Number(grade) } : {}),
      ...(freq ? { freq: Number(freq) } : {}),
      on,
      kun,
      meanings,
    });
  }
  return out;
}

/** Opens JMdict and KANJIDIC2 (the text ensureJmdictFiles returns) and gives
 *  the lookup surface the builders use: word/reading/kanji queries by written
 *  form + reading. */
export function openDictionary({ jmdict, kanjidic2 }) {
  const { entries, byKanji, byKana } = parseJmdict(jmdict);
  const characters = parseKanjidic(kanjidic2);
  const idsOf = (map, form) => map.get(form) ?? [];

  /** The entry as the snapshots keep it. Every tag is JMdict's own, verbatim;
   *  a key is left out when it has nothing, so an entry only grows where
   *  JMdict says something. `priority` holds the ke_pri / re_pri codes of each
   *  spelling and reading (ichi1, news1, nf05…), `info` its ke_inf / re_inf
   *  notes (ateji, irregular kanji usage…), and a sense's `misc` its misc tags
   *  (abbreviation, archaism, register…), `field` its field of application
   *  (medicine, computing…), `dialect` its dialect (Kansai-ben…) and `loan`
   *  the language it was borrowed from (`wasei` for a coinage made in Japan). */
  function entry(idseq) {
    const e = entries.get(idseq);
    return {
      idseq,
      kanji: e.kanji,
      readings: e.readings,
      ...(Object.keys(e.priority).length ? { priority: e.priority } : {}),
      ...(Object.keys(e.info).length ? { info: e.info } : {}),
      senses: e.senses,
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
      const withKana = new Set(idsOf(byKana, kana));
      const ids = KANJI_RE.test(term)
        ? idsOf(byKanji, term).filter((id) => withKana.has(id))
        : [...withKana].filter(
            (id) =>
              // kana-only words: prefer entries not written with kanji at all,
              // falling back to any entry with this reading
              entries.get(id).kanji.length === 0,
          );
      // A kana-only list word is often the kana spelling of a kanji headword
      // JMdict marks "usually written using kana alone" (トン is 屯/噸/瓲,
      // これ is 此れ/是, コップ is 洋杯) — the real word — while the kana-only
      // entries that share the reading are unrelated homographs (トン = a
      // Morse-code dot, これ = "hey!", コップ = "cop"). Both belong in the
      // evidence, otherwise a word's own meaning has nothing to be checked
      // against.
      if (!KANJI_RE.test(term) && ids.length > 0) {
        for (const id of withKana) {
          if (ids.includes(id)) continue;
          const usuallyKana = entries
            .get(id)
            .senses.some((sense) =>
              (sense.misc ?? []).some((m) =>
                /usually written using kana/.test(m),
              ),
            );
          if (usuallyKana) ids.push(id);
        }
      }
      const chosen =
        ids.length > 0 || KANJI_RE.test(term) ? ids : [...withKana];
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
      return idsOf(byKanji, word).length > 0 || idsOf(byKana, word).length > 0;
    },
    /** Every reading of one JMdict entry, by its sequence number. */
    readingsOfEntry(idseq) {
      return entries.get(idseq)?.readings ?? [];
    },
    /** All JMdict readings for a written form. */
    readingsOf(surface) {
      const out = new Set();
      for (const id of idsOf(byKanji, surface))
        for (const r of entries.get(id).readings) out.add(r);
      return [...out];
    },
    kanji(char) {
      return characters.get(char) ?? null;
    },
  };
}
