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
        JSON in the repo, generated from dictionary and Wiktionary snapshots
        (only each headline is hand-written), served by date and never before
        their day arrives. The pages are rendered on the server. Redis holds
        only the site's current season, which a daily cron keeps in step with
        the calendar.
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
            calendar, <code>/words/[date]</code> is one entry,
            <code>/explore</code> and <code>/patterns</code> read across the
            words, and <code>/parts</code> indexes their morphemes. Pages are
            server-rendered: they fetch from the API during rendering, so the
            HTML already holds the data, and the browser reuses it. They never
            import the entries, so no future word ships in the bundle (a unit
            test enforces this).
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
            (<code>shared/words.ts</code>) and the modules built on it, with no
            database read. A day is open once midnight in Japan (JST) has
            passed; a later date is a <code>400</code>, and the parts, explore,
            patterns, related-words and sitemap routes read only open days.
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
            Holds the single <code>SiteTheme</code> record. The words don't live
            here. Without Redis credentials the season is held in process
            memory.
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

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-shield-check"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              This browser only
            </h4>
          </template>
          <p class="text-sm">
            <code>localStorage</code> keeps the color mode, the season pick and
            the music volume. None of it is sent anywhere.
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
        <li>
          <strong>Music.</strong> The header's music button plays a looping
          background track in a season that has one (autumn only, so far). It is
          off on every load; only the volume is remembered, in this browser's
          <code>localStorage</code>.
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
            <tr v-for="endpoint in API_ENDPOINTS" :key="endpoint.path">
              <td class="py-2 px-2 align-top">
                <code>{{ endpoint.method }} {{ endpoint.path }}</code
                ><template v-if="endpoint.query"
                  ><br /><code>{{ endpoint.query }}</code></template
                >
              </td>
              <td class="py-2 px-2">
                <RichText :text="endpoint.returns" />
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
      "pos": ["noun (common) (futsuumeishi)", ...],
      "stratum": "kango",
      "processes": ["compound", "wasei"],
      "headline": "...",
      "morphemes": [
        { "text": "電", "reading": "でん", "meaning": "electric" },
        ...
      ],
      "sources": [ { "quote": "..." } ],
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
import { usePageSeo } from "../../composables/usePageSeo";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import RichText from "../../components/RichText.vue";
import { API_ENDPOINTS } from "~~/shared/endpoints";

const systemDiagram = `
flowchart TD
    Cron(["⏰ Vercel Cron
daily, 15:00 UTC (00:00 JST)"])
    User(["👤 Reader"])
    Words[("data/words/*.json
in-repo daily entries")]
    Redis[("Redis
site season")]
    Local["localStorage
season pick, color mode,
music volume"]

    Cron -- "Bearer CRON_SECRET" --> CronAPI["GET /api/cron/update-season"]
    CronAPI -- "write season
(only if changed)" --> Redis

    User -- "GET /api/daily-word" --> WordAPI["GET /api/daily-word"]
    WordAPI -- "the day's entry
(never a future day)" --> Words

    User -- "GET /api/word-calendar" --> CalAPI["GET /api/word-calendar"]
    CalAPI -- "the month
(upcoming days reveal nothing)" --> Words

    User -- "GET /api/explore · /api/patterns
/api/parts · /api/part · /api/related" --> ReadAPI["cross-word endpoints"]
    ReadAPI -- "open days only" --> Words

    User -- "/sitemap.xml · /robots.txt" --> MapAPI["sitemap + robots"]
    MapAPI -- "open days only" --> Words

    User -- "GET /api/site-theme" --> ThemeAPI["GET /api/site-theme"]
    ThemeAPI -- "read season;
if none, today's season" --> Redis

    User -. "season button, color mode,
music volume (this browser only)" .-> Local
`;

usePageSeo({
  title: "System architecture",
  description:
    "How NipponDaily is built: the server-rendered Nuxt frontend, the in-repo word catalogue and the endpoints that read it, and the daily season cron.",
  path: "/docs/architecture",
});
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
