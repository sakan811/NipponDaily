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

describe("N5DataService", () => {
  let N5DataService: typeof import("~/server/services/n5-data").N5DataService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ N5DataService } = await import("~/server/services/n5-data"));
  });

  it("returns an empty pool when the ids set is empty", async () => {
    redisState.smembers.mockResolvedValue([]);
    const service = new N5DataService();

    expect(await service.getKanjiPool()).toEqual([]);
    expect(redisState.mget).not.toHaveBeenCalled();
  });

  it("reads a pool by ids set + mget, filtering out nulls", async () => {
    redisState.smembers.mockResolvedValue(["水", "火"]);
    redisState.mget.mockResolvedValue([{ id: "水", character: "水" }, null]);
    const service = new N5DataService();

    const result = await service.getKanjiPool();

    expect(redisState.mget).toHaveBeenCalledWith("n5:kanji:水", "n5:kanji:火");
    expect(result).toEqual([{ id: "水", character: "水" }]);
  });

  it("falls back to an empty array when Redis throws on a pool read", async () => {
    redisState.smembers.mockRejectedValue(new Error("boom"));
    const service = new N5DataService();

    expect(await service.getVocabPool()).toEqual([]);
  });

  it("getFullPool reads all four pools in parallel", async () => {
    redisState.smembers.mockResolvedValue([]);
    const service = new N5DataService();

    const pool = await service.getFullPool();

    expect(pool).toEqual({ kanji: [], vocab: [], hiragana: [], katakana: [] });
  });

  it("getDailyGame reads the per-date key", async () => {
    const game = {
      date: "2026-09-18",
      questions: [],
      generatedAt: 1,
      source: "agent",
    };
    redisState.get.mockResolvedValue(game);
    const service = new N5DataService();

    expect(await service.getDailyGame("2026-09-18")).toEqual(game);
    expect(redisState.get).toHaveBeenCalledWith("n5:daily_game:2026-09-18");
  });

  it("saveDailyGame writes the record under its per-date key", async () => {
    const game = {
      date: "2026-09-18",
      questions: [],
      generatedAt: 42,
      source: "fallback" as const,
    };
    const service = new N5DataService();

    await service.saveDailyGame(game);

    expect(redisState.set).toHaveBeenCalledWith(
      "n5:daily_game:2026-09-18",
      JSON.stringify(game),
    );
  });

  it("falls back to in-memory storage when Redis is unconfigured", async () => {
    vi.doMock("~/server/utils/config", () => ({
      getEnvOrConfig: vi.fn(() => ""),
    }));
    vi.resetModules();
    const { N5DataService: UnconfiguredService } =
      await import("~/server/services/n5-data");
    const service = new UnconfiguredService();
    const game = {
      date: "2026-09-18",
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
