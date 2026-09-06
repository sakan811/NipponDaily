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
          NipponDaily transforms raw news into actionable intelligence using
          advanced AI synthesis.
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
    title: "Executive Briefing",
    description:
      "Synthesized reports that distill the most critical developments from multiple news sources into a single, cohesive narrative.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Connections & Root-Cause Analysis",
    description:
      "Each story mapped as a node in a web: the structural driver behind the event, the trend line it sits on, links to other tracked stories, and where domestic Japanese and international coverage diverge in emphasis.",
    icon: "i-heroicons-link",
  },
  {
    title: "Story Timeline Navigation",
    description:
      "In-depth drill-down from a trending topic on the front page — lead story or column grid — into a dedicated chronological timeline page detailing the progression of articles.",
    icon: "i-heroicons-clock",
  },
  {
    title: "Chronological Ordering",
    description:
      "Timelines display all source articles sorted chronologically (oldest-first) to document the historical narrative flow.",
    icon: "i-heroicons-bars-3-bottom-left",
  },
  {
    title: "AI Trust Scoring",
    description:
      "Per-source credibility scores (0.0-1.0) assigned by the Claude web agent when it writes a story, aggregated into an overall score and rendered with an HSL color gradient.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Agent-Driven News Discovery",
    description:
      "A Claude web agent researches Japan-related news across all major categories on its own schedule, entirely outside this codebase.",
    icon: "i-heroicons-magnifying-glass",
  },
  {
    title: "Span-based Time Filtering",
    description:
      "Filters trending topics by evaluating whether the story's actual publish period overlaps with selected time or date ranges.",
    icon: "i-heroicons-funnel",
  },
  {
    title: "MCP-Driven Story Pipeline",
    description:
      "News discovery, clustering, and summarization happen entirely outside this codebase — a Claude web agent writes, merges, and prunes finished stories through a bearer-token-protected remote MCP server.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "Automated Data Retention",
    description:
      "A dedicated cleanup pipeline permanently prunes stories older than 30 days from Redis, keeping the store from growing unbounded.",
    icon: "i-heroicons-trash",
  },
  {
    title: "Resilient Fallback Components",
    description:
      "Graceful UI fallback states (TrendingFallback & SummaryFallback) that render raw source coverage when AI or storage services encounter errors, with an interactive testing toolbar via ?debug_error_ui=true.",
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
      "Lightweight, custom components (UButton, UCard, UHeader, etc.) built natively on Tailwind CSS v4 in a newspaper-inspired style — masthead header with dateline, kicker labels, double-rule dividers, and a drop-cap lede — optimized for reader engagement and content clarity.",
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
