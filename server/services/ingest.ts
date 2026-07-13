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

  // 1. Fetch recent news from Tavily for all categories (20 each)
  try {
    console.log("[Ingest] Fetching Tavily news for all categories...");
    const rawTavilyKey = config.tavilyApiKey;
    const tavilyApiKey =
      (typeof rawTavilyKey === "string" ? rawTavilyKey : "") ||
      process.env.TAVILY_API_KEY;

    const categoriesToFetch = [
      "society",
      "tech",
      "pop-culture",
      "tourism",
      "food",
      "disaster-prep",
    ];

    const categoryIdToName: Record<string, string> = {
      society: "Society",
      tech: "Tech",
      "pop-culture": "Pop Culture",
      tourism: "Tourism",
      food: "Food",
      "disaster-prep": "Nature",
    };

    const fetchPromises = categoriesToFetch.map(async (catId) => {
      try {
        const response = await tavilyService.searchJapanNews({
          maxResults: 20,
          category: catId,
          timeRange: "week",
          apiKey: tavilyApiKey,
        });
        const items = tavilyService.formatTavilyResultsToNewsItems(response);
        // Override category of formatted items to match CategoryName
        return items.map((item) => ({
          ...item,
          category: (categoryIdToName[catId] || "Other") as any,
        }));
      } catch (err) {
        console.error(`[Ingest] Failed to fetch Tavily news for category "${catId}":`, err);
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    for (const res of results) {
      if (res.status === "fulfilled") {
        rawArticles.push(...res.value);
      }
    }
  } catch (e) {
    console.error("[Ingest] Failed during Tavily categories search:", e);
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

  // 4. Update or Create story briefings using Gemini in batches
  let storiesUpdated = 0;
  const rawGeminiKey = config.geminiApiKey;
  const geminiApiKey =
    (typeof rawGeminiKey === "string" ? rawGeminiKey : "") ||
    process.env.GEMINI_API_KEY;

  // Gather stories to process
  const storiesToProcess: Array<{
    storyId: string;
    existingStory?: Story;
    articles: NewsItem[];
  }> = [];

  for (const [storyId, articles] of storyGroups.entries()) {
    const existingStory = await storiesService.getStory(storyId);
    storiesToProcess.push({
      storyId,
      existingStory: existingStory || undefined,
      articles,
    });
  }

  // Split into batches of at most 5 stories to avoid model confusion and payload limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < storiesToProcess.length; i += BATCH_SIZE) {
    const batch = storiesToProcess.slice(i, i + BATCH_SIZE);
    let resultsMap: Record<string, {
      headline: string;
      summary: string;
      thematicAnalysis: string;
      regionsAffected: string[];
      overallCredibilityScore: number;
      categories: string[];
    }> = {};

    try {
      console.log(`[Ingest] Processing batch of ${batch.length} stories with Gemini...`);
      resultsMap = await geminiService.batchProcessStories(batch, {
        apiKey: geminiApiKey,
      });
    } catch (batchError) {
      console.error("[Ingest] Batch processing failed, will fall back to individual processing:", batchError);
    }

    // Process each story in the batch (saving and marking articles)
    for (const item of batch) {
      const { storyId, existingStory, articles } = item;
      try {
        let briefingResult = resultsMap[storyId];

        // Graceful fallback to individual requests if batch missed this story or failed
        if (!briefingResult) {
          console.log(`[Ingest] Story ${storyId} not found in batch results. Processing individually...`);
          try {
            if (existingStory) {
              briefingResult = await geminiService.updateStoryBriefing(existingStory, articles, {
                apiKey: geminiApiKey,
              });
            } else {
              briefingResult = await geminiService.generateStoryBriefing(articles, {
                apiKey: geminiApiKey,
              });
            }
          } catch (individualError) {
            console.error(`[Ingest] Individual fallback failed for story ${storyId}:`, individualError);
            // Local fallback generation
            if (existingStory) {
              briefingResult = {
                headline: existingStory.headline,
                summary: existingStory.summary + "\n" + articles.map(a => `- ${a.summary}`).join("\n"),
                thematicAnalysis: existingStory.thematicAnalysis,
                regionsAffected: Object.keys(existingStory.regionBreakdown),
                overallCredibilityScore: existingStory.sources[0]?.credibilityScore || 0.7,
                categories: existingStory.categories || ["society"],
              };
            } else {
              briefingResult = {
                headline: articles[0]?.title || "New Story Cluster",
                summary: articles.map(a => `- ${a.summary}`).join("\n"),
                thematicAnalysis: "- Cross-source analysis unavailable.",
                regionsAffected: [],
                overallCredibilityScore: 0.7,
                categories: ["society"],
              };
            }
          }
        }

        let updatedStory: Story;

        if (existingStory) {
          // Map articles to StorySources
          const newSources: StorySource[] = articles.map((a) => ({
            title: a.title,
            source: a.source,
            url: a.url!,
            publishedAt: a.publishedAt,
            favicon: a.favicon,
            credibilityScore: 0.8, // default fallback
            regions: briefingResult.regionsAffected || [],
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
          briefingResult.regionsAffected.forEach((region) => {
            regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
          });

          // Compile unique categories from Gemini response
          const categoriesSet = new Set([
            ...(existingStory.categories || []),
            ...(briefingResult.categories || []),
          ]);

          updatedStory = {
            id: storyId,
            headline: briefingResult.headline,
            summary: briefingResult.summary,
            thematicAnalysis: briefingResult.thematicAnalysis,
            articleCount: combinedSources.length,
            regionBreakdown,
            firstSeen: existingStory.firstSeen,
            lastUpdated: Date.now(),
            trendScore: existingStory.trendScore,
            sources: combinedSources,
            categories: Array.from(categoriesSet),
          };
        } else {
          const newSources: StorySource[] = articles.map((a) => ({
            title: a.title,
            source: a.source,
            url: a.url!,
            publishedAt: a.publishedAt,
            favicon: a.favicon,
            credibilityScore: briefingResult.overallCredibilityScore || 0.8,
            regions: briefingResult.regionsAffected || [],
            addedAt: Date.now(),
            category: a.category as string,
          }));

          const regionBreakdown: Record<string, number> = {};
          briefingResult.regionsAffected.forEach((region) => {
            regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
          });

          updatedStory = {
            id: storyId,
            headline: briefingResult.headline,
            summary: briefingResult.summary,
            thematicAnalysis: briefingResult.thematicAnalysis,
            articleCount: newSources.length,
            regionBreakdown,
            firstSeen: Date.now(),
            lastUpdated: Date.now(),
            trendScore: 0,
            sources: newSources,
            categories: briefingResult.categories || ["society"],
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
