<template>
  <UCard
    :ui="{
      root: 'w-full shadow-md transition-shadow duration-200 hover:shadow-lg border-t-4 border-t-primary-500',
    }"
  >
    <div class="p-4 sm:p-6 space-y-6">
      <div class="border-b dark:border-gray-800 pb-4">
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft" size="md">
              Executive Briefing
            </UBadge>
            <UTooltip
              v-if="briefing.isAiFallback"
              text="AI Synthesis Failed - Displaying Raw Data"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5 text-warning-500 animate-pulse"
                aria-hidden="true"
              />
            </UTooltip>
          </div>
          
          <div
            v-if="briefing.overallCredibilityScore !== undefined"
            class="flex items-center text-sm font-medium"
            :style="{ color: getCredibilityColor(briefing.overallCredibilityScore) }"
          >
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 mr-1" />
            Trust Score: {{ Math.round(briefing.overallCredibilityScore * 100) }}%
          </div>
        </div>
        
        <h2 class="text-2xl sm:text-3xl font-bold font-serif leading-tight text-gray-900 dark:text-white [word-wrap:break-word]">
          {{ briefing.mainHeadline }}
        </h2>
      </div>

      <div>
        <h3 class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
          Summary
        </h3>
        <p class="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200 [word-wrap:break-word] whitespace-pre-line">
          {{ briefing.executiveSummary }}
        </p>
      </div>

      <div class="bg-primary-50/50 dark:bg-primary-950/20 p-4 sm:p-5 rounded-xl border border-primary-100 dark:border-primary-900">
        <h3 class="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UIcon name="i-heroicons-link" class="w-4 h-4" />
          Cross-Source Analysis
        </h3>
        <p class="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ briefing.thematicAnalysis }}
        </p>
      </div>

      <div class="border-t dark:border-gray-800 pt-5 mt-6">
        <h3 class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <UIcon name="i-heroicons-globe-alt" class="w-4 h-4" />
          Sources Consulted ({{ briefing.sourcesProcessed.length }})
        </h3>
        
        <ul class="space-y-3">
          <li
            v-for="(source, idx) in briefing.sourcesProcessed"
            :key="idx"
            class="flex items-start gap-3 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div 
              class="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getCredibilityColor(source.credibilityScore) }"
              :title="`Source Trust: ${Math.round(source.credibilityScore * 100)}%`"
            ></div>
            
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span class="font-semibold text-gray-900 dark:text-gray-100 truncate flex-shrink-0 max-w-full sm:max-w-[150px]">
                  {{ source.source }}
                </span>
                
                <a
                  v-if="source.url"
                  :href="source.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 dark:text-primary-400 hover:underline leading-snug line-clamp-2 sm:line-clamp-1"
                >
                  {{ source.title }}
                </a>
                <span v-else class="text-gray-600 dark:text-gray-400 leading-snug line-clamp-2 sm:line-clamp-1">
                  {{ source.title }}
                </span>
              </div>
            </div>
            
            <a
              v-if="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-primary-500 p-1 flex-shrink-0"
              aria-label="Read original article"
            >
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { NewsBriefing } from "~~/types/index";

const props = defineProps<{
  briefing: NewsBriefing;
}>();

// Helper function to generate gradient color from red (0%) to green (100%)
const getCredibilityColor = (score: number | undefined): string => {
  if (score === undefined || score === null) {
    return "var(--ui-color-neutral-500)";
  }
  // Map score (0-1) to hue (0-120): 0% = red (hue 0), 100% = green (hue 120)
  const hue = Math.round(score * 120);
  return `hsl(${hue}, 70%, 45%)`;
};
</script>
