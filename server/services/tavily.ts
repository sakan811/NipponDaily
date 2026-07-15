import {
  tavily,
  type TavilyClient,
  type TavilySearchResponse,
} from "@tavily/core";
import type { NewsItem } from "../../types/index";

// Type for Tavily search result based on @tavily/core documentation
interface TavilyResult {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
  score: number;
  publishedDate: string;
  favicon?: string;
}

// Type for search options
interface TavilySearchOptions {
  topic: "news" | "general" | "finance";
  maxResults: number;
  searchDepth: "basic" | "advanced";
  includeRawContent: false | "text" | "markdown";
  timeRange?: "day" | "week" | "month" | "year" | "y" | "m" | "w" | "d";
  startDate?: string; // ISO date format: YYYY-MM-DD
  endDate?: string; // ISO date format: YYYY-MM-DD
  includeFavicon?: boolean;
}

// Type alias for TavilySearchResponse for internal use
type TavilyResponse = TavilySearchResponse;

class TavilyService {
  private client: TavilyClient | null = null;

  private initializeClient(apiKey?: string) {
    if (!apiKey) {
      console.warn("TAVILY_API_KEY not configured");
      return;
    }

    this.client = tavily({ apiKey });
  }

  async searchJapanNews(options?: {
    query?: string;
    maxResults?: number;
    category?: string;
    timeRange?: "none" | "day" | "week" | "month" | "year";
    startDate?: string; // ISO date format: YYYY-MM-DD
    endDate?: string; // ISO date format: YYYY-MM-DD
    language?: string;
    apiKey?: string;
  }): Promise<TavilyResponse> {
    // Initialize client with API key if not already done
    if (!this.client && options?.apiKey) {
      this.initializeClient(options.apiKey);
    }

    if (!this.client) {
      throw new Error("Tavily client not initialized - API key required");
    }

    try {
      const {
        query: rawQuery,
        maxResults = 20,
        category = "",
        timeRange = "week",
        startDate,
        endDate,
      } = options || {};

      const isJa = options?.language === "ja";
      let query = rawQuery;
      if (!query) {
        query = isJa ? "日本 最新ニュース" : "latest Japan news";
      }

      // Build search query based on category and language
      let searchQuery = query;
      if (category && category !== "all") {
        if (isJa) {
          const queryMapJa: Record<string, string> = {
            society: "日本 社会 地方 ニュース 人口減少 地方創生 最新",
            tech: "日本 テクノロジー ロボット 自動車 半導体 ハイテク ニュース 最新",
            "pop-culture":
              "日本 アニメ 漫画 ゲーム 任天堂 ソニー エンタメ 最新ニュース",
            tourism: "日本 観光 旅行 温泉 地方 祭り 観光ニュース 最新",
            food: "日本 食文化 和食 ラーメン グルメ 農業 伝統食 ニュース 最新",
            "disaster-prep": "日本 災害 地震 台風 防災 気象情報 ニュース 最新",
          };
          searchQuery = queryMapJa[category] || `日本 最新ニュース ${category}`;
        } else {
          const queryMap: Record<string, string> = {
            society:
              "latest Japan society daily life demographic trends aging population prefecture news",
            tech: "latest Japan tech innovation robotics automotive semiconductor industry Tokyo science news",
            "pop-culture":
              "latest Japan anime manga video games pop culture Nintendo Sony entertainment news",
            tourism:
              "latest Japan travel tourism local festivals Shinkansen tourism trends prefectures news",
            food: "latest Japan food gastronomy cuisine Washoku sake ramen restaurant trends agriculture news",
            "disaster-prep":
              "latest Japan earthquake typhoon weather natural disaster safety preparedness environment news",
          };
          searchQuery = queryMap[category] || `latest ${category} news Japan`;
        }
      }

      // Map UI timeRange values to API timeRange values
      const apiTimeRange = this.mapTimeRangeToApi(timeRange);

      // Use basic search parameters for news results
      const searchOptions: TavilySearchOptions = {
        topic: "news",
        maxResults: maxResults,
        searchDepth: "basic",
        includeRawContent: false,
        includeFavicon: true,
      };

      // Use custom date range if provided, otherwise use preset timeRange
      if (startDate && endDate) {
        searchOptions.startDate = startDate;
        searchOptions.endDate = endDate;
      } else if (apiTimeRange) {
        // Only include timeRange if it's not undefined (i.e., not "none")
        searchOptions.timeRange = apiTimeRange;
      }

      const response = await this.client.search(searchQuery, searchOptions);

      return response;
    } catch (error) {
      console.error("Error searching news with Tavily:", error);
      throw new Error("Failed to search news with Tavily API", {
        cause: error,
      });
    }
  }

  formatTavilyResultsToNewsItems(response: TavilyResponse): NewsItem[] {
    return response.results.map((result: TavilyResult) => {
      return {
        title: result.title || "Untitled",
        summary: result.content || "",
        content: result.content || "",
        source: this.extractDomainFromUrl(result.url),
        publishedAt: result.publishedDate || new Date().toISOString(),
        category: "Other" as const,
        url: result.url,
        favicon: result.favicon,
      };
    });
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return url;
    }
  }

  private mapTimeRangeToApi(
    timeRange: "none" | "day" | "week" | "month" | "year",
  ): "day" | "week" | "month" | "year" | "y" | "m" | "w" | "d" | undefined {
    const timeRangeMap: {
      [key: string]: "day" | "week" | "month" | "year" | "y" | "m" | "w" | "d";
    } = {
      day: "day",
      week: "week",
      month: "month",
      year: "year",
    };
    return timeRangeMap[timeRange] || undefined;
  }
}

export { TavilyService };
export const tavilyService = new TavilyService();
