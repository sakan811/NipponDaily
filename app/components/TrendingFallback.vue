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
            Unable to Retrieve Trending Topics
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
          The Japan news aggregation pipeline could not fetch trending topic
          clusters from Tavily or Upstash database.
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

    <!-- DEBUG_ERROR_UI Showcase for Designers/Developers -->
    <div
      v-if="isDebug"
      class="p-4 rounded-sm border border-dashed border-amber-500/40 bg-amber-500/5 space-y-3"
    >
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
        >
          <UIcon name="i-heroicons-bug-ant" class="w-4 h-4" />
          DEBUG_ERROR_UI: Mock Trending Fallback Preview
        </span>
        <UBadge color="warning" variant="soft" size="xs"
          >Testing & Design Mode</UBadge
        >
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-75 pointer-events-none"
      >
        <div
          v-for="i in 2"
          :key="i"
          class="border p-3 rounded-sm bg-white/40 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800"
        >
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[9px] font-bold text-stone-400 uppercase"
              >Mock Source {{ i }}</span
            >
            <UBadge color="error" variant="soft" size="xs">Fetch Failed</UBadge>
          </div>
          <h4
            class="text-xs font-bold font-serif text-stone-700 dark:text-stone-300"
          >
            [Fallback Preview] Sample Trending Topic #{{ i }}
          </h4>
          <p class="text-[10px] text-stone-400 mt-2">
            Cached snapshot unavailable
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error?: string | null;
  loading?: boolean;
  isDebug?: boolean;
}>();

defineEmits<{
  (e: "retry"): void;
}>();
</script>
