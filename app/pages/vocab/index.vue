<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <!-- Intro -->
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">
          The Vocabulary Guide
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          N5 Vocabulary
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Every N5 word in the daily game's pool, plus the context that a raw
          flashcard list leaves out — how words are actually used, which ones
          pair up as opposites or polite/plain counterparts, and which small
          grammar patterns let you learn several at once instead of one at a
          time.
        </p>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="mt-10 rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-6 text-center space-y-3"
      >
        <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">
          {{ error }}
        </p>
        <UButton
          label="Try Again"
          color="primary"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="fetchVocab"
        />
      </div>

      <!-- Loading skeleton -->
      <div
        v-else-if="loading"
        class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <USkeleton v-for="i in 8" :key="i" class="h-20 rounded-sm" />
      </div>

      <template v-else>
        <div class="rule-double my-16" />

        <!-- Word Families -->
        <section class="space-y-10">
          <div class="text-center max-w-lg mx-auto space-y-3">
            <h2
              class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
            >
              Word Families
            </h2>
            <div class="rule-double max-w-[120px] mx-auto" />
            <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
              N5 words rarely stand alone — these are the clusters, patterns,
              and pairs that make several of them click at once.
            </p>
          </div>

          <div
            v-for="cluster in visibleClusters"
            :key="cluster.key"
            class="rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 sm:p-6 space-y-4"
          >
            <div class="flex flex-wrap items-baseline gap-2">
              <UBadge color="secondary" variant="soft" size="sm">{{
                cluster.subtitle
              }}</UBadge>
              <h3
                class="font-serif text-xl font-bold text-stone-900 dark:text-white"
              >
                {{ cluster.title }}
              </h3>
            </div>
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400"
            >
              {{ cluster.insight }}
            </p>

            <NuxtLink
              :to="`/vocab/families/${cluster.key}`"
              class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Explore this topic
              <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>

            <div class="space-y-3 pt-1">
              <div
                v-for="(row, rowIndex) in cluster.rows"
                :key="rowIndex"
                class="space-y-1.5"
              >
                <p
                  v-if="row.label"
                  class="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-sans"
                >
                  {{ row.label }}
                </p>

                <div class="flex flex-wrap items-center gap-2">
                  <template v-for="(term, termIndex) in row.terms" :key="term">
                    <div
                      v-if="findVocab(term)"
                      class="rounded-sm border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-2.5 py-1.5 text-center"
                    >
                      <p
                        class="font-serif text-base text-stone-900 dark:text-white leading-tight"
                      >
                        {{ findVocab(term)!.term }}
                      </p>
                      <p class="text-[10px] text-stone-500 dark:text-stone-400">
                        {{ findVocab(term)!.kana }}
                      </p>
                      <p
                        class="text-[10px] text-stone-600 dark:text-stone-300 max-w-[7rem]"
                      >
                        {{ findVocab(term)!.meaning }}
                      </p>
                    </div>
                    <UIcon
                      v-if="
                        cluster.pairwise &&
                        row.terms.length === 2 &&
                        termIndex === 0 &&
                        findVocab(term)
                      "
                      name="i-heroicons-arrows-right-left"
                      class="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0"
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="rule-double my-16" />

        <!-- Browse by word type -->
        <section class="space-y-8">
          <div class="text-center max-w-lg mx-auto space-y-3">
            <h2
              class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
            >
              Browse the Full Pool
            </h2>
            <div class="rule-double max-w-[120px] mx-auto" />
            <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
              All {{ vocabPool.length }} words, grouped by how they behave
              grammatically — which is also how you'll actually use them in a
              sentence.
            </p>
          </div>

          <!-- Search -->
          <div class="max-w-md mx-auto">
            <input
              v-model="searchQuery"
              type="text"
              data-testid="vocab-search"
              placeholder="Search by kanji, kana, romaji, or meaning…"
              class="w-full rounded-sm border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <!-- Category pills -->
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              data-testid="vocab-filter-all"
              class="cursor-pointer"
              @click="selectedGroup = 'all'"
            >
              <UBadge
                :color="selectedGroup === 'all' ? 'primary' : 'gray'"
                :variant="selectedGroup === 'all' ? 'solid' : 'outline'"
                size="md"
                >All ({{ vocabPool.length }})</UBadge
              >
            </button>
            <button
              v-for="group in wordTypeGroups"
              :key="group.key"
              type="button"
              :data-testid="`vocab-filter-${group.key}`"
              class="cursor-pointer"
              @click="selectedGroup = group.key"
            >
              <UBadge
                :color="selectedGroup === group.key ? 'primary' : 'gray'"
                :variant="selectedGroup === group.key ? 'solid' : 'outline'"
                size="md"
                >{{ group.label }} ({{ groupCounts[group.key] || 0 }})</UBadge
              >
            </button>
          </div>

          <!-- Active group insight -->
          <div
            v-if="activeGroupInsight"
            class="max-w-2xl mx-auto text-center space-y-2"
          >
            <p
              class="text-sm leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
            >
              {{ activeGroupInsight }}
            </p>
            <NuxtLink
              :to="`/vocab/types/${selectedGroup}`"
              class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Read the full grammar guide
              <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>
          </div>

          <!-- Results -->
          <p
            class="text-xs text-center text-stone-400 dark:text-stone-500 font-sans"
          >
            Showing {{ Math.min(visibleCount, filteredVocab.length) }} of
            {{ filteredVocab.length }} words
          </p>

          <div
            v-if="filteredVocab.length === 0"
            class="text-center text-sm text-stone-500 dark:text-stone-400 py-8"
          >
            No words match "{{ searchQuery }}".
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <div
              v-for="item in displayedVocab"
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
            v-if="visibleCount < filteredVocab.length"
            class="flex justify-center pt-2"
          >
            <UButton
              label="Show More"
              color="gray"
              variant="outline"
              size="md"
              data-testid="vocab-show-more"
              @click="visibleCount += PAGE_SIZE"
            />
          </div>
        </section>
      </template>

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
          Every round of the daily game draws five vocabulary questions from
          this same pool.
        </p>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <UButton
            data-testid="vocab-game-cta"
            label="Play Today's Game"
            to="/game"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
          <UButton
            label="Learn the Kana"
            to="/kana"
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
          Vocabulary from
          <a
            href="https://github.com/elzup/jlpt-word-list"
            target="_blank"
            rel="noopener"
            class="underline hover:text-primary-500"
            >elzup/jlpt-word-list</a
          >
          (MIT), cross-referenced against JMdict (EDRDG, CC BY-SA 4.0) —
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
import { ref, computed, watch, onMounted } from "vue";
import AppHeader from "../../components/AppHeader.vue";
import { useN5VocabPool } from "../../composables/useN5VocabPool";
import {
  WORD_CLUSTERS,
  WORD_TYPE_GROUPS,
  classifyPartOfSpeech,
} from "../../data/vocab-guide";
import type { N5Vocab } from "~~/types/index";

const PAGE_SIZE = 60;

const wordTypeGroups = WORD_TYPE_GROUPS;
const visibleClusters = WORD_CLUSTERS;

const { vocabPool, loading, error, fetchVocab } = useN5VocabPool();

const searchQuery = ref("");
const selectedGroup = ref<string>("all");
const visibleCount = ref(PAGE_SIZE);

const vocabByTerm = computed(() => {
  const map = new Map<string, N5Vocab>();
  for (const item of vocabPool.value) {
    if (!map.has(item.term)) map.set(item.term, item);
  }
  return map;
});

function findVocab(term: string): N5Vocab | undefined {
  return vocabByTerm.value.get(term);
}

const groupCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const item of vocabPool.value) {
    const key = classifyPartOfSpeech(item.partOfSpeech, item.term);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
});

const activeGroupInsight = computed(() => {
  if (selectedGroup.value === "all") return "";
  return (
    wordTypeGroups.find((g) => g.key === selectedGroup.value)?.insight ?? ""
  );
});

const filteredVocab = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return vocabPool.value.filter((item) => {
    if (
      selectedGroup.value !== "all" &&
      classifyPartOfSpeech(item.partOfSpeech, item.term) !== selectedGroup.value
    ) {
      return false;
    }
    if (!query) return true;
    return (
      item.term.includes(query) ||
      item.kana.includes(query) ||
      item.romaji.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query)
    );
  });
});

const displayedVocab = computed(() =>
  filteredVocab.value.slice(0, visibleCount.value),
);

watch([searchQuery, selectedGroup], () => {
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
  name: "VocabPage",
});

defineExpose({
  fetchVocab,
  vocabPool,
});
</script>
