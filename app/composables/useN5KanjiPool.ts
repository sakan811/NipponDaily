import { ref } from "vue";
import type { N5Kanji } from "~~/types/index";

/**
 * Fetches GET /api/n5-kanji for the lesson pages, which break every word
 * down into the kanji it's written with. Kanji are an enhancement there —
 * a failed fetch just leaves the breakdowns out rather than blocking the
 * lesson, so this only tracks loading, not an error message.
 */
export function useN5KanjiPool() {
  const kanjiPool = ref<N5Kanji[]>([]);
  const kanjiLoading = ref(false);

  const fetchKanji = async (): Promise<void> => {
    kanjiLoading.value = true;
    try {
      const response = await $fetch<{
        success: boolean;
        data: N5Kanji[];
        timestamp: string;
      }>("/api/n5-kanji");
      if (response?.data) {
        kanjiPool.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching N5 kanji:", err);
    } finally {
      kanjiLoading.value = false;
    }
  };

  return { kanjiPool, kanjiLoading, fetchKanji };
}
