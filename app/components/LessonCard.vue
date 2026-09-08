<template>
  <!-- eslint-disable vue/no-v-html -->
  <UCard
    :ui="{
      root: 'w-full rounded-sm shadow-none border-t border-b border-x-0 sm:border-x border-stone-300 dark:border-stone-800',
    }"
  >
    <div class="p-4 sm:p-6 space-y-6">
      <div class="border-b border-stone-300 dark:border-stone-800 pb-4">
        <div class="flex items-center gap-2 mb-3">
          <UBadge color="primary" variant="soft" size="md">
            {{ lesson.difficultyLevel }}
          </UBadge>
          <span
            v-if="lesson.credibilityScore !== undefined"
            class="kicker flex items-center gap-1"
            :style="{ color: getCredibilityColor(lesson.credibilityScore) }"
          >
            <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
            {{ t.trustScore }}: {{ Math.round(lesson.credibilityScore * 100) }}%
          </span>
        </div>

        <h2
          class="text-2xl sm:text-3xl font-bold font-serif leading-tight text-gray-900 dark:text-white [word-wrap:break-word]"
        >
          {{ lesson.title }}
        </h2>
        <p
          v-if="lesson.titleJa"
          class="mt-1 font-body-serif text-lg text-gray-600 dark:text-gray-400 [word-wrap:break-word]"
        >
          {{ lesson.titleJa }}
        </p>

        <div class="mt-3 flex items-center gap-2 text-sm">
          <img
            v-if="lesson.favicon"
            :src="lesson.favicon"
            :alt="sourceName"
            class="w-4 h-4 rounded object-contain bg-white dark:bg-gray-800"
            loading="lazy"
          />
          <UIcon
            v-else
            name="i-heroicons-newspaper"
            class="w-4 h-4 text-gray-400"
          />
          <a
            :href="lesson.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            {{ sourceName }}
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-3.5 h-3.5"
            />
          </a>
          <span class="text-gray-400 dark:text-gray-500">·</span>
          <time class="text-gray-500 dark:text-gray-400">
            {{ formattedDate }}
          </time>
        </div>
      </div>

      <div class="space-y-6">
        <div v-if="lesson.furiganaText || lesson.originalText">
          <h4 class="kicker text-secondary-500 mb-2">
            {{ t.originalPassage }}
          </h4>
          <p
            v-if="lesson.furiganaText"
            class="furigana-text font-body-serif text-lg leading-loose text-gray-800 dark:text-gray-200 [word-wrap:break-word]"
            v-html="safeFurigana(lesson.furiganaText)"
          />
          <p
            v-else
            class="font-body-serif text-lg leading-loose text-gray-800 dark:text-gray-200 [word-wrap:break-word]"
          >
            {{ lesson.originalText }}
          </p>
          <p
            v-if="lesson.romajiText"
            class="mt-1 font-body-serif italic text-sm text-gray-500 dark:text-gray-400 [word-wrap:break-word]"
          >
            {{ lesson.romajiText }}
          </p>
        </div>

        <div v-if="lesson.vocabList && lesson.vocabList.length > 0">
          <h4 class="kicker text-secondary-500 mb-2 flex items-center gap-1.5">
            <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
            {{ t.vocabulary }} ({{ lesson.vocabList.length }})
          </h4>
          <ul class="divide-y divide-stone-200 dark:divide-stone-800">
            <li v-for="(vocab, i) in lesson.vocabList" :key="i" class="py-2.5">
              <div class="flex items-baseline gap-2 flex-wrap">
                <span
                  class="font-serif font-bold text-base text-gray-900 dark:text-gray-100"
                >
                  {{ vocab.term }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ vocab.reading }}
                </span>
                <span
                  v-if="vocab.romaji"
                  class="text-xs italic text-gray-400 dark:text-gray-500"
                >
                  {{ vocab.romaji }}
                </span>
                <UBadge color="secondary" variant="soft" size="xs">
                  {{ vocab.jlptLevel }}
                </UBadge>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ vocab.meaning }}
              </p>
              <p
                v-if="vocab.exampleSentence"
                class="text-xs italic text-gray-500 dark:text-gray-400 mt-0.5 [word-wrap:break-word]"
              >
                {{ vocab.exampleSentence }}
              </p>
            </li>
          </ul>
        </div>

        <div v-if="lesson.grammarNotes && lesson.grammarNotes.length > 0">
          <h4 class="kicker text-secondary-500 mb-2 flex items-center gap-1.5">
            <UIcon name="i-heroicons-language" class="w-4 h-4" />
            {{ t.grammarNotes }} ({{ lesson.grammarNotes.length }})
          </h4>
          <ul class="space-y-3">
            <li v-for="(note, i) in lesson.grammarNotes" :key="i">
              <p
                class="font-serif font-bold text-sm text-gray-900 dark:text-gray-100"
              >
                {{ note.pattern }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ note.explanation }}
              </p>
              <p
                v-if="note.exampleSentence"
                class="text-xs italic text-gray-500 dark:text-gray-400 mt-0.5 [word-wrap:break-word]"
              >
                {{ note.exampleSentence }}
              </p>
              <p
                v-if="note.romaji"
                class="text-xs italic text-gray-400 dark:text-gray-500 [word-wrap:break-word]"
              >
                {{ note.romaji }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Lesson } from "~~/types/index";
import { computed } from "vue";

const props = defineProps<{
  lesson: Lesson;
}>();

const sourceName = computed(() => {
  try {
    return new URL(props.lesson.source).hostname.replace(/^www\d?\./, "");
  } catch {
    return props.lesson.source;
  }
});

const formattedDate = computed(() => {
  const d = new Date(props.lesson.publishedAt);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

/**
 * Render agent-supplied furigana HTML. Everything is HTML-escaped first, then
 * only bare <ruby>/<rt>/<rp> tags are restored — attributes and any other tag
 * stay escaped, so no script/style/event-handler markup can survive.
 */
const safeFurigana = (html: string | undefined): string => {
  if (!html) return "";
  const escaped = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/&lt;(\/?)(ruby|rt|rp)&gt;/gi, "<$1$2>");
};

const translations = {
  en: {
    trustScore: "Trust Score",
    originalPassage: "Original passage",
    vocabulary: "Vocabulary",
    grammarNotes: "Grammar notes",
  },
} as const;

const t = computed(() => translations.en);

// Gradient color from red (0%) to green (100%).
const getCredibilityColor = (score: number | undefined): string => {
  if (score === undefined || score === null) {
    return "var(--ui-color-neutral-500)";
  }
  const hue = Math.round(score * 120);
  return `hsl(${hue}, 70%, 45%)`;
};
</script>

<style scoped>
.furigana-text {
  ruby-position: over;
}
.furigana-text :deep(rt) {
  font-size: 0.6em;
  font-weight: 400;
  color: var(--color-secondary-500);
}
</style>
