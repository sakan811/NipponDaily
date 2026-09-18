import { vi } from "vitest";
import type { DailyGame, GameQuestion } from "~~/types/index";

export const makeQuestion = (
  overrides: Partial<GameQuestion> = {},
): GameQuestion => ({
  id: "水",
  kind: "kanji",
  prompt: "水",
  correctAnswer: "water",
  choices: ["water", "fire", "tree", "person"],
  ...overrides,
});

export const makeDailyGame = (questions?: GameQuestion[]): DailyGame => ({
  date: "2026-09-18",
  questions: questions ?? [
    makeQuestion({ id: "水", correctAnswer: "water" }),
    makeQuestion({
      id: "火",
      correctAnswer: "fire",
      choices: ["fire", "water", "tree", "person"],
    }),
  ],
  generatedAt: Date.now(),
  source: "agent",
});

export const mockFetchGame = (game: DailyGame) => {
  (global as any).$fetch = vi.fn().mockResolvedValue({
    success: true,
    data: game,
    timestamp: new Date().toISOString(),
  });
};

export const mockFetchGameError = (error: unknown) => {
  (global as any).$fetch = vi.fn().mockRejectedValue(error);
};
