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
}

// Type for search options
interface TavilySearchOptions {
  topic: "news" | "general" | "finance";
  maxResults: number;
  searchDepth: "basic" | "advanced";
  includeRawContent: false | "text" | "markdown";
  timeRange?: "day" | "week" | "month" | "year" | "y" | "m" | "w" | "d";
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
        query = "latest Japan news",
        maxResults = 10,
        category = "",
        timeRange = "week",
      } = options || {};

      // Build search query based on category
      let searchQuery = query;
      if (category && category !== "all") {
        searchQuery = `latest ${category} news Japan`;
      }

      // Map UI timeRange values to API timeRange values
      const apiTimeRange = this.mapTimeRangeToApi(timeRange);

      // Use basic search parameters for news results
      const searchOptions: TavilySearchOptions = {
        topic: "news",
        maxResults: maxResults,
        searchDepth: "basic",
        includeRawContent: "markdown",
      };

      // Only include timeRange if it's not undefined (i.e., not "none")
      if (apiTimeRange) {
        searchOptions.timeRange = apiTimeRange;
      }

      const response = await this.client.search(searchQuery, searchOptions);

      return response;
    } catch (error) {
      console.error("Error searching news with Tavily:", error);
      throw new Error("Failed to search news with Tavily API");
    }
  }

  formatTavilyResultsToNewsItems(response: TavilyResponse): NewsItem[] {
    return response.results.map((result: TavilyResult) => {
      return {
        title: result.title || "Untitled",
        summary: result.content || "",
        content: result.content || "",
        rawContent: result.rawContent || "",
        source: this.extractDomainFromUrl(result.url),
        publishedAt: result.publishedDate || new Date().toISOString(),
        category: "Other" as const,
        url: result.url,
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
