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
            <span
              class="text-[7px] text-stone-500 dark:text-stone-400 font-serif tracking-widest mt-0.5"
              >日本日報</span
            >
          </div>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />

          <div class="hidden lg:flex">
            <UButton
              :disabled="loading"
              :loading="loading"
              color="primary"
              size="sm"
              icon="i-heroicons-arrow-path"
              @click="refreshNews"
            >
              <span class="hidden sm:inline">{{
                loading ? t.synthesizing : t.generateBriefing
              }}</span>
            </UButton>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <div class="space-y-3">
            <UButton
              :disabled="loading"
              :loading="loading"
              color="primary"
              block
              icon="i-heroicons-arrow-path"
              @click="
                async () => {
                  await refreshNews();
                  mobileMenuOpen = false;
                }
              "
            >
              {{ loading ? t.synthesizing : t.generateBriefing }}
            </UButton>
          </div>
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
                      selectedTimeRange === timeRange.id
                        ? 'primary'
                        : 'secondary'
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
              <div class="p-2">
                <div
                  v-if="isDebugErrorUi && !error"
                  class="mb-6 p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-lg text-xs text-left"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="font-bold text-primary-600 dark:text-primary-400"
                      >DEBUG MODE: Error UI Testing</span
                    >
                    <UButton
                      size="xs"
                      color="primary"
                      variant="soft"
                      @click="
                        () => {
                          isDebugRateLimit = !isDebugRateLimit;
                        }
                      "
                    >
                      Switch to
                      {{ isDebugRateLimit ? "General" : "Rate Limit" }} UI
                    </UButton>
                  </div>
                  <p class="text-secondary-500 leading-relaxed mb-2">
                    This panel is only visible because
                    <code
                      class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-primary-600 dark:text-primary-400"
                      >DEBUG_ERROR_UI=true</code
                    >
                    is set. Below you can see the main error layouts and a mock
                    AI-failed briefing card.
                  </p>
                </div>

                <div
                  v-if="
                    isRateLimitError ||
                    (isDebugErrorUi && !error && isDebugRateLimit)
                  "
                  class="space-y-4"
                >
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
                      {{ t.dailyLimitTitle }}
                    </h3>
                    <p class="text-secondary-500 mb-2">
                      {{
                        error ||
                        (targetLanguage === "ja"
                          ? "本日の制限（1日3リクエスト）に達しました。明日もう一度お試しください。"
                          : "Daily rate limit exceeded (3 request/day). Please try again tomorrow.")
                      }}
                    </p>
                    <ClientOnly>
                      <p
                        v-if="rateLimitResetTime || (isDebugErrorUi && !error)"
                        class="text-sm text-secondary-400"
                      >
                        {{ t.resetsAt }}
                        {{
                          rateLimitResetTime ||
                          new Date(Date.now() + 86400000).toLocaleString()
                        }}
                      </p>
                    </ClientOnly>
                  </div>
                  <UButton
                    color="warning"
                    :disabled="loading"
                    @click="refreshNews"
                  >
                    {{ t.tryAgain }}
                  </UButton>
                </div>

                <div v-else class="space-y-4">
                  <p class="text-error-500">
                    {{
                      error ||
                      "Service temporarily unavailable. Please try again."
                    }}
                  </p>
                  <UButton
                    color="error"
                    :disabled="loading"
                    @click="refreshNews"
                  >
                    {{ t.tryAgain }}
                  </UButton>
                </div>
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
              <BriefingCard
                :briefing="mockFallbackBriefing"
                :language="targetLanguage"
              />
            </div>

             <!-- New Clustered Stories Trending Dashboard UI -->
            <div v-if="filteredStories.length > 0 && !loading" class="space-y-6">
              <!-- Trending Stories Grid Header -->
              <div>
                <h3 class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-fire" class="w-4 h-4 text-primary-500" />
                  Trending Topics ({{ filteredStories.length }})
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div
                    v-for="story in filteredStories"
                    :key="story.id"
                    class="cursor-pointer border p-3 rounded-xl transition-all relative overflow-hidden bg-white/50 dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800"
                    :class="[
                      activeStory?.id === story.id
                        ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/10 dark:bg-primary-500/5'
                        : ''
                    ]"
                    @click="selectedStoryId = story.id"
                  >
                    <!-- Header inside card -->
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 truncate max-w-[120px]">
                        {{ story.sources[0]?.source || 'News Source' }}
                      </span>
                      <div class="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                        <UIcon name="i-heroicons-fire" class="w-3.5 h-3.5 text-primary-500" />
                        <span>{{ Math.round(story.trendScore * 10) / 10 }}</span>
                      </div>
                    </div>
                    <!-- Headline -->
                    <h4 class="text-xs font-bold font-serif line-clamp-2 text-stone-900 dark:text-white leading-snug">
                      {{ story.headlineEn }}
                    </h4>
                    <!-- Footer inside card -->
                    <div class="flex items-center gap-2 mt-2 text-[10px] text-stone-400 dark:text-stone-500">
                      <span>{{ story.articleCount }} sources</span>
                      <span>•</span>
                      <span>{{ getRelativeTime(story.lastUpdated) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Active Story Briefing Detail View -->
              <div v-if="activeBriefingData" class="space-y-6">
                <BriefingCard
                  :briefing="activeBriefingData"
                  language="en"
                />

                <!-- Story Timeline (Chronological updates) -->
                <div v-if="activeStory && activeStory.sources.length > 1" class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-6">
                  <h3 class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary-500" />
                    Story Timeline
                  </h3>
                  <div class="relative pl-6 border-l-2 border-stone-200 dark:border-stone-800 space-y-6">
                    <div v-for="(source, idx) in activeStory.sources.slice().reverse()" :key="idx" class="relative">
                      <!-- Dot indicator -->
                      <span class="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-stone-900 border-2 border-primary-500">
                        <span class="h-1.5 w-1.5 rounded-full bg-primary-500" />
                      </span>
                      <div class="space-y-1">
                        <div class="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                          <time>{{ new Date(source.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</time>
                          <span>•</span>
                          <span class="font-semibold">{{ source.source }}</span>
                        </div>
                        <a :href="source.url" target="_blank" class="text-sm font-bold hover:text-primary-500 transition-colors block">
                          {{ source.title }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty fallback if no stories match criteria -->
            <div
              v-else-if="
                !loading &&
                !isDebugErrorUi &&
                filteredStories.length === 0
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
import { ref, computed } from "vue";
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
    aiSynthesizingMsg:
      "Refreshing the latest news from Japan...",
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
const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);

// Rate limit specific state
const rateLimitResetTime = ref<string | null>(null);
const isRateLimitError = ref(false);
const selectedCategory = ref<CategoryId>("all");

// Debug state for UI testing
const config = useRuntimeConfig();
const isDebugErrorUi = computed(() => config.public.debugErrorUi === true);
const isDebugRateLimit = ref(true);

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
const targetLanguage = ref("en");

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
    const match = filteredStories.value.find((s) => s.id === selectedStoryId.value);
    if (match) return match;
  }
  return filteredStories.value[0] || null;
});

// Map activeStory to NewsBriefing shape for BriefingCard compatibility
const activeBriefingData = computed<NewsBriefing | null>(() => {
  if (!activeStory.value) return null;
  return {
    mainHeadline: activeStory.value.headlineEn,
    executiveSummary: activeStory.value.summaryEn,
    thematicAnalysis: activeStory.value.thematicAnalysisEn,
    overallCredibilityScore: activeStory.value.sources[0]?.credibilityScore || 0.8,
    sourcesProcessed: activeStory.value.sources.map((src) => ({
      title: src.title,
      source: src.source,
      url: src.url,
      favicon: src.favicon,
      credibilityScore: src.credibilityScore,
      regions: src.regions,
    })),
    publishTimeRange: "Recent",
    regionsAffected: Object.keys(activeStory.value.regionBreakdown),
  };
});

const briefingData = computed(() => {
  if (stories.value.length === 0) return undefined;
  const story = stories.value[0];
  
  const overallCred = story.sources.length > 0
    ? story.sources.reduce((sum, s) => sum + s.credibilityScore, 0) / story.sources.length
    : 0.85;

  return {
    isAiFallback: false,
    mainHeadline: story.headlineEn,
    executiveSummary: story.summaryEn,
    thematicAnalysis: story.thematicAnalysisEn,
    overallCredibilityScore: Math.round(overallCred * 100) / 100, // round to 2 decimals
    sourcesProcessed: story.sources.map((src) => {
      const s: any = {
        title: src.title,
        source: src.source,
        url: src.url,
        credibilityScore: src.credibilityScore,
        publishedAt: src.publishedAt,
        category: src.category,
      };
      if (src.favicon !== undefined) s.favicon = src.favicon;
      if (src.regions && src.regions.length > 0) s.regions = src.regions;
      return s;
    }),
  };
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
  isRateLimitError.value = false;
  rateLimitResetTime.value = null;

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
            headlineEn: mockBriefing.mainHeadline,
            headlineJa: mockBriefing.mainHeadline,
            summaryEn: mockBriefing.executiveSummary,
            summaryJa: mockBriefing.executiveSummary,
            thematicAnalysisEn: mockBriefing.thematicAnalysis || "",
            thematicAnalysisJa: mockBriefing.thematicAnalysis || "",
            articleCount: mockBriefing.sourcesProcessed?.length || 0,
            regionBreakdown: {},
            firstSeen: Date.now(),
            lastUpdated: Date.now(),
            trendScore: 1.0,
            sources: (mockBriefing.sourcesProcessed || []).map((src: any) => ({
              title: src.title,
              source: src.source,
              url: src.url || "",
              publishedAt: src.publishedAt || new Date().toISOString(),
              favicon: src.favicon,
              credibilityScore: src.credibilityScore || 0.85,
              regions: src.regions || [],
              addedAt: Date.now(),
              category: src.category,
            })),
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
        resetTime?: string;
        limit?: number;
      };
    };

    if (errorData.statusCode === 429) {
      isRateLimitError.value = true;
      rateLimitResetTime.value = errorData.data?.resetTime || null;
      const errorMsg = errorData.data?.error;
      error.value =
        typeof errorMsg === "string"
          ? errorMsg
          : "Daily rate limit exceeded. Please try again tomorrow.";
    } else if (errorData.statusCode === 500) {
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
          : "Failed to generate briefing. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const refreshNews = async () => {
  selectedStoryId.value = null;
  await fetchNews();
};

defineOptions({
  name: "JapanNewsReader",
});
</script>
