<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-3xl py-12 flex-1">
      <NuxtLink
        to="/learn"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-primary-500 transition-colors mb-8"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        All lessons
      </NuxtLink>

      <template v-if="lesson">
        <!-- Header -->
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="secondary" variant="soft" size="sm"
              >Stage {{ stageNumber }} · {{ stage?.title }}</UBadge
            >
            <UBadge
              v-if="done"
              color="success"
              variant="soft"
              size="sm"
              data-testid="lesson-done-badge"
              >Completed</UBadge
            >
          </div>
          <p class="kicker text-primary-600 dark:text-primary-400">
            Lesson {{ lesson.number }} of {{ totalLessons }}
            <template v-if="lesson.partCount > 1">
              · Part {{ lesson.part }} of {{ lesson.partCount }}</template
            >
          </p>
          <h1
            class="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
          >
            {{ lesson.title }}
          </h1>
          <div
            class="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden"
            aria-hidden="true"
          >
            <div
              class="h-full bg-primary-500"
              :style="{ width: `${(lesson.number / totalLessons) * 100}%` }"
            />
          </div>
        </div>

        <!-- Step 1: the pattern -->
        <section class="mt-10 space-y-3">
          <h2 class="step-heading">
            <span class="step-num">1</span> The Pattern
          </h2>
          <p
            class="text-base leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
          >
            {{ lesson.insight }}
          </p>
          <p
            v-if="lesson.part === 1 && lesson.extendedInsight"
            class="text-sm leading-relaxed text-stone-500 dark:text-stone-400 font-body-serif"
          >
            {{ lesson.extendedInsight }}
          </p>
        </section>

        <!-- Step 2: the words -->
        <section class="mt-10 space-y-4">
          <h2 class="step-heading">
            <span class="step-num">2</span> The Words
            <span class="text-sm font-sans font-normal text-stone-400"
              >({{ lesson.wordIds.length }})</span
            >
          </h2>

          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <USkeleton v-for="i in 6" :key="i" class="h-28 rounded-sm" />
          </div>
          <div
            v-else-if="error"
            class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 text-center space-y-3"
          >
            <p class="text-sm text-error-600 dark:text-error-400">
              {{ error }}
            </p>
            <UButton
              label="Try Again"
              color="primary"
              size="sm"
              icon="i-heroicons-arrow-path"
              @click="fetchVocab"
            />
          </div>
          <template v-else>
            <div
              v-for="(row, rowIndex) in lesson.rows"
              :key="rowIndex"
              class="space-y-2"
            >
              <p
                v-if="row.label"
                class="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-sans"
              >
                {{ row.label }}
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="word in rowWords(row.terms)"
                  :key="word.id"
                  class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 space-y-2"
                  data-testid="lesson-word"
                >
                  <div class="flex items-baseline justify-between gap-2">
                    <p
                      class="font-serif text-2xl text-stone-900 dark:text-white leading-tight"
                    >
                      {{ word.term }}
                    </p>
                    <p
                      class="text-xs text-stone-500 dark:text-stone-400 text-right"
                    >
                      <span v-if="word.kana !== word.term"
                        >{{ word.kana }} · </span
                      >{{ word.romaji }}
                    </p>
                  </div>
                  <p
                    class="text-sm text-stone-700 dark:text-stone-300 leading-snug"
                  >
                    {{ word.meaning }}
                  </p>
                  <div
                    v-if="kanjiInTerm(word.term).length"
                    class="flex flex-wrap gap-1.5 pt-1"
                  >
                    <span
                      v-for="char in kanjiInTerm(word.term)"
                      :key="char"
                      class="season-chip inline-flex items-baseline gap-1 border border-primary-500/20 bg-primary-500/5 px-2 py-0.5 text-xs"
                      data-testid="lesson-word-kanji"
                    >
                      <span
                        class="font-serif text-sm text-primary-700 dark:text-primary-300"
                        >{{ char }}</span
                      >
                      <span class="text-stone-600 dark:text-stone-400">{{
                        shortKanjiMeaning(char)
                      }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </section>

        <!-- Step 3: kanji spotlight -->
        <section
          v-if="lessonKanji.length"
          class="mt-10 space-y-4"
          data-testid="lesson-kanji"
        >
          <h2 class="step-heading">
            <span class="step-num">3</span> Kanji Spotlight
          </h2>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            The characters inside this lesson's words. Each one keeps its
            meaning wherever it shows up — here's where else you'll meet it.
          </p>
          <div class="space-y-3">
            <div
              v-for="char in lessonKanji"
              :key="char"
              class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 flex gap-4"
            >
              <div class="shrink-0 text-center space-y-1">
                <p
                  class="font-serif text-5xl text-stone-900 dark:text-white leading-none"
                >
                  {{ char }}
                </p>
                <UBadge
                  v-if="firstLesson(char) === lesson.number"
                  color="primary"
                  variant="soft"
                  size="xs"
                  >New</UBadge
                >
                <NuxtLink
                  v-else-if="firstLesson(char)"
                  :to="`/learn/${firstLesson(char)}`"
                  class="block text-[10px] text-stone-400 hover:text-primary-500"
                  >from L{{ firstLesson(char) }}</NuxtLink
                >
              </div>
              <div class="min-w-0 space-y-1.5">
                <template v-if="kanjiByChar.get(char)">
                  <p
                    class="text-sm font-medium text-stone-800 dark:text-stone-200"
                  >
                    {{ kanjiMeaningList(char) }}
                  </p>
                  <p class="text-xs text-stone-500 dark:text-stone-400">
                    <span v-if="kanjiByChar.get(char)!.onyomi.length"
                      >音
                      {{
                        kanjiByChar.get(char)!.onyomi.slice(0, 3).join("、")
                      }}</span
                    >
                    <span
                      v-if="
                        kanjiByChar.get(char)!.onyomi.length &&
                        kanjiByChar.get(char)!.kunyomi.length
                      "
                    >
                      ·
                    </span>
                    <span v-if="kanjiByChar.get(char)!.kunyomi.length"
                      >訓
                      {{
                        kanjiByChar.get(char)!.kunyomi.slice(0, 3).join("、")
                      }}</span
                    >
                  </p>
                </template>
                <div
                  v-if="otherWordsWith(char).length"
                  class="flex flex-wrap gap-1.5 pt-1"
                >
                  <span class="text-[11px] text-stone-400 self-center"
                    >Also in:</span
                  >
                  <NuxtLink
                    v-for="other in otherWordsWith(char)"
                    :key="other.id"
                    :to="`/learn/${lessonOf(other.id)}`"
                    class="season-chip border border-stone-300 dark:border-stone-700 px-2 py-0.5 text-xs hover:border-primary-500/50 transition-colors"
                    :title="`${other.kana} — ${other.meaning} (Lesson ${lessonOf(other.id)})`"
                  >
                    <span class="font-serif">{{ other.term }}</span>
                    <span class="text-stone-500 dark:text-stone-400">
                      {{ shortMeaning(other.meaning) }}</span
                    >
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Step 4: in context -->
        <section
          v-if="lesson.examples?.length || lesson.commonMistake"
          class="mt-10 space-y-4"
        >
          <h2 class="step-heading">
            <span class="step-num">{{ lessonKanji.length ? 4 : 3 }}</span> In a
            Sentence
          </h2>
          <div
            v-for="(example, i) in lesson.examples"
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
          <div
            v-if="lesson.commonMistake"
            class="season-box border border-warning-500/20 bg-warning-500/10 p-4 space-y-1.5"
          >
            <p
              class="text-[11px] uppercase tracking-wide text-warning-700 dark:text-warning-400 font-sans font-medium"
            >
              Common Mistake
            </p>
            <p
              class="text-sm leading-relaxed text-stone-700 dark:text-stone-300"
            >
              {{ lesson.commonMistake }}
            </p>
          </div>
        </section>

        <!-- Practice -->
        <section class="mt-12 space-y-4" data-testid="lesson-practice">
          <h2 class="step-heading"><span class="step-num">✓</span> Practice</h2>
          <div
            class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 sm:p-6"
          >
            <LessonQuiz
              v-if="lessonWords.length"
              :words="lessonWords"
              :pool="vocabPool"
              @finished="onQuizFinished"
            />
            <p v-else class="text-sm text-center text-stone-500">
              The practice round appears once the words have loaded.
            </p>
          </div>
          <div class="flex justify-center">
            <button
              type="button"
              class="text-xs text-stone-400 hover:text-primary-500 underline cursor-pointer"
              data-testid="lesson-toggle-complete"
              @click="toggleDone"
            >
              {{
                done
                  ? "Mark as not complete"
                  : "Mark as complete without practising"
              }}
            </button>
          </div>
        </section>

        <!-- Prev / next -->
        <nav class="mt-12 flex items-center justify-between gap-4">
          <UButton
            v-if="prevLesson"
            :label="`Lesson ${prevLesson.number}`"
            :to="`/learn/${prevLesson.number}`"
            color="gray"
            variant="ghost"
            size="md"
            icon="i-heroicons-arrow-left"
          />
          <span v-else />
          <UButton
            v-if="nextLesson"
            data-testid="lesson-next"
            :label="`Next: Lesson ${nextLesson.number}`"
            :to="`/learn/${nextLesson.number}`"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
          <UButton
            v-else
            label="Path complete — play today's game"
            to="/game"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
        </nav>
      </template>

      <template v-else>
        <div class="text-center py-16 space-y-4">
          <p class="text-lg text-stone-600 dark:text-stone-400">
            That lesson doesn't exist.
          </p>
          <UButton
            label="Back to the Lesson Path"
            to="/learn"
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
          (MIT); JMdict &amp; KANJIDIC2 (EDRDG, CC BY-SA 4.0)
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "#app";
import AppHeader from "../../components/AppHeader.vue";
import LessonQuiz from "../../components/LessonQuiz.vue";
import { useN5VocabPool } from "../../composables/useN5VocabPool";
import { useN5KanjiPool } from "../../composables/useN5KanjiPool";
import { useLessonProgress } from "../../composables/useLessonProgress";
import {
  FIRST_LESSON_BY_KANJI,
  LESSONS,
  LESSON_NUMBER_BY_WORD,
  LESSON_STAGES,
  getLesson,
  kanjiInTerm,
} from "../../data/lessons";
import { kanjiMeaningLabel } from "~~/shared/meanings";
import type { N5Kanji, N5Vocab } from "~~/types/index";

/** How many other words a kanji's "Also in" row lists. */
const ALSO_IN_LIMIT = 6;

const route = useRoute();
const lessonNumber = computed(() => Number(route.params.lesson ?? NaN));
const lesson = computed(() => getLesson(lessonNumber.value));
const totalLessons = LESSONS.length;
const stage = computed(() =>
  LESSON_STAGES.find((s) => s.key === lesson.value?.stageKey),
);
const stageNumber = computed(
  () => LESSON_STAGES.findIndex((s) => s.key === lesson.value?.stageKey) + 1,
);
const prevLesson = computed(() =>
  lesson.value ? getLesson(lesson.value.number - 1) : undefined,
);
const nextLesson = computed(() =>
  lesson.value ? getLesson(lesson.value.number + 1) : undefined,
);

const { vocabPool, loading, error, fetchVocab } = useN5VocabPool();
const { kanjiPool, fetchKanji } = useN5KanjiPool();
const { load, isCompleted, markCompleted, markIncomplete } =
  useLessonProgress();

const done = computed(() =>
  lesson.value ? isCompleted(lesson.value.number) : false,
);

const vocabById = computed(() => {
  const map = new Map<string, N5Vocab>();
  for (const item of vocabPool.value) map.set(item.id, item);
  return map;
});

const kanjiByChar = computed(() => {
  const map = new Map<string, N5Kanji>();
  for (const k of kanjiPool.value) map.set(k.character, k);
  return map;
});

/** kanji -> every pool word containing it, in lesson-path order. */
const wordsByKanji = computed(() => {
  const map = new Map<string, N5Vocab[]>();
  const ordered = [...vocabPool.value].sort(
    (a, b) => lessonOf(a.id) - lessonOf(b.id),
  );
  for (const word of ordered) {
    for (const char of kanjiInTerm(word.term)) {
      const list = map.get(char) ?? [];
      list.push(word);
      map.set(char, list);
    }
  }
  return map;
});

function rowWords(ids: string[]): N5Vocab[] {
  return ids
    .map((id) => vocabById.value.get(id))
    .filter((w): w is N5Vocab => w !== undefined);
}

const lessonWords = computed(() =>
  lesson.value ? rowWords(lesson.value.wordIds) : [],
);

const lessonKanji = computed(() => {
  if (!lesson.value) return [];
  const chars = new Set<string>();
  for (const id of lesson.value.wordIds) {
    for (const char of kanjiInTerm(id)) chars.add(char);
  }
  return [...chars];
});

function lessonOf(id: string): number {
  return LESSON_NUMBER_BY_WORD.get(id) ?? Number.MAX_SAFE_INTEGER;
}

function firstLesson(char: string): number | undefined {
  return FIRST_LESSON_BY_KANJI.get(char);
}

function kanjiMeaningList(char: string): string {
  return kanjiMeaningLabel(kanjiByChar.value.get(char)?.meanings ?? [], 5);
}

function shortKanjiMeaning(char: string): string {
  return kanjiMeaningLabel(kanjiByChar.value.get(char)?.meanings ?? [], 2);
}

/** The first sense of a gloss, for compact chips. */
function shortMeaning(meaning: string): string {
  return meaning.split(/[;,]/)[0]!.trim();
}

function otherWordsWith(char: string): N5Vocab[] {
  const inLesson = new Set(lesson.value?.wordIds ?? []);
  return (wordsByKanji.value.get(char) ?? [])
    .filter((w) => !inLesson.has(w.id))
    .slice(0, ALSO_IN_LIMIT);
}

function onQuizFinished(result: { passed: boolean }): void {
  if (result.passed && lesson.value) markCompleted(lesson.value.number);
}

function toggleDone(): void {
  if (!lesson.value) return;
  if (done.value) markIncomplete(lesson.value.number);
  else markCompleted(lesson.value.number);
}

onMounted(() => {
  load();
  fetchVocab();
  fetchKanji();
});

defineOptions({
  name: "LessonPage",
});

defineExpose({
  fetchVocab,
  fetchKanji,
  vocabPool,
  kanjiPool,
});
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.step-heading {
  @apply flex items-center gap-2.5 text-xl font-serif font-bold text-stone-900 dark:text-white;
}

.step-num {
  @apply inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-mono;
}
</style>
