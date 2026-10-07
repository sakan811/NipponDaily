<template>
  <div v-if="available" ref="container" class="relative">
    <UButton
      :color="enabled ? 'primary' : 'gray'"
      variant="ghost"
      class="bgm-button-trigger max-[359px]:px-2"
      :aria-label="`${seasonLabel} music`"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <UIcon
        :name="
          enabled
            ? 'i-heroicons-musical-note'
            : 'i-heroicons-musical-note-slash'
        "
        class="w-4 h-4"
      />
    </UButton>

    <div
      v-if="isOpen"
      class="bgm-menu fixed inset-x-4 mt-2 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 season-box shadow-xl p-3"
      role="group"
      :aria-label="`${seasonLabel} music`"
      @keydown.esc="isOpen = false"
    >
      <button
        type="button"
        role="switch"
        :aria-checked="enabled"
        data-bgm-toggle
        class="w-full flex items-center justify-between gap-3 px-2 py-2 text-sm text-left rounded-md cursor-pointer transition-colors text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        @click="toggle"
      >
        <span class="font-medium">{{ seasonLabel }} music</span>
        <span
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none',
            enabled ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600',
          ]"
          aria-hidden="true"
        >
          <span
            :class="[
              'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none',
              enabled ? 'translate-x-5.5' : 'translate-x-0.5',
            ]"
          />
        </span>
      </button>

      <div class="mt-2 flex items-center gap-2.5">
        <UIcon
          name="i-heroicons-speaker-x-mark"
          class="w-4 h-4 text-stone-500 dark:text-stone-400"
        />
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="volume"
          data-bgm-volume
          class="bgm-slider min-w-0 flex-1 h-8 cursor-pointer accent-primary-500"
          aria-label="Music volume"
          :aria-valuetext="`${volume}%`"
          @input="setVolume(Number(($event.target as HTMLInputElement).value))"
        >
        <UIcon
          name="i-heroicons-speaker-wave"
          class="w-4 h-4 text-stone-500 dark:text-stone-400"
        />
        <span
          class="w-9 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400"
          aria-hidden="true"
          >{{ volume }}%</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { SEASONS } from "~~/shared/seasons";
import { useBgm } from "../composables/useBgm";

const { enabled, volume, available, activeSeason, toggle, setVolume } =
  useBgm();

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

// "Autumn (koyo)" -> "Autumn": the romanised name is too long for the panel.
const seasonLabel = computed(() =>
  activeSeason.value
    ? SEASONS[activeSeason.value].label.replace(/\s*\(.*\)$/, "")
    : "Season",
);

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
