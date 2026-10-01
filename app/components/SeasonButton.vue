<template>
  <div ref="container" class="relative">
    <UButton
      color="gray"
      variant="ghost"
      class="season-button-trigger"
      aria-label="Change season"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="season-glyph text-base leading-none" aria-hidden="true" />
    </UButton>

    <div
      v-if="isOpen"
      class="season-menu absolute right-0 mt-2 z-50 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 season-box shadow-xl p-1.5"
      role="group"
      aria-label="Season"
      @keydown.esc="isOpen = false"
    >
      <button
        v-for="id in SEASON_IDS"
        :key="id"
        type="button"
        :class="itemClasses(choice === id)"
        :aria-pressed="choice === id"
        :data-season-option="id"
        @click="pick(id)"
      >
        <span aria-hidden="true">{{ SEASONS[id].glyph.light }}</span>
        <span>{{ SEASONS[id].label }}</span>
      </button>
      <button
        type="button"
        :class="itemClasses(choice === null)"
        :aria-pressed="choice === null"
        data-season-option="auto"
        @click="pick(null)"
      >
        <span aria-hidden="true">🗓️</span>
        <span>Follow the calendar</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { SEASON_IDS, SEASONS } from "~~/shared/seasons";
import type { SeasonId } from "~~/types/index";
import { useSiteTheme } from "../composables/useSiteTheme";

const { choice, syncFromStorage, chooseSeason } = useSiteTheme();

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

const itemClasses = (selected: boolean) =>
  [
    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md cursor-pointer transition-colors",
    selected
      ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium"
      : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800",
  ].join(" ");

const pick = (season: SeasonId | null) => {
  chooseSeason(season);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  syncFromStorage();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
