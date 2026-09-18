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

/** surface form -> { kana, meaning, partOfSpeech } */
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
    const surfaces = kanjiList.length
      ? kanjiList.map((k) => k.text)
      : kanaList.map((k) => k.text);

    for (const surface of new Set(surfaces)) {
      if (!index.has(surface)) {
        index.set(surface, { kana: primaryKana, meaning, partOfSpeech });
      }
    }
  }
  return index;
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
    const reading = (row[idx.reading] ?? "").split(";")[0].trim();
    const meaning = (row[idx.meaning] ?? "").trim();
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
  return n5Entries.map((entry) => {
    const jmdict = jmdictIndex.get(entry.term);
    const kana = entry.kana;
    return {
      id: slugify(entry.term, seenIds),
      term: entry.term,
      kana,
      romaji: toRomaji(kana),
      meaning: entry.meaning,
      partOfSpeech: jmdict?.partOfSpeech,
      jlptLevel: "N5",
    };
  });
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

  const vocab = assembleVocab(n5Entries, jmdictIndex);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
