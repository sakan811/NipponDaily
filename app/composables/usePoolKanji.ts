import { ref } from "vue";
import type { JlptLevel, PoolKanji } from "~~/types/index";
import { DEFAULT_JLPT_LEVEL } from "~~/shared/jlpt";

/**
 * Fetches GET /api/pool-kanji for the lesson pages, which break every word
 * down into the kanji it's written with. Kanji are an enhancement there —
 * a failed fetch just leaves the breakdowns out rather than blocking the
 * lesson, so this only tracks loading, not an error message. Level defaults
 * to N5, matching the API.
 */
export function usePoolKanji() {
  const kanjiPool = ref<PoolKanji[]>([]);
  const kanjiLoading = ref(false);

  const fetchKanji = async (
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<void> => {
    kanjiLoading.value = true;
    try {
      const response = await $fetch<{
        success: boolean;
        data: PoolKanji[];
        timestamp: string;
      }>("/api/pool-kanji", { query: { level } });
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
