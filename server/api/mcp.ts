import { createMcpHandler } from "mcp-handler";
import { fromWebHandler } from "h3";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { storiesService } from "../services/stories";
import { cleanupOldDataTask } from "../services/cleanup";
import { getEnvOrConfig } from "../utils/config";
import { FETCHABLE_CATEGORY_IDS } from "~~/constants/categories";
import type { Story, StorySource } from "~~/types/index";

/**
 * Remote MCP server letting an external agent (e.g. a scheduled Claude web
 * task) run NipponDaily's news ingestion in place of the Tavily/QStash
 * pipeline: it writes finished Story clusters straight into the same Redis
 * keys `server/api/news.get.ts` reads from.
 */

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url;
  }
}

function isAuthorized(request: Request): boolean {
  const expected = getEnvOrConfig("mcpAuthToken", "MCP_AUTH_TOKEN");
  if (!expected) return false;

  const authHeader = request.headers.get("authorization") || "";
  const headerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const queryToken = new URL(request.url).searchParams.get("token") || "";
  const provided = headerToken || queryToken;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const storySourceInputSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  source: z
    .string()
    .optional()
    .describe(
      "Publisher domain, e.g. https://www3.nhk.or.jp. Derived from the URL if omitted.",
    ),
  publishedAt: z
    .string()
    .describe("ISO 8601 timestamp of original publish date."),
  credibilityScore: z.number().min(0).max(1),
  category: z.enum(FETCHABLE_CATEGORY_IDS),
  favicon: z.string().optional(),
});

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_recent_stories",
      {
        title: "Get recent stories",
        description:
          "List NipponDaily's existing story clusters from Redis, most recently updated first. Use this before writing new coverage to decide whether it should extend an existing story (pass its id to upsert_story) or start a new one.",
        inputSchema: z.object({
          days: z.number().int().min(1).max(30).optional().default(7),
          limit: z.number().int().min(1).max(100).optional().default(30),
        }),
      },
      async ({ days, limit }) => {
        const stories = await storiesService.getStories();
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        const recent = stories
          .filter((s) => s.lastUpdated >= cutoff)
          .sort((a, b) => b.lastUpdated - a.lastUpdated)
          .slice(0, limit)
          .map((s) => ({
            id: s.id,
            headline: s.headline,
            categories: s.categories,
            lastUpdated: s.lastUpdated,
            sources: s.sources.map((src) => ({
              url: src.url,
              title: src.title,
              publishedAt: src.publishedAt,
            })),
          }));
        return { content: [{ type: "text", text: JSON.stringify(recent) }] };
      },
    );

    server.registerTool(
      "check_processed_urls",
      {
        title: "Check processed URLs",
        description:
          "Given candidate article URLs, return which ones NipponDaily has already ingested so you don't create duplicate coverage.",
        inputSchema: z.object({
          urls: z.array(z.string().url()).min(1).max(200),
        }),
      },
      async ({ urls }) => {
        const flags = await Promise.all(
          urls.map((url) => storiesService.isArticleProcessed(url)),
        );
        const processed = urls.filter((_, i) => flags[i]);
        const unprocessed = urls.filter((_, i) => !flags[i]);
        return {
          content: [
            { type: "text", text: JSON.stringify({ processed, unprocessed }) },
          ],
        };
      },
    );

    server.registerTool(
      "upsert_story",
      {
        title: "Upsert story",
        description:
          "Create or update a NipponDaily story cluster in Redis, visible in the app immediately. To extend an existing story, pass its `id` (from get_recent_stories) and include ALL of its sources plus the new ones — this replaces the story's full source list rather than merging. Marks every source URL as processed so the site's own ingestion pipeline won't re-fetch them.",
        inputSchema: z.object({
          id: z
            .string()
            .optional()
            .describe(
              "Existing story id to update. Omit to create a new story.",
            ),
          headline: z.string(),
          summary: z
            .string()
            .describe("Markdown bullet list ('- ' per line, \\n-separated)."),
          thematicAnalysis: z
            .string()
            .describe(
              "Markdown bullet list contrasting domestic Japanese vs. international sources.",
            ),
          categories: z.array(z.enum(FETCHABLE_CATEGORY_IDS)).min(1),
          sources: z.array(storySourceInputSchema).min(1),
        }),
      },
      async ({
        id,
        headline,
        summary,
        thematicAnalysis,
        categories,
        sources,
      }) => {
        const existing = id ? await storiesService.getStory(id) : null;
        const storyId = existing?.id ?? id ?? randomUUID();
        const now = Date.now();

        const finalSources: StorySource[] = sources.map((src) => ({
          title: src.title,
          url: src.url,
          source: src.source || extractDomain(src.url),
          publishedAt: src.publishedAt,
          credibilityScore: src.credibilityScore,
          category: src.category,
          favicon: src.favicon,
          addedAt: now,
        }));

        const publishTimes = finalSources
          .map((s) => new Date(s.publishedAt).getTime())
          .filter((t) => !isNaN(t));
        const lastUpdated =
          publishTimes.length > 0 ? Math.max(...publishTimes) : now;

        const story: Story = {
          id: storyId,
          headline,
          summary,
          thematicAnalysis,
          articleCount: finalSources.length,
          firstSeen: existing?.firstSeen ?? now,
          lastUpdated,
          trendScore: 0,
          sources: finalSources,
          categories,
          isSummarized: true,
        };

        await storiesService.saveStory(story);
        for (const src of finalSources) {
          await storiesService.markArticleProcessed(src.url);
        }

        return {
          content: [
            { type: "text", text: JSON.stringify({ saved: true, story }) },
          ],
        };
      },
    );

    server.registerTool(
      "cleanup_old_data",
      {
        title: "Cleanup old data",
        description:
          "Delete stories from Redis that are older than one month (same retention window as the site's own /api/cleanup job). Run this first, before writing new coverage, so stale stories don't accumulate. Pass dryRun: true to preview counts without deleting anything.",
        inputSchema: z.object({
          dryRun: z.boolean().optional().default(false),
        }),
      },
      async ({ dryRun }) => {
        const result = await cleanupOldDataTask({ dryRun });
        return {
          content: [
            { type: "text", text: JSON.stringify({ ...result, dryRun }) },
          ],
        };
      },
    );

    server.registerTool(
      "mark_ingest_complete",
      {
        title: "Mark ingest complete",
        description:
          "Record the current time as NipponDaily's last-ingest timestamp so the app doesn't consider its cache stale and trigger its own Tavily-based ingestion on the next page load.",
        inputSchema: z.object({
          timestamp: z.number().int().optional(),
        }),
      },
      async ({ timestamp }) => {
        const ts = timestamp ?? Date.now();
        await storiesService.setLastIngestTime(ts);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, timestamp: ts }),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: { name: "nippondaily-news-pipeline", version: "1.0.0" },
  },
);

async function protectedHandler(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return mcpHandler(request);
}

export default defineEventHandler(fromWebHandler(protectedHandler));
