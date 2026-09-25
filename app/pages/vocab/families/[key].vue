<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-3xl py-16 flex-1">
      <NuxtLink
        to="/vocab"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors mb-10"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        Back to N5 Vocabulary
      </NuxtLink>

      <template v-if="cluster">
        <div class="space-y-4">
          <div class="flex flex-wrap items-baseline gap-2">
            <UBadge color="secondary" variant="soft" size="sm">{{
              cluster.subtitle
            }}</UBadge>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
          >
            {{ cluster.title }}
          </h1>
          <div class="rule-double max-w-[120px]" />
          <p
            class="text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
          >
            {{ cluster.insight }}
          </p>
          <p
            v-if="cluster.extendedInsight"
            class="text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
          >
            {{ cluster.extendedInsight }}
          </p>
        </div>

        <!-- Word rows -->
        <div v-if="loading" class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <USkeleton v-for="i in 8" :key="i" class="h-20 rounded-sm" />
        </div>
        <div
          v-else
          class="mt-10 season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 sm:p-6 space-y-3"
        >
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
                <OmamoriCharm
                  v-if="findVocab(term)"
                  :index="rowIndex + termIndex"
                  size="sm"
                  class="text-center"
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
                </OmamoriCharm>
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

        <!-- Example sentences -->
        <section v-if="cluster.examples?.length" class="mt-10 space-y-4">
          <h2
            class="text-lg font-serif font-bold text-stone-900 dark:text-white"
          >
            In a Sentence
          </h2>
          <div
            v-for="(example, i) in cluster.examples"
            :key="i"
            class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 space-y-1"
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
          v-if="cluster.commonMistake"
          class="mt-10 season-box border border-warning-500/20 bg-warning-500/10 p-4 space-y-1.5"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-warning-700 dark:text-warning-400 font-sans font-medium"
          >
            Common Mistake
          </p>
          <p class="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            {{ cluster.commonMistake }}
          </p>
        </div>

        <!-- Prev / next topic -->
        <nav class="mt-12 flex items-center justify-between gap-4 text-sm">
          <NuxtLink
            v-if="prevCluster"
            :to="`/vocab/families/${prevCluster.key}`"
            class="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            {{ prevCluster.title }}
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="nextCluster"
            :to="`/vocab/families/${nextCluster.key}`"
            class="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors text-right"
          >
            {{ nextCluster.title }}
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
            That topic doesn't exist.
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
import { computed, onMounted } from "vue";
import { useRoute } from "#app";
import AppHeader from "../../../components/AppHeader.vue";
import OmamoriCharm from "../../../components/OmamoriCharm.vue";
import { useN5VocabPool } from "../../../composables/useN5VocabPool";
import { WORD_CLUSTERS } from "../../../data/vocab-guide";
import type { N5Vocab } from "~~/types/index";

const route = useRoute();
const clusterKey = computed(() => String(route.params.key ?? ""));
const clusterIndex = computed(() =>
  WORD_CLUSTERS.findIndex((c) => c.key === clusterKey.value),
);
const cluster = computed(() =>
  clusterIndex.value === -1 ? undefined : WORD_CLUSTERS[clusterIndex.value],
);
const prevCluster = computed(() =>
  clusterIndex.value > 0 ? WORD_CLUSTERS[clusterIndex.value - 1] : undefined,
);
const nextCluster = computed(() =>
  clusterIndex.value !== -1 && clusterIndex.value < WORD_CLUSTERS.length - 1
    ? WORD_CLUSTERS[clusterIndex.value + 1]
    : undefined,
);

const { vocabPool, loading, fetchVocab } = useN5VocabPool();

const vocabById = computed(() => {
  const map = new Map<string, N5Vocab>();
  for (const item of vocabPool.value) {
    map.set(item.id, item);
  }
  return map;
});

function findVocab(id: string): N5Vocab | undefined {
  return vocabById.value.get(id);
}

onMounted(fetchVocab);

defineOptions({
  name: "VocabFamilyPage",
});

defineExpose({
  fetchVocab,
  vocabPool,
});
</script>
