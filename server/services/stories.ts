import { Redis } from "@upstash/redis";
import type { Story } from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";

/**
 * Recalculates trend score based on sources published or added within the last 2 weeks.
 */
export function calculateTrendScore(
  story: Story,
  now: number = Date.now(),
): number {
  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
  const cutoff = now - TWO_WEEKS_MS;
  const recentSources = (story.sources || []).filter((src) => {
    const time = src.addedAt || new Date(src.publishedAt).getTime() || 0;
    return time >= cutoff;
  });
  return recentSources.length;
}

class StoriesService {
  private client: Redis | null = null;
  private memoryStories = new Map<string, Story>();
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

  async getStory(storyId: string): Promise<Story | null> {
    const redis = this.getRedisClient();
    if (!redis) {
      return this.memoryStories.get(storyId) || null;
    }

    try {
      return await redis.get<Story>(`story:${storyId}`);
    } catch (e) {
      console.error(`Error getting story ${storyId} from Redis:`, e);
      return this.memoryStories.get(storyId) || null;
    }
  }

  async saveStory(story: Story): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryStories.set(story.id, story);
      return;
    }

    try {
      await redis.set(`story:${story.id}`, JSON.stringify(story));
      await redis.sadd("news:stories", story.id);
    } catch (e) {
      console.error(`Error saving story ${story.id} to Redis:`, e);
      this.memoryStories.set(story.id, story);
    }
  }

  async getStoryIds(): Promise<string[]> {
    const redis = this.getRedisClient();
    if (!redis) {
      return Array.from(this.memoryStories.keys());
    }

    try {
      return await redis.smembers("news:stories");
    } catch (e) {
      console.error("Error getting story IDs from Redis:", e);
      return Array.from(this.memoryStories.keys());
    }
  }

  async getStories(): Promise<Story[]> {
    const ids = await this.getStoryIds();
    if (ids.length === 0) return [];

    const redis = this.getRedisClient();
    if (!redis) {
      return ids
        .map((id) => this.memoryStories.get(id))
        .filter((s): s is Story => s !== undefined);
    }

    try {
      const keys = ids.map((id) => `story:${id}`);
      const results = await redis.mget<Story[]>(...keys);
      return results.filter((s): s is Story => s !== null);
    } catch (e) {
      console.error("Error getting stories from Redis:", e);
      return ids
        .map((id) => this.memoryStories.get(id))
        .filter((s): s is Story => s !== undefined);
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

  async deleteStory(storyId: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryStories.delete(storyId);
      return;
    }

    try {
      await redis.del(`story:${storyId}`);
      await redis.srem("news:stories", storyId);
    } catch (e) {
      console.error(`Error deleting story ${storyId} from Redis:`, e);
      this.memoryStories.delete(storyId);
    }
  }
}

export const storiesService = new StoriesService();
export { StoriesService };
