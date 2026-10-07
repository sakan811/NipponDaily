<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">The Kanji</p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          The characters the words are written with
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Every kanji an open word is spelled with, with what KANJIDIC2 says
          about it: its readings, its meanings, its school grade. Open one to
          see each word so far that uses it.
        </p>
      </div>

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Kanji"
        @retry="refresh()"
      />

      <template v-else-if="index">
        <section class="mt-10 space-y-4" aria-labelledby="recurring-heading">
          <h2
            id="recurring-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            In more than one word
          </h2>
          <ul
            v-if="recurring.length"
            data-testid="kanji-recurring"
            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
          >
            <li v-for="k in recurring" :key="k.char">
              <NuxtLink
                :to="kanjiPath(k.char)"
                data-testid="kanji-link"
                class="season-box block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-3 text-center hover:border-primary-500 transition-colors"
              >
                <span
                  class="block text-4xl font-serif font-bold text-stone-900 dark:text-white"
                  >{{ k.char }}</span
                >
                <span class="block text-xs text-stone-500 dark:text-stone-400"
                  >{{ k.count }} words</span
                >
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="text-stone-600 dark:text-stone-400 font-body-serif">
            No kanji has turned up twice yet. Check back as more words open.
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
            In one word so far
          </h2>
          <ul data-testid="kanji-once" class="flex flex-wrap gap-2">
            <li v-for="k in once" :key="k.char">
              <NuxtLink
                :to="kanjiPath(k.char)"
                data-testid="kanji-link"
                class="season-chip inline-block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-1 font-serif text-xl hover:border-primary-500 transition-colors"
                >{{ k.char }}</NuxtLink
              >
            </li>
          </ul>
        </section>

        <p class="mt-12 text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
          Readings, meanings, grades and frequency ranks are KANJIDIC2's own
          (<RichText :text="SOURCES.edrdg.credit" />). They describe the
          character, not each word it appears in.
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
import RichText from "../../components/RichText.vue";
import TrendingFallback from "../../components/TrendingFallback.vue";
import { usePageSeo } from "../../composables/usePageSeo";
import { useKanjiIndex } from "../../composables/useKanji";
import { kanjiPath } from "../../utils/seo";
import { SOURCES } from "~~/shared/sources";

const { index, loading, error, refresh } = useKanjiIndex();

const recurring = computed(
  () => index.value?.kanji.filter((k) => k.count > 1) ?? [],
);
const once = computed(
  () => index.value?.kanji.filter((k) => k.count === 1) ?? [],
);

usePageSeo({
  title: "The kanji the words are written with",
  description:
    "Every kanji NipponDaily's words are spelled with, with KANJIDIC2's readings, meanings and school grade, and each word it turns up in.",
  path: "/kanji",
});
</script>
