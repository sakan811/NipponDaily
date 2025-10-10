<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-(--color-hai)/20 hover:border-(--color-mizu)/30">
    <!-- News Header -->
    <div class="p-6">
      <div class="flex items-start justify-between mb-3">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
          :class="categoryColorClass"
        >
          {{ news.category }}
        </span>
        <span class="text-xs text-gray-500">
          {{ formatDate(news.publishedAt) }}
        </span>
      </div>

      <!-- News Title -->
      <h3 class="text-xl font-bold text-(--color-kuro) mb-3 line-clamp-2 font-serif leading-tight">
        {{ news.title }}
      </h3>

      <!-- News Summary -->
      <p class="text-(--color-samurai) mb-4 line-clamp-3 leading-relaxed">
        {{ news.summary }}
      </p>

      <!-- Source -->
      <div class="flex items-center text-sm text-(--color-hai) mb-4">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        {{ news.source }}
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="$emit('chat', news)"
          class="flex items-center px-3 py-2 bg-(--color-mizu) text-white text-sm rounded-lg hover:bg-(--color-mizu)/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Ask about this
        </button>

        <button
          @click="toggleExpand"
          class="flex items-center px-3 py-2 bg-(--color-hai)/20 text-(--color-samurai) text-sm rounded-lg hover:bg-(--color-hai)/30 transition-all duration-200 border border-(--color-hai)/30"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ isExpanded ? 'Show Less' : 'Read More' }}
        </button>

        <button
          @click="$emit('summarize', news)"
          class="flex items-center px-3 py-2 bg-(--color-midori) text-white text-sm rounded-lg hover:bg-(--color-midori)/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          AI Summary
        </button>

        <a
          v-if="news.url"
          :href="news.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center px-3 py-2 bg-(--color-ki) text-white text-sm rounded-lg hover:bg-(--color-ki)/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read Original
        </a>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="border-t border-(--color-hai)/20 p-6 bg-(--color-yuki)/30">
      <h4 class="font-semibold text-(--color-kuro) mb-2 font-serif">Full Article Content</h4>
      <div class="text-(--color-samurai) whitespace-pre-wrap leading-relaxed">
        {{ news.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/index'

interface Props {
  news: NewsItem
}

const props = defineProps<Props>()

defineEmits<{
  chat: [news: NewsItem]
  summarize: [news: NewsItem]
}>()

const isExpanded = ref(false)

const categoryColorClass = computed(() => {
  const category = props.news.category.toLowerCase()
  const colorMap: Record<string, string> = {
    politics: 'bg-(--color-mizu)/20 text-(--color-mizu)',
    business: 'bg-(--color-midori)/20 text-(--color-midori)',
    technology: 'bg-(--color-ki)/20 text-(--color-ki)',
    culture: 'bg-(--color-sakura)/20 text-(--color-sakura)',
    sports: 'bg-(--color-japan-red)/20 text-(--color-japan-red)'
  }
  return colorMap[category] || 'bg-gray-100 text-gray-800'
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
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

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>