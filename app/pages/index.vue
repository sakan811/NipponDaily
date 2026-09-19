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
          One New Game Every Day
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Play a round.<br class="hidden sm:inline" />
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

        <div
          class="grid grid-cols-1 md:grid-cols-2 border-t border-stone-300 dark:border-stone-800"
        >
          <div
            v-for="(part, idx) in gameParts"
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
          Once a day, a Claude web agent — running entirely outside this site —
          samples from NipponDaily's persisted N5 kanji, kana, and vocabulary
          pool and writes that day's 20 questions straight into the database
          through a private MCP server. If a day's game is ever missing, the
          site generates one itself on the spot so there's always something to
          play. Nothing about your play-through — score, streak, answers — is
          ever sent back or saved anywhere.
        </p>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <UButton
            label="How it works"
            to="/docs/architecture"
            color="primary"
            variant="outline"
            size="md"
            icon="i-heroicons-building-office-2"
          />
          <UButton
            label="All features"
            to="/docs/features"
            color="gray"
            variant="ghost"
            size="md"
          />
          <UButton
            label="Error &amp; fallback states"
            to="/docs/error-states"
            color="gray"
            variant="ghost"
            size="md"
          />
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
    title: "Streak Scoring",
    description:
      "Consecutive correct answers multiply your points, up to a ×3 combo — no accounts needed to keep score for one round.",
  },
  {
    title: "Replay Anytime",
    description:
      "Play Again reshuffles the same day's questions for another round; a new set arrives automatically tomorrow.",
  },
]);
</script>
