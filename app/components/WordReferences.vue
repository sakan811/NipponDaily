<template>
  <section class="space-y-4" aria-labelledby="references-heading">
    <h2
      id="references-heading"
      class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
    >
      Related in the dictionary
    </h2>
    <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
      The words JMdict points to from this word's sense. A word that has opened
      links to its day; the others are named as JMdict writes them.
    </p>
    <dl data-testid="word-references" class="space-y-3">
      <div v-for="group in groups" :key="group.label" class="space-y-1.5">
        <dt class="kicker text-stone-600 dark:text-stone-400">
          {{ group.label }}
        </dt>
        <dd>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="ref in group.refs"
              :key="`${ref.term}-${ref.kana ?? ''}`"
              data-testid="word-reference"
              class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-2"
            >
              <NuxtLink
                v-if="ref.word"
                :to="`/words/${ref.word.date}`"
                class="font-serif text-lg font-bold text-stone-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                >{{ ref.word.term }}</NuxtLink
              >
              <span
                v-else
                class="font-serif text-lg font-bold text-stone-900 dark:text-white"
                >{{ ref.term }}</span
              >
              <span
                v-if="ref.kana || ref.word"
                class="ml-2 text-primary-600 dark:text-primary-400"
                >{{ ref.word?.kana ?? ref.kana }}</span
              >
              <span
                v-if="ref.word"
                class="ml-2 text-sm text-stone-600 dark:text-stone-400"
                >{{ ref.word.meaning }}</span
              >
            </li>
          </ul>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResolvedReference } from "~~/types/index";

const props = defineProps<{
  antonyms: ResolvedReference[];
  seeAlso: ResolvedReference[];
}>();

const groups = computed(() =>
  [
    { label: "Opposite", refs: props.antonyms },
    { label: "See also", refs: props.seeAlso },
  ].filter((g) => g.refs.length),
);
</script>
