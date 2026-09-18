import { toHiragana } from "wanakana";
import type {
  DailyGame,
  GameQuestion,
  KanaCharacter,
  N5Kanji,
  N5PoolKind,
  N5Vocab,
} from "~~/types/index";

/**
 * Everything needed to build a DailyGame, mirroring N5DataService.getFullPool().
 */
export interface N5Pool {
  kanji: N5Kanji[];
  vocab: N5Vocab[];
  hiragana: KanaCharacter[];
  katakana: KanaCharacter[];
}

const QUESTIONS_PER_KIND = 5;
const DISTRACTOR_COUNT = 3;

/** Deterministic PRNG (mulberry32) — same seed always produces the same
 *  sequence, so a given date's fallback game is stable across repeated
 *  requests before the daily agent's own game overwrites it. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) | 0;
  }
  return hash;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  return arr;
}

function pick<T>(items: T[], count: number, rng: () => number): T[] {
  return shuffle(items, rng).slice(0, count);
}

function poolForKind(
  pool: N5Pool,
  kind: N5PoolKind,
): (N5Kanji | N5Vocab | KanaCharacter)[] {
  switch (kind) {
    case "kanji":
      return pool.kanji;
    case "vocab":
      return pool.vocab;
    case "hiragana":
      return pool.hiragana;
    case "katakana":
      return pool.katakana;
  }
}

function correctAnswerFor(
  kind: N5PoolKind,
  item: N5Kanji | N5Vocab | KanaCharacter,
): string {
  switch (kind) {
    case "kanji":
      return (item as N5Kanji).meanings[0]!;
    case "vocab":
      return (item as N5Vocab).meaning;
    case "hiragana":
    case "katakana":
      return (item as KanaCharacter).romaji;
  }
}

/** KANJIDIC2 kun'yomi separates the kanji-reading part from okurigana with
 *  a "." (e.g. "た.べる" for 食); on'yomi is katakana and may carry a "-"
 *  for rendaku variants. Neither belongs in a standalone character's
 *  furigana, so this returns just the reading for the character itself. */
function kanjiFurigana(item: N5Kanji): string | undefined {
  const kun = item.kunyomi[0];
  if (kun) return kun.split(".")[0];
  const on = item.onyomi[0];
  if (on) return toHiragana(on.replace(/-/g, ""));
  return undefined;
}

function promptFor(
  kind: N5PoolKind,
  item: N5Kanji | N5Vocab | KanaCharacter,
): { prompt: string; promptSub?: string } {
  switch (kind) {
    case "kanji": {
      const k = item as N5Kanji;
      return { prompt: k.character, promptSub: kanjiFurigana(k) };
    }
    case "vocab": {
      const v = item as N5Vocab;
      return { prompt: v.term, promptSub: v.kana };
    }
    case "hiragana":
    case "katakana":
      return { prompt: (item as KanaCharacter).char };
  }
}

function toQuestion(
  kind: N5PoolKind,
  item: N5Kanji | N5Vocab | KanaCharacter,
  pool: N5Pool,
  rng: () => number,
): GameQuestion {
  const correctAnswer = correctAnswerFor(kind, item);
  const candidates = poolForKind(pool, kind).filter(
    (other) => other.id !== item.id,
  );
  const distractors = pick(candidates, DISTRACTOR_COUNT, rng).map((other) =>
    correctAnswerFor(kind, other),
  );
  const choices = shuffle([correctAnswer, ...distractors], rng);
  const { prompt, promptSub } = promptFor(kind, item);

  return {
    id: item.id,
    kind,
    prompt,
    promptSub,
    correctAnswer,
    choices,
  };
}

/**
 * Builds a full DailyGame deterministically from a date string — used as the
 * fallback path in GET /api/daily-game when the daily agent hasn't (yet)
 * called save_daily_game for today. Same date always yields the same game.
 */
export function buildDailyGame(pool: N5Pool, date: string): DailyGame {
  if (
    pool.kanji.length === 0 ||
    pool.vocab.length === 0 ||
    pool.hiragana.length === 0 ||
    pool.katakana.length === 0
  ) {
    throw new Error(
      "N5 pool is empty — run `pnpm seed:n5` to seed kanji/vocab/kana data before requesting a daily game.",
    );
  }

  const rng = mulberry32(seedFromDate(date));
  const kinds: N5PoolKind[] = ["hiragana", "katakana", "kanji", "vocab"];

  const questions = shuffle(
    kinds.flatMap((kind) =>
      pick(poolForKind(pool, kind), QUESTIONS_PER_KIND, rng).map((item) =>
        toQuestion(kind, item, pool, rng),
      ),
    ),
    rng,
  );

  return {
    date,
    questions,
    generatedAt: Date.now(),
    source: "fallback",
  };
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}
