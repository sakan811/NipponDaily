<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img
            src="/favicon-light.ico"
            alt="NipponDaily"
            class="w-6 h-6 dark:hidden border-[0.5px] border-neutral-900/60 rounded-sm"
          >
          <img
            src="/favicon-dark.ico"
            alt="NipponDaily"
            class="w-6 h-6 hidden dark:block border-[0.5px] border-neutral-50/60 rounded-sm"
          >
          <span>NipponDaily Docs</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            class="hidden sm:flex"
          />
          <UButton
            to="/"
            label="Home"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-home"
            class="hidden sm:flex"
          />
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <div class="flex flex-col gap-4">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            block
            @click="mobileMenuOpen = false"
          />
          <UButton
            to="/"
            label="Home"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-home"
            block
            @click="mobileMenuOpen = false"
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4">
      <div class="prose dark:prose-invert">
        <h1 class="text-3xl font-bold mb-4 text-primary-500">
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
          — that reveals an in-page toolbar for switching between the trending,
          summary, and AI-fallback simulations.
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
        <!-- 1. Trending fetch failure -->
        <section id="trending-fallback" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="01"
            title="Trending fetch failure"
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

        <!-- 2. AI summary fallback -->
        <section id="summary-fallback" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="02"
            title="AI summary fallback (per story)"
            component="components/SummaryFallback.vue"
            trigger="A selected story has isSummarized === false — the Claude agent clustered sources but has not written the executive summary / thematic analysis yet."
          />
          <SummaryFallback
            headline="Toyota and NTT Expand Autonomous Mobility Partnership in Tokyo"
            :sources="mockRawSources"
            :loading="false"
            :is-debug="false"
            @retry="noop"
          />
        </section>

        <!-- 3. AI fallback briefing card -->
        <section id="ai-fallback-card" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="03"
            title="AI fallback briefing card"
            component="components/BriefingCard.vue (briefing.isAiFallback)"
            trigger="The briefing payload is flagged isAiFallback — raw sources are shown with an 'AI Synthesis Failed' tooltip on the headline instead of a synthesized narrative."
          />
          <BriefingCard :briefing="mockFallbackBriefing" />
        </section>

        <!-- 4. Loading skeleton -->
        <section id="loading" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="04"
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
                <div
                  class="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-sm space-y-2"
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
              Refreshing the latest news from Japan...
            </p>
          </div>
        </section>

        <!-- 5. Empty state -->
        <section id="empty" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="05"
            title="Empty result set"
            component="components/JapanNewsReader.vue (filteredStories.length === 0)"
            trigger="The request succeeded but no story overlaps the selected time range / category. Offers a 'Show all time' reset when a window is active."
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
              No stories in this time range
            </h3>
            <p
              class="mb-4 text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto"
            >
              Nothing was published in the selected window. Try a wider time
              range or a different category.
            </p>
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              label="Show all time"
              @click="noop"
            />
          </div>
        </section>

        <!-- 6. "Summarizing" badge -->
        <section id="summarizing-badge" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="06"
            title="Pending-summary badge"
            component="components/JapanNewsReader.vue (!story.isSummarized)"
            trigger="A freshly clustered story appears in the trending list before the agent has summarized it — the headline still renders, tagged with a pulsing 'Summarizing…' badge."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 rounded-sm p-5 bg-white dark:bg-stone-900"
          >
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="kicker text-primary-600 dark:text-primary-400">
                Nikkei Asia
              </span>
              <UBadge
                color="primary"
                variant="soft"
                size="xs"
                class="animate-pulse"
              >
                Summarizing...
              </UBadge>
            </div>
            <h4
              class="font-serif font-bold text-2xl leading-tight text-stone-900 dark:text-white"
            >
              Toyota and NTT Expand Autonomous Mobility Partnership in Tokyo
            </h4>
            <div
              class="flex items-center gap-2 mt-3 text-xs text-stone-400 dark:text-stone-500"
            >
              <span>4 sources</span>
              <span>•</span>
              <span>just now</span>
            </div>
          </div>
        </section>

        <!-- 7. 404 -->
        <section id="not-found" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="07"
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

        <!-- 8. API error responses -->
        <section id="api-errors" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="08"
            title="API error responses"
            component="server/api/news.get.ts"
            trigger="Not a rendered UI — the JSON GET /api/news returns on failure. The reader maps these onto the Trending fetch failure state above."
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-rose-500 mb-2">
                400 Bad Request
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Query params failed Zod validation (bad date range, limit out of
                bounds, query &gt; 100 chars).
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

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
import type { NewsBriefing } from "../../../types";

const mobileMenuOpen = ref(false);

const noop = () => {};

const sections = [
  { id: "trending-fallback", label: "01 Trending failure" },
  { id: "summary-fallback", label: "02 Summary fallback" },
  { id: "ai-fallback-card", label: "03 AI fallback card" },
  { id: "loading", label: "04 Loading skeleton" },
  { id: "empty", label: "05 Empty result" },
  { id: "summarizing-badge", label: "06 Pending summary" },
  { id: "not-found", label: "07 404" },
  { id: "api-errors", label: "08 API errors" },
];

const mockRawSources = [
  {
    title: "Toyota and NTT Expand Autonomous Mobility Partnership in Tokyo",
    source: "Nikkei Asia",
    url: "https://asia.nikkei.com",
  },
  {
    title:
      "Japan Weather Agency Issues Special Resilience Survey for Tohoku Region",
    source: "NHK World",
    url: "https://www3.nhk.or.jp",
  },
];

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

const badRequestSample = JSON.stringify(
  {
    statusCode: 400,
    statusMessage: "Bad Request",
    data: {
      error: "Invalid query parameters",
      details: [{ path: "endDate", message: "Range must not exceed 365 days" }],
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
  @apply text-3xl font-bold mb-6 text-primary-500;
}
</style>
