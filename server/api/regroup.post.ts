import { z } from "zod";
import { defineEventHandler, readBody, createError } from "h3";
import { storiesService } from "../services/stories";
import { upstashVectorService } from "../services/vector";
import { geminiService } from "../services/gemini";
import type { Story, StorySource } from "~~/types/index";

const regroupBodySchema = z.object({
  dryRun: z.boolean().optional().default(false),
});

/**
 * POST /api/regroup
 *
 * Reconciles stories from Redis and vectors/metadata from Upstash Vector.
 * Sends the article dataset to Gemini in a single pass to correct clustering/grouping mistakes.
 * If not dryRun, commits the regrouped stories back to Redis and updates Upstash Vector references.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const body = await readBody(event).catch(() => ({}));
    const { dryRun } = regroupBodySchema.parse(body);

    console.log(`[POST /api/regroup] Starting stories regrouping pipeline... DryRun: ${dryRun}`);

    // 1. Fetch stories from Redis
    const redisStories = await storiesService.getStories();

    // 2. Fetch all article vectors/metadata from Upstash Vector
    const vectorArticles = await upstashVectorService.getAllArticles();

    console.log(`[POST /api/regroup] Fetched ${redisStories.length} stories from Redis and ${vectorArticles.length} articles from Vector DB.`);

    // 3. Reconcile articles into a unified map of articleUrl -> StorySource
    const articleMap = new Map<string, StorySource>();

    // Populated from Redis stories first
    for (const story of redisStories) {
      for (const src of story.sources) {
        if (src.url) {
          articleMap.set(src.url, src);
        }
      }
    }

    // Supplement from Vector DB
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
          regions: meta.regions || [],
          addedAt: Date.now(),
          category: meta.category,
        });
      }
    }

    // 4. Group articles by their current story ID or identify as orphaned
    const currentStoriesForGemini = redisStories.map((story) => ({
      storyId: story.id,
      headline: story.headline,
      summary: story.summary,
      categories: story.categories,
      articles: story.sources.map((src) => ({
        title: src.title,
        source: src.source,
        url: src.url,
        category: src.category,
        publishedAt: src.publishedAt,
      })),
    }));

    // Find any orphaned articles (articles in Vector DB/metadata that are not in any Redis story sources)
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

    console.log(`[POST /api/regroup] Reconciled article map has ${articleMap.size} unique articles. Found ${orphanedArticles.length} orphaned articles.`);

    // 5. Send grouping data to Gemini in one pass
    console.log(`[POST /api/regroup] Sending regroup data to Gemini AI model...`);
    const regroupResult = await geminiService.regroupStories(
      currentStoriesForGemini,
      orphanedArticles,
      {
        apiKey: config.geminiApiKey as string,
        model:
          (config.geminiModel as string | undefined) ||
          process.env.GEMINI_MODEL,
      },
    );

    console.log(`[POST /api/regroup] Gemini successfully returned ${regroupResult.stories.length} regrouped stories.`);

    // 6. Build the new stories objects based on Gemini's output
    const newStories: Story[] = [];
    const originalStoriesMap = new Map<string, Story>();
    for (const s of redisStories) {
      originalStoriesMap.set(s.id, s);
    }

    for (const gs of regroupResult.stories) {
      // Find the sources for the URLs decided by Gemini
      const sources: StorySource[] = [];
      for (const url of gs.articleUrls) {
        const src = articleMap.get(url);
        if (src) {
          sources.push(src);
        }
      }

      // Compute region breakdown
      const regionBreakdown: Record<string, number> = {};
      for (const src of sources) {
        for (const region of src.regions || []) {
          regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
        }
      }
      // Guarantee Gemini's suggested regions are initialized
      gs.regionsAffected.forEach((region) => {
        if (!regionBreakdown[region]) {
          regionBreakdown[region] = 1;
        }
      });

      // Check if we can reuse metadata from an existing story
      const existing = originalStoriesMap.get(gs.storyId);
      const firstSeen = existing ? existing.firstSeen : Date.now();
      const trendScore = existing ? existing.trendScore : 0;

      newStories.push({
        id: gs.storyId,
        headline: gs.headline,
        summary: gs.summary,
        thematicAnalysis: gs.thematicAnalysis,
        articleCount: sources.length,
        regionBreakdown,
        firstSeen,
        lastUpdated: Date.now(),
        trendScore,
        sources,
        categories: gs.categories,
      });
    }

    // 7. If not dryRun, write back to Redis and update Vector DB
    if (!dryRun) {
      console.log(`[POST /api/regroup] DryRun is false. Committing updates to Redis and Upstash Vector DB...`);
      // Clear old stories
      await storiesService.clearAllStories();

      // Save new stories and update vector DB
      for (const story of newStories) {
        // Save to Redis
        await storiesService.saveStory(story);

        // Update each article's story_id in the vector database
        for (const src of story.sources) {
          await upstashVectorService.updateArticleStory(src.url, story.id);
        }
      }

      // Update velocity scores
      await storiesService.updateVelocityScores();
      await storiesService.setLastIngestTime(Date.now());
    }

    console.log(`[POST /api/regroup] Stories regrouping completed successfully. DryRun: ${dryRun}. Original: ${redisStories.length}, New: ${newStories.length}`);

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

    console.error("[POST /api/regroup] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to regroup stories",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }
});
