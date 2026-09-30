#!/usr/bin/env -S node --experimental-strip-types --no-warnings
/**
 * Cross-level accuracy audit of what NipponDaily teaches (`pnpm data:audit`).
 *
 * test/content/ is the CI gate, and it is deliberately strict-but-narrow: a
 * failure there means "definitely wrong". This audit is the complementary
 * *review queue*: it applies looser, stem-aware checks across EVERY level
 * (N5-N2 — including N2, which has no gated content yet) and lists what a
 * person or LLM should re-read, ranked by how likely it is to be a real
 * lesson error. It never edits anything and never fails CI; it exits non-zero
 * only with --strict, when the highest-priority findings exist.
 *
 * What it looks at, per level, against data/reference/<level>-reference.json:
 *   1. Reading not attested — the served kana isn't a reading JMdict gives for
 *      any entry matched to the word (a wrong-reading lesson bug).
 *   2. Meaning unsupported — no `;`-sense of the served meaning agrees with any
 *      JMdict gloss for the word (a wrong-meaning lesson bug, OR the evidence
 *      matched the wrong homograph — the report says which glosses it saw).
 *   3. Meaning partly unsupported — some senses agree, some don't.
 *   4. For authored levels, cluster structure: a `pairwise` row that isn't a
 *      pair, a transitive/intransitive lesson whose pairs JMdict doesn't tag
 *      as one vt + one vi, clusters missing examples/commonMistake, example
 *      sentences reused across clusters.
 *
 * Section 2 is split: kanji words (the evidence is reliable — the served
 * reading matches an entry whose glosses disagree with the meaning, the shape
 * of a source-list row that pairs one word's kana with another's gloss) and
 * kana-only words (usually a homograph the evidence matched wrongly; spot-check).
 *
 * Usage: pnpm data:audit [level ...] [--strict]   (default: every level)
 * Writes the full report to data/drafts/audit-<level>.md (gitignored).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LEVELS,
  ROOT,
  describeWord,
  entriesForReading,
  isVerb,
  loadClusters,
  loadReference,
  meaningSupport,
  posTags,
  readingIsAttested,
} from "./lib/authoring-evidence.mjs";

const line = (v, extra = "") =>
  `- \`${v.id}\` ${v.term} (${v.kana}) — “${v.meaning}”${extra}`;

/** Kanji headwords that aren't bound affixes/counters (～個, 第～): for those
 *  JMdict's entries for the same written form are trustworthy evidence, while
 *  a kana-only word or an affix is often matched to an unrelated homograph. */
const isReliableEvidence = (v) =>
  /[一-鿿]/.test(v.term) && !/[～〜]/.test(v.term + v.kana);

function glossPreview(v) {
  return entriesForReading(v)
    .flatMap((e) => e.senses.slice(0, 2).flatMap((s) => s.glosses.slice(0, 3)))
    .slice(0, 6)
    .join(" | ");
}

function auditWords(reference) {
  const unattested = [];
  const unsupported = [];
  const partial = [];
  const noEvidence = [];
  for (const v of reference.vocab) {
    if (v.jmdict.length === 0) {
      noEvidence.push(v);
      continue;
    }
    if (!readingIsAttested(v)) unattested.push(v);
    const s = meaningSupport(v);
    if (s.status === "unsupported") unsupported.push(v);
    else if (s.status === "partial") partial.push({ v, unbacked: s.unbacked });
  }
  return { unattested, unsupported, partial, noEvidence };
}

function auditClusters(reference, clusters) {
  const byId = new Map(reference.vocab.map((v) => [v.id, v]));
  const findings = [];
  const seenExamples = new Map();
  for (const c of clusters) {
    if (!c.examples?.length) findings.push(`${c.key}: no example sentences`);
    if (!c.commonMistake) findings.push(`${c.key}: no commonMistake note`);
    if (!c.insight) findings.push(`${c.key}: empty insight`);
    for (const e of c.examples ?? []) {
      if (!e.jp || !e.romaji || !e.en) {
        findings.push(
          `${c.key}: example missing jp/romaji/en (${e.jp ?? "?"})`,
        );
      }
      const prior = seenExamples.get(e.jp);
      if (prior && prior !== c.key) {
        findings.push(`${c.key}: example 「${e.jp}」 also used in ${prior}`);
      }
      seenExamples.set(e.jp, c.key);
    }
    // Only a cluster that IS about transitivity (by key/title/subtitle) — an
    // insight merely mentioning the word doesn't make its rows verb pairs.
    const claimsTransitivity = /transitiv|他動詞|自動詞/i.test(
      `${c.key} ${c.title} ${c.subtitle}`,
    );
    if (claimsTransitivity) {
      for (const r of c.rows) {
        if (r.terms.length !== 2) continue;
        const [a, b] = r.terms.map((id) => byId.get(id));
        if (!a || !b) continue;
        const ta = posTags(a);
        const tb = posTags(b);
        if (!isVerb(ta) || !isVerb(tb)) continue;
        const ok =
          (ta.includes("vt") && tb.includes("vi")) ||
          (ta.includes("vi") && tb.includes("vt"));
        if (!ok) {
          findings.push(
            `${c.key}: “${r.label ?? r.terms.join(" / ")}” is taught as a transitive/intransitive pair but JMdict tags ${a.term} [${ta.join(" ")}] and ${b.term} [${tb.join(" ")}]`,
          );
        }
      }
    }
  }
  return findings;
}

async function auditLevel(level) {
  const reference = loadReference(level);
  const words = auditWords(reference);
  const clusters = await loadClusters(level);
  const structure = clusters ? auditClusters(reference, clusters) : null;

  const kanjiUnsupported = words.unsupported.filter(isReliableEvidence);
  const kanaUnsupported = words.unsupported.filter(
    (v) => !isReliableEvidence(v),
  );
  const md = [`# ${level} content audit`, ""];
  md.push(
    `${reference.vocab.length} words · ${
      clusters
        ? `${clusters.length} authored clusters`
        : "no authored clusters yet"
    }`,
    "",
    "Ranked: 1 → 2a → 3 are the likeliest real errors. A flag is a prompt to re-read the word against JMdict, not a verdict.",
    "",
    `## 1. Reading not attested by JMdict (${words.unattested.length})`,
    "",
    ...words.unattested.map((v) =>
      line(
        v,
        ` — JMdict reads: ${describeWord(v).notes[0]?.match(/\((.*)\)/)?.[1] ?? "?"}`,
      ),
    ),
    "",
    `## 2a. Kanji words whose meaning shares nothing with JMdict's glosses for that reading (${kanjiUnsupported.length})`,
    "",
    ...kanjiUnsupported.map((v) => line(v, `\n  - JMdict: ${glossPreview(v)}`)),
    "",
    `## 2b. Kana-only words and affixes, same check — usually a wrongly matched homograph, spot-check (${kanaUnsupported.length})`,
    "",
    ...kanaUnsupported.map((v) => line(v, `\n  - JMdict: ${glossPreview(v)}`)),
    "",
    `## 3. Meaning partly unsupported (${words.partial.length})`,
    "",
    ...words.partial.map(({ v, unbacked }) =>
      line(
        v,
        `\n  - unbacked: ${unbacked.join("; ")}\n  - JMdict: ${glossPreview(v)}`,
      ),
    ),
    "",
    `## 4. No JMdict entry at all (${words.noEvidence.length})`,
    "",
    ...words.noEvidence.map((v) => line(v)),
    "",
  );
  if (structure) {
    md.push(`## 5. Cluster structure (${structure.length})`, "");
    md.push(...structure.map((f) => `- ${f}`), "");
  }

  const outDir = join(ROOT, "data", "drafts");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `audit-${level.toLowerCase()}.md`);
  writeFileSync(outPath, `${md.join("\n")}\n`);

  return { level, reference, words, structure, outPath };
}

async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const levels = args
    .filter((a) => !a.startsWith("--"))
    .map((a) => a.toUpperCase());
  for (const l of levels) {
    if (!LEVELS.includes(l)) throw new Error(`Unknown level ${l}`);
  }
  const targets = levels.length ? levels : LEVELS;

  let urgent = 0;
  console.log(
    "level  words  unattested  no-overlap  partial  no-jmdict  structure",
  );
  for (const level of targets) {
    const r = await auditLevel(level);
    const { unattested, unsupported, partial, noEvidence } = r.words;
    urgent += unattested.length + unsupported.filter(isReliableEvidence).length;
    console.log(
      `${level.padEnd(5)}  ${String(r.reference.vocab.length).padStart(5)}  ${String(unattested.length).padStart(10)}  ${String(unsupported.length).padStart(10)}  ${String(partial.length).padStart(7)}  ${String(noEvidence.length).padStart(9)}  ${r.structure ? r.structure.length : "-"}`,
    );
    console.log(`       → ${r.outPath}`);
  }
  if (strict && urgent > 0) process.exit(1);
}

main();
