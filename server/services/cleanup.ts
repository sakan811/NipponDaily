import { storiesService } from "./stories";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export interface CleanupResult {
  success: boolean;
  storiesDeleted: number;
}

/**
 * Permanently removes stories from Redis that are older than one month.
 */
export async function cleanupOldDataTask(options?: {
  dryRun?: boolean;
}): Promise<CleanupResult> {
  const dryRun = options?.dryRun ?? false;
  const cutoffTime = Date.now() - ONE_MONTH_MS;

  console.log(
    `[Cleanup] Starting cleanup of data older than ${new Date(cutoffTime).toISOString()}... DryRun: ${dryRun}`,
  );

  // Prune stale stories from Redis
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

  console.log(`[Cleanup] Completed. Stories deleted: ${staleStories.length}`);

  return {
    success: true,
    storiesDeleted: staleStories.length,
  };
}
