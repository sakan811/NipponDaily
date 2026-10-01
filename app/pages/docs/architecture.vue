<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader />

    <main
      class="relative z-10 container mx-auto px-4 max-w-4xl py-12 flex-1 prose dark:prose-invert"
    >
      <NuxtLink
        to="/#docs"
        class="kicker text-stone-400 dark:text-stone-500 no-underline hover:text-primary-500 transition-colors"
      >
        &larr; Documentation
      </NuxtLink>
      <h1
        class="text-3xl sm:text-4xl font-serif font-bold mb-4 mt-4 text-stone-900 dark:text-white"
      >
        System Architecture
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        NipponDaily is a Nuxt 4 app with a small Nitro API. The daily words are
        hand-written JSON in the repo, served by date and never before their day
        arrives. Redis holds only the JLPT reference pool and the site's current
        season, which a daily cron keeps in step with the calendar.
      </p>

      <div class="my-10">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          System Overview (Zoomable)
        </h3>
        <MermaidDiagram id="arch-diag" :code="systemDiagram" />
        <p class="text-center text-xs text-gray-500 mt-2 italic">
          Tip: Use your mouse wheel to zoom and drag to pan the diagram.
        </p>
      </div>

      <h2
        class="text-3xl font-serif font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        1. Components
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-window"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Frontend (Nuxt 4)
            </h4>
          </template>
          <p class="text-sm">
            Vue 3 and Tailwind CSS v4 with locally maintained UI components. The
            home page shows today's word, <code>/words</code> is the month
            calendar, and <code>/words/[date]</code> is one entry. Pages fetch
            from the API in the browser and never import the entries, so no
            future word ships in the bundle (a unit test enforces this).
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-server"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              API (Nitro)
            </h4>
          </template>
          <p class="text-sm">
            Serves the words straight from the in-repo catalogue
            (<code>shared/words.ts</code>), with no database read. A day is open
            once midnight in Japan (JST) has passed; a later date is a
            <code>400</code>.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-circle-stack"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Redis (Upstash)
            </h4>
          </template>
          <p class="text-sm">
            Holds the seeded kanji/vocab pool for N5–N2 (see
            <NuxtLink to="/docs/data-integrity">Data Integrity</NuxtLink>) and
            the single <code>SiteTheme</code> record. The words don't live here.
            Without Redis credentials the pool endpoints return empty lists and
            the season is held in process memory.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-clock"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Season cron
            </h4>
          </template>
          <p class="text-sm">
            A Vercel Cron job (<code>vercel.json</code>) calls
            <code>GET /api/cron/update-season</code> daily at 15:00 UTC, which
            is midnight in Japan, and stores the season for that date.
          </p>
        </UCard>
      </div>

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. Seasons
      </h2>

      <p class="mb-4">
        A season sets the color palette and the shape of the UI through a
        <code>data-season</code> attribute on <code>&lt;html&gt;</code>. There
        are four, defined once in <code>shared/seasons.ts</code>: spring
        (<code>sakura</code>, March–May), <code>summer</code> (June–August),
        <code>autumn</code> (September–November) and <code>winter</code>
        (December–February), by the date in Japan.
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Site season.</strong> The cron writes it to Redis, and only
          when it changed. <code>GET /api/site-theme</code> serves it. If
          nothing is stored yet, that endpoint computes today's season itself
          and saves it, so the site is never unstyled.
        </li>
        <li>
          <strong>Reader's choice.</strong> The season button in the header
          picks any of the four, or “Follow the calendar”. The pick is kept in
          this browser's <code>localStorage</code> and never sent anywhere; it
          wins over the site season until you switch back.
        </li>
        <li>
          <strong>No flash.</strong> An inline script in
          <code>nuxt.config.ts</code> applies the reader's choice, or the cached
          site season, before first paint.
        </li>
      </ul>

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        3. API Reference
      </h2>

      <div class="overflow-x-auto mb-8">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-2 text-left font-bold">Endpoint</th>
              <th class="py-2 px-2 text-left font-bold">Returns</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-2 align-top">
                <code>GET /api/daily-word</code><br ><code
                  >?date=YYYY-MM-DD</code
                >
              </td>
              <td class="py-2 px-2">
                One entry plus its <code>prev</code> and <code>next</code> days.
                With no date: today in Japan, or the newest word once the
                catalogue runs out. A future or invalid date is a
                <code>400</code>; a past date with no entry (or no word yet) is
                a <code>404</code>. <code>next</code> stays
                <code>null</code> until that day has arrived.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">
                <code>GET /api/word-calendar</code><br ><code
                  >?month=YYYY-MM</code
                >
              </td>
              <td class="py-2 px-2">
                <code>{ month, months, today, days }</code>. An open day carries
                its <code>term</code>, <code>kana</code> and
                <code>stratum</code>; an upcoming day carries only its date and
                <code>"upcoming"</code>. The month defaults to the current one
                if it has words, else the newest. A malformed month is a
                <code>400</code>, a month with no words a <code>404</code>.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">
                <code>GET /api/site-theme</code>
              </td>
              <td class="py-2 px-2">
                The site <code>SiteTheme</code>:
                <code>{ season, updatedAt, source }</code>, where
                <code>source</code> is <code>"cron"</code> or
                <code>"fallback"</code>. CDN-cached for 60 seconds (<code
                  >s-maxage=60, stale-while-revalidate=600</code
                >).
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">
                <code>GET /api/cron/update-season</code>
              </td>
              <td class="py-2 px-2">
                Called by the cron. Needs
                <code>Authorization: Bearer &lt;CRON_SECRET&gt;</code> (else
                <code>401</code>). Returns
                <code>{ season, previousSeason, changed }</code>.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">
                <code>GET /api/pool-vocab</code><br ><code
                  >GET /api/pool-kanji</code
                ><br ><code>?level=N5</code>
              </td>
              <td class="py-2 px-2">
                One JLPT level's pool as <code>{ data, count }</code> (<code
                  >N5</code
                >
                by default, up to <code>N2</code>). Vocab goes through the
                corrections in <code>shared/meanings.ts</code>. No page reads
                these.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs font-bold text-gray-500 mb-1">
        Example: <code>GET /api/daily-word?date=2026-10-01</code>
      </p>
      <pre
        class="bg-stone-100 dark:bg-stone-900 season-box p-3 overflow-x-auto text-xs m-0"
      ><code>{
  "success": true,
  "data": {
    "entry": {
      "date": "2026-10-01",
      "term": "電話",
      "kana": "でんわ",
      "meaning": "a telephone",
      "level": "N5",
      "stratum": "kango",
      "processes": ["wasei", "compound"],
      "headline": "...",
      "morphemes": [ ... ],
      "story": [ ... ],
      "sources": [ ... ],
      "wiktionaryRev": 92203082
    },
    "prev": null,
    "next": { "date": "2026-10-02", "term": "友達" }
  },
  "timestamp": "2026-10-01T00:00:00.000Z"
}</code></pre>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";

const systemDiagram = `
flowchart TD
    Cron(["⏰ Vercel Cron
daily, 15:00 UTC (00:00 JST)"])
    User(["👤 Reader"])
    Words[("data/words/*.json
in-repo daily entries")]
    Redis[("Redis
JLPT pool + site season")]
    Local["localStorage
reader's season choice"]

    Cron -- "Bearer CRON_SECRET" --> CronAPI["GET /api/cron/update-season"]
    CronAPI -- "write season
(only if changed)" --> Redis

    User -- "GET /api/daily-word" --> WordAPI["GET /api/daily-word"]
    WordAPI -- "the day's entry
(never a future day)" --> Words

    User -- "GET /api/word-calendar" --> CalAPI["GET /api/word-calendar"]
    CalAPI -- "the month
(upcoming days reveal nothing)" --> Words

    User -- "GET /api/site-theme" --> ThemeAPI["GET /api/site-theme"]
    ThemeAPI -- "read season;
if none, today's season" --> Redis

    User -. "season button
(this browser only)" .-> Local
`;
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

/* Basic styling rules for markdown elements are retained but simplified for UCard compatibility */
h1 {
  @apply text-3xl font-serif font-bold mb-6 text-stone-900 dark:text-white;
}
h2 {
  @apply text-2xl font-serif font-bold mt-12 mb-4 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
