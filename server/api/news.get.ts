import { lessonsService } from "../services/lessons";
import { z } from "zod";

/**
 * Zod schema for GET /api/news query parameters.
 */
const newsQuerySchema = z.object({
  query: z
    .string()
    .max(100, "Query cannot exceed 100 characters")
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),

  difficulty: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const allowed = ["N5", "N4", "N3", "N2", "N1"];
      const upper = val.toUpperCase();
      return allowed.includes(upper) ? upper : undefined;
    }),

  limit: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return 20;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? 20 : Math.max(1, Math.min(20, num));
    })
    .default(20),
});

type NewsQuery = z.infer<typeof newsQuerySchema>;

export default defineEventHandler(async (event) => {
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

    // 1. Fetch lessons from Redis (populated by the Claude-web MCP agent)
    const lastIngest = await lessonsService.getLastIngestTime();
    let lessons = await lessonsService.getLessons();

    // 2. Filter by JLPT difficulty (exact match)
    if (validatedQuery.difficulty) {
      lessons = lessons.filter(
        (l) => l.difficultyLevel === validatedQuery.difficulty,
      );
    }

    // 3. Filter by free-text query (title / titleJa / passage / translation)
    if (validatedQuery.query) {
      const q = validatedQuery.query.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.titleJa?.toLowerCase().includes(q) ?? false) ||
          (l.originalText?.toLowerCase().includes(q) ?? false) ||
          (l.englishText?.toLowerCase().includes(q) ?? false),
      );
    }

    // 4. Sort newest article first, then enforce limit
    lessons.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    lessons = lessons.slice(0, validatedQuery.limit);

    return {
      success: true,
      data: {
        lessons,
        lastIngestTime: lastIngest,
      },
      count: lessons.length,
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
