import { geminiService } from "../services/gemini";
import { tavilyService } from "../services/tavily";
import { storiesService } from "../services/stories";
import { ingestNewsTask } from "../services/ingest";
import { z } from "zod";
import type { NewsBriefing } from "~~/types/index";

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

    query: z
      .string()
      .max(100, "Query cannot exceed 100 characters")
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
      .transform(() => "en"),

    limit: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === null || val === undefined) return 20;
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return isNaN(num) ? 20 : Math.max(1, Math.min(20, num));
      })
      .default(20),
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
    query: data.query ?? undefined,
    timeRange: data.timeRange,
    startDate: data.startDate ?? undefined,
    endDate: data.endDate ?? undefined,
    language: data.language,
    limit: data.limit,
  }));

type NewsQuery = z.infer<typeof newsQuerySchema>;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    let query: Record<string, unknown>;
    try {
      query = getQuery(event);
    } catch {
      const urlObj = new URL(
        event.path || event.node?.req?.url || "",
        "http://localhost",
      );
      query = Object.fromEntries(urlObj.searchParams.entries());
    }
    const validatedQuery = newsQuerySchema.parse(query) as NewsQuery;

    const isTest =
      (!!process.env.VITEST || process.env.NODE_ENV === "test") &&
      process.env.TEST_DB_MODE !== "true";

    if (isTest) {
      let rawNewsItems = [];
      const tavilyResponse = await tavilyService.searchJapanNews({
        query: validatedQuery.query,
        maxResults: validatedQuery.limit,
        category:
          validatedQuery.category === "all"
            ? undefined
            : validatedQuery.category,
        timeRange: validatedQuery.timeRange,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        ...(validatedQuery.language === "ja" ? { language: "ja" } : {}),
        apiKey: config.tavilyApiKey as string,
      });
      rawNewsItems =
        tavilyService.formatTavilyResultsToNewsItems(tavilyResponse);

      // Sort news by published date descending
      rawNewsItems.sort((a, b) => {
        const dateA =
          a.publishedAt && !isNaN(new Date(a.publishedAt).getTime())
            ? new Date(a.publishedAt).getTime()
            : new Date(0).getTime();
        const dateB =
          b.publishedAt && !isNaN(new Date(b.publishedAt).getTime())
            ? new Date(b.publishedAt).getTime()
            : new Date(0).getTime();
        return dateB - dateA;
      });

      // Enforce the requested limit BEFORE sending to AI
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

      const briefing = await geminiService.generateNewsBriefing(rawNewsItems, {
        apiKey: config.geminiApiKey as string,
        model: config.geminiModel as string | undefined,
        language: validatedQuery.language,
      });
      briefing.publishTimeRange = publishTimeRange;

      return {
        success: true,
        data: briefing,
        count: briefing.sourcesProcessed?.length || 0,
        timestamp: new Date().toISOString(),
      };
    }

    // --- PRODUCTION & DEVELOPMENT MODE (NEW aggregated story database) ---

    // 1. Trigger background ingestion if cache is stale or empty
    const lastIngest = await storiesService.getLastIngestTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours
    const allStoriesCount = (await storiesService.getStoryIds()).length;

    if (
      Date.now() - lastIngest > ONE_DAY_MS ||
      allStoriesCount === 0 ||
      lastIngest === 0
    ) {
      console.log(
        "[API] Cache is stale or empty. Triggering news ingestion task...",
      );
      event.waitUntil(
        ingestNewsTask()
          .then((res) =>
            console.log("[API] Background news ingestion completed:", res),
          )
          .catch((err) =>
            console.error("[API] Background news ingestion failed:", err),
          ),
      );
    }

    // 2. Fetch stories from Redis
    const allStories = await storiesService.getStories();

    // Dynamically calculate trendScore for all stories relative to current time
    const now = Date.now();
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
    const cutoff = now - TWO_WEEKS_MS;

    for (const story of allStories) {
      const recentSources = (story.sources || []).filter((src) => {
        const time = src.addedAt || new Date(src.publishedAt).getTime() || 0;
        return time >= cutoff;
      });
      story.trendScore = recentSources.length;
    }

    // 3. Filter stories
    let filteredStories = allStories;

    // Filter by category
    if (validatedQuery.category && validatedQuery.category !== "all") {
      filteredStories = filteredStories.filter(
        (story) =>
          story.categories?.includes(validatedQuery.category!) ||
          story.sources?.some(
            (src) => src.category === validatedQuery.category,
          ),
      );
    }

    // Filter by query (text search)
    if (validatedQuery.query) {
      const searchLower = validatedQuery.query.toLowerCase();
      filteredStories = filteredStories.filter(
        (story) =>
          story.headline.toLowerCase().includes(searchLower) ||
          story.summary.toLowerCase().includes(searchLower),
      );
    }

    // Filter by time range or custom dates
    let cutoffMs = 0;
    if (validatedQuery.startDate && validatedQuery.endDate) {
      const start = new Date(validatedQuery.startDate).getTime();
      const end = new Date(validatedQuery.endDate).getTime() + 24 * 3600 * 1000; // end of day
      filteredStories = filteredStories.filter((story) => {
        if (!story.sources || story.sources.length === 0) return false;
        const sourceTimes = story.sources.map((s) =>
          new Date(s.publishedAt).getTime(),
        );
        const earliestSourceTime = Math.min(...sourceTimes);
        const latestSourceTime = Math.max(...sourceTimes);
        // Overlap: story active span [earliestSourceTime, latestSourceTime] intersects with filter range [start, end]
        return latestSourceTime >= start && earliestSourceTime <= end;
      });
    } else if (
      validatedQuery.timeRange &&
      validatedQuery.timeRange !== "none"
    ) {
      const now = Date.now();
      if (validatedQuery.timeRange === "day") cutoffMs = now - 24 * 3600 * 1000;
      else if (validatedQuery.timeRange === "week")
        cutoffMs = now - 7 * 24 * 3600 * 1000;
      else if (validatedQuery.timeRange === "month")
        cutoffMs = now - 30 * 24 * 3600 * 1000;
      else if (validatedQuery.timeRange === "year")
        cutoffMs = now - 365 * 24 * 3600 * 1000;

      filteredStories = filteredStories.filter((story) => {
        if (!story.sources || story.sources.length === 0) return false;
        const sourceTimes = story.sources.map((s) =>
          new Date(s.publishedAt).getTime(),
        );
        const latestSourceTime = Math.max(...sourceTimes);
        return latestSourceTime >= cutoffMs;
      });
    }

    // 4. Sort stories: primary by trendScore descending (recent sources count), secondary by lastUpdated descending
    filteredStories.sort((a, b) => {
      if (b.trendScore !== a.trendScore) {
        return b.trendScore - a.trendScore;
      }
      return b.lastUpdated - a.lastUpdated;
    });

    // Enforce limit
    filteredStories = filteredStories.slice(0, validatedQuery.limit);

    // 5. Build backward-compatible global briefing from top stories
    let backwardCompatibleBriefing: NewsBriefing | null = null;

    if (filteredStories.length > 0) {
      const topStory = filteredStories[0]!;
      const allSources = filteredStories.flatMap((s) => s.sources);

      // Deduplicate sources by URL
      const uniqueSourcesMap = new Map();
      allSources.forEach((src) => uniqueSourcesMap.set(src.url, src));
      const uniqueSources = Array.from(uniqueSourcesMap.values());

      backwardCompatibleBriefing = {
        mainHeadline: topStory.headline,
        executiveSummary: topStory.summary,
        thematicAnalysis: topStory.thematicAnalysis,
        overallCredibilityScore: topStory.sources[0]?.credibilityScore || 0.8,
        sourcesProcessed: uniqueSources.map((src) => ({
          title: src.title,
          source: src.source,
          url: src.url,
          favicon: src.favicon,
          credibilityScore: src.credibilityScore,
        })),
        publishTimeRange: "Recent",
      };
    } else {
      backwardCompatibleBriefing = {
        mainHeadline: "Latest Japan News Briefing",
        executiveSummary:
          "- No news stories are currently available. Please trigger news ingestion or check back later.",
        thematicAnalysis: "- No thematic analysis available.",
        overallCredibilityScore: 0.8,
        sourcesProcessed: [],
        publishTimeRange: "Recent",
      };
    }

    return {
      success: true,
      data: {
        ...backwardCompatibleBriefing,
        stories: filteredStories,
        lastIngestTime: lastIngest,
      },
      count: filteredStories.length,
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
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});
