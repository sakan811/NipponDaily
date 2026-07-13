<template>
  <div class="u-tooltip relative group inline-block">
    <slot />
    <div
      v-if="text"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-stone-900 dark:bg-stone-800 text-stone-100 dark:text-stone-200 text-[10px] sm:text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 font-sans font-medium tracking-wide"
    >
      {{ text }}
      <!-- Triangle pointer -->
      <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900 dark:border-t-stone-800" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>
