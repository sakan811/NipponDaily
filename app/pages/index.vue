<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-[#1F2022] dark:text-[#E2E4E9] selection:bg-primary-500/20"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <!-- Header -->
    <AppHeader />

    <!-- Hero Section -->
    <main class="relative z-10 container mx-auto px-4 max-w-6xl py-16 sm:py-24">
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <p class="kicker text-primary-600 dark:text-primary-400">
          Learn Japanese Through Real Japan News
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Read the news.<br class="hidden sm:inline" >
          <span class="text-primary-500 italic font-normal"
            >Learn the language.</span
          >
        </h1>

        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-body-serif"
        >
          NipponDaily turns each week's Japanese-language news into
          self-contained lessons — one article at a time. Every lesson pairs a
          real passage with furigana and rōmaji, an English translation, a
          JLPT-tagged vocabulary list, and grammar notes. No accounts, no
          clutter: just this week's Japan, in Japanese you can actually work
          through.
        </p>

        <div class="flex flex-wrap gap-4 justify-center pt-4">
          <UButton
            data-testid="hero-cta"
            label="Start Reading"
            to="/news"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
            class="px-6 py-3 font-medium tracking-wide"
          />
        </div>
      </div>

      <div class="rule-double my-16 sm:my-24" />

      <!-- What's inside every lesson -->
      <section class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Inside Every Lesson
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            One Japanese-language article, turned into everything you need to
            read and understand it.
          </p>
        </div>

        <p class="kicker text-stone-400 dark:text-stone-500">
          What You Get Per Article
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-2 border-t border-stone-300 dark:border-stone-800"
        >
          <div
            v-for="(part, idx) in lessonParts"
            :key="idx"
            class="group flex items-start gap-4 py-5 px-1 border-b border-stone-300 dark:border-stone-800 md:odd:border-r md:odd:pr-6 md:even:pl-6"
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

      <!-- How lessons get here -->
      <section class="space-y-6 max-w-2xl mx-auto text-center">
        <h2
          class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
        >
          Where Lessons Come From
        </h2>
        <div class="rule-double max-w-[120px] mx-auto" />
        <p
          class="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Once a week, a Claude web agent — running entirely outside this site —
          researches Japanese-language Japan news, authors a lesson from each
          article's own text, scores the publisher's credibility, and writes the
          finished records straight into the database through a private MCP
          server. The site itself only ever reads and displays them; lessons
          rotate on a rolling 30-day window.
        </p>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <UButton
            label="How it works"
            to="/docs/architecture"
            color="primary"
            variant="outline"
            size="md"
            icon="i-heroicons-building-office-2"
          />
          <UButton
            label="All features"
            to="/docs/features"
            color="gray"
            variant="ghost"
            size="md"
          />
          <UButton
            label="Error &amp; fallback states"
            to="/docs/error-states"
            color="gray"
            variant="ghost"
            size="md"
          />
        </div>
      </section>
    </main>

    <!-- Footer -->
    <UFooter
      class="border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#0B0E14]"
    >
      <template #left>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. All rights
          reserved. Released under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";

const lessonParts = ref([
  {
    title: "Furigana Passage",
    description:
      "A representative passage pulled from the article's Japanese text, with inline ruby readings over every kanji.",
  },
  {
    title: "Hepburn Rōmaji",
    description:
      "The same passage transliterated in Hepburn rōmaji, so you can check your reading against it line by line.",
  },
  {
    title: "English Translation",
    description:
      "A faithful English rendering of the passage to confirm you have the meaning right.",
  },
  {
    title: "Vocabulary List",
    description:
      "8–15 notable terms with readings, rōmaji, meanings, part of speech, JLPT level, and an example sentence each.",
  },
  {
    title: "Grammar Notes",
    description:
      "1–3 grammar patterns worth flagging from the passage, each with a plain explanation and a worked example.",
  },
  {
    title: "Trust Score & JLPT Level",
    description:
      "A per-publisher credibility score shown as a colour gradient, plus an overall difficulty badge — filter the feed by level (N5–N1).",
  },
]);
</script>
