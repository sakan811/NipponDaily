import { ref } from "vue";
import type { N5Vocab } from "~~/types/index";

/**
 * Shared fetch logic for GET /api/n5-vocab, used by the N5 Vocabulary page
 * and its per-topic sub-pages (app/pages/vocab/families/[key].vue,
 * app/pages/vocab/types/[key].vue) so each doesn't duplicate the same
 * fetch/loading/error handling.
 */
export function useN5VocabPool() {
  const vocabPool = ref<N5Vocab[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchVocab = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: N5Vocab[];
        timestamp: string;
      }>("/api/n5-vocab");

      if (response?.data) {
        vocabPool.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching N5 vocab:", err);
      error.value = "Failed to load the vocabulary pool. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  return { vocabPool, loading, error, fetchVocab };
}
