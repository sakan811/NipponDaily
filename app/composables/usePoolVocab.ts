import { ref } from "vue";
import type { PoolVocab } from "~~/types/index";

/**
 * Shared fetch logic for GET /api/pool-vocab, used by the N5 Vocabulary page,
 * its word-type sub-pages (app/pages/vocab/types/[key].vue) and the lesson
 * pages (app/pages/learn/[lesson].vue) so each doesn't duplicate the same
 * fetch/loading/error handling.
 */
export function usePoolVocab() {
  const vocabPool = ref<PoolVocab[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchVocab = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: PoolVocab[];
        timestamp: string;
      }>("/api/pool-vocab");

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
