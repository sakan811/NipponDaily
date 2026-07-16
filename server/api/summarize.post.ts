import { storiesService } from "../services/stories";
import { geminiService } from "../services/gemini";
import type { Story, NewsItem, StorySource } from "../../types/index";
import type { CategoryName } from "../../constants/categories";

/**
 * POST /api/summarize
 *
 * Finds all stories that have `isSummarized: false` and processes them
 * via Gemini to generate summaries, thematic analyses, and region tags.
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  try {
    console.log(`[POST /api/summarize] Starting summarization pipeline...`);
    const allStories = await storiesService.getStories();
    const pendingStories = allStories.filter((s) => !s.isSummarized);

    if (pendingStories.length === 0) {
      console.log(`[POST /api/summarize] No pending stories to summarize.`);
      return {
        success: true,
        summarizedCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(
      `[POST /api/summarize] Found ${pendingStories.length} stories pending summarization.`,
    );

    const storiesToProcess: Array<{
      storyId: string;
      existingStory?: Story;
      articles: NewsItem[];
    }> = [];

    for (const story of pendingStories) {
      // If the story has an old summary, we consider it an update, otherwise it's new.
      const hasOldSummary = story.summary && story.summary.trim().length > 0;

      const articles: NewsItem[] = story.sources.map((src: StorySource) => ({
        title: src.title,
        source: src.source,
        url: src.url,
        category: (src.category || "Other") as CategoryName,
        publishedAt: src.publishedAt,
        favicon: src.favicon,
        summary: "", // We might not have raw article summaries here, but titles are enough for Gemini.
        content: "",
      }));

      storiesToProcess.push({
        storyId: story.id,
        existingStory: hasOldSummary ? story : undefined,
        articles,
      });
    }

    let storiesUpdated = 0;
    const BATCH_SIZE = 15;

    for (let i = 0; i < storiesToProcess.length; i += BATCH_SIZE) {
      if (i > 0) {
        const waitTimeMs = 12000;
        console.log(
          `[POST /api/summarize] Waiting ${waitTimeMs / 1000}s between batches to respect free tier RPM limit...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
      }

      const batch = storiesToProcess.slice(i, i + BATCH_SIZE);
      let resultsMap: Record<
        string,
        {
          headline: string;
          summary: string;
          thematicAnalysis: string;
          overallCredibilityScore: number;
          categories: string[];
        }
      > = {};

      try {
        console.log(
          `[POST /api/summarize] Processing batch of ${batch.length} stories with Gemini...`,
        );
        resultsMap = await geminiService.batchProcessStories(batch, {
          apiKey: config.geminiApiKey as string,
          model:
            (config.geminiModel as string | undefined) ||
            process.env.GEMINI_MODEL,
        });
      } catch (batchError) {
        console.error(
          "[POST /api/summarize] Batch processing failed:",
          batchError,
        );
        continue;
      }

      for (const item of batch) {
        const result = resultsMap[item.storyId];
        if (result) {
          const originalStory = pendingStories.find(
            (s) => s.id === item.storyId,
          )!;

          const categoriesSet = new Set([
            ...(originalStory.categories || []),
            ...(result.categories || []),
          ]);

          originalStory.headline = result.headline;
          originalStory.summary = result.summary;
          originalStory.thematicAnalysis = result.thematicAnalysis;
          originalStory.categories = Array.from(categoriesSet);
          originalStory.isSummarized = true;

          await storiesService.saveStory(originalStory);
          storiesUpdated++;
        }
      }
    }

    console.log(
      `[POST /api/summarize] Successfully summarized ${storiesUpdated} stories.`,
    );

    return {
      success: true,
      summarizedCount: storiesUpdated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[POST /api/summarize] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to summarize stories",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }
});
