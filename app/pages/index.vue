<template>
  <UPage>
    <!-- Header -->
    <UHeader>
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
      title="Japan News, Synthesized by AI"
      description="Stop scrolling through raw lists. Get AI-synthesized briefings that connect the dots across multiple Japanese news sources."
      :links="[
        {
          label: 'Generate Briefing',
          to: '/news',
          color: 'primary',
          icon: 'i-heroicons-bolt',
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
          AI Intelligence Aggregator
        </UBadge>
      </template>
    </UPageHero>

    <div class="border-t border-[var(--ui-border)]" />

    <!-- Features Section -->
    <UPageSection
      title="Intelligence at a Glance"
      description="AI-powered tools designed for deep news consumption without the noise."
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
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const features = ref([
  {
    title: "Executive Briefing",
    description:
      "Synthesized reports that distill complex Japanese news into a single narrative.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Cross-Source Analysis",
    description:
      "Identify relationships and contrasting viewpoints across multiple publishers.",
    icon: "i-heroicons-link",
  },
  {
    title: "AI Trust Scoring",
    description: "Automated evaluation of source reliability and domain trust.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Multilingual Support",
    description:
      "Read Japanese context in your preferred language with high-fidelity translation.",
    icon: "i-heroicons-language",
  },
  {
    title: "Adaptive Discovery",
    description: "Filter by category and custom time ranges up to 365 days.",
    icon: "i-heroicons-funnel",
  },
  {
    title: "Fair Usage Limits",
    description:
      "Smart daily rate limits to ensure equitable access to AI resources for all users.",
    icon: "i-heroicons-clock",
  },
]);
</script>
