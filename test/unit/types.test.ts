import { describe, it, expect } from "vitest";
import type {
  ApiResponse,
  DailyGame,
  GameQuestion,
  KanaCharacter,
  PoolKanji,
  PoolVocab,
} from "~~/types/index";

describe("Types", () => {
  it("validates the KanaCharacter interface", () => {
    const kana: KanaCharacter = {
      id: "あ",
      char: "あ",
      script: "hiragana",
      romaji: "a",
    };

    expect(kana.script).toBe("hiragana");
  });

  it("validates the PoolKanji interface", () => {
    const kanji: PoolKanji = {
      id: "水",
      character: "水",
      meanings: ["water"],
      onyomi: ["スイ"],
      kunyomi: ["みず"],
      strokeCount: 4,
      jlptLevel: "N5",
    };

    expect(kanji.meanings).toContain("water");
  });

  it("validates the PoolVocab interface with optional partOfSpeech", () => {
    const vocab: PoolVocab = {
      id: "taberu",
      term: "食べる",
      kana: "たべる",
      romaji: "taberu",
      meaning: "to eat",
      partOfSpeech: "godan verb",
      jlptLevel: "N5",
    };

    expect(vocab.partOfSpeech).toBe("godan verb");
  });

  it("validates the GameQuestion interface", () => {
    const question: GameQuestion = {
      id: "水",
      kind: "kanji",
      prompt: "水",
      correctAnswer: "water",
      choices: ["water", "fire", "tree", "person"],
    };

    expect(question.choices).toHaveLength(4);
    expect(question.choices).toContain(question.correctAnswer);
  });

  it("validates the DailyGame interface", () => {
    const game: DailyGame = {
      date: "2026-09-18",
      level: "N5",
      questions: [],
      generatedAt: Date.now(),
      source: "fallback",
    };

    expect(game.source).toBe("fallback");
  });

  it("validates ApiResponse generic type", () => {
    const response: ApiResponse<DailyGame> = {
      success: true,
      data: {
        date: "2026-09-18",
        level: "N5",
        questions: [],
        generatedAt: Date.now(),
        source: "agent",
      },
      timestamp: "2026-01-15T10:00:00Z",
    };

    expect(response.success).toBe(true);
  });
});
