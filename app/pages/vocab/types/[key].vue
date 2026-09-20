<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <NuxtLink
        to="/vocab"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors mb-10"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        Back to N5 Vocabulary
      </NuxtLink>

      <template v-if="group">
        <div class="max-w-2xl space-y-4">
          <p class="kicker text-primary-600 dark:text-primary-400">Word Type</p>
          <h1
            class="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
          >
            {{ group.label }}
          </h1>
          <div class="rule-double max-w-[120px]" />
          <p
            class="text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
          >
            {{ group.insight }}
          </p>
          <p
            v-if="group.extendedInsight"
            class="text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
          >
            {{ group.extendedInsight }}
          </p>
        </div>

        <!-- Example sentences -->
        <section
          v-if="group.examples?.length"
          class="mt-10 space-y-4 max-w-2xl"
        >
          <h2
            class="text-lg font-serif font-bold text-stone-900 dark:text-white"
          >
            In a Sentence
          </h2>
          <div
            v-for="(example, i) in group.examples"
            :key="i"
            class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 space-y-1"
          >
            <p class="font-serif text-lg text-stone-900 dark:text-white">
              {{ example.jp }}
            </p>
            <p class="text-xs text-stone-400 dark:text-stone-500">
              {{ example.romaji }}
            </p>
            <p class="text-sm text-stone-600 dark:text-stone-300">
              {{ example.en }}
            </p>
          </div>
        </section>

        <!-- Common mistake -->
        <div
          v-if="group.commonMistake"
          class="mt-10 max-w-2xl rounded-sm border border-warning-500/20 bg-warning-500/10 p-4 space-y-1.5"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-warning-700 dark:text-warning-400 font-sans font-medium"
          >
            Common Mistake
          </p>
          <p class="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            {{ group.commonMistake }}
          </p>
        </div>

        <div class="rule-double my-12" />

        <!-- Word list -->
        <section class="space-y-6">
          <div class="text-center max-w-lg mx-auto space-y-3">
            <h2
              class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
            >
              All {{ groupWords.length }} {{ group.label }}
            </h2>
          </div>

          <div class="max-w-md mx-auto">
            <input
              v-model="searchQuery"
              type="text"
              data-testid="vocab-type-search"
              placeholder="Search by kanji, kana, romaji, or meaning…"
              class="w-full rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <USkeleton v-for="i in 8" :key="i" class="h-20 rounded-sm" />
          </div>

          <div
            v-else-if="filteredWords.length === 0"
            class="text-center text-sm text-stone-500 dark:text-stone-400 py-8"
          >
            No words match "{{ searchQuery }}".
          </div>

          <div
            v-else
            data-testid="vocab-type-results"
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <div
              v-for="item in displayedWords"
              :key="item.id"
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-3 space-y-1"
            >
              <p
                class="font-serif text-lg text-stone-900 dark:text-white leading-tight"
              >
                {{ item.term }}
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400">
                {{ item.kana }}
                <span class="text-stone-400 dark:text-stone-500"
                  >· {{ item.romaji }}</span
                >
              </p>
              <p
                class="text-xs text-stone-600 dark:text-stone-300 leading-snug"
              >
                {{ item.meaning }}
              </p>
            </div>
          </div>

          <div
            v-if="visibleCount < filteredWords.length"
            class="flex justify-center pt-2"
          >
            <UButton
              label="Show More"
              color="gray"
              variant="outline"
              size="md"
              data-testid="vocab-type-show-more"
              @click="visibleCount += PAGE_SIZE"
            />
          </div>
        </section>

        <!-- Prev / next group -->
        <nav class="mt-12 flex items-center justify-between gap-4 text-sm">
          <NuxtLink
            v-if="prevGroup"
            :to="`/vocab/types/${prevGroup.key}`"
            class="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            {{ prevGroup.label }}
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="nextGroup"
            :to="`/vocab/types/${nextGroup.key}`"
            class="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors text-right"
          >
            {{ nextGroup.label }}
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </nav>

        <div class="rule-double my-12" />

        <div class="flex flex-wrap gap-3 justify-center">
          <UButton
            label="Play Today's Game"
            to="/game"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
          <UButton
            label="Back to All Words"
            to="/vocab"
            color="gray"
            variant="ghost"
            size="md"
          />
        </div>
      </template>

      <template v-else>
        <div class="text-center py-16 space-y-4">
          <p class="text-lg text-stone-600 dark:text-stone-400">
            That word type doesn't exist.
          </p>
          <UButton
            label="Back to N5 Vocabulary"
            to="/vocab"
            color="primary"
            icon="i-heroicons-arrow-left"
          />
        </div>
      </template>
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
          Vocabulary from
          <a
            href="https://github.com/elzup/jlpt-word-list"
            target="_blank"
            rel="noopener"
            class="underline hover:text-primary-500"
            >elzup/jlpt-word-list</a
          >
          (MIT), cross-referenced against JMdict (EDRDG, CC BY-SA 4.0)
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "#app";
import AppHeader from "../../../components/AppHeader.vue";
import { useN5VocabPool } from "../../../composables/useN5VocabPool";
import {
  WORD_TYPE_GROUPS,
  classifyPartOfSpeech,
} from "../../../data/vocab-guide";

const PAGE_SIZE = 60;

const route = useRoute();
const groupKey = computed(() => String(route.params.key ?? ""));
const groupIndex = computed(() =>
  WORD_TYPE_GROUPS.findIndex((g) => g.key === groupKey.value),
);
const group = computed(() =>
  groupIndex.value === -1 ? undefined : WORD_TYPE_GROUPS[groupIndex.value],
);
const prevGroup = computed(() =>
  groupIndex.value > 0 ? WORD_TYPE_GROUPS[groupIndex.value - 1] : undefined,
);
const nextGroup = computed(() =>
  groupIndex.value !== -1 && groupIndex.value < WORD_TYPE_GROUPS.length - 1
    ? WORD_TYPE_GROUPS[groupIndex.value + 1]
    : undefined,
);

const { vocabPool, loading, fetchVocab } = useN5VocabPool();

const searchQuery = ref("");
const visibleCount = ref(PAGE_SIZE);

const groupWords = computed(() =>
  vocabPool.value.filter(
    (item) =>
      classifyPartOfSpeech(item.partOfSpeech, item.term) === groupKey.value,
  ),
);

const filteredWords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return groupWords.value;
  return groupWords.value.filter(
    (item) =>
      item.term.includes(query) ||
      item.kana.includes(query) ||
      item.romaji.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query),
  );
});

const displayedWords = computed(() =>
  filteredWords.value.slice(0, visibleCount.value),
);

watch(searchQuery, () => {
  visibleCount.value = PAGE_SIZE;
});

onMounted(async () => {
  const isTest =
    typeof process !== "undefined" &&
    (process.env?.NODE_ENV === "test" || process.env?.VITEST);
  if (!isTest) {
    await fetchVocab();
  }
});

defineOptions({
  name: "VocabTypePage",
});

defineExpose({
  fetchVocab,
  vocabPool,
});
</script>
