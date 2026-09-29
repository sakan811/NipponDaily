#!/usr/bin/env -S node --experimental-strip-types --no-warnings
/**
 * Turns a level's dictionary-verified reference snapshot
 * (data/reference/<level>-reference.json, built by `pnpm data:reference:jlpt`)
 * into a compact, POS-grouped draft of WordCluster skeletons — the
 * scaffolding step between "we have a seeded, evidence-backed pool" and
 * "someone has authored app/data/vocab-guide-<level>.ts" for N3/N2 the way
 * N4 already has app/data/vocab-guide-n4.ts (see the blue callout on
 * app/pages/docs/data-integrity.vue and scripts/build-jlpt-reference.mjs's
 * own header, which both point at this gap).
 *
 * Why this exists: authoring a level by hand today means holding the whole
 * multi-thousand-line reference JSON in your head (or an LLM's context) to
 * figure out which ~2,000 words even exist, sort them into pedagogically
 * sane groups, and only then start writing insight/example/commonMistake
 * prose — the grouping step is mechanical but expensive to redo from raw
 * JSON every time. This script does the mechanical part once, deterministically:
 *
 *   1. Reads the level's reference snapshot (never the live Redis pool —
 *      same "offline, versioned evidence" rule as the rest of data/reference).
 *   2. Drops any word `build-jlpt-reference.mjs` already flagged as not
 *      cleanly resolving in JMdict (meta.unresolvedInJmdict) — those need a
 *      VOCAB_FORM_CORRECTIONS entry first, same as N4's did; drafting lesson
 *      prose around a form that's about to change is wasted work.
 *   3. Buckets the rest by the SAME classifyPartOfSpeech() the live
 *      /vocab guide uses, so a draft cluster's words really do share one
 *      WORD_TYPE_GROUPS bucket (verb, i-adjective, noun, …) end to end.
 *   4. Packs each bucket into lesson-sized rows (CLUSTER_SIZE terms each,
 *      sorted so words sharing a kanji land in the same row where possible —
 *      a cheap proxy for "these probably belong in one mini-lesson").
 *   5. Writes one draft JSON per level with every cluster's terms AND a
 *      `glossary` of term → reading/meaning for each, so the authoring pass
 *      (a human or an LLM) can write insight/examples/commonMistake straight
 *      from the draft — one clean read, no round-trip back to the multi-MB
 *      reference file — then paste the finished prose into a new
 *      app/data/vocab-guide-<level>.ts (mirroring vocab-guide-n4.ts's shape)
 *      and app/data/lessons-<level>.ts (mirroring lessons-n4.ts: reuse
 *      buildLessons()/lessonNumberByWord()/firstLessonByKanji() from
 *      lessons.ts rather than re-implementing lesson-packing).
 *
 * This script only ever produces a draft — it's a starting point for an
 * authoring PR, not something the app or CI reads, so its output lives
 * under data/drafts/ (gitignored) rather than data/reference/.
 *
 * Usage: pnpm data:draft:clusters [level]   (default: N3)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyPartOfSpeech,
  WORD_TYPE_GROUPS,
} from "../app/data/vocab-guide.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** Terms per draft row — matches lessons.ts's MAX_WORDS_PER_LESSON so a
 *  cluster with one row is already exactly one lesson's worth. */
export const CLUSTER_SIZE = 12;

const POS_LABELS = Object.fromEntries(
  WORD_TYPE_GROUPS.map((g) => [g.key, g.label]),
);

/** First CJK ideograph in a term, or "" for a kana-only word — used only to
 *  keep kanji-sharing words adjacent after sorting, not for any claim about
 *  meaning. */
function firstKanji(term) {
  return term.match(/[一-鿿]/)?.[0] ?? "";
}

/** Splits a POS bucket's words into CLUSTER_SIZE-sized draft rows, sorted so
 *  words sharing a leading kanji tend to land in the same row. */
function packBucket(words, size) {
  const sorted = [...words].sort((a, b) => {
    const ka = firstKanji(a.term);
    const kb = firstKanji(b.term);
    if (ka !== kb) return ka < kb ? -1 : 1;
    return a.term < b.term ? -1 : a.term > b.term ? 1 : 0;
  });
  const rows = [];
  for (let i = 0; i < sorted.length; i += size) {
    rows.push(sorted.slice(i, i + size));
  }
  return rows;
}

function firstPos(vocab) {
  return vocab.jmdict?.[0]?.senses?.[0]?.pos?.[0];
}

function draftLevel(level) {
  const refPath = join(
    ROOT,
    "data",
    "reference",
    `${level.toLowerCase()}-reference.json`,
  );
  const reference = JSON.parse(readFileSync(refPath, "utf-8"));

  // Each entry is "<id>: <term> (<kana>)" — see build-jlpt-reference.mjs's
  // buildLevelReference(), the only place that writes this array.
  const unresolved = new Set(
    (reference.meta.unresolvedInJmdict ?? []).map((w) => w.split(": ")[0]),
  );
  const skipped = reference.vocab.filter((v) => unresolved.has(v.id));
  const ready = reference.vocab.filter((v) => !unresolved.has(v.id));

  const buckets = new Map();
  for (const v of ready) {
    const bucket = classifyPartOfSpeech(firstPos(v), v.term);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(v);
  }

  const clusters = [];
  // WORD_TYPE_GROUPS order first (verb, i-adjective, na-adjective, noun, …),
  // then any bucket classifyPartOfSpeech can return that isn't in that list
  // (pronoun, particle, counter, expression, other), sorted for determinism.
  const bucketOrder = [
    ...WORD_TYPE_GROUPS.map((g) => g.key),
    ...[...buckets.keys()]
      .filter((k) => !WORD_TYPE_GROUPS.some((g) => g.key === k))
      .sort(),
  ];

  for (const bucket of bucketOrder) {
    const words = buckets.get(bucket);
    if (!words || words.length === 0) continue;
    const rows = packBucket(words, CLUSTER_SIZE);
    rows.forEach((row, i) => {
      clusters.push({
        key: `${level.toLowerCase()}-${bucket}-${i + 1}`,
        suggestedTitle: `${POS_LABELS[bucket] ?? bucket} — draft ${i + 1}`,
        wordType: bucket,
        // TODO (authoring): fill in title/subtitle/insight/extendedInsight/
        // examples/commonMistake, matching WordCluster in
        // app/data/vocab-guide.ts, then move this row's terms into
        // app/data/vocab-guide-<level>.ts's own WordCluster.rows.
        title: "",
        subtitle: "",
        insight: "",
        extendedInsight: "",
        examples: [],
        commonMistake: "",
        rows: [{ terms: row.map((v) => v.id) }],
        // Reference only — not part of the eventual WordCluster shape.
        // Written so the authoring pass never needs to re-open the
        // multi-thousand-entry reference JSON just to remember what a
        // word means.
        glossary: Object.fromEntries(
          row.map((v) => [
            v.id,
            { term: v.term, kana: v.kana, meaning: v.meaning },
          ]),
        ),
      });
    });
  }

  return {
    level,
    instructions:
      "Draft only — not read by the app or CI. For each cluster: write " +
      "title/subtitle/insight/extendedInsight/examples/commonMistake (see " +
      "WordCluster in app/data/vocab-guide.ts and existing entries in " +
      "vocab-guide-n4.ts for the expected voice/depth), regroup rows if a " +
      "cluster's words don't actually share a teachable idea, then move the " +
      "finished clusters into a new app/data/vocab-guide-<level>.ts and " +
      "wire a lessons-<level>.ts the same way lessons-n4.ts reuses " +
      "buildLessons() from lessons.ts. Words below needed a " +
      "VOCAB_FORM_CORRECTIONS entry before they could be drafted — fix and " +
      "re-run `pnpm data:reference:jlpt` first, then re-run this script.",
    generatedAt: new Date().toISOString(),
    sourceReference: `data/reference/${level.toLowerCase()}-reference.json`,
    counts: {
      totalWords: reference.vocab.length,
      draftedWords: ready.length,
      skippedUnresolved: skipped.length,
      clusters: clusters.length,
    },
    skippedUnresolved: skipped.map((v) => ({
      id: v.id,
      term: v.term,
      kana: v.kana,
    })),
    clusters,
  };
}

function main() {
  const level = (process.argv[2] ?? "N3").toUpperCase();
  const draft = draftLevel(level);

  const outDir = join(ROOT, "data", "drafts");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${level.toLowerCase()}-cluster-draft.json`);
  writeFileSync(outPath, `${JSON.stringify(draft, null, 2)}\n`);

  console.log(`${level}: ${draft.counts.totalWords} words in reference`);
  console.log(
    `  ${draft.counts.draftedWords} drafted into ${draft.counts.clusters} clusters ` +
      `(${CLUSTER_SIZE} words/cluster)`,
  );
  if (draft.counts.skippedUnresolved > 0) {
    console.log(
      `  ${draft.counts.skippedUnresolved} skipped (not cleanly in JMdict — ` +
        `see skippedUnresolved in the draft, add VOCAB_FORM_CORRECTIONS first)`,
    );
  }
  console.log(`  wrote ${outPath}`);
}

main();

export { draftLevel };
