<template>
  <div class="border-l-2 border-primary-500 pl-4">
    <div class="flex items-baseline gap-2 flex-wrap">
      <span class="text-xs font-mono text-stone-400">{{ index }}</span>
      <h2 class="text-xl font-bold font-serif text-stone-900 dark:text-white m-0">
        {{ title }}
      </h2>
    </div>
    <p class="text-xs font-mono text-primary-600 dark:text-primary-400 mt-1 mb-1">
      {{ component }}
    </p>
    <p class="text-xs text-stone-500 dark:text-stone-400 m-0 max-w-2xl">
      <span class="font-semibold">Trigger:</span> {{ trigger }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  index: string;
  title: string;
  component: string;
  trigger: string;
}>();
</script>
