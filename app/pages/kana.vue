<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <!-- Intro -->
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">
          The Kana Guide
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Hiragana &amp; Katakana
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Two scripts, one sound system. Every kana below is grouped with its
          same-sounding partner in the other script, plus a shape mnemonic to
          make it stick — study the pair together, then try the day's game to
          put them into practice.
        </p>
      </div>

      <!-- Why two scripts -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
        <div
          class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 space-y-2"
        >
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft" size="sm">Hiragana</UBadge>
            <span class="font-serif text-xl text-stone-800 dark:text-stone-100"
              >ひらがな — rounded, native</span
            >
          </div>
          <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Used for native Japanese words, grammar particles (は, を, が), and
            verb/adjective endings. It's the first script Japanese children
            learn, and every kanji can be spelled out in it if you don't know
            the character.
          </p>
        </div>
        <div
          class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 space-y-2"
        >
          <div class="flex items-center gap-2">
            <UBadge color="secondary" variant="soft" size="sm">Katakana</UBadge>
            <span class="font-serif text-xl text-stone-800 dark:text-stone-100"
              >カタカナ — angular, foreign</span
            >
          </div>
          <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Used for loanwords borrowed from other languages (コンピューター,
            computer), foreign names, onomatopoeia, and for emphasis — the rough
            equivalent of italics in English.
          </p>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- Gojuon table -->
      <section class="space-y-10">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            The 46 Base Sounds
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Grouped by row (gojūon order) — the same order dictionaries and
            phone-typing use.
          </p>
        </div>

        <div v-for="group in kanaRows" :key="group.row" class="space-y-4">
          <p class="kicker text-stone-400 dark:text-stone-500">
            {{ group.row }}-row
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div
              v-for="entry in group.entries"
              :key="entry.romaji"
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 space-y-3"
            >
              <p
                class="font-serif text-sm font-bold text-primary-600 dark:text-primary-400 tracking-wide uppercase"
              >
                {{ entry.romaji }}
              </p>

              <div class="flex items-start gap-2">
                <span
                  class="font-serif text-3xl leading-none text-stone-900 dark:text-white shrink-0"
                  >{{ entry.hiragana }}</span
                >
                <p
                  class="text-xs leading-relaxed text-stone-500 dark:text-stone-400"
                >
                  {{ entry.hiraganaMnemonic }}
                </p>
              </div>

              <div class="border-t border-stone-100 dark:border-stone-800/80" />

              <div class="flex items-start gap-2">
                <span
                  class="font-serif text-3xl leading-none text-stone-900 dark:text-white shrink-0"
                  >{{ entry.katakana }}</span
                >
                <p
                  class="text-xs leading-relaxed text-stone-500 dark:text-stone-400"
                >
                  {{ entry.katakanaMnemonic }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- Dakuten / handakuten -->
      <section class="space-y-6">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Voicing Marks
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            Small marks that turn a base kana into a related sound — no new
            shapes to memorize.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="group in dakutenGroups"
            :key="group.title"
            class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 space-y-2"
          >
            <h3 class="font-serif font-bold text-stone-900 dark:text-white">
              {{ group.title }}
            </h3>
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              {{ group.description }}
            </p>
            <p class="text-xs text-stone-400 dark:text-stone-500 italic">
              {{ group.example }}
            </p>
          </div>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- Digraphs / small kana -->
      <section class="space-y-6">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Combos &amp; Small Kana
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            The remaining pieces that let kana spell out any sound in the
            language.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            v-for="group in digraphGroups"
            :key="group.title"
            class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 space-y-2"
          >
            <h3 class="font-serif font-bold text-stone-900 dark:text-white">
              {{ group.title }}
            </h3>
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              {{ group.description }}
            </p>
            <p class="text-xs text-stone-400 dark:text-stone-500 italic">
              {{ group.example }}
            </p>
          </div>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- CTA -->
      <section class="space-y-6 max-w-2xl mx-auto text-center">
        <h2
          class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
        >
          Put It Into Practice
        </h2>
        <div class="rule-double max-w-[120px] mx-auto" />
        <p
          class="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Every round of the daily game opens with five hiragana and five
          katakana questions, drawn straight from this same 46-sound set.
        </p>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <UButton
            data-testid="kana-game-cta"
            label="Play Today's Game"
            to="/game"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
          <UButton
            label="How it works"
            to="/docs/architecture"
            color="gray"
            variant="ghost"
            size="md"
          />
        </div>
      </section>
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
      <template #right>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          Romaji via
          <a
            href="https://github.com/WaniKani/WanaKana"
            target="_blank"
            rel="noopener"
            class="underline hover:text-primary-500"
            >wanakana</a
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
import AppHeader from "../components/AppHeader.vue";
import { KANA_ROWS, DAKUTEN_GROUPS, DIGRAPH_GROUPS } from "../data/kana-guide";

const kanaRows = KANA_ROWS;
const dakutenGroups = DAKUTEN_GROUPS;
const digraphGroups = DIGRAPH_GROUPS;
</script>
