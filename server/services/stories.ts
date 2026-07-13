import { Redis } from "@upstash/redis";
import type { Story } from "~~/types/index";

class StoriesService {
  private client: Redis | null = null;
  private memoryStories = new Map<string, Story>();
  private memoryProcessedArticles = new Set<string>();
  private memoryLastIngestTime: number = 0;

  private getRedisClient(): Redis | null {
    if (this.client) return this.client;

    try {
      const config = useRuntimeConfig();
      const url =
        (config.upstashRedisRestUrl as string) ||
        process.env.UPSTASH_REDIS_REST_URL;
      const token =
        (config.upstashRedisRestToken as string) ||
        process.env.UPSTASH_REDIS_REST_TOKEN;

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

  private isRedisConfigured(): boolean {
    return this.getRedisClient() !== null;
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
    const stories: Story[] = [];

    for (const id of ids) {
      const story = await this.getStory(id);
      if (story) {
        stories.push(story);
      }
    }

    return stories;
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

  /**
   * Recalculate trending scores for all stories based on recent additions
   */
  async updateVelocityScores(): Promise<void> {
    const stories = await this.getStories();
    const now = Date.now();
    const sixHoursAgo = now - 6 * 3600 * 1000;
    const twelveHoursAgo = now - 12 * 3600 * 1000;

    for (const story of stories) {
      const articles = story.sources || [];

      const count6h = articles.filter(
        (a) => (a.addedAt || 0) >= sixHoursAgo,
      ).length;

      const countPrior6h = articles.filter(
        (a) =>
          (a.addedAt || 0) >= twelveHoursAgo && (a.addedAt || 0) < sixHoursAgo,
      ).length;

      const velocity = count6h - countPrior6h;
      // Formula: base count in last 6h, plus positive change velocity bonus
      const trendScore = count6h * 1.5 + velocity * 0.5;

      story.trendScore = Math.max(0, trendScore);
      await this.saveStory(story);
    }
  }
}

export const storiesService = new StoriesService();
export { StoriesService };
