#!/usr/bin/env -S node --experimental-strip-types --no-warnings
/**
 * Builds data/reference/{n4,n3,n2}-reference.json — the same kind of
 * committed, versioned dictionary-evidence snapshot as N5's
 * data/reference/n5-reference.json (see scripts/build-n5-reference.mjs and
 * /docs/authoring), for the N4/N3/N2 word lists.
 *
 * N4 now has hand-authored lesson content (app/data/vocab-guide-n4.ts,
 * app/data/lessons-n4.ts) and is gated by test/content/n4/ the same way N5
 * is gated by test/content/*.test.ts — so this file's vocab/kanji AND
 * readings/words evidence (the latter built from every hand-written example
 * sentence/prose string under app/data, the same way
 * build-n5-reference.mjs's does for N5) is real, load-bearing CI evidence
 * for N4, not just a preview. N3/N2 remain evidence-only: real,
 * checksum-verified JMdict/KANJIDIC2 data for every word and kanji, ready for
 * whoever authors that level's WORD_CLUSTERS next, but with no hand-written
 * content yet for test/content/ to check it against — running N4's own
 * "every word must cleanly resolve in JMdict" gate against N3/N2's ~3,900
 * words straight from the raw word list would fail on pre-existing
 * word-list quality issues nobody has reviewed yet, the same way N4's list
 * needed its own VOCAB_FORM_CORRECTIONS entries added first (see
 * shared/meanings.ts).
 *
 * Each output file's `meta.unresolvedInJmdict` lists every word that didn't
 * cleanly resolve — the same discovery step VOCAB_FORM_CORRECTIONS grew out
 * of for N5 and N4, surfaced upfront here instead of found one CI failure at
 * a time.
 *
 * Usage: pnpm data:reference:jlpt
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dedupeAcrossLevels, parseJlptCsv, slugify } from "./lib/word-list.mjs";
import { WORD_LIST_SOURCES, wordListUrl } from "./word-list-source.mjs";
import {
  JAMDICT_SOURCE,
  ensureJamdictDb,
  openDictionary,
} from "./lib/jamdict.mjs";
import {
  MAX_SPAN_TOKENS,
  buildTokenizer,
  contentJapanese,
  contentKanji,
  contentSentences,
} from "./build-n5-reference.mjs";
import { servedVocab } from "../shared/meanings.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, "node_modules/.cache/n5-reference");
const LEVELS = ["N4", "N3", "N2"];

const KANJI_RE = /[㐀-䶿一-鿿々]/;
const KANJI_RE_G = /[㐀-䶿一-鿿]/gu;

async function fetchWordList(level) {
  const res = await fetch(wordListUrl(level));
  if (!res.ok) throw new Error(`GET ${wordListUrl(level)} → ${res.status}`);
  return parseJlptCsv(await res.text(), level);
}

/** Tokens of a kana/kanji phrase when the tokenizer splits it into two or
 *  more real words with nothing it couldn't place — evidence that a set
 *  phrase JMdict doesn't list is at least made of real words. Null otherwise. */
function phraseTokens(tokenizer, term) {
  if (!tokenizer || !/^[぀-ヿ一-鿿々ー]+$/.test(term)) return null;
  const tokens = tokenizer.tokenize(term);
  if (tokens.length < 2 || tokens.some((t) => t.word_type === "UNKNOWN")) {
    return null;
  }
  return tokens.map((t) => t.surface_form);
}

function buildLevelReference(level, entries, dict, shared) {
  const seen = new Set();
  const unresolvedInJmdict = [];

  // Same shape as N5's reference.vocab (id/seedKey/term/kana/meaning/
  // listTerm/listReading/listMeaning/jmdict) — servedVocab() is applied so
  // this reflects the corrections and enrichments in shared/meanings.ts.
  const vocab = entries.map((e) => {
    const id = slugify(e.term, seen);
    const served = servedVocab(e);
    const jmdict = dict.lookupWord(served.term, served.kana);
    // A word JMdict has no headword for can still be sound evidence: a bound
    // affix kanji read as KANJIDIC2 says it can be, or a set phrase whose
    // every token is a real word (お待ちください). Anything else is on the
    // punch-list — it needs a VOCAB_FORM_CORRECTIONS entry.
    let evidence;
    if (jmdict.length === 0) {
      if (dict.boundKanjiAttested?.(served.term, served.kana)) {
        evidence = { kind: "bound-kanji" };
      } else {
        const tokens = phraseTokens(shared.tokenizer, served.term);
        if (tokens) evidence = { kind: "composed-phrase", tokens };
      }
      if (!evidence) {
        unresolvedInJmdict.push(`${id}: ${served.term} (${served.kana})`);
      }
    }
    return {
      id,
      seedKey: `${e.term} ${e.kana}`,
      term: served.term,
      kana: served.kana,
      meaning: served.meaning,
      listTerm: e.term,
      listReading: e.listReading,
      listMeaning: e.listMeaning,
      jlptLevel: level,
      jmdict,
      ...(evidence ? { evidence } : {}),
    };
  });

  const kanjiChars = new Set(shared.contentKanjiChars);
  for (const v of vocab)
    for (const c of v.term.match(KANJI_RE_G) ?? []) kanjiChars.add(c);
  const kanji = {};
  for (const c of [...kanjiChars].sort()) {
    const info = dict.kanji(c);
    if (info) kanji[c] = info;
  }

  // Readings for every kanji-bearing word or 2–3 token span in the
  // hand-written content's example sentences — same approach as N5's own
  // reference (see build-n5-reference.mjs), so a level with hand-authored
  // lesson content (e.g. N4's app/data/vocab-guide-n4.ts) can gate its
  // example-sentence rōmaji the same way N5 does.
  const surfaces = new Set(
    vocab.map((v) => v.term).filter((t) => KANJI_RE.test(t)),
  );
  for (const s of shared.contentSurfaces) surfaces.add(s);
  const readings = {};
  for (const s of [...surfaces].sort()) {
    const r = dict.readingsOf(s);
    if (r.length > 0) readings[s] = r;
  }

  return {
    meta: {
      description: `Dictionary evidence for ${level} words — same idea as data/reference/n5-reference.json. Generated by \`pnpm data:reference:jlpt\` — do not edit by hand.`,
      level,
      sources: {
        jmdict: {
          ...JAMDICT_SOURCE,
          licence: "JMdict/KANJIDIC2 © EDRDG, CC BY-SA 4.0",
        },
        wordList: { ...WORD_LIST_SOURCES[level], licence: "MIT" },
      },
      counts: {
        vocab: vocab.length,
        kanji: Object.keys(kanji).length,
        readings: Object.keys(readings).length,
        words: shared.words.length,
        unresolvedInJmdict: unresolvedInJmdict.length,
      },
      unresolvedInJmdict,
    },
    vocab,
    readings,
    words: shared.words,
    kanji,
  };
}

/** Content shared across every level's reference build — the hand-written
 *  lesson content under app/data lives in one directory regardless of which
 *  level it teaches, so this is computed once and reused per level rather
 *  than re-tokenizing the same sentences three times. */
async function buildSharedContentEvidence(dict, tokenizer) {
  const contentKanjiChars = contentKanji();

  const contentSurfaces = new Set();
  for (const sentence of contentSentences()) {
    const tokens = tokenizer.tokenize(sentence).map((t) => t.surface_form);
    for (let i = 0; i < tokens.length; i++) {
      let span = "";
      for (let j = i; j < Math.min(tokens.length, i + MAX_SPAN_TOKENS); j++) {
        span += tokens[j];
        if (KANJI_RE.test(span)) contentSurfaces.add(span);
      }
    }
  }

  const words = new Set();
  for (const run of contentJapanese()) {
    // A run that's itself a dictionary word (じょう, ちゅう) counts as real
    // even when the tokenizer splits it into fragments it can't place.
    if (dict.wordExists(run)) words.add(run);
    for (const t of tokenizer.tokenize(run)) {
      if (t.word_type === "UNKNOWN" && dict.wordExists(t.surface_form)) {
        words.add(t.surface_form);
      }
    }
  }

  return {
    contentKanjiChars,
    contentSurfaces,
    words: [...words].sort(),
    tokenizer,
  };
}

async function main() {
  const [dbPath, tokenizer] = await Promise.all([
    ensureJamdictDb(CACHE_DIR),
    buildTokenizer(),
  ]);
  const dict = openDictionary(dbPath);
  const shared = await buildSharedContentEvidence(dict, tokenizer);

  // A word listed at more than one level with the exact same reading is
  // only ever kept at the lowest (easiest) level (see lib/word-list.mjs's
  // dedupeAcrossLevels). N5 itself is never gated by this file (see
  // build-n5-reference.mjs), but its word list still has to fill the
  // registry first so N4/N3/N2 dedupe against it correctly.
  const seenByKey = new Map();
  dedupeAcrossLevels(await fetchWordList("N5"), "N5", seenByKey);

  for (const level of LEVELS) {
    const rawEntries = await fetchWordList(level);
    console.log(`Loaded ${rawEntries.length} ${level} word-list entries`);
    const { kept: entries, dropped } = dedupeAcrossLevels(
      rawEntries,
      level,
      seenByKey,
    );
    if (dropped.length > 0) {
      console.log(
        `Dropped ${dropped.length} ${level} word(s) already taught at a lower level: ` +
          dropped
            .map((d) => `${d.term} (${d.kana}, kept at ${d.keptAtLevel})`)
            .join(", "),
      );
    }
    const reference = buildLevelReference(level, entries, dict, shared);

    const outFile = join(
      ROOT,
      `data/reference/${level.toLowerCase()}-reference.json`,
    );
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, `${JSON.stringify(reference, null, 1)}\n`);
    console.log(
      `Wrote ${outFile}: ${reference.meta.counts.vocab} vocab, ${reference.meta.counts.kanji} kanji, ` +
        `${reference.meta.counts.unresolvedInJmdict} unresolved in JMdict`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { fetchWordList, buildLevelReference };
