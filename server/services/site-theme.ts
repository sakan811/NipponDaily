import { Redis } from "@upstash/redis";
import type { SiteTheme } from "~~/types/index";
import { getEnvOrConfig } from "../utils/config";

/**
 * Redis read/write for NipponDaily's single active SiteTheme record —
 * the seasonal palette the external theme agent controls via the MCP
 * server's save_site_theme tool.
 */
const SITE_THEME_KEY = "n5:site_theme";

class SiteThemeService {
  private client: Redis | null = null;
  private memoryTheme: SiteTheme | null = null;

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

  async getActiveTheme(): Promise<SiteTheme | null> {
    const redis = this.getRedisClient();
    if (!redis) return this.memoryTheme;

    try {
      return await redis.get<SiteTheme>(SITE_THEME_KEY);
    } catch (e) {
      console.error("Error getting site theme from Redis:", e);
      return this.memoryTheme;
    }
  }

  async saveActiveTheme(theme: SiteTheme): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) {
      this.memoryTheme = theme;
      return;
    }

    try {
      await redis.set(SITE_THEME_KEY, JSON.stringify(theme));
    } catch (e) {
      console.error("Error saving site theme to Redis:", e);
      this.memoryTheme = theme;
    }
  }
}

export const siteThemeService = new SiteThemeService();
export { SiteThemeService };
