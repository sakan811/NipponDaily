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
          NipponDaily opens one Japanese word a day and takes it apart: its
          morphemes, its layer of the vocabulary, the processes that shaped it,
          and the evidence behind every claim — with a calendar to look back
          through every word so far.
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

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";

const features = [
  {
    title: "A New Word Every Day",
    description:
      "One entry opens each day at midnight in Japan (JST) — the same word for every reader. October 2026 is the first month: thirty-one words, one per day, each chosen from the JLPT N5–N2 vocabulary for having something real to say about how Japanese words are built.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "A Calendar to Look Back Through",
    description:
      "/words is a month grid. A day that has arrived shows its word and links to the full entry; a day that hasn't shows nothing, and the API refuses to serve it — so a future word can't be read early, even by asking for its exact date. Months with no entries don't appear.",
    icon: "i-heroicons-calendar-days",
  },
  {
    title: "Taken Apart",
    description:
      "Each word is split into its morphemes, each with its reading and meaning. Where sound change hides the join (夢 was once いめ, 梅雨 can be read ばいう), the entry shows the reading the parts really spell and says so. A word whose origin is unknown gets no breakdown at all — any split would be a guess.",
    icon: "i-heroicons-adjustments-horizontal",
  },
  {
    title: "Which Layer, Which Process",
    description:
      "Every entry names the layer of the vocabulary it belongs to — native 和語, Sino-Japanese 漢語, loanword 外来語 or hybrid 混種語 — and the processes at work (compounding, rendaku, clipping, ateji, sound change, meaning shift, …), each defined on the page.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "The Story, Honestly",
    description:
      "A short plain-English account of where the word comes from. When sources disagree or nobody knows, a “Not settled” note lists the competing theories instead of picking a winner.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Evidence for Every Claim",
    description:
      "Each entry quotes the exact Wiktionary lines behind its origin claims, pinned to one revision, with a permalink and its CC BY-SA 4.0 license — so a claim can be checked by anyone, and can't change underneath us.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Verified in CI",
    description:
      "Every entry is checked on every change: its reading, level and meaning must match the JMdict-checked pool; each morpheme's reading and gloss must be backed by KANJIDIC2 or the cited text; every quoted source line must really be in the pinned Wiktionary snapshot; and the prose may only mention Japanese that its evidence or the pool contains. A wrong entry can't merge.",
    icon: "i-heroicons-check-circle",
  },
  {
    title: "Kana Reference",
    description:
      "A hiragana/katakana chart with romaji and shape mnemonics at /kana, for readers who need the scripts before the words.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "Education Charms",
    description:
      "Kana pairs hang as 学業守 omamori (academic-success charms) and explanations are written on ema plaques, in brocade and wood that follow the active season. All motion respects prefers-reduced-motion.",
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
    title: "Nothing Stored About You",
    description:
      "There are no accounts and no tracking. The words are a read-only, in-repo catalogue; the only things the site ever fetches are a day's entry and the month grid, and nothing about what you read is sent back or saved anywhere.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Resilient Fallback Component",
    description:
      "A graceful UI fallback state (TrendingFallback) shown when a word or calendar fetch fails, with a retry. Once the catalogue runs out of days, the home page falls back to the newest word instead of showing nothing.",
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
      "Full system-wide dark mode support for comfortable reading in low-light environments.",
    icon: "i-heroicons-moon",
  },
];
</script>
