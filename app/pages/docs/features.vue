<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-4xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <NuxtLink
          to="/#docs"
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
          NipponDaily turns a persisted N5 kanji, kana, and vocabulary pool into
          one bite-sized daily learning game.
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
    title: "One Daily Game for Everyone",
    description:
      "Every visitor on a given day plays the same 20-question round — 5 each of hiragana, katakana, N5 kanji, and N5 vocabulary — generated once and served to all readers that day.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "Persisted N5 Learning Pool",
    description:
      "Hiragana, katakana, N5 kanji (via KANJIDIC2), and N5 vocabulary (cross-referenced against JMdict) are seeded once into Redis and reused every day — see scripts/seed-n5-data.mjs.",
    icon: "i-heroicons-circle-stack",
  },
  {
    title: "One Cohesive Round, Not a Menu",
    description:
      "No separate mini-games to choose between — every day is a single mixed round of multiple-choice questions across all four kinds.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Instant Feedback & Accuracy Summary",
    description:
      "Every answer is graded immediately; the end-of-round summary breaks down accuracy per kind — no accounts needed to track a single round.",
    icon: "i-heroicons-check-circle",
  },
  {
    title: "Deterministic Daily Generation",
    description:
      "GET /api/daily-game generates each day's game itself from the N5 pool using a date-seeded PRNG the first time that date is requested, then persists it — the site never shows \"no game today\", and no agent or AI provider is involved in game content. A Vercel Cron job also pre-generates each day's game at 00:00 UTC, and generation avoids repeating any item used in the past 7 days.",
    icon: "i-heroicons-arrow-path",
  },
  {
    title: "Kana & Vocabulary Guides",
    description:
      "Study references alongside the game: a hiragana/katakana chart with romaji at /kana, and the full N5 vocabulary pool at /vocab, grouped by word family and word type.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "Education Charms",
    description:
      "Kana pairs, vocabulary words and score tiles hang as 学業守 omamori (academic-success charms); explanations and the daily question are written on ema plaques. A correct answer stamps a 合格 hanko seal, and the round summary seals a charm 合格 or 努力. All motion respects prefers-reduced-motion.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "Seasonal Shape Language",
    description:
      "Each season reshapes the UI as well as recoloring it — notched petals and pill buttons in spring, squircle pebbles and droplet buttons in summer, bevel-cut leaves and tags in autumn, frosted octagons with hexagonal buttons and badges in winter — using CSS corner-shape via --shape-* / --corner-* / --motif-* tokens, with rounded corners as the fallback.",
    icon: "i-heroicons-swatch",
  },
  {
    title: "Agent-Driven Seasonal Theme",
    description:
      "A Claude web agent checks and, when it should change, switches NipponDaily's active season on its own schedule, entirely outside this codebase. There is one preset per Japanese season (sakura, summer, autumn, winter), and each one swaps the palette and the UI's shapes together.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "MCP-Driven Theme Pipeline",
    description:
      "The theme agent reads and writes the active season through a bearer-token-protected remote MCP server (get_active_theme, save_site_theme), restricted to a closed set of implemented presets. get_active_theme also returns the season matching today's date in Japan, so the agent only has to compare and, if needed, save.",
    icon: "i-heroicons-command-line",
  },
  {
    title: "Ambient Seasonal Graphic",
    description:
      "Falling sakura petals, rising summer fireflies, autumn leaves, or winter snow drift across every page, matching whichever season is active — a pure CSS animation keyed off the same data-season attribute as the color palette, with no extra agent involvement and full prefers-reduced-motion support.",
    icon: "i-heroicons-sparkles",
  },
  {
    title: "Zero Gameplay Persistence",
    description:
      "Current question, per-kind accuracy, and the end-of-round summary all live in the browser's own component state — nothing about a play-through is ever sent back to the server or saved anywhere.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Resilient Fallback Component",
    description:
      "A graceful UI fallback state (TrendingFallback) shown when the /api/daily-game fetch fails.",
    icon: "i-heroicons-exclamation-triangle",
  },
  {
    title: "Custom Editorial UI Library",
    description:
      "Lightweight, locally-maintained components (UButton, UCard, UHeader, etc.) that mimic the Nuxt UI API but carry no @nuxt/ui dependency, built on Tailwind CSS v4 with a masthead header and live dateline, kicker labels, and dividers. Their corners, motifs, and divider styles come from per-season shape tokens, so the same components look different in each season.",
    icon: "i-heroicons-sparkles",
  },
  {
    title: "Dark Mode Native",
    description:
      "Full system-wide dark mode support for comfortable play in low-light environments.",
    icon: "i-heroicons-moon",
  },
];
</script>
