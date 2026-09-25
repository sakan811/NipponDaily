import { ref, computed } from "vue";

export const LESSON_PROGRESS_STORAGE_KEY = "n5-lesson-progress";

/**
 * Which lessons (by number) this browser has completed. Kept in
 * localStorage only — a per-viewer convenience like the colour mode, never
 * sent to the server — and every read/write tolerates storage being
 * unavailable (private windows, blocked site data), in which case progress
 * simply lasts for the page session.
 */
export function useLessonProgress() {
  const completed = ref<Set<number>>(new Set());

  const load = (): void => {
    try {
      const raw = localStorage.getItem(LESSON_PROGRESS_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      completed.value = new Set(
        Array.isArray(parsed)
          ? parsed.filter((n): n is number => Number.isInteger(n) && n > 0)
          : [],
      );
    } catch {
      completed.value = new Set();
    }
  };

  const save = (): void => {
    try {
      localStorage.setItem(
        LESSON_PROGRESS_STORAGE_KEY,
        JSON.stringify([...completed.value].sort((a, b) => a - b)),
      );
    } catch {
      // Storage unavailable — keep the in-memory progress only.
    }
  };

  const isCompleted = (lessonNumber: number): boolean =>
    completed.value.has(lessonNumber);

  const markCompleted = (lessonNumber: number): void => {
    if (completed.value.has(lessonNumber)) return;
    completed.value = new Set([...completed.value, lessonNumber]);
    save();
  };

  const markIncomplete = (lessonNumber: number): void => {
    if (!completed.value.has(lessonNumber)) return;
    const next = new Set(completed.value);
    next.delete(lessonNumber);
    completed.value = next;
    save();
  };

  const completedCount = computed(() => completed.value.size);

  /** The first lesson (1..total) not yet completed, or null when all are. */
  const nextLessonNumber = (total: number): number | null => {
    for (let n = 1; n <= total; n++) {
      if (!completed.value.has(n)) return n;
    }
    return null;
  };

  return {
    completed,
    completedCount,
    load,
    isCompleted,
    markCompleted,
    markIncomplete,
    nextLessonNumber,
  };
}
