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
          to="/#docs"
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
        <!-- 1. Daily game fetch failure -->
        <section id="trending-fallback" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="01"
            title="Daily game fetch failure"
            component="components/TrendingFallback.vue"
            trigger="GET /api/daily-game throws (Redis unreachable, empty pool, or network error). Bound to DailyGameBoard's error ref."
          />
          <TrendingFallback
            :error="'Service temporarily unavailable. Please try again.'"
            :loading="false"
            @retry="noop"
          />
        </section>

        <!-- 2. Answered question card -->
        <section id="question-card" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="02"
            title="Answered question card"
            component="components/DailyGameBoard.vue"
            trigger="Not an error state — the normal in-round view right after answering, shown here so its layout can be reviewed alongside the fallbacks."
          />
          <UCard class="w-full border-t-2 border-t-primary-500">
            <div class="p-4 sm:p-8 space-y-6 text-center">
              <UBadge color="secondary" variant="soft" size="xs">
                Vocabulary
              </UBadge>
              <div class="space-y-2">
                <p
                  class="font-serif font-bold text-5xl sm:text-6xl text-stone-900 dark:text-white leading-none"
                >
                  食べる
                </p>
                <p class="text-sm text-stone-500 dark:text-stone-400">たべる</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UButton
                  label="to drink"
                  color="secondary"
                  variant="outline"
                  size="lg"
                  block
                  class="justify-center"
                  disabled
                />
                <UButton
                  label="to eat"
                  color="success"
                  size="lg"
                  block
                  class="justify-center"
                  disabled
                />
                <UButton
                  label="to see"
                  color="secondary"
                  variant="outline"
                  size="lg"
                  block
                  class="justify-center"
                  disabled
                />
                <UButton
                  label="to go"
                  color="secondary"
                  variant="outline"
                  size="lg"
                  block
                  class="justify-center"
                  disabled
                />
              </div>
              <p
                class="text-sm font-medium flex items-center justify-center gap-1.5 text-success-600 dark:text-success-400"
              >
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                Correct!
              </p>
            </div>
          </UCard>
        </section>

        <!-- 3. Loading skeleton -->
        <section id="loading" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="03"
            title="Loading skeleton"
            component="components/DailyGameBoard.vue (loading)"
            trigger="Shown while GET /api/daily-game is in flight (initial mount, or a manual retry)."
          />
          <div class="space-y-6">
            <UCard class="w-full border-t-2 border-t-primary-500">
              <div class="p-4 sm:p-6 space-y-6">
                <USkeleton class="h-6 w-32 mb-3 rounded-sm" />
                <USkeleton class="h-16 w-3/4 mx-auto rounded-sm" />
                <div class="grid grid-cols-2 gap-3">
                  <USkeleton class="h-12 rounded-sm" />
                  <USkeleton class="h-12 rounded-sm" />
                  <USkeleton class="h-12 rounded-sm" />
                  <USkeleton class="h-12 rounded-sm" />
                </div>
              </div>
            </UCard>
          </div>
        </section>

        <!-- 4. Round summary -->
        <section id="summary" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="04"
            title="Round summary"
            component="components/DailyGameBoard.vue (isFinished)"
            trigger="Shown after the 20th question is answered. Offers a 'Play Again' reset that reshuffles the same day's questions client-side — no refetch."
          />
          <UCard class="w-full border-t-2 border-t-primary-500">
            <div class="p-4 sm:p-8 space-y-6 text-center">
              <UIcon
                name="i-heroicons-star"
                class="w-10 h-10 mx-auto text-warning-500"
              />
              <h2
                class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
              >
                Round Complete!
              </h2>
              <div class="flex justify-center gap-8 text-center">
                <div>
                  <p
                    class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                  >
                    17/20
                  </p>
                  <p class="kicker text-stone-400">Correct</p>
                </div>
                <div>
                  <p
                    class="text-3xl font-mono font-bold text-stone-900 dark:text-white"
                  >
                    85%
                  </p>
                  <p class="kicker text-stone-400">Accuracy</p>
                </div>
              </div>
              <UButton
                label="Play Again"
                color="primary"
                size="lg"
                icon="i-heroicons-arrow-path"
                @click="noop"
              />
            </div>
          </UCard>
        </section>

        <!-- 5. Question-kind badge -->
        <section id="kind-badge" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="05"
            title="Question-kind badge"
            component="components/DailyGameBoard.vue (question.kind)"
            trigger="Every question shows which of the four pool kinds it's drawn from."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 rounded-sm p-5 bg-white dark:bg-stone-900 flex flex-wrap gap-2"
          >
            <UBadge color="secondary" variant="soft" size="xs">Hiragana</UBadge>
            <UBadge color="secondary" variant="soft" size="xs">Katakana</UBadge>
            <UBadge color="secondary" variant="soft" size="xs">Kanji</UBadge>
            <UBadge color="secondary" variant="soft" size="xs"
              >Vocabulary</UBadge
            >
          </div>
        </section>

        <!-- 6. 404 -->
        <section id="not-found" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="06"
            title="404 — page not found"
            component="pages/[...slug].vue"
            trigger="Any unmatched route (including the retired /news). Full-page layout with the shared header/footer and a single 'Return to Home' action."
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
            component="server/api/daily-game.get.ts"
            trigger="Not a rendered UI — the JSON GET /api/daily-game returns on failure. DailyGameBoard maps these onto the fetch failure state above."
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-rose-500 mb-2">
                400 Bad Request
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                The optional ?date= query param failed validation (not
                YYYY-MM-DD).
              </p>
              <pre
                class="text-[11px] leading-relaxed overflow-x-auto bg-white dark:bg-stone-950 rounded p-2 m-0"
                >{{ badRequestSample }}</pre>
            </div>
            <div
              class="rounded-sm border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-rose-500 mb-2">
                500 Failed to fetch daily game
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                Redis read threw, or the N5 pool is empty (seed script never
                run). Stack is included only in development.
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
import AppHeader from "../../components/AppHeader.vue";

const noop = () => {};

const sections = [
  { id: "trending-fallback", label: "01 Fetch failure" },
  { id: "question-card", label: "02 Question card" },
  { id: "loading", label: "03 Loading skeleton" },
  { id: "summary", label: "04 Round summary" },
  { id: "kind-badge", label: "05 Kind badge" },
  { id: "not-found", label: "06 404" },
  { id: "api-errors", label: "07 API errors" },
];

const badRequestSample = JSON.stringify(
  {
    statusCode: 400,
    statusMessage: "Bad Request",
    data: {
      error: "Invalid query parameters",
      details: [{ path: "date", message: "Invalid" }],
    },
  },
  null,
  2,
);

const serverErrorSample = JSON.stringify(
  {
    statusCode: 500,
    statusMessage: "Failed to fetch daily game",
    data: {
      error:
        "N5 pool is empty — run `pnpm seed:n5` to seed kanji/vocab/kana data before requesting a daily game.",
    },
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
