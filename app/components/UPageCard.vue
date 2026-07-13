<template>
  <div class="u-page-card border border-stone-200/60 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm rounded-xl p-5 hover:shadow-md hover:border-primary-500/30 transition-all duration-350 flex flex-col gap-3 group">
    <div
      v-if="icon"
      class="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300"
    >
      <UIcon :name="icon" class="w-4 h-4" />
    </div>
    <div class="space-y-1">
      <h3 class="font-serif font-bold text-base text-stone-900 dark:text-white group-hover:text-primary-500 transition-colors duration-200">
        {{ title }}
      </h3>
      <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: string;
}>();
</script>
