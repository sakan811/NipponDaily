import { createHash } from "node:crypto";
import { tavilyService } from "./tavily";
import { upstashVectorService } from "./vector";
import { storiesService } from "./stories";
import type { NewsItem } from "~~/types/index";
import type { CategoryName } from "~~/constants/categories";

export function isRelatedToJapan(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();

  // 1. Check for Japanese characters (Hiragana, Katakana, Kanji)
  const hasJapanese =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(
      text,
    );
  if (hasJapanese) return true;

  // 2. Check for Japan-specific keywords
  const japanKeywords = [
    "japan",
    "japanese",
    "tokyo",
    "kyoto",
    "osaka",
    "hokkaido",
    "okinawa",
    "yokohama",
    "nagoya",
    "sapporo",
    "kobe",
    "fukuoka",
    "shinkansen",
    "yen",
    "nintendo",
    "sony",
    "toyota",
    "honda",
    "fukushima",
    "hiroshima",
    "nagasaki",
    "prefecture",
    "mount fuji",
    "washoku",
    "sake",
    "ramen",
    "shibuya",
    "shinjuku",
    "fuji",
    "kanto",
    "kansai",
    "tohoku",
    "chubu",
    "chugoku",
    "shikoku",
    "kyushu",
    "kishida",
    "emperor of japan",
    "diet of japan",
    "jsdf",
    "nikkei",
    "nhk",
    "asahi",
    "mainichi",
    "yomiuri",
    "okinawan",
    "sushi",
    "manga",
    "anime",
    "sumo",
    "kabuki",
  ];

  return japanKeywords.some((keyword) => text.includes(keyword));
}

export async function ingestNewsTask(): Promise<{
  success: boolean;
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
        // Filter out news unrelated to Japan immediately
        const filteredItems = items.filter((item) =>
          isRelatedToJapan(item.title, item.summary || item.content),
        );
        // Override category of formatted items to match CategoryName
        return filteredItems.map((item) => ({
          ...item,
          category: (categoryIdToName[catId] || "Other") as CategoryName,
        }));
      } catch (err) {
        console.error(
          `[Ingest] Failed to fetch Tavily news for category "${catId}":`,
          err,
        );
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
    await storiesService.setLastIngestTime(Date.now());
    return { success: true, articlesProcessed: 0 };
  }

  // 3. Embed new articles and save to Upstash Vector
  for (const article of newArticles) {
    try {
      const dataStr = `${article.title} \n ${article.summary}`;

      // Generate embedding vector
      const vector = await upstashVectorService.getEmbedding(dataStr);

      // Upsert into Upstash Vector index with no story_id (will be grouped later)
      const articleId = createHash("sha256").update(article.url!).digest("hex");
      await upstashVectorService.upsertArticle(articleId, vector, {
        story_id: "", // Empty to denote orphaned/ungrouped
        category: article.category as string,
        source: article.source,
        url: article.url,
        published_at: Math.floor(
          new Date(article.publishedAt).getTime() / 1000,
        ),
        title: article.title,
      });

      // Mark article as processed
      await storiesService.markArticleProcessed(article.url!);
    } catch (e) {
      console.error(`[Ingest] Error embedding article "${article.title}":`, e);
    }
  }

  // Set last ingest time
  await storiesService.setLastIngestTime(Date.now());

  console.log(
    `[Ingest] Ingestion completed. Articles processed and embedded: ${newArticles.length}`,
  );

  return {
    success: true,
    articlesProcessed: newArticles.length,
  };
}
