import { geminiService } from "../services/gemini";
import { tavilyService } from "../services/tavily";
import type { NewsItem } from "../../types/index";

/**
 * Remove duplicate news items based on URL and title similarity
 */
function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const deduplicated: NewsItem[] = [];

  for (const item of news) {
    // Create a normalized key for comparison
    const normalizedUrl = normalizeUrl(item.url || "");
    const normalizedTitle = normalizeTitle(item.title || "Untitled");

    // Check for URL duplicates
    if (seen.has(normalizedUrl)) {
      continue;
    }

    // Check for title similarity with existing items
    const isDuplicateTitle = deduplicated.some(existing => {
      const existingNormalizedTitle = normalizeTitle(existing.title || "Untitled");
      return calculateTitleSimilarity(normalizedTitle, existingNormalizedTitle) > 0.8;
    });

    if (isDuplicateTitle) {
      continue;
    }

    seen.add(normalizedUrl);
    deduplicated.push(item);
  }

  return deduplicated;
}

/**
 * Normalize URL for deduplication by removing tracking parameters
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];
    const searchParams = new URLSearchParams(urlObj.search);

    paramsToRemove.forEach(param => searchParams.delete(param));

    // Return URL without tracking parameters
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  } catch {
    return url;
  }
}

/**
 * Normalize title for comparison by removing common prefixes/suffixes and converting to lowercase
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(says|reports|claims|announces)\s+/i, '') // Remove common prefixes
    .replace(/\s+:\s+(says|reports|claims|announces)$/i, '') // Remove common suffixes
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate similarity between two normalized titles using Jaccard similarity
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.split(' ').filter(word => word.length > 0));
  const words2 = new Set(title2.split(' ').filter(word => word.length > 0));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

export default defineEventHandler(async (event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig();

    // Get query parameters
    const query = getQuery(event);
    const category = query.category as string;
    const timeRange = (query.timeRange as string) || "week";
    const language = (query.language as string) || "English";
    const limitParam = parseInt(query.limit as string);
    const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 10;

    // Validate timeRange parameter
    const validTimeRanges = ["none", "day", "week", "month", "year"];
    const validatedTimeRange = validTimeRanges.includes(timeRange)
      ? (timeRange as "none" | "day" | "week" | "month" | "year")
      : "week";

    // Fetch news from Tavily
    const tavilyResponse = await tavilyService.searchJapanNews({
      maxResults: limit,
      category: category === "all" ? undefined : category,
      timeRange: validatedTimeRange,
      apiKey: config.tavilyApiKey,
    });

    // Format Tavily results to NewsItem format
    let news = tavilyService.formatTavilyResultsToNewsItems(tavilyResponse);

    // Remove duplicate news items based on URL and title similarity
    news = deduplicateNews(news);

    // Use Gemini to categorize the news
    news = await geminiService.categorizeNewsItems(news, {
      apiKey: config.geminiApiKey,
      model: config.geminiModel,
      language,
    });

    // Filter by category if specified
    if (category && category !== "all") {
      news = news.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase(),
      );
    }

    // Sort news by published date in descending order (latest first)
    news.sort((a, b) => {
      // Handle potential invalid dates by treating them as oldest possible
      const dateA = isNaN(new Date(a.publishedAt).getTime())
        ? new Date(0).getTime()
        : new Date(a.publishedAt).getTime();
      const dateB = isNaN(new Date(b.publishedAt).getTime())
        ? new Date(0).getTime()
        : new Date(b.publishedAt).getTime();
      return dateB - dateA; // Sort in descending order (latest first)
    });

    // Limit results (in case categorization returned more than requested)
    news = news.slice(0, limit);

    return {
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("News API error:", error);
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    });
  }
});
