<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-4xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <NuxtLink
          to="/docs"
          class="kicker text-stone-400 dark:text-stone-500 no-underline hover:text-primary-500 transition-colors"
        >
          &larr; Documentation
        </NuxtLink>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Core Features
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          NipponDaily turns each week's real Japan news into self-contained
          Japanese lessons.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
        />
      </div>
    </main>

    <UFooter
      class="relative z-10 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#0B0E14]"
    >
      <template #left>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../../components/AppHeader.vue";

const features = [
  {
    title: "Japanese Lessons from the News",
    description:
      "Every record is one Japanese-language article turned into a lesson by the Claude web agent: a representative passage with inline furigana (ruby) markup, its Hepburn rōmaji, an English translation, an 8–15 term vocabulary list with readings, part of speech and JLPT levels, and 1–3 grammar notes — every section carries furigana over kanji and rōmaji, and tapping a highlighted word in the passage shows its reading, rōmaji and meaning.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "Browse by JLPT Difficulty",
    description:
      "Filter lessons by difficulty (N5–N1); each lesson shows its estimated level as a badge and the list is ordered newest article first.",
    icon: "i-heroicons-adjustments-horizontal",
  },
  {
    title: "One Article, One Lesson",
    description:
      "No clustering, no cross-article synthesis, no topic taxonomy — each lesson stands on its own so the reading view stays simple.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "AI Trust Scoring",
    description:
      "A credibility score (0.0-1.0) the Claude web agent assigns the first time it cites a publisher, then cached per-domain in Redis and reused automatically — rendered on each lesson with an HSL color gradient (red → green).",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Agent-Driven News Discovery",
    description:
      "A Claude web agent researches the week's teachable Japan news from Japanese-language publishers on a weekly schedule, entirely outside this codebase.",
    icon: "i-heroicons-magnifying-glass",
  },
  {
    title: "MCP-Driven Lesson Pipeline",
    description:
      "News discovery and Japanese-lesson authoring happen entirely outside this codebase — a Claude web agent writes and prunes finished lessons through a bearer-token-protected remote MCP server.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "Automated Data Retention",
    description:
      "A dedicated cleanup pipeline permanently prunes lessons whose article is older than 30 days from Redis, keeping the store from growing unbounded.",
    icon: "i-heroicons-trash",
  },
  {
    title: "Resilient Fallback Component",
    description:
      "A graceful UI fallback state (TrendingFallback) shown when the /api/news fetch fails.",
    icon: "i-heroicons-exclamation-triangle",
  },
  {
    title: "In-Memory Fallback Mode",
    description:
      "Resilient system design that falls back to an in-memory store if Redis is temporarily unreachable or unconfigured.",
    icon: "i-heroicons-arrow-path",
  },
  {
    title: "Custom Editorial UI Library",
    description:
      "Lightweight, locally-maintained components (UButton, UCard, UHeader, etc.) that mimic the Nuxt UI API but carry no @nuxt/ui dependency, built on Tailwind CSS v4 in a newspaper-inspired style — a masthead header with a live dateline, kicker labels, and double-rule dividers.",
    icon: "i-heroicons-paint-brush",
  },
  {
    title: "Dark Mode Native",
    description:
      "Full system-wide dark mode support for a premium reading experience in low-light environments.",
    icon: "i-heroicons-moon",
  },
];
</script>
