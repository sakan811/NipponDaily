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

          <div class="hidden lg:flex items-center gap-2">
            <label for="targetLanguage" class="text-sm text-secondary-500">
              {{ t.langLabel }}
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
              icon="i-heroicons-bolt"
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
            <div>
              <label
                for="mobileTargetLanguage"
                class="text-sm text-secondary-500"
              >
                {{ t.translateLabel }}
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
              icon="i-heroicons-bolt"
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

    <main
      class="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-full overflow-x-hidden"
    >
      <div class="grid grid-cols-1 gap-6 sm:gap-8">
        <div>
          <div class="mb-3 sm:mb-4">
            <p class="text-sm text-secondary-500 mb-2 max-w-fit">
              <em>{{ t.timeRangeSubtitle }}</em>
            </p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
              <UTooltip
                v-for="timeRange in timeRangeOptions"
                :key="timeRange.id"
                :text="targetLanguage === 'ja' ? `${getTimeRangeLabel(timeRange.id)}でニュースをフィルタリング` : `Filter news by ${timeRange.name.toLowerCase()}`"
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
                  @click="selectedTimeRange = timeRange.id"
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
                    ? (targetLanguage === 'ja' ? 'すべてのカテゴリを表示' : 'Show all categories')
                    : (targetLanguage === 'ja' ? `${t.categories[category.id as keyof typeof t.categories]}でニュースをフィルタリング` : `Filter news by ${category.name}`)
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
                  :label="t.categories[category.id as keyof typeof t.categories]"
                  @click="selectedCategory = category.id"
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
                  <span class="font-bold text-primary-600 dark:text-primary-400"
                    >DEBUG MODE: Error UI Testing</span
                  >
                  <UButton
                    size="xs"
                    color="primary"
                    variant="soft"
                    @click="isDebugRateLimit = !isDebugRateLimit"
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
                <UButton color="error" :disabled="loading" @click="refreshNews">
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
            <BriefingCard :briefing="mockFallbackBriefing" :language="targetLanguage" />
          </div>

          <div v-if="briefingData" class="space-y-4">
            <BriefingCard :briefing="briefingData" :language="targetLanguage" />
          </div>

          <div
            v-else-if="!loading && !isDebugErrorUi"
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
            <h3 class="text-xl font-semibold mb-2">{{ t.readyToSynthesizeTitle }}</h3>
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
import type { NewsBriefing } from "~~/types/index";
import { NEWS_CATEGORIES } from "~~/constants/categories";
import type { CategoryId } from "~~/constants/categories";
import * as locales from "@nuxt/ui/locale";

const translations = {
  en: {
    timeRangeSubtitle: "Select a time range to focus the search results",
    categorySubtitle: "Choose a category to focus the briefing",
    generateBriefing: "Generate Briefing",
    synthesizing: "Synthesizing...",
    aiSynthesizingMsg: "AI is currently synthesizing the latest news from Japan...",
    readyToSynthesizeTitle: "Ready to Synthesize",
    readyToSynthesizeMsg: "Select your preferred time range and category, then click \"Generate Briefing\" to create a synthesized report.",
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
    }
  },
  ja: {
    timeRangeSubtitle: "検索結果を絞り込む期間を選択してください",
    categorySubtitle: "ブリーフィングのカテゴリを選択してください",
    generateBriefing: "ブリーフィングを生成",
    synthesizing: "要約を生成中...",
    aiSynthesizingMsg: "AIが日本の最新ニュースを分析・要約しています...",
    readyToSynthesizeTitle: "ブリーフィング生成の準備完了",
    readyToSynthesizeMsg: "お好みの期間とカテゴリを選択し、「ブリーフィングを生成」をクリックして要約レポートを作成してください。",
    dailyLimitTitle: "本日の制限に達しました",
    resetsAt: "リセット時刻:",
    tryAgain: "再試行",
    langLabel: "表示言語:",
    translateLabel: "翻訳先言語:",
    allTime: "全期間",
    today: "今日",
    thisWeek: "今週",
    thisMonth: "今月",
    thisYear: "今年",
    customRange: "カスタム範囲",
    selectDateRange: "期間を選択してください",
    categories: {
      all: "すべてのニュース",
      society: "社会・地方",
      tech: "技術・産業",
      "pop-culture": "ポップカルチャー・ゲーム",
      tourism: "観光・遺産",
      food: "和食・食文化",
      "disaster-prep": "自然・防災",
    }
  }
} as const;

const t = computed(() => {
  const lang = targetLanguage.value === "ja" ? "ja" : "en";
  return translations[lang];
});

const getTimeRangeLabel = (id: string) => {
  switch (id) {
    case "none": return t.value.allTime;
    case "day": return t.value.today;
    case "week": return t.value.thisWeek;
    case "month": return t.value.thisMonth;
    case "year": return t.value.thisYear;
    case "custom": return t.value.customRange;
    default: return id;
  }
};

// Import components (Nuxt usually auto-imports, but explicitly declaring helps some IDEs)
import BriefingCard from "./BriefingCard.vue";

// State
const briefingData = ref<NewsBriefing | null>(null);
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

interface CalendarDateLike {
  year: number;
  month: number;
  day: number;
}

const customDateRange = ref<{
  start?: CalendarDateLike | null;
  end?: CalendarDateLike | null;
}>({
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

// Methods
const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  // Reset rate limit state
  isRateLimitError.value = false;
  rateLimitResetTime.value = null;

  try {
    const query: Record<string, string | number | undefined> = {
      category:
        selectedCategory.value === "all" ? undefined : selectedCategory.value,
      language: targetLanguage.value,
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

    // Expecting a single Briefing object now, not an array of NewsItems
    const response = await $fetch<{
      success: boolean;
      data: NewsBriefing;
      count: number;
      timestamp: string;
    }>("/api/news", {
      query,
    });

    briefingData.value = response.data;
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
  await fetchNews();
};

defineOptions({
  name: "JapanNewsReader",
});
</script>
