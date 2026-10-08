<template>
  <ol
    data-testid="kanji-strokes"
    class="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3"
  >
    <li
      v-for="(_, i) in strokes"
      :key="i"
      data-testid="kanji-stroke"
      class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-1"
    >
      <svg
        :viewBox="STROKE_VIEWBOX"
        role="img"
        :aria-label="`Stroke ${i + 1} of ${strokes.length}`"
        class="w-full h-auto text-stone-900 dark:text-stone-100"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          v-for="(d, j) in strokes.slice(0, i + 1)"
          :key="j"
          :d="d"
          stroke-width="3.5"
          :class="
            j === i
              ? 'stroke-primary-500'
              : 'stroke-stone-400 dark:stroke-stone-600'
          "
        />
        <text
          v-if="starts[i]"
          :x="starts[i]!.x"
          :y="starts[i]!.y"
          font-size="11"
          class="fill-primary-600 dark:fill-primary-400"
          stroke="none"
          text-anchor="end"
        >
          {{ i + 1 }}
        </text>
      </svg>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STROKE_VIEWBOX, strokeStart } from "../utils/strokes";

const props = defineProps<{ strokes: string[] }>();

/** Where each stroke begins, for its number. */
const starts = computed(() => props.strokes.map(strokeStart));
</script>
