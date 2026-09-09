<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-4xl py-12 flex-1">
      <div class="prose dark:prose-invert">
        <NuxtLink
          to="/docs"
          class="kicker text-stone-400 dark:text-stone-500 no-underline hover:text-primary-500 transition-colors"
        >
          &larr; Documentation
        </NuxtLink>
        <h1
          class="text-3xl sm:text-4xl font-serif font-bold mb-4 mt-4 text-stone-900 dark:text-white"
        >
          Error &amp; Fallback States
        </h1>
        <p class="mb-4 text-gray-700 dark:text-gray-300 text-lg">
          A live catalogue of every degraded, empty, or failure UI the site can
          render, so their look can be reviewed without triggering a real
          outage. Each block below is the actual component with representative
          mock data.
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          To exercise these interactively on the real reader, append
          <code>?debug_error_ui=true</code> to
          <NuxtLink to="/news?debug_error_ui=true" class="text-primary-500"
            >/news</NuxtLink
          >
          — that reveals an in-page toolbar for simulating a failed
          <code>/api/news</code> fetch.
        </p>
      </div>

      <nav
        class="my-8 flex flex-wrap gap-2 border-y border-stone-200 dark:border-stone-800 py-4"
      >
        <a
          v-for="item in sections"
          :key="item.id"
          :href="`#${item.id}`"
          class="text-xs font-mono px-2.5 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-primary-500 no-underline"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="space-y-14">
        <!-- 1. News fetch failure -->
        <section id="trending-fallback" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="01"
            title="News fetch failure"
            component="components/TrendingFallback.vue"
            trigger="GET /api/news throws (Redis unreachable, 500 response, or network error). Bound to the reader's error ref."
          />
          <TrendingFallback
            :error="'Service temporarily unavailable. Please try again.'"
            :loading="false"
            :is-debug="false"
            @retry="noop"
          />
        </section>

        <!-- 2. Lesson card -->
        <section id="lesson-card" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="02"
            title="Lesson detail card"
            component="components/LessonCard.vue"
            trigger="Not an error state — the normal detail view for one lesson, shown here so its layout can be reviewed alongside the fallbacks."
          />
          <LessonCard :lesson="mockLesson" />
        </section>

        <!-- 3. Loading skeleton -->
        <section id="loading" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="03"
            title="Loading / refreshing skeleton"
            component="components/JapanNewsReader.vue (loading)"
            trigger="Shown while GET /api/news is in flight (initial load, filter change, or manual refresh)."
          />
          <div class="space-y-6">
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
              Loading the latest lessons from Japan...
            </p>
          </div>
        </section>

        <!-- 4. Empty state -->
        <section id="empty" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="04"
            title="Empty result set"
            component="components/JapanNewsReader.vue (lessons.length === 0)"
            trigger="The request succeeded but no lesson matches the selected JLPT level. Offers a 'Show all levels' reset when a level is active."
          />
          <div
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
              No lessons at this level
            </h3>
            <p
              class="mb-4 text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto"
            >
              Nothing matches the selected JLPT level yet. Try a different level
              or check back after the next weekly update.
            </p>
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              label="Show all levels"
              @click="noop"
            />
          </div>
        </section>

        <!-- 5. JLPT difficulty badge -->
        <section id="summarizing-badge" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="05"
            title="JLPT difficulty badge"
            component="components/JapanNewsReader.vue (lesson.difficultyLevel)"
            trigger="Every lesson in the list shows its JLPT level as a badge next to the source name."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 rounded-sm p-5 bg-white dark:bg-stone-900"
          >
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="kicker text-primary-600 dark:text-primary-400">
                nhk.or.jp
              </span>
              <UBadge color="secondary" variant="soft" size="xs"> N3 </UBadge>
            </div>
            <h4
              class="font-serif font-bold text-2xl leading-tight text-stone-900 dark:text-white"
            >
              Government unveils new autonomous-mobility roadmap for Tokyo
            </h4>
            <div
              class="flex items-center gap-2 mt-3 text-xs text-stone-400 dark:text-stone-500"
            >
              <span>just now</span>
            </div>
          </div>
        </section>

        <!-- 6. 404 -->
        <section id="not-found" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="06"
            title="404 — page not found"
            component="pages/[...slug].vue"
            trigger="Any unmatched route. Full-page layout with the shared header/footer and a single 'Return to Home' action."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 rounded-sm bg-[#FDFBF7] dark:bg-[#0B0E14] px-4 py-12 text-center"
          >
            <h1 class="text-6xl font-serif font-bold text-primary-500 mb-4">
              404
            </h1>
            <h2 class="text-2xl font-bold mb-3">Page Not Found</h2>
            <p class="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
              The page or resource you are looking for does not exist or has
              been moved.
            </p>
            <UButton
              to="/"
              label="Return to Home"
              color="primary"
              icon="i-heroicons-home"
            />
          </div>
        </section>

        <!-- 7. API error responses -->
        <section id="api-errors" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="07"
            title="API error responses"
            component="server/api/news.get.ts"
            trigger="Not a rendered UI — the JSON GET /api/news returns on failure. The reader maps these onto the News fetch failure state above."
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-rose-500 mb-2">
                400 Bad Request
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Query params failed Zod validation (limit out of bounds, query
                &gt; 100 chars).
              </p>
              <pre
                class="text-[11px] leading-relaxed overflow-x-auto bg-white dark:bg-stone-950 rounded p-2 m-0"
                >{{ badRequestSample }}</pre>
            </div>
            <div
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-rose-500 mb-2">
                500 Failed to fetch news
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Redis read threw, or an unexpected server error. Stack is
                included only in development.
              </p>
              <pre
                class="text-[11px] leading-relaxed overflow-x-auto bg-white dark:bg-stone-950 rounded p-2 m-0"
                >{{ serverErrorSample }}</pre>
            </div>
          </div>
        </section>
      </div>
    </main>

    <UFooter
      class="relative z-10 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#0B0E14]"
    >
      <template #left>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import type { Lesson } from "../../../types";
import AppHeader from "../../components/AppHeader.vue";

const noop = () => {};

const sections = [
  { id: "trending-fallback", label: "01 News fetch failure" },
  { id: "lesson-card", label: "02 Lesson card" },
  { id: "loading", label: "03 Loading skeleton" },
  { id: "empty", label: "04 Empty result" },
  { id: "summarizing-badge", label: "05 Difficulty badge" },
  { id: "not-found", label: "06 404" },
  { id: "api-errors", label: "07 API errors" },
];

const mockLesson: Lesson = {
  id: "sample",
  title: "Government unveils new autonomous-mobility roadmap for Tokyo",
  titleJa: "政府、東京の自動運転移動サービスの新方針を発表",
  source: "https://www3.nhk.or.jp",
  url: "https://www3.nhk.or.jp/news/example",
  favicon: "https://www3.nhk.or.jp/favicon.ico",
  publishedAt: new Date().toISOString(),
  addedAt: Date.now(),
  credibilityScore: 0.95,
  difficultyLevel: "N3",
  originalText:
    "政府はきょう、東京で自動運転による移動サービスを広げるための新しい方針を発表しました。",
  englishText:
    "The government today unveiled a new policy to expand autonomous-driving mobility services in Tokyo.",
  furiganaText:
    "<ruby>政府<rt>せいふ</rt></ruby>はきょう、<ruby>東京<rt>とうきょう</rt></ruby>で<ruby>自動運転<rt>じどううんてん</rt></ruby>による<ruby>移動<rt>いどう</rt></ruby>サービスを<ruby>広<rt>ひろ</rt></ruby>げるための<ruby>新<rt>あたら</rt></ruby>しい<ruby>方針<rt>ほうしん</rt></ruby>を<ruby>発表<rt>はっぴょう</rt></ruby>しました。",
  romajiText:
    "Seifu wa kyō, Tōkyō de jidō unten ni yoru idō sābisu o hirogeru tame no atarashii hōshin o happyō shimashita.",
  vocabList: [
    {
      term: "政府",
      reading: "せいふ",
      romaji: "seifu",
      meaning: "government",
      jlptLevel: "N3",
      exampleSentence: "政府は新しい方針を発表しました。",
    },
    {
      term: "自動運転",
      reading: "じどううんてん",
      romaji: "jidō unten",
      meaning: "autonomous / self-driving",
      jlptLevel: "N2",
      exampleSentence: "自動運転による移動サービスを広げます。",
    },
  ],
  grammarNotes: [
    {
      pattern: "〜による",
      explanation: '"by means of" / "caused by" — marks the agent or method.',
      exampleSentence: "自動運転による移動サービス。",
      romaji: "jidō unten ni yoru idō sābisu.",
    },
  ],
};

const badRequestSample = JSON.stringify(
  {
    statusCode: 400,
    statusMessage: "Bad Request",
    data: {
      error: "Invalid query parameters",
      details: [
        { path: "query", message: "Query cannot exceed 100 characters" },
      ],
    },
  },
  null,
  2,
);

const serverErrorSample = JSON.stringify(
  {
    statusCode: 500,
    statusMessage: "Failed to fetch news",
    data: { error: "Redis connection timed out" },
  },
  null,
  2,
);
</script>

<style>
@reference "../../assets/css/tailwind.css";

h1 {
  @apply text-3xl font-serif font-bold mb-6 text-stone-900 dark:text-white;
}
</style>
