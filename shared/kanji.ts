/**
 * The kanji index: KANJIDIC2's record of each character the open words are
 * written with, and which open words use it. The records are the committed
 * data/reference/kanji.json (`pnpm data:kanji`), the same KANJIDIC2 data the
 * entries' readings and layers are checked against, with each character's
 * strokes from data/reference/strokes.json (`pnpm data:strokes`, KanjiVG) and
 * the shapes it contains from data/reference/components.json
 * (`pnpm data:components`, KRADFILE), so
 * nothing here is a new claim: it reads the characters of each term across
 * words.
 *
 * Server and tests only, for the same reason as shared/words.ts: every
 * function takes `today` and looks only at open days, so a kanji used only by
 * an upcoming word is not listed and has no page.
 */
import type { KanjiComponent, KanjiDetail, KanjiSummary } from "~~/types/index";
import kanjiReference from "~~/data/reference/kanji.json";
import strokeReference from "~~/data/reference/strokes.json";
import componentReference from "~~/data/reference/components.json";
import { distinctKanji as kanjiOf } from "./japanese";
import { KANJI_ALSO_LIMIT } from "./limits";
import { partDetail, refOf } from "./parts";
import { WORD_ENTRIES, todayJst } from "./words";

interface KanjiRecord {
  strokeCount: number;
  grade?: number;
  freq?: number;
  on: string[];
  kun: string[];
  meanings: string[];
}

const RECORDS = kanjiReference.kanji as Record<string, KanjiRecord>;
const STROKES = strokeReference.strokes as Record<string, string[]>;
const COMPONENTS = componentReference.components as Record<string, string[]>;

/** Every kanji an open word is written with: most-used first, then by grade
 *  (earlier grades first, the ungraded last), then by character. */
export function kanjiIndex(today: string = todayJst()): KanjiSummary[] {
  const counts = new Map<string, number>();
  for (const e of WORD_ENTRIES) {
    if (e.date > today) continue;
    for (const c of kanjiOf(e.term)) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const gradeOf = (c: string) => RECORDS[c]?.grade ?? 99;
  return [...counts.entries()]
    .map(([char, count]) => ({
      char,
      count,
      ...(RECORDS[char]?.grade ? { grade: RECORDS[char].grade } : {}),
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        gradeOf(a.char) - gradeOf(b.char) ||
        a.char.localeCompare(b.char, "ja"),
    );
}

/** The shapes a kanji contains, each with the other kanji of open words that
 *  contain it too (a kanji that is the shape itself is not one of them). */
function componentsOf(char: string, index: KanjiSummary[]): KanjiComponent[] {
  const parts = COMPONENTS[char];
  if (!parts) return [];
  const open = new Set(index.map((k) => k.char));
  return parts.map((text) => {
    // `index` is most-used first, so the first few are the ones worth naming.
    const others = index
      .map((k) => k.char)
      .filter((c) => c !== char && c !== text && COMPONENTS[c]?.includes(text));
    return {
      text,
      isKanji: open.has(text),
      also: others.slice(0, KANJI_ALSO_LIMIT),
      alsoCount: others.length,
    };
  });
}

/** One kanji with the open words written with it, or undefined when no open
 *  word uses it. */
export function kanjiDetail(
  char: string,
  today: string = todayJst(),
): KanjiDetail | undefined {
  const record = RECORDS[char];
  if (!record) return undefined;
  const words = WORD_ENTRIES.filter(
    (e) => e.date <= today && kanjiOf(e.term).includes(char),
  ).map(refOf);
  if (!words.length) return undefined;
  return {
    char,
    strokeCount: record.strokeCount,
    ...(record.grade ? { grade: record.grade } : {}),
    ...(record.freq ? { freq: record.freq } : {}),
    on: record.on,
    kun: record.kun,
    meanings: record.meanings,
    count: words.length,
    words,
    isPart: partDetail(char, today) !== undefined,
    ...(STROKES[char] ? { strokes: STROKES[char] } : {}),
    ...(COMPONENTS[char]
      ? { components: componentsOf(char, kanjiIndex(today)) }
      : {}),
  };
}
