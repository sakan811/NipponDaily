import { Redis } from "@upstash/redis";
import type {
  DailyGame,
  KanaCharacter,
  N5Kanji,
  N5PoolKind,
  N5Vocab,
} from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis reads for the static N5 kanji/vocab/kana pool (written by the
 * offline scripts/seed-n5-data.mjs script, not by this service) plus
 * read/write for the per-date DailyGame record it persists.
 */
const DAILY_GAME_INDEX_KEY = "n5:daily_game_index";

type PoolItem = N5Kanji | N5Vocab | KanaCharacter;

class N5DataService {
  private client: Redis | null = null;
  private memoryDailyGames = new Map<string, DailyGame>();
  private memoryDailyGameDates: string[] = [];

  private getRedisClient(): Redis | null {
    if (this.client) return this.client;

    try {
      const url = getEnvOrConfig(
        "upstashRedisRestUrl",
        "UPSTASH_REDIS_REST_URL",
      );
      const token = getEnvOrConfig(
        "upstashRedisRestToken",
        "UPSTASH_REDIS_REST_TOKEN",
      );

      if (!url || !token) {
        return null;
      }

      this.client = new Redis({ url, token });
      return this.client;
    } catch (e) {
      console.warn("Failed to initialize Redis client:", e);
      return null;
    }
  }

  private async getPool<T extends PoolItem>(
    idsKey: string,
    keyPrefix: string,
  ): Promise<T[]> {
    const redis = this.getRedisClient();
    if (!redis) return [];

    try {
      const ids = await redis.smembers(idsKey);
      if (ids.length === 0) return [];
      const keys = ids.map((id) => `${keyPrefix}${id}`);
      const results = await redis.mget<T[]>(...keys);
      return results.filter((item): item is T => item !== null);
    } catch (e) {
      console.error(`Error reading pool ${idsKey} from Redis:`, e);
      return [];
    }
  }

  async getKanjiPool(): Promise<N5Kanji[]> {
    return this.getPool<N5Kanji>("n5:kanji_ids", "n5:kanji:");
  }

  async getVocabPool(): Promise<N5Vocab[]> {
    return this.getPool<N5Vocab>("n5:vocab_ids", "n5:vocab:");
  }

  async getHiragana(): Promise<KanaCharacter[]> {
    return this.getPool<KanaCharacter>("n5:hiragana_ids", "n5:hiragana:");
  }

  async getKatakana(): Promise<KanaCharacter[]> {
    return this.getPool<KanaCharacter>("n5:katakana_ids", "n5:katakana:");
  }

  async getFullPool(): Promise<{
    kanji: N5Kanji[];
    vocab: N5Vocab[];
    hiragana: KanaCharacter[];
    katakana: KanaCharacter[];
  }> {
    const [kanji, vocab, hiragana, katakana] = await Promise.all([
      this.getKanjiPool(),
      this.getVocabPool(),
      this.getHiragana(),
      this.getKatakana(),
    ]);
    return { kanji, vocab, hiragana, katakana };
  }

  /**
   * A random subset of one pool kind, excluding any given ids — backs the
   * get_n5_pool MCP tool so the daily agent never has to read the full
   * ~1,000-item pool just to pick ~20 items for one day's game.
   */
  async sampleKind(
    kind: N5PoolKind,
    count: number,
    excludeIds: string[] = [],
  ): Promise<PoolItem[]> {
    const pool = await (kind === "kanji"
      ? this.getKanjiPool()
      : kind === "vocab"
        ? this.getVocabPool()
        : kind === "hiragana"
          ? this.getHiragana()
          : this.getKatakana());

    const excluded = new Set(excludeIds);
    const candidates = pool.filter((item) => !excluded.has(item.id));
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async getDailyGame(date: string): Promise<DailyGame | null> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryDailyGames.get(date) ?? null;
    }

    try {
      return await redis.get<DailyGame>(`n5:daily_game:${date}`);
    } catch (e) {
      console.error(`Error getting daily game ${date} from Redis:`, e);
      return this.memoryDailyGames.get(date) ?? null;
    }
  }

  async saveDailyGame(game: DailyGame): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryDailyGames.set(game.date, game);
      if (!this.memoryDailyGameDates.includes(game.date)) {
        this.memoryDailyGameDates.push(game.date);
      }
      return;
    }

    try {
      await redis.set(`n5:daily_game:${game.date}`, JSON.stringify(game));
      await redis.zadd(DAILY_GAME_INDEX_KEY, {
        score: game.generatedAt,
        member: game.date,
      });
    } catch (e) {
      console.error(`Error saving daily game ${game.date} to Redis:`, e);
      this.memoryDailyGames.set(game.date, game);
      if (!this.memoryDailyGameDates.includes(game.date)) {
        this.memoryDailyGameDates.push(game.date);
      }
    }
  }

  async getRecentDailyGameDates(limit: number): Promise<string[]> {
    const redis = this.getRedisClient();
    if (!redis) {
      return [...this.memoryDailyGameDates].reverse().slice(0, limit);
    }

    try {
      return await redis.zrange<string[]>(DAILY_GAME_INDEX_KEY, 0, limit - 1, {
        rev: true,
      });
    } catch (e) {
      console.error("Error getting recent daily game dates from Redis:", e);
      return [...this.memoryDailyGameDates].reverse().slice(0, limit);
    }
  }
}

export const n5DataService = new N5DataService();
export { N5DataService };
