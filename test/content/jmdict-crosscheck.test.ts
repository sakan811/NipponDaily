import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { toHiragana } from "wanakana";
import { WORD_ENTRIES } from "~~/shared/words";
import { frequencyOf } from "~~/shared/word-labels";
import { loadReference, type RefEntry } from "./reference";
import {
  loadEtymologySnapshot,
  // @ts-expect-error — untyped .mjs script helper
} from "../../scripts/lib/etymology-snapshot.mjs";

/**
 * What JMdict says about a word, checked against what each entry claims.
 * JMdict is a source independent of Wiktionary, so where the two overlap they
 * can disagree, and where they do it shows. The check only confirms: a
 * jamdict-data build records a loan source only where the entry names the
 * foreign word or marks a coinage made in Japan, so JMdict saying nothing
 * proves nothing.
 */

const snapshot = loadEtymologySnapshot(
  resolve(import.meta.dirname, "../.."),
) as {
  entries: Record<string, { etymologies: { text: string }[] }>;
};

const EUROPEAN = new Set([
  "eng",
  "dut",
  "por",
  "ger",
  "fre",
  "ita",
  "spa",
  "rus",
]);

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9'’ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface JmSense {
  pos: string[];
  glosses: string[];
  loan?: { lang: string; text?: string; wasei?: boolean; partial?: boolean }[];
}
type JmEntry = RefEntry & {
  priority?: Record<string, string[]>;
  info?: Record<string, string[]>;
  senses: JmSense[];
};

/** The JMdict entries that are this word (its spelling and reading), and the
 *  senses among them that share a gloss with the word's meaning. */
function jmdictOf(entry: (typeof WORD_ENTRIES)[number]) {
  const vocab = loadReference(entry.level).vocab.find(
    (v) => v.term === entry.term && v.kana === entry.kana,
  )!;
  const hira = toHiragana(entry.kana);
  const own = (vocab.jmdict as JmEntry[]).filter(
    (j) =>
      j.readings.some((r) => toHiragana(r) === hira) &&
      (j.kanji.includes(entry.term) || toHiragana(entry.term) === hira),
  );
  const meaning = new Set(
    entry.meaning.split(/[,;]/).map(norm).filter(Boolean),
  );
  // The senses the meaning came from, else the entry's first sense.
  const matched =
    own
      .map((j) => ({
        entry: j,
        senses: j.senses.filter((s) =>
          s.glosses.some((g) => meaning.has(norm(g))),
        ),
      }))
      .find((m) => m.senses.length > 0) ??
    (own[0] ? { entry: own[0], senses: own[0].senses.slice(0, 1) } : undefined);
  return { own, matched };
}

describe.each(WORD_ENTRIES.map((e) => [e.date, e.term, e] as const))(
  "%s %s against JMdict",
  (_date, _term, entry) => {
    const { own, matched } = jmdictOf(entry);
    const hira = toHiragana(entry.kana);

    it("carries only priority codes JMdict gives its spelling or reading", () => {
      const given = new Set(
        own.flatMap((j) =>
          Object.entries(j.priority ?? {})
            .filter(
              ([form]) => form === entry.term || toHiragana(form) === hira,
            )
            .flatMap(([, codes]) => codes),
        ),
      );
      expect(
        (entry.priority ?? []).filter((c) => !given.has(c)),
        "codes JMdict does not give",
      ).toEqual([]);
      if (matched) {
        const expected = Object.entries(matched.entry.priority ?? {})
          .filter(([form]) => form === entry.term || toHiragana(form) === hira)
          .flatMap(([, codes]) => codes);
        expect(new Set(entry.priority ?? [])).toEqual(new Set(expected));
      }
    });

    it("is called common only when a first-tier code says so", () => {
      const common = frequencyOf(entry.priority) === "common";
      const firstTier = (entry.priority ?? []).some((c) =>
        ["ichi1", "news1", "spec1", "spec2", "gai1"].includes(c),
      );
      expect(common).toBe(firstTier);
    });

    it("says what JMdict says about how it was made", () => {
      if (!matched) return;
      const loans = matched.senses.flatMap((s) => s.loan ?? []);
      const notes = Object.entries(matched.entry.info ?? {})
        .filter(([form]) => form === entry.term || toHiragana(form) === hira)
        .flatMap(([, tags]) => tags);
      const processes = new Set<string>(entry.processes);
      if (loans.some((l) => l.wasei && EUROPEAN.has(l.lang)))
        expect(processes, "JMdict marks it a coinage made in Japan").toContain(
          "wasei",
        );
      if (notes.some((t) => /ateji|gikun|jukujikun/.test(t)))
        expect(processes, "JMdict marks the spelling ateji").toContain("ateji");
      if (loans.some((l) => !l.wasei && EUROPEAN.has(l.lang))) {
        expect(processes, "JMdict names a loan source").toContain("borrowing");
        // The layer follows the loan unless the cited text itself names a
        // Chinese candidate and hedges (缶: Dutch kan, or Middle Chinese 罐).
        const text = snapshot.entries[entry.term]?.etymologies
          .map((e) => e.text)
          .join("\n");
        if (!/Chinese/.test(text ?? ""))
          expect(entry.stratum, "JMdict names a loan source").toBe("gairaigo");
      }
    });
  },
);
