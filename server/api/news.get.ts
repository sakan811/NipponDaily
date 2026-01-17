import { geminiService } from "../services/gemini";
import { tavilyService } from "../services/tavily";
import { checkRateLimit, getClientIp } from "../utils/rate-limiter";

export default defineEventHandler(async (event) => {
  // Check rate limit before processing request
  const clientIp = getClientIp(event);
  const rateLimitResult = await checkRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: {
        error: `Daily rate limit exceeded (${rateLimitResult.limit} request/day). Please try again tomorrow.`,
        retryAfter: 86400, // 24 hours
        resetTime: rateLimitResult.resetTime.toISOString(),
        limit: rateLimitResult.limit,
      },
    });
  }

  try {
    // Get runtime config
    const config = useRuntimeConfig();

    // Get query parameters
    const query = getQuery(event);
    const category = query.category as string;
    const timeRange = (query.timeRange as string) || "week";
    const startDate = query.startDate as string; // Custom date range start
    const endDate = query.endDate as string; // Custom date range end
    const language = (query.language as string) || "English";
    const limitParam = parseInt(query.limit as string);
    const limit =
      !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10;

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
      startDate,
      endDate,
      apiKey: config.tavilyApiKey,
    });

    // Format Tavily results to NewsItem format
    let news = tavilyService.formatTavilyResultsToNewsItems(tavilyResponse);

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

    // Add rate limit headers to response
    setResponseHeaders(event, {
      "X-RateLimit-Limit": rateLimitResult.limit.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
    });

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
