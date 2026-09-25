<template>
  <div class="space-y-5">
    <!-- In progress -->
    <div v-if="!isFinished && current" class="space-y-5">
      <div class="flex items-center justify-between gap-3">
        <p class="kicker text-secondary-500">
          Question {{ currentIndex + 1 }} / {{ questions.length }}
        </p>
        <p class="kicker text-stone-400 dark:text-stone-500">
          {{
            current.direction === "jp-en" ? "Pick the meaning" : "Pick the word"
          }}
        </p>
      </div>

      <EmaPlaque
        :key="currentIndex"
        :shake="isAnswered && !isCorrect"
        class="max-w-md mx-auto"
      >
        <div class="text-center pb-2 pt-2" data-testid="lesson-quiz-prompt">
          <template v-if="current.direction === 'jp-en'">
            <ruby
              v-if="current.word.kana !== current.word.term"
              class="font-serif font-bold text-4xl sm:text-5xl text-stone-900 dark:text-white leading-none"
            >
              {{ current.word.term }}
              <rt
                class="font-sans font-normal text-sm sm:text-base text-stone-600 dark:text-stone-400"
                >{{ current.word.kana }}</rt
              >
            </ruby>
            <p
              v-else
              class="font-serif font-bold text-4xl sm:text-5xl text-stone-900 dark:text-white leading-none"
            >
              {{ current.word.term }}
            </p>
          </template>
          <p
            v-else
            class="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-white leading-snug"
          >
            {{ current.word.meaning }}
          </p>
        </div>
        <template #stamp>
          <HankoSeal v-if="isAnswered && isCorrect" />
        </template>
      </EmaPlaque>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UButton
          v-for="choice in current.choices"
          :key="choice"
          :label="choice"
          :color="choiceColor(choice)"
          :variant="choiceVariant(choice)"
          size="lg"
          block
          class="justify-center"
          :class="current.direction === 'en-jp' ? 'font-serif text-lg' : ''"
          :disabled="isAnswered"
          data-testid="lesson-quiz-choice"
          @click="selectChoice(choice)"
        />
      </div>

      <div v-if="isAnswered" class="text-center space-y-3">
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
              isCorrect ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
            "
            class="w-4 h-4 shrink-0"
          />
          <span v-if="isCorrect">Correct!</span>
          <span v-else>Not quite — it's "{{ current.answer }}"</span>
        </p>
        <p class="text-xs text-stone-500 dark:text-stone-400">
          {{ current.word.term }}
          <template v-if="current.word.kana !== current.word.term"
            >({{ current.word.kana }})</template
          >
          · {{ current.word.romaji }} · {{ current.word.meaning }}
        </p>
        <UButton
          :label="currentIndex + 1 < questions.length ? 'Next' : 'See Result'"
          color="primary"
          size="md"
          icon="i-heroicons-arrow-right"
          trailing
          data-testid="lesson-quiz-next"
          @click="advance"
        />
      </div>
    </div>

    <!-- Result -->
    <div v-else-if="isFinished" class="text-center space-y-4">
      <p
        class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
        data-testid="lesson-quiz-score"
      >
        {{ correctCount }}/{{ questions.length }}
      </p>
      <p class="text-sm text-stone-600 dark:text-stone-300">
        {{
          passed
            ? "Great work — this lesson is marked as complete."
            : `Score ${PASS_PERCENT}% or more to complete the lesson. Review the words above and try again.`
        }}
      </p>
      <div v-if="missed.length" class="space-y-2">
        <p class="kicker text-stone-400 dark:text-stone-500">Review these</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="word in missed"
            :key="word.id"
            class="season-chip border border-stone-300 dark:border-stone-700 px-3 py-1 text-xs text-stone-700 dark:text-stone-300"
          >
            <span class="font-serif text-sm">{{ word.term }}</span>
            — {{ word.meaning }}
          </span>
        </div>
      </div>
      <UButton
        label="Practice Again"
        color="gray"
        variant="outline"
        size="md"
        icon="i-heroicons-arrow-path"
        data-testid="lesson-quiz-restart"
        @click="restart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { N5Vocab } from "~~/types/index";
import { meaningsOverlap, pickDistractors } from "~~/shared/meanings";
import EmaPlaque from "./EmaPlaque.vue";
import HankoSeal from "./HankoSeal.vue";

const CHOICE_COUNT = 4;
const PASS_PERCENT = 80;

type Direction = "jp-en" | "en-jp";

interface QuizQuestion {
  word: N5Vocab;
  direction: Direction;
  answer: string;
  choices: string[];
}

const props = defineProps<{
  /** The lesson's words — one question each. */
  words: N5Vocab[];
  /** The whole vocab pool, for extra distractors beyond the lesson. */
  pool: N5Vocab[];
}>();

const emit = defineEmits<{
  (
    e: "finished",
    result: { correct: number; total: number; passed: boolean },
  ): void;
}>();

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Other words to draw wrong answers from: the rest of this lesson first
 *  (the words most worth telling apart), then the wider pool. */
function otherWords(word: N5Vocab): N5Vocab[] {
  const lessonIds = new Set(props.words.map((w) => w.id));
  return [
    ...shuffle(props.words.filter((w) => w.id !== word.id)),
    ...shuffle(props.pool.filter((w) => !lessonIds.has(w.id))),
  ];
}

function buildQuestion(word: N5Vocab, direction: Direction): QuizQuestion {
  const others = otherWords(word);
  if (direction === "jp-en") {
    const distractors = pickDistractors(
      word.meaning,
      others.map((w) => w.meaning),
      CHOICE_COUNT - 1,
    );
    return {
      word,
      direction,
      answer: word.meaning,
      choices: shuffle([word.meaning, ...distractors]),
    };
  }

  // en-jp: the choices are words, so a wrong one must neither be spelled
  // the same as the answer nor mean the same thing.
  const terms: string[] = [];
  const pickedMeanings: string[] = [];
  for (const other of others) {
    if (terms.length >= CHOICE_COUNT - 1) break;
    if (other.term === word.term || terms.includes(other.term)) continue;
    if (meaningsOverlap(other.meaning, word.meaning)) continue;
    if (pickedMeanings.some((m) => meaningsOverlap(m, other.meaning))) continue;
    terms.push(other.term);
    pickedMeanings.push(other.meaning);
  }
  return {
    word,
    direction,
    answer: word.term,
    choices: shuffle([word.term, ...terms]),
  };
}

const round = ref(0);
const questions = computed<QuizQuestion[]>(() => {
  void round.value;
  // Alternate directions so each word is met both ways across retries.
  return shuffle(props.words).map((word, i) =>
    buildQuestion(word, (i + round.value) % 2 === 0 ? "jp-en" : "en-jp"),
  );
});

const currentIndex = ref(0);
const selected = ref<string | null>(null);
const correctCount = ref(0);
const missed = ref<N5Vocab[]>([]);

const current = computed(() => questions.value[currentIndex.value]);
const isAnswered = computed(() => selected.value !== null);
const isCorrect = computed(() => selected.value === current.value?.answer);
const isFinished = computed(
  () =>
    questions.value.length > 0 && currentIndex.value >= questions.value.length,
);
const passed = computed(
  () =>
    questions.value.length > 0 &&
    (correctCount.value / questions.value.length) * 100 >= PASS_PERCENT,
);

function choiceColor(choice: string): string {
  if (!isAnswered.value) return "secondary";
  if (choice === current.value?.answer) return "success";
  if (choice === selected.value) return "error";
  return "secondary";
}

function choiceVariant(choice: string): string {
  if (!isAnswered.value) return "outline";
  return choice === current.value?.answer || choice === selected.value
    ? "solid"
    : "outline";
}

function selectChoice(choice: string): void {
  if (isAnswered.value || !current.value) return;
  selected.value = choice;
  if (choice === current.value.answer) {
    correctCount.value++;
  } else {
    missed.value = [...missed.value, current.value.word];
  }
}

function advance(): void {
  if (!isAnswered.value) return;
  currentIndex.value++;
  selected.value = null;
  if (isFinished.value) {
    emit("finished", {
      correct: correctCount.value,
      total: questions.value.length,
      passed: passed.value,
    });
  }
}

function restart(): void {
  round.value++;
  currentIndex.value = 0;
  selected.value = null;
  correctCount.value = 0;
  missed.value = [];
}

// A different lesson (or a pool that just finished loading) starts fresh.
watch(
  () => props.words.map((w) => w.id).join(","),
  () => restart(),
);

defineOptions({ name: "LessonQuiz" });

defineExpose({ questions, selectChoice, advance, restart, isFinished });
</script>
