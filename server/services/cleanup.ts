import { upstashVectorService } from "./vector";
import { storiesService } from "./stories";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export interface CleanupResult {
  success: boolean;
  storiesDeleted: number;
  articlesDeleted: number;
}

/**
 * Permanently removes stories from Redis and articles from Upstash Vector
 * that are older than one month. Unlike the 30-day filter in /api/group
 * (which only excludes old data from the in-memory grouping pass), this
 * actually deletes the underlying records so both stores don't grow forever.
 */
export async function cleanupOldDataTask(options?: {
  dryRun?: boolean;
}): Promise<CleanupResult> {
  const dryRun = options?.dryRun ?? false;
  const cutoffTime = Date.now() - ONE_MONTH_MS;

  console.log(
    `[Cleanup] Starting cleanup of data older than ${new Date(cutoffTime).toISOString()}... DryRun: ${dryRun}`,
  );

  // 1. Prune stale stories from Redis
  const stories = await storiesService.getStories();
  const staleStories = stories.filter((story) => story.lastUpdated < cutoffTime);

  for (const story of staleStories) {
    console.log(
      `[Cleanup] Removing stale story "${story.headline}" (ID: ${story.id})`,
    );
    if (!dryRun) {
      await storiesService.deleteStory(story.id);
    }
  }

  // 2. Prune stale articles from Upstash Vector
  const vectorArticles = await upstashVectorService.getAllArticles();
  const staleArticles = vectorArticles.filter((vec) => {
    const pubTime = vec.metadata.published_at
      ? vec.metadata.published_at * 1000
      : 0;
    return pubTime < cutoffTime;
  });

  for (const vec of staleArticles) {
    const url = vec.metadata.url;
    if (!url) continue;
    console.log(
      `[Cleanup] Removing stale article "${vec.metadata.title}" (${url})`,
    );
    if (!dryRun) {
      await upstashVectorService.deleteArticle(url);
      await storiesService.removeProcessedArticle(url);
    }
  }

  console.log(
    `[Cleanup] Completed. Stories deleted: ${staleStories.length}, Articles deleted: ${staleArticles.length}`,
  );

  return {
    success: true,
    storiesDeleted: staleStories.length,
    articlesDeleted: staleArticles.length,
  };
}
