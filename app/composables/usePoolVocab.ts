import { ref } from "vue";
import type { JlptLevel, PoolVocab } from "~~/types/index";
import { DEFAULT_JLPT_LEVEL } from "~~/shared/jlpt";

/**
 * Shared fetch logic for GET /api/pool-vocab, used by the vocab guide pages
 * (app/pages/vocab/index.vue, app/pages/vocab/types/[key].vue) and the
 * lesson pages (app/pages/learn/[lesson].vue) so each doesn't duplicate the
 * same fetch/loading/error handling. Level defaults to N5, matching the API.
 */
export function usePoolVocab() {
  const vocabPool = ref<PoolVocab[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchVocab = async (
    level: JlptLevel = DEFAULT_JLPT_LEVEL,
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: PoolVocab[];
        timestamp: string;
      }>("/api/pool-vocab", { query: { level } });

      if (response?.data) {
        vocabPool.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching vocab pool:", err);
      error.value = "Failed to load the vocabulary pool. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  return { vocabPool, loading, error, fetchVocab };
}
