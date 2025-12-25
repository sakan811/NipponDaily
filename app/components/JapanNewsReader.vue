<template>
  <div class="min-h-screen">
    <!-- Header -->
    <UHeader
      v-model:open="mobileMenuOpen"
    >
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img
            src="/favicon.ico"
            alt="NipponDaily"
            class="w-6 h-6"
          />
          <span>{{ appName }}</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2 hidden lg:flex">
          <div class="flex items-center gap-2">
            <label for="newsAmount" class="text-sm text-[var(--color-text-muted)]">
              News:
            </label>
            <UInput
              id="newsAmount"
              v-model.number="newsAmount"
              type="number"
              :min="1"
              :max="20"
              placeholder="10"
              :disabled="loading"
              size="sm"
              class="w-20"
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="targetLanguage" class="text-sm text-[var(--color-text-muted)]">
              Lang:
            </label>
            <UInput
              id="targetLanguage"
              v-model="targetLanguage"
              type="text"
              placeholder="English"
              :disabled="loading"
              size="sm"
              class="w-28"
            />
          </div>
          <UButton
            @click="refreshNews"
            :disabled="loading"
            :loading="loading"
            color="primary"
            size="sm"
            icon="i-heroicons-magnifying-glass"
          >
            <span class="hidden sm:inline">{{ loading ? "Getting..." : "Get News" }}</span>
          </UButton>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <div class="space-y-3">
            <div>
              <label for="mobileNewsAmount" class="text-sm text-[var(--color-text-muted)]">
                News count (1-20):
              </label>
              <UInput
                id="mobileNewsAmount"
                v-model.number="newsAmount"
                type="number"
                :min="1"
                :max="20"
                placeholder="10"
                :disabled="loading"
                class="w-full mt-1"
              />
            </div>
            <div>
              <label for="mobileTargetLanguage" class="text-sm text-[var(--color-text-muted)]">
                Translate to:
              </label>
              <UInput
                id="mobileTargetLanguage"
                v-model="targetLanguage"
                type="text"
                placeholder="English"
                :disabled="loading"
                class="w-full mt-1"
              />
            </div>
            <UButton
              @click="async () => { await refreshNews(); mobileMenuOpen = false; }"
              :disabled="loading"
              :loading="loading"
              color="primary"
              block
              icon="i-heroicons-magnifying-glass"
            >
              {{ loading ? "Getting..." : "Get News" }}
            </UButton>
          </div>
        </div>
      </template>
    </UHeader>

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
              <UButton
                v-for="timeRange in timeRangeOptions"
                :key="timeRange.id"
                @click="selectedTimeRange = timeRange.id"
                :title="`Filter news by ${timeRange.name.toLowerCase()}`"
                :color="selectedTimeRange === timeRange.id ? 'primary' : 'secondary'"
                :variant="selectedTimeRange === timeRange.id ? 'solid' : 'outline'"
                size="xs"
                :label="timeRange.name"
              />
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
              <UButton
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :title="
                  category.id === 'all'
                    ? 'Show all categories'
                    : `Filter news by ${category.name}`
                "
                :color="selectedCategory === category.id ? 'primary' : 'secondary'"
                :variant="selectedCategory === category.id ? 'solid' : 'outline'"
                size="xs"
                :label="category.name"
              />
            </div>
          </div>

          <!-- News Loading State -->
          <div v-if="loading && news.length === 0" class="card p-8 text-center">
            <div class="flex justify-center items-center space-x-2">
              <div
                class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave"
              ></div>
              <div
                class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave"
                style="animation-delay: 0.2s"
              ></div>
              <div
                class="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-wave"
                style="animation-delay: 0.4s"
              ></div>
            </div>
            <p class="mt-4 text-[var(--color-text-muted)] text-sm">
              Fetching latest news from Japan...
            </p>
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
                Select your preferred time range and category, set the number of
                articles to fetch (1-20), then click "Get News" to fetch
                targeted news from Japan
              </p>
              <p class="text-sm opacity-70">
                <em
                  >Tip: Time range and category filters will affect the search
                  results, not just the display. The news count controls how
                  many articles to fetch.</em
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
            <UButton color="primary" @click="refreshNews">Try Again</UButton>
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
const mobileMenuOpen = ref(false);
const appName = "NipponDaily";
const selectedCategory = ref<CategoryId>("all");
const selectedTimeRange = ref<"none" | "day" | "week" | "month" | "year">(
  "week",
);
const targetLanguage = ref("English");
const newsAmount = ref(10);

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
        language: targetLanguage.value || "English",
        limit: newsAmount.value,
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
  // Validate news amount before fetching
  if (newsAmount.value > 20) {
    newsAmount.value = 20;
  }
  if (newsAmount.value < 1) {
    newsAmount.value = 1;
  }
  await fetchNews();
};

// Lifecycle - Auto-fetch removed, news only loads when button is clicked

// Define component name for clarity
defineOptions({
  name: "JapanNewsReader",
});
</script>