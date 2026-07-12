import { randomUUID, createHash } from "node:crypto";
import { tavilyService } from "./tavily";
import { geminiService } from "./gemini";
import { upstashVectorService } from "./vector";
import { storiesService } from "./stories";
import type { NewsItem, Story, StorySource } from "~~/types/index";

export async function ingestNewsTask(): Promise<{
  success: boolean;
  storiesUpdated: number;
  articlesProcessed: number;
}> {
  console.log("[Ingest] Beginning news ingestion pipeline...");
  const config = useRuntimeConfig();

  const rawArticles: NewsItem[] = [];

  // 1. Fetch recent news from Tavily only once (20 articles, focusing on recent Japanese news in English)
  try {
    console.log("[Ingest] Fetching Tavily news once for recent Japan news...");
    const rawTavilyKey = config.tavilyApiKey;
    const tavilyApiKey =
      (typeof rawTavilyKey === "string" ? rawTavilyKey : "") ||
      process.env.TAVILY_API_KEY;
    const response = await tavilyService.searchJapanNews({
      maxResults: 20,
      timeRange: "week",
      apiKey: tavilyApiKey,
    });

    const items = tavilyService.formatTavilyResultsToNewsItems(response);
    rawArticles.push(...items);
  } catch (e) {
    console.error("[Ingest] Failed to fetch news from Tavily:", e);
  }

  // Deduplicate raw articles by URL or title
  const uniqueArticlesMap = new Map<string, NewsItem>();
  for (const article of rawArticles) {
    if (article.url) {
      uniqueArticlesMap.set(article.url, article);
    } else {
      uniqueArticlesMap.set(article.title, article);
    }
  }
  const uniqueArticles = Array.from(uniqueArticlesMap.values());
  console.log(
    `[Ingest] Fetched ${uniqueArticles.length} unique raw articles from Tavily.`,
  );

  // 2. Filter out already processed articles
  const newArticles: NewsItem[] = [];
  for (const article of uniqueArticles) {
    if (!article.url) continue;
    const isProcessed = await storiesService.isArticleProcessed(article.url);
    if (!isProcessed) {
      newArticles.push(article);
    }
  }
  console.log(`[Ingest] Found ${newArticles.length} new articles to process.`);

  if (newArticles.length === 0) {
    // Even if no new articles, recalculate velocity scores and update
    await storiesService.updateVelocityScores();
    await storiesService.setLastIngestTime(Date.now());
    return { success: true, storiesUpdated: 0, articlesProcessed: 0 };
  }

  // 3. Cluster new articles using Upstash Vector
  const storyGroups = new Map<string, NewsItem[]>(); // story_id -> articles[]

  for (const article of newArticles) {
    try {
      const dataStr = `${article.title} \n ${article.summary}`;
      const cutoff72h = Math.floor((Date.now() - 72 * 3600 * 1000) / 1000);

      // Query vector similarity
      const matches = await upstashVectorService.querySimilarity(dataStr, {
        topK: 1,
        filter: `published_at >= ${cutoff72h}`,
      });

      let storyId: string;
      const SIMILARITY_THRESHOLD = 0.82; // cos similarity threshold, start at 0.82 to be slightly inclusive

      if (
        matches &&
        matches.length > 0 &&
        matches[0]!.score >= SIMILARITY_THRESHOLD
      ) {
        storyId = matches[0]!.metadata.story_id;
        console.log(
          `[Ingest] Article "${article.title}" matched existing story: ${storyId} (score: ${matches[0]!.score.toFixed(3)})`,
        );
      } else {
        storyId = randomUUID();
        console.log(
          `[Ingest] Article "${article.title}" did not match. Minting new story ID: ${storyId}`,
        );
      }

      // Add to group
      if (!storyGroups.has(storyId)) {
        storyGroups.set(storyId, []);
      }
      storyGroups.get(storyId)!.push(article);

      // Upsert into Upstash Vector index
      const articleId = createHash("sha256").update(article.url!).digest("hex");
      await upstashVectorService.upsertArticle(articleId, dataStr, {
        story_id: storyId,
        category: article.category as string,
        source: article.source,
        url: article.url,
        published_at: Math.floor(
          new Date(article.publishedAt).getTime() / 1000,
        ),
        title: article.title,
      });
    } catch (e) {
      console.error(`[Ingest] Error clustering article "${article.title}":`, e);
    }
  }

  // 4. Update or Create story briefings using Gemini
  let storiesUpdated = 0;
  for (const [storyId, articles] of storyGroups.entries()) {
    try {
      const existingStory = await storiesService.getStory(storyId);
      let updatedStory: Story;

      if (existingStory) {
        console.log(
          `[Ingest] Updating existing story: ${storyId} with ${articles.length} new articles`,
        );
        // Synthesize updates via LLM
        const rawGeminiKey = config.geminiApiKey;
        const geminiApiKey =
          (typeof rawGeminiKey === "string" ? rawGeminiKey : "") ||
          process.env.GEMINI_API_KEY;
        const briefingUpdate = await geminiService.updateStoryBriefing(
          existingStory,
          articles,
          {
            apiKey: geminiApiKey,
          },
        );

        // Map articles to StorySources
        const newSources: StorySource[] = articles.map((a) => ({
          title: a.title,
          source: a.source,
          url: a.url!,
          publishedAt: a.publishedAt,
          favicon: a.favicon,
          credibilityScore: 0.8, // default fallback
          regions: briefingUpdate.regionsAffected || [],
          addedAt: Date.now(),
          category: a.category as string,
        }));

        // Merge sources and sort by published date descending
        const combinedSources = [...existingStory.sources, ...newSources];
        combinedSources.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );

        // Update region breakdown
        const regionBreakdown = { ...existingStory.regionBreakdown };
        briefingUpdate.regionsAffected.forEach((region) => {
          regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
        });

        // Compile unique categories from Gemini response
        const categoriesSet = new Set([
          ...(existingStory.categories || []),
          ...(briefingUpdate.categories || []),
        ]);

        updatedStory = {
          id: storyId,
          headlineEn: briefingUpdate.headlineEn,
          headlineJa: briefingUpdate.headlineJa,
          summaryEn: briefingUpdate.summaryEn,
          summaryJa: briefingUpdate.summaryJa,
          thematicAnalysisEn: briefingUpdate.thematicAnalysisEn,
          thematicAnalysisJa: briefingUpdate.thematicAnalysisJa,
          articleCount: combinedSources.length,
          regionBreakdown,
          firstSeen: existingStory.firstSeen,
          lastUpdated: Date.now(),
          trendScore: existingStory.trendScore, // recalculated later
          sources: combinedSources,
          categories: Array.from(categoriesSet),
        };
      } else {
        console.log(
          `[Ingest] Generating new story: ${storyId} with ${articles.length} articles`,
        );
        // Generate new briefing via LLM
        const rawGeminiKey = config.geminiApiKey;
        const geminiApiKey =
          (typeof rawGeminiKey === "string" ? rawGeminiKey : "") ||
          process.env.GEMINI_API_KEY;
        const briefing = await geminiService.generateStoryBriefing(articles, {
          apiKey: geminiApiKey,
        });

        const newSources: StorySource[] = articles.map((a) => ({
          title: a.title,
          source: a.source,
          url: a.url!,
          publishedAt: a.publishedAt,
          favicon: a.favicon,
          credibilityScore: briefing.overallCredibilityScore || 0.8,
          regions: briefing.regionsAffected || [],
          addedAt: Date.now(),
          category: a.category as string,
        }));

        const regionBreakdown: Record<string, number> = {};
        briefing.regionsAffected.forEach((region) => {
          regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
        });

        updatedStory = {
          id: storyId,
          headlineEn: briefing.headlineEn,
          headlineJa: briefing.headlineJa,
          summaryEn: briefing.summaryEn,
          summaryJa: briefing.summaryJa,
          thematicAnalysisEn: briefing.thematicAnalysisEn,
          thematicAnalysisJa: briefing.thematicAnalysisJa,
          articleCount: newSources.length,
          regionBreakdown,
          firstSeen: Date.now(),
          lastUpdated: Date.now(),
          trendScore: 0, // recalculated later
          sources: newSources,
          categories: briefing.categories || ["society"],
        };
      }

      // Save story to Redis
      await storiesService.saveStory(updatedStory);
      storiesUpdated++;

      // Mark all raw articles in this story as processed
      for (const article of articles) {
        if (article.url) {
          await storiesService.markArticleProcessed(article.url);
        }
      }
    } catch (e) {
      console.error(`[Ingest] Failed to process story ${storyId}:`, e);
    }
  }

  // 5. Recalculate trending scores for all stories
  console.log("[Ingest] Updating trending velocity scores...");
  await storiesService.updateVelocityScores();

  // Set last ingest time
  await storiesService.setLastIngestTime(Date.now());
  console.log(
    `[Ingest] Ingestion completed. Stories updated/created: ${storiesUpdated}, Articles processed: ${newArticles.length}`,
  );

  return {
    success: true,
    storiesUpdated,
    articlesProcessed: newArticles.length,
  };
}
