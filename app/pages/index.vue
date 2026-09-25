<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-[#1F2022] dark:text-[#E2E4E9] selection:bg-primary-500/20"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <!-- Header -->
    <AppHeader />

    <!-- Hero Section -->
    <main class="relative z-10 container mx-auto px-4 max-w-6xl py-16 sm:py-24">
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <p class="kicker text-primary-600 dark:text-primary-400">
          One New Game Every Day
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Play a round.<br class="hidden sm:inline" >
          <span class="text-primary-500 italic font-normal"
            >Learn the language.</span
          >
        </h1>

        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-body-serif"
        >
          NipponDaily turns hiragana, katakana, and N5 kanji &amp; vocabulary
          into one bite-sized daily quiz. Everyone sees the same 20 questions
          each day — tap through them for quick, active recall, no accounts and
          nothing ever saved: close the tab and tomorrow brings a brand new
          round.
        </p>

        <div class="flex flex-wrap gap-4 justify-center pt-4">
          <UButton
            data-testid="hero-cta"
            label="Play Today's Game"
            to="/game"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
            class="px-6 py-3 font-medium tracking-wide"
          />
          <UButton
            data-testid="hero-kana-cta"
            label="Learn the Kana"
            to="/kana"
            color="gray"
            variant="outline"
            size="lg"
            class="px-6 py-3 font-medium tracking-wide"
          />
          <UButton
            data-testid="hero-vocab-cta"
            label="Explore Vocabulary"
            to="/vocab"
            color="gray"
            variant="outline"
            size="lg"
            class="px-6 py-3 font-medium tracking-wide"
          />
        </div>
      </div>

      <div class="rule-double my-16 sm:my-24" />

      <!-- What's inside every round -->
      <section class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Inside Every Round
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Twenty multiple-choice questions, drawn fresh from the N5 learning
            pool every day.
          </p>
        </div>

        <p class="kicker text-stone-400 dark:text-stone-500">
          What You Get Per Round
        </p>

        <!-- Season-shaped tiles (petal / pebble / cut-leaf / ice) rather
             than a ruled table — see .season-box in tailwind.css. -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(part, idx) in gameParts"
            :key="idx"
            class="group season-box flex items-start gap-4 p-5 border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 hover:border-primary-500/40 transition-colors duration-200"
          >
            <span
              class="font-serif text-2xl text-stone-300 dark:text-stone-700 group-hover:text-primary-500 transition-colors duration-200 leading-none pt-0.5"
              >{{ String(idx + 1).padStart(2, "0") }}</span
            >
            <div class="space-y-1">
              <h3
                class="text-lg font-serif font-bold text-stone-900 dark:text-white group-hover:text-primary-500 transition-colors duration-200"
              >
                {{ part.title }}
              </h3>
              <p
                class="text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-sans"
              >
                {{ part.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="rule-double my-16 sm:my-24" />

      <!-- How the game gets here -->
      <section class="space-y-6 max-w-2xl mx-auto text-center">
        <h2
          class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
        >
          Where the Game Comes From
        </h2>
        <div class="rule-double max-w-[120px] mx-auto" />
        <p
          class="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Each day's 20 questions are drawn from NipponDaily's persisted N5
          kanji, kana, and vocabulary pool by the site itself — pre-generated at
          midnight UTC, or built on the spot the first time the day is
          requested, and skipping anything used in the past week. No AI writes
          the questions. What a Claude web agent does control, through a private
          MCP server, is the season: the colors and shapes you see change with
          spring, summer, autumn, and winter. Nothing about your play-through —
          answers, progress, results — is ever sent back or saved anywhere.
        </p>
      </section>

      <div class="rule-double my-16 sm:my-24" />

      <!-- Documentation -->
      <section id="docs" class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <p class="kicker text-stone-400 dark:text-stone-500">Documentation</p>
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            How NipponDaily Works
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Everything behind the front page — the system architecture, the
            color system, the reader-facing features, and a live catalogue of
            every error and fallback state the site can render.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NuxtLink
            v-for="page in docsPages"
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
      <template #right>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          Dictionary data from JMdict &amp; KANJIDIC2 (EDRDG, CC BY-SA 4.0) and
          <a
            href="https://github.com/elzup/jlpt-word-list"
            target="_blank"
            rel="noopener"
            class="underline hover:text-primary-500"
            >elzup/jlpt-word-list</a
          >
          (MIT) —
          <NuxtLink
            to="/docs/architecture#data-attribution"
            class="underline hover:text-primary-500"
            >full attribution</NuxtLink
          >
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";

const gameParts = ref([
  {
    title: "Hiragana & Katakana",
    description:
      "Five questions per script: tap the kana, pick its romaji reading from four choices.",
  },
  {
    title: "N5 Kanji",
    description:
      "Five kanji characters, each with 4 English-meaning choices drawn from KANJIDIC2.",
  },
  {
    title: "N5 Vocabulary",
    description:
      "Five vocabulary words with their kana reading shown as a hint, choosing the correct English meaning.",
  },
  {
    title: "Instant Feedback",
    description:
      "Every answer is graded immediately — right or wrong, you see it before moving on.",
  },
  {
    title: "Per-Kind Accuracy",
    description:
      "The end-of-round summary breaks down your accuracy across hiragana, katakana, kanji, and vocabulary — no accounts needed.",
  },
  {
    title: "Replay Anytime",
    description:
      "Play Again reshuffles the same day's questions for another round; a new set arrives automatically tomorrow.",
  },
]);

const docsPages = [
  {
    to: "/docs/architecture",
    title: "System Architecture",
    description:
      "A guided tour of the stack — the Nuxt 4 frontend, the Upstash Redis N5 pool + daily-game store it reads from, and the remote MCP server a Claude web agent uses to switch the site's season (palette, shapes, and ambient graphic) (game content is generated entirely in-repo, no agent involved).",
    icon: "i-heroicons-building-office-2",
  },
  {
    to: "/docs/color-palette",
    title: "Color Palette & System",
    description:
      "Every color in NipponDaily's four seasonal palettes, named and shown as badges for light and dark mode, plus the shape language each season applies to cards, buttons, and badges.",
    icon: "i-heroicons-swatch",
  },
  {
    to: "/docs/features",
    title: "Core Features",
    description:
      "The player-facing capabilities: one 20-question daily round across hiragana, katakana, N5 kanji and vocabulary; instant feedback and a per-kind accuracy summary; and zero server-side gameplay persistence.",
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
