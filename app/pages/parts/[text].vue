<template>
  <AppShell>
    <main
      class="relative z-10 container mx-auto px-4 max-w-4xl py-12 sm:py-16 flex-1"
    >
      <NuxtLink
        to="/parts"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        All parts
      </NuxtLink>

      <TrendingFallback
        v-if="error"
        :error="error"
        :loading="loading"
        title="Unable to Load This Part"
        @retry="refresh()"
      />

      <article v-else-if="part" data-testid="part-detail" class="space-y-10">
        <header class="space-y-3">
          <p class="kicker text-primary-600 dark:text-primary-400">A part</p>
          <h1
            data-testid="part-text"
            class="text-6xl sm:text-7xl font-serif font-bold text-stone-900 dark:text-white leading-none"
          >
            {{ part.text }}
          </h1>
          <p class="text-stone-600 dark:text-stone-400 font-body-serif">
            Shown as a part of {{ part.count }}
            {{ part.count === 1 ? "word" : "words" }} so far, read
            {{
              part.readings.length === 1
                ? "one way"
                : `${part.readings.length} ways`
            }}.
          </p>
        </header>

        <section
          v-for="group in part.readings"
          :key="group.reading"
          data-testid="part-reading"
          class="space-y-3"
        >
          <h2
            class="text-2xl font-serif font-bold text-primary-600 dark:text-primary-400"
          >
            {{ group.reading }}
            <span
              class="text-sm font-sans font-normal text-stone-500 dark:text-stone-400"
              >{{ group.uses.length }}
              {{ group.uses.length === 1 ? "word" : "words" }}</span
            >
          </h2>
          <ul class="space-y-2">
            <li v-for="(use, n) in group.uses" :key="`${use.word.date}-${n}`">
              <div
                data-testid="part-use"
                class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3"
              >
                <NuxtLink
                  :to="`/words/${use.word.date}`"
                  class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span class="text-2xl font-serif font-bold">{{
                    use.word.term
                  }}</span>
                  <span class="text-primary-600 dark:text-primary-400">{{
                    use.word.kana
                  }}</span>
                  <span class="text-sm text-stone-600 dark:text-stone-400">{{
                    use.word.meaning
                  }}</span>
                </NuxtLink>
                <p
                  class="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-stone-500 dark:text-stone-400"
                >
                  <template v-for="(p, i) in use.parts" :key="i">
                    <span v-if="i > 0" aria-hidden="true">+</span>
                    <span v-if="p === part.text" class="font-bold">{{
                      p
                    }}</span>
                    <NuxtLink
                      v-else
                      :to="partPath(p)"
                      class="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted"
                      >{{ p }}</NuxtLink
                    >
                  </template>
                  <span>
                    · here “{{ use.meaning }}”
                    <template v-if="use.base && use.base !== use.reading">
                      (from {{ use.base }})</template
                    >
                    <template v-if="use.irregular">
                      — not one of its usual readings</template
                    ></span
                  >
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section
          v-if="part.alsoIn.length"
          class="space-y-3"
          aria-labelledby="also-heading"
        >
          <h2
            id="also-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Also written with {{ part.text }}
          </h2>
          <p class="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            These words contain the character in their spelling but show no
            breakdown that names it, so nothing is claimed about its role in
            them.
          </p>
          <ul data-testid="part-also" class="flex flex-wrap gap-2">
            <li v-for="w in part.alsoIn" :key="w.date">
              <NuxtLink
                :to="`/words/${w.date}`"
                class="season-chip inline-block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-1 hover:border-primary-500 transition-colors"
              >
                <span class="font-serif text-lg">{{ w.term }}</span>
                <span class="ml-2 text-xs text-stone-500 dark:text-stone-400">{{
                  w.kana
                }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </article>

      <div v-else class="space-y-4" aria-busy="true">
        <USkeleton class="h-6 w-48" />
        <USkeleton class="h-20 w-72" />
        <USkeleton class="h-64 w-full" />
      </div>
    </main>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "../../components/AppShell.vue";
import { computed } from "vue";
import { useRoute } from "#app";
import TrendingFallback from "../../components/TrendingFallback.vue";
import { usePageSeo } from "../../composables/usePageSeo";
import { usePart } from "../../composables/useParts";
import { partPath } from "../../utils/seo";

const route = useRoute();
// Linked parts stay on this same page component, so follow the route param.
const text = computed(() => String(route.params.text ?? ""));
const { part, loading, error, refresh } = usePart(text);

usePageSeo({
  title: () => `${text.value} — the words it's part of`,
  description: () =>
    part.value
      ? `${text.value} is a part of ${part.value.count} ${part.value.count === 1 ? "word" : "words"} NipponDaily has taken apart, read ${part.value.readings.map((r) => r.reading).join(", ")}.`
      : `The words NipponDaily has taken apart into ${text.value}.`,
  path: () => partPath(text.value),
  noindex: () => !part.value,
});
</script>
