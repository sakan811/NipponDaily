<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <!-- Intro -->
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">
          The N5 Lesson Path
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Learn Every N5 Word, One Short Lesson at a Time
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          {{ lessons.length }} lessons cover all {{ totalWords }} N5 words, in
          an order where each one builds on the last. Every lesson is under a
          dozen words, breaks each word into the kanji it's written with, and
          ends with a quick practice round.
        </p>
      </div>

      <!-- Progress + continue -->
      <div
        class="mt-10 season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 sm:p-6 space-y-4"
        data-testid="learn-progress"
      >
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="kicker text-stone-400 dark:text-stone-500">
              Your progress
            </p>
            <p
              class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
            >
              {{ completedCount }} / {{ lessons.length }} lessons ·
              {{ learnedWords }} / {{ totalWords }} words
            </p>
          </div>
          <UButton
            data-testid="learn-continue"
            :label="continueLabel"
            :to="`/learn/${continueNumber}`"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          />
        </div>
        <div
          class="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden"
          role="progressbar"
          :aria-valuenow="completedCount"
          aria-valuemin="0"
          :aria-valuemax="lessons.length"
        >
          <div
            class="h-full bg-primary-500 transition-all"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <p class="text-xs text-stone-500 dark:text-stone-400">
          Progress is saved in this browser only — finish a lesson's practice
          round with {{ passPercent }}% or more to tick it off.
        </p>
      </div>

      <!-- How a lesson works -->
      <section class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="season-box border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4 space-y-1.5"
        >
          <p class="kicker text-primary-600 dark:text-primary-400">
            Step {{ i + 1 }}
          </p>
          <p class="font-serif font-bold text-stone-900 dark:text-white">
            {{ step.title }}
          </p>
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ step.body }}
          </p>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- Stages -->
      <section class="space-y-14">
        <div
          v-for="(stage, stageIndex) in stages"
          :key="stage.key"
          class="space-y-5"
          :data-testid="`learn-stage-${stage.key}`"
        >
          <div class="flex flex-wrap items-baseline gap-3">
            <UBadge color="secondary" variant="soft" size="sm"
              >Stage {{ stageIndex + 1 }} · {{ stage.jp }}</UBadge
            >
            <h2
              class="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white"
            >
              {{ stage.title }}
            </h2>
            <span class="text-xs text-stone-400 dark:text-stone-500">
              {{ stageDone(stage.key) }} / {{ stageLessons(stage.key).length }}
              done
            </span>
          </div>
          <p
            class="text-sm text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            {{ stage.description }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="lesson in stageLessons(stage.key)"
              :key="lesson.number"
              :to="`/learn/${lesson.number}`"
              class="group season-box border bg-white dark:bg-stone-900/50 p-4 flex items-start gap-3 transition-colors"
              :class="
                isCompleted(lesson.number)
                  ? 'border-success-500/40'
                  : lesson.number === continueNumber
                    ? 'border-primary-500/60'
                    : 'border-stone-300 dark:border-stone-800 hover:border-primary-500/40'
              "
              :data-testid="`learn-lesson-${lesson.number}`"
            >
              <span
                class="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-sm font-mono font-bold"
                :class="
                  isCompleted(lesson.number)
                    ? 'bg-success-500/15 text-success-600 dark:text-success-400'
                    : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                "
              >
                <UIcon
                  v-if="isCompleted(lesson.number)"
                  name="i-heroicons-check-circle"
                  class="w-5 h-5"
                />
                <template v-else>{{ lesson.number }}</template>
              </span>
              <span class="min-w-0 space-y-0.5">
                <span
                  class="block font-serif font-bold text-stone-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {{ lessonTitle(lesson) }}
                </span>
                <span class="block text-xs text-stone-500 dark:text-stone-400">
                  {{ lesson.wordIds.length }} words ·
                  {{ lessonPreview(lesson) }}
                </span>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <div class="rule-double my-16" />

      <!-- Kanji index -->
      <section class="space-y-6" data-testid="learn-kanji-index">
        <div class="text-center max-w-lg mx-auto space-y-3">
          <h2
            class="text-3xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Every Kanji on the Path
          </h2>
          <div class="rule-double max-w-[120px] mx-auto" />
          <p class="text-sm text-stone-500 dark:text-stone-400 font-sans">
            The {{ kanjiOrder.length }} kanji used across N5 vocabulary, in the
            order you'll meet them. Learn a character's meaning once and you'll
            recognise it in every word that reuses it — tap one to jump to the
            lesson that introduces it.
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="[char, lessonNumber] in kanjiOrder"
            :key="char"
            :to="`/learn/${lessonNumber}`"
            class="season-chip border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/50 px-2.5 py-1.5 text-center hover:border-primary-500/50 transition-colors"
            :title="kanjiTitle(char, lessonNumber)"
          >
            <span
              class="block font-serif text-xl text-stone-900 dark:text-white leading-none"
              >{{ char }}</span
            >
            <span
              v-if="kanjiByChar.get(char)"
              class="block text-[10px] text-stone-500 dark:text-stone-400 max-w-[5rem] truncate mt-1"
              >{{ kanjiByChar.get(char)!.meanings[0] }}</span
            >
          </NuxtLink>
        </div>
      </section>

      <div class="rule-double my-16" />

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
          label="Browse All Words"
          to="/vocab"
          color="gray"
          variant="ghost"
          size="md"
        />
        <UButton
          label="Learn the Kana"
          to="/kana"
          color="gray"
          variant="ghost"
          size="md"
        />
      </div>
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
          (MIT); JMdict &amp; KANJIDIC2 (EDRDG, CC BY-SA 4.0) —
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
import { computed, onMounted } from "vue";
import AppHeader from "../../components/AppHeader.vue";
import { useLessonProgress } from "../../composables/useLessonProgress";
import { useN5KanjiPool } from "../../composables/useN5KanjiPool";
import {
  FIRST_LESSON_BY_KANJI,
  LESSONS,
  LESSON_STAGES,
  type Lesson,
} from "../../data/lessons";
import type { N5Kanji } from "~~/types/index";

const lessons = LESSONS;
const stages = LESSON_STAGES;
const totalWords = LESSONS.reduce((sum, l) => sum + l.wordIds.length, 0);
const passPercent = 80;
const kanjiOrder = [...FIRST_LESSON_BY_KANJI.entries()];

const steps = [
  {
    title: "Read the pattern",
    body: "A short note on how the lesson's words fit together — the grammar or grouping that makes them easier to remember as a set.",
  },
  {
    title: "Learn words & their kanji",
    body: "Each word shows its reading, every meaning, and the kanji inside it — so 日 learnt once pays off in 日曜日, 毎日 and 明日.",
  },
  {
    title: "Practise",
    body: "A quick quiz both ways (word → meaning, meaning → word). Pass it and the lesson is ticked off; then press Next.",
  },
];

const { completedCount, completed, load, isCompleted, nextLessonNumber } =
  useLessonProgress();
const { kanjiPool, fetchKanji } = useN5KanjiPool();

const kanjiByChar = computed(() => {
  const map = new Map<string, N5Kanji>();
  for (const k of kanjiPool.value) map.set(k.character, k);
  return map;
});

const continueNumber = computed(
  () => nextLessonNumber(lessons.length) ?? lessons.length,
);
const continueLabel = computed(() => {
  if (completedCount.value === 0) return "Start Lesson 1";
  if (nextLessonNumber(lessons.length) === null)
    return "Review the Last Lesson";
  return `Continue with Lesson ${continueNumber.value}`;
});
const learnedWords = computed(() =>
  lessons
    .filter((l) => completed.value.has(l.number))
    .reduce((sum, l) => sum + l.wordIds.length, 0),
);
const progressPercent = computed(() =>
  Math.round((completedCount.value / lessons.length) * 100),
);

function stageLessons(stageKey: string): Lesson[] {
  return lessons.filter((l) => l.stageKey === stageKey);
}

function stageDone(stageKey: string): number {
  return stageLessons(stageKey).filter((l) => isCompleted(l.number)).length;
}

function lessonTitle(lesson: Lesson): string {
  return lesson.partCount > 1
    ? `${lesson.title} (${lesson.part}/${lesson.partCount})`
    : lesson.title;
}

/** A glimpse of the lesson's first few words, from their ids. */
function lessonPreview(lesson: Lesson): string {
  return lesson.wordIds
    .slice(0, 4)
    .map((id) => id.replace(/-\d+$/, ""))
    .join("・");
}

function kanjiTitle(char: string, lessonNumber: number): string {
  const kanji = kanjiByChar.value.get(char);
  const meaning = kanji ? `${kanji.meanings.slice(0, 3).join(", ")} — ` : "";
  return `${char}: ${meaning}introduced in Lesson ${lessonNumber}`;
}

onMounted(() => {
  load();
  fetchKanji();
});

defineOptions({
  name: "LearnPage",
});
</script>
