<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-[#1F2022] dark:text-[#E2E4E9] selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader />

    <main
      class="relative z-10 container mx-auto px-4 max-w-6xl py-16 sm:py-24 flex-1"
    >
      <!-- Hero -->
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <p class="kicker text-primary-600 dark:text-primary-400">
          One Word, Taken Apart, Every Day
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Every word has<br class="hidden sm:inline" />
          <span class="text-primary-500 italic font-normal">a story.</span>
        </h1>

        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-body-serif"
        >
          Each day NipponDaily opens one Japanese word and takes it apart: its
          morphemes, the layer of the language it belongs to, the sound changes
          and borrowings that made it, and the evidence behind every claim. Miss
          a day and nothing is lost — the calendar keeps them all.
        </p>
      </div>

      <!-- Today's word -->
      <section class="mt-14 max-w-3xl mx-auto" aria-labelledby="today-heading">
        <h2 id="today-heading" class="sr-only">Today's word</h2>

        <TrendingFallback
          v-if="error"
          :error="error"
          :loading="loading"
          title="Unable to Load Today's Word"
          @retry="refresh()"
        />

        <NuxtLink
          v-else-if="payload"
          :to="`/words/${payload.entry.date}`"
          data-testid="today-word"
          class="group season-box block border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/60 p-6 sm:p-8 hover:border-primary-500 transition-colors"
        >
          <p class="kicker text-primary-600 dark:text-primary-400">
            {{ formatLongDate(payload.entry.date) }}
          </p>
          <div class="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
            <span
              data-testid="today-term"
              class="text-5xl sm:text-6xl font-serif font-bold text-stone-900 dark:text-white group-hover:text-primary-500 transition-colors leading-none"
              >{{ payload.entry.term }}</span
            >
            <span
              class="text-xl sm:text-2xl font-serif text-primary-600 dark:text-primary-400 pb-0.5"
              >{{ payload.entry.kana }}</span
            >
          </div>
          <p class="mt-2 text-stone-600 dark:text-stone-400 font-body-serif">
            {{ payload.entry.meaning }}
          </p>
          <p
            class="mt-4 text-lg sm:text-xl font-serif italic leading-snug text-stone-800 dark:text-stone-200"
          >
            {{ payload.entry.headline }}
          </p>
          <p
            class="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400"
          >
            Read how it's built
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </p>
        </NuxtLink>

        <div v-else class="space-y-3" aria-busy="true">
          <USkeleton class="h-4 w-40" />
          <USkeleton class="h-16 w-64" />
          <USkeleton class="h-6 w-full" />
        </div>

        <div class="flex flex-wrap gap-4 justify-center pt-8">
          <UButton
            data-testid="hero-calendar-cta"
            label="Browse the Calendar"
            to="/words"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
            class="px-6 py-3 font-medium tracking-wide"
          />
          <UButton
            data-testid="hero-kana-cta"
            label="Learn the Kana"
            to="/kana"
            color="gray"
            variant="outline"
            size="lg"
            class="px-6 py-3 font-medium tracking-wide"
          />
        </div>
      </section>

      <div class="rule-double my-16 sm:my-24" />

      <!-- What's in every entry -->
      <section class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Inside Every Entry
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            A word a day, read slowly — about as long as a cup of tea.
          </p>
        </div>

        <!-- Season-shaped tiles (petal / pebble / cut-leaf / ice) — see
             .season-box in tailwind.css. -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(part, idx) in entryParts"
            :key="idx"
            class="group season-box flex items-start gap-4 p-5 border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 hover:border-primary-500/40 transition-colors duration-200"
          >
            <span
              class="font-serif text-2xl text-stone-300 dark:text-stone-700 group-hover:text-primary-500 transition-colors duration-200 leading-none pt-0.5"
              >{{ String(idx + 1).padStart(2, "0") }}</span
            >
            <div class="space-y-1">
              <h3
                class="text-lg font-serif font-bold text-stone-900 dark:text-white group-hover:text-primary-500 transition-colors duration-200"
              >
                {{ part.title }}
              </h3>
              <p
                class="text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-sans"
              >
                {{ part.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="rule-double my-16 sm:my-24" />

      <!-- Honesty about evidence -->
      <section class="space-y-6 max-w-2xl mx-auto text-center">
        <h2
          class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
        >
          Where the Claims Come From
        </h2>
        <div class="rule-double max-w-[120px] mx-auto" />
        <p
          class="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Etymology is full of tidy stories that turn out to be wrong, so
          nothing about a word's origin here is written by a person or a model:
          it is quoted from a pinned revision of Wiktionary, and the build fails
          if a quote isn't really in it. Readings, meanings and parts of speech
          come from JMdict, and kanji readings from KANJIDIC2. When the sources
          disagree — or nobody knows — the entry says so instead of picking a
          winner. The words are chosen from the JLPT N5–N2 vocabulary. The
          site's colors and shapes follow the seasons — spring, summer, autumn
          and winter — and the season button in the header lets you pick your
          own. Nothing about you is sent or saved on a server.
        </p>
      </section>

      <div class="rule-double my-16 sm:my-24" />

      <!-- Documentation -->
      <section id="docs" class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <p class="kicker text-stone-400 dark:text-stone-500">Documentation</p>
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            How NipponDaily Works
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Everything behind the front page — the system architecture, the
            color system, the reader-facing features, the data sources and CI
            checks that keep every entry true, and a live catalogue of every
            error and fallback state the site can render.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NuxtLink
            v-for="page in docsPages"
            :key="page.to"
            :to="page.to"
            class="no-underline"
          >
            <UPageCard
              :title="page.title"
              :description="page.description"
              :icon="page.icon"
              class="h-full"
            />
          </NuxtLink>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";
import TrendingFallback from "../components/TrendingFallback.vue";
import { useDailyWord } from "../composables/useDailyWord";
import { usePageSeo } from "../composables/usePageSeo";
import { wordTitle } from "../utils/seo";
import { formatLongDate } from "../utils/date";

const { payload, loading, error, refresh } = useDailyWord();

usePageSeo({
  title: "One Japanese word a day, taken apart",
  description: () =>
    payload.value
      ? `Today: ${wordTitle(payload.value.entry)}. Each day NipponDaily takes one Japanese word apart — its parts, its layer of the vocabulary, how it came to be — with the Wiktionary lines behind every claim.`
      : "Each day NipponDaily takes one Japanese word apart — its parts, its layer of the vocabulary, how it came to be — with the Wiktionary lines behind every claim.",
  path: "/",
});

const entryParts = [
  {
    title: "Taken Apart",
    description:
      "The word split into its parts, each with its reading and the meaning Wiktionary gives it — shown only when the source's own split spells the word and joins to its reading. If it doesn't, no split is shown.",
  },
  {
    title: "Which Layer",
    description:
      "Native 和語, Sino-Japanese 漢語, loanword 外来語 or a hybrid: the layer of the vocabulary a word belongs to, read from its kanji's KANJIDIC2 readings, alongside the part of speech from JMdict.",
  },
  {
    title: "The Process",
    description:
      "Compounding, rendaku, clipping, ateji, borrowing, sound change: each entry names the processes its Wiktionary text mentions and defines them.",
  },
  {
    title: "The Story",
    description:
      "Where the word comes from, in Wiktionary's own words: its Etymology lines for this reading, quoted verbatim and never paraphrased.",
  },
  {
    title: "What's Not Settled",
    description:
      "Wherever Wiktionary hedges (“probably”, “unknown”, “alternatively”), the line is quoted as it stands and flagged “Not settled”, never turned into a confident guess.",
  },
  {
    title: "The Evidence",
    description:
      "The exact Wiktionary lines behind each claim, pinned to a revision with a permalink and its CC BY-SA license.",
  },
];

const docsPages = [
  {
    to: "/docs/architecture",
    title: "System Architecture",
    description:
      "A guided tour of the stack — the Nuxt 4 frontend, the in-repo catalogue of daily words served by date, and the daily cron that keeps the site's season in step with the calendar.",
    icon: "i-heroicons-building-office-2",
  },
  {
    to: "/docs/color-palette",
    title: "Color Palette & System",
    description:
      "Every color in NipponDaily's four seasonal palettes, named and shown as badges for light and dark mode, plus the shape language each season applies to cards, buttons, and badges.",
    icon: "i-heroicons-swatch",
  },
  {
    to: "/docs/features",
    title: "Core Features",
    description:
      "The reader-facing capabilities: a new word every day at midnight in Japan, a calendar to look back through every past word, morpheme breakdowns, origin notes with their evidence, and zero tracking.",
    icon: "i-heroicons-star",
  },
  {
    to: "/docs/error-states",
    title: "Error & Fallback States",
    description:
      "A live catalogue of every degraded, empty, or failure state the UI can render — shown with the real components and mock data so their look can be reviewed without triggering an outage.",
    icon: "i-heroicons-exclamation-triangle",
  },
  {
    to: "/docs/data-integrity",
    title: "Data Integrity & Attribution",
    description:
      "How every origin claim is checked against pinned Wiktionary text and every reading against JMdict and KANJIDIC2 before a change can merge, plus the licenses and attribution for each source.",
    icon: "i-heroicons-shield-check",
  },
];
</script>
