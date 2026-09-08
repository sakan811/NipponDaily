import { Redis } from "@upstash/redis";
import type { Lesson } from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis CRUD for standalone {@link Lesson} records. Each lesson is one Japanese
 * news article plus the lesson authored from it — there is no clustering.
 */
class LessonsService {
  private client: Redis | null = null;
  private memoryLessons = new Map<string, Lesson>();
  private memoryProcessedArticles = new Set<string>();
  private memoryLastIngestTime: number = 0;
  private memoryDomainCredibility = new Map<string, number>();

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

  async saveLesson(lesson: Lesson): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryLessons.set(lesson.id, lesson);
      return;
    }

    try {
      await redis.set(`lesson:${lesson.id}`, JSON.stringify(lesson));
      await redis.sadd("news:lessons", lesson.id);
    } catch (e) {
      console.error(`Error saving lesson ${lesson.id} to Redis:`, e);
      this.memoryLessons.set(lesson.id, lesson);
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

  async deleteLesson(lessonId: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryLessons.delete(lessonId);
      return;
    }

    try {
      await redis.del(`lesson:${lessonId}`);
      await redis.srem("news:lessons", lessonId);
    } catch (e) {
      console.error(`Error deleting lesson ${lessonId} from Redis:`, e);
      this.memoryLessons.delete(lessonId);
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
