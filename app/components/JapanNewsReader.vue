<template>
  <div class="min-h-screen bg-gradient-mizu">
    <!-- Header -->
    <header class="bg-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                <rect width="900" height="600" fill="#ffffff"/>
                <circle cx="450" cy="300" r="180" fill="#bc002d"/>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-kuro font-serif">NipponDaily</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="refreshNews"
              :disabled="loading"
              class="btn-box rounded-md disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
            >
              <span v-if="loading">Getting...</span>
              <span v-else>Get News</span>
            </button>
            <span class="text-sm text-hai">
              Last updated: {{ lastUpdated }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 gap-8">
        <!-- News Section -->
        <div>
          <!-- Category Filter -->
          <div class="mb-6">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm focus-ring',
                  selectedCategory === category.id
                    ? 'btn-primary'
                    : 'btn-outline'
                ]"
              >
                {{ category.name }}
              </button>
            </div>
          </div>

          <!-- News Loading State -->
          <div v-if="loading && news.length === 0" class="space-y-4">
            <div v-for="i in 3" :key="i" class="card p-6">
              <div class="loading-skeleton h-4 mb-2"></div>
              <div class="loading-skeleton h-3 mb-2"></div>
              <div class="loading-skeleton h-20"></div>
            </div>
          </div>

          <!-- News List -->
          <div v-else class="space-y-4">
            <!-- Instruction text when no news is loaded -->
            <div v-if="news.length === 0 && !loading" class="card p-8 text-center">
              <div class="mb-4">
                <svg class="w-16 h-16 mx-auto text-mizu opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-kuro mb-2">No news loaded yet</h3>
              <p class="text-hai">Click the "Get News" button in the header above to fetch the latest news from Japan</p>
            </div>
            <NewsCard
              v-for="item in filteredNews"
              :key="item.title"
              :news="item"
            />
          </div>

          <!-- Error State -->
          <div v-if="error" class="card p-6 text-center border-red-200 bg-red-50">
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button
              @click="refreshNews"
              class="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/index'

// State
const news = ref<NewsItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedCategory = ref('all')
const lastUpdated = ref<string>('Never')

// Categories
const categories = [
  { id: 'all', name: 'All News' },
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'culture', name: 'Culture' },
  { id: 'sports', name: 'Sports' }
]

// Computed
const filteredNews = computed(() => {
  if (selectedCategory.value === 'all') {
    return news.value
  }
  return news.value.filter(item =>
    item.category.toLowerCase() === selectedCategory.value.toLowerCase()
  )
})

// Methods
const fetchNews = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await $fetch('/api/news', {
      query: {
        category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
        limit: 20
      }
    })

    news.value = data || []
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (err: any) {
    console.error('Error fetching news:', err)
    error.value = err.data?.error || 'Failed to fetch news. Please try again.'
  } finally {
    loading.value = false
  }
}

const refreshNews = async () => {
  await fetchNews()
}

// Lifecycle - Auto-fetch removed, news only loads when button is clicked

// Define component name for clarity
defineOptions({
  name: 'JapanNewsReader'
})
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>