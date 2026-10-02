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
        <UBadge
          v-for="tag in entry.pos"
          :key="tag"
          data-testid="word-pos"
          color="gray"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
        <UBadge
          v-if="entry.stratum"
          :color="STRATUM_COLOR[entry.stratum]"
          variant="soft"
        >
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
          <li data-testid="word-morpheme" class="flex">
            <NuxtLink
              :to="partPath(m.text)"
              :aria-label="`${m.text}: every word taken apart with it`"
              class="season-box min-w-[7rem] border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 text-center space-y-1 hover:border-primary-500 transition-colors"
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
            </NuxtLink>
          </li>
        </template>
      </ol>
      <p
        v-if="entry.morphemes.length"
        class="text-xs text-stone-500 dark:text-stone-400"
      >
        Select a part to see every word so far that is taken apart with it.
      </p>
      <p
        v-if="fromKanjidic"
        data-testid="word-kanjidic-note"
        class="text-xs text-stone-500 dark:text-stone-400 max-w-3xl"
      >
        Wiktionary's text doesn't split this word, so each part is one of its
        kanji, with the reading and the dictionary meaning KANJIDIC2 gives that
        character — a word doesn't always use every sense of its kanji.
      </p>
      <p
        v-else-if="!entry.morphemes.length"
        data-testid="word-no-breakdown"
        class="text-stone-600 dark:text-stone-400 font-body-serif"
      >
        No breakdown is shown for this word: Wiktionary's text for it doesn't
        give a split that spells the word and joins to its reading, and any
        other split would be a guess.
      </p>
    </section>

    <!-- What Wiktionary says -->
    <section class="space-y-4" aria-labelledby="sources-heading">
      <h2
        id="sources-heading"
        class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
      >
        What Wiktionary says
      </h2>
      <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
        Quoted line by line from Wiktionary's Etymology section for this
        reading, pinned to one revision so it can't change underneath us.
        Nothing below is paraphrased.
      </p>
      <div
        v-if="hedged"
        data-testid="word-uncertainty"
        class="season-box max-w-3xl border border-warning-500/40 bg-warning-500/10 px-4 py-3 text-sm text-stone-700 dark:text-stone-300"
      >
        <p class="kicker text-warning-600 dark:text-warning-400">Not settled</p>
        <p class="mt-1">
          Wiktionary itself hedges on part of this word's origin — those lines
          are marked below.
        </p>
      </div>
      <ul data-testid="word-sources" class="space-y-3 max-w-3xl">
        <li
          v-for="(s, i) in entry.sources"
          :key="i"
          :class="[
            'border-l-2 pl-3 text-base leading-relaxed text-stone-700 dark:text-stone-300 font-body-serif',
            isHedged(s.quote)
              ? 'border-warning-500/70'
              : 'border-primary-500/50',
          ]"
        >
          <span
            v-if="isHedged(s.quote)"
            class="kicker mr-2 text-warning-600 dark:text-warning-400"
            >Hedged</span
          >“{{ s.quote }}”
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
        >. Reading, meaning and part of speech from JMdict, and kanji readings
        from KANJIDIC2 (EDRDG).
      </p>
    </section>

    <!-- What the labels mean -->
    <section
      v-if="entry.stratum || entry.processes.length"
      class="space-y-3"
      aria-labelledby="labels-heading"
    >
      <h2
        id="labels-heading"
        class="text-sm font-sans font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
      >
        What the labels mean
      </h2>
      <dl
        class="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm text-stone-600 dark:text-stone-400"
      >
        <div v-if="entry.stratum">
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
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatLongDate } from "../utils/date";
import { partPath } from "../utils/seo";
import { WORD_PROCESSES, WORD_STRATA, isHedged } from "~~/shared/word-labels";
import type { WordEntry, WordStratum } from "~~/types/index";

const props = defineProps<{ entry: WordEntry }>();

const STRATUM_COLOR: Record<WordStratum, string> = {
  wago: "primary",
  kango: "secondary",
  gairaigo: "warning",
  hybrid: "gray",
};

const fromKanjidic = computed(() =>
  props.entry.morphemes.some((m) => m.glossSource === "kanjidic2"),
);

const hedged = computed(() =>
  props.entry.sources.some((s) => isHedged(s.quote)),
);

const wiktionaryUrl = computed(
  () =>
    `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(
      props.entry.term,
    )}&oldid=${props.entry.wiktionaryRev}`,
);
</script>
