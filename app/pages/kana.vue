<template>
  <AppShell>
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
          make it stick — study the pair together, then meet them in a real word
          each day.
        </p>
      </div>

      <!-- Why two scripts -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
        <EmaPlaque>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UBadge color="primary" variant="soft" size="sm">Hiragana</UBadge>
              <span
                class="font-serif text-xl text-stone-800 dark:text-stone-100"
                >ひらがな — rounded, native</span
              >
            </div>
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              Used for native Japanese words, grammar particles (は, を, が),
              and verb/adjective endings. It's the first script Japanese
              children learn, and every kanji can be spelled out in it if you
              don't know the character.
            </p>
          </div>
        </EmaPlaque>
        <EmaPlaque>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UBadge color="secondary" variant="soft" size="sm"
                >Katakana</UBadge
              >
              <span
                class="font-serif text-xl text-stone-800 dark:text-stone-100"
                >カタカナ — angular, foreign</span
              >
            </div>
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              Used for loanwords borrowed from other languages (コンピューター,
              computer), foreign names, onomatopoeia, and for emphasis — the
              rough equivalent of italics in English.
            </p>
          </div>
        </EmaPlaque>
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
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-3 gap-y-4"
          >
            <OmamoriCharm
              v-for="(entry, entryIndex) in group.entries"
              :key="entry.romaji"
              :index="entryIndex"
              mark="学"
            >
              <div class="space-y-3">
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

                <div
                  class="border-t border-stone-100 dark:border-stone-800/80"
                />

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
            </OmamoriCharm>
          </div>
        </div>
      </section>

      <div class="rule-double my-16" />

      <template v-for="section in kanaSections" :key="section.title">
        <section class="space-y-6">
          <div class="text-center max-w-lg mx-auto space-y-3">
            <h2
              class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
            >
              {{ section.title }}
            </h2>
            <div class="rule-double max-w-[120px] mx-auto" />
            <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
              {{ section.blurb }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6" :class="section.columns">
            <EmaPlaque
              v-for="(group, groupIndex) in section.groups"
              :key="group.title"
              :index="groupIndex"
            >
              <div class="space-y-2">
                <h3 class="font-serif font-bold text-stone-900 dark:text-white">
                  {{ group.title }}
                </h3>
                <p
                  class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
                >
                  {{ group.description }}
                </p>
                <p class="text-xs text-stone-600 dark:text-stone-400 italic">
                  {{ group.example }}
                </p>
              </div>
            </EmaPlaque>
          </div>
        </section>

        <div class="rule-double my-16" />
      </template>

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
          Every word on NipponDaily is written out with its kana reading, so the
          46 sounds above are the key to reading each entry's “Taken apart”
          breakdown.
        </p>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <UButton
            data-testid="kana-word-cta"
            label="Read Today's Word"
            to="/"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
          <UButton
            label="Browse the Calendar"
            to="/words"
            color="gray"
            variant="ghost"
            size="md"
          />
        </div>
      </section>
    </main>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "../components/AppShell.vue";
import { usePageSeo } from "../composables/usePageSeo";
import EmaPlaque from "../components/EmaPlaque.vue";
import OmamoriCharm from "../components/OmamoriCharm.vue";
import { KANA_ROWS, DAKUTEN_GROUPS, DIGRAPH_GROUPS } from "../data/kana-guide";

const kanaRows = KANA_ROWS;
// Two sections of the same shape: a heading, a line, and a grid of plaques.
const kanaSections = [
  {
    title: "Voicing Marks",
    blurb:
      "Small marks that turn a base kana into a related sound — no new shapes to memorize.",
    groups: DAKUTEN_GROUPS,
    columns: "sm:grid-cols-2",
  },
  {
    title: "Combos & Small Kana",
    blurb:
      "The remaining pieces that let kana spell out any sound in the language.",
    groups: DIGRAPH_GROUPS,
    columns: "sm:grid-cols-3",
  },
];

usePageSeo({
  title: "Hiragana & Katakana",
  description:
    "The 46 hiragana and katakana, side by side, each with a shape mnemonic.",
  path: "/kana",
});
</script>
