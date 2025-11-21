<template>
  <div class="min-h-screen bg-[var(--color-text)]">
    <!-- Header -->
    <header class="bg-[var(--color-accent)] shadow-lg overflow-x-hidden">
      <div class="px-3 sm:px-4 py-4 sm:py-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div
              class="w-8 h-8 sm:w-12 sm:h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg overflow-hidden shrink-0"
            >
              <img
                src="/favicon.ico"
                alt="NipponDaily Logo"
                class="w-full h-full object-cover"
              />
            </div>
            <h1
              class="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)] font-serif truncate"
            >
              NipponDaily
            </h1>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <button
              @click="refreshNews"
              :disabled="loading"
              class="btn-box disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 sm:px-4 cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              <span v-if="loading">Getting...</span>
              <span v-else>Get News</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main
      class="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-full overflow-x-hidden"
    >
      <div class="grid grid-cols-1 gap-6 sm:gap-8">
        <!-- News Section -->
        <div>
          <!-- Time Range Filter -->
          <div class="mb-3 sm:mb-4">
            <p class="text-sm text-[var(--color-accent)] mb-2 max-w-fit">
              <em>Select a time range to focus news search results</em>
            </p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
              <button
                v-for="timeRange in timeRangeOptions"
                :key="timeRange.id"
                @click="selectedTimeRange = timeRange.id"
                :title="`Filter news by ${timeRange.name.toLowerCase()}`"
                :class="[
                  'px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm focus-ring',
                  selectedTimeRange === timeRange.id
                    ? 'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md hover:shadow-lg'
                    : 'border border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-accent)] hover:opacity-80',
                ]"
              >
                {{ timeRange.name }}
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="mb-4 sm:mb-6">
            <p class="text-sm text-[var(--color-accent)] mb-2 max-w-fit">
              <em
                >Choose categories to filter both search and displayed
                results</em
              >
            </p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :title="
                  category.id === 'all'
                    ? 'Show all categories'
                    : `Filter news by ${category.name}`
                "
                :class="[
                  'px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm focus-ring',
                  selectedCategory === category.id
                    ? 'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md hover:shadow-lg'
                    : 'border border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-accent)] hover:opacity-80',
                ]"
              >
                {{ category.name }}
              </button>
            </div>
          </div>

          <!-- News Loading State -->
          <div v-if="loading && news.length === 0" class="card p-8 text-center">
            <div class="flex justify-center items-center space-x-2">
              <div class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave"></div>
              <div class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave" style="animation-delay: 0.2s;"></div>
              <div class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave" style="animation-delay: 0.4s;"></div>
            </div>
            <p class="mt-4 text-[var(--color-text-muted)] text-sm">Fetching latest news from Japan...</p>
          </div>

          <!-- News List -->
          <div v-else class="space-y-4">
            <!-- Instruction text when no news is loaded -->
            <div
              v-if="news.length === 0 && !loading"
              class="card p-8 text-center"
            >
              <div class="mb-4">
                <svg
                  class="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-[var(--color-text)] mb-2">
                No news loaded yet
              </h3>
              <p class="text-[var(--color-text-muted)] mb-4">
                Select your preferred time range and category, then click "Get
                News" to fetch targeted news from Japan
              </p>
              <p class="text-sm opacity-70">
                <em
                  >Tip: Time range and category filters will affect the search
                  results, not just the display</em
                >
              </p>
            </div>
            <NewsCard
              v-for="item in filteredNews"
              :key="item.title"
              :news="item"
            />
          </div>

          <!-- Error State -->
          <div
            v-if="error"
            data-testid="error-state"
            class="card p-6 text-center border-[var(--color-border)] bg-opacity-20"
          >
            <p class="text-[var(--color-primary)] mb-4">{{ error }}</p>
            <button @click="refreshNews" class="btn-primary">Try Again</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from "~~/types/index";
import { NEWS_CATEGORIES } from "~~/constants/categories";
import type { CategoryId } from "~~/constants/categories";

// State
const news = ref<NewsItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCategory = ref<CategoryId>("all");
const selectedTimeRange = ref<"none" | "day" | "week" | "month" | "year">(
  "week",
);

// Categories
const categories = NEWS_CATEGORIES;

// Time range options
const timeRangeOptions = [
  { id: "none", name: "All Time" },
  { id: "day", name: "Today" },
  { id: "week", name: "This Week" },
  { id: "month", name: "This Month" },
  { id: "year", name: "This Year" },
] as const;

// Computed
const filteredNews = computed(() => {
  if (selectedCategory.value === "all") {
    return news.value;
  }
  return news.value.filter(
    (item) =>
      item.category.toLowerCase() === selectedCategory.value.toLowerCase(),
  );
});

// Methods
const fetchNews = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{
      success: boolean;
      data: NewsItem[];
      count: number;
      timestamp: string;
    }>("/api/news", {
      query: {
        category:
          selectedCategory.value === "all" ? undefined : selectedCategory.value,
        timeRange: selectedTimeRange.value,
        limit: 20,
      },
    });

    news.value = response.data || [];
  } catch (err: unknown) {
    console.error("Error fetching news:", err);
    error.value =
      (err as { data?: { error?: string } })?.data?.error ||
      "Failed to fetch news. Please try again.";
  } finally {
    loading.value = false;
  }
};

const refreshNews = async () => {
  await fetchNews();
};

// Lifecycle - Auto-fetch removed, news only loads when button is clicked

// Define component name for clarity
defineOptions({
  name: "JapanNewsReader",
});
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>
