<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="kicker text-secondary-500" data-testid="lesson-review-count">
        <template v-if="!isFinished">
          {{ reviewedCount }} / {{ words.length }} known
        </template>
        <template v-else>All {{ words.length }} words reviewed</template>
      </p>
      <div
        class="flex items-center gap-1 text-xs"
        role="group"
        aria-label="Which side to show first"
      >
        <button
          v-for="option in FRONT_OPTIONS"
          :key="option.value"
          type="button"
          class="season-chip border px-2.5 py-1 cursor-pointer transition-colors"
          :class="
            front === option.value
              ? 'border-primary-500/60 bg-primary-500/10 text-primary-700 dark:text-primary-300'
              : 'border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400'
          "
          :aria-pressed="front === option.value"
          :data-testid="`lesson-review-front-${option.value}`"
          @click="setFront(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- The card -->
    <div v-if="!isFinished && current" class="space-y-4">
      <div
        class="season-box border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/70 min-h-44 p-6 flex flex-col items-center justify-center text-center gap-3"
        data-testid="lesson-review-card"
      >
        <p
          v-if="front === 'jp'"
          class="font-serif font-bold text-4xl sm:text-5xl text-stone-900 dark:text-white leading-none"
        >
          {{ current.term }}
        </p>
        <p
          v-else
          class="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-white leading-snug"
        >
          {{ current.meaning }}
        </p>

        <div
          v-if="revealed"
          class="space-y-1.5"
          data-testid="lesson-review-answer"
        >
          <p
            v-if="front === 'en'"
            class="font-serif font-bold text-3xl text-stone-900 dark:text-white"
          >
            {{ current.term }}
          </p>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            <template v-if="current.kana !== current.term"
              >{{ current.kana }} · </template
            >{{ current.romaji }}
          </p>
          <p
            v-if="front === 'jp'"
            class="text-base text-stone-700 dark:text-stone-300"
          >
            {{ current.meaning }}
          </p>
          <p
            v-if="hintFor(current.term)"
            class="text-xs text-primary-700 dark:text-primary-300"
          >
            {{ hintFor(current.term) }}
          </p>
        </div>
        <p v-else class="text-xs text-stone-400 dark:text-stone-500">
          Recall the {{ front === "jp" ? "meaning" : "word" }}, then reveal.
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <UButton
          v-if="!revealed"
          label="Reveal"
          color="primary"
          size="lg"
          data-testid="lesson-review-reveal"
          @click="revealed = true"
        />
        <template v-else>
          <UButton
            label="Again"
            color="gray"
            variant="outline"
            size="lg"
            icon="i-heroicons-arrow-path"
            data-testid="lesson-review-again"
            @click="answer(false)"
          />
          <UButton
            label="Got it"
            color="primary"
            size="lg"
            icon="i-heroicons-check-circle"
            data-testid="lesson-review-got-it"
            @click="answer(true)"
          />
        </template>
      </div>
    </div>

    <!-- Deck finished -->
    <div v-else-if="isFinished" class="text-center space-y-3">
      <p class="text-sm text-stone-600 dark:text-stone-300">
        You recalled every word in this lesson<template v-if="againCount">
          — {{ againCount }} took another pass</template
        >.
      </p>
      <UButton
        label="Review Again"
        color="gray"
        variant="outline"
        size="md"
        icon="i-heroicons-arrow-path"
        data-testid="lesson-review-restart"
        @click="restart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { N5Vocab } from "~~/types/index";

type Front = "jp" | "en";

const FRONT_OPTIONS: { value: Front; label: string }[] = [
  { value: "jp", label: "日本語 first" },
  { value: "en", label: "English first" },
];

/**
 * Flip-card review of a lesson's words: recall, reveal, then "Got it" or
 * "Again" (which sends the card to the back of the deck). Deliberately not
 * a scored multiple-choice quiz — that's the daily game's job — and nothing
 * here is saved anywhere: the deck lives in component state only.
 */
const props = defineProps<{
  words: N5Vocab[];
  /** Optional per-word kanji gloss, e.g. "月 month · 曜 weekday". */
  kanjiHint?: (term: string) => string;
}>();

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

const front = ref<Front>("jp");
const deck = ref<N5Vocab[]>(shuffle(props.words));
const revealed = ref(false);
const reviewedCount = ref(0);
const againCount = ref(0);

const current = computed(() => deck.value[0]);
const isFinished = computed(
  () => props.words.length > 0 && deck.value.length === 0,
);

function hintFor(term: string): string {
  return props.kanjiHint?.(term) ?? "";
}

function answer(known: boolean): void {
  const [card, ...rest] = deck.value;
  if (!card || !revealed.value) return;
  if (known) {
    reviewedCount.value++;
    deck.value = rest;
  } else {
    againCount.value++;
    deck.value = [...rest, card];
  }
  revealed.value = false;
}

function restart(): void {
  deck.value = shuffle(props.words);
  revealed.value = false;
  reviewedCount.value = 0;
  againCount.value = 0;
}

function setFront(value: Front): void {
  front.value = value;
  revealed.value = false;
}

// A different lesson (or words that just finished loading) gets a new deck.
watch(
  () => props.words.map((w) => w.id).join(","),
  () => restart(),
);

defineOptions({ name: "LessonReview" });

defineExpose({ deck, answer, restart, isFinished, revealed });
</script>
