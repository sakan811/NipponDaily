import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { toHiragana, toRomaji } from "wanakana";
import { WORD_ENTRIES, isValidIsoDate } from "~~/shared/words";
import { WORD_PROCESSES, WORD_STRATA } from "~~/shared/word-labels";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import type { Morpheme, WordEntry } from "~~/types/index";
import { loadReference, type RefKanji } from "./reference";

/**
 * The daily-word entries (data/words/*.json) checked against committed
 * evidence, the same way lessons used to be: dictionary facts against
 * JMdict/KANJIDIC2 (data/reference/n{5,4,3,2}-reference.json) and origin
 * claims against pinned Wiktionary text
 * (data/reference/etymology-reference.json, built by `pnpm data:etymology`).
 *
 * A wrong etymology is a bug, not a typo, so nothing here is taken on trust:
 * every cited quote must be in the snapshot, every morpheme reading must be a
 * real reading of that kanji, and the prose may only mention Japanese that
 * the evidence (or the pool) itself contains.
 */

interface EtymologySnapshot {
  entries: Record<
    string,
    {
      revid: number;
      url: string;
      etymologies: { heading: string; text: string }[];
    }
  >;
}

const snapshot: EtymologySnapshot = JSON.parse(
  readFileSync(
    resolve(
      import.meta.dirname,
      "../../data/reference/etymology-reference.json",
    ),
    "utf8",
  ),
);

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

/** Lower-case a–z only: how romanizations are compared (ime2 → ime). */
const letters = (s: string): string => s.toLowerCase().replace(/[^a-z]/g, "");

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
  return [e.headline, ...e.story, e.uncertainty ?? ""].join("\n");
}

describe("the daily-word catalogue", () => {
  it("has one entry per day, with real unique dates and terms", () => {
    const dates = WORD_ENTRIES.map((e) => e.date);
    expect(dates.filter((d) => !isValidIsoDate(d))).toEqual([]);
    expect(new Set(dates).size).toBe(dates.length);
    const terms = WORD_ENTRIES.map((e) => e.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("covers every day of each month it starts", () => {
    const months = [...new Set(WORD_ENTRIES.map((e) => e.date.slice(0, 7)))];
    for (const month of months) {
      const [y, m] = month.split("-").map(Number) as [number, number];
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const have = WORD_ENTRIES.filter((e) => e.date.startsWith(month)).length;
      expect(have, `${month} should have ${daysInMonth} entries`).toBe(
        daysInMonth,
      );
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
      expect(Object.keys(WORD_STRATA)).toContain(entry.stratum);
      expect(entry.processes.length).toBeGreaterThan(0);
      for (const p of entry.processes)
        expect(Object.keys(WORD_PROCESSES)).toContain(p);
      if (/^[\p{sc=Katakana}ー]+$/u.test(entry.term)) {
        expect(entry.stratum).toBe("gairaigo");
      }
    });

    it("has morphemes that join to its reading (or declares the other reading)", () => {
      if (entry.morphemes.length === 0) {
        expect(entry.processes).toContain("unclear");
        return;
      }
      const joined = toHiragana(entry.morphemes.map((m) => m.reading).join(""));
      const target = toHiragana(entry.partsReading ?? entry.kana);
      expect(joined).toBe(target);

      if (entry.partsReading) {
        // Either the word's other reading in the pool, or an earlier form
        // that the cited etymology itself romanizes.
        const otherReading = allVocab.some(
          (v) =>
            v.term === entry.term &&
            toHiragana(v.kana) === toHiragana(entry.partsReading!),
        );
        const attested = letters(evidence).includes(
          letters(toRomaji(entry.partsReading)),
        );
        expect(
          otherReading || attested,
          `${entry.partsReading} is neither another pool reading of ${entry.term} nor romanized in its evidence`,
        ).toBe(true);
      }
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

    it("cites at least one source, each quoted verbatim from the pinned Wiktionary text", () => {
      expect(
        snapshot.entries[term],
        `no snapshot for ${term} — run pnpm data:etymology`,
      ).toBeDefined();
      expect(entry.sources.length).toBeGreaterThan(0);
      const missing = entry.sources
        .map((s) => normalize(s.quote))
        .filter((q) => !evidence.includes(q));
      expect(missing).toEqual([]);
      expect(entry.wiktionaryRev).toBe(snapshot.entries[term]!.revid);
    });

    it("only mentions Japanese that its evidence or the pool contains", () => {
      const known = (run: string) =>
        evidencePlain.includes(run) ||
        evidence.includes(run) ||
        poolJapanese.has(run) ||
        [entry.term, entry.kana, entry.partsReading ?? ""].some((s) =>
          s.includes(run),
        ) ||
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

    it("flags an unknown or disputed origin", () => {
      if (entry.processes.includes("unclear")) {
        expect(
          entry.uncertainty,
          "an “unclear” origin needs an uncertainty note",
        ).toBeTruthy();
      }
    });
  },
);

describe("data/reference/etymology-reference.json", () => {
  it("has no pins for words that are not in the catalogue", () => {
    const used = new Set(WORD_ENTRIES.map((e) => e.term));
    const orphans = Object.keys(snapshot.entries).filter((t) => !used.has(t));
    expect(
      orphans,
      "re-run pnpm data:etymology after removing an entry",
    ).toEqual([]);
  });

  it("records its source and license", () => {
    const meta = (
      snapshot as unknown as { meta: { source: string; license: string } }
    ).meta;
    expect(meta.source).toMatch(/Wiktionary/);
    expect(meta.license).toMatch(/CC BY-SA/);
  });
});
