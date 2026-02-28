<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" >
          <span>NipponDaily</span>
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
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
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
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
            block
            @click="mobileMenuOpen = false"
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">Features</h1>
      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        AI-powered tools for smarter Japanese news consumption. NipponDaily combines cutting-edge AI with reliable news sources to bring you the best reading experience.
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
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. All rights reserved.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
const features = [
  {
    title: "AI-Powered Categorization",
    description:
      "Articles automatically sorted into Politics, Business, Technology, Culture, Sports, and Other using Google Gemini AI.",
    icon: "i-heroicons-chart-bar",
  },
  {
    title: "Multi-Language Translation",
    description:
      "Read news in your preferred language with AI-powered translation and summarization that preserves context.",
    icon: "i-heroicons-language",
  },
  {
    title: "Credibility Scoring",
    description:
      "Weighted score based on source reputation, domain trust, content quality, and AI confidence to help you identify reliable news.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Flexible Filtering",
    description:
      "Filter by category and time range—Today, This Week, This Month, This Year, or custom dates up to 365 days.",
    icon: "i-heroicons-funnel",
  },
  {
    title: "Daily Rate Limits",
    description:
      "Fair usage limits with 3 fetch requests per day. You can fetch up to 20 articles per request.",
    icon: "i-heroicons-clock",
  },
  {
    title: "Dark Mode Support",
    description:
      "Full dark mode support for a comfortable reading experience in any lighting condition.",
    icon: "i-heroicons-moon",
  }
];
</script>

<style>
@reference "../../assets/css/tailwind.css";

/* Basic markdown styling for standard elements */
h1 {
  @apply text-3xl font-bold mb-6 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
