<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>NipponDaily Docs</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            class="hidden sm:flex"
          />
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <div class="flex flex-col gap-4">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            block
            @click="
              () => {
                mobileMenuOpen = false;
              }
            "
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">Core Features</h1>
      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        NipponDaily transforms raw news into actionable intelligence using
        advanced AI synthesis.
      </p>

      <UPageGrid>
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
        />
      </UPageGrid>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false);
const features = [
  {
    title: "Executive Briefing",
    description:
      "Synthesized reports that distill the most critical developments from multiple news sources into a single, cohesive narrative.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Cross-Source Perspective Analysis",
    description:
      "Thematic synthesis that explicitly compares and contrasts viewpoints, focus, and tone of domestic Japanese outlets with global/Western media.",
    icon: "i-heroicons-link",
  },
  {
    title: "Story Timeline Navigation",
    description:
      "In-depth drill-down from a trending topic summary card into a dedicated chronological timeline page detailing the progression of articles.",
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
      "Automated credibility assessment based on source reputation, domain authority, and content quality metrics.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Targeted Search Pipeline",
    description:
      "Queries Tavily search API across all major news categories (20 articles each) to capture authentic Japan-related news in English.",
    icon: "i-heroicons-magnifying-glass",
  },
  {
    title: "Span-based Time Filtering",
    description:
      "Filters trending topics by evaluating whether the story's actual publish period overlaps with selected time or date ranges.",
    icon: "i-heroicons-funnel",
  },
  {
    title: "Automated Background Pipelines",
    description:
      "News discovery, processing, and AI regrouping all run automatically in the background (via QStash CRON schedules), keeping the database perfectly synced.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "Smart Cache Fallback Mode",
    description:
      "Resilient system design that falls back to memory caches or raw source data if Vector DB/API services are temporarily offline.",
    icon: "i-heroicons-arrow-path",
  },
  {
    title: "Custom Editorial UI Library",
    description:
      "Lightweight, custom components (UButton, UCard, UHeader, etc.) built natively on Tailwind CSS v4, optimized for reader engagement and content clarity.",
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

<style>
@reference "../../assets/css/tailwind.css";

h1 {
  @apply text-3xl font-bold mb-6 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
