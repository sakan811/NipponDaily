<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">Explore</p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Find words by how they're built
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Search every word that has opened, then narrow by JLPT level, layer of
          the vocabulary, the process that shaped it or part of speech. Pick as
          many options as you like in each group. Each option shows how many
          words it would leave.
        </p>
      </div>

      <WordFilters
        v-model="filters"
        class="mt-10"
        :facets="result?.facets"
        @update:model-value="apply"
      />

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Words"
        @retry="refresh()"
      />

      <section v-else-if="result" class="mt-10 space-y-4" aria-live="polite">
        <p
          data-testid="explore-count"
          class="text-sm text-stone-500 dark:text-stone-400"
        >
          {{ result.count }} of {{ result.total }}
          {{ result.total === 1 ? "word" : "words" }}
        </p>

        <ul
          v-if="result.words.length"
          data-testid="explore-results"
          class="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <li v-for="w in result.words" :key="w.date">
            <NuxtLink
              :to="`/words/${w.date}`"
              data-testid="explore-word"
              class="season-box block h-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 hover:border-primary-500 transition-colors"
            >
              <span class="flex items-baseline justify-between gap-3">
                <span
                  class="text-2xl font-serif font-bold text-stone-900 dark:text-white break-all"
                  >{{ w.term }}</span
                >
                <span
                  class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 shrink-0"
                >
                  <span
                    v-if="w.stratum"
                    :class="[
                      'inline-block h-2 w-2 rounded-full',
                      STRATUM_DOT[w.stratum],
                    ]"
                    :title="WORD_STRATA[w.stratum].label"
                  />
                  {{ w.level }}
                </span>
              </span>
              <span
                class="block text-sm text-primary-600 dark:text-primary-400"
                >{{ w.kana }}</span
              >
              <span
                class="mt-1 block text-sm text-stone-600 dark:text-stone-400 font-body-serif"
                >{{ w.meaning }}</span
              >
              <span
                class="mt-1 block text-xs text-stone-400 dark:text-stone-500"
                >{{ formatLongDate(w.date) }}</span
              >
            </NuxtLink>
          </li>
        </ul>
        <p
          v-else
          data-testid="explore-empty"
          class="text-stone-600 dark:text-stone-400 font-body-serif"
        >
          No word that has opened matches all of those. Remove a filter to widen
          the search.
        </p>

        <p class="pt-6 text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
          Only words that have opened are searched. A layer is shown only when
          KANJIDIC2 or the cited text establishes it; the words with none are
          under “Not stated”. Parts of speech are groups of JMdict's tags (see
          each option's tooltip), and a word can sit in more than one.
        </p>
      </section>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-48 w-full" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "#app";
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";
import TrendingFallback from "../components/TrendingFallback.vue";
import WordFilters from "../components/WordFilters.vue";
import { useExplore } from "../composables/useExplore";
import { usePageSeo } from "../composables/usePageSeo";
import { formatLongDate } from "../utils/date";
import { STRATUM_DOT } from "../utils/stratum";
import { filtersFromQuery, queryFromFilters } from "~~/shared/explore-query";
import { WORD_STRATA } from "~~/shared/word-labels";
import type { ExploreFilters } from "~~/types/index";

const route = useRoute();
const router = useRouter();

const filters = ref<ExploreFilters>(filtersFromQuery(route.query));

const { result, loading, error, refresh } = useExplore(() => filters.value);

usePageSeo({
  title: "Explore the words",
  description:
    "Search every word NipponDaily has taken apart and filter by JLPT level, layer of the vocabulary, the process that shaped it and part of speech.",
  path: "/explore",
});

/** Keeps the filters in the URL, so a search can be shared. */
const apply = async (next: ExploreFilters): Promise<void> => {
  await router.replace({ query: queryFromFilters(next) });
};
</script>
