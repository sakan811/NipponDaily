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

  it("builds and persists every level's game (N5/N4/N3/N2 + ALL) when none exist yet", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockResolvedValue(null);
    mockGetFullPool.mockResolvedValue(createMockPool());

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.results).toEqual(
      expect.arrayContaining(
        ["N5", "N4", "N3", "N2", "ALL"].map((level) => ({
          level,
          created: true,
        })),
      ),
    );
    expect(result.data.results).toHaveLength(5);
    expect(mockSaveDailyGame).toHaveBeenCalledTimes(5);
    for (const call of mockSaveDailyGame.mock.calls) {
      expect(call[0].questions).toHaveLength(20);
    }
  });

  it("is idempotent per level — skips a level whose game already exists", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockImplementation((_date: string, level = "N5") =>
      Promise.resolve(level === "N5" ? createMockDailyGame() : null),
    );
    mockGetFullPool.mockResolvedValue(createMockPool());

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    const n5Result = result.data.results.find((r: any) => r.level === "N5");
    expect(n5Result.created).toBe(false);
    const otherResults = result.data.results.filter(
      (r: any) => r.level !== "N5",
    );
    expect(otherResults).toHaveLength(4);
    expect(otherResults.every((r: any) => r.created)).toBe(true);
    // Only the 4 non-N5 levels should have triggered a save.
    expect(mockSaveDailyGame).toHaveBeenCalledTimes(4);
  });

  it("excludes items used in recent days when building each level's game", async () => {
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

    expect(result.data.results.every((r: any) => r.created)).toBe(true);
    // Only N5's round draws hiragana at all (see server/utils/daily-game.ts's
    // kindsForLevel) — that's the one whose fallback-to-full-pool path this
    // test exercises.
    const n5Call = mockSaveDailyGame.mock.calls.find(
      (call: any) => call[0].level === "N5",
    );
    expect(
      n5Call[0].questions.filter((q: any) => q.kind === "hiragana"),
    ).toHaveLength(5);
  });

  it("a failing level doesn't block the others from being generated", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetDailyGame.mockImplementation((_date: string, level = "N5") =>
      level === "N3"
        ? Promise.reject(new Error("redis unavailable"))
        : Promise.resolve(null),
    );
    mockGetFullPool.mockResolvedValue(createMockPool());

    const handler = await getCronGenerateDailyGameHandler();
    const result = await handler({} as any);

    const n3Result = result.data.results.find((r: any) => r.level === "N3");
    expect(n3Result.created).toBe(false);
    expect(n3Result.error).toBe("redis unavailable");
    const otherResults = result.data.results.filter(
      (r: any) => r.level !== "N3",
    );
    expect(otherResults.every((r: any) => r.created)).toBe(true);
    expect(mockSaveDailyGame).toHaveBeenCalledTimes(4);
  });
});
