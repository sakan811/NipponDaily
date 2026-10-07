<template>
  <article data-testid="word-entry" class="space-y-10">
    <!-- The word -->
    <header class="space-y-4">
      <p class="kicker text-primary-600 dark:text-primary-400">
        First opened {{ formatLongDate(entry.date) }}
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
          v-if="common"
          data-testid="word-common"
          color="gray"
          variant="outline"
          :title="FREQUENCY_GROUPS.common.description"
        >
          {{ FREQUENCY_GROUPS.common.label }}
        </UBadge>
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
        kanji (with the okurigana written after it), with the reading and the
        dictionary meaning KANJIDIC2 gives that character — a word doesn't
        always use every sense of its kanji.
      </p>
      <p
        v-else-if="!entry.morphemes.length"
        data-testid="word-no-breakdown"
        class="text-stone-600 dark:text-stone-400 font-body-serif"
      >
        No breakdown is shown for this word:
        <template v-if="hedgedSplit">
          the only split Wiktionary offers is hedged (see the marked line
          below), and it doesn't spell the word — it describes where the sound
          may come from — so showing it as the word's parts would be a guess.
        </template>
        <template v-else>
          Wiktionary's text for it doesn't give a split that spells the word and
          joins to its reading, and any other split would be a guess.
        </template>
      </p>
      <p
        v-if="kanjiChars.length"
        data-testid="word-kanji"
        class="flex flex-wrap items-center gap-2 text-sm text-stone-600 dark:text-stone-400"
      >
        Written with
        <NuxtLink
          v-for="c in kanjiChars"
          :key="c"
          :to="kanjiPath(c)"
          :aria-label="`${c}: its readings, meanings and every word written with it`"
          class="season-chip inline-block border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-2.5 py-0.5 font-serif text-lg text-stone-900 dark:text-white hover:border-primary-500 transition-colors"
          >{{ c }}</NuxtLink
        >
      </p>
    </section>

    <!-- In a sentence -->
    <section
      v-if="entry.examples?.length"
      class="space-y-4"
      aria-labelledby="examples-heading"
    >
      <h2
        id="examples-heading"
        class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
      >
        In a sentence
      </h2>
      <ul data-testid="word-examples" class="space-y-4 max-w-3xl">
        <li
          v-for="ex in entry.examples"
          :key="ex.id"
          data-testid="word-example"
          class="border-l-2 border-primary-500/50 pl-3 space-y-1"
        >
          <p
            class="text-xl font-serif text-stone-900 dark:text-white [&_rt]:text-[0.5em] [&_rt]:text-stone-500 dark:[&_rt]:text-stone-400"
            :class="ex.furigana ? 'leading-loose' : ''"
            lang="ja"
          >
            <template
              v-for="(piece, i) in sentencePieces(ex.ja, ex.form, ex.furigana)"
              :key="i"
              ><component
                :is="piece.hit ? 'mark' : 'span'"
                :class="
                  piece.hit ? 'bg-primary-500/15 text-inherit px-0.5' : ''
                "
                ><ruby v-if="piece.reading"
                  >{{ piece.text }}<rp>(</rp><rt>{{ piece.reading }}</rt
                  ><rp>)</rp></ruby
                ><template v-else>{{ piece.text }}</template></component
              ></template
            >
          </p>
          <p
            class="text-base text-stone-700 dark:text-stone-300 font-body-serif"
          >
            {{ ex.en }}
          </p>
          <p class="text-xs text-stone-500 dark:text-stone-400">
            <a
              :href="tatoebaSentenceUrl(ex.id)"
              target="_blank"
              rel="noopener"
              class="underline hover:text-primary-500"
              >Tatoeba #{{ ex.id }}</a
            >,
            <a
              :href="tatoebaSentenceUrl(ex.enId)"
              target="_blank"
              rel="noopener"
              class="underline hover:text-primary-500"
              >translation #{{ ex.enId }}</a
            >
          </p>
        </li>
      </ul>
      <p class="text-xs text-stone-500 dark:text-stone-400 max-w-3xl">
        Sentences are from
        <a
          :href="SOURCES.tatoeba.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >{{ SOURCES.tatoeba.name }}</a
        >
        (<a
          :href="SOURCES.tatoeba.licence.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >{{ SOURCES.tatoeba.licence.name }}</a
        >), picked by fixed rules from a dated export and shown unchanged.
        Nobody has reviewed them one by one.
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
        reading, taken from one dated dump so it can't change underneath us.
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
          >Wiktionary: {{ entry.term }} (dump of {{ entry.wiktionaryDump }})</a
        >, available under
        <a
          :href="SOURCES.wiktionary.licence.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >{{ SOURCES.wiktionary.licence.name }}</a
        >. Reading, meaning and part of speech from JMdict, and kanji readings
        from KANJIDIC2 ({{ SOURCES.edrdg.holderShort }}).
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
import { kanjiPath, partPath } from "../utils/seo";
import { sentencePieces } from "../utils/sentence";
import {
  FREQUENCY_GROUPS,
  WORD_PROCESSES,
  WORD_STRATA,
  frequencyOf,
  isHedged,
} from "~~/shared/word-labels";
import {
  SOURCES,
  tatoebaSentenceUrl,
  wiktionaryPageUrl,
} from "~~/shared/sources";
import type { WordEntry, WordStratum } from "~~/types/index";

const props = defineProps<{ entry: WordEntry }>();

const STRATUM_COLOR: Record<WordStratum, string> = {
  wago: "primary",
  kango: "secondary",
  gairaigo: "warning",
  hybrid: "gray",
};

/** The distinct kanji of the term (the same range the kanji pages cover). */
const kanjiChars = computed(() => [
  ...new Set(props.entry.term.match(/[㐀-䶿一-鿿]/gu) ?? []),
]);

const common = computed(() => frequencyOf(props.entry.priority) === "common");

const fromKanjidic = computed(() =>
  props.entry.morphemes.some((m) => m.glossSource === "kanjidic2"),
);

const hedged = computed(() =>
  props.entry.sources.some((s) => isHedged(s.quote)),
);

// A hedged line that proposes a `A + B` split. With no morphemes, that split
// failed the "spells the word" test, so the empty state can say why.
const hedgedSplit = computed(() =>
  props.entry.sources.some((s) => isHedged(s.quote) && s.quote.includes(" + ")),
);

const wiktionaryUrl = computed(() => wiktionaryPageUrl(props.entry.term));
</script>
