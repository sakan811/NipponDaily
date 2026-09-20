import { Redis } from "@upstash/redis";
import type {
  DailyGame,
  KanaCharacter,
  N5Kanji,
  N5Vocab,
} from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis reads for the static N5 kanji/vocab/kana pool (written by the
 * offline scripts/seed-n5-data.mjs script, not by this service) plus
 * read/write for the per-date DailyGame record it persists.
 */
type PoolItem = N5Kanji | N5Vocab | KanaCharacter;

class N5DataService {
  private client: Redis | null = null;
  private memoryDailyGames = new Map<string, DailyGame>();

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
      // Redis set order is unspecified — sort so pool order (and therefore
      // "first match wins" lookups like vocab.vue's term index) is stable
      // across reads instead of depending on smembers' incidental ordering.
      const keys = [...ids].sort().map((id) => `${keyPrefix}${id}`);
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

  /** Batch-reads DailyGame records by date, skipping any that don't exist —
   *  used by buildDailyGame's repeat-avoidance to look back over recent days
   *  (see recentDates in server/utils/daily-game.ts) in one round trip. */
  async getDailyGames(dates: string[]): Promise<DailyGame[]> {
    if (dates.length === 0) return [];

    const redis = this.getRedisClient();
    if (!redis) {
      return dates
        .map((date) => this.memoryDailyGames.get(date))
        .filter((game): game is DailyGame => game != null);
    }

    try {
      const keys = dates.map((date) => `n5:daily_game:${date}`);
      const results = await redis.mget<DailyGame[]>(...keys);
      return results.filter((game): game is DailyGame => game !== null);
    } catch (e) {
      console.error("Error getting recent daily games from Redis:", e);
      return dates
        .map((date) => this.memoryDailyGames.get(date))
        .filter((game): game is DailyGame => game != null);
    }
  }

  async saveDailyGame(game: DailyGame): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryDailyGames.set(game.date, game);
      return;
    }

    try {
      await redis.set(`n5:daily_game:${game.date}`, JSON.stringify(game));
    } catch (e) {
      console.error(`Error saving daily game ${game.date} to Redis:`, e);
      this.memoryDailyGames.set(game.date, game);
    }
  }
}

export const n5DataService = new N5DataService();
export { N5DataService };
