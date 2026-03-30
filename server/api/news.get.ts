import { geminiService } from "../services/gemini";
import { tavilyService } from "../services/tavily";
import {
  checkRateLimit,
  getClientIp,
  RateLimitError,
} from "../utils/rate-limiter";
import { z } from "zod";

/**
 * Zod 4 schema for news API query parameters
 * Provides type-safe validation with detailed error messages
 */
const newsQuerySchema = z
  .object({
    category: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "") return undefined;
        return val;
      }),

    timeRange: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "" || val === "week") return "week";
        const allowed = ["none", "day", "week", "month", "year"] as const;
        if (allowed.includes(val as "none" | "day" | "week" | "month" | "year"))
          return val as "none" | "day" | "week" | "month" | "year";
        return "week";
      }),

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

    language: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "") return "en";
        return val;
      }),

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
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      const MIN_DATE = new Date("2000-01-01");
      const MAX_RANGE_DAYS = 365;
      const now = new Date();

      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      if (start < MIN_DATE || end < MIN_DATE) return false;
      if (start > now || end > now) return false;
      if (start > end) return false;

      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > MAX_RANGE_DAYS) return false;

      return true;
    },
    {
      message:
        "Invalid date range: must be after 2000-01-01, not in the future, start ≤ end, and within 365 days",
      path: ["startDate"],
    },
  )
  .transform((data) => ({
    category: data.category ?? undefined,
    timeRange: data.timeRange,
    startDate: data.startDate ?? undefined,
    endDate: data.endDate ?? undefined,
    language: data.language,
    limit: data.limit,
  }));

type NewsQuery = z.infer<typeof newsQuerySchema>;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const clientIp = getClientIp(event);
  let rateLimitResult: Awaited<ReturnType<typeof checkRateLimit>>;

  try {
    rateLimitResult = await checkRateLimit(clientIp, {
      upstashRedisRestUrl: config.upstashRedisRestUrl as string,
      upstashRedisRestToken: config.upstashRedisRestToken as string,
      rateLimitMaxRequests: config.rateLimitMaxRequests
        ? parseInt(config.rateLimitMaxRequests as string, 10)
        : undefined,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Rate limit service unavailable",
        data: { error: String(error.message) },
      });
    }
    throw error;
  }

  if (!rateLimitResult.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: {
        error: `Daily rate limit exceeded (${rateLimitResult.limit} request/day). Please try again tomorrow.`,
        retryAfter: 86400,
        resetTime: rateLimitResult.resetTime.toISOString(),
        limit: rateLimitResult.limit,
      },
    });
  }

  try {
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
      apiKey: config.tavilyApiKey as string,
    });

    // Format Tavily results to raw NewsItem format
    let rawNewsItems =
      tavilyService.formatTavilyResultsToNewsItems(tavilyResponse);

    // Sort news by published date descending
    rawNewsItems.sort((a, b) => {
      const dateA = isNaN(new Date(a.publishedAt).getTime())
        ? new Date(0).getTime()
        : new Date(a.publishedAt).getTime();
      const dateB = isNaN(new Date(b.publishedAt).getTime())
        ? new Date(0).getTime()
        : new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    // Enforce the requested limit BEFORE sending to AI to save tokens/time
    rawNewsItems = rawNewsItems.slice(0, validatedQuery.limit);

    // Calculate publish time range
    const validDates = rawNewsItems
      .map((item) => new Date(item.publishedAt))
      .filter((date) => !isNaN(date.getTime()));

    let publishTimeRange = "Recent";
    if (validDates.length > 0) {
      validDates.sort((a, b) => b.getTime() - a.getTime()); // Ensure sorted descending
      const latestDate = validDates[0]!;
      const earliestDate = validDates[validDates.length - 1]!;

      const formatOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      let lang = "en-US";
      try {
        if (validatedQuery.language) {
          Intl.DateTimeFormat(validatedQuery.language);
          lang = validatedQuery.language;
        }
      } catch {
        lang = "en-US";
      }

      const latestFormatted = latestDate.toLocaleDateString(lang, formatOpts);
      const earliestFormatted = earliestDate.toLocaleDateString(
        lang,
        formatOpts,
      );

      if (earliestFormatted === latestFormatted) {
        publishTimeRange = earliestFormatted;
      } else {
        publishTimeRange = `${earliestFormatted} - ${latestFormatted}`;
      }
    }

    // NEW LOGIC: Use Gemini to generate a single synthesized briefing
    const briefing = await geminiService.generateNewsBriefing(rawNewsItems, {
      apiKey: config.geminiApiKey as string,
      model: config.geminiModel as string | undefined,
      language: validatedQuery.language,
    });

    // Add the time range to the briefing
    briefing.publishTimeRange = publishTimeRange;

    setResponseHeaders(event, {
      "X-RateLimit-Limit": rateLimitResult.limit.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
    });

    return {
      success: true,
      data: briefing,
      count: briefing.sourcesProcessed?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
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
