<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader v-model:open="mobileMenuOpen" />

    <main
      class="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl"
    >
      <div class="space-y-6">
        <div class="space-y-3">
          <p class="kicker text-primary-600 dark:text-primary-400">
            Today's Round
          </p>
          <div class="rule-double max-w-[120px]" />
          <div class="flex items-center gap-2" data-testid="game-level-select">
            <span class="kicker text-stone-400 dark:text-stone-500"
              >JLPT Level</span
            >
            <UButton
              v-for="lvl in GAME_LEVELS"
              :key="lvl"
              :label="lvl"
              :data-testid="`level-option-${lvl}`"
              size="xs"
              :color="lvl === level ? 'primary' : 'secondary'"
              :variant="lvl === level ? 'solid' : 'outline'"
              :disabled="loading"
              @click="selectLevel(lvl)"
            />
          </div>
        </div>

        <!-- Failed fetch fallback -->
        <TrendingFallback
          v-if="error"
          :error="error"
          :loading="loading"
          class="mb-8"
          @retry="fetchGame"
        />

        <div v-else-if="loading" class="space-y-6">
          <UCard
            class="w-full relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-0.75 before:bg-linear-to-r before:from-transparent before:via-primary-500 before:to-transparent"
          >
            <div class="p-4 sm:p-6 space-y-6">
              <USkeleton class="h-6 w-32 mb-3 rounded-sm" />
              <USkeleton class="h-16 w-3/4 mx-auto rounded-sm" />
              <div class="grid grid-cols-2 gap-3">
                <USkeleton class="h-12 rounded-sm" />
                <USkeleton class="h-12 rounded-sm" />
                <USkeleton class="h-12 rounded-sm" />
                <USkeleton class="h-12 rounded-sm" />
              </div>
            </div>
          </UCard>
        </div>

        <template v-else-if="questions.length > 0">
          <!-- Vocabulary preview, shown before the round starts -->
          <div v-if="!started" class="space-y-6">
            <UCard class="w-full">
              <div class="p-4 sm:p-6 space-y-4">
                <p class="kicker text-secondary-500">Today's Vocabulary</p>
                <p class="text-sm text-stone-500 dark:text-stone-400">
                  These {{ vocabToStudy.length }} words appear in today's round
                  — review them first, or dive straight in.
                </p>
                <div
                  class="grid gap-2 sm:grid-cols-2"
                  data-testid="game-vocab-preview"
                >
                  <NuxtLink
                    v-for="item in vocabToStudy"
                    :key="item.id"
                    :to="`/learn/${item.lesson}?level=${item.level}`"
                    class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-2 flex items-center justify-between gap-2 hover:border-primary-500/50 transition-colors"
                  >
                    <span>
                      <span
                        class="font-serif text-lg text-stone-900 dark:text-white"
                        >{{ item.term }}</span
                      >
                      <span
                        v-if="item.kana"
                        class="text-xs text-stone-500 dark:text-stone-400 ml-1"
                        >{{ item.kana }}</span
                      >
                      <span
                        class="block text-xs text-stone-500 dark:text-stone-400"
                        >{{ item.meaning }}</span
                      >
                    </span>
                    <span class="kicker text-primary-500 whitespace-nowrap"
                      >Lesson {{ item.lesson }}</span
                    >
                  </NuxtLink>
                </div>
              </div>
            </UCard>
            <div class="text-center">
              <UButton
                label="Start Round"
                color="primary"
                size="lg"
                icon="i-heroicons-play-circle"
                @click="startRound"
              />
            </div>
          </div>

          <template v-else>
            <!-- In-progress round -->
            <div v-if="!isFinished" class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="kicker text-secondary-500">
                  Question {{ currentIndex + 1 }} / {{ questions.length }}
                </p>
              </div>

              <!-- The prompt is written on an ema; it re-hangs for every
                 question, takes a 合格 seal when answered correctly and
                 rattles on its cord when not. -->
              <EmaPlaque
                :key="currentIndex"
                :shake="isAnswered && !isCorrect"
                class="max-w-md mx-auto"
              >
                <div class="space-y-4 text-center pb-2">
                  <UBadge color="secondary" variant="soft" size="xs">
                    {{ kindLabel(currentQuestion.kind) }}
                  </UBadge>

                  <div class="pt-2">
                    <ruby
                      v-if="currentQuestion.promptSub"
                      class="font-serif font-bold text-5xl sm:text-6xl text-stone-900 dark:text-white leading-none"
                    >
                      {{ currentQuestion.prompt }}
                      <rt
                        class="font-sans font-normal text-base sm:text-lg text-stone-600 dark:text-stone-400"
                        >{{ currentQuestion.promptSub }}</rt
                      >
                    </ruby>
                    <p
                      v-else
                      class="font-serif font-bold text-5xl sm:text-6xl text-stone-900 dark:text-white leading-none"
                    >
                      {{ currentQuestion.prompt }}
                    </p>
                  </div>
                </div>
                <template #stamp>
                  <HankoSeal v-if="isAnswered && isCorrect" />
                </template>
              </EmaPlaque>

              <div class="space-y-6 text-center">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <UButton
                    v-for="choice in currentQuestion.choices"
                    :key="choice"
                    :label="choice"
                    :color="choiceColor(choice)"
                    :variant="choiceVariant(choice)"
                    size="lg"
                    block
                    class="justify-center"
                    :disabled="isAnswered"
                    @click="selectChoice(choice)"
                  />
                </div>

                <div v-if="isAnswered" class="pt-2">
                  <p
                    class="text-sm font-medium flex items-center justify-center gap-1.5"
                    :class="
                      isCorrect
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-error-600 dark:text-error-400'
                    "
                  >
                    <UIcon
                      :name="
                        isCorrect
                          ? 'i-heroicons-check-circle'
                          : 'i-heroicons-x-circle'
                      "
                      class="w-4 h-4"
                    />
                    {{
                      isCorrect
                        ? "Correct!"
                        : `Not quite — it's "${currentQuestion.correctAnswer}"`
                    }}
                  </p>
                  <UButton
                    label="Next"
                    color="primary"
                    size="md"
                    icon="i-heroicons-arrow-right"
                    trailing
                    class="mt-3"
                    @click="advance"
                  />
                </div>
              </div>
            </div>

            <!-- Round summary -->
            <div v-else class="space-y-6">
              <UCard
                class="w-full relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-0.75 before:bg-linear-to-r before:from-transparent before:via-primary-500 before:to-transparent"
              >
                <div class="p-4 sm:p-8 space-y-6 text-center">
                  <!-- A 学業守 (academic-success) omamori sways on its cord;
                     the seal says 合格 (passed) or 努力 (keep at it). -->
                  <div class="relative w-28 mx-auto">
                    <OmamoriCharm size="lg" idle>
                      <p
                        class="flex flex-col items-center gap-1.5 font-serif font-bold text-2xl leading-none text-primary-600 dark:text-primary-400"
                      >
                        <span>学</span><span>業</span><span>守</span>
                      </p>
                    </OmamoriCharm>
                    <HankoSeal
                      :text="passedRound ? '合格' : '努力'"
                      :label="passedRound ? 'Passed' : 'Keep practising'"
                      class="absolute -right-10 bottom-0 [animation-delay:0.7s]"
                    />
                  </div>
                  <h2
                    class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
                  >
                    Round Complete!
                  </h2>
                  <div class="flex justify-center gap-8 text-center">
                    <div>
                      <p
                        class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                      >
                        {{ totalCorrect }}/{{ totalAnswered }}
                      </p>
                      <p class="kicker text-stone-400">Correct</p>
                    </div>
                    <div>
                      <p
                        class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                      >
                        {{ accuracyPercent }}%
                      </p>
                      <p class="kicker text-stone-400">Accuracy</p>
                    </div>
                  </div>

                  <div class="rule-double max-w-[120px] mx-auto" />

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <OmamoriCharm
                      v-for="(kind, kindIndex) in presentKinds"
                      :key="kind"
                      :index="kindIndex + 2"
                      size="sm"
                    >
                      <div class="space-y-0.5">
                        <p
                          class="text-sm font-bold text-stone-900 dark:text-white"
                        >
                          {{ perKindStats[kind].correct }}/{{
                            perKindStats[kind].total
                          }}
                        </p>
                        <p class="kicker text-stone-500 dark:text-stone-400">
                          {{ kindLabel(kind) }}
                        </p>
                      </div>
                    </OmamoriCharm>
                  </div>

                  <div
                    v-if="vocabToStudy.length"
                    class="space-y-2 pt-2"
                    data-testid="game-vocab-review"
                  >
                    <p class="kicker text-stone-400 dark:text-stone-500">
                      Today's vocabulary
                    </p>
                    <div class="flex flex-wrap justify-center gap-2">
                      <NuxtLink
                        v-for="item in vocabToStudy"
                        :key="item.id"
                        :to="`/learn/${item.lesson}?level=${item.level}`"
                        class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1 text-xs text-stone-700 dark:text-stone-300 hover:border-primary-500/50 transition-colors"
                      >
                        <span class="font-serif text-sm">{{ item.term }}</span>
                        · Lesson {{ item.lesson }}
                      </NuxtLink>
                    </div>
                  </div>

                  <div
                    v-if="missedToStudy.length"
                    class="space-y-2 pt-2"
                    data-testid="game-missed-lessons"
                  >
                    <p class="kicker text-stone-400 dark:text-stone-500">
                      Brush up in the lessons
                    </p>
                    <div class="flex flex-wrap justify-center gap-2">
                      <NuxtLink
                        v-for="item in missedToStudy"
                        :key="`${item.kind}-${item.id}`"
                        :to="`/learn/${item.lesson}?level=${item.level}`"
                        class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1 text-xs text-stone-700 dark:text-stone-300 hover:border-primary-500/50 transition-colors"
                      >
                        <span class="font-serif text-sm">{{
                          item.prompt
                        }}</span>
                        · Lesson {{ item.lesson }}
                      </NuxtLink>
                    </div>
                  </div>

                  <UButton
                    label="Play Again"
                    color="primary"
                    size="lg"
                    icon="i-heroicons-arrow-path"
                    class="mt-2"
                    @click="restart"
                  />
                  <p class="text-xs text-stone-400 dark:text-stone-500">
                    Tomorrow brings a brand new set of questions.
                  </p>
                </div>
              </UCard>
            </div>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type {
  DailyGame,
  DailyGameLevel,
  GameQuestion,
  PoolKind,
} from "~~/types/index";
import { DEFAULT_JLPT_LEVEL, GAME_LEVELS, isJlptLevel } from "~~/shared/jlpt";

import AppHeader from "./AppHeader.vue";
import TrendingFallback from "./TrendingFallback.vue";
import EmaPlaque from "./EmaPlaque.vue";
import HankoSeal from "./HankoSeal.vue";
import OmamoriCharm from "./OmamoriCharm.vue";
import { LESSON_SETS } from "../data/lesson-sets";

const props = withDefaults(
  defineProps<{
    /** Fetch today's game on mount. Tests turn this off and call the
     *  exposed fetchGame() themselves with a mocked $fetch. */
    autoFetch?: boolean;
  }>(),
  { autoFetch: true },
);

const KIND_LABELS: Record<PoolKind, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
  kanji: "Kanji",
  vocab: "Vocabulary",
};
const kinds = Object.keys(KIND_LABELS) as PoolKind[];
const kindLabel = (kind: PoolKind) => KIND_LABELS[kind];

const dailyGame = ref<DailyGame | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);
const playIndex = ref(0);
/** Which JLPT level's pool today's round is drawn from — N5 by default.
 *  "ALL" draws from every level's pool merged together. Switching it
 *  refetches the game for that level and resets the round. */
const level = ref<DailyGameLevel>(DEFAULT_JLPT_LEVEL);
/** Gates the vocab preview screen — true once the player presses
 *  "Start Round". Reset to false only on a fresh fetch (a new day's game),
 *  not by restart(), so "Play Again" jumps straight back into play. */
const started = ref(false);

const currentIndex = ref(0);
const selectedChoice = ref<string | null>(null);
/** Kanji/vocab questions answered wrong this round — kept in component
 *  state only, to point at the lesson that teaches each one. */
const missed = ref<GameQuestion[]>([]);
const isAnswered = ref(false);
const perKindStats =
  ref<Record<PoolKind, { correct: number; total: number }>>(emptyStats());

function emptyStats(): Record<PoolKind, { correct: number; total: number }> {
  return {
    hiragana: { correct: 0, total: 0 },
    katakana: { correct: 0, total: 0 },
    kanji: { correct: 0, total: 0 },
    vocab: { correct: 0, total: 0 },
  };
}

/** Kinds actually present in today's round, in `kinds`' fixed order — N4+
 *  rounds have no hiragana/katakana questions (see server/utils/daily-game.ts's
 *  kindsForLevel), so the end-of-round summary shouldn't show empty 0/0
 *  tiles for kinds that were never asked. */
const presentKinds = computed(() =>
  kinds.filter((kind) => perKindStats.value[kind].total > 0),
);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = computed<GameQuestion[]>(() => {
  void playIndex.value;
  const raw = dailyGame.value?.questions ?? [];
  return shuffle(raw).map((q) => ({ ...q, choices: shuffle(q.choices) }));
});

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isFinished = computed(
  () =>
    questions.value.length > 0 && currentIndex.value >= questions.value.length,
);
const isCorrect = computed(
  () => selectedChoice.value === currentQuestion.value?.correctAnswer,
);
const totalAnswered = computed(() =>
  kinds.reduce((sum, k) => sum + perKindStats.value[k].total, 0),
);
const totalCorrect = computed(() =>
  kinds.reduce((sum, k) => sum + perKindStats.value[k].correct, 0),
);
const accuracyPercent = computed(() =>
  totalAnswered.value === 0
    ? 0
    : Math.round((totalCorrect.value / totalAnswered.value) * 100),
);
// Which seal the round-complete charm gets: 合格 (passed) or 努力 (effort).
const passedRound = computed(() => accuracyPercent.value >= 60);

function choiceColor(choice: string): string {
  if (!isAnswered.value) return "secondary";
  if (choice === currentQuestion.value.correctAnswer) return "success";
  if (choice === selectedChoice.value) return "error";
  return "secondary";
}

function choiceVariant(choice: string): string {
  if (!isAnswered.value) return "outline";
  return choice === currentQuestion.value.correctAnswer ||
    choice === selectedChoice.value
    ? "solid"
    : "outline";
}

function selectChoice(choice: string): void {
  if (isAnswered.value) return;
  selectedChoice.value = choice;
  isAnswered.value = true;

  const kind = currentQuestion.value.kind;
  const correct = choice === currentQuestion.value.correctAnswer;
  perKindStats.value[kind].total++;

  if (correct) {
    perKindStats.value[kind].correct++;
  } else {
    missed.value = [...missed.value, currentQuestion.value];
  }
}

function advance(): void {
  if (!isAnswered.value) return;
  currentIndex.value++;
  selectedChoice.value = null;
  isAnswered.value = false;
}

function restart(): void {
  playIndex.value++;
  currentIndex.value = 0;
  selectedChoice.value = null;
  isAnswered.value = false;
  perKindStats.value = emptyStats();
  missed.value = [];
}

function startRound(): void {
  started.value = true;
}

function selectLevel(newLevel: DailyGameLevel): void {
  if (newLevel === level.value || loading.value) return;
  level.value = newLevel;
  void fetchGame();
}

/** The lesson set for whichever level today's game was actually drawn from
 *  (not the level selector, in case they ever diverge). Only levels with a
 *  lesson path — every real level has one; ALL rounds simply get no
 *  lesson links. */
const gameLessonSet = computed(() => {
  const gameLevel = dailyGame.value?.level;
  return isJlptLevel(gameLevel) ? LESSON_SETS[gameLevel] : undefined;
});

const missedToStudy = computed(() =>
  missed.value.flatMap((q) => {
    const lessonSet = gameLessonSet.value;
    const lesson =
      q.kind === "vocab"
        ? lessonSet?.lessonNumberByWord.get(q.id)
        : q.kind === "kanji"
          ? lessonSet?.firstLessonByKanji.get(q.prompt)
          : undefined;
    return lesson
      ? [
          {
            id: q.id,
            kind: q.kind,
            prompt: q.prompt,
            lesson,
            level: lessonSet!.level,
          },
        ]
      : [];
  }),
);

/** Every vocab word in today's game, linked to the lesson that teaches it —
 *  shown both before the round starts and again in the round summary, so a
 *  player can study the words either side of playing. */
const vocabToStudy = computed(() =>
  (dailyGame.value?.questions ?? [])
    .filter((q) => q.kind === "vocab")
    .flatMap((q) => {
      const lessonSet = gameLessonSet.value;
      const lesson = lessonSet?.lessonNumberByWord.get(q.id);
      return lesson
        ? [
            {
              id: q.id,
              term: q.prompt,
              kana: q.promptSub,
              meaning: q.correctAnswer,
              lesson,
              level: lessonSet!.level,
            },
          ]
        : [];
    }),
);

const fetchGame = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{
      success: boolean;
      data: DailyGame;
      timestamp: string;
    }>("/api/daily-game", { query: { level: level.value } });

    if (response?.data) {
      dailyGame.value = response.data;
      restart();
      started.value = false;
    }
  } catch (err: unknown) {
    console.error("Error fetching daily game:", err);

    const errorData = err as {
      statusCode?: number;
      data?: { error?: string | unknown };
    };
    const errorMsg = errorData.data?.error;
    if (typeof errorMsg === "string") {
      error.value = errorMsg;
    } else if (errorData.statusCode === 500) {
      error.value = "Service temporarily unavailable. Please try again.";
    } else {
      error.value = "Failed to fetch today's game. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (props.autoFetch) await fetchGame();
});

defineOptions({
  name: "DailyGameBoard",
});

defineExpose({
  fetchGame,
  questions,
  currentQuestion,
  currentIndex,
  isFinished,
  selectChoice,
  advance,
  restart,
  perKindStats,
  missedToStudy,
  started,
  startRound,
  vocabToStudy,
  level,
  selectLevel,
});
</script>
