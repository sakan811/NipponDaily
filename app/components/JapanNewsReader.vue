<template>
  <div class="min-h-screen">
    <!-- Header -->
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>{{ appName }}</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />
          <div class="flex items-center gap-2 hidden lg:flex">
            <label for="newsAmount" class="text-sm text-secondary-500">
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
          <div class="flex items-center gap-2 hidden lg:flex">
            <label for="targetLanguage" class="text-sm text-secondary-500">
              Lang:
            </label>
            <ULocaleSelect
              id="targetLanguage"
              v-model="targetLanguage"
              :locales="Object.values(locales)"
              :disabled="loading"
              size="sm"
              class="w-36"
            />
          </div>
          <div class="hidden lg:flex">
            <UButton
              :disabled="loading"
              :loading="loading"
              color="primary"
              size="sm"
              icon="i-heroicons-magnifying-glass"
              @click="refreshNews"
            >
              <span class="hidden sm:inline">{{
                loading ? "Getting..." : "Get News"
              }}</span>
            </UButton>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <div class="space-y-3">
            <div>
              <label for="mobileNewsAmount" class="text-sm text-secondary-500">
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
              <label
                for="mobileTargetLanguage"
                class="text-sm text-secondary-500"
              >
                Translate to:
              </label>
              <ULocaleSelect
                id="mobileTargetLanguage"
                v-model="targetLanguage"
                :locales="Object.values(locales)"
                :disabled="loading"
                class="w-full mt-1"
              />
            </div>
            <UButton
              :disabled="loading"
              :loading="loading"
              color="primary"
              block
              icon="i-heroicons-magnifying-glass"
              @click="
                async () => {
                  await refreshNews();
                  mobileMenuOpen = false;
                }
              "
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
            <p class="text-sm text-secondary-500 mb-2 max-w-fit">
              <em>Select a time range to focus news search results</em>
            </p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
              <UTooltip
                v-for="timeRange in timeRangeOptions"
                :key="timeRange.id"
                :text="`Filter news by ${timeRange.name.toLowerCase()}`"
              >
                <UButton
                  :color="
                    selectedTimeRange === timeRange.id ? 'primary' : 'secondary'
                  "
                  :variant="
                    selectedTimeRange === timeRange.id ? 'solid' : 'outline'
                  "
                  size="xs"
                  :label="timeRange.name"
                  @click="selectedTimeRange = timeRange.id"
                />
              </UTooltip>
            </div>

            <!-- Custom Date Range Picker -->
            <div
              v-if="selectedTimeRange === 'custom'"
              class="mt-3 grid grid-cols-1 gap-4"
            >
              <div>
                <UPopover>
                  <UButton
                    icon="i-heroicons-calendar-days-20-solid"
                    :label="
                      customDateRange.start && customDateRange.end
                        ? `${customDateRange.start.year}-${customDateRange.start.month
                            .toString()
                            .padStart(2, '0')}-${customDateRange.start.day
                            .toString()
                            .padStart(
                              2,
                              '0',
                            )} - ${customDateRange.end.year}-${customDateRange.end.month
                            .toString()
                            .padStart(2, '0')}-${customDateRange.end.day
                            .toString()
                            .padStart(2, '0')}`
                        : 'Select date range'
                    "
                    variant="outline"
                    color="secondary"
                    size="sm"
                    block
                  />
                  <template #content>
                    <UCalendar
                      v-model="customDateRange"
                      :min-value="minDate"
                      :max-value="maxDate"
                      :number-of-months="2"
                      range
                      class="p-2"
                    />
                  </template>
                </UPopover>
              </div>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="mb-4 sm:mb-6">
            <p class="text-sm text-secondary-500 mb-2 max-w-fit">
              <em
                >Choose categories to filter both search and displayed
                results</em
              >
            </p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
              <UTooltip
                v-for="category in categories"
                :key="category.id"
                :text="
                  category.id === 'all'
                    ? 'Show all categories'
                    : `Filter news by ${category.name}`
                "
              >
                <UButton
                  :color="
                    selectedCategory === category.id ? 'primary' : 'secondary'
                  "
                  :variant="
                    selectedCategory === category.id ? 'solid' : 'outline'
                  "
                  size="xs"
                  :label="category.name"
                  @click="selectedCategory = category.id"
                />
              </UTooltip>
            </div>
          </div>

          <!-- Error State -->
          <UCard
            v-if="error"
            data-testid="error-state"
            :ui="{
              base: {
                background: 'bg-white dark:bg-gray-900',
                divide: 'divide-y divide-gray-200 dark:divide-gray-800',
                rounded: 'rounded-lg',
                shadow: 'shadow',
              },
              body: {
                base: 'p-4 sm:p-6',
                background: '',
                padding: 'px-4 py-5 sm:p-6',
              },
            }"
            class="text-center"
          >
            <div class="p-2">
              <!-- Rate Limit Error -->
              <div v-if="isRateLimitError" class="space-y-4">
                <div class="flex justify-center">
                  <svg
                    class="w-12 h-12 text-warning-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-warning-500 mb-2">
                    Daily Limit Reached
                  </h3>
                  <p class="text-secondary-500 mb-2">{{ error }}</p>
                  <p
                    v-if="rateLimitResetTime"
                    class="text-sm text-secondary-400"
                  >
                    Resets at: {{ rateLimitResetTime }}
                  </p>
                </div>
                <UButton
                  color="warning"
                  :disabled="loading"
                  @click="refreshNews"
                >
                  {{ loading ? "Checking..." : "Try Again" }}
                </UButton>
              </div>

              <!-- General Error -->
              <div v-else class="space-y-4">
                <p class="text-primary-500">{{ error }}</p>
                <UButton
                  color="primary"
                  :disabled="loading"
                  @click="refreshNews"
                >
                  {{ loading ? "Retrying..." : "Try Again" }}
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- News Loading State -->
          <div v-if="loading && news.length === 0" class="space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="h-48 w-full rounded-lg" />
            <p class="text-center text-secondary-500 text-sm mt-4">
              Fetching latest news from Japan...
            </p>
          </div>

          <!-- News List -->
          <div v-else class="space-y-4">
            <!-- Instruction text when no news is loaded -->
            <div
              v-if="news.length === 0 && !loading"
              class="bg-white dark:bg-gray-900 rounded-lg shadow text-center p-8"
              style="contain: layout style paint"
            >
              <div class="mb-4">
                <svg
                  class="w-16 h-16 mx-auto text-secondary-500 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">No news loaded yet</h3>
              <p
                class="mb-4"
                style="color: rgb(100 116 139); contain: layout style"
              >
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
              v-for="item in paginatedNews"
              :key="item.title"
              :news="item"
            />
          </div>

          <!-- Pagination -->
          <div
            v-if="filteredNews.length > itemsPerPage"
            class="flex justify-center mt-6"
          >
            <UPagination
              v-model:page="page"
              :total="filteredNews.length"
              :items-per-page="itemsPerPage"
              :sibling-count="1"
              show-edges
              color="primary"
              size="sm"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import type { NewsItem } from "~~/types/index";
import { NEWS_CATEGORIES } from "~~/constants/categories";
import type { CategoryId } from "~~/constants/categories";
import * as locales from "@nuxt/ui/locale";

// State
const news = ref<NewsItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);
const appName = "NipponDaily";
// Rate limit specific state
const rateLimitResetTime = ref<string | null>(null);
const isRateLimitError = ref(false);
const selectedCategory = ref<CategoryId>("all");
const selectedTimeRange = ref<
  "none" | "day" | "week" | "month" | "year" | "custom"
>("week");
const targetLanguage = ref("en");
const newsAmount = ref(10);
const page = ref(1);
const itemsPerPage = 3;

// Calendar state for custom date range
const today = new CalendarDate(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate(),
);
const minDate = new CalendarDate(2020, 1, 1); // Limit to reasonable past date
const maxDate = today;
// Initialize with defaults (7 days ago to today) as a range
const oneWeekAgo = today.subtract({ days: 7 });
const customDateRange = ref<{ start: typeof oneWeekAgo; end: typeof today }>({
  start: oneWeekAgo,
  end: today,
});

// Categories
const categories = NEWS_CATEGORIES;

// Time range options
const timeRangeOptions = [
  { id: "none", name: "All Time" },
  { id: "day", name: "Today" },
  { id: "week", name: "This Week" },
  { id: "month", name: "This Month" },
  { id: "year", name: "This Year" },
  { id: "custom", name: "Custom Range" },
] as const;

// Computed
const filteredNews = computed(() => {
  let result = news.value;
  if (selectedCategory.value !== "all") {
    result = news.value.filter(
      (item) =>
        item.category.toLowerCase() === selectedCategory.value.toLowerCase(),
    );
  }
  return result;
});

const paginatedNews = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredNews.value.slice(start, start + itemsPerPage);
});

// Watch
watch(selectedCategory, () => {
  page.value = 1;
});

watch(news, () => {
  page.value = 1;
});

// Methods
const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  // Reset rate limit state
  isRateLimitError.value = false;
  rateLimitResetTime.value = null;

  try {
    // Build query parameters - send locale code directly (validated server-side)
    const query: Record<string, string | number | undefined> = {
      category:
        selectedCategory.value === "all" ? undefined : selectedCategory.value,
      language: targetLanguage.value, // e.g., "en", "ja", "zh_cn"
      limit: newsAmount.value,
    };

    // Handle time range - for custom, pass startDate and endDate
    if (selectedTimeRange.value === "custom") {
      if (customDateRange.value.start && customDateRange.value.end) {
        query.startDate = `${customDateRange.value.start.year}-${customDateRange.value.start.month
          .toString()
          .padStart(2, "0")}-${customDateRange.value.start.day
          .toString()
          .padStart(2, "0")}`;
        query.endDate = `${customDateRange.value.end.year}-${customDateRange.value.end.month
          .toString()
          .padStart(2, "0")}-${customDateRange.value.end.day
          .toString()
          .padStart(2, "0")}`;
      } else {
        // If custom is selected but no dates are picked, default to week
        query.timeRange = "week";
      }
    } else {
      query.timeRange = selectedTimeRange.value;
    }

    const response = await $fetch<{
      success: boolean;
      data: NewsItem[];
      count: number;
      timestamp: string;
    }>("/api/news", {
      query,
    });

    news.value = response.data || [];
  } catch (err: unknown) {
    console.error("Error fetching news:", err);

    // Type guard for fetch error with data
    const errorData = err as {
      statusCode?: number;
      data?: {
        error?: string | unknown;
        resetTime?: string;
        limit?: number;
      };
    };

    // Check if this is a rate limit error (HTTP 429)
    if (errorData.statusCode === 429) {
      isRateLimitError.value = true;
      rateLimitResetTime.value = errorData.data?.resetTime || null;
      const errorMsg = errorData.data?.error;
      error.value =
        typeof errorMsg === "string"
          ? errorMsg
          : "Daily rate limit exceeded. Please try again tomorrow.";
    } else if (errorData.statusCode === 500) {
      // Rate limit service unavailable (Redis not configured)
      const errorMsg = errorData.data?.error;
      if (
        typeof errorMsg === "string" &&
        errorMsg.includes("Redis not configured")
      ) {
        error.value =
          "Rate limiting service is unavailable. Please contact the administrator to configure Redis.";
      } else {
        error.value =
          typeof errorMsg === "string"
            ? errorMsg
            : "Service temporarily unavailable. Please try again.";
      }
    } else {
      const errorMsg = errorData.data?.error;
      error.value =
        typeof errorMsg === "string"
          ? errorMsg
          : "Failed to fetch news. Please try again.";
    }
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
