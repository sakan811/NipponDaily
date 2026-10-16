<template>
  <section class="space-y-4" aria-labelledby="sound-alikes-heading">
    <h2
      id="sound-alikes-heading"
      class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
    >
      Also read {{ entry.kana }}
    </h2>
    <p class="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
      Other words so far with exactly this reading and another spelling, oldest
      first, with the pitch accent each entry shows: where they differ, the
      pitch tells the words apart in speech. Only the readings are compared;
      nothing is claimed about how the words are related.
    </p>
    <ul
      data-testid="sound-alikes"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <li
        v-for="w in rows"
        :key="w.date"
        :data-testid="w.self ? 'sound-alike-self' : 'sound-alike'"
        class="season-box border bg-white dark:bg-stone-900/50 px-4 py-3 space-y-1"
        :class="
          w.self
            ? 'border-primary-500/60'
            : 'border-stone-300 dark:border-stone-700'
        "
      >
        <p class="flex flex-wrap items-baseline gap-x-3">
          <span
            v-if="w.self"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
            >{{ w.term }}</span
          >
          <NuxtLink
            v-else
            :to="`/words/${w.date}`"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >{{ w.term }}</NuxtLink
          >
          <span v-if="w.self" class="kicker text-stone-600 dark:text-stone-400"
            >This word</span
          >
        </p>
        <p class="text-sm text-stone-600 dark:text-stone-400">
          {{ w.meaning }}
        </p>
        <p class="text-sm text-stone-800 dark:text-stone-200">
          <template v-if="w.accents.length">
            <span
              v-for="(a, i) in w.accents"
              :key="a.text"
              :title="a.hint"
              data-testid="sound-alike-accent"
              >{{ i ? "; " : "" }}<span class="font-serif">{{ a.text }}</span>
              {{ a.label }}</span
            >
          </template>
          <span v-else class="text-stone-600 dark:text-stone-400"
            >No pitch accent shown</span
          >
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PITCH_TYPES, markFall, pitchTypesOf } from "../utils/pitch";
import type { SoundAlike, WordEntry } from "~~/types/index";

const props = defineProps<{
  entry: Pick<WordEntry, "date" | "term" | "kana" | "meaning" | "pitch">;
  words: SoundAlike[];
}>();

const accentsOf = (kana: string, pitch: readonly number[] = []) => {
  const types = pitchTypesOf(kana, pitch);
  return pitch.map((accent, i) => ({
    text: markFall(kana, accent),
    label: PITCH_TYPES[types[i]!].label,
    hint: PITCH_TYPES[types[i]!].hint,
  }));
};

/** The entry itself first, so its accent stands beside the others'. */
const rows = computed(() => [
  {
    ...props.entry,
    self: true,
    accents: accentsOf(props.entry.kana, props.entry.pitch),
  },
  ...props.words.map((w) => ({
    ...w,
    self: false,
    accents: accentsOf(w.kana, w.pitch),
  })),
]);
</script>
