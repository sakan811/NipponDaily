import { describe, it, expect } from "vitest";
import {
  buildDailyGame,
  recentDates,
  type N5Pool,
} from "~/server/utils/daily-game";
import type { DailyGame } from "~~/types/index";

function makePool(size: number): N5Pool {
  return {
    kanji: Array.from({ length: size }, (_, i) => ({
      id: `k${i}`,
      character: `字${i}`,
      meanings: [`meaning${i}`],
      onyomi: [],
      kunyomi: [],
      strokeCount: 5,
      jlptLevel: "N5" as const,
    })),
    vocab: Array.from({ length: size }, (_, i) => ({
      id: `v${i}`,
      term: `語${i}`,
      kana: `ご${i}`,
      romaji: `go${i}`,
      meaning: `word${i}`,
      jlptLevel: "N5" as const,
    })),
    hiragana: Array.from({ length: size }, (_, i) => ({
      id: `h${i}`,
      char: `ひ${i}`,
      script: "hiragana" as const,
      romaji: `hi${i}`,
    })),
    katakana: Array.from({ length: size }, (_, i) => ({
      id: `kt${i}`,
      char: `ヒ${i}`,
      script: "katakana" as const,
      romaji: `hi${i}`,
    })),
  };
}

function gameUsing(date: string, ids: string[]): DailyGame {
  return {
    date,
    questions: ids.map((id) => ({
      id,
      kind: "hiragana" as const,
      prompt: id,
      correctAnswer: id,
      choices: [id],
    })),
    generatedAt: 0,
    source: "fallback",
  };
}

describe("buildDailyGame", () => {
  it("is deterministic for the same date and recentGames", () => {
    const pool = makePool(30);
    const a = buildDailyGame(pool, "2026-09-20");
    const b = buildDailyGame(pool, "2026-09-20");
    expect(a.questions).toEqual(b.questions);
  });

  it("avoids items used in recentGames when enough fresh candidates exist", () => {
    const pool = makePool(30);
    const recent = [
      gameUsing(
        "2026-09-19",
        pool.hiragana.slice(0, 10).map((h) => h.id),
      ),
    ];

    const game = buildDailyGame(pool, "2026-09-20", recent);

    const hiraganaIds = game.questions
      .filter((q) => q.kind === "hiragana")
      .map((q) => q.id);
    const recentIds = new Set(pool.hiragana.slice(0, 10).map((h) => h.id));
    for (const id of hiraganaIds) {
      expect(recentIds.has(id)).toBe(false);
    }
  });

  it("falls back to the full pool for a kind when exclusion would leave too few candidates", () => {
    const pool = makePool(6);
    // Exclude all but 2 hiragana ids — below QUESTIONS_PER_KIND (5).
    const recent = [
      gameUsing(
        "2026-09-19",
        pool.hiragana.slice(0, 4).map((h) => h.id),
      ),
    ];

    const game = buildDailyGame(pool, "2026-09-20", recent);

    expect(game.questions.filter((q) => q.kind === "hiragana")).toHaveLength(5);
  });

  it("throws when the pool is empty", () => {
    expect(() =>
      buildDailyGame(
        { kanji: [], vocab: [], hiragana: [], katakana: [] },
        "2026-09-20",
      ),
    ).toThrow();
  });
});

describe("recentDates", () => {
  it("returns the N days before the given date, most recent first", () => {
    expect(recentDates("2026-09-20", 3)).toEqual([
      "2026-09-19",
      "2026-09-18",
      "2026-09-17",
    ]);
  });

  it("crosses month/year boundaries correctly", () => {
    expect(recentDates("2026-01-01", 2)).toEqual(["2025-12-31", "2025-12-30"]);
  });
});
