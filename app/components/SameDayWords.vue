<template>
  <section class="space-y-4" aria-labelledby="same-day-heading">
    <h2
      id="same-day-heading"
      class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
    >
      Also opened on {{ formatMonthDay(date) }}
    </h2>
    <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
      The words that opened on this day of the year in other years, oldest
      first. They share only the date: nothing else links them.
    </p>
    <ul data-testid="same-day-words" class="flex flex-wrap gap-2">
      <li
        v-for="w in words"
        :key="w.date"
        data-testid="same-day-word"
        class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50"
      >
        <NuxtLink
          :to="`/words/${w.date}`"
          :title="w.meaning"
          class="flex items-baseline gap-2 px-3 py-2 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <span class="kicker text-stone-600 dark:text-stone-400">{{
            w.date.slice(0, 4)
          }}</span>
          <span
            class="font-serif text-lg font-bold text-stone-900 dark:text-white"
            >{{ w.term }}</span
          >
          <span class="text-sm text-primary-600 dark:text-primary-400">{{
            w.kana
          }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { formatMonthDay } from "../utils/date";
import type { PartWordRef } from "~~/types/index";

defineProps<{
  /** The entry's own day, whose month and day the words share. */
  date: string;
  words: PartWordRef[];
}>();
</script>
