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
            v-if="passageHtml"
            ref="passageEl"
            class="furigana-text font-body-serif text-lg leading-loose text-gray-800 dark:text-gray-200 [word-wrap:break-word]"
            @click="onPassageClick"
            v-html="passageHtml"
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
          <p
            v-if="hasClickableVocab"
            class="mt-1 text-xs text-gray-400 dark:text-gray-500"
          >
            {{ t.tapHint }}
          </p>
          <template v-if="lesson.englishText">
            <h4 class="kicker text-secondary-500 mt-4 mb-2">
              {{ t.translation }}
            </h4>
            <p
              class="font-body-serif text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-wrap:break-word]"
            >
              {{ lesson.englishText }}
            </p>
          </template>
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
                  class="furigana-text font-serif font-bold text-base text-gray-900 dark:text-gray-100"
                >
                  <ruby v-if="showRuby(vocab.term, vocab.reading)"
                    >{{ vocab.term }}<rt>{{ vocab.reading }}</rt></ruby
                  >
                  <template v-else>{{ vocab.term }}</template>
                </span>
                <span
                  v-if="!showRuby(vocab.term, vocab.reading) && vocab.reading"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
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
                v-if="vocab.exampleFurigana"
                class="furigana-text text-xs italic text-gray-500 dark:text-gray-400 mt-0.5 [word-wrap:break-word]"
                v-html="safeFurigana(vocab.exampleFurigana)"
              />
              <p
                v-else-if="vocab.exampleSentence"
                class="text-xs italic text-gray-500 dark:text-gray-400 mt-0.5 [word-wrap:break-word]"
              >
                {{ vocab.exampleSentence }}
              </p>
              <p
                v-if="vocab.exampleRomaji"
                class="text-xs italic text-gray-400 dark:text-gray-500 [word-wrap:break-word]"
              >
                {{ vocab.exampleRomaji }}
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
                v-if="note.exampleFurigana"
                class="furigana-text text-xs italic text-gray-500 dark:text-gray-400 mt-0.5 [word-wrap:break-word]"
                v-html="safeFurigana(note.exampleFurigana)"
              />
              <p
                v-else-if="note.exampleSentence"
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

    <Teleport v-if="selectedVocab" to="body">
      <div
        ref="popoverEl"
        class="jp-popover fixed z-60 w-[min(20rem,calc(100vw-1rem))] rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-3 font-sans"
        :style="popoverStyle"
      >
        <div class="flex items-baseline gap-2 flex-wrap">
          <span
            class="furigana-text font-serif font-bold text-lg text-gray-900 dark:text-gray-100"
          >
            <ruby v-if="showRuby(selectedVocab.term, selectedVocab.reading)"
              >{{ selectedVocab.term
              }}<rt>{{ selectedVocab.reading }}</rt></ruby
            >
            <template v-else>{{ selectedVocab.term }}</template>
          </span>
          <span
            v-if="
              !showRuby(selectedVocab.term, selectedVocab.reading) &&
              selectedVocab.reading
            "
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            {{ selectedVocab.reading }}
          </span>
          <span
            v-if="selectedVocab.romaji"
            class="text-xs italic text-gray-400 dark:text-gray-500"
          >
            {{ selectedVocab.romaji }}
          </span>
          <UBadge color="secondary" variant="soft" size="xs">
            {{ selectedVocab.jlptLevel }}
          </UBadge>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {{ selectedVocab.meaning }}
        </p>
        <p
          v-if="selectedVocab.exampleFurigana"
          class="furigana-text text-xs italic text-gray-500 dark:text-gray-400 mt-1 [word-wrap:break-word]"
          v-html="safeFurigana(selectedVocab.exampleFurigana)"
        />
        <p
          v-else-if="selectedVocab.exampleSentence"
          class="text-xs italic text-gray-500 dark:text-gray-400 mt-1 [word-wrap:break-word]"
        >
          {{ selectedVocab.exampleSentence }}
        </p>
        <p
          v-if="selectedVocab.exampleRomaji"
          class="text-xs italic text-gray-400 dark:text-gray-500 [word-wrap:break-word]"
        >
          {{ selectedVocab.exampleRomaji }}
        </p>
        <button
          type="button"
          class="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          :aria-label="t.close"
          @click="closePopover"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>
    </Teleport>
  </UCard>
</template>

<script setup lang="ts">
import type { Lesson, VocabItem } from "~~/types/index";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

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

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Render agent-supplied furigana HTML. Everything is HTML-escaped first, then
 * only bare <ruby>/<rt>/<rp> tags are restored — attributes and any other tag
 * stay escaped, so no script/style/event-handler markup can survive.
 */
const safeFurigana = (html: string | undefined): string => {
  if (!html) return "";
  return escapeHtml(html).replace(/&lt;(\/?)(ruby|rt|rp)&gt;/gi, "<$1$2>");
};

/** Show a <ruby> only when the reading actually differs from the term. */
const showRuby = (term: string, reading: string | undefined): boolean =>
  !!reading && reading !== term;

// --- Clickable vocab terms in the passage --------------------------------

/** Vocab terms, longest first so nested matches wrap the bigger term. */
const vocabHits = computed(() =>
  (props.lesson.vocabList ?? [])
    .map((v, idx) => ({ term: v.term, idx }))
    .filter((v) => v.term && v.term.length > 0)
    .sort((a, b) => b.term.length - a.term.length),
);

/** Strip <rt>/<rp> annotations from a <ruby> group to get its base text. */
const rubyBase = (rubyHtml: string): string =>
  rubyHtml
    .replace(/<rt>[\s\S]*?<\/rt>/gi, "")
    .replace(/<rp>[\s\S]*?<\/rp>/gi, "")
    .replace(/<\/?(ruby|rt|rp)>/gi, "");

/** Wrap occurrences of vocab terms in an already-HTML-escaped text run. */
const wrapVocabInText = (
  text: string,
  hits: { term: string; idx: number }[],
): string => {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "&") {
      const semi = text.indexOf(";", i);
      if (semi !== -1 && semi - i <= 10) {
        out += text.slice(i, semi + 1);
        i = semi + 1;
        continue;
      }
    }
    const hit = hits.find(
      (h) => h.term.length >= 2 && text.startsWith(h.term, i),
    );
    if (hit) {
      out += `<button type="button" class="jp-token" data-vi="${hit.idx}">${escapeHtml(hit.term)}</button>`;
      i += hit.term.length;
      continue;
    }
    out += text[i];
    i += 1;
  }
  return out;
};

/**
 * The passage as sanitized HTML with vocab-list terms wrapped in clickable
 * <button class="jp-token"> elements. Handles both the furigana (<ruby>) form
 * and the plain-text fallback.
 */
const passageHtml = computed<string>(() => {
  const hits = vocabHits.value;
  if (props.lesson.furiganaText) {
    const safe = safeFurigana(props.lesson.furiganaText);
    return safe
      .split(/(<ruby>[\s\S]*?<\/ruby>)/g)
      .map((part) => {
        if (!part) return "";
        if (part.startsWith("<ruby>")) {
          const base = rubyBase(part);
          const hit = hits.find(
            (h) =>
              base.length > 0 &&
              (base === h.term ||
                (base.length >= 2 && h.term.includes(base)) ||
                (h.term.length >= 2 && base.includes(h.term))),
          );
          return hit
            ? `<button type="button" class="jp-token" data-vi="${hit.idx}">${part}</button>`
            : part;
        }
        return wrapVocabInText(part, hits);
      })
      .join("");
  }
  if (props.lesson.originalText) {
    return wrapVocabInText(escapeHtml(props.lesson.originalText), hits);
  }
  return "";
});

const hasClickableVocab = computed(
  () => vocabHits.value.length > 0 && passageHtml.value.includes("jp-token"),
);

// --- Word popover -------------------------------------------------------

const passageEl = ref<HTMLElement | null>(null);
const popoverEl = ref<HTMLElement | null>(null);
const selectedVocab = ref<VocabItem | null>(null);
const popoverStyle = ref<Record<string, string>>({});

const positionPopover = (anchor: DOMRect): void => {
  const margin = 8;
  const width = Math.min(320, window.innerWidth - 16);
  const el = popoverEl.value;
  const height = el ? el.offsetHeight : 160;

  let top = anchor.bottom + margin;
  if (
    top + height > window.innerHeight - margin &&
    anchor.top - margin - height > 0
  ) {
    top = anchor.top - margin - height;
  }
  let left = anchor.left + anchor.width / 2 - width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

  popoverStyle.value = { top: `${Math.max(margin, top)}px`, left: `${left}px` };
};

const onPassageClick = (event: MouseEvent): void => {
  const target = (event.target as HTMLElement | null)?.closest(
    ".jp-token",
  ) as HTMLElement | null;
  if (!target || target.dataset.vi === undefined) return;
  const item = props.lesson.vocabList?.[Number(target.dataset.vi)];
  if (!item) return;
  const anchor = target.getBoundingClientRect();
  selectedVocab.value = item;
  nextTick(() => positionPopover(anchor));
};

const closePopover = (): void => {
  selectedVocab.value = null;
};

const onDocPointerDown = (event: Event): void => {
  if (!selectedVocab.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest(".jp-token") || target?.closest(".jp-popover")) return;
  closePopover();
};

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") closePopover();
};

onMounted(() => {
  document.addEventListener("pointerdown", onDocPointerDown);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", closePopover);
  window.addEventListener("scroll", closePopover, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", closePopover);
  window.removeEventListener("scroll", closePopover, true);
});

const translations = {
  en: {
    trustScore: "Trust Score",
    originalPassage: "Original passage",
    translation: "English translation",
    vocabulary: "Vocabulary",
    grammarNotes: "Grammar notes",
    tapHint: "Tap a highlighted word for its reading, rōmaji and meaning.",
    close: "Close",
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
.furigana-text :deep(.jp-token) {
  font: inherit;
  color: inherit;
  background: color-mix(in srgb, var(--color-primary-500) 14%, transparent);
  border-bottom: 1px solid var(--color-primary-500);
  border-radius: 2px;
  padding: 0 1px;
  cursor: pointer;
}
.furigana-text :deep(.jp-token:hover) {
  background: color-mix(in srgb, var(--color-primary-500) 26%, transparent);
}
.jp-popover :deep(rt) {
  font-size: 0.6em;
  font-weight: 400;
  color: var(--color-secondary-500);
}
</style>
