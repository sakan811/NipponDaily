<template>
  <section class="space-y-4" aria-labelledby="related-heading">
    <h2
      id="related-heading"
      class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
    >
      More like this
    </h2>
    <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
      Other words so far that share a part, a process or a layer with this one,
      closest first. Each tag says what is shared; nothing here is a claim
      beyond what the entries already show.
    </p>
    <ul
      data-testid="related-words"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <li
        v-for="w in words"
        :key="w.date"
        data-testid="related-word"
        class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 space-y-2"
      >
        <p class="flex flex-wrap items-baseline gap-x-3">
          <NuxtLink
            :to="`/words/${w.date}`"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white hover:text-primary-500"
            >{{ w.term }}</NuxtLink
          >
          <span class="text-primary-600 dark:text-primary-400">{{
            w.kana
          }}</span>
        </p>
        <p class="text-sm text-stone-600 dark:text-stone-400">
          {{ w.meaning }}
        </p>
        <ul class="flex flex-wrap gap-1.5" aria-label="What it shares">
          <li v-for="part in w.shared.parts" :key="`part-${part}`">
            <NuxtLink
              :to="partPath(part)"
              class="kicker inline-block border border-primary-500/50 px-2 py-0.5 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10"
              >Part {{ part }}</NuxtLink
            >
          </li>
          <li v-for="p in w.shared.processes" :key="`process-${p}`">
            <NuxtLink
              :to="explorePath({ process: p })"
              class="kicker inline-block border border-stone-300 dark:border-stone-700 px-2 py-0.5 text-stone-600 dark:text-stone-400 hover:bg-stone-500/10"
              >{{ WORD_PROCESSES[p].label }}</NuxtLink
            >
          </li>
          <li v-if="w.shared.stratum">
            <NuxtLink
              :to="explorePath({ stratum: w.shared.stratum })"
              class="kicker inline-block border border-stone-300 dark:border-stone-700 px-2 py-0.5 text-stone-600 dark:text-stone-400 hover:bg-stone-500/10"
              >{{ WORD_STRATA[w.shared.stratum].native }}
              {{ WORD_STRATA[w.shared.stratum].label }}</NuxtLink
            >
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { explorePath, partPath } from "../utils/seo";
import { WORD_PROCESSES, WORD_STRATA } from "~~/shared/word-labels";
import type { RelatedWord } from "~~/types/index";

defineProps<{ words: RelatedWord[] }>();
</script>
