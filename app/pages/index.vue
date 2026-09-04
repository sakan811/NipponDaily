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
          AI-Powered Japan News Aggregator & Briefings
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Real-Time AI Briefings.<br class="hidden sm:inline" />
          <span class="text-primary-500 italic font-normal"
            >Cross-Source Synthesis &</span
          >
          Credibility Intelligence.
        </h1>

        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-body-serif"
        >
          NipponDaily clusters multi-source Japanese coverage using AI-driven
          analysis—delivering executive briefings, cross-perspective synthesis,
          and automated credibility scoring across 6 channels.
        </p>

        <div class="flex flex-wrap gap-4 justify-center pt-4">
          <UButton
            data-testid="hero-cta"
            label="Enter Intelligence Hub"
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

      <!-- Specialty Channels: Contents Index -->
      <section class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Six Specialty Channels
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Curated streams capturing the true multi-faceted heart and pulse of
            modern Japan.
          </p>
        </div>

        <p class="kicker text-stone-400 dark:text-stone-500">
          Inside This Edition
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-2 border-t border-stone-300 dark:border-stone-800"
        >
          <div
            v-for="(channel, idx) in channels"
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
                {{ channel.title }}
              </h3>
              <p
                class="text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-sans"
              >
                {{ channel.description }}
              </p>
            </div>
          </div>
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

const channels = ref([
  {
    title: "Society & Prefectures",
    description:
      "Deep insights into demographic shifts, rural revitalization efforts, prefectural policies, and local Japanese daily life.",
    icon: "i-heroicons-user-group",
  },
  {
    title: "Tech & Mobility",
    description:
      "The cutting edge: Japanese robotics, microchip foundries, Shinkansen expansions, aerospace development, and automotive giants.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "Pop Culture & Gaming",
    description:
      "Global releases and movements in anime, manga publishing houses, iconic gaming studios (Nintendo, Sony), J-Pop, and Tokyo youth trends.",
    icon: "i-heroicons-play-circle",
  },
  {
    title: "Travel & Heritage",
    description:
      "Curated guides to hidden hot spring (onsen) villages, regional festivals (matsuri), historical preservation, and structural tourism.",
    icon: "i-heroicons-map",
  },
  {
    title: "Food & Gastronomy",
    description:
      "Washoku culinary arts, Michelin guides, traditional sake/whisky craft distilleries, agricultural techniques, and regional delicacies.",
    icon: "i-heroicons-cake",
  },
  {
    title: "Nature & Resilience",
    description:
      "Seismic and meteorological developments, structural disaster preparation, environmental stewardship, and geographical surveys.",
    icon: "i-heroicons-shield-exclamation",
  },
]);
</script>
