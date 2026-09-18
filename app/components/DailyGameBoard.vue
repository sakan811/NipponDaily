<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <AppHeader v-model:open="mobileMenuOpen" />

    <main
      class="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl"
    >
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="kicker text-primary-600 dark:text-primary-400">
            Today's Round
          </p>
          <div class="rule-double max-w-[120px]" />
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
          <UCard class="w-full border-t-2 border-t-primary-500">
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
          <!-- In-progress round -->
          <div v-if="!isFinished" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="kicker text-secondary-500">
                Question {{ currentIndex + 1 }} / {{ questions.length }}
              </p>
              <div class="flex items-center gap-3 text-sm">
                <span class="font-mono font-bold text-stone-900 dark:text-white"
                  >{{ score }} pts</span
                >
                <span
                  v-if="streak >= 2"
                  class="flex items-center gap-1 text-warning-600 dark:text-warning-400 font-medium"
                >
                  <UIcon name="i-heroicons-fire" class="w-4 h-4" />
                  {{ streak }}
                </span>
              </div>
            </div>

            <UCard class="w-full border-t-2 border-t-primary-500">
              <div class="p-4 sm:p-8 space-y-6 text-center">
                <UBadge color="secondary" variant="soft" size="xs">
                  {{ kindLabel(currentQuestion.kind) }}
                </UBadge>

                <div class="space-y-2">
                  <p
                    class="font-serif font-bold text-5xl sm:text-6xl text-stone-900 dark:text-white leading-none"
                  >
                    {{ currentQuestion.prompt }}
                  </p>
                  <p
                    v-if="currentQuestion.promptSub"
                    class="text-sm text-stone-500 dark:text-stone-400"
                  >
                    {{ currentQuestion.promptSub }}
                  </p>
                </div>

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
            </UCard>
          </div>

          <!-- Round summary -->
          <div v-else class="space-y-6">
            <UCard class="w-full border-t-2 border-t-primary-500">
              <div class="p-4 sm:p-8 space-y-6 text-center">
                <UIcon
                  name="i-heroicons-star"
                  class="w-10 h-10 mx-auto text-warning-500"
                />
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
                      {{ score }}
                    </p>
                    <p class="kicker text-stone-400">Score</p>
                  </div>
                  <div>
                    <p
                      class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                    >
                      {{ accuracyPercent }}%
                    </p>
                    <p class="kicker text-stone-400">Accuracy</p>
                  </div>
                  <div>
                    <p
                      class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                    >
                      {{ longestStreak }}
                    </p>
                    <p class="kicker text-stone-400">Best Streak</p>
                  </div>
                </div>

                <div class="rule-double max-w-[120px] mx-auto" />

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div
                    v-for="kind in kinds"
                    :key="kind"
                    class="pt-3 space-y-0.5"
                  >
                    <p class="text-sm font-bold text-stone-900 dark:text-white">
                      {{ perKindStats[kind].correct }}/{{
                        perKindStats[kind].total
                      }}
                    </p>
                    <p class="kicker text-stone-400">{{ kindLabel(kind) }}</p>
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { DailyGame, GameQuestion, N5PoolKind } from "~~/types/index";

import AppHeader from "./AppHeader.vue";
import TrendingFallback from "./TrendingFallback.vue";

const KIND_LABELS: Record<N5PoolKind, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
  kanji: "Kanji",
  vocab: "Vocabulary",
};
const kinds = Object.keys(KIND_LABELS) as N5PoolKind[];
const kindLabel = (kind: N5PoolKind) => KIND_LABELS[kind];

const dailyGame = ref<DailyGame | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);
const playIndex = ref(0);

const currentIndex = ref(0);
const score = ref(0);
const streak = ref(0);
const longestStreak = ref(0);
const selectedChoice = ref<string | null>(null);
const isAnswered = ref(false);
const perKindStats =
  ref<Record<N5PoolKind, { correct: number; total: number }>>(emptyStats());

function emptyStats(): Record<N5PoolKind, { correct: number; total: number }> {
  return {
    hiragana: { correct: 0, total: 0 },
    katakana: { correct: 0, total: 0 },
    kanji: { correct: 0, total: 0 },
    vocab: { correct: 0, total: 0 },
  };
}

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
    streak.value++;
    score.value += 10 * Math.min(streak.value, 3);
    longestStreak.value = Math.max(longestStreak.value, streak.value);
    perKindStats.value[kind].correct++;
  } else {
    streak.value = 0;
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
  score.value = 0;
  streak.value = 0;
  longestStreak.value = 0;
  selectedChoice.value = null;
  isAnswered.value = false;
  perKindStats.value = emptyStats();
}

const fetchGame = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{
      success: boolean;
      data: DailyGame;
      timestamp: string;
    }>("/api/daily-game");

    if (response?.data) {
      dailyGame.value = response.data;
      restart();
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
  const isTest =
    typeof process !== "undefined" &&
    (process.env?.NODE_ENV === "test" || process.env?.VITEST);
  if (!isTest) {
    await fetchGame();
  }
});

defineOptions({
  name: "DailyGameBoard",
});

defineExpose({
  fetchGame,
  questions,
  currentQuestion,
  isFinished,
  selectChoice,
  advance,
  restart,
  score,
  streak,
});
</script>
