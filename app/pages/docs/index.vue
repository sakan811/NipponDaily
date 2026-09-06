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
      <div class="text-center max-w-2xl mx-auto space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">
          Documentation
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          How NipponDaily Works
        </h1>
        <div class="rule-double max-w-[120px] mx-auto" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Everything behind the front page — the system architecture, the
          reader-facing features, and a live catalogue of every error and
          fallback state the site can render.
        </p>
      </div>

      <p class="kicker text-stone-400 dark:text-stone-500 mt-16 mb-6">
        In This Section
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="page in pages"
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

const pages = [
  {
    to: "/docs/architecture",
    title: "System Architecture",
    description:
      "A guided tour of the stack — the Nuxt 4 frontend, the Upstash Redis story store it reads from, and the remote MCP server a Claude web agent uses to write finished news clusters straight into the database.",
    icon: "i-heroicons-building-office-2",
  },
  {
    to: "/docs/features",
    title: "Core Features",
    description:
      "The reader-facing capabilities: executive briefings, cross-source synthesis and root-cause analysis, per-source credibility scoring, story timelines, and span-based time filtering.",
    icon: "i-heroicons-star",
  },
  {
    to: "/docs/error-states",
    title: "Error & Fallback States",
    description:
      "A live catalogue of every degraded, empty, or failure state the UI can render — shown with the real components and mock data so their look can be reviewed without triggering an outage.",
    icon: "i-heroicons-exclamation-triangle",
  },
];
</script>
