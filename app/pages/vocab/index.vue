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
          The Vocabulary Guide
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          {{ level }} Vocabulary
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          The reference shelf: search any of the {{ level }} words in the daily
          game's pool, filter by word type, and read how each type behaves in a
          sentence.
          <template v-if="lessonSet"
            >Every word links to the lesson that teaches it.</template
          >
        </p>
        <div class="flex items-center gap-2" data-testid="vocab-level-select">
          <span class="kicker text-stone-400 dark:text-stone-500"
            >JLPT Level</span
          >
          <UButton
            v-for="lvl in JLPT_LEVELS"
            :key="lvl"
            :label="lvl"
            :data-testid="`vocab-level-option-${lvl}`"
            size="xs"
            :color="lvl === level ? 'primary' : 'secondary'"
            :variant="lvl === level ? 'solid' : 'outline'"
            :disabled="loading"
            @click="selectLevel(lvl)"
          />
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="mt-10 season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-6 text-center space-y-3"
      >
        <p class="text-sm text-error-600 dark:text-error-400 font-medium">
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
        <!-- Lesson path CTA (only for levels with a hand-authored lesson path) -->
        <NuxtLink
          v-if="lessonSet"
          :to="`/learn?level=${level}`"
          class="group mt-10 block season-box border border-primary-500/30 bg-primary-500/5 p-5 sm:p-6 hover:border-primary-500/60 transition-colors"
          data-testid="vocab-learn-cta"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="space-y-1 max-w-xl">
              <p class="kicker text-primary-600 dark:text-primary-400">
                Learning rather than looking up?
              </p>
              <p
                class="font-serif text-xl font-bold text-stone-900 dark:text-white"
              >
                Follow the lesson path — {{ lessonSet.lessons.length }} short
                lessons, every {{ level }} word
              </p>
              <p class="text-sm text-stone-600 dark:text-stone-400">
                Words in a sensible order, each broken into its kanji, with flip
                cards to review them before you move on.
              </p>
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-6 h-6 text-primary-500 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </NuxtLink>
        <p
          v-else
          class="mt-10 text-sm text-stone-500 dark:text-stone-400 text-center"
        >
          {{ level }} doesn't have a lesson path yet — browse the pool below.
        </p>

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
              class="w-full season-chip border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
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
              :to="`/vocab/types/${selectedGroup}?level=${level}`"
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
            <OmamoriCharm
              v-for="(item, itemIndex) in displayedVocab"
              :key="item.id"
              :index="itemIndex % PAGE_SIZE"
              size="sm"
            >
              <div class="space-y-1">
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
                <NuxtLink
                  v-if="lessonFor(item.id)"
                  :to="`/learn/${lessonFor(item.id)}?level=${level}`"
                  class="inline-block text-[10px] font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  data-testid="vocab-word-lesson"
                  >Lesson {{ lessonFor(item.id) }} →</NuxtLink
                >
              </div>
            </OmamoriCharm>
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
import { useRoute } from "#app";
import AppHeader from "../../components/AppHeader.vue";
import OmamoriCharm from "../../components/OmamoriCharm.vue";
import { usePoolVocab } from "../../composables/usePoolVocab";
import { classifyPartOfSpeech } from "../../data/vocab-guide";
import { LESSON_SETS, WORD_TYPE_GROUPS } from "../../data/lesson-sets";
import { DEFAULT_JLPT_LEVEL, JLPT_LEVELS, isJlptLevel } from "~~/shared/jlpt";
import type { JlptLevel } from "~~/types/index";

const PAGE_SIZE = 60;

const wordTypeGroups = WORD_TYPE_GROUPS;

const { vocabPool, loading, error, fetchVocab } = usePoolVocab();

const route = useRoute();
const initialLevel = route.query.level;
/** Which JLPT level's pool is shown — N5 by default. Switching it refetches
 *  for that level; only N5/N4 currently have a lesson path (lessonSet). */
const level = ref<JlptLevel>(
  isJlptLevel(initialLevel) ? initialLevel : DEFAULT_JLPT_LEVEL,
);
const lessonSet = computed(() => LESSON_SETS[level.value]);
const lessonFor = (id: string) => lessonSet.value?.lessonNumberByWord.get(id);

function selectLevel(newLevel: JlptLevel): void {
  if (newLevel === level.value || loading.value) return;
  level.value = newLevel;
  void fetchVocab(newLevel);
}

const searchQuery = ref("");
const selectedGroup = ref<string>("all");
const visibleCount = ref(PAGE_SIZE);

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

onMounted(() => fetchVocab(level.value));

defineOptions({
  name: "VocabPage",
});

defineExpose({
  fetchVocab,
  vocabPool,
  level,
  selectLevel,
});
</script>
