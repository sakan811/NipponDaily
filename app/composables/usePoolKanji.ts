import { ref } from "vue";
import type { PoolKanji } from "~~/types/index";

/**
 * Fetches GET /api/pool-kanji for the lesson pages, which break every word
 * down into the kanji it's written with. Kanji are an enhancement there —
 * a failed fetch just leaves the breakdowns out rather than blocking the
 * lesson, so this only tracks loading, not an error message.
 */
export function usePoolKanji() {
  const kanjiPool = ref<PoolKanji[]>([]);
  const kanjiLoading = ref(false);

  const fetchKanji = async (): Promise<void> => {
    kanjiLoading.value = true;
    try {
      const response = await $fetch<{
        success: boolean;
        data: PoolKanji[];
        timestamp: string;
      }>("/api/pool-kanji");
      if (response?.data) {
        kanjiPool.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching kanji pool:", err);
    } finally {
      kanjiLoading.value = false;
    }
  };

  return { kanjiPool, kanjiLoading, fetchKanji };
}
