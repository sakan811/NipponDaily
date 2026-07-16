import { z } from "zod";
import { storiesService } from "../services/stories";
import { upstashVectorService } from "../services/vector";
import { geminiService } from "../services/gemini";
import type { Story, StorySource } from "~~/types/index";

const groupBodySchema = z.object({
  dryRun: z.boolean().optional().default(false),
});

/**
 * POST /api/group
 *
 * Groups articles from Vector DB and Redis into cohesive stories.
 * Replaces the old regroup API, but only clusters articles (does not summarize).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const body = await readBody(event).catch(() => ({}));
    const { dryRun } = groupBodySchema.parse(body);

    console.log(
      `[POST /api/group] Starting stories grouping pipeline... DryRun: ${dryRun}`,
    );

    // Step 1: Fetch state from Redis and Upstash Vector DB
    let redisStories = await storiesService.getStories();
    let vectorArticles = await upstashVectorService.getAllArticles();

    // Apply 30-day cutoff to protect Gemini 250k token limit
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - THIRTY_DAYS_MS;

    redisStories = redisStories.filter(
      (story) => story.firstSeen >= cutoffTime,
    );
    vectorArticles = vectorArticles.filter((vec) => {
      const pubTime = vec.metadata.published_at
        ? vec.metadata.published_at * 1000
        : Date.now();
      return pubTime >= cutoffTime;
    });

    // Step 2: Reconcile articles into a unified map of articleUrl -> StorySource
    const articleMap = new Map<string, StorySource>();

    for (const story of redisStories) {
      for (const src of story.sources) {
        if (src.url) {
          articleMap.set(src.url, src);
        }
      }
    }

    for (const vec of vectorArticles) {
      const meta = vec.metadata;
      if (meta.url && !articleMap.has(meta.url)) {
        articleMap.set(meta.url, {
          title: meta.title || "",
          source: meta.source || "",
          url: meta.url,
          publishedAt: meta.published_at
            ? new Date(meta.published_at * 1000).toISOString()
            : new Date().toISOString(),
          credibilityScore: 0.8,
          addedAt: Date.now(),
          category: meta.category,
        });
      }
    }

    const currentStoriesForGemini = redisStories.map((story) => ({
      storyId: story.id,
      headline: story.headline,
      categories: story.categories,
      articles: story.sources.map((src) => ({
        title: src.title,
        source: src.source,
        url: src.url,
        category: src.category,
        publishedAt: src.publishedAt,
      })),
    }));

    const orphanedArticles = [];
    for (const [url, src] of articleMap.entries()) {
      const inRedis = redisStories.some((s) =>
        s.sources.some((a) => a.url === url),
      );
      if (!inRedis) {
        orphanedArticles.push({
          title: src.title,
          source: src.source,
          url: src.url,
          category: src.category,
          publishedAt: src.publishedAt,
        });
      }
    }

    if (redisStories.length === 0 && orphanedArticles.length === 0) {
      return {
        success: true,
        dryRun,
        originalStoriesCount: 0,
        newStoriesCount: 0,
        data: [],
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`[POST /api/group] Sending group data to Gemini AI model...`);
    const groupResult = await geminiService.groupArticles(
      currentStoriesForGemini,
      orphanedArticles,
      {
        apiKey: config.geminiApiKey as string,
        model:
          (config.geminiModel as string | undefined) ||
          process.env.GEMINI_MODEL,
      },
    );

    // Delete non-Japan articles identified by Gemini
    if (
      groupResult.unrelatedArticleUrls &&
      groupResult.unrelatedArticleUrls.length > 0
    ) {
      console.log(
        `[Group Sweep] Gemini identified ${groupResult.unrelatedArticleUrls.length} unrelated articles.`,
      );
      for (const url of groupResult.unrelatedArticleUrls) {
        console.log(`[Group Sweep] Deleting unrelated article: ${url}`);
        if (!dryRun) {
          await upstashVectorService.deleteArticle(url);
          await storiesService.removeProcessedArticle(url);
        }
        articleMap.delete(url);
      }
    }

    const newStories: Story[] = [];
    const originalStoriesMap = new Map<string, Story>();
    for (const s of redisStories) {
      originalStoriesMap.set(s.id, s);
    }

    for (const gs of groupResult.stories) {
      const sources: StorySource[] = [];
      for (const url of gs.articleUrls) {
        const src = articleMap.get(url);
        if (src) {
          sources.push(src);
        }
      }

      // Skip stories that end up with 0 valid sources
      if (sources.length === 0) {
        console.log(
          `[Group Sweep] Skipping story "${gs.headline}" (ID: ${gs.storyId}) - no valid sources.`,
        );
        continue;
      }

      const existing = originalStoriesMap.get(gs.storyId);
      const firstSeen = existing ? existing.firstSeen : Date.now();
      const trendScore = existing ? existing.trendScore : 0;
      const isSummarized = existing ? (existing.isSummarized ?? true) : false;
      const oldSummary = existing ? existing.summary : "";
      const oldThematic = existing ? existing.thematicAnalysis : "";

      // Need summary generation if sources length changed or if it was never summarized
      const needsSummary =
        !isSummarized ||
        !existing ||
        existing.sources.length !== sources.length;

      newStories.push({
        id: gs.storyId,
        headline: gs.headline,
        summary: oldSummary,
        thematicAnalysis: oldThematic,
        articleCount: sources.length,
        firstSeen,
        lastUpdated: Date.now(),
        trendScore,
        sources,
        categories: gs.categories,
        isSummarized: !needsSummary,
      });
    }

    if (!dryRun) {
      await storiesService.clearAllStories();

      for (const story of newStories) {
        await storiesService.saveStory(story);

        for (const src of story.sources) {
          await upstashVectorService.updateArticleStory(src.url, story.id);
        }
      }

      await storiesService.updateVelocityScores();
    }

    return {
      success: true,
      dryRun,
      originalStoriesCount: redisStories.length,
      newStoriesCount: newStories.length,
      data: newStories,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid body parameters",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }

    console.error("[POST /api/group] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to group stories",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }
});
