<template>
  <UPage>
    <!-- Header -->
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>NipponDaily</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <!-- Hero Section -->
    <UPageHero
      title="Japan News, Smartly Delivered"
      description="Discover, translate, and verify Japanese news articles with AI-powered categorization and credibility scoring."
      :links="[
        {
          label: 'Start Reading',
          to: '/news',
          color: 'primary',
          icon: 'i-heroicons-arrow-right',
          trailing: true,
        },
      ]"
      class="!py-12 sm:!py-16 lg:!py-24"
      :ui="{ links: { wrapper: 'flex flex-wrap gap-4 justify-center' } }"
    >
      <template #headline>
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          :ui="{ rounded: 'rounded-full' }"
        >
          <span
            class="w-2 h-2 rounded-full bg-primary-500 animate-pulse mr-1"
          />
          AI-Powered News Aggregator
        </UBadge>
      </template>
    </UPageHero>

    <div class="border-t border-[var(--ui-border)]" />

    <!-- Features Section -->
    <UPageSection
      title="Features"
      description="AI-powered tools for smarter Japanese news consumption."
    >
      <UPageGrid>
        <UPageCard
          v-for="(feature, index) in features"
          :key="index"
          v-bind="feature"
        />
      </UPageGrid>
    </UPageSection>

    <!-- Footer -->
    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. All rights
          reserved.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const features = ref([
  {
    title: "AI-Powered Categorization",
    description:
      "Articles automatically sorted into Politics, Business, Technology, Culture, Sports, and Other.",
    icon: "i-heroicons-chart-bar",
  },
  {
    title: "Multi-Language Translation",
    description:
      "Read news in your preferred language with AI-powered translation and summarization.",
    icon: "i-heroicons-language",
  },
  {
    title: "Credibility Scoring",
    description:
      "Weighted score based on source reputation, domain trust, content quality, and AI confidence.",
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
      "3 fetch requests per day. You can fetch up to 20 articles per request.",
    icon: "i-heroicons-clock",
  },
]);
</script>
