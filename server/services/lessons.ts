import { Redis } from "@upstash/redis";
import type { Lesson } from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";
import { analyzeJapanese } from "../utils/tokenizer";

/**
 * Redis CRUD for standalone {@link Lesson} records. Each lesson is one Japanese
 * news article plus the lesson authored from it — there is no clustering.
 */
const URL_INDEX_KEY = "news:url_index";
const URL_INDEX_BACKFILLED_KEY = "news:url_index_backfilled";

class LessonsService {
  private client: Redis | null = null;
  private memoryLessons = new Map<string, Lesson>();
  private memoryProcessedArticles = new Set<string>();
  private memoryLastIngestTime: number = 0;
  private memoryDomainCredibility = new Map<string, number>();
  private memoryUrlIndex = new Map<string, string>();

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

  async getLesson(lessonId: string): Promise<Lesson | null> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryLessons.get(lessonId) || null;
    }

    try {
      return await redis.get<Lesson>(`lesson:${lessonId}`);
    } catch (e) {
      console.error(`Error getting lesson ${lessonId} from Redis:`, e);
      return this.memoryLessons.get(lessonId) || null;
    }
  }

  /**
   * Auto-tokenizes `originalText` into a draft `tokens` the moment it's
   * stored without any tokens of its own — the MCP agent reviews/corrects
   * this draft against the article and supplies its own final `tokens` on a
   * later `upsert_lesson` call, which replaces the draft outright (so this
   * never re-runs once real tokens exist).
   */
  async saveLesson(lesson: Lesson): Promise<void> {
    if (lesson.originalText && !lesson.tokens?.length) {
      lesson.tokens = await analyzeJapanese(lesson.originalText);
    }

    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryLessons.set(lesson.id, lesson);
      this.memoryUrlIndex.set(lesson.url, lesson.id);
      return;
    }

    try {
      await redis.set(`lesson:${lesson.id}`, JSON.stringify(lesson));
      await redis.sadd("news:lessons", lesson.id);
      // Kept in sync so getLessonIdByUrl can look up a lesson by url in a
      // single hget instead of scanning every stored lesson.
      await redis.hset(URL_INDEX_KEY, { [lesson.url]: lesson.id });
    } catch (e) {
      console.error(`Error saving lesson ${lesson.id} to Redis:`, e);
      this.memoryLessons.set(lesson.id, lesson);
      this.memoryUrlIndex.set(lesson.url, lesson.id);
    }
  }

  async getLessonIds(): Promise<string[]> {
    const redis = this.getRedisClient();
    if (!redis) {
      return Array.from(this.memoryLessons.keys());
    }

    try {
      return await redis.smembers("news:lessons");
    } catch (e) {
      console.error("Error getting lesson IDs from Redis:", e);
      return Array.from(this.memoryLessons.keys());
    }
  }

  async getLessons(): Promise<Lesson[]> {
    const ids = await this.getLessonIds();
    if (ids.length === 0) return [];

    const redis = this.getRedisClient();
    if (!redis) {
      return ids
        .map((id) => this.memoryLessons.get(id))
        .filter((l): l is Lesson => l !== undefined);
    }

    try {
      const keys = ids.map((id) => `lesson:${id}`);
      const results = await redis.mget<Lesson[]>(...keys);
      return results.filter((l): l is Lesson => l !== null);
    } catch (e) {
      console.error("Error getting lessons from Redis:", e);
      return ids
        .map((id) => this.memoryLessons.get(id))
        .filter((l): l is Lesson => l !== undefined);
    }
  }

  /**
   * `url` is optional but should be passed whenever the caller already has
   * it (e.g. cleanup) so the url index doesn't accumulate stale entries.
   */
  async deleteLesson(lessonId: string, url?: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryLessons.delete(lessonId);
      if (url) this.memoryUrlIndex.delete(url);
      return;
    }

    try {
      await redis.del(`lesson:${lessonId}`);
      await redis.srem("news:lessons", lessonId);
      if (url) await redis.hdel(URL_INDEX_KEY, url);
    } catch (e) {
      console.error(`Error deleting lesson ${lessonId} from Redis:`, e);
      this.memoryLessons.delete(lessonId);
      if (url) this.memoryUrlIndex.delete(url);
    }
  }

  async isArticleProcessed(url: string): Promise<boolean> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryProcessedArticles.has(url);
    }

    try {
      const isMember = await redis.sismember("news:processed_articles", url);
      return isMember === 1;
    } catch (e) {
      console.error(`Error checking if article ${url} is processed:`, e);
      return this.memoryProcessedArticles.has(url);
    }
  }

  async markArticleProcessed(url: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryProcessedArticles.add(url);
      return;
    }

    try {
      await redis.sadd("news:processed_articles", url);
    } catch (e) {
      console.error(`Error marking article ${url} as processed:`, e);
      this.memoryProcessedArticles.add(url);
    }
  }

  /**
   * Batched equivalent of calling {@link isArticleProcessed} once per url —
   * a single Redis round-trip instead of one per url.
   */
  async areUrlsProcessed(urls: string[]): Promise<boolean[]> {
    if (urls.length === 0) return [];

    const redis = this.getRedisClient();
    if (!redis) {
      return urls.map((url) => this.memoryProcessedArticles.has(url));
    }

    try {
      const flags = await redis.smismember("news:processed_articles", urls);
      return flags.map((flag) => flag === 1);
    } catch (e) {
      console.error("Error checking processed urls in Redis:", e);
      return urls.map((url) => this.memoryProcessedArticles.has(url));
    }
  }

  /**
   * O(1) lookup of a lesson's id by its url via a Redis hash kept in sync by
   * {@link saveLesson}/{@link deleteLesson}, instead of scanning every stored
   * lesson. Lessons written before this index existed are backfilled into it
   * once, the first time this (or any url lookup) runs against Redis.
   */
  async getLessonIdByUrl(url: string): Promise<string | null> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryUrlIndex.get(url) ?? null;
    }

    try {
      await this.ensureUrlIndexBackfilled(redis);
      const id = await redis.hget<string>(URL_INDEX_KEY, url);
      return id ?? null;
    } catch (e) {
      console.error(`Error looking up lesson id for url ${url}:`, e);
      return this.memoryUrlIndex.get(url) ?? null;
    }
  }

  private async ensureUrlIndexBackfilled(redis: Redis): Promise<void> {
    try {
      const migrated = await redis.get<string>(URL_INDEX_BACKFILLED_KEY);
      if (migrated) return;

      const all = await this.getLessons();
      if (all.length > 0) {
        const mapping: Record<string, string> = {};
        for (const lesson of all) mapping[lesson.url] = lesson.id;
        await redis.hset(URL_INDEX_KEY, mapping);
      }
      await redis.set(URL_INDEX_BACKFILLED_KEY, "1");
    } catch (e) {
      console.error("Error backfilling lesson url index:", e);
    }
  }

  async removeProcessedArticle(url: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryProcessedArticles.delete(url);
      return;
    }

    try {
      await redis.srem("news:processed_articles", url);
    } catch (e) {
      console.error(`Error removing processed article ${url} from Redis:`, e);
      this.memoryProcessedArticles.delete(url);
    }
  }

  async getDomainCredibility(domain: string): Promise<number | null> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryDomainCredibility.get(domain) ?? null;
    }

    try {
      const val = await redis.hget<number>("news:domain_credibility", domain);
      return val ?? null;
    } catch (e) {
      console.error(`Error getting credibility for domain ${domain}:`, e);
      return this.memoryDomainCredibility.get(domain) ?? null;
    }
  }

  async setDomainCredibility(domain: string, score: number): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryDomainCredibility.set(domain, score);
      return;
    }

    try {
      await redis.hset("news:domain_credibility", { [domain]: score });
    } catch (e) {
      console.error(`Error setting credibility for domain ${domain}:`, e);
      this.memoryDomainCredibility.set(domain, score);
    }
  }

  async getLastIngestTime(): Promise<number> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryLastIngestTime;
    }

    try {
      const val = await redis.get<string>("news:last_ingest");
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      console.error("Error getting last ingest time from Redis:", e);
      return this.memoryLastIngestTime;
    }
  }

  async setLastIngestTime(time: number): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryLastIngestTime = time;
      return;
    }

    try {
      await redis.set("news:last_ingest", time.toString());
    } catch (e) {
      console.error("Error setting last ingest time in Redis:", e);
      this.memoryLastIngestTime = time;
    }
  }
}

export const lessonsService = new LessonsService();
export { LessonsService };
