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
        <div class="flex items-center gap-2 hidden lg:flex">
          <UColorModeButton />
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
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
          <UButton
            @click="refreshNews"
            :disabled="loading"
            :loading="loading"
            color="primary"
            size="sm"
            icon="i-heroicons-magnifying-glass"
          >
            <span class="hidden sm:inline">{{
              loading ? "Getting..." : "Get News"
            }}</span>
          </UButton>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <UColorModeButton block />
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
              @click="
                async () => {
                  await refreshNews();
                  mobileMenuOpen = false;
                }
              "
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
                  @click="selectedTimeRange = timeRange.id"
                  :color="
                    selectedTimeRange === timeRange.id ? 'primary' : 'secondary'
                  "
                  :variant="
                    selectedTimeRange === timeRange.id ? 'solid' : 'outline'
                  "
                  size="xs"
                  :label="timeRange.name"
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
                            .padStart(2, '0')} - ${customDateRange.end.year}-${customDateRange.end.month
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
                  @click="selectedCategory = category.id"
                  :color="
                    selectedCategory === category.id ? 'primary' : 'secondary'
                  "
                  :variant="
                    selectedCategory === category.id ? 'solid' : 'outline'
                  "
                  size="xs"
                  :label="category.name"
                />
              </UTooltip>
            </div>
          </div>

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
            <UCard v-if="news.length === 0 && !loading" class="text-center">
              <div class="p-8">
                <div class="mb-4">
                  <svg
                    class="w-16 h-16 mx-auto text-secondary-500 opacity-50"
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
                <h3 class="text-xl font-semibold mb-2">
                  No news loaded yet
                </h3>
                <p class="text-secondary-500 mb-4">
                  Select your preferred time range and category, set the number
                  of articles to fetch (1-20), then click "Get News" to fetch
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
            </UCard>
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

          <!-- Error State -->
          <UCard v-if="error" data-testid="error-state" class="text-center">
            <div class="p-6">
              <p class="text-primary-500 mb-4">{{ error }}</p>
              <UButton color="primary" @click="refreshNews">Try Again</UButton>
            </div>
          </UCard>
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
const customDateRange = ref({
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

  try {
    // Map locale code to language name for API
    const localeObject = Object.values(locales).find(
      (l) => l.code === targetLanguage.value,
    );
    const languageName = localeObject?.name || "English";

    // Build query parameters
    const query: Record<string, string | number | undefined> = {
      category:
        selectedCategory.value === "all" ? undefined : selectedCategory.value,
      language: languageName,
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
