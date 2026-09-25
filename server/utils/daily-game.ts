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

/** How many previous days' DailyGame records buildDailyGame avoids repeating
 *  items from (see recentIdsByKind below). 7 days keeps a full week fresh
 *  without starving the smaller kana pools (~55 items each) of candidates. */
export const REPEAT_AVOIDANCE_DAYS = 7;

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

/** Per-kind set of item ids used across a batch of past DailyGames, so
 *  buildDailyGame can steer new picks away from what was already shown
 *  recently. */
function recentIdsByKind(games: DailyGame[]): Record<N5PoolKind, Set<string>> {
  const ids: Record<N5PoolKind, Set<string>> = {
    hiragana: new Set(),
    katakana: new Set(),
    kanji: new Set(),
    vocab: new Set(),
  };
  for (const game of games) {
    for (const question of game.questions) {
      ids[question.kind].add(question.id);
    }
  }
  return ids;
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
 * Builds a full DailyGame deterministically from a date string — the sole
 * path GET /api/daily-game (and the generate-daily-game cron) uses to
 * generate a day's game the first time it's requested. Same date + same
 * recentGames always yields the same game.
 *
 * `recentGames` (typically the last REPEAT_AVOIDANCE_DAYS days, see
 * recentDates) lets each kind's pick avoid items shown on those days, so
 * the same kanji/vocab/kana doesn't turn up again the very next day. If
 * excluding them would leave fewer than QUESTIONS_PER_KIND candidates for
 * a kind — e.g. the ~55-item kana pools under a wide enough window — that
 * kind falls back to picking from its full pool rather than failing.
 */
export function buildDailyGame(
  pool: N5Pool,
  date: string,
  recentGames: DailyGame[] = [],
): DailyGame {
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
  const recentIds = recentIdsByKind(recentGames);

  const questions = shuffle(
    kinds.flatMap((kind) => {
      const fullPool = poolForKind(pool, kind);
      const fresh = fullPool.filter((item) => !recentIds[kind].has(item.id));
      const candidates = fresh.length >= QUESTIONS_PER_KIND ? fresh : fullPool;
      return pick(candidates, QUESTIONS_PER_KIND, rng).map((item) =>
        toQuestion(kind, item, pool, rng),
      );
    }),
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

/** True for a real YYYY-MM-DD calendar date (rejects e.g. 2026-02-30). */
export function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

/** The `days` dates immediately before `date` (UTC), most recent first —
 *  e.g. recentDates("2026-09-20", 3) => ["2026-09-19", "2026-09-18",
 *  "2026-09-17"]. Used to fetch the recent DailyGames buildDailyGame's
 *  repeat-avoidance draws on. */
export function recentDates(date: string, days: number): string[] {
  const base = new Date(`${date}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - (i + 1));
    return d.toISOString().slice(0, 10);
  });
}
