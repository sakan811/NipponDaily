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
import { usePageSeo } from "../../composables/usePageSeo";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";

const features = [
  {
    title: "A New Word Every Day",
    description:
      "One entry opens each day at midnight in Japan (JST), the same word for every reader. January through December 2026 and January through October 2027 (669 words) are written so far, all from the JLPT N5–N2 vocabulary.",
    icon: "i-heroicons-academic-cap",
  },
  {
    title: "A Calendar to Look Back Through",
    description:
      "/words is a month grid. A day that has arrived shows its word and links to the full entry; an upcoming day shows only its date, and the API refuses to serve it, so a word can't be read early.",
    icon: "i-heroicons-calendar-days",
  },
  {
    title: "Explore by How Words Are Built",
    description:
      "/explore searches every word that has opened — by the word, its reading (katakana or hiragana) or its meaning — and narrows by JLPT level, layer or process. Each option shows how many words it would leave, and the filters live in the URL so a search can be shared. Upcoming words are never searched.",
    icon: "i-heroicons-magnifying-glass",
  },
  {
    title: "Patterns Across the Vocabulary",
    description:
      "/patterns counts the same entries across words: how the vocabulary splits by layer, how each JLPT level's mix differs, which processes are most common and which turn up together. Every bar links into Explore, and the page says what the counts can't tell you — they describe these entries, not the language. It also lists which sounds voice inside a word (ひ → び, か → が…), with the parts and words that show each change — a small, parser-derived sample, not a rule of the language.",
    icon: "i-heroicons-chart-bar",
  },
  {
    title: "The Parts, Across Words",
    description:
      "/parts gathers every part a “Taken apart” row has shown. Open one — 日, say — to see each word it turns up in, grouped by the reading it takes there (び, ひ, か, にち), with rendaku shown. Words that merely contain the character, with no breakdown naming it, are listed apart and claim nothing.",
    icon: "i-heroicons-squares-2x2",
  },
  {
    title: "More Like This",
    description:
      "Under each entry, a few other words that have opened and share something with it: a part, a process or a layer. Each card says exactly what is shared and links to where you can see more of it. A word that shares only very common tags is not offered, and upcoming words never are.",
    icon: "i-heroicons-squares-2x2",
  },
  {
    title: "Taken Apart",
    description:
      "Where Wiktionary splits a word into parts with glosses, each morpheme is shown with its reading and that gloss, but only if the parts spell the word and join to its reading. Otherwise no breakdown is shown, since any other split would be a guess.",
    icon: "i-heroicons-adjustments-horizontal",
  },
  {
    title: "Which Layer, Which Process",
    description:
      "Every entry shows JMdict's part-of-speech tags, its layer when KANJIDIC2's readings establish it — native 和語, Sino-Japanese 漢語, loanword 外来語 or hybrid 混種語 — and the processes its Wiktionary text mentions (compounding, rendaku, clipping, ateji, sound change…), each defined on the page.",
    icon: "i-heroicons-book-open",
  },
  {
    title: "The Story, in Wiktionary's Words",
    description:
      "Where the word comes from is quoted line by line from Wiktionary's Etymology section for that reading, never paraphrased. Lines that hedge (“probably”, “unknown”) are flagged “Not settled” instead of being turned into a verdict.",
    icon: "i-heroicons-document-text",
  },
  {
    title: "Evidence for Every Claim",
    description:
      "Each entry quotes the Wiktionary lines it shows, pinned to one revision with a permalink and its CC BY-SA 4.0 license. Only the one-line headline is hand-written.",
    icon: "i-heroicons-shield-check",
  },
  {
    title: "Verified in CI",
    description:
      "Every entry is regenerated from JMdict, KANJIDIC2 and the pinned Wiktionary snapshot and compared, and checked independently: reading, level and meaning against the pool, part of speech against JMdict, morphemes against KANJIDIC2 or the cited text, and every quote against the section for its own reading.",
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

usePageSeo({
  title: "Core features",
  description:
    "What readers get: a new word each day, a calendar, the parts index, origin notes with their evidence, and no tracking.",
  path: "/docs/features",
});
</script>
