#!/usr/bin/env node
/**
 * Seeds NipponDaily's Redis store with the full N5 learning pool: hiragana,
 * katakana, N5 kanji, and N5 vocabulary. This is static reference data — run
 * this once to bootstrap a new environment, or re-run any time to pick up a
 * newer JMdict/KANJIDIC2 release. Idempotent (safe to re-run: every record
 * gets a deterministic id and is written with SET/SADD, never appended).
 *
 * Sources:
 *  - N5 word list: elzup/jlpt-word-list (MIT), src/n5.csv — digitizes the
 *    community-standard N5 list originally compiled at tanos.co.uk.
 *  - Full dictionary entries + part of speech: JMdict, via the
 *    jmdict-simplified project's pre-parsed English release,
 *    https://github.com/scriptin/jmdict-simplified
 *  - Kanji data (on'yomi/kun'yomi/strokes/meanings): KANJIDIC2, via the same
 *    jmdict-simplified release's kanjidic2-en asset.
 *  - Hiragana/katakana: hardcoded below (fixed, unchanging syllabaries — not
 *    dictionary content, nothing to fetch).
 *
 * JMdict and KANJIDIC2 are property of the Electronic Dictionary Research
 * and Development Group (https://www.edrdg.org/), used under its licence
 * (CC BY-SA 4.0) — see the "Data & Attribution" section of
 * app/pages/docs/architecture.vue.
 *
 * Writes the same key schema server/services/n5-data.ts reads (n5:kanji:*,
 * n5:vocab:*, n5:hiragana:*, n5:katakana:* + their *_ids sets) — the two
 * files don't import each other since this runs as a bare `node` process
 * outside the Nuxt context.
 *
 * Usage: pnpm seed:n5   (wraps: doppler run -- node scripts/seed-n5-data.mjs)
 */
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { execFile } from "node:child_process";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { Redis } from "@upstash/redis";
import { toRomaji } from "wanakana";

const execFileAsync = promisify(execFile);

const RELEASES_API =
  "https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest";
const N5_CSV_URL =
  "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/n5.csv";
const KANJI_COUNT_SANITY_RANGE = [80, 150];

// --- Static kana seed data (46-symbol gojūon + dakuten/handakuten/small kana per script) ---

const HIRAGANA_CHARS = [
  ..."あいうえお かきくけこ がぎぐげご さしすせそ ざじずぜぞ たちつてと だぢづでど なにぬねの はひふへほ ばびぶべぼ ぱぴぷぺぽ まみむめも やゆよ らりるれろ わをん".replace(
    /\s/g,
    "",
  ),
  "ゃ",
  "ゅ",
  "ょ",
  "っ",
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
];

const KATAKANA_CHARS = [
  ..."アイウエオ カキクケコ ガギグゲゴ サシスセソ ザジズゼゾ タチツテト ダヂヅデド ナニヌネノ ハヒフヘホ バビブベボ パピプペポ マミムメモ ヤユヨ ラリルレロ ワヲン".replace(
    /\s/g,
    "",
  ),
  "ャ",
  "ュ",
  "ョ",
  "ッ",
  "ァ",
  "ィ",
  "ゥ",
  "ェ",
  "ォ",
];

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

// --- JMdict-simplified / KANJIDIC2 fetch + extract ---

async function downloadReleaseAsset(assetNamePattern) {
  console.log(`Fetching latest jmdict-simplified release metadata...`);
  const release = await fetch(RELEASES_API).then((r) => r.json());
  const asset = release.assets?.find((a) => assetNamePattern.test(a.name));
  if (!asset) {
    throw new Error(
      `Could not find an asset matching ${assetNamePattern} in the latest jmdict-simplified release`,
    );
  }
  console.log(
    `Downloading ${asset.name} (${(asset.size / 1e6).toFixed(1)} MB)...`,
  );

  const tmpDir = await mkdtemp(path.join(tmpdir(), "jmdict-"));
  const tgzPath = path.join(tmpDir, asset.name);
  const response = await fetch(asset.browser_download_url);
  await pipeline(response.body, createWriteStream(tgzPath));

  await execFileAsync("tar", ["xzf", tgzPath, "-C", tmpDir]);
  const files = await readdir(tmpDir);
  const jsonFile = files.find((f) => f.endsWith(".json"));
  if (!jsonFile) {
    throw new Error(
      `Extracted archive for ${asset.name} did not contain a .json file`,
    );
  }

  const data = JSON.parse(await readFile(path.join(tmpDir, jsonFile), "utf-8"));
  await rm(tmpDir, { recursive: true, force: true });
  return data;
}

function firstEnglishGloss(senses) {
  for (const sense of senses ?? []) {
    const gloss = (sense.gloss ?? []).find((g) => g.lang === "eng" && g.text);
    if (gloss) return gloss.text;
  }
  return undefined;
}

function firstPartOfSpeech(senses, tagsMap) {
  for (const sense of senses ?? []) {
    const code = (sense.partOfSpeech ?? [])[0];
    if (code) return tagsMap?.[code] ?? code;
  }
  return undefined;
}

function allEnglishGlosses(senses) {
  const out = [];
  for (const sense of senses ?? []) {
    for (const gloss of sense.gloss ?? []) {
      if (gloss.lang === "eng" && gloss.text) out.push(gloss.text);
    }
  }
  return out;
}

/** surface form -> { kana, meaning, allGlosses, partOfSpeech, common } */
function buildJmdictIndex(jmdictData) {
  const index = new Map();
  const tagsMap = jmdictData.tags ?? {};
  for (const word of jmdictData.words ?? []) {
    const meaning = firstEnglishGloss(word.sense);
    if (!meaning) continue;

    const kanjiList = word.kanji ?? [];
    const kanaList = word.kana ?? [];
    const primaryKana =
      kanaList.find((k) => k.common)?.text ?? kanaList[0]?.text;
    if (!primaryKana) continue;

    const partOfSpeech = firstPartOfSpeech(word.sense, tagsMap);
    const allGlosses = allEnglishGlosses(word.sense);
    // Union of kanji AND kana surfaces (not kanji-only-if-present): several
    // N5 words are always written in kana (あちら, そちら, …) but JMdict
    // still records a formal kanji form (彼方, etc.), which meant these
    // never matched anything under the old kanji-preferred lookup. Each
    // surface carries whether ITS OWN kanji/kana element is JMdict-flagged
    // "common", so a common N5 word isn't shadowed by an unrelated, far
    // rarer word that happens to share the same surface (e.g. この is the
    // standard reading of 此の "this", but also an obscure reading of 九
    // "nine" — a plain first-match-wins index would pick whichever of the
    // two happens to appear first in JMdict's entry order).
    const surfaceEntries = [
      ...kanjiList.map((k) => ({ text: k.text, common: !!k.common })),
      ...kanaList.map((k) => ({ text: k.text, common: !!k.common })),
    ];

    const seenOnThisWord = new Set();
    for (const { text: surface, common } of surfaceEntries) {
      if (seenOnThisWord.has(surface)) continue;
      seenOnThisWord.add(surface);

      const existing = index.get(surface);
      if (!existing || (common && !existing.common)) {
        index.set(surface, {
          kana: primaryKana,
          meaning,
          allGlosses,
          partOfSpeech,
          common,
        });
      }
    }
  }
  return index;
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
 * Opt-in (SEED_VERBOSE_MEANING_CHECK=1), much noisier companion to
 * checkMeaning(): every entry whose CSV gloss shares *no* significant word
 * at all with JMdict's gloss. About 1 in 9 of the pool trips this (mostly
 * harmless synonym drift, e.g. "shoe" vs. "shoes", "car" vs. "automobile"),
 * so it's for an occasional manual audit, not something to read every
 * reseed.
 */
function logLowConfidenceMeaningDrift(n5Entries, jmdictIndex) {
  const drifted = [];
  for (const entry of n5Entries) {
    const jmdict = jmdictIndex.get(entry.term);
    if (!jmdict || jmdict.kana !== entry.kana) continue;
    const jmdictMeaning = jmdict.allGlosses?.join("; ") || jmdict.meaning;
    const csvWords = significantWords(entry.meaning);
    const jmdictWords = significantWords(jmdictMeaning);
    if (csvWords.size === 0 || jmdictWords.size === 0) continue;
    const overlaps = [...csvWords].some((w) => jmdictWords.has(w));
    if (!overlaps) {
      drifted.push({
        term: entry.term,
        kana: entry.kana,
        csvMeaning: entry.meaning,
        jmdictMeaning,
      });
    }
  }
  if (drifted.length === 0) return;
  console.warn(
    `\n(verbose) ${drifted.length} gloss(es) share no word with JMdict's — mostly synonyms, spot-check only:`,
  );
  for (const d of drifted) {
    console.warn(
      `  ${d.term} (${d.kana})  CSV: "${d.csvMeaning}"  |  JMdict: "${d.jmdictMeaning}"`,
    );
  }
}

/** kanji character -> { onyomi, kunyomi, meanings, strokeCount } */
function buildKanjidicIndex(kanjidicData) {
  const index = new Map();
  for (const char of kanjidicData.characters ?? []) {
    const literal = char.literal;
    if (!literal) continue;

    const groups = char.readingMeaning?.groups ?? [];
    const onyomi = [];
    const kunyomi = [];
    const meanings = [];
    for (const group of groups) {
      for (const reading of group.readings ?? []) {
        if (reading.type === "ja_on") onyomi.push(reading.value);
        else if (reading.type === "ja_kun") kunyomi.push(reading.value);
      }
      for (const meaning of group.meanings ?? []) {
        // kanjidic2's jmdict-simplified export has used both "en" and "eng"
        // as the English language code across releases — accept either.
        if (!meaning.lang || meaning.lang === "en" || meaning.lang === "eng") {
          meanings.push(meaning.value);
        }
      }
    }

    const strokeCount = char.misc?.strokeCounts?.[0] ?? 0;
    index.set(literal, { onyomi, kunyomi, meanings, strokeCount });
  }
  return index;
}

// --- N5 word list ---

/**
 * Corrections for glosses in elzup/jlpt-word-list that are simply wrong,
 * verified against JMdict's own entry for the same headword+reading. Kept
 * here (rather than patched upstream) so every re-seed applies them
 * automatically instead of silently reintroducing the bad gloss.
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
};

/**
 * Same idea as VOCAB_MEANING_OVERRIDES, but for the reading itself: the
 * source list stores this row's reading as "(〜を) とお", bundling in a
 * usage note (object-marking を) that belongs in a grammar note, not the
 * reading field — every other reading in the list is a bare reading with
 * no such annotation. とお is 十's native ("kun'yomi") reading, used only
 * for the native-counting sense (see app/data/vocab-guide.ts's "numbers"
 * cluster) — じゅう is the separate, far more common Sino-Japanese
 * reading and gets its own N5-tagged row already.
 */
const VOCAB_READING_OVERRIDES = {
  "十 (〜を) とお": "とお",
};

/**
 * Same idea as VOCAB_MEANING_OVERRIDES, but for partOfSpeech: these three
 * N5 terms share their surface with a far rarer, unrelated JMdict entry
 * (この is also an obscure reading of 九 "nine"; どの of 殿, an honorific
 * suffix; 頭 of the counter for large animals). buildJmdictIndex()'s
 * common-flag preference should already resolve these, but they're pinned
 * explicitly too since a wrong grammar tag here mis-sorts the word into the
 * wrong lesson category on the vocab page (verified individually against
 * JMdict — see app/data/vocab-guide.ts's POS_TERM_OVERRIDES for the
 * matching client-side safety net).
 */
const VOCAB_POS_OVERRIDES = {
  "この この": "pre-noun adjectival (rentaishi)",
  "どの どの": "pre-noun adjectival (rentaishi)",
  "頭 あたま": "noun (common) (futsuumeishi)",
};

async function fetchN5List() {
  console.log(`Fetching N5 word list from elzup/jlpt-word-list...`);
  const text = await fetch(N5_CSV_URL).then((r) => r.text());
  const rows = parseCsv(text);
  const [header, ...dataRows] = rows;
  const idx = {
    expression: header.indexOf("expression"),
    reading: header.indexOf("reading"),
    meaning: header.indexOf("meaning"),
    tags: header.indexOf("tags"),
  };

  const entries = [];
  for (const row of dataRows) {
    const tags = row[idx.tags] ?? "";
    if (!/\bJLPT_N5\b/.test(tags)) continue;

    const expression = (row[idx.expression] ?? "").split(";")[0].trim();
    const rawReading = (row[idx.reading] ?? "").split(";")[0].trim();
    const rawMeaning = (row[idx.meaning] ?? "").trim();
    const overrideKey = `${expression} ${rawReading}`;
    const reading = VOCAB_READING_OVERRIDES[overrideKey] ?? rawReading;
    const meaning = VOCAB_MEANING_OVERRIDES[overrideKey] ?? rawMeaning;
    if (!expression || !reading || !meaning) continue;

    entries.push({ term: expression, kana: reading, meaning });
  }
  return entries;
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

// --- Assembly ---

function assembleVocab(n5Entries, jmdictIndex) {
  const seenIds = new Set();
  const meaningWarnings = [];
  const vocab = n5Entries.map((entry) => {
    const jmdict = jmdictIndex.get(entry.term);
    const kana = entry.kana;
    const warning = checkMeaning(entry, jmdict);
    if (warning) meaningWarnings.push(warning);
    const partOfSpeech =
      VOCAB_POS_OVERRIDES[`${entry.term} ${kana}`] ?? jmdict?.partOfSpeech;
    return {
      id: slugify(entry.term, seenIds),
      term: entry.term,
      kana,
      romaji: toRomaji(kana),
      meaning: entry.meaning,
      partOfSpeech,
      jlptLevel: "N5",
    };
  });
  return { vocab, meaningWarnings };
}

function deriveKanjiChars(vocab) {
  const chars = new Set();
  const kanjiRegex = /[一-鿿]/g;
  for (const v of vocab) {
    for (const match of v.term.match(kanjiRegex) ?? []) chars.add(match);
  }
  return [...chars];
}

function assembleKanji(kanjiChars, kanjidicIndex) {
  const kanji = [];
  const missing = [];
  for (const char of kanjiChars) {
    const info = kanjidicIndex.get(char);
    if (!info || info.meanings.length === 0) {
      missing.push(char);
      continue;
    }
    kanji.push({
      id: char,
      character: char,
      meanings: info.meanings,
      onyomi: info.onyomi,
      kunyomi: info.kunyomi,
      strokeCount: info.strokeCount,
      jlptLevel: "N5",
    });
  }
  if (missing.length > 0) {
    console.warn(
      `Warning: ${missing.length} kanji derived from N5 vocab had no KANJIDIC2 entry, skipped: ${missing.join(" ")}`,
    );
  }
  return kanji;
}

function assembleKana(chars, script) {
  return chars.map((char) => ({
    id: char,
    char,
    script,
    romaji: toRomaji(char),
  }));
}

// --- Redis write ---

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — run via `pnpm seed:n5` (doppler) or export them yourself.",
    );
  }
  return new Redis({ url, token });
}

async function writePool(redis, keyPrefix, idsKey, records) {
  if (records.length === 0) return;
  for (const record of records) {
    await redis.set(`${keyPrefix}${record.id}`, JSON.stringify(record));
  }
  await redis.sadd(idsKey, ...records.map((r) => r.id));
}

async function main() {
  const [jmdictData, kanjidicData, n5Entries] = await Promise.all([
    downloadReleaseAsset(/^jmdict-eng-\d.*\.json\.tgz$/),
    downloadReleaseAsset(/^kanjidic2-en-\d.*\.json\.tgz$/),
    fetchN5List(),
  ]);

  console.log(`Loaded ${n5Entries.length} N5-tagged word-list entries`);
  const jmdictIndex = buildJmdictIndex(jmdictData);
  const kanjidicIndex = buildKanjidicIndex(kanjidicData);

  const { vocab, meaningWarnings } = assembleVocab(n5Entries, jmdictIndex);
  if (meaningWarnings.length > 0) {
    console.warn(
      `\n⚠ ${meaningWarnings.length} vocab gloss(es) look like a reversed/swapped meaning vs. JMdict — verify before shipping:`,
    );
    for (const w of meaningWarnings) {
      console.warn(
        `  ${w.term} (${w.kana}) [${w.pair}]\n    CSV list: "${w.csvMeaning}"\n    JMdict:   "${w.jmdictMeaning}"`,
      );
    }
    console.warn(
      "  If genuinely wrong, add a correction to VOCAB_MEANING_OVERRIDES above.\n",
    );
  }
  if (process.env.SEED_VERBOSE_MEANING_CHECK === "1") {
    logLowConfidenceMeaningDrift(n5Entries, jmdictIndex);
  }

  const kanjiChars = deriveKanjiChars(vocab);
  const [lo, hi] = KANJI_COUNT_SANITY_RANGE;
  if (kanjiChars.length < lo || kanjiChars.length > hi) {
    console.warn(
      `Warning: derived ${kanjiChars.length} unique N5 kanji, outside the expected ~${lo}-${hi} range — check the N5 word list source.`,
    );
  }
  const kanji = assembleKanji(kanjiChars, kanjidicIndex);
  const hiragana = assembleKana(HIRAGANA_CHARS, "hiragana");
  const katakana = assembleKana(KATAKANA_CHARS, "katakana");

  console.log(
    `Assembled ${vocab.length} vocab, ${kanji.length} kanji, ${hiragana.length} hiragana, ${katakana.length} katakana`,
  );

  const redis = getRedisClient();
  await writePool(redis, "n5:vocab:", "n5:vocab_ids", vocab);
  await writePool(redis, "n5:kanji:", "n5:kanji_ids", kanji);
  await writePool(redis, "n5:hiragana:", "n5:hiragana_ids", hiragana);
  await writePool(redis, "n5:katakana:", "n5:katakana_ids", katakana);

  console.log("Done.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export {
  VOCAB_MEANING_OVERRIDES,
  VOCAB_READING_OVERRIDES,
  findReversedMeaning,
  checkMeaning,
};
