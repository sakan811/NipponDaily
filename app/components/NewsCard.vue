<template>
  <UCard
    :ui="{
      root: 'hover:border-[var(--color-primary)] w-full overflow-hidden transition-colors duration-200',
    }"
  >
    <!-- News Header -->
    <div class="p-4 sm:p-6">
      <div class="flex items-start justify-between mb-3">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
          :class="categoryColorClass"
        >
          {{ news.category }}
        </span>
        <span class="text-xs text-[var(--color-text-muted)]">
          {{ formatDate(news.publishedAt) }}
        </span>
      </div>

      <!-- News Title -->
      <h3
        class="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-3 font-serif leading-tight [word-wrap:break-word] [overflow-wrap:break-word]"
      >
        {{ news.title }}
      </h3>

      <!-- News Summary -->
      <p
        class="text-[var(--color-text-muted)] mb-4 leading-relaxed text-sm sm:text-base [word-wrap:break-word] [overflow-wrap:break-word]"
      >
        {{ news.summary }}
      </p>

      <!-- Source and Credibility -->
      <div class="space-y-3 mb-4">
        <!-- Source -->
        <div class="flex items-center text-sm text-[var(--color-text-muted)]">
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          {{ news.source }}
        </div>

        <!-- Credibility Score -->
        <div
          v-if="news.credibilityScore !== undefined"
          class="flex items-center text-sm"
        >
          <div class="flex items-center mr-2">
            <svg
              class="w-4 h-4 mr-1"
              :class="credibilityIconColor"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="news.credibilityScore >= 0.8"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
              <path
                v-else-if="news.credibilityScore >= 0.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
              <path
                v-else
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
            <span :class="credibilityTextColor">
              Credibility: {{ Math.round(news.credibilityScore * 100) }}%
            </span>
          </div>

          <!-- Detailed credibility tooltip -->
          <UTooltip
            v-if="news.credibilityMetadata"
            :content="{ side: 'bottom', align: 'center' }"
          >
            <template #default>
              <button
                class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
                :aria-label="`Detailed credibility information for ${news.source}`"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </template>

            <template #content>
              <div
                class="bg-gray-900 text-white px-4 py-3 rounded shadow-lg space-y-1 whitespace-nowrap"
                style="min-width: max-content"
              >
                <div>
                  Source Reputation:
                  {{
                    Math.round(news.credibilityMetadata.sourceReputation * 100)
                  }}%
                </div>
                <div>
                  Domain Trust:
                  {{ Math.round(news.credibilityMetadata.domainTrust * 100) }}%
                </div>
                <div>
                  Content Quality:
                  {{
                    Math.round(news.credibilityMetadata.contentQuality * 100)
                  }}%
                </div>
                <div>
                  AI Confidence:
                  {{ Math.round(news.credibilityMetadata.aiConfidence * 100) }}%
                </div>
              </div>
            </template>
          </UTooltip>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <a
          v-if="news.url"
          :href="news.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-box flex items-center text-xs sm:text-sm px-2 sm:px-3 py-2 inline-flex no-underline min-w-0 flex-shrink-0"
        >
          <svg
            class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span class="truncate">Read Original</span>
        </a>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NewsItem } from "~~/types/index";

interface Props {
  news: NewsItem;
}

const props = defineProps<Props>();

const categoryColorClass = computed(() => {
  const category = props.news.category.toLowerCase();
  const colorMap: Record<string, string> = {
    politics: "badge-politics",
    business: "badge-business",
    technology: "badge-technology",
    culture: "badge-culture",
    sports: "badge-sports",
  };
  return (
    colorMap[category] || "bg-[var(--color-accent)] text-[var(--color-text)]"
  );
});

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "Date not available";
  }
  try {
    const date = new Date(dateString);
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return "Date not available";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date not available";
  }
};

const credibilityIconColor = computed(() => {
  if (!props.news.credibilityScore) return "text-[var(--color-text-muted)]";

  if (props.news.credibilityScore >= 0.8) {
    return "text-[var(--color-primary)]"; // Dark Coral for high credibility
  } else if (props.news.credibilityScore >= 0.5) {
    return "text-yellow-600"; // Yellow for medium credibility (using direct color as accent)
  } else {
    return "text-[var(--color-secondary)]"; // Cadet for low credibility
  }
});

const credibilityTextColor = computed(() => {
  if (!props.news.credibilityScore) return "text-[var(--color-text-muted)]";

  if (props.news.credibilityScore >= 0.8) {
    return "text-[var(--color-primary)]"; // Dark Coral for high credibility
  } else if (props.news.credibilityScore >= 0.5) {
    return "text-yellow-700"; // Yellow for medium credibility
  } else {
    return "text-[var(--color-secondary)]"; // Cadet for low credibility
  }
});
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>
