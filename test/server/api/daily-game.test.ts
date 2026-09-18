import { describe, it, expect, beforeEach } from "vitest";
import {
  getHandler,
  setupDefaults,
  mockGetDailyGame,
  mockSaveDailyGame,
  mockGetFullPool,
  createMockPool,
  createMockDailyGame,
} from "./setup";

describe("GET /api/daily-game", () => {
  beforeEach(() => {
    setupDefaults();
  });

  it("returns the stored game for today when one exists", async () => {
    const game = createMockDailyGame();
    mockGetDailyGame.mockResolvedValue(game);

    const handler = await getHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(game);
    expect(mockSaveDailyGame).not.toHaveBeenCalled();
  });

  it("builds and persists a fallback game when none exists yet", async () => {
    mockGetDailyGame.mockResolvedValue(null);
    mockGetFullPool.mockResolvedValue(createMockPool());

    const handler = await getHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.source).toBe("fallback");
    expect(result.data.questions).toHaveLength(20);
    for (const q of result.data.questions) {
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.correctAnswer);
    }
    expect(mockSaveDailyGame).toHaveBeenCalledTimes(1);
  });

  it("respects an explicit ?date= query param", async () => {
    (global as any).getQuery.mockReturnValue({ date: "2026-01-01" });
    mockGetDailyGame.mockResolvedValue(null);

    const handler = await getHandler();
    const result = await handler({} as any);

    expect(mockGetDailyGame).toHaveBeenCalledWith("2026-01-01");
    expect(result.data.date).toBe("2026-01-01");
  });

  it("returns 400 for a malformed date", async () => {
    (global as any).getQuery.mockReturnValue({ date: "not-a-date" });

    const handler = await getHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("returns 500 when the pool is empty and no game is stored", async () => {
    mockGetDailyGame.mockResolvedValue(null);
    mockGetFullPool.mockResolvedValue({
      kanji: [],
      vocab: [],
      hiragana: [],
      katakana: [],
    });

    const handler = await getHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
