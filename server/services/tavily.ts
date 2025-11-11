import {
  tavily,
  type TavilyClient,
  type TavilySearchResponse
} from "@tavily/core";
import type { NewsItem } from "../../types/index";

export interface TavilyImage {
  url: string;
  description?: string;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
  score: number;
  publishedDate: string;
}

// Re-export TavilySearchResponse as TavilyResponse for backward compatibility
export type TavilyResponse = TavilySearchResponse;

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
        query = "latest news Japan",
        maxResults = 10,
        category = "",
      } = options || {};

      // Build search query based on category
      let searchQuery = query;
      if (category && category !== "all") {
        searchQuery = `latest ${category} news Japan`;
      }

      // Use the search method with topic: "news" for news-focused results and include raw content
      const response = await this.client.search(searchQuery, {
        topic: "news",
        maxResults: maxResults,
        includeRawContent: "text",
      });

      return response;
    } catch (error) {
      console.error("Error searching news with Tavily:", error);
      throw new Error("Failed to search news with Tavily API");
    }
  }

  async searchGeneral(
    query: string,
    maxResults: number = 5,
    apiKey?: string,
  ): Promise<TavilyResponse> {
    // Initialize client with API key if not already done
    if (!this.client && apiKey) {
      this.initializeClient(apiKey);
    }

    if (!this.client) {
      throw new Error("Tavily client not initialized - API key required");
    }

    try {
      const response = await this.client.search(query, {
        max_results: maxResults,
      });

      return response;
    } catch (error) {
      console.error("Error searching with Tavily:", error);
      throw new Error("Failed to search with Tavily API");
    }
  }

  formatTavilyResultsToNewsItems(
    response: TavilyResponse,
  ): NewsItem[] {
    return response.results.map((result: TavilySearchResult) => {
      return {
        title: result.title || "Untitled",
        summary: result.content || "",
        content: result.content || "",
        rawContent: result.rawContent || "",
        source: this.extractSourceFromUrl(result.url),
        publishedAt: result.publishedDate || new Date().toISOString(),
        category: "Other" as const,
        url: result.url,
      };
    });
  }

  private extractSourceFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      const sourceMap: { [key: string]: string } = {
        "nhk.or.jp": "NHK",
        "japantimes.co.jp": "Japan Times",
        "nikkei.com": "Nikkei",
        "asahi.com": "Asahi Shimbun",
        "mainichi.jp": "Mainichi Shimbun",
        "yomiuri.co.jp": "Yomiuri Shimbun",
        "reuters.com": "Reuters",
        "nytimes.com": "New York Times",
        "fortune.com": "Fortune",
        "autonews.com": "Automotive News",
      };
      return sourceMap[domain] || domain;
    } catch {
      return "Unknown";
    }
  }
}

export { TavilyService };
export const tavilyService = new TavilyService();
