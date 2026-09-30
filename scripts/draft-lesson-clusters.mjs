#!/usr/bin/env -S node --experimental-strip-types --no-warnings
/**
 * Authoring scaffold for a level's lesson content (`pnpm data:draft:clusters`).
 *
 * The expensive, error-prone part of authoring a level (see N3's
 * app/data/vocab-guide-n3.ts) is not typing prose — it is holding a
 * multi-thousand-word pool in your head while deciding what belongs together,
 * and trusting each word's reading/meaning enough to write a lesson about it.
 * A wrong reading or gloss taught confidently is worse than no lesson, so this
 * script front-loads the checking. It reads only the committed dictionary
 * snapshot (data/reference/<level>-reference.json — offline, deterministic,
 * same rule as the rest of data/reference) and writes a *small, batched*
 * evidence pack, so an author reads ~50 words at a time instead of the whole
 * multi-MB reference:
 *
 *   data/drafts/<level>/
 *     README.md           counts, the accuracy checklist, and the file index
 *     flags.md            READ FIRST — words not safe to teach as-is: not in
 *                         JMdict, reading JMdict doesn't attest, or a meaning
 *                         that disagrees with the glosses for that reading
 *     patterns.md         homophones (a classic wrong-kanji trap), candidate
 *                         transitive/intransitive pairs, affix/counter words
 *     words-NN-<bucket>.md  ≤ --size words per file, grouped by grammatical
 *                         bucket then by shared kanji: one line per word with
 *                         id, kana, JMdict-derived POS tags and the served
 *                         meaning (⚠ notes inline where the evidence disagrees)
 *
 * Words already taught by an authored cluster set (app/data/vocab-guide*.ts)
 * are left out by default, so re-running after each authored batch shows only
 * what is still to do — and prints "fully covered" for N5/N4/N3. Pass --all to
 * include them.
 *
 * Bucketing uses the SAME classifyPartOfSpeech() as the live /vocab guide, so
 * a draft group really does share one WORD_TYPE_GROUPS bucket end to end.
 * Nothing here is read by the app or CI; the output is gitignored scratch.
 * The gate that decides whether authored content ships is still test/content/.
 *
 * Usage: pnpm data:draft:clusters [level] [--size N] [--all]   (default: N2)
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyPartOfSpeech,
  WORD_TYPE_GROUPS,
} from "../app/data/vocab-guide.ts";
import {
  LEVELS,
  ROOT,
  coveredIds,
  describeWord,
  firstKanji,
  homophoneGroups,
  loadClusters,
  loadReference,
  toHiragana,
  transitivityPairs,
} from "./lib/authoring-evidence.mjs";

/** Words per evidence file — matches lessons.ts's MAX_WORDS_PER_LESSON scale,
 *  small enough to read in one sitting without the context bloating. */
export const DEFAULT_BATCH_SIZE = 50;

const POS_LABELS = Object.fromEntries(
  WORD_TYPE_GROUPS.map((g) => [g.key, g.label]),
);

/** `id` is the word's PoolVocab id — usually its term, but a homograph gets a
 *  "-2" suffix, so the id is shown whenever it differs from the term. */
const idOf = (v) => (v.id === v.term ? v.term : `${v.term} [id: ${v.id}]`);

function firstPos(vocab) {
  return vocab.jmdict?.[0]?.senses?.[0]?.pos?.[0];
}

/** One evidence line: term, kana, tags, served meaning, ⚠ notes. */
function wordLine(v) {
  const { tags, notes } = describeWord(v);
  const parts = [idOf(v), v.kana, tags.join(" ") || "-", v.meaning];
  const line = parts.join(" | ");
  return notes.length ? `${line}  ⚠ ${notes.join("; ")}` : line;
}

/** Splits a bucket's words into files of ~size words, keeping every group of
 *  words that share a leading kanji together (a kanji family is the natural
 *  seed of a lesson, so splitting one across files hides the link). */
function chunkByFamily(words, size) {
  const sorted = [...words].sort((a, b) => {
    const ka = firstKanji(a.term);
    const kb = firstKanji(b.term);
    if (ka !== kb) return ka === "" ? 1 : kb === "" ? -1 : ka < kb ? -1 : 1;
    return toHiragana(a.kana) < toHiragana(b.kana) ? -1 : 1;
  });
  const families = [];
  for (const w of sorted) {
    const k = firstKanji(w.term);
    const last = families[families.length - 1];
    if (k && last && last.kanji === k) last.words.push(w);
    else families.push({ kanji: k, words: [w] });
  }
  const chunks = [[]];
  for (const fam of families) {
    const cur = chunks[chunks.length - 1];
    if (cur.length > 0 && cur.length + fam.words.length > size) {
      chunks.push([...fam.words]);
    } else {
      cur.push(...fam.words);
    }
  }
  return chunks.filter((c) => c.length > 0);
}

function flagsMarkdown(level, reference, unresolved, ready) {
  const unattested = [];
  const unsupported = [];
  const partial = [];
  for (const v of ready) {
    const { support, notes } = describeWord(v);
    if (notes.some((n) => n.startsWith("reading not in JMdict"))) {
      unattested.push(v);
    }
    if (support.status === "unsupported") unsupported.push(v);
    else if (support.status === "partial") partial.push(v);
  }
  const fmt = (v) => `- ${wordLine(v)}`;
  return [
    `# ${level} — read before authoring`,
    "",
    "Do not write a lesson around any word below until its form/meaning is settled.",
    "Fix a wrong form or meaning in `shared/meanings.ts` (`VOCAB_FORM_CORRECTIONS` /",
    "`VOCAB_MEANING_ENRICHMENTS`), then re-run `pnpm data:reference:jlpt` and this script.",
    "",
    `## Not cleanly in JMdict — needs a VOCAB_FORM_CORRECTIONS entry (${unresolved.length})`,
    "",
    ...unresolved.map(
      (v) => `- \`${v.id}\` ${v.term} (${v.kana}) — “${v.meaning}”`,
    ),
    "",
    `## Reading JMdict does not attest (${unattested.length})`,
    "",
    ...unattested.map(fmt),
    "",
    `## Meaning disagrees with every gloss for its reading (${unsupported.length})`,
    "",
    "The source list often pairs one word's kana with a different word's gloss",
    "(盛り read さかり carrying もり's “helping, serving”). Check the JMdict glosses",
    "shown, then correct the meaning — never teach the served one on trust.",
    "",
    ...unsupported.map(fmt),
    "",
    `## Meaning partly unbacked (${partial.length})`,
    "",
    ...partial.map(fmt),
    "",
  ].join("\n");
}

function patternsMarkdown(level, ready) {
  const ids = new Set(ready.map((v) => v.id));
  const homophones = homophoneGroups(ready).filter(([, words]) =>
    words.every((w) => ids.has(w.id)),
  );
  const pairs = transitivityPairs(ready);
  const affixes = ready.filter((v) => /[～〜]/.test(v.term + v.kana));
  return [
    `# ${level} — grouping leads`,
    "",
    "Mechanical candidates only. Whether words *teach together* is the author's call;",
    "the tags and meanings are JMdict-derived, so write pair/contrast notes from them.",
    "",
    `## Homophones — same reading, different kanji (${homophones.length})`,
    "",
    ...homophones.map(
      ([kana, words]) =>
        `- ${kana}: ${words.map((w) => `${w.term} (${w.meaning})`).join(" · ")}`,
    ),
    "",
    `## Candidate transitive/intransitive pairs — vt ⇄ vi (${pairs.length})`,
    "",
    ...pairs.map(
      ([t, i]) => `- ${t.term} (${t.kana}, vt) ⇄ ${i.term} (${i.kana}, vi)`,
    ),
    "",
    `## Affixes, prefixes, suffixes and counters (${affixes.length})`,
    "",
    ...affixes.map((v) => `- ${v.term} (${v.kana}) — ${v.meaning}`),
    "",
  ].join("\n");
}

async function draftLevel(level, { size, includeCovered }) {
  const reference = loadReference(level);
  const authored = await loadClusters(level);
  const covered = authored ? coveredIds(authored) : new Set();

  const unresolvedIds = new Set(
    (reference.meta.unresolvedInJmdict ?? []).map((w) => w.split(": ")[0]),
  );
  const unresolved = reference.vocab.filter((v) => unresolvedIds.has(v.id));
  const resolved = reference.vocab.filter((v) => !unresolvedIds.has(v.id));
  const ready = includeCovered
    ? resolved
    : resolved.filter((v) => !covered.has(v.id));

  const buckets = new Map();
  for (const v of ready) {
    const bucket = classifyPartOfSpeech(firstPos(v), v.term);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(v);
  }
  const bucketOrder = [
    ...WORD_TYPE_GROUPS.map((g) => g.key),
    ...[...buckets.keys()]
      .filter((k) => !WORD_TYPE_GROUPS.some((g) => g.key === k))
      .sort(),
  ];

  const outDir = join(ROOT, "data", "drafts", level.toLowerCase());
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const files = [];
  let fileNo = 0;
  for (const bucket of bucketOrder) {
    const words = buckets.get(bucket);
    if (!words?.length) continue;
    for (const chunk of chunkByFamily(words, size)) {
      fileNo += 1;
      const name = `words-${String(fileNo).padStart(2, "0")}-${bucket}.md`;
      const body = [
        `# ${level} · ${POS_LABELS[bucket] ?? bucket} — ${chunk.length} words`,
        "",
        "`term [id] | kana | JMdict tags | served meaning  ⚠ where evidence disagrees`",
        "Ids equal the term unless shown. Words sharing a leading kanji are adjacent.",
        "",
        ...chunk.map(wordLine),
        "",
      ].join("\n");
      writeFileSync(join(outDir, name), body);
      files.push({ name, bucket, count: chunk.length });
    }
  }

  writeFileSync(
    join(outDir, "flags.md"),
    flagsMarkdown(level, reference, unresolved, ready),
  );
  writeFileSync(join(outDir, "patterns.md"), patternsMarkdown(level, ready));

  const readme = [
    `# ${level} authoring pack`,
    "",
    `${reference.vocab.length} words in the pool · ${covered.size} already taught by authored clusters · ` +
      `${ready.length} to draft in ${files.length} file(s) · ${unresolved.length} blocked (not in JMdict)`,
    "",
    "## Order of work",
    "",
    "1. `flags.md` — settle every flagged word first (correct in `shared/meanings.ts`, rebuild evidence).",
    "2. `patterns.md` — homophones, vt/vi pairs, affixes: the natural seeds of clusters.",
    "3. One `words-*.md` at a time: group by teachable idea, then write the cluster.",
    "4. After each batch: `pnpm exec vitest run --project content`, then re-run this script —",
    "   finished words drop out, so it always shows only what is left.",
    "",
    "## Accuracy rules (a wrong fact in a lesson is a bug)",
    "",
    "- Take readings, meanings and POS/transitivity only from these files — never from memory.",
    "- Every example sentence: natural, uses the cluster's words, romaji matches the kana",
    "  (wāpuro: ou/ei, no macrons), and the English says what the Japanese says.",
    "- Claims about grammar (transitivity, conjugation class, nuance) must be backed by the tags",
    "  shown; if the evidence doesn't say, don't assert it.",
    "- If unsure, leave the claim out — an incomplete lesson is fixable, a wrong one misleads.",
    "",
    "## Files",
    "",
    "- flags.md",
    "- patterns.md",
    ...files.map((f) => `- ${f.name} (${f.count})`),
    "",
  ].join("\n");
  writeFileSync(join(outDir, "README.md"), readme);

  return {
    level,
    outDir,
    total: reference.vocab.length,
    covered: covered.size,
    ready: ready.length,
    files: files.length,
    unresolved: unresolved.length,
    authored: Boolean(authored),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const includeCovered = args.includes("--all");
  const sizeIdx = args.indexOf("--size");
  const size =
    sizeIdx >= 0
      ? Number(args[sizeIdx + 1]) || DEFAULT_BATCH_SIZE
      : DEFAULT_BATCH_SIZE;
  const level = (
    args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--size") ?? "N2"
  ).toUpperCase();
  if (!LEVELS.includes(level)) {
    throw new Error(`Unknown level "${level}" (expected ${LEVELS.join("/")})`);
  }

  const r = await draftLevel(level, { size, includeCovered });
  console.log(`${level}: ${r.total} words in the pool`);
  if (r.authored)
    console.log(`  ${r.covered} already taught by authored clusters`);
  if (r.ready === 0) {
    console.log(
      "  fully covered — nothing left to draft (use --all to re-emit)",
    );
  } else {
    console.log(`  ${r.ready} to draft → ${r.files} file(s) of ≤${size} words`);
  }
  if (r.unresolved > 0) {
    console.log(`  ${r.unresolved} blocked: not in JMdict (see flags.md)`);
  }
  console.log(`  wrote ${r.outDir}/  (start with README.md, then flags.md)`);
}

// Only when run directly — tests import chunkByFamily/draftLevel without side effects.
if (process.argv[1] === fileURLToPath(import.meta.url)) main();

export { draftLevel, chunkByFamily };
