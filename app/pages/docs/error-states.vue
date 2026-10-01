<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

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
          class="text-xs font-mono px-2.5 py-1 season-chip bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-primary-500 no-underline"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="space-y-14">
        <!-- 1. Word fetch failure -->
        <section id="trending-fallback" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="01"
            title="Word fetch failure"
            component="components/TrendingFallback.vue"
            trigger="<code>GET /api/daily-word</code> or <code>GET /api/word-calendar</code> throws (network error or a 5xx). The home page, <code>/words</code> and <code>/words/[date]</code> each pass their own title; a 400/404 on a single day swaps the message for “That day hasn't arrived yet.” or “There is no word for this day.”"
          />
          <TrendingFallback
            :error="'Failed to load the word. Please try again.'"
            :loading="false"
            title="Unable to Load Today's Word"
            detail="The page could not fetch its data. This is usually temporary."
            @retry="noop"
          />
        </section>

        <!-- 2. An entry with an unsettled origin -->
        <section id="unsettled" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="02"
            title="Entry with an unsettled origin"
            component="components/WordEntryView.vue (hedged sources, morphemes: [])"
            trigger="An entry whose source hedges or gives no clean split: no morpheme breakdown (any other split would be a guess) and a “Not settled” callout, which appears whenever a quoted Wiktionary line contains a hedge such as “probably” or “unknown”. The content test requires such a line whenever an entry is tagged “Origin unclear”. The entry below is a synthetic placeholder, not a real etymology."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 season-box bg-white dark:bg-stone-900/50 p-5 sm:p-8"
          >
            <WordEntryView :entry="placeholderEntry" />
          </div>
        </section>

        <!-- 3. Loading skeleton -->
        <section id="loading" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="03"
            title="Loading skeletons"
            component="pages/index.vue · pages/words/index.vue · pages/words/[date].vue"
            trigger="Shown while the page's API call is in flight (initial mount, or a manual retry). The page never renders an empty frame."
          />
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-3" aria-busy="true">
              <p class="kicker text-stone-400">Word page</p>
              <USkeleton class="h-6 w-48" />
              <USkeleton class="h-20 w-72" />
              <USkeleton class="h-40 w-full" />
            </div>
            <div class="space-y-3" aria-busy="true">
              <p class="kicker text-stone-400">Calendar</p>
              <USkeleton class="h-10 w-64" />
              <USkeleton class="h-40 w-full" />
            </div>
          </div>
        </section>

        <!-- 4. Calendar day states -->
        <section id="calendar-days" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="04"
            title="Calendar day states"
            component="pages/words/index.vue"
            trigger="A day is “open” once midnight in Japan has passed (it shows its word and links to it), “today” when it is the current day, and “upcoming” before then — an upcoming day reveals nothing, and the API refuses to serve it. The words below are placeholders."
          />
          <div class="grid grid-cols-3 gap-2 max-w-md">
            <div
              class="season-box min-h-[6rem] border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-2.5"
            >
              <p class="text-xs text-stone-500">12</p>
              <p class="mt-1 text-2xl font-serif font-bold">例</p>
              <p class="text-xs text-stone-500">れい</p>
              <p class="kicker text-stone-400 mt-1">open</p>
            </div>
            <div
              class="season-box min-h-[6rem] border border-primary-500 ring-2 ring-primary-500/30 bg-white dark:bg-stone-900/50 p-2.5"
            >
              <p class="text-xs text-stone-500">13</p>
              <p class="mt-1 text-2xl font-serif font-bold">例</p>
              <p class="text-xs text-stone-500">れい</p>
              <p class="kicker text-primary-500 mt-1">today</p>
            </div>
            <div
              class="min-h-[6rem] border border-dashed border-stone-300/70 dark:border-stone-800 p-2.5 text-xs text-stone-400 dark:text-stone-600"
            >
              14
              <p class="kicker mt-6">upcoming</p>
            </div>
          </div>
        </section>

        <!-- 5. Layer badges -->
        <section id="strata" class="scroll-mt-24 space-y-3">
          <ErrorStateHeading
            index="05"
            title="Vocabulary-layer badges"
            component="components/WordEntryView.vue (entry.stratum)"
            trigger="Every entry names the layer of the vocabulary it belongs to; the calendar colors its dot to match."
          />
          <div
            class="border border-stone-300 dark:border-stone-800 season-box p-5 bg-white dark:bg-stone-900 flex flex-wrap gap-2"
          >
            <UBadge color="primary" variant="soft"
              >和語 · Native Japanese</UBadge
            >
            <UBadge color="secondary" variant="soft"
              >漢語 · Sino-Japanese</UBadge
            >
            <UBadge color="warning" variant="soft">外来語 · Loanword</UBadge>
            <UBadge color="gray" variant="soft">混種語 · Hybrid</UBadge>
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
            class="border border-stone-300 dark:border-stone-800 season-box bg-[#FDFBF7] dark:bg-[#0B0E14] px-4 py-12 text-center"
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
            component="server/api/daily-word.get.ts · server/api/word-calendar.get.ts"
            trigger="Not a rendered UI — the JSON the word endpoints return on failure. The pages map these onto the fetch-failure state above."
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              class="season-box border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-error-500 mb-2">
                400 Bad Request
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                ?date= is not a real calendar date, or is a day that hasn't
                arrived yet in Japan (an upcoming word is never served early).
                On /api/word-calendar, ?month= is not a real YYYY-MM.
              </p>
              <pre
                class="text-[11px] leading-relaxed overflow-x-auto bg-white dark:bg-stone-950 rounded p-2 m-0"
                >{{ badRequestSample }}</pre>
            </div>
            <div
              class="season-box border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4"
            >
              <p class="text-xs font-mono font-bold text-error-500 mb-2">
                404 Not Found
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                A valid past date (or month) the catalogue doesn't cover. With
                no ?date=, /api/daily-word serves the newest open word instead,
                and is a 404 only before the first word.
              </p>
              <pre
                class="text-[11px] leading-relaxed overflow-x-auto bg-white dark:bg-stone-950 rounded p-2 m-0"
                >{{ notFoundSample }}</pre>
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
import TrendingFallback from "../../components/TrendingFallback.vue";
import WordEntryView from "../../components/WordEntryView.vue";
import type { WordEntry } from "~~/types/index";

const noop = () => {};

/** A synthetic entry, plainly labelled as a placeholder: this page previews
 *  the layout of an unsettled-origin entry, and inventing an etymology to do
 *  it would be exactly the kind of error the content tests exist to prevent. */
const placeholderEntry: WordEntry = {
  date: "2026-10-13",
  term: "例",
  kana: "れい",
  meaning: "example",
  level: "N4",
  pos: ["noun (common) (futsuumeishi)"],
  stratum: "kango",
  processes: ["unclear"],
  headline: "A placeholder entry used to preview this layout.",
  morphemes: [],
  sources: [
    {
      quote:
        "Placeholder — this line is hedged (probably) so the callout shows. A real entry quotes Wiktionary here, verbatim.",
    },
  ],
  wiktionaryRev: 1,
};

const sections = [
  { id: "trending-fallback", label: "01 Fetch failure" },
  { id: "unsettled", label: "02 Unsettled origin" },
  { id: "loading", label: "03 Loading skeletons" },
  { id: "calendar-days", label: "04 Calendar days" },
  { id: "strata", label: "05 Layer badges" },
  { id: "not-found", label: "06 404" },
  { id: "api-errors", label: "07 API errors" },
];

const badRequestSample = JSON.stringify(
  {
    statusCode: 400,
    statusMessage: "Bad Request",
    data: {
      error: "Invalid query parameters",
      details: [{ path: "date", message: "Date cannot be in the future" }],
    },
  },
  null,
  2,
);

const notFoundSample = JSON.stringify(
  {
    statusCode: 404,
    statusMessage: "Not Found",
    data: { error: "There is no word for 2026-08-31." },
  },
  null,
  2,
);
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

h1 {
  @apply text-3xl font-serif font-bold mb-6 text-stone-900 dark:text-white;
}
</style>
