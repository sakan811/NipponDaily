/**
 * What the reference builders (scripts/build-n5-reference.mjs,
 * scripts/build-jlpt-reference.mjs) and the content tests (test/content/) know
 * about the elzup/jlpt-word-list CSVs: how a row is parsed, which of its
 * readings/glosses are corrected, how a word listed at several levels is
 * deduplicated, and the gloss-vs-JMdict cross-check. The CSVs themselves are
 * pinned in scripts/word-list-source.mjs.
 */

// --- CSV parsing (elzup/jlpt-word-list uses RFC4180-style quoted fields) ---

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 && r.some((cell) => cell.trim()));
}

// --- Meaning cross-check (elzup CSV gloss vs. JMdict's own gloss) ---

const MEANING_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "are",
  "be",
  "was",
  "were",
  "and",
  "or",
  "for",
  "as",
  "by",
  "with",
  "from",
  "one",
  "ones",
  "also",
  "etc",
  "used",
  "use",
  "something",
  "someone",
  "thing",
  "things",
  "polite",
  "casual",
  "formal",
  "informal",
  "especially",
  "particle",
  "suffix",
  "prefix",
  "noun",
  "verb",
  "adjective",
  "adverb",
]);

function significantWords(text) {
  return new Set(
    (text ?? "")
      .toLowerCase()
      .replace(/[()~,;./]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !MEANING_STOPWORDS.has(w)),
  );
}

// Common English word-pairs that a mistranslation is prone to swap —
// this is what actually caught あちら's "this way" vs. the correct "that
// way" (see VOCAB_MEANING_OVERRIDES above). Deliberately narrow: a plain
// "these two glosses don't share any words" check is far noisier (~11% of
// the pool, mostly harmless synonyms like "shoe" vs "shoes"), so it isn't
// worth running as a default warning — see SEED_VERBOSE_MEANING_CHECK below.
const MEANING_CONTRAST_PAIRS = [
  ["this", "that"],
  ["here", "there"],
  ["near", "far"],
  ["before", "after"],
  ["inside", "outside"],
  ["come", "go"],
  ["give", "receive"],
  ["buy", "sell"],
  ["arrive", "leave"],
  ["open", "close"],
  ["big", "small"],
  ["yes", "no"],
  ["left", "right"],
  ["above", "below"],
  ["early", "late"],
  ["first", "last"],
  ["push", "pull"],
  ["borrow", "lend"],
  ["up", "down"],
  ["hot", "cold"],
  ["male", "female"],
];

/** Returns e.g. "this <-> that" if the two glosses look like a swapped antonym pair, else null. */
function findReversedMeaning(csvMeaning, jmdictMeaning) {
  const csvWords = significantWords(csvMeaning);
  const jmdictWords = significantWords(jmdictMeaning);
  for (const [a, b] of MEANING_CONTRAST_PAIRS) {
    if (
      csvWords.has(a) &&
      jmdictWords.has(b) &&
      !csvWords.has(b) &&
      !jmdictWords.has(a)
    ) {
      return `${a} <-> ${b}`;
    }
    if (
      csvWords.has(b) &&
      jmdictWords.has(a) &&
      !csvWords.has(a) &&
      !jmdictWords.has(b)
    ) {
      return `${b} <-> ${a}`;
    }
  }
  return null;
}

/**
 * Cross-checks one assembled vocab entry's CSV-sourced meaning against
 * JMdict's own gloss for the same term+reading (skipped if JMdict has no
 * entry, or its entry is for a different reading — see the 外/そと vs
 * 外/ほか homograph collision this guards against). Returns a warning
 * object or null.
 */
function checkMeaning(entry, jmdictEntry) {
  if (!jmdictEntry || jmdictEntry.kana !== entry.kana) return null;
  const jmdictMeaning =
    jmdictEntry.allGlosses?.join("; ") || jmdictEntry.meaning;
  const pair = findReversedMeaning(entry.meaning, jmdictMeaning);
  if (!pair) return null;
  return {
    term: entry.term,
    kana: entry.kana,
    pair,
    csvMeaning: entry.meaning,
    jmdictMeaning,
  };
}

/**
 * Corrections for glosses in elzup/jlpt-word-list that are simply wrong,
 * verified against JMdict's own entry for the same headword+reading. Kept
 * here (rather than patched upstream) so every reference rebuild applies
 * them automatically instead of silently reintroducing the bad gloss.
 *
 * Key is `term kana`, not just `term`, since a few N5-tagged rows
 * share a term but not a reading (e.g. 外/そと "outside" vs 外/ほか
 * "other") — keying on the pair avoids a correction meant for one leaking
 * onto the other.
 */
const VOCAB_MEANING_OVERRIDES = {
  // Source list has this backwards as "this way (polite)". あちら is the
  // あ-series (far from both speaker and listener) direction word, i.e.
  // the polite counterpart of あっち — it means "that way over there".
  "あちら あちら": "that way, over there (polite)",
  // See VOCAB_READING_OVERRIDES below for why this row exists at all —
  // matches the "N thing(s)" phrasing the source list already uses for
  // the rest of the native-counting set (一つ "one thing", 二つ "two
  // things", …).
  "十 (〜を) とお": "ten things",
  // Source list has this backwards as "this is all". 以上 has no
  // demonstrative "this" sense at all — its sentence-final usage (closing
  // a statement/report) is "that's all; that is the end", per JMdict.
  "以上 いじょう": "more than; that's all",
};

/**
 * Same idea as VOCAB_MEANING_OVERRIDES, but for the reading itself: the
 * source list stores this row's reading as "(〜を) とお", bundling in a
 * usage note (object-marking を) that belongs in a grammar note, not the
 * reading field — every other reading in the list is a bare reading with
 * no such annotation. とお is 十's native ("kun'yomi") reading, used only
 * for the native-counting sense — じゅう is the separate, far more common
 * Sino-Japanese reading and gets its own N5-tagged row already.
 */
const VOCAB_READING_OVERRIDES = {
  "十 (〜を) とお": "とお",
};

/**
 * Parses one level's elzup/jlpt-word-list CSV into entries tagged with that
 * level, applying the reading/meaning overrides above. `listReading`/
 * `listMeaning` keep the source list's own values so the reference
 * snapshots (scripts/build-n5-reference.mjs, scripts/build-jlpt-reference.mjs)
 * can show what each override corrected.
 *
 * Every row in the file belongs to `level` — n3.csv/n2.csv don't carry a
 * reliable per-row "JLPT_N3"/"JLPT_N2" tag (see word-list-source.mjs), so
 * this trusts the file itself rather than filtering by tag. n5.csv's own
 * 718 rows are already 100% JLPT_N5-tagged (verified against the pinned
 * commit), so dropping the old per-row tag filter doesn't change N5's
 * output at all.
 */
function parseJlptCsv(text, level) {
  const rows = parseCsv(text);
  const [header, ...dataRows] = rows;
  const idx = {
    expression: header.indexOf("expression"),
    reading: header.indexOf("reading"),
    meaning: header.indexOf("meaning"),
  };

  const entries = [];
  for (const row of dataRows) {
    const expression = (row[idx.expression] ?? "").split(";")[0].trim();
    const rawReading = (row[idx.reading] ?? "").split(";")[0].trim();
    const rawMeaning = (row[idx.meaning] ?? "").trim();
    const overrideKey = `${expression} ${rawReading}`;
    const reading = VOCAB_READING_OVERRIDES[overrideKey] ?? rawReading;
    const meaning = VOCAB_MEANING_OVERRIDES[overrideKey] ?? rawMeaning;
    if (!expression || !reading || !meaning) continue;

    entries.push({
      term: expression,
      kana: reading,
      meaning,
      listReading: rawReading,
      listMeaning: rawMeaning,
      jlptLevel: level,
    });
  }
  return entries;
}

/** Kept for existing call sites (scripts/build-n5-reference.mjs, tests) —
 *  identical to parseJlptCsv(text, "N5"). */
function parseN5Csv(text) {
  return parseJlptCsv(text, "N5");
}

function slugify(term, seen) {
  const base = term.replace(/[^\p{L}\p{N}]/gu, "");
  let id = base;
  let n = 2;
  while (seen.has(id)) {
    id = `${base}-${n}`;
    n++;
  }
  seen.add(id);
  return id;
}

/**
 * elzup/jlpt-word-list's four per-level CSVs are curated independently, so
 * the exact same word (same written form AND same reading) occasionally
 * ends up listed at more than one level — e.g. 在る/ある at both N5 and N3,
 * そう/そう at both N5 and N4. A shared kanji spelling with a *different*
 * reading (開く read あく at N5 vs ひらく at N4, 上 read うえ at N5 vs
 * じょう/うわ/かみ at N3) is a different word taught separately on purpose
 * and must NOT be touched here — only an exact term+reading match counts.
 *
 * Call once per level in easiest-to-hardest order (JLPT_LEVELS), threading
 * the same `seenByKey` Map through every call: a duplicate is dropped from
 * every level except the first (easiest) one that has it, so "the lower
 * JLPT level keeps it."
 */
function dedupeAcrossLevels(entries, level, seenByKey) {
  const kept = [];
  const dropped = [];
  for (const entry of entries) {
    const key = `${entry.term} ${entry.kana}`;
    const ownerLevel = seenByKey.get(key);
    if (ownerLevel && ownerLevel !== level) {
      dropped.push({ ...entry, keptAtLevel: ownerLevel });
      continue;
    }
    if (!ownerLevel) seenByKey.set(key, level);
    kept.push(entry);
  }
  return { kept, dropped };
}

export {
  VOCAB_MEANING_OVERRIDES,
  VOCAB_READING_OVERRIDES,
  findReversedMeaning,
  checkMeaning,
  parseCsv,
  parseN5Csv,
  parseJlptCsv,
  slugify,
  dedupeAcrossLevels,
};
