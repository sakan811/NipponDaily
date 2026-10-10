/**
 * "More like this": the open words that most resemble one entry, for the row
 * under it. Derived entirely from fields the entries already carry — their
 * parts, processes and layer — so it states nothing a single entry doesn't.
 *
 * Server and tests only, like shared/parts.ts: it reads every entry, so it
 * takes `today` and offers open days only.
 */
import type {
  RelatedShared,
  RelatedWord,
  WordEntry,
  WordProcess,
  WordStratum,
} from "~~/types/index";
import {
  RELATED_LIMIT,
  RELATED_MIN_SCORE,
  RELATED_PART_WEIGHT,
} from "./limits";
import { WORD_ENTRIES, todayJst } from "./words";

/** The open words closest to `entry`, closest first, never the entry itself. */
export function relatedWords(
  entry: WordEntry,
  today: string = todayJst(),
): RelatedWord[] {
  const open = WORD_ENTRIES.filter((e) => e.date <= today);

  const share = (has: (e: WordEntry) => boolean): number =>
    open.filter(has).length / open.length;
  const processShare = (p: WordProcess) =>
    share((e) => e.processes.includes(p));
  const stratumShare = (s: WordStratum) => share((e) => e.stratum === s);

  const parts = new Set(entry.morphemes.map((m) => m.text));
  const processes = new Set(entry.processes);

  const scored = open
    .filter((e) => e.date !== entry.date)
    .map((e) => {
      const shared: RelatedShared = {
        parts: [...new Set(e.morphemes.map((m) => m.text))].filter((t) =>
          parts.has(t),
        ),
        processes: e.processes.filter((p) => processes.has(p)),
        stratum:
          entry.stratum && e.stratum === entry.stratum
            ? entry.stratum
            : undefined,
      };
      const score =
        shared.parts.length * RELATED_PART_WEIGHT +
        shared.processes.reduce((n, p) => n + 1 - processShare(p), 0) +
        (shared.stratum ? 1 - stratumShare(shared.stratum) : 0);
      return { e, shared, score };
    })
    .filter(({ score }) => score >= RELATED_MIN_SCORE);

  // Closest first; among equals, the newest.
  scored.sort((a, b) => b.score - a.score || b.e.date.localeCompare(a.e.date));

  return scored.slice(0, RELATED_LIMIT).map(({ e, shared }) => ({
    date: e.date,
    term: e.term,
    kana: e.kana,
    meaning: e.meaning,
    stratum: e.stratum,
    shared,
  }));
}
