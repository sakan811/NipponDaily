import { geminiService } from "../services/gemini";
import { tavilyService } from "../services/tavily";
import { checkRateLimit, getClientIp } from "../utils/rate-limiter";
import { z } from "zod";

/**
 * Zod 4 schema for news API query parameters
 * Provides type-safe validation with detailed error messages
 */
const newsQuerySchema = z
  .object({
    // Category filter - optional string (handles null/undefined/empty)
    category: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "") return undefined;
        return val;
      }),

    // Time range filter with whitelist (handles null/undefined/empty)
    timeRange: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "" || val === "week") return "week";
        // Validate against allowed values
        const allowed = ["none", "day", "week", "month", "year"];
        if (allowed.includes(val)) return val as any;
        return "week";
      }),

    // Custom date range - both required together
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .nullable()
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .nullable()
      .optional(),

    // Target language for translation (handles null/undefined/empty)
    language: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "") return "English";
        return val;
      }),

    // Number of articles to fetch (1-20)
    // Handle both string and number input (query params are strings)
    limit: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === null || val === undefined) return 10;
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return isNaN(num) ? 10 : Math.max(1, Math.min(20, num));
      })
      .default(10),
  })
  .refine(
    // Custom refinement: startDate and endDate must be provided together
    (data) => {
      if (data.startDate || data.endDate) {
        return data.startDate !== undefined && data.endDate !== undefined;
      }
      return true;
    },
    {
      message: "Both startDate and endDate must be provided together",
      path: ["startDate"],
    },
  )
  .refine(
    // Custom refinement: validate date range
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true; // Skip if no dates provided
      }

      const MIN_DATE = new Date("2000-01-01");
      const MAX_RANGE_DAYS = 365;
      const now = new Date();

      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
      }

      // Check minimum date
      if (start < MIN_DATE || end < MIN_DATE) {
        return false;
      }

      // Check for future dates
      if (start > now || end > now) {
        return false;
      }

      // Ensure startDate <= endDate
      if (start > end) {
        return false;
      }

      // Check max range (365 days)
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > MAX_RANGE_DAYS) {
        return false;
      }

      return true;
    },
    {
      message:
        "Invalid date range: must be after 2000-01-01, not in the future, start ≤ end, and within 365 days",
      path: ["startDate"],
    },
  )
  .transform((data) => ({
    // Transform null to undefined for service compatibility
    category: data.category ?? undefined,
    timeRange: data.timeRange ?? "week",
    startDate: data.startDate ?? undefined,
    endDate: data.endDate ?? undefined,
    language: data.language ?? "English",
    limit: data.limit,
  }))
  // Final output transform - ensure all null values are converted to undefined
  .transform((data) => ({
    category: data.category === null ? undefined : data.category,
    timeRange: data.timeRange === null ? "week" : data.timeRange,
    startDate: data.startDate === null ? undefined : data.startDate,
    endDate: data.endDate === null ? undefined : data.endDate,
    language: data.language === null ? "English" : data.language,
    limit: data.limit,
  }));

// TypeScript type inferred from schema (after transform)
type NewsQuery = z.infer<typeof newsQuerySchema>;

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

    // Get and validate query parameters using Zod
    const query = getQuery(event);
    const validatedQuery = newsQuerySchema.parse(query) as NewsQuery;

    // Fetch news from Tavily
    const tavilyResponse = await tavilyService.searchJapanNews({
      maxResults: validatedQuery.limit,
      category:
        validatedQuery.category === "all" ? undefined : validatedQuery.category,
      timeRange: validatedQuery.timeRange,
      startDate: validatedQuery.startDate,
      endDate: validatedQuery.endDate,
      apiKey: config.tavilyApiKey,
    });

    // Format Tavily results to NewsItem format
    let news = tavilyService.formatTavilyResultsToNewsItems(tavilyResponse);

    // Use Gemini to categorize the news
    news = await geminiService.categorizeNewsItems(news, {
      apiKey: config.geminiApiKey,
      model: config.geminiModel,
      language: validatedQuery.language,
    });

    // Filter by category if specified
    if (validatedQuery.category && validatedQuery.category !== "all") {
      news = news.filter(
        (item) =>
          item.category.toLowerCase() ===
          validatedQuery.category!.toLowerCase(),
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
    news = news.slice(0, validatedQuery.limit);

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
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }

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
