import { lessonsService } from "./lessons";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export interface CleanupResult {
  success: boolean;
  lessonsDeleted: number;
}

/**
 * Permanently removes lessons from Redis whose article is older than one month.
 */
export async function cleanupOldDataTask(options?: {
  dryRun?: boolean;
}): Promise<CleanupResult> {
  const dryRun = options?.dryRun ?? false;
  const cutoffTime = Date.now() - ONE_MONTH_MS;

  console.log(
    `[Cleanup] Starting cleanup of data older than ${new Date(cutoffTime).toISOString()}... DryRun: ${dryRun}`,
  );

  const lessons = await lessonsService.getLessons();
  const staleLessons = lessons.filter((lesson) => {
    const time = new Date(lesson.publishedAt).getTime() || lesson.addedAt || 0;
    return time < cutoffTime;
  });

  for (const lesson of staleLessons) {
    console.log(
      `[Cleanup] Removing stale lesson "${lesson.title}" (ID: ${lesson.id})`,
    );
    if (!dryRun) {
      await lessonsService.deleteLesson(lesson.id);
    }
  }

  console.log(`[Cleanup] Completed. Lessons deleted: ${staleLessons.length}`);

  return {
    success: true,
    lessonsDeleted: staleLessons.length,
  };
}
