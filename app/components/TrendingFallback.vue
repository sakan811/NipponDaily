<template>
  <div data-testid="trending-fallback-container" class="w-full space-y-6">
    <!-- Failed Trending Fetching Card -->
    <UCard
      data-testid="error-state"
      class="w-full shadow-none text-center bg-white dark:bg-stone-900/80 border border-stone-300 dark:border-stone-800 rounded-sm"
      :ui="{ body: 'p-6 sm:p-8' }"
    >
      <div class="max-w-md mx-auto space-y-4">
        <!-- Error Icon -->
        <div
          class="w-14 h-14 mx-auto rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-cloud-arrow-down"
            class="w-7 h-7 animate-pulse"
          />
        </div>

        <!-- Header & Explanation -->
        <div class="space-y-1.5">
          <h3
            class="text-xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Unable to Load Lessons
          </h3>
          <p
            class="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-500/10 dark:bg-rose-500/20 px-3 py-1.5 rounded-lg inline-block break-words max-w-full"
          >
            {{ error || "Service temporarily unavailable. Please try again." }}
          </p>
        </div>

        <p
          class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans"
        >
          The lesson reader could not fetch the latest Japanese lessons from
          the Redis database.
        </p>

        <!-- Retry Action -->
        <div class="pt-2 flex justify-center gap-3">
          <UButton
            color="primary"
            size="md"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            :disabled="loading"
            label="Try Again"
            class="px-5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            @click="$emit('retry')"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error?: string | null;
  loading?: boolean;
}>();

defineEmits<{
  (e: "retry"): void;
}>();
</script>
