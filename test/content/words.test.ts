import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { toHiragana } from "wanakana";
import { WORD_ENTRIES, isValidIsoDate } from "~~/shared/words";
import { WORD_PROCESSES, WORD_STRATA, isHedged } from "~~/shared/word-labels";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import type { Morpheme, WordEntry } from "~~/types/index";
import { loadReference, type RefKanji } from "./reference";
// @ts-expect-error — untyped .mjs script helper
import { loadEtymologySnapshot } from "../../scripts/lib/etymology-snapshot.mjs";
// @ts-expect-error — untyped .mjs script helper
import { planMonths } from "../../scripts/lib/month-shards.mjs";
// @ts-expect-error — untyped .mjs script helper
import { WIKTIONARY_DUMP } from "../../scripts/lib/wiktionary-dump.mjs";

/**
 * The daily-word entries (data/words/*.json) checked against committed
 * evidence: dictionary facts against JMdict/KANJIDIC2
 * (data/reference/n{5,4,3,2,1}-reference.json) and origin claims against pinned
 * Wiktionary text (data/reference/etymology/).
 *
 * Every field except the headline is generated from those sources
 * (scripts/lib/word-entry.mjs; see word-generation.test.ts, which regenerates
 * and compares). The checks here are written independently of the generator,
 * so a bug in it can't vouch for itself: quotes must be verbatim and come from
 * the section for the word's own reading, morphemes must spell the word and
 * join to its reading, and part of speech must be JMdict's own tags.
 */

interface EtymologySnapshot {
  meta?: { source: string; license: string; dump: string; sha256: string };
  entries: Record<
    string,
    {
      url: string;
      etymologies: { heading: string; text: string; readings: string[] }[];
    }
  >;
}

const snapshot = loadEtymologySnapshot(
  resolve(import.meta.dirname, "../.."),
) as EtymologySnapshot;

const references = JLPT_LEVELS.map((level) => loadReference(level));
const allKanji: Record<string, RefKanji> = Object.assign(
  {},
  ...references.map((r) => r.kanji),
);
const allVocab = references.flatMap((r) => r.vocab);
const poolJapanese = new Set(allVocab.flatMap((v) => [v.term, v.kana]));

/** Wiktionary text for a term, in one string. */
const evidenceOf = (term: string): string =>
  (snapshot.entries[term]?.etymologies ?? []).map((e) => e.text).join("\n");

/** Collapse whitespace and drop the invisible direction marks Wiktionary
 *  inserts around "+", so a quote can be compared to the text it came from. */
const normalize = (s: string): string =>
  s.replace(/[‎‏]/g, "").replace(/\s+/g, " ").trim();

/** 食(た)べ物(もの) → 食べ物: Wiktionary's ruby annotations removed, so a
 *  written form can be matched against it. */
const withoutRuby = (s: string): string =>
  s.replace(/\([\p{sc=Hiragana}\p{sc=Katakana}ー]+\)/gu, "");

const JAPANESE_RUN = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー々]+/gu;
const SINGLE_KANJI_WITH_OKURIGANA = /^\p{sc=Han}\p{sc=Hiragana}*$/u;

/** Every reading KANJIDIC2 accepts for a kanji, as hiragana: on'yomi whole,
 *  kun'yomi as stem (before the okurigana dot), with `startsWith` standing in
 *  for the okurigana the word itself supplies. */
function readingFits(char: string, reading: string): boolean {
  const k = allKanji[char];
  if (!k) return false;
  const on = k.on.map((r) => toHiragana(r));
  if (on.includes(reading)) return true;
  return k.kun
    .map((r) => r.replace(/-/g, "").split(".")[0] ?? "")
    .filter(Boolean)
    .some((stem) => reading.startsWith(stem));
}

function entryText(e: WordEntry): string {
  return e.headline;
}

describe("the daily-word catalogue", () => {
  it("has one entry per day, with real unique dates and terms", () => {
    const dates = WORD_ENTRIES.map((e) => e.date);
    expect(dates.filter((d) => !isValidIsoDate(d))).toEqual([]);
    expect(new Set(dates).size).toBe(dates.length);
    const terms = WORD_ENTRIES.map((e) => e.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("has no gap between its first and last day", () => {
    // The first and last months may be partial; every day between has a word.
    for (let i = 1; i < WORD_ENTRIES.length; i++) {
      const gap =
        (Date.parse(WORD_ENTRIES[i]!.date) -
          Date.parse(WORD_ENTRIES[i - 1]!.date)) /
        86_400_000;
      expect(gap, `${WORD_ENTRIES[i]!.date} follows a gap`).toBe(1);
    }
  });

  it("is sorted by date", () => {
    const dates = WORD_ENTRIES.map((e) => e.date);
    expect(dates).toEqual([...dates].sort());
  });
});

describe.each(WORD_ENTRIES.map((e) => [e.date, e.term, e] as const))(
  "%s %s",
  (_date, term, entry) => {
    const evidence = normalize(evidenceOf(term));
    const evidencePlain = withoutRuby(evidence);

    it("is a real pool word, served with that reading, level and meaning", () => {
      const level = JLPT_LEVELS.find((l) => l === entry.level);
      expect(level, `unknown level ${entry.level}`).toBeDefined();
      const served = loadReference(entry.level).vocab.find(
        (v) => v.term === entry.term && v.kana === entry.kana,
      );
      expect(
        served,
        `${entry.term} ${entry.kana} is not in ${entry.level}'s pool`,
      ).toBeDefined();
      expect(entry.meaning).toBe(served!.meaning);
    });

    it("uses only known strata and processes", () => {
      // The layer is stated only when KANJIDIC2 or the evidence establishes it.
      if (entry.stratum)
        expect(Object.keys(WORD_STRATA)).toContain(entry.stratum);
      for (const p of entry.processes)
        expect(Object.keys(WORD_PROCESSES)).toContain(p);
      if (/^[\p{sc=Katakana}ー]+$/u.test(entry.term)) {
        expect(entry.stratum).toBe("gairaigo");
      }
    });

    it("has morphemes that spell the word and join to its reading", () => {
      if (entry.morphemes.length === 0) return;
      expect(entry.morphemes.map((m) => m.text).join("")).toBe(entry.term);
      const joined = toHiragana(entry.morphemes.map((m) => m.reading).join(""));
      expect(joined).toBe(toHiragana(entry.kana));
    });

    it("has morpheme readings and glosses that KANJIDIC2 or the cited text back", () => {
      const problems: string[] = [];
      for (const m of entry.morphemes as Morpheme[]) {
        if (m.irregular) continue;
        const gloss = m.meaning.toLowerCase();
        const backedByText = evidence.toLowerCase().includes(gloss);
        if (SINGLE_KANJI_WITH_OKURIGANA.test(m.text)) {
          const char = [...m.text][0]!;
          const k = allKanji[char];
          if (!k) {
            problems.push(
              `${m.text}: ${char} has no KANJIDIC2 evidence (mark it irregular, or seed it)`,
            );
            continue;
          }
          if (!readingFits(char, toHiragana(m.base ?? m.reading))) {
            problems.push(
              `${m.text}: ${m.base ?? m.reading} is not a KANJIDIC2 reading of ${char}`,
            );
          }
          // A part written with okurigana (見舞う, 売り) only has them if
          // KANJIDIC2 gives the kanji a kun'yomi that takes okurigana.
          if (
            m.glossSource === "kanjidic2" &&
            [...m.text].length > 1 &&
            !k.kun.some((r) => r.includes("."))
          ) {
            problems.push(
              `${m.text}: KANJIDIC2 lists no okurigana for ${char}`,
            );
          }
          const backedByKanji = k.meanings.some(
            (x) => x.toLowerCase() === gloss,
          );
          if (!backedByKanji && !backedByText) {
            problems.push(
              `${m.text}: “${m.meaning}” is in neither KANJIDIC2's meanings nor the cited text`,
            );
          }
        } else if (!backedByText) {
          problems.push(`${m.text}: “${m.meaning}” is not in the cited text`);
        }
      }
      expect(problems).toEqual([]);
    });

    it("quotes only Wiktionary lines from the section for its own reading", () => {
      const snap = snapshot.entries[term];
      expect(
        snap,
        `no snapshot for ${term} — run pnpm data:etymology`,
      ).toBeDefined();
      expect(entry.sources.length).toBeGreaterThan(0);
      const hira = toHiragana(entry.kana);
      // Verb/adjective templates declare only a stem (せお for せおう).
      const covers = (declared: string[]) =>
        declared.some(
          (r) =>
            r === hira ||
            (r.length >= 2 &&
              hira.startsWith(r) &&
              hira.length - r.length <= 2),
        );
      const katakana = /^[\p{sc=Katakana}ー]+$/u.test(entry.term);
      let sections =
        snap!.etymologies.length === 1
          ? snap!.etymologies
          : snap!.etymologies.filter((e) => covers(e.readings));
      // Loanword pages declare no reading: their sections are alternative
      // etymologies of the one spelling.
      if (
        sections.length === 0 &&
        katakana &&
        snap!.etymologies.every((e) => e.readings.length === 0)
      )
        sections = snap!.etymologies;
      expect(
        sections.length,
        `${term}: no Etymology section is declared for ${entry.kana}`,
      ).toBeGreaterThan(0);
      const own = normalize(sections.map((e) => e.text).join("\n"));
      const strays = entry.sources
        .map((x) => normalize(x.quote))
        .filter((q) => !own.includes(q));
      expect(strays, "quotes not found in this reading's section").toEqual([]);
      expect(entry.wiktionaryDump).toBe(snapshot.meta?.dump);
    });

    it("carries JMdict's own part-of-speech tags", () => {
      const vocab = loadReference(entry.level).vocab.find(
        (v) => v.term === entry.term && v.kana === entry.kana,
      )!;
      const hira = toHiragana(entry.kana);
      const own = vocab.jmdict.filter((j) =>
        j.readings.some((r) => toHiragana(r) === hira),
      );
      const allowed = new Set(
        own.flatMap((j) => j.senses.flatMap((s) => s.pos)),
      );
      expect(
        entry.pos.filter((t) => !allowed.has(t)),
        "tags JMdict does not give",
      ).toEqual([]);
      if (allowed.size > 0) expect(entry.pos.length).toBeGreaterThan(0);
      else expect(entry.pos).toEqual([]);
    });

    it("only mentions Japanese that its evidence or the pool contains", () => {
      const known = (run: string) =>
        evidencePlain.includes(run) ||
        evidence.includes(run) ||
        poolJapanese.has(run) ||
        [entry.term, entry.kana].some((s) => s.includes(run)) ||
        entry.morphemes.some((m) =>
          [m.text, m.reading, m.base ?? ""].some((s) => s.includes(run)),
        );
      const unknown = [
        ...new Set(entryText(entry).match(JAPANESE_RUN) ?? []),
      ].filter((run) => !known(run));
      expect(unknown, "Japanese in the prose that no evidence backs").toEqual(
        [],
      );
    });

    it("shows a hedge wherever it says the origin is unclear", () => {
      if (entry.processes.includes("unclear")) {
        expect(
          entry.sources.some((x) => isHedged(x.quote)),
          "an “unclear” origin must quote the hedge that says so",
        ).toBe(true);
      }
    });
  },
);

describe("data/reference/etymology/", () => {
  it("has no pins for words that are not in the catalogue", () => {
    const used = new Set(WORD_ENTRIES.map((e) => e.term));
    const orphans = Object.keys(snapshot.entries).filter((t) => !used.has(t));
    expect(
      orphans,
      "re-run pnpm data:etymology after removing an entry",
    ).toEqual([]);
  });

  it("keeps each pin in the shard of the month that plans its word", () => {
    const root = resolve(import.meta.dirname, "../..");
    const dir = resolve(root, "data/reference/etymology");
    const months: Record<string, string> = planMonths(root);
    const misplaced: string[] = [];
    for (const file of readdirSync(dir)) {
      if (file === "meta.json") continue;
      const shard = file.replace(/\.json$/, "");
      const terms = Object.keys(
        JSON.parse(readFileSync(resolve(dir, file), "utf8")),
      );
      for (const term of terms)
        if ((months[term] ?? "unplanned") !== shard)
          misplaced.push(`${term} is in ${file}`);
    }
    expect(misplaced, "re-run pnpm data:etymology").toEqual([]);
  });

  it("records its source and license", () => {
    const meta = snapshot.meta;
    expect(meta?.source).toMatch(/Wiktionary/);
    expect(meta?.license).toMatch(/CC BY-SA/);
  });

  it("names the pinned dump it was read from", () => {
    expect(snapshot.meta?.dump).toBe(WIKTIONARY_DUMP.dump);
    expect(snapshot.meta?.sha256).toBe(WIKTIONARY_DUMP.sha256);
  });
});
