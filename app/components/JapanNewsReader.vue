<template>
  <div class="min-h-screen">
    <AppHeader v-model:open="mobileMenuOpen" />

    <main class="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div class="space-y-6">
        <div
          class="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
          <span>{{ lastUpdatedText }}</span>
        </div>

        <div>
          <div class="mb-4 sm:mb-6">
            <p class="kicker text-secondary-500 mb-2">
              {{ t.difficultySubtitle }}
            </p>
            <div
              class="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3 justify-start pb-3 border-b border-stone-300 dark:border-stone-800"
            >
              <UTooltip
                v-for="level in difficultyLevels"
                :key="level.id"
                :text="
                  level.id === 'all'
                    ? 'Show lessons at any level'
                    : `Show ${level.id} (JLPT) lessons`
                "
              >
                <UButton
                  :color="
                    selectedDifficulty === level.id ? 'primary' : 'secondary'
                  "
                  :variant="
                    selectedDifficulty === level.id ? 'solid' : 'outline'
                  "
                  size="xs"
                  :label="level.name"
                  class="kicker rounded-none"
                  @click="
                    () => {
                      selectedDifficulty = level.id;
                    }
                  "
                />
              </UTooltip>
            </div>
          </div>

          <!-- DEBUG_ERROR_UI Testing & Design Panel -->
          <div
            v-if="isDebugErrorUi"
            class="mb-6 p-4 rounded-sm border border-dashed border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 space-y-3"
          >
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div
                class="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-300"
              >
                <UIcon name="i-heroicons-bug-ant" class="w-4 h-4" />
                <span>DEBUG_ERROR_UI Testing & Design Toolbar</span>
              </div>
              <UBadge color="warning" variant="soft" size="xs"
                >DEBUG Mode Active</UBadge
              >
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                :color="
                  debugSimulationMode === 'none' ? 'primary' : 'secondary'
                "
                label="Standard / Live Mode"
                @click="debugSimulationMode = 'none'"
              />
              <UButton
                size="xs"
                :color="
                  debugSimulationMode === 'fetch_error' ? 'error' : 'secondary'
                "
                icon="i-heroicons-cloud-arrow-down"
                label="Failed News Fetching"
                @click="debugSimulationMode = 'fetch_error'"
              />
            </div>
          </div>

          <!-- Failed fetch fallback -->
          <TrendingFallback
            v-if="
              error || (isDebugErrorUi && debugSimulationMode === 'fetch_error')
            "
            :error="
              error ||
              (isDebugErrorUi
                ? 'Debug Test: Failed to fetch lessons from server.'
                : null)
            "
            :loading="loading"
            :is-debug="isDebugErrorUi"
            class="mb-8"
            @retry="refreshNews"
          />

          <div v-if="loading" class="space-y-6">
            <UCard class="w-full border-t-2 border-t-primary-500">
              <div class="p-4 sm:p-6 space-y-6">
                <div class="pb-4">
                  <USkeleton class="h-6 w-32 mb-3 rounded-sm" />
                  <USkeleton class="h-10 w-3/4 rounded-sm" />
                </div>
                <div class="space-y-2">
                  <USkeleton class="h-4 w-24 mb-2" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-5/6" />
                </div>
              </div>
            </UCard>
            <p
              class="text-center text-secondary-500 text-sm mt-4 animate-pulse flex items-center justify-center gap-2"
            >
              <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5" />
              {{ t.loadingMsg }}
            </p>
          </div>

          <!-- Lesson list / detail -->
          <div v-if="lessons.length > 0 && !loading" class="space-y-6">
            <!-- List view -->
            <div v-if="!selectedLesson">
              <h3
                class="kicker text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5"
              >
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="w-4 h-4 text-primary-500"
                />
                {{ t.lessonsHeading }} ({{ lessons.length }})
              </h3>

              <ul class="border-t border-stone-300 dark:border-stone-800">
                <li
                  v-for="lesson in lessons"
                  :key="lesson.id"
                  class="cursor-pointer group py-4 border-b border-stone-300 dark:border-stone-800"
                  @click="selectedLessonId = lesson.id"
                >
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      class="kicker text-primary-600 dark:text-primary-400 truncate max-w-55"
                    >
                      {{ displaySource(lesson.source) }}
                    </span>
                    <UBadge color="secondary" variant="soft" size="xs">
                      {{ lesson.difficultyLevel }}
                    </UBadge>
                  </div>
                  <h4
                    class="font-serif font-bold text-lg sm:text-xl leading-snug text-stone-900 dark:text-white group-hover:underline decoration-1 underline-offset-4"
                  >
                    {{ lesson.title }}
                  </h4>
                  <p
                    v-if="lesson.titleJa"
                    class="text-sm text-stone-500 dark:text-stone-400 mt-0.5"
                  >
                    {{ lesson.titleJa }}
                  </p>
                  <div
                    class="flex items-center gap-2 mt-2 text-xs text-stone-400 dark:text-stone-500"
                  >
                    <span>{{ getRelativeTime(publishedMs(lesson)) }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Detail view -->
            <div v-else class="space-y-4">
              <UButton
                icon="i-heroicons-arrow-left"
                color="secondary"
                variant="ghost"
                size="sm"
                label="Back to lessons"
                @click="selectedLessonId = null"
              />
              <LessonCard :lesson="selectedLesson" />
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!loading && !isDebugErrorUi && lessons.length === 0"
            class="bg-white dark:bg-neutral-900 rounded-sm text-center p-8 border border-stone-300 dark:border-stone-800"
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
            <h3 class="text-xl font-serif font-semibold mb-2">
              {{ t.emptyTitle }}
            </h3>
            <p
              class="mb-4 text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto"
            >
              {{ t.emptyMsg }}
            </p>
            <UButton
              v-if="selectedDifficulty !== 'all'"
              color="primary"
              variant="solid"
              size="sm"
              label="Show all levels"
              @click="selectedDifficulty = 'all'"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import type { Lesson } from "~~/types/index";

import AppHeader from "./AppHeader.vue";
import LessonCard from "./LessonCard.vue";
import TrendingFallback from "./TrendingFallback.vue";

const translations = {
  en: {
    difficultySubtitle: "Filter by Japanese difficulty (JLPT level)",
    loadingMsg: "Loading the latest lessons from Japan...",
    lessonsHeading: "Lessons",
    emptyTitle: "No lessons at this level",
    emptyMsg:
      "Nothing matches the selected JLPT level yet. Try a different level or check back after the next weekly update.",
    lastUpdatedPrefix: "Updated",
    lastUpdatedUnknown: "Awaiting first update",
  },
} as const;

const t = computed(() => translations.en);

type DifficultyId = "all" | "N5" | "N4" | "N3" | "N2" | "N1";

const lessons = ref<Lesson[]>([]);
const lastIngestTime = ref<number>(0);
const selectedLessonId = ref<string | null>(null);
const selectedDifficulty = ref<DifficultyId>("all");
const loading = ref(false);
const error = ref<string | null>(null);
const mobileMenuOpen = ref(false);

const difficultyLevels = [
  { id: "all", name: "All Levels" },
  { id: "N5", name: "N5" },
  { id: "N4", name: "N4" },
  { id: "N3", name: "N3" },
  { id: "N2", name: "N2" },
  { id: "N1", name: "N1" },
] as const;

const isDebugErrorUi = computed(() => {
  try {
    const route = useRoute();
    if (route && route.query) {
      return (
        route.query.debug_error_ui === "true" ||
        route.query.debug_error_ui === "1" ||
        route.query.debug === "error"
      );
    }
  } catch {
    return false;
  }
  return false;
});
const debugSimulationMode = ref<"none" | "fetch_error">(
  isDebugErrorUi.value ? "fetch_error" : "none",
);

const selectedLesson = computed<Lesson | null>(() => {
  if (!selectedLessonId.value) return null;
  return lessons.value.find((l) => l.id === selectedLessonId.value) || null;
});

const publishedMs = (lesson: Lesson): number => {
  const t = new Date(lesson.publishedAt).getTime();
  return isNaN(t) ? lesson.addedAt || 0 : t;
};

const displaySource = (source: string): string => {
  try {
    return new URL(source).hostname.replace(/^www\d?\./, "");
  } catch {
    return source;
  }
};

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

const lastUpdatedText = computed(() => {
  if (!lastIngestTime.value) return t.value.lastUpdatedUnknown;
  return `${t.value.lastUpdatedPrefix} ${getRelativeTime(lastIngestTime.value)}`;
});

watch(selectedDifficulty, async () => {
  const isTest =
    typeof process !== "undefined" &&
    (process.env?.NODE_ENV === "test" || process.env?.VITEST);
  if (isTest) return;
  selectedLessonId.value = null;
  await fetchNews();
});

watch(debugSimulationMode, () => {
  if (isDebugErrorUi.value) {
    error.value =
      debugSimulationMode.value === "fetch_error"
        ? "DEBUG_ERROR_UI: Service temporarily unavailable. Failed to fetch lessons from Redis database."
        : null;
  }
});

const fetchNews = async () => {
  loading.value = true;
  error.value = null;

  if (isDebugErrorUi.value && debugSimulationMode.value === "fetch_error") {
    error.value =
      "DEBUG_ERROR_UI: Service temporarily unavailable. Failed to fetch lessons from Redis database.";
    loading.value = false;
    return;
  }

  try {
    const query: Record<string, string | number | undefined> = {
      difficulty:
        selectedDifficulty.value === "all"
          ? undefined
          : selectedDifficulty.value,
      limit: 20,
    };

    const response = await $fetch<{
      success: boolean;
      data: { lessons: Lesson[]; lastIngestTime: number };
      count: number;
      timestamp: string;
    }>("/api/news", { query });

    if (response?.data?.lessons) {
      lessons.value = response.data.lessons;
      lastIngestTime.value = response.data.lastIngestTime || 0;
    } else {
      lessons.value = [];
    }
  } catch (err: unknown) {
    console.error("Error fetching lessons:", err);

    const errorData = err as {
      statusCode?: number;
      data?: { error?: string | unknown };
    };
    const errorMsg = errorData.data?.error;
    if (typeof errorMsg === "string") {
      error.value = errorMsg;
    } else if (errorData.statusCode === 500) {
      error.value = "Service temporarily unavailable. Please try again.";
    } else {
      error.value = "Failed to fetch lessons. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const refreshNews = async () => {
  selectedLessonId.value = null;
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
