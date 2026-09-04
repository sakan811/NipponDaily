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

function extractFavicon(url: string): string | undefined {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/favicon.ico`;
  } catch {
    return undefined;
  }
}

function unionCategories(sources: { category: string }[]): string[] {
  return Array.from(new Set(sources.map((s) => s.category)));
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
  credibilityScore: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe(
      "Your assessment (0-1) of this publisher's reliability, based on reputation, editorial standards, and trustworthiness. Only required the FIRST time a given domain is cited — NipponDaily caches it per-domain and reuses it automatically for every later source from the same domain, so you can omit this once a domain has been scored before. Omitting it for a domain with no cached score yet returns an error asking you to supply one.",
    ),
  category: z.enum(FETCHABLE_CATEGORY_IDS),
});

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_recent_stories",
      {
        title: "Get recent stories",
        description:
          "List NipponDaily's existing story clusters from Redis, most recently updated first. Use this before writing new coverage to decide whether it should extend an existing story (pass its id to upsert_story) or start a new one. Returns headlines only by default, not per-source URLs — for URL-level dedup, call check_processed_urls instead of expanding sources here.",
        inputSchema: z.object({
          days: z.number().int().min(1).max(30).optional().default(7),
          limit: z.number().int().min(1).max(100).optional().default(30),
          includeSources: z
            .boolean()
            .optional()
            .default(false)
            .describe(
              "Include each story's full source list (url/title/publishedAt). Leave false unless you specifically need per-article detail — it's the most token-expensive field this tool can return.",
            ),
        }),
      },
      async ({ days, limit, includeSources }) => {
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
            sourceCount: s.sources.length,
            ...(includeSources
              ? {
                  sources: s.sources.map((src) => ({
                    url: src.url,
                    title: src.title,
                    publishedAt: src.publishedAt,
                  })),
                }
              : {}),
          }));
        return { content: [{ type: "text", text: JSON.stringify(recent) }] };
      },
    );

    server.registerTool(
      "check_processed_urls",
      {
        title: "Check processed URLs",
        description:
          "Given candidate article URLs, return which of them NipponDaily has already ingested, so you don't create duplicate coverage. Any URL you passed in that isn't in the returned `processed` list is unprocessed — treat it as new.",
        inputSchema: z.object({
          urls: z.array(z.string().url()).min(1).max(200),
        }),
      },
      async ({ urls }) => {
        const flags = await Promise.all(
          urls.map((url) => storiesService.isArticleProcessed(url)),
        );
        const processed = urls.filter((_, i) => flags[i]);
        return {
          content: [{ type: "text", text: JSON.stringify({ processed }) }],
        };
      },
    );

    server.registerTool(
      "upsert_story",
      {
        title: "Upsert story",
        description:
          "Create or update a NipponDaily story cluster in Redis, visible in the app immediately. To extend an existing story, pass its `id` (from get_recent_stories) and ONLY the new or changed sources — by default these are merged into the existing source list (deduped/updated by URL), so you never need to resend sources that haven't changed. Pass replaceSources: true to instead discard the old source list entirely (e.g. to remove a source). Marks every submitted source URL as processed so the site's own ingestion pipeline won't re-fetch them. The story's overall `categories` are derived automatically from its sources' categories — don't pass it separately.",
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
          sources: z
            .array(storySourceInputSchema)
            .min(1)
            .describe(
              "Sources to add or update. When `id` refers to an existing story, only include NEW sources or ones whose fields changed — existing sources are preserved and merged in automatically unless replaceSources is true.",
            ),
          replaceSources: z
            .boolean()
            .optional()
            .default(false)
            .describe(
              "If true, `sources` becomes the story's full source list instead of being merged with existing ones. Use only when you need to drop an existing source.",
            ),
        }),
      },
      async ({
        id,
        headline,
        summary,
        thematicAnalysis,
        sources,
        replaceSources,
      }) => {
        const existing = id ? await storiesService.getStory(id) : null;
        const storyId = existing?.id ?? id ?? randomUUID();
        const now = Date.now();

        const incomingSources: StorySource[] = [];
        for (const src of sources) {
          const domain = src.source || extractDomain(src.url);
          let credibilityScore = src.credibilityScore;
          if (credibilityScore === undefined) {
            const cached = await storiesService.getDomainCredibility(domain);
            if (cached === null) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      saved: false,
                      error: `No cached credibility score for domain "${domain}" yet. Provide credibilityScore (0-1) for this source based on your own assessment of the publisher — it will be cached and reused automatically for future sources from this domain.`,
                    }),
                  },
                ],
              };
            }
            credibilityScore = cached;
          } else {
            await storiesService.setDomainCredibility(domain, credibilityScore);
          }

          incomingSources.push({
            title: src.title,
            url: src.url,
            source: domain,
            publishedAt: src.publishedAt,
            credibilityScore,
            category: src.category,
            favicon: extractFavicon(src.url),
            addedAt: now,
          });
        }

        let finalSources: StorySource[];
        if (existing && !replaceSources) {
          const sourceMap = new Map<string, StorySource>(
            existing.sources.map((src) => [src.url, src]),
          );
          for (const src of incomingSources) {
            sourceMap.set(src.url, src);
          }
          finalSources = Array.from(sourceMap.values());
        } else {
          finalSources = incomingSources;
        }

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
          categories: unionCategories(
            finalSources.filter((s): s is StorySource & { category: string } =>
              Boolean(s.category),
            ),
          ),
          isSummarized: true,
        };

        await storiesService.saveStory(story);
        await Promise.all(
          incomingSources.map((src) =>
            storiesService.markArticleProcessed(src.url),
          ),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                saved: true,
                id: story.id,
                isNew: !existing,
                articleCount: story.articleCount,
                sourcesAdded: incomingSources.length,
              }),
            },
          ],
        };
      },
    );

    server.registerTool(
      "merge_stories",
      {
        title: "Merge stories",
        description:
          "Re-group two or more existing story clusters (from get_recent_stories) into a single story — use when clusters written separately turn out to share a real throughline. Combines all of their sources (deduped by URL), saves the result under one kept id, and deletes the other now-redundant story ids. You must still write a fresh headline/summary/thematicAnalysis that fits the combined coverage — this does not synthesize text for you. The merged story's `categories` are derived automatically from the merged stories' own categories.",
        inputSchema: z.object({
          storyIds: z
            .array(z.string())
            .min(2)
            .describe("Ids of the existing stories to merge together."),
          keepId: z
            .string()
            .optional()
            .describe(
              "Which of storyIds to keep as the merged story's id. Defaults to the story with the earliest firstSeen.",
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
        }),
      },
      async ({ storyIds, keepId, headline, summary, thematicAnalysis }) => {
        const uniqueIds = Array.from(new Set(storyIds));
        const found = (
          await Promise.all(uniqueIds.map((id) => storiesService.getStory(id)))
        ).filter((s): s is Story => s !== null);

        if (found.length < 2) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  merged: false,
                  error: `Need at least 2 existing stories to merge; found ${found.length} of ${uniqueIds.length} requested ids.`,
                }),
              },
            ],
          };
        }

        const targetId =
          keepId ??
          found.reduce((oldest, s) =>
            s.firstSeen < oldest.firstSeen ? s : oldest,
          ).id;

        if (!found.some((s) => s.id === targetId)) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  merged: false,
                  error: `keepId "${targetId}" is not one of the found story ids.`,
                }),
              },
            ],
          };
        }

        const sourceMap = new Map<string, StorySource>();
        for (const s of found) {
          for (const src of s.sources) {
            sourceMap.set(src.url, src);
          }
        }
        const mergedSources = Array.from(sourceMap.values());

        const publishTimes = mergedSources
          .map((s) => new Date(s.publishedAt).getTime())
          .filter((t) => !isNaN(t));
        const now = Date.now();
        const lastUpdated =
          publishTimes.length > 0 ? Math.max(...publishTimes) : now;
        const firstSeen = Math.min(...found.map((s) => s.firstSeen));

        const mergedStory: Story = {
          id: targetId,
          headline,
          summary,
          thematicAnalysis,
          articleCount: mergedSources.length,
          firstSeen,
          lastUpdated,
          trendScore: 0,
          sources: mergedSources,
          categories: Array.from(new Set(found.flatMap((s) => s.categories))),
          isSummarized: true,
        };

        await storiesService.saveStory(mergedStory);
        await Promise.all(
          mergedSources.map((src) =>
            storiesService.markArticleProcessed(src.url),
          ),
        );

        const deletedIds = found
          .map((s) => s.id)
          .filter((id) => id !== targetId);
        await Promise.all(
          deletedIds.map((id) => storiesService.deleteStory(id)),
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                merged: true,
                id: mergedStory.id,
                articleCount: mergedStory.articleCount,
                deletedIds,
              }),
            },
          ],
        };
      },
    );

    server.registerTool(
      "cleanup_old_data",
      {
        title: "Cleanup old data",
        description:
          "Delete stories from Redis that are older than one month. Run this first, before writing new coverage, so stale stories don't accumulate. Also callable ad hoc for manual cleanup outside the regular pipeline run. Pass dryRun: true to preview counts without deleting anything.",
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
