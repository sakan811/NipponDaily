<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">The Parts</p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Words are built from the same pieces
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Every part that a word's “Taken apart” row has shown so far, gathered
          in one place. Open one to see each word it turns up in — and the
          different readings it takes from word to word.
        </p>
      </div>

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Parts"
        @retry="refresh()"
      />

      <template v-else-if="index">
        <section class="mt-10 space-y-4" aria-labelledby="recurring-heading">
          <h2
            id="recurring-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Seen in more than one word
          </h2>
          <ul
            v-if="recurring.length"
            data-testid="parts-recurring"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            <li v-for="part in recurring" :key="part.text">
              <NuxtLink
                :to="partPath(part.text)"
                data-testid="part-link"
                class="season-box block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 hover:border-primary-500 transition-colors"
              >
                <span class="flex items-baseline justify-between gap-2">
                  <span
                    class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
                    >{{ part.text }}</span
                  >
                  <span class="text-xs text-stone-500 dark:text-stone-400"
                    >{{ part.count }} words</span
                  >
                </span>
                <span
                  class="mt-1 block text-sm text-primary-600 dark:text-primary-400"
                  >{{ part.readings.join(" · ") }}</span
                >
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="text-stone-600 dark:text-stone-400 font-body-serif">
            No part has turned up twice yet — check back as more words open.
          </p>
        </section>

        <section
          v-if="once.length"
          class="mt-12 space-y-4"
          aria-labelledby="once-heading"
        >
          <h2
            id="once-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Seen once so far
          </h2>
          <ul data-testid="parts-once" class="flex flex-wrap gap-2">
            <li v-for="part in once" :key="part.text">
              <NuxtLink
                :to="partPath(part.text)"
                data-testid="part-link"
                class="season-chip inline-block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-1 font-serif text-lg hover:border-primary-500 transition-colors"
                >{{ part.text }}</NuxtLink
              >
            </li>
          </ul>
        </section>

        <p class="mt-12 text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
          Only words whose Wiktionary text gives a split that spells the word
          and joins to its reading are broken into parts, so some words are
          missing here by design.
        </p>
      </template>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-8 w-64" />
        <USkeleton class="h-48 w-full" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import TrendingFallback from "../../components/TrendingFallback.vue";
import { usePageSeo } from "../../composables/usePageSeo";
import { usePartsIndex } from "../../composables/useParts";
import { partPath } from "../../utils/seo";

const { index, loading, error, refresh } = usePartsIndex();

const recurring = computed(
  () => index.value?.parts.filter((p) => p.count > 1) ?? [],
);
const once = computed(
  () => index.value?.parts.filter((p) => p.count === 1) ?? [],
);

usePageSeo({
  title: "The parts words are built from",
  description:
    "Every part NipponDaily's words have been taken apart into — and each word it turns up in, with the reading it takes there.",
  path: "/parts",
});
</script>
