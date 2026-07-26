<template>
  <div data-testid="summary-fallback-container" class="w-full space-y-6">
    <UCard
      data-testid="summary-fallback-card"
      class="w-full shadow-md border-t-4 border-t-amber-500 bg-white/90 dark:bg-stone-900/90 rounded-xl"
      :ui="{ body: 'p-6 sm:p-8 space-y-6' }"
    >
      <!-- Warning Header -->
      <div
        class="flex items-start gap-4 pb-4 border-b border-stone-200 dark:border-stone-800"
      >
        <div
          class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-6 h-6 animate-pulse"
          />
        </div>
        <div class="space-y-1 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3
              class="text-xl font-serif font-bold text-stone-900 dark:text-white"
            >
              AI Summary Engine Fallback Mode
            </h3>
            <UBadge color="warning" variant="soft" size="xs">
              Unsynthesized
            </UBadge>
          </div>
          <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            The AI summary process encountered a rate limit or service delay.
            Below are the unsummarized raw sources retrieved for this topic.
          </p>
        </div>
      </div>

      <!-- Headline & Status -->
      <div class="space-y-2">
        <h4 class="text-lg font-bold font-serif text-stone-900 dark:text-white">
          {{ headline || "Topic Coverage (Raw Sources)" }}
        </h4>
        <p class="text-xs text-stone-600 dark:text-stone-300 italic">
          "Full AI thematic analysis and executive summary bullet points could
          not be generated at this time."
        </p>
      </div>

      <!-- Raw Sources List -->
      <div v-if="sources && sources.length > 0" class="space-y-3 pt-2">
        <h5
          class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5"
        >
          <UIcon name="i-heroicons-newspaper" class="w-4 h-4" />
          Retrieved Raw Sources ({{ sources.length }})
        </h5>
        <div class="space-y-2">
          <div
            v-for="(src, idx) in sources"
            :key="idx"
            class="p-3 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="text-xs font-mono text-stone-400 shrink-0"
                >[{{ idx + 1 }}]</span
              >
              <div class="min-w-0">
                <a
                  v-if="src.url"
                  :href="src.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-bold text-stone-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-1"
                >
                  {{ src.title }}
                </a>
                <span
                  v-else
                  class="text-sm font-bold text-stone-900 dark:text-white line-clamp-1"
                >
                  {{ src.title }}
                </span>
                <span class="text-xs text-stone-500 dark:text-stone-400">
                  {{ src.source }}
                </span>
              </div>
            </div>
            <a
              v-if="src.url"
              :href="src.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-medium text-primary-500 hover:underline shrink-0 flex items-center gap-1 self-end sm:self-center"
            >
              <span>Read Source</span>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-3.5 h-3.5"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div
        class="pt-4 flex flex-wrap gap-3 items-center justify-between border-t border-stone-200 dark:border-stone-800"
      >
        <span class="text-xs text-stone-400 font-sans">
          Click below to re-trigger the AI summarization process.
        </span>
        <UButton
          color="warning"
          variant="solid"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          :disabled="loading"
          label="Retry AI Summarization"
          class="shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          @click="$emit('retry')"
        />
      </div>
    </UCard>

    <!-- DEBUG_ERROR_UI Showcase Mode -->
    <div
      v-if="isDebug"
      class="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 space-y-3"
    >
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
        >
          <UIcon name="i-heroicons-bug-ant" class="w-4 h-4" />
          DEBUG_ERROR_UI: Summary Process Failure Preview
        </span>
        <UBadge color="warning" variant="soft" size="xs"
          >Testing & Design Mode</UBadge
        >
      </div>
      <p class="text-xs text-stone-500 dark:text-stone-400">
        This demonstrates the Summary Fallback component layout when Gemini API
        summarization fails or encounters rate limits.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RawSource {
  title: string;
  source: string;
  url?: string;
}

defineProps<{
  headline?: string;
  sources?: RawSource[];
  error?: string | null;
  loading?: boolean;
  isDebug?: boolean;
}>();

defineEmits<{
  (e: "retry"): void;
}>();
</script>
