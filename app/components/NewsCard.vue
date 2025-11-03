<template>
  <div class="card hover:border-secondary-100">
    <!-- News Header -->
    <div class="p-6">
      <div class="flex items-start justify-between mb-3">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
          :class="categoryColorClass"
        >
          {{ news.category }}
        </span>
        <span class="text-xs text-(--color-hai)">
          {{ formatDate(news.publishedAt) }}
        </span>
      </div>

      <!-- News Title -->
      <h3 class="text-xl font-bold text-kuro mb-3 line-clamp-2 font-serif leading-tight">
        {{ news.title }}
      </h3>

      <!-- News Summary -->
      <p class="text-text-light mb-4 leading-relaxed">
        {{ news.summary }}
      </p>

      <!-- Source -->
      <div class="flex items-center text-sm text-hai mb-4">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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
          class="btn-box rounded-md flex items-center text-sm px-3 py-2 inline-flex no-underline"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read Original
        </a>
      </div>
    </div>

    </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~~/types/index'

interface Props {
  news: NewsItem
}

const props = defineProps<Props>()

const categoryColorClass = computed(() => {
  const category = props.news.category.toLowerCase()
  const colorMap: Record<string, string> = {
    politics: 'badge-politics',
    business: 'badge-business',
    technology: 'badge-technology',
    culture: 'badge-culture',
    sports: 'badge-sports'
  }
  return colorMap[category] || 'bg-gray-100 text-gray-800'
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Unknown date'
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Unknown date'
  }
}
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>