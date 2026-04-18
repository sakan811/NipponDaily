<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" >
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
            @click="mobileMenuOpen = false"
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
    title: "Cross-Source Analysis",
    description:
      "Thematic synthesis that identifies relationships, corroborations, and contrasting viewpoints across different publishers.",
    icon: "i-heroicons-link",
  },
  {
    title: "AI Trust Scoring",
    description:
      "Automated credibility assessment based on source reputation, domain authority, and content quality metrics.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Multilingual Intelligence",
    description:
      "Seamless translation of Japanese news context into your preferred language while preserving journalistic nuance.",
    icon: "i-heroicons-language",
  },
  {
    title: "Dynamic News Discovery",
    description:
      "Granular filtering by category and custom time ranges (up to 365 days) to find the specific stories that matter.",
    icon: "i-heroicons-funnel",
  },
  {
    title: "Smart Fallback Mode",
    description:
      "Resilient system design that gracefully transitions to raw data display if AI synthesis services are temporarily unavailable.",
    icon: "i-heroicons-arrow-path",
  },
  {
    title: "Source Verification",
    description:
      "Visual source identification through dynamically fetched favicons and direct links to original journalistic articles.",
    icon: "i-heroicons-globe-alt",
  },
  {
    title: "Adaptive Rate Limiting",
    description:
      "Fair-usage limits managed by Redis to ensure service stability and predictable API consumption.",
    icon: "i-heroicons-clock",
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
