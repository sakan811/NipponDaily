import { describe, it, expect, beforeEach } from "vitest";
import {
  getCronGenerateDailyGameHandler,
  setupDefaults,
  mockGetDailyGame,
  mockGetDailyGames,
  mockSaveDailyGame,
  mockGetFullPool,
  createMockPool,
  createMockDailyGame,
} from "./setup";

const CRON_SECRET = "test-cron-secret";

describe("GET /api/cron/generate-daily-game", () => {
  beforeEach(() => {
    setupDefaults();
    process.env.CRON_SECRET = CRON_SECRET;
    (global as any).getHeader.mockReturnValue(undefined);
  });

  it("rejects a request with no Authorization header", async () => {
    const handler = await getCronGenerateDailyGameHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mockSaveDailyGame).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong bearer token", async () => {
    (global as any).getHeader.mockReturnValue("Bearer wrong-token");

    const handler = await getCronGenerateDailyGameHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects when CRON_SECRET is not configured", async () => {
    process.env.CRON_SECRET = "";
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);

    const handler = await getCronGenerateDailyGameHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("builds and persists today's game when none exists yet", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockResolvedValue(null);
    mockGetFullPool.mockResolvedValue(createMockPool());

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.created).toBe(true);
    expect(mockSaveDailyGame).toHaveBeenCalledTimes(1);
    const savedGame = mockSaveDailyGame.mock.calls[0]![0];
    expect(savedGame.questions).toHaveLength(20);
  });

  it("is idempotent — does not overwrite an already-generated game", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockResolvedValue(createMockDailyGame());

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    expect(result.data.created).toBe(false);
    expect(mockSaveDailyGame).not.toHaveBeenCalled();
  });

  it("excludes items used in recent days when building the game", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockResolvedValue(null);
    const pool = createMockPool();
    mockGetFullPool.mockResolvedValue(pool);
    // Exhaust all but one hiragana id across "recent" games, forcing the
    // fresh-candidate pool below QUESTIONS_PER_KIND so the fallback-to-full
    // -pool path is exercised.
    mockGetDailyGames.mockResolvedValue([
      createMockDailyGame({
        date: "2026-09-19",
        questions: pool.hiragana.slice(0, 5).map((item) => ({
          id: item.id,
          kind: "hiragana" as const,
          prompt: item.char,
          correctAnswer: item.romaji,
          choices: [item.romaji],
        })),
      }),
    ]);

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    expect(result.data.created).toBe(true);
    const savedGame = mockSaveDailyGame.mock.calls[0]![0];
    expect(
      savedGame.questions.filter((q: any) => q.kind === "hiragana"),
    ).toHaveLength(5);
  });
});
