import { Redis } from "@upstash/redis";
import type { JlptLevel, PoolKanji, PoolVocab } from "~~/types/index";
import { DEFAULT_JLPT_LEVEL } from "~~/shared/jlpt";
import { servedVocab } from "~~/shared/meanings";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis reads for the static kanji/vocab pool (written by the offline
 * scripts/seed-pool-data.mjs script, not by this service). Every read takes
 * an explicit `level`, defaulting to "N5". The daily words themselves are not
 * read from here — they are in-repo data (data/words/, see shared/words.ts).
 */
type PoolItem = PoolKanji | PoolVocab;

/**
 * Level-namespaced Redis keys — mirrors scripts/seed-pool-data.mjs's
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

class PoolDataService {
  private client: Redis | null = null;

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
      // "first match wins" lookups) is stable
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
  ): Promise<PoolKanji[]> {
    return this.getPool<PoolKanji>(
      poolIdsKey("kanji", level),
      poolItemPrefix("kanji", level),
    );
  }

  /** Vocab with shared/meanings.ts's corrections and fuller glosses applied,
   *  so a consumer shows every everyday sense of a word the source list
   *  under-glossed — without needing a re-seed (see docs/content-accuracy.md). */
  async getVocabPool(
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<PoolVocab[]> {
    const vocab = await this.getPool<PoolVocab>(
      poolIdsKey("vocab", level),
      poolItemPrefix("vocab", level),
    );
    return vocab.map(servedVocab);
  }
}

export const poolDataService = new PoolDataService();
export { PoolDataService };
