import { describe, it, expect, beforeEach } from "vitest";
import {
  LESSON_PROGRESS_STORAGE_KEY,
  useLessonProgress,
} from "~/app/composables/useLessonProgress";

describe("useLessonProgress", () => {
  beforeEach(() => localStorage.clear());

  it("persists completed lessons and finds the next one", () => {
    const progress = useLessonProgress();
    progress.load();
    expect(progress.nextLessonNumber(3)).toBe(1);
    progress.markCompleted(1);
    progress.markCompleted(2);
    expect(progress.nextLessonNumber(3)).toBe(3);

    const reloaded = useLessonProgress();
    reloaded.load();
    expect(reloaded.isCompleted(2)).toBe(true);
    expect(reloaded.completedCount.value).toBe(2);

    reloaded.markIncomplete(2);
    expect(
      JSON.parse(localStorage.getItem(LESSON_PROGRESS_STORAGE_KEY)!),
    ).toEqual([1]);
    reloaded.markCompleted(3);
    reloaded.markCompleted(2);
    expect(reloaded.nextLessonNumber(3)).toBeNull();
  });

  it("ignores corrupt storage", () => {
    localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, "{not json");
    const progress = useLessonProgress();
    progress.load();
    expect(progress.completedCount.value).toBe(0);

    localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, '[1,"x",-2,2.5]');
    progress.load();
    expect([...progress.completed.value]).toEqual([1]);
  });
});
