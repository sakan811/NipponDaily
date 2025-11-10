<template>
  <div class="card hover:border-red-400 w-full overflow-hidden">
    <!-- News Header -->
    <div class="p-4 sm:p-6">
      <div class="flex items-start justify-between mb-3">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
          :class="categoryColorClass"
        >
          {{ news.category }}
        </span>
        <span class="text-xs text-slate-600">
          {{ formatDate(news.publishedAt) }}
        </span>
      </div>

      <!-- News Title -->
      <h3
        class="text-lg sm:text-xl font-bold text-slate-800 mb-3 font-serif leading-tight [word-wrap:break-word] [overflow-wrap:break-word]"
      >
        {{ news.title }}
      </h3>

      <!-- News Summary -->
      <p class="text-slate-600 mb-4 leading-relaxed text-sm sm:text-base [word-wrap:break-word] [overflow-wrap:break-word]">
        {{ news.summary }}
      </p>

      <!-- Source -->
      <div class="flex items-center text-sm text-slate-600 mb-4">
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

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <a
          v-if="news.url"
          :href="news.url"
          target="_blank"
          rel="noopener noreferrer"
          class="border-2 border-red-600 bg-yellow-50 text-slate-800 hover:bg-yellow-100 rounded-md flex items-center text-xs sm:text-sm px-2 sm:px-3 py-2 inline-flex no-underline min-w-0 flex-shrink-0"
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
  </div>
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
  return colorMap[category] || "bg-gray-100 text-gray-800";
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
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>
