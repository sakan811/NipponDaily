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
      "One entry opens each day at midnight in Japan (JST), the same word for every reader. September 2026 (30 words) and October 2026 (31) are written so far, all from the JLPT N5–N2 vocabulary.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "A Calendar to Look Back Through",
    description:
      "/words is a month grid. A day that has arrived shows its word and links to the full entry; an upcoming day shows only its date, and the API refuses to serve it, so a word can't be read early.",
    icon: "i-heroicons-calendar-days",
  },
  {
    title: "Taken Apart",
    description:
      "Each word is split into morphemes with their readings and meanings. Where sound change hides the join, the entry shows the reading the parts spell (夢 as 寝 + 目 = いめ, 梅雨 as 梅 + 雨 = ばいう). A word of unknown origin gets no breakdown, since any split would be a guess.",
    icon: "i-heroicons-adjustments-horizontal",
  },
  {
    title: "Which Layer, Which Process",
    description:
      "Every entry names its layer — native 和語, Sino-Japanese 漢語, loanword 外来語 or hybrid 混種語 — and the processes at work (compounding, rendaku, clipping, ateji, sound change…), each defined on the page.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "The Story, Honestly",
    description:
      "A short plain-English account of where the word comes from. When sources disagree or nobody knows, a “Not settled” note says so instead of picking a winner.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Evidence for Every Claim",
    description:
      "Each entry quotes the Wiktionary lines behind its origin claims, pinned to one revision with a permalink and its CC BY-SA 4.0 license.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Verified in CI",
    description:
      "The tests check each entry's reading, level and meaning against the pool, each morpheme against KANJIDIC2 or the cited text, every quote against the pinned Wiktionary snapshot, and the Japanese in the prose against the evidence.",
    icon: "i-heroicons-check-circle",
  },
  {
    title: "Four Seasons",
    description:
      "The site follows the Japanese calendar: spring (sakura), summer, autumn and winter. A daily cron sets the season for the date in Japan. Each one changes the palette, the shapes of cards, buttons and badges, and the falling petals, bubbles and fireflies, leaves or snow.",
    icon: "i-heroicons-swatch",
  },
  {
    title: "Pick Your Season",
    description:
      "The season button in the header lets you choose any season, or “Follow the calendar”. Your choice is kept in this browser only.",
    icon: "i-heroicons-sparkles",
  },
  {
    title: "Kana Reference",
    description:
      "A hiragana/katakana chart with romaji and shape mnemonics at /kana, laid out as 学業守 omamori charms and ema plaques.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "Nothing Stored About You",
    description:
      "No accounts, no tracking. The site fetches a day's entry, the month grid and the season, and sends nothing about you back. Only your color mode and season choice are remembered, in your own browser.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Dark Mode & Fallbacks",
    description:
      "A light and a dark palette for every season. If a fetch fails, a retry card appears instead of an empty page, and once the catalogue runs out the home page shows the newest word.",
    icon: "i-heroicons-moon",
  },
];
</script>
