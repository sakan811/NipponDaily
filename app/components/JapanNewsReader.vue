<template>
  <div class="min-h-screen">
    <UHeader
      v-model:open="mobileMenuOpen"
      class="border-b border-stone-200 dark:border-stone-800 bg-[#FCFBF7]/90 dark:bg-[#0B0E14]/90 backdrop-blur-md"
    >
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <div class="flex flex-col">
            <span
              class="font-serif font-bold text-sm tracking-wide leading-none"
              >NIPPON DAILY</span
            >
          </div>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <main class="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <!-- News Feed & Controls Column -->
      <div class="space-y-6">
        <div>
          <div class="mb-3 sm:mb-4">
            <p class="text-sm text-secondary-500 mb-2 max-w-fit">
              <em>{{ t.timeRangeSubtitle }}</em>
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
                  :label="getTimeRangeLabel(timeRange.id)"
                  @click="
                    () => {
                      selectedTimeRange = timeRange.id;
                    }
                  "
                />
              </UTooltip>
            </div>

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
                        : t.selectDateRange
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

          <div class="mb-4 sm:mb-6">
            <p class="text-sm text-secondary-500 mb-2 max-w-fit">
              <em>{{ t.categorySubtitle }}</em>
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
                  :label="
                    t.categories[category.id as keyof typeof t.categories]
                  "
                  @click="
                    () => {
                      selectedCategory = category.id;
                    }
                  "
                />
              </UTooltip>
            </div>
          </div>

          <UCard
            v-if="error || isDebugErrorUi"
            data-testid="error-state"
            :ui="{
              root: 'w-full shadow-md text-center mb-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg',
              body: 'p-4 sm:p-6',
            }"
          >
            <div class="p-2 space-y-4">
              <p class="text-error-500 font-medium">
                {{
                  error || "Service temporarily unavailable. Please try again."
                }}
              </p>
              <UButton color="error" :disabled="loading" @click="refreshNews">
                {{ t.tryAgain }}
              </UButton>
            </div>
          </UCard>

          <div v-if="loading" class="space-y-6">
            <UCard class="w-full shadow-md border-t-4 border-t-primary-500">
              <div class="p-4 sm:p-6 space-y-6">
                <div class="pb-4">
                  <USkeleton class="h-6 w-32 mb-3 rounded-full" />
                  <USkeleton class="h-10 w-3/4 rounded-lg" />
                </div>
                <div class="space-y-2">
                  <USkeleton class="h-4 w-24 mb-2" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-5/6" />
                </div>
                <div
                  class="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl space-y-2"
                >
                  <USkeleton class="h-4 w-32 mb-2" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-4/5" />
                </div>
              </div>
            </UCard>
            <p
              class="text-center text-secondary-500 text-sm mt-4 animate-pulse flex items-center justify-center gap-2"
            >
              <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5" />
              {{ t.aiSynthesizingMsg }}
            </p>
          </div>

          <div v-if="isDebugErrorUi && !error" class="mb-4">
            <div
              class="text-xs font-bold text-primary-500 mb-2 uppercase tracking-wider"
            >
              Mock: AI Fallback Card
            </div>
            <BriefingCard :briefing="mockFallbackBriefing" />
          </div>

          <!-- New Clustered Stories Trending Dashboard UI -->
          <div v-if="filteredStories.length > 0 && !loading" class="space-y-6">
            <!-- 1. Trending Stories Grid View -->
            <div v-if="!selectedStoryId">
              <h3
                class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"
              >
                <UIcon
                  name="i-heroicons-fire"
                  class="w-4 h-4 text-primary-500"
                />
                Trending Topics ({{ filteredStories.length }})
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div
                  v-for="story in filteredStories"
                  :key="story.id"
                  class="cursor-pointer border p-3 rounded-xl transition-all relative overflow-hidden bg-white/50 dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800"
                  @click="selectedStoryId = story.id"
                >
                  <!-- Header inside card -->
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      class="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 truncate max-w-[120px]"
                    >
                      {{ story.sources[0]?.source || "News Source" }}
                    </span>
                    <div class="flex items-center gap-2">
                      <UBadge
                        v-if="!story.isSummarized"
                        color="primary"
                        variant="soft"
                        size="xs"
                        class="animate-pulse"
                      >
                        Summarizing...
                      </UBadge>
                      <div
                        class="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400"
                      >
                        <UIcon
                          name="i-heroicons-fire"
                          class="w-3.5 h-3.5 text-primary-500"
                        />
                        <span>{{
                          Math.round(story.trendScore * 10) / 10
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- Headline -->
                  <h4
                    class="text-xs font-bold font-serif line-clamp-2 text-stone-900 dark:text-white leading-snug"
                  >
                    {{ story.headline }}
                  </h4>
                  <!-- Footer inside card -->
                  <div
                    class="flex items-center gap-2 mt-2 text-[10px] text-stone-400 dark:text-stone-500"
                  >
                    <span>{{ story.articleCount }} sources</span>
                    <span>•</span>
                    <span>{{ getRelativeTime(story.lastUpdated) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Selected Active Story Briefing Detail View (In-place) -->
            <div
              v-else-if="selectedStoryId && activeBriefingData"
              class="space-y-6"
            >
              <!-- 2.1 Briefing Summary Sub-page -->
              <div v-if="detailSubPage === 'summary'" class="space-y-6">
                <!-- Navigation buttons at the top -->
                <div
                  class="flex flex-wrap gap-2 justify-between items-center mb-4"
                >
                  <UButton
                    icon="i-heroicons-arrow-left"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    label="Back to Trending Topics"
                    @click="
                      () => {
                        selectedStoryId = null;
                      }
                    "
                  />
                  <UButton
                    icon="i-heroicons-clock"
                    color="primary"
                    variant="solid"
                    size="sm"
                    label="View Story Timeline"
                    @click="
                      () => {
                        detailSubPage = 'timeline';
                      }
                    "
                  />
                </div>

                <div
                  v-if="!activeStory?.isSummarized"
                  class="text-center p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                >
                  <UIcon
                    name="i-heroicons-cpu-chip"
                    class="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4"
                  />
                  <h3
                    class="text-lg font-bold text-stone-900 dark:text-white mb-2"
                  >
                    AI is Summarizing this Story
                  </h3>
                  <p class="text-sm text-stone-500 dark:text-stone-400">
                    Please check back in a few moments.
                  </p>
                </div>
                <BriefingCard
                  v-else
                  :briefing="activeBriefingData"
                  language="en"
                />
              </div>

              <!-- 2.2 Story Timeline Sub-page -->
              <div v-else-if="detailSubPage === 'timeline'" class="space-y-6">
                <!-- Navigation buttons at the top -->
                <div
                  class="flex flex-wrap gap-2 justify-between items-center mb-4"
                >
                  <UButton
                    icon="i-heroicons-arrow-left"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    label="Back to Summary"
                    @click="
                      () => {
                        detailSubPage = 'summary';
                      }
                    "
                  />
                  <UButton
                    icon="i-heroicons-home"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    label="Back to Trending Topics"
                    @click="
                      () => {
                        selectedStoryId = null;
                      }
                    "
                  />
                </div>

                <!-- Chronological Timeline Card -->
                <div
                  class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-6"
                >
                  <h3
                    class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"
                  >
                    <UIcon
                      name="i-heroicons-clock"
                      class="w-4 h-4 text-primary-500"
                    />
                    Story Timeline
                  </h3>
                  <div
                    class="relative pl-6 border-l-2 border-stone-200 dark:border-stone-800 space-y-6"
                  >
                    <div
                      v-for="(source, idx) in chronologicalSources"
                      :key="idx"
                      class="relative"
                    >
                      <!-- Dot indicator -->
                      <span
                        class="absolute left-[-31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-stone-900 border-2 border-primary-500"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-primary-500" />
                      </span>
                      <div class="space-y-1">
                        <div
                          class="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500"
                        >
                          <time>{{
                            new Date(source.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          }}</time>
                          <span>•</span>
                          <span class="font-semibold">{{ source.source }}</span>
                        </div>
                        <a
                          :href="source.url"
                          target="_blank"
                          class="text-sm font-bold hover:text-primary-500 transition-colors block"
                        >
                          {{ source.title }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty fallback if no stories match criteria -->
          <div
            v-else-if="
              !loading && !isDebugErrorUi && filteredStories.length === 0
            "
            class="bg-white dark:bg-gray-900 rounded-lg shadow text-center p-8 border border-gray-100 dark:border-gray-800"
            style="contain: layout style paint"
          >
            <div class="mb-4">
              <svg
                class="w-16 h-16 mx-auto text-primary-500 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">
              {{ t.readyToSynthesizeTitle }}
            </h3>
            <p
              class="mb-4 text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto"
              style="contain: layout style"
            >
              {{ t.readyToSynthesizeMsg }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { CalendarDate } from "@internationalized/date";
import type { NewsBriefing, Story } from "~~/types/index";
import { NEWS_CATEGORIES } from "~~/constants/categories";
import type { CategoryId } from "~~/constants/categories";

// Import components (Nuxt usually auto-imports, but explicitly declaring helps some IDEs)
import BriefingCard from "./BriefingCard.vue";

const translations = {
  en: {
    timeRangeSubtitle: "Select a time range to focus the search results",
    categorySubtitle: "Choose a category to focus the briefing",
    generateBriefing: "Refresh News",
    synthesizing: "Refreshing...",
    aiSynthesizingMsg: "Refreshing the latest news from Japan...",
    readyToSynthesizeTitle: "Ready to Synthesize",
    readyToSynthesizeMsg:
      'Select your preferred time range and category, then click "Refresh News" to load latest stories.',
    dailyLimitTitle: "Daily Limit Reached",
    resetsAt: "Resets at:",
    tryAgain: "Try Again",
    langLabel: "Lang:",
    translateLabel: "Translate to:",
    allTime: "All Time",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    customRange: "Custom Range",
    selectDateRange: "Select date range",
    categories: {
      all: "All News",
      society: "Society & Prefectures",
      tech: "Tech & Mobility",
      "pop-culture": "Pop Culture & Gaming",
      tourism: "Travel & Heritage",
      food: "Food & Gastronomy",
      "disaster-prep": "Nature & Resilience",
    },
  },
} as const;

const t = computed(() => {
  return translations.en;
});

const getTimeRangeLabel = (id: string) => {
  switch (id) {
    case "none":
      return t.value.allTime;
    case "day":
      return t.value.today;
    case "week":
      return t.value.thisWeek;
    case "month":
      return t.value.thisMonth;
    case "year":
      return t.value.thisYear;
    case "custom":
      return t.value.customRange;
    default:
      return id;
  }
};

// State
const stories = ref<Story[]>([]);
const lastIngestTime = ref<number>(0);
const selectedStoryId = ref<string | null>(null);
const detailSubPage = ref<"summary" | "timeline">("summary");

watch(selectedStoryId, () => {
  detailSubPage.value = "summary";
});

const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);

const selectedCategory = ref<CategoryId>("all");

// Debug state for UI testing
const config = useRuntimeConfig();
const isDebugErrorUi = computed(() => config.public.debugErrorUi === true);

const mockFallbackBriefing: NewsBriefing = {
  isAiFallback: true,
  mainHeadline: "Latest News Processing Unavailable",
  executiveSummary:
    "Our AI analysis engine is currently unavailable or encountered an error. Below are the raw sources we retrieved from the latest search query.",
  thematicAnalysis:
    "Unable to synthesize relationships between articles at this time due to system fallback mode.",
  overallCredibilityScore: 0.5,
  sourcesProcessed: [
    {
      title: "Example Raw Article 1",
      source: "NHK News",
      url: "https://example.com",
      credibilityScore: 0.95,
    },
    {
      title: "Example Raw Article 2",
      source: "Unknown Blog",
      url: "https://example.com",
      credibilityScore: 0.4,
    },
  ],
};

const selectedTimeRange = ref<
  "none" | "day" | "week" | "month" | "year" | "custom"
>("week");

// Calendar state for custom date range
const today = new CalendarDate(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate(),
);
const minDate = new CalendarDate(2020, 1, 1);
const maxDate = today;
const oneWeekAgo = today.subtract({ days: 7 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customDateRange = ref<any>({
  start: oneWeekAgo,
  end: today,
});

watch(
  [selectedCategory, selectedTimeRange, customDateRange],
  async () => {
    const isTest =
      typeof process !== "undefined" &&
      (process.env?.NODE_ENV === "test" || process.env?.VITEST);
    if (isTest) return;

    selectedStoryId.value = null;
    await fetchNews();
  },
  { deep: true },
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
  { id: "custom", name: "Custom Range" },
] as const;

// Filtered stories list
const filteredStories = computed(() => {
  return stories.value;
});

// Currently active story briefing
const activeStory = computed<Story | null>(() => {
  if (selectedStoryId.value) {
    return (
      filteredStories.value.find((s) => s.id === selectedStoryId.value) || null
    );
  }
  return null;
});

// Helper function to format timeline range as Month Day - Day, Year (e.g. May 21 - 23, 2025)
const getStoryTimeRange = (story: Story | null): string => {
  if (!story || !story.sources || story.sources.length === 0) {
    return "Recent";
  }

  const validDates = story.sources
    .map((src) => new Date(src.publishedAt))
    .filter((date) => !isNaN(date.getTime()));

  if (validDates.length === 0) {
    return "Recent";
  }

  // Sort ascending (earliest to latest)
  validDates.sort((a, b) => a.getTime() - b.getTime());
  const earliest = validDates[0]!;
  const latest = validDates[validDates.length - 1]!;

  const formatOptsMonthDay: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const formatOptsFull: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const earliestYear = earliest.getFullYear();
  const latestYear = latest.getFullYear();
  const earliestMonth = earliest.getMonth();
  const latestMonth = latest.getMonth();
  const earliestDay = earliest.getDate();
  const latestDay = latest.getDate();

  const sameYear = earliestYear === latestYear;
  const sameMonth = earliestMonth === latestMonth && sameYear;
  const sameDay = earliestDay === latestDay && sameMonth;

  if (sameDay) {
    return earliest.toLocaleDateString("en-US", formatOptsFull);
  }

  if (sameMonth) {
    const earliestStr = earliest.toLocaleDateString(
      "en-US",
      formatOptsMonthDay,
    );
    return `${earliestStr} - ${latestDay}, ${latestYear}`;
  }

  if (sameYear) {
    const earliestStr = earliest.toLocaleDateString(
      "en-US",
      formatOptsMonthDay,
    );
    const latestStr = latest.toLocaleDateString("en-US", formatOptsMonthDay);
    return `${earliestStr} - ${latestStr}, ${latestYear}`;
  }

  const earliestStr = earliest.toLocaleDateString("en-US", formatOptsFull);
  const latestStr = latest.toLocaleDateString("en-US", formatOptsFull);
  return `${earliestStr} - ${latestStr}`;
};

// Map activeStory to NewsBriefing shape for BriefingCard compatibility
const activeBriefingData = computed<NewsBriefing | null>(() => {
  if (!activeStory.value) return null;
  return {
    mainHeadline: activeStory.value.headline,
    executiveSummary: activeStory.value.summary,
    thematicAnalysis: activeStory.value.thematicAnalysis,
    overallCredibilityScore:
      activeStory.value.sources[0]?.credibilityScore || 0.8,
    sourcesProcessed: activeStory.value.sources.map((src) => ({
      title: src.title,
      source: src.source,
      url: src.url,
      favicon: src.favicon,
      credibilityScore: src.credibilityScore,
      regions: src.regions,
    })),
    publishTimeRange: getStoryTimeRange(activeStory.value),
    regionsAffected: Object.keys(activeStory.value.regionBreakdown),
  };
});

// Chronological timeline sources sorted oldest first (ascending)
const chronologicalSources = computed(() => {
  if (!activeStory.value) return [];
  return [...activeStory.value.sources].sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
});

// Formatting helpers
const getRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Methods
const fetchNews = async () => {
  loading.value = true;
  error.value = null;

  try {
    const query: Record<string, string | number | undefined> = {
      category:
        selectedCategory.value === "all" ? undefined : selectedCategory.value,
      language: "en",
      limit: 20,
    };

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
        query.timeRange = "week";
      }
    } else {
      query.timeRange = selectedTimeRange.value;
    }

    const response = await $fetch<{
      success: boolean;
      data: NewsBriefing & { stories: Story[]; lastIngestTime: number };
      count: number;
      timestamp: string;
    }>("/api/news", {
      query,
    });

    // Populate our new stories state
    if (response && response.data) {
      if (response.data.stories) {
        stories.value = response.data.stories;
        lastIngestTime.value = response.data.lastIngestTime || 0;
      } else if (response.data.mainHeadline) {
        // Fallback for NewsBriefing format (backward compatibility & unit tests)
        const mockBriefing = response.data;
        stories.value = [
          {
            id: "default-story",
            headline: mockBriefing.mainHeadline,
            summary: mockBriefing.executiveSummary,
            thematicAnalysis: mockBriefing.thematicAnalysis || "",
            articleCount: mockBriefing.sourcesProcessed?.length || 0,
            regionBreakdown: {},
            firstSeen: Date.now(),
            lastUpdated: Date.now(),
            trendScore: 1.0,
            isSummarized: true,
            sources: (mockBriefing.sourcesProcessed || []).map(
              (src: {
                title: string;
                source: string;
                url?: string;
                publishedAt?: string;
                favicon?: string;
                credibilityScore?: number;
                regions?: string[];
                category?: string;
              }) => ({
                title: src.title,
                source: src.source,
                url: src.url || "",
                publishedAt: src.publishedAt || new Date().toISOString(),
                favicon: src.favicon,
                credibilityScore: src.credibilityScore || 0.85,
                regions: src.regions || [],
                addedAt: Date.now(),
                category: src.category,
              }),
            ),
            categories: [],
          },
        ];
        lastIngestTime.value = Date.now();
      } else {
        stories.value = [];
      }
    } else {
      stories.value = [];
    }
  } catch (err: unknown) {
    console.error("Error generating briefing:", err);

    const errorData = err as {
      statusCode?: number;
      data?: {
        error?: string | unknown;
      };
    };

    const errorMsg = errorData.data?.error;
    if (typeof errorMsg === "string") {
      error.value = errorMsg;
    } else if (errorData.statusCode === 500) {
      error.value = "Service temporarily unavailable. Please try again.";
    } else {
      error.value = "Failed to generate briefing. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const refreshNews = async () => {
  selectedStoryId.value = null;
  await fetchNews();
};

onMounted(async () => {
  const isTest =
    typeof process !== "undefined" &&
    (process.env?.NODE_ENV === "test" || process.env?.VITEST);
  if (!isTest) {
    await refreshNews();
  }
});

defineOptions({
  name: "JapanNewsReader",
});
</script>
