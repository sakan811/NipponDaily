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
        to="/kanji"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        All kanji
      </NuxtLink>

      <TrendingFallback
        v-if="error"
        :error="error"
        :loading="loading"
        title="Unable to Load This Kanji"
        @retry="refresh()"
      />

      <article v-else-if="kanji" data-testid="kanji-detail" class="space-y-10">
        <header class="space-y-3">
          <p class="kicker text-primary-600 dark:text-primary-400">A kanji</p>
          <h1
            data-testid="kanji-char"
            class="text-7xl sm:text-8xl font-serif font-bold text-stone-900 dark:text-white leading-none"
          >
            {{ kanji.char }}
          </h1>
          <p
            data-testid="kanji-meanings"
            class="text-lg text-stone-700 dark:text-stone-300 font-body-serif"
          >
            {{ kanji.meanings.join(", ") }}
          </p>
          <ul
            data-testid="kanji-facts"
            class="flex flex-wrap gap-2 text-sm text-stone-600 dark:text-stone-400"
          >
            <li
              class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1"
            >
              {{ kanji.strokeCount }}
              {{ kanji.strokeCount === 1 ? "stroke" : "strokes" }}
            </li>
            <li
              v-if="kanji.grade"
              class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1"
            >
              {{ kanjiGradeLabel(kanji.grade) }}
            </li>
            <li
              v-if="kanji.freq"
              class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1"
            >
              No. {{ kanji.freq }} of 2,500 in newspapers
            </li>
          </ul>
        </header>

        <section
          class="grid gap-8 sm:grid-cols-2"
          aria-labelledby="read-heading"
        >
          <div class="space-y-2">
            <h2
              id="read-heading"
              class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
            >
              On'yomi
            </h2>
            <p
              v-if="kanji.on.length"
              data-testid="kanji-on"
              class="text-xl font-serif text-primary-600 dark:text-primary-400"
            >
              {{ kanji.on.join("、") }}
            </p>
            <p v-else class="text-stone-500 dark:text-stone-400">
              None listed.
            </p>
          </div>
          <div class="space-y-2">
            <h2
              class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
            >
              Kun'yomi
            </h2>
            <p
              v-if="kanji.kun.length"
              data-testid="kanji-kun"
              class="text-xl font-serif text-primary-600 dark:text-primary-400"
            >
              {{ kanji.kun.join("、") }}
            </p>
            <p v-else class="text-stone-500 dark:text-stone-400">
              None listed.
            </p>
            <p
              v-if="kanji.kun.some((r) => r.includes('.'))"
              class="text-xs text-stone-500 dark:text-stone-400"
            >
              A dot marks where the okurigana begin.
            </p>
          </div>
        </section>

        <section
          v-if="kanji.strokes"
          class="space-y-3"
          aria-labelledby="strokes-heading"
        >
          <h2
            id="strokes-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Stroke order
          </h2>
          <KanjiStrokes :strokes="kanji.strokes" />
          <p class="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
            <RichText :text="SOURCES.kanjivg.credit" />
          </p>
        </section>

        <section class="space-y-3" aria-labelledby="words-heading">
          <h2
            id="words-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Written with {{ kanji.char }}
            <span
              class="text-sm font-sans font-normal text-stone-500 dark:text-stone-400"
              >{{ kanji.count }}
              {{ kanji.count === 1 ? "word" : "words" }}</span
            >
          </h2>
          <ul class="space-y-2">
            <li v-for="w in kanji.words" :key="w.date">
              <NuxtLink
                :to="`/words/${w.date}`"
                data-testid="kanji-word"
                class="season-box flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 hover:border-primary-500 transition-colors"
              >
                <span class="text-2xl font-serif font-bold">{{ w.term }}</span>
                <span class="text-primary-600 dark:text-primary-400">{{
                  w.kana
                }}</span>
                <span class="text-sm text-stone-600 dark:text-stone-400">{{
                  w.meaning
                }}</span>
              </NuxtLink>
            </li>
          </ul>
          <p
            v-if="kanji.isPart"
            data-testid="kanji-part-link"
            class="text-sm text-stone-600 dark:text-stone-400"
          >
            Some of these words show it as a part of their “Taken apart” row:
            see
            <NuxtLink
              :to="partPath(kanji.char)"
              class="underline hover:text-primary-600 dark:hover:text-primary-400"
              >the words taken apart with {{ kanji.char }}</NuxtLink
            >.
          </p>
        </section>

        <p class="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
          <RichText :text="SOURCES.edrdg.credit" /> A word does not always use
          every reading or meaning listed for its kanji.
        </p>
      </article>

      <div v-else class="space-y-4" aria-busy="true">
        <USkeleton class="h-6 w-48" />
        <USkeleton class="h-24 w-48" />
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
import KanjiStrokes from "../../components/KanjiStrokes.vue";
import RichText from "../../components/RichText.vue";
import TrendingFallback from "../../components/TrendingFallback.vue";
import { usePageSeo } from "../../composables/usePageSeo";
import { useKanji } from "../../composables/useKanji";
import { kanjiPath, partPath } from "../../utils/seo";
import { SOURCES } from "~~/shared/sources";
import { kanjiGradeLabel } from "~~/shared/word-labels";

const route = useRoute();
// Linked kanji stay on this same page component, so follow the route param.
const char = computed(() => String(route.params.char ?? ""));
const { kanji, loading, error, refresh } = useKanji(char);

usePageSeo({
  title: () =>
    kanji.value
      ? `${char.value}: ${kanji.value.meanings.slice(0, 3).join(", ")}`
      : `${char.value}: the words written with it`,
  description: () =>
    kanji.value
      ? `${char.value} (${[...kanji.value.on, ...kanji.value.kun].slice(0, 4).join(", ")}): ${kanji.value.meanings.slice(0, 4).join(", ")}. In ${kanji.value.count} ${kanji.value.count === 1 ? "word" : "words"} on NipponDaily.`
      : `The words NipponDaily has shown that are written with ${char.value}.`,
  path: () => kanjiPath(char.value),
  noindex: () => !kanji.value,
});
</script>
