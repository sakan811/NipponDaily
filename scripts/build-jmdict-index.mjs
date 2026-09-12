#!/usr/bin/env node
/**
 * Regenerates server/data/jmdict-index.json.gz — a compact surface-form to
 * meaning lookup table used by server/utils/dictionary.ts to fill in
 * meanings for tokenizer-derived words that aren't in a lesson's
 * agent-authored vocabList (see server/utils/tokenizer.ts).
 *
 * Source: JMdict (via the jmdict-simplified project's pre-parsed English
 * release), https://github.com/scriptin/jmdict-simplified — JMdict is
 * property of the Electronic Dictionary Research and Development Group
 * (https://www.edrdg.org/), used under its licence.
 *
 * JMdict is static reference data — this only needs to be re-run to pick up
 * a newer JMdict release, not as part of routine development.
 *
 * Usage: node scripts/build-jmdict-index.mjs
 */
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { execFile } from "node:child_process";
import { mkdtemp, rm, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const gzip = promisify(zlib.gzip);

const RELEASES_API =
  "https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest";
const MAX_CANDIDATES_PER_SURFACE = 4;
const OUTPUT_PATH = path.join(
  import.meta.dirname,
  "..",
  "server/data/jmdict-index.json.gz",
);

const firstEnglishGloss = (senses) => {
  for (const sense of senses) {
    const gloss = (sense.gloss ?? []).find(
      (g) => g.lang === "eng" && g.text,
    );
    if (gloss) return gloss.text;
  }
  return undefined;
};

const buildIndex = (words) => {
  const index = new Map();
  for (const word of words) {
    const meaning = firstEnglishGloss(word.sense ?? []);
    if (!meaning) continue;

    const kanjiList = word.kanji ?? [];
    const kanaList = word.kana ?? [];
    const primaryKana =
      kanaList.find((k) => k.common)?.text ?? kanaList[0]?.text;
    if (!primaryKana) continue;
    const isCommon =
      kanjiList.some((k) => k.common) || kanaList.some((k) => k.common);

    const surfaces = kanjiList.length
      ? kanjiList.map((k) => k.text)
      : kanaList.map((k) => k.text);

    for (const surface of new Set(surfaces)) {
      const candidates = index.get(surface) ?? [];
      candidates.push([primaryKana, meaning, isCommon ? 1 : 0]);
      index.set(surface, candidates);
    }
  }

  for (const [surface, candidates] of index) {
    candidates.sort((a, b) => b[2] - a[2]);
    index.set(surface, candidates.slice(0, MAX_CANDIDATES_PER_SURFACE));
  }

  return index;
};

async function main() {
  console.log("Fetching latest jmdict-simplified release metadata...");
  const release = await fetch(RELEASES_API).then((r) => r.json());
  const asset = release.assets.find(
    (a) => /^jmdict-eng-\d.*\.json\.tgz$/.test(a.name),
  );
  if (!asset) throw new Error("Could not find jmdict-eng .json.tgz asset");
  console.log(`Downloading ${asset.name} (${(asset.size / 1e6).toFixed(1)} MB)...`);

  const tmpDir = await mkdtemp(path.join(tmpdir(), "jmdict-"));
  const tgzPath = path.join(tmpDir, asset.name);
  const response = await fetch(asset.browser_download_url);
  await pipeline(response.body, createWriteStream(tgzPath));

  console.log("Extracting...");
  await execFileAsync("tar", ["xzf", tgzPath, "-C", tmpDir]);
  const files = await readdir(tmpDir);
  const jsonFile = files.find((f) => f.endsWith(".json"));
  if (!jsonFile) throw new Error("Extracted archive did not contain a .json file");

  console.log("Parsing JMdict JSON...");
  const data = JSON.parse(await readFile(path.join(tmpDir, jsonFile), "utf-8"));
  console.log(`Loaded ${data.words.length} JMdict entries`);

  const index = buildIndex(data.words);
  console.log(`Built lookup table with ${index.size} surface forms`);

  const raw = JSON.stringify(Object.fromEntries(index));
  const compressed = await gzip(raw, { level: 9 });
  await writeFile(OUTPUT_PATH, compressed);
  console.log(
    `Wrote ${OUTPUT_PATH} (${(compressed.length / 1e6).toFixed(2)} MB gzipped, ${(raw.length / 1e6).toFixed(1)} MB raw)`,
  );

  await rm(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
