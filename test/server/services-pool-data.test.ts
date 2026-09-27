import { describe, it, expect, vi, beforeEach } from "vitest";

const redisState = {
  smembers: vi.fn(),
  mget: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  sadd: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
};

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function MockRedis() {
    return redisState;
  }),
}));

vi.mock("~/server/utils/config", () => ({
  getEnvOrConfig: vi.fn((_configKey: string, envKey: string) => {
    if (envKey === "UPSTASH_REDIS_REST_URL") return "https://fake-redis";
    if (envKey === "UPSTASH_REDIS_REST_TOKEN") return "fake-token";
    return "";
  }),
}));

describe("PoolDataService", () => {
  let PoolDataService: typeof import("~/server/services/pool-data").PoolDataService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ PoolDataService } = await import("~/server/services/pool-data"));
  });

  it("returns an empty pool when the ids set is empty", async () => {
    redisState.smembers.mockResolvedValue([]);
    const service = new PoolDataService();

    expect(await service.getKanjiPool()).toEqual([]);
    expect(redisState.mget).not.toHaveBeenCalled();
  });

  it("reads a pool by ids set + mget, filtering out nulls", async () => {
    redisState.smembers.mockResolvedValue(["水", "火"]);
    redisState.mget.mockResolvedValue([{ id: "水", character: "水" }, null]);
    const service = new PoolDataService();

    const result = await service.getKanjiPool();

    expect(redisState.mget).toHaveBeenCalledWith("n5:kanji:水", "n5:kanji:火");
    expect(result).toEqual([{ id: "水", character: "水" }]);
  });

  it("falls back to an empty array when Redis throws on a pool read", async () => {
    redisState.smembers.mockRejectedValue(new Error("boom"));
    const service = new PoolDataService();

    expect(await service.getVocabPool()).toEqual([]);
  });

  it("getVocabPool fills in under-glossed meanings from shared/meanings.ts", async () => {
    redisState.smembers.mockResolvedValue(["早い", "速い"]);
    redisState.mget.mockResolvedValue([
      { id: "早い", term: "早い", kana: "はやい", meaning: "early" },
      { id: "速い", term: "速い", kana: "はやい", meaning: "fast, quick" },
    ]);
    const service = new PoolDataService();

    const vocab = await service.getVocabPool();

    expect(vocab[0]!.meaning).toBe("early; quick, soon");
    expect(vocab[1]!.meaning).toBe("fast, quick");
  });

  it("getFullPool reads all four pools in parallel", async () => {
    redisState.smembers.mockResolvedValue([]);
    const service = new PoolDataService();

    const pool = await service.getFullPool();

    expect(pool).toEqual({ kanji: [], vocab: [], hiragana: [], katakana: [] });
  });

  it("getDailyGame reads the per-date key", async () => {
    const game = {
      date: "2026-09-18",
      level: "N5" as const,
      questions: [],
      generatedAt: 1,
      source: "agent",
    };
    redisState.get.mockResolvedValue(game);
    const service = new PoolDataService();

    expect(await service.getDailyGame("2026-09-18")).toEqual(game);
    expect(redisState.get).toHaveBeenCalledWith("n5:daily_game:2026-09-18");
  });

  it("getDailyGame reads a level-namespaced key for a non-N5 level", async () => {
    redisState.get.mockResolvedValue(null);
    const service = new PoolDataService();

    await service.getDailyGame("2026-09-18", "N4");

    expect(redisState.get).toHaveBeenCalledWith("n5:daily_game:2026-09-18:N4");
  });

  it("saveDailyGame writes the record under its per-date key", async () => {
    const game = {
      date: "2026-09-18",
      level: "N5" as const,
      questions: [],
      generatedAt: 42,
      source: "fallback" as const,
    };
    const service = new PoolDataService();

    await service.saveDailyGame(game);

    // NX: never overwrite a game that already exists for the date.
    expect(redisState.set).toHaveBeenCalledWith(
      "n5:daily_game:2026-09-18",
      JSON.stringify(game),
      { nx: true },
    );
  });

  it("saveDailyGame writes a level-namespaced key for a non-N5 level", async () => {
    const game = {
      date: "2026-09-18",
      level: "N3" as const,
      questions: [],
      generatedAt: 42,
      source: "fallback" as const,
    };
    const service = new PoolDataService();

    await service.saveDailyGame(game);

    expect(redisState.set).toHaveBeenCalledWith(
      "n5:daily_game:2026-09-18:N3",
      JSON.stringify(game),
      { nx: true },
    );
  });

  it("falls back to in-memory storage when Redis is unconfigured", async () => {
    vi.doMock("~/server/utils/config", () => ({
      getEnvOrConfig: vi.fn(() => ""),
    }));
    vi.resetModules();
    const { PoolDataService: UnconfiguredService } =
      await import("~/server/services/pool-data");
    const service = new UnconfiguredService();
    const game = {
      date: "2026-09-18",
      level: "N5" as const,
      questions: [],
      generatedAt: 1,
      source: "fallback" as const,
    };

    await service.saveDailyGame(game);

    expect(await service.getDailyGame("2026-09-18")).toEqual(game);
    expect(await service.getKanjiPool()).toEqual([]);

    vi.doMock("~/server/utils/config", () => ({
      getEnvOrConfig: vi.fn((_configKey: string, envKey: string) => {
        if (envKey === "UPSTASH_REDIS_REST_URL") return "https://fake-redis";
        if (envKey === "UPSTASH_REDIS_REST_TOKEN") return "fake-token";
        return "";
      }),
    }));
  });
});
