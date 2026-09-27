import { Redis } from "@upstash/redis";
import type {
  DailyGame,
  JlptLevel,
  KanaCharacter,
  N5Kanji,
  N5Vocab,
} from "~~/types/index";
import { DEFAULT_JLPT_LEVEL } from "~~/shared/jlpt";
import { servedVocab } from "~~/shared/meanings";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis reads for the static kanji/vocab/kana pool (written by the offline
 * scripts/seed-n5-data.mjs script, not by this service) plus read/write for
 * the per-date-per-level DailyGame record it persists.
 *
 * Every pool/game read defaults to "N5" — the only level with hand-authored
 * lesson content and the only one any current API caller actually requests
 * — but every method takes an explicit `level` so N4/N3/N2 are already
 * fully readable once seeded (see scripts/seed-n5-data.mjs).
 */
type PoolItem = N5Kanji | N5Vocab | KanaCharacter;

/**
 * Level-namespaced Redis keys — mirrors scripts/seed-n5-data.mjs's
 * poolIdsKey/poolItemPrefix exactly (the two files can't share code: one
 * runs as a bare `node` process, the other inside the Nuxt server). N5
 * keeps its original, un-namespaced keys so existing production data needs
 * no migration; other levels get their own `:N4`/`:N3`/`:N2`-suffixed keys.
 */
function poolIdsKey(kind: "kanji" | "vocab", level: JlptLevel): string {
  return level === "N5" ? `n5:${kind}_ids` : `n5:${kind}_ids:${level}`;
}
function poolItemPrefix(kind: "kanji" | "vocab", level: JlptLevel): string {
  return level === "N5" ? `n5:${kind}:` : `n5:${kind}:${level}:`;
}
function dailyGameKey(date: string, level: JlptLevel): string {
  return level === "N5"
    ? `n5:daily_game:${date}`
    : `n5:daily_game:${date}:${level}`;
}

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

  async getKanjiPool(
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<N5Kanji[]> {
    return this.getPool<N5Kanji>(
      poolIdsKey("kanji", level),
      poolItemPrefix("kanji", level),
    );
  }

  /** Vocab with shared/meanings.ts's fuller glosses applied, so the game,
   *  the lessons, and the vocab guide all show every everyday sense of a
   *  word the source list under-glossed — without needing a re-seed. Only
   *  N5's corrections/enrichments exist so far, so this is a no-op for
   *  other levels' entries (see docs/content-accuracy.md). */
  async getVocabPool(
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<N5Vocab[]> {
    const vocab = await this.getPool<N5Vocab>(
      poolIdsKey("vocab", level),
      poolItemPrefix("vocab", level),
    );
    return vocab.map(servedVocab);
  }

  /** Shared across every level — hiragana/katakana aren't JLPT-leveled. */
  async getHiragana(): Promise<KanaCharacter[]> {
    return this.getPool<KanaCharacter>("n5:hiragana_ids", "n5:hiragana:");
  }

  async getKatakana(): Promise<KanaCharacter[]> {
    return this.getPool<KanaCharacter>("n5:katakana_ids", "n5:katakana:");
  }

  async getFullPool(level: JlptLevel = DEFAULT_JLPT_LEVEL): Promise<{
    kanji: N5Kanji[];
    vocab: N5Vocab[];
    hiragana: KanaCharacter[];
    katakana: KanaCharacter[];
  }> {
    const [kanji, vocab, hiragana, katakana] = await Promise.all([
      this.getKanjiPool(level),
      this.getVocabPool(level),
      this.getHiragana(),
      this.getKatakana(),
    ]);
    return { kanji, vocab, hiragana, katakana };
  }

  async getDailyGame(
    date: string,
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<DailyGame | null> {
    const memoryKey = `${date}:${level}`;
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryDailyGames.get(memoryKey) ?? null;
    }

    try {
      return await redis.get<DailyGame>(dailyGameKey(date, level));
    } catch (e) {
      console.error(
        `Error getting daily game ${date} (${level}) from Redis:`,
        e,
      );
      return this.memoryDailyGames.get(memoryKey) ?? null;
    }
  }

  /** Batch-reads DailyGame records by date, skipping any that don't exist —
   *  used by buildDailyGame's repeat-avoidance to look back over recent days
   *  (see recentDates in server/utils/daily-game.ts) in one round trip. */
  async getDailyGames(
    dates: string[],
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<DailyGame[]> {
    if (dates.length === 0) return [];

    const redis = this.getRedisClient();
    if (!redis) {
      return dates
        .map((date) => this.memoryDailyGames.get(`${date}:${level}`))
        .filter((game): game is DailyGame => game != null);
    }

    try {
      const keys = dates.map((date) => dailyGameKey(date, level));
      const results = await redis.mget<DailyGame[]>(...keys);
      return results.filter((game): game is DailyGame => game !== null);
    } catch (e) {
      console.error("Error getting recent daily games from Redis:", e);
      return dates
        .map((date) => this.memoryDailyGames.get(`${date}:${level}`))
        .filter((game): game is DailyGame => game != null);
    }
  }

  /** Persists a day's game only if none exists for that date+level yet
   *  (Redis NX), so concurrent first requests / cron retries never
   *  overwrite a game a player may already be playing. The key (and
   *  therefore which level's repeat-avoidance history it feeds) comes from
   *  game.level, not a separate parameter, so it can never drift from what
   *  was actually generated. */
  async saveDailyGame(game: DailyGame): Promise<void> {
    const memoryKey = `${game.date}:${game.level}`;
    const redis = this.getRedisClient();
    if (!redis) {
      if (!this.memoryDailyGames.has(memoryKey)) {
        this.memoryDailyGames.set(memoryKey, game);
      }
      return;
    }

    try {
      await redis.set(
        dailyGameKey(game.date, game.level),
        JSON.stringify(game),
        { nx: true },
      );
    } catch (e) {
      console.error(
        `Error saving daily game ${game.date} (${game.level}) to Redis:`,
        e,
      );
      if (!this.memoryDailyGames.has(memoryKey)) {
        this.memoryDailyGames.set(memoryKey, game);
      }
    }
  }
}

export const n5DataService = new N5DataService();
export { N5DataService };
