<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main
      class="relative z-10 container mx-auto px-4 max-w-4xl py-12 sm:py-16 flex-1"
    >
      <NuxtLink
        to="/words"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-500 mb-8"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        All words
      </NuxtLink>

      <TrendingFallback
        v-if="error"
        :error="error"
        :loading="loading"
        title="Unable to Load This Word"
        @retry="refresh()"
      />

      <template v-else-if="payload">
        <WordEntryView :entry="payload.entry" />

        <RelatedWords
          v-if="related?.words?.length"
          class="mt-10"
          :words="related.words"
        />

        <!-- Previous / next open day -->
        <nav
          class="mt-14 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4"
          aria-label="Neighbouring words"
        >
          <UButton
            v-if="payload.prev"
            data-testid="word-prev"
            :to="`/words/${payload.prev.date}`"
            :label="`${payload.prev.term}`"
            icon="i-heroicons-arrow-left"
            color="secondary"
            variant="outline"
          />
          <span v-else />
          <UButton
            v-if="payload.next"
            data-testid="word-next"
            :to="`/words/${payload.next.date}`"
            :label="`${payload.next.term}`"
            icon="i-heroicons-arrow-right"
            trailing
            color="secondary"
            variant="outline"
          />
          <span v-else />
        </nav>
      </template>

      <div v-else class="space-y-4" aria-busy="true">
        <USkeleton class="h-6 w-48" />
        <USkeleton class="h-20 w-72" />
        <USkeleton class="h-64 w-full" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#app";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import TrendingFallback from "../../components/TrendingFallback.vue";
import RelatedWords from "../../components/RelatedWords.vue";
import WordEntryView from "../../components/WordEntryView.vue";
import { useDailyWord } from "../../composables/useDailyWord";
import { useRelatedWords } from "../../composables/useParts";
import { usePageSeo } from "../../composables/usePageSeo";
import { shareImagePath, wordDescription, wordTitle } from "../../utils/seo";

const route = useRoute();
// Prev/next links stay on this same page component, so the date follows the
// route param and the fetch re-runs when it changes.
const date = computed(() => String(route.params.date ?? ""));
const { payload, loading, error, refresh } = useDailyWord(date);
const { related } = useRelatedWords(date);

usePageSeo({
  title: () => (payload.value ? wordTitle(payload.value.entry) : "A word"),
  description: () =>
    payload.value
      ? wordDescription(payload.value.entry)
      : "One Japanese word, taken apart: its parts, its layer and the evidence for where it comes from.",
  path: () => `/words/${date.value}`,
  type: "article",
  // A word opens at midnight in Japan.
  publishedTime: () => `${date.value}T00:00:00+09:00`,
  noindex: () => !payload.value,
  image: () => (payload.value ? shareImagePath(date.value) : undefined),
  imageAlt: () => (payload.value ? wordTitle(payload.value.entry) : undefined),
});
</script>
