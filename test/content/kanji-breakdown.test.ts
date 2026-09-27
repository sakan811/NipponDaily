import { describe, it, expect } from "vitest";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";
import { meaningsOverlap } from "~~/shared/meanings";
import { reference, KANJI_RE } from "./reference";

/**
 * Checks the kanjiBreakdowns some clusters use to explain a compound word's
 * meaning kanji-by-kanji (e.g. 写真 = 写 "copy" + 真 "true/reality"). Unlike
 * free-text insight/extendedInsight prose, a breakdown makes a structured,
 * checkable claim: which word it decomposes, and what sense each component
 * kanji contributes — verified against the same KANJIDIC2 snapshot
 * vocabulary.test.ts checks word meanings against.
 */

const KANJI_RE_G = new RegExp(KANJI_RE.source, "gu");

describe("kanji breakdowns", () => {
  it("only decomposes a word this cluster actually teaches", () => {
    const bad: string[] = [];
    for (const c of WORD_CLUSTERS) {
      const ids = new Set(c.rows.flatMap((r) => r.terms));
      for (const b of c.kanjiBreakdowns ?? []) {
        if (!ids.has(b.word)) bad.push(`${c.key}: ${b.word}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("covers exactly the word's own kanji, in order", () => {
    const bad: string[] = [];
    for (const c of WORD_CLUSTERS) {
      for (const b of c.kanjiBreakdowns ?? []) {
        const actual = [...b.word.matchAll(KANJI_RE_G)].map((m) => m[0]);
        const claimed = b.parts.map((p) => p.char);
        if (actual.join("") !== claimed.join("")) {
          bad.push(
            `${c.key}: ${b.word} — word's kanji are ${actual.join("")}, breakdown claims ${claimed.join("")}`,
          );
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("only states a sense KANJIDIC2 actually assigns that character", () => {
    const bad: string[] = [];
    for (const c of WORD_CLUSTERS) {
      for (const b of c.kanjiBreakdowns ?? []) {
        for (const part of b.parts) {
          const entry = reference.kanji[part.char];
          if (!entry) {
            bad.push(
              `${c.key}: ${b.word} — ${part.char} has no KANJIDIC2 entry`,
            );
            continue;
          }
          if (!meaningsOverlap(part.meaning, entry.meanings.join("; "))) {
            bad.push(
              `${c.key}: ${b.word} — "${part.meaning}" for ${part.char} doesn't overlap KANJIDIC2's (${entry.meanings.join(", ")})`,
            );
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
