<template>
  <article data-testid="word-entry" class="space-y-10">
    <!-- The word -->
    <header class="space-y-4">
      <p class="kicker text-primary-600 dark:text-primary-400">
        {{ formatLongDate(entry.date) }}
      </p>
      <div class="flex flex-wrap items-end gap-x-6 gap-y-2">
        <h1
          data-testid="word-term"
          class="text-6xl sm:text-7xl font-serif font-bold text-stone-900 dark:text-white leading-none"
        >
          {{ entry.term }}
        </h1>
        <p
          data-testid="word-kana"
          class="text-2xl sm:text-3xl font-serif text-primary-600 dark:text-primary-400 pb-1"
        >
          {{ entry.kana }}
        </p>
      </div>
      <p
        data-testid="word-meaning"
        class="text-lg sm:text-xl text-stone-700 dark:text-stone-300 font-body-serif"
      >
        {{ entry.meaning }}
      </p>
      <div class="flex flex-wrap gap-2" data-testid="word-badges">
        <UBadge color="gray" variant="outline">JLPT {{ entry.level }}</UBadge>
        <UBadge :color="STRATUM_COLOR[entry.stratum]" variant="soft">
          {{ WORD_STRATA[entry.stratum].native }} ·
          {{ WORD_STRATA[entry.stratum].label }}
        </UBadge>
        <UBadge
          v-for="p in entry.processes"
          :key="p"
          color="secondary"
          variant="outline"
        >
          {{ WORD_PROCESSES[p].label }}
        </UBadge>
      </div>
      <div class="rule-double max-w-[120px]" />
      <p
        data-testid="word-headline"
        class="text-xl sm:text-2xl font-serif italic leading-snug text-stone-800 dark:text-stone-200 max-w-3xl"
      >
        {{ entry.headline }}
      </p>
    </header>

    <!-- Taken apart -->
    <section class="space-y-4" aria-labelledby="parts-heading">
      <h2
        id="parts-heading"
        class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
      >
        Taken apart
      </h2>
      <ol
        v-if="entry.morphemes.length"
        data-testid="word-morphemes"
        class="flex flex-wrap items-stretch gap-3"
      >
        <template v-for="(m, i) in entry.morphemes" :key="i">
          <li
            v-if="i > 0"
            aria-hidden="true"
            class="self-center text-2xl font-serif text-stone-400 dark:text-stone-600"
          >
            +
          </li>
          <li
            data-testid="word-morpheme"
            class="season-box min-w-[7rem] border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 text-center space-y-1"
          >
            <p
              class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
            >
              {{ m.text }}
            </p>
            <p
              class="text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              {{ m.reading }}
              <span
                v-if="m.base && m.base !== m.reading"
                class="text-stone-500 dark:text-stone-400"
                >(from {{ m.base }})</span
              >
            </p>
            <p class="text-xs text-stone-600 dark:text-stone-400">
              {{ m.meaning }}
            </p>
          </li>
        </template>
      </ol>
      <p
        v-else
        data-testid="word-no-breakdown"
        class="text-stone-600 dark:text-stone-400 font-body-serif"
      >
        No breakdown is shown for this word: its origin is unknown, and any
        split would be a guess.
      </p>
      <p
        v-if="entry.partsReading"
        data-testid="word-parts-reading"
        class="text-sm text-stone-600 dark:text-stone-400"
      >
        Read together, these parts spell
        <span class="font-serif font-bold">{{ entry.partsReading }}</span
        >, not <span class="font-serif font-bold">{{ entry.kana }}</span> — that
        gap is part of the story.
      </p>
    </section>

    <!-- Story -->
    <section class="space-y-4" aria-labelledby="story-heading">
      <h2
        id="story-heading"
        class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
      >
        Where it comes from
      </h2>
      <div
        class="space-y-4 text-base sm:text-lg leading-relaxed text-stone-700 dark:text-stone-300 font-body-serif max-w-3xl"
      >
        <p v-for="(para, i) in entry.story" :key="i">{{ para }}</p>
      </div>
      <div
        v-if="entry.uncertainty"
        data-testid="word-uncertainty"
        class="season-box max-w-3xl border border-warning-500/40 bg-warning-500/10 px-4 py-3 text-sm text-stone-700 dark:text-stone-300"
      >
        <p class="kicker text-warning-600 dark:text-warning-400">Not settled</p>
        <p class="mt-1">{{ entry.uncertainty }}</p>
      </div>
    </section>

    <!-- What the labels mean -->
    <section class="space-y-3" aria-labelledby="labels-heading">
      <h2
        id="labels-heading"
        class="text-sm font-sans font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
      >
        What the labels mean
      </h2>
      <dl
        class="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm text-stone-600 dark:text-stone-400"
      >
        <div>
          <dt class="font-semibold text-stone-800 dark:text-stone-200">
            {{ WORD_STRATA[entry.stratum].native }}
            {{ WORD_STRATA[entry.stratum].label }}
          </dt>
          <dd>{{ WORD_STRATA[entry.stratum].description }}</dd>
        </div>
        <div v-for="p in entry.processes" :key="p">
          <dt class="font-semibold text-stone-800 dark:text-stone-200">
            {{ WORD_PROCESSES[p].label }}
          </dt>
          <dd>{{ WORD_PROCESSES[p].description }}</dd>
        </div>
      </dl>
    </section>

    <!-- Evidence -->
    <section class="space-y-3" aria-labelledby="sources-heading">
      <h2
        id="sources-heading"
        class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
      >
        The evidence
      </h2>
      <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
        Every origin claim above is checked against these lines from Wiktionary,
        pinned to one revision so they can't change underneath us.
      </p>
      <ul data-testid="word-sources" class="space-y-2 max-w-3xl">
        <li
          v-for="(s, i) in entry.sources"
          :key="i"
          class="border-l-2 border-primary-500/50 pl-3 text-sm text-stone-700 dark:text-stone-300 font-body-serif"
        >
          “{{ s.quote }}”
        </li>
      </ul>
      <p class="text-xs text-stone-500 dark:text-stone-400">
        Source:
        <a
          :href="wiktionaryUrl"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >Wiktionary: {{ entry.term }} (revision {{ entry.wiktionaryRev }})</a
        >, available under
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >CC BY-SA 4.0</a
        >. Meaning from JMdict (EDRDG).
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatLongDate } from "../utils/date";
import { WORD_PROCESSES, WORD_STRATA } from "~~/shared/word-labels";
import type { WordEntry, WordStratum } from "~~/types/index";

const props = defineProps<{ entry: WordEntry }>();

const STRATUM_COLOR: Record<WordStratum, string> = {
  wago: "primary",
  kango: "secondary",
  gairaigo: "warning",
  hybrid: "gray",
};

const wiktionaryUrl = computed(
  () =>
    `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(
      props.entry.term,
    )}&oldid=${props.entry.wiktionaryRev}`,
);
</script>
