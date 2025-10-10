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
              <span v-if="loading">Refreshing...</span>
              <span v-else>Refresh News</span>
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- News Section -->
        <div class="lg:col-span-2">
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
            <NewsCard
              v-for="item in filteredNews"
              :key="item.title"
              :news="item"
              @chat="openChatWithNews"
              @summarize="summarizeNews"
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

        <!-- Chat Section -->
        <div class="lg:col-span-1">
          <ChatInterface
            ref="chatRef"
            :news-context="news"
            @message="handleChatMessage"
          />
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
const chatRef = ref<any>(null)

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

const openChatWithNews = (newsItem: NewsItem) => {
  const question = `Tell me more about "${newsItem.title}"`
  if (chatRef.value) {
    chatRef.value.sendMessage(question)
  }
}

const summarizeNews = async (newsItem: NewsItem) => {
  try {
    const { data } = await $fetch('/api/summarize', {
      method: 'POST',
      body: { newsItem }
    })

    // Show summary in chat
    if (chatRef.value) {
      chatRef.value.addMessage({
        type: 'bot',
        content: `**AI Summary of "${newsItem.title}":**\n\n${data.aiSummary}`,
        sources: [newsItem.source]
      })
    }
  } catch (err: any) {
    console.error('Error summarizing news:', err)
    if (chatRef.value) {
      chatRef.value.addMessage({
        type: 'bot',
        content: 'Sorry, I couldn\'t generate a summary for this article.'
      })
    }
  }
}

const handleChatMessage = async (message: string) => {
  try {
    const { data } = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message,
        newsContext: news.value
      }
    })

    return {
      message: data.data.message,
      sources: data.data.sources
    }
  } catch (err: any) {
    console.error('Error in chat:', err)
    throw new Error(err.data?.error || 'Failed to process your message')
  }
}

// Lifecycle
onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>