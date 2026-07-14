<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
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
            @click="
              () => {
                mobileMenuOpen = false;
              }
            "
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">
        System Architecture
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300">
        NipponDaily is built with a modern stack focusing on performance,
        scalability, and AI integration. The system aggregates raw news and
        transforms it into synthesized intelligence using Google Gemini.
      </p>

      <!-- Diagram 1: System Overview -->
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

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Core Components
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-bold">Frontend (Nuxt 4)</h4>
          </template>
          <p class="text-sm">
            Built with Nuxt 4 and Vue 3, utilizing custom UI components and
            Tailwind CSS v4. The UI is designed for "Synthesized Reading,"
            prioritizing briefings over raw lists.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">API Engine (Nitro)</h4>
          </template>
          <p class="text-sm">
            The Nitro-powered backend handles request validation, search
            orchestration, and secure communication with AI services and Redis.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">Search (Tavily)</h4>
          </template>
          <p class="text-sm">
            Optimized news discovery via Tavily API, specifically filtered for
            Japan-related context and high-quality journalistic sources.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">AI (Google Gemini)</h4>
          </template>
          <p class="text-sm">
            Handles <strong>Executive Briefing</strong> generation,
            <strong>Cross-Source Analysis</strong>, and
            <strong>Trust Scoring</strong>. Features automatic fallback to
            preserve accessibility.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">Database & Cache (Upstash)</h4>
          </template>
          <p class="text-sm">
            Powered by Upstash Redis and Vector database, storing clustered
            story articles, daily briefings, and ingestion caching metadata.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">Re-grouping Engine</h4>
          </template>
          <p class="text-sm">
            An automated correction endpoint (`POST /api/regroup`) that
            reconciles data across Redis and Upstash Vector, using Gemini in a
            single pass to evaluate and resolve any story clustering mistakes.
          </p>
        </UCard>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Developer Debug Mode
      </h2>

      <p class="mb-4">
        Setting <code>DEBUG_ERROR_UI=true</code> enables a specialized UI panel
        to simulate API failures, rate limit resets, and AI fallback states,
        allowing for exhaustive layout testing without consuming real quotas.
      </p>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Color Palette & System
      </h2>

      <p>
        The application leverages Tailwind CSS v4's theme color mappings
        configured in
        <code>app/assets/css/tailwind.css</code>:
      </p>

      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">Traditional Pigment</th>
              <th class="py-2 px-4 text-left font-bold">Semantic Mappings</th>
              <th class="py-2 px-4 text-left font-bold">Application</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-4">
                <strong>Torii Vermilion (Shu-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Primary (<code>orange</code>) / Error (<code>orange</code>)
              </td>
              <td class="py-2 px-4">
                Main actions, briefing headers, active highlights
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Serene Sky (Sora-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Secondary (<code>sky</code>) / Info (<code>sky</code>)
              </td>
              <td class="py-2 px-4">Muted UI elements, secondary filters</td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Amber Gold (Kogane-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Success (<code>amber</code>) / Warning (<code>amber</code>)
              </td>
              <td class="py-2 px-4">Trust scores, warnings, alerts</td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Zen Stone (Kaibakushoku)</strong>
              </td>
              <td class="py-2 px-4">Neutral (<code>stone</code>)</td>
              <td class="py-2 px-4">
                Zen stone slate elements, grids, card borders, backgrounds
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 my-6 not-prose">
        <div
          v-for="(color, idx) in paletteColors"
          :key="idx"
          class="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 shadow-sm"
        >
          <div class="w-8 h-8 rounded-full mb-2" :class="color.bgClass" />
          <span
            class="text-xs font-serif font-bold text-stone-900 dark:text-white"
            >{{ color.name }}</span
          >
          <span
            class="text-[9px] text-stone-500 dark:text-stone-400 font-serif mt-0.5"
            >{{ color.romaji }}</span
          >
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- NEWS INGESTION PIPELINE                                          -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <!-- Diagram 2: Ingestion Pipeline -->
      <div class="my-10">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Ingestion Pipeline — Redis &amp; Vector Interaction (Zoomable)
        </h3>
        <MermaidDiagram id="ingest-diag" :code="ingestDiagram" />
        <p class="text-center text-xs text-gray-500 mt-2 italic">
          Shows exactly when Redis and Vector are read vs. written at each step.
        </p>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        News Ingestion Pipeline
      </h2>

      <p>
        Transforms raw article URLs into AI-synthesised story briefings in five
        steps:
      </p>

      <!-- Step 1 -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        Step 1 — Fetch (Tavily)
      </h3>
      <p>
        Tavily returns pre-filtered, high-quality excerpts — no HTML parsing
        needed. Fetches 20 articles in parallel for each specific category
        (Society, Tech, Pop Culture, Tourism, Food, Nature) totaling up to 120
        articles, and assigns categories properly before deduplication.
      </p>

      <!-- Step 2 -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        Step 2 — Deduplication (Redis)
      </h3>
      <p>
        A Redis <code>SADD</code>/<code>SISMEMBER</code> seen-set gives O(1)
        duplicate detection <em>before</em> vector embedding and AI calls — the
        two costliest steps.
      </p>

      <!-- Step 3 -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        Step 3 — Semantic Clustering (Upstash Vector)
      </h3>
      <p>
        Articles are embedded and compared via cosine similarity. A threshold of
        <code>0.82</code> groups same-event coverage into one story without
        merging loosely related topics (e.g. two separate earthquakes).
      </p>

      <!-- Step 4 -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        Step 4 — AI Briefing (Gemini)
      </h3>
      <p>
        Story groups are processed in batches of up to 15 stories using Gemini's
        <code>batchProcessStories</code> API. To run safely within Gemini's
        free-tier rate limits (5 RPM, 250K TPM, 20 RPD per model):
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>
          <strong>Batch Optimization:</strong> Increasing the batch size to 15
          groups all stories into a single request whenever possible, minimizing
          API consumption against the daily 20 RPD request quota.
        </li>
        <li>
          <strong>Rate Limiting Throttling:</strong> A 12-second delay is
          introduced between successive batch requests to respect the 5 Requests
          Per Minute limit.
        </li>
        <li>
          <strong>Model Failover:</strong> The system sequential tries
          <code>gemini-3.5-flash</code>, <code>gemini-3-flash</code>, and
          <code>gemini-2.5-flash</code>, skipping 429-limited models
          immediately. It retries only when the last model in the failover list
          fails.
        </li>
        <li>
          <strong>Cascading Failure Protection:</strong> If a batch API call
          fails completely, individual LLM story calls are bypassed, falling
          back directly to local text briefings to prevent rate-limit request
          flooding.
        </li>
      </ul>

      <!-- Step 5 -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        Step 5 — Persist &amp; Score
      </h3>
      <p>
        Stories are written to Redis only after a successful briefing, so the
        cache never holds half-processed entries. Velocity (trending) scores are
        recalculated across
        <em>all</em> stories at the end of each run — trending is relative, not
        per-story.
      </p>

      <!-- Auto-trigger note -->
      <div
        class="my-6 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
      >
        <p class="mb-0 text-amber-800 dark:text-amber-200 text-sm">
          ⚡ <strong>Auto-trigger:</strong> <code>GET /api/news</code> fires a
          background ingestion automatically when the cache is stale (&gt; 24 h)
          or empty.
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- API REFERENCE                                                     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Gemini Rate Limiting & Quota Management
      </h2>
      <p class="mb-4">
        To run reliably under the restrictive constraints of the Gemini Free
        Tier (e.g., 5 Requests Per Minute, 1,500 Requests Per Day), the
        application employs custom rate limit handling strategies for each API
        process:
      </p>

      <h3 class="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200">
        1. Ingestion Pipeline (<code>POST /api/ingest</code>)
      </h3>
      <ul
        class="list-disc pl-6 mb-6 space-y-1 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Batch Briefings:</strong> Instead of executing a separate
          request for every story cluster, it batches them into groups of up to
          15 stories per API call to minimize daily request consumption.
        </li>
        <li>
          <strong>Throttling Delay:</strong> To prevent exceeding the 5 RPM
          limit, it enforces a 12-second delay between successive batch
          requests.
        </li>
        <li>
          <strong>Embedding Backoff Retry:</strong> Individual embedding
          requests for new articles have a built-in exponential backoff retry
          mechanism (retrying up to 5 times for 429/Resource Exhausted errors).
        </li>
        <li>
          <strong>Cascading Failure Protection (Cascading Fallback):</strong> If
          a batch fails, individual story requests are bypassed, falling back
          directly to local text synthesis (to prevent request flooding and rate
          limit exhaust).
        </li>
      </ul>

      <h3 class="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200">
        2. Regrouping Pipeline (<code>POST /api/regroup</code>)
      </h3>
      <ul
        class="list-disc pl-6 mb-6 space-y-1 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Single-Pass Aggregation:</strong> Combines the entire dataset
          (existing stories + orphans) into a single request, ensuring
          regrouping consumes at most 1 request.
        </li>
        <li>
          <strong>Early-Return Optimization:</strong> Bypasses Gemini requests
          entirely if both the Redis story cache and Upstash Vector DB are
          empty.
        </li>
        <li>
          <strong>Model Failover:</strong> Sequentially falls back through the
          available Gemini models (<code>gemini-3.5-flash</code> &rarr;
          <code>gemini-3-flash</code> &rarr; <code>gemini-2.5-flash</code>) on
          transient failure or rate-limiting.
        </li>
      </ul>

      <h3 class="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200">
        3. Client News API (<code>GET /api/news</code>)
      </h3>
      <ul
        class="list-disc pl-6 mb-6 space-y-1 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Zero Live Calls:</strong> Serves current stories exclusively
          from the Redis cache. Live Gemini calls are decoupled from customer
          queries, keeping client traffic isolated from API limits.
        </li>
      </ul>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        API Reference
      </h2>

      <!-- /api/regroup -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        <code>POST /api/regroup</code>
      </h3>
      <p>
        Fetches all current stories from Redis and all articles from the Upstash
        Vector database, reconciles them, and sends them to Google Gemini in a
        single pass to correct any grouping or clustering mistakes.
      </p>

      <h4 class="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">
        Detailed Execution Process:
      </h4>
      <ol
        class="list-decimal pl-6 mb-6 space-y-1 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Fetch current state:</strong> Reads all current stories from
          the Redis cache and all article vectors + metadata from the Upstash
          Vector database.
        </li>
        <li>
          <strong>Reconcile datasets:</strong> Maps each article to its current
          story (based on the Redis story's source list) and identifies any
          "orphaned" articles (articles present in Vector DB but not assigned to
          any story in Redis).
        </li>
        <li>
          <strong>Early-return check:</strong> If the database is completely
          empty (no stories in Redis and no orphaned articles in Vector DB), the
          process logs this state and returns early, bypassing any Gemini
          requests.
        </li>
        <li>
          <strong>Single-Pass Regroup (Gemini):</strong> Packages all existing
          story clusters and orphaned articles into a single prompt payload.
          Sends this payload to Gemini in a single pass to correct
          misclusterings, split stories, merge overlapping topics, and assign
          orphaned articles.
        </li>
        <li>
          <strong>Rebuild stories metadata:</strong> Parses Gemini's JSON
          response, maps the assigned article URLs back to their full metadata,
          computes region breakdowns, and aggregates categories.
        </li>
        <li>
          <strong>Database Commit:</strong> If <code>dryRun</code> is false, it
          clears the old story cache in Redis, saves the new story objects,
          updates the <code>story_id</code> metadata tags for every modified
          article in the Upstash Vector index, and updates story velocity
          (trending) scores.
        </li>
      </ol>

      <p>
        Supports a <code>dryRun</code> mode to verify regrouping results before
        committing destructive changes to Redis and Upstash Vector metadata.
      </p>

      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code># Run a preview dry-run (does not modify databases)
curl -X POST http://localhost:3000/api/regroup \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Run actual database updates
curl -X POST http://localhost:3000/api/regroup \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'</code></pre>

      <p><strong>Success (200):</strong></p>
      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code>{
  "success": true,
  "dryRun": true,
  "originalStoriesCount": 5,
  "newStoriesCount": 4,
  "data": [ ... ],
  "timestamp": "2026-07-14T13:30:00.000Z"
}</code></pre>

      <!-- /api/ingest -->
      <h3 class="text-xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-200">
        <code>POST /api/ingest</code>
      </h3>
      <p>
        Runs the full ingestion pipeline. Called on a schedule via
        <strong>QStash</strong>
        — register the URL in the Upstash console, no code changes needed.
      </p>

      <div
        class="my-4 p-4 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30"
      >
        <p class="mb-0 text-sky-800 dark:text-sky-200 text-sm">
          🗓 <strong>QStash one-time setup:</strong>
          <em>QStash → Schedules → New Schedule</em>, URL
          <code>https://your-domain.com/api/ingest</code>, method
          <code>POST</code>, cron e.g. <code>0 */6 * * *</code>.
        </p>
      </div>

      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code># Trigger locally
curl -X POST http://localhost:3000/api/ingest

# With Doppler env vars
doppler run -- curl -X POST http://localhost:3000/api/ingest</code></pre>

      <p><strong>Success (200):</strong></p>
      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code>{ "success": true, "storiesUpdated": 4, "articlesProcessed": 12 }</code></pre>

      <!-- /api/news -->
      <h3 class="text-xl font-bold mt-10 mb-3 text-gray-800 dark:text-gray-200">
        <code>GET /api/news</code>
      </h3>
      <p>
        Returns story briefings from Redis. Auto-triggers background ingestion
        if the cache is stale or empty.
      </p>

      <div class="overflow-x-auto my-4">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">Parameter</th>
              <th class="py-2 px-4 text-left font-bold">Type</th>
              <th class="py-2 px-4 text-left font-bold">Default</th>
              <th class="py-2 px-4 text-left font-bold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-4"><code>category</code></td>
              <td class="py-2 px-4">string</td>
              <td class="py-2 px-4">—</td>
              <td class="py-2 px-4">
                Topic filter (e.g. <code>society</code>, <code>tech</code>)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4"><code>query</code></td>
              <td class="py-2 px-4">string (max 100)</td>
              <td class="py-2 px-4">—</td>
              <td class="py-2 px-4">
                Full-text search across headlines &amp; summaries
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4"><code>timeRange</code></td>
              <td class="py-2 px-4">
                <code>day</code> | <code>week</code> | <code>month</code> |
                <code>year</code> | <code>none</code>
              </td>
              <td class="py-2 px-4"><code>week</code></td>
              <td class="py-2 px-4">Relative time window</td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <code>startDate</code> / <code>endDate</code>
              </td>
              <td class="py-2 px-4">YYYY-MM-DD</td>
              <td class="py-2 px-4">—</td>
              <td class="py-2 px-4">
                Absolute date range (both required together, max 365 days)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4"><code>limit</code></td>
              <td class="py-2 px-4">number (1–20)</td>
              <td class="py-2 px-4"><code>20</code></td>
              <td class="py-2 px-4">Max stories to return</td>
            </tr>
          </tbody>
        </table>
      </div>

      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code># Top 20 stories this week
curl http://localhost:3000/api/news

# Filter by category
curl "http://localhost:3000/api/news?category=tech&amp;limit=5"

# Full-text search
curl "http://localhost:3000/api/news?query=Tokyo+earthquake"</code></pre>

      <p><strong>Success (200) — abbreviated:</strong></p>
      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code>{
  "success": true,
  "count": 8,
  "data": {
    "mainHeadline": "...",
    "stories": [ ... ],
    "lastIngestTime": 1752382800000
  }
}</code></pre>

      <p><strong>Validation error (400):</strong></p>
      <pre
        class="bg-stone-100 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto text-sm"
      ><code>{ "statusCode": 400, "data": { "error": "Invalid query parameters", "details": [...] } }</code></pre>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Trust & Credibility
      </h2>
      <p>
        Every briefing includes an AI-computed <strong>Trust Score</strong>.
        This score is a weighted assessment of source reputation, content
        verifiability, and publisher history.
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">
        Trust Gradient
      </h3>
      <p>
        The trust score badge uses a dynamic HSL gradient:
        <code>hsl(score × 120, 70%, 45%)</code>, ranging from:
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>
          100% (High Trust):
          <span class="text-green-600 font-bold">Green</span>
        </li>
        <li>
          50% (Moderate):
          <span class="text-yellow-600 font-bold">Yellow</span>
        </li>
        <li>
          0% (Low Trust):
          <span class="text-red-600 font-bold">Red</span>
        </li>
      </ul>
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
const mobileMenuOpen = ref(false);

const paletteColors = [
  {
    name: "Torii Vermilion",
    romaji: "Shu-iro",
    bgClass: "bg-primary-500",
  },
  { name: "Serene Sky", romaji: "Sora-iro", bgClass: "bg-secondary-500" },
  { name: "Amber Gold", romaji: "Kogane", bgClass: "bg-success-500" },
  {
    name: "Zen Stone",
    romaji: "Kaibaku",
    bgClass: "bg-stone-300 dark:bg-stone-700",
  },
];
const systemDiagram = `
flowchart TD
    User(["👤 User"])
    QStash(["🕐 QStash\nScheduler"])

    User -- "GET /api/news" --> NewsAPI["GET /api/news\n(Nitro)"]
    NewsAPI -- "stories + briefings" --> User

    QStash -- "POST /api/ingest\n(on schedule)" --> IngestAPI["POST /api/ingest\n(Nitro)"]
    User -- "POST /api/regroup" --> RegroupAPI["POST /api/regroup\n(Nitro)"]

    subgraph Storage ["💾 Storage Layer (Upstash)"]
        Redis[("Redis\nStory Cache")]
        Vector[("Vector DB\nSemantic Index")]
    end

    subgraph External ["🌐 External APIs"]
        Tavily["Tavily Search"]
        Gemini["Gemini AI"]
    end

    IngestAPI --> Tavily
    IngestAPI --> Gemini
    IngestAPI --> Redis
    IngestAPI --> Vector

    RegroupAPI --> Gemini
    RegroupAPI --> Redis
    RegroupAPI --> Vector

    NewsAPI -- "read stories" --> Redis
    NewsAPI -. "auto-trigger\nif cache stale" .-> IngestAPI
`;

const ingestDiagram = `
flowchart TD
    Start(["QStash triggers\nPOST /api/ingest"])

    Start --> S1["Step 1 · Fetch\nTavily Search → 20 articles"]

    S1 --> S2["Step 2 · Deduplicate\nCheck each URL vs Redis seen-set"]
    S2 -- "READ" --> RedisA[("Redis\nseen-set")]
    RedisA -- "skip already-seen" --> S2

    S2 --> S3["Step 3 · Cluster\nEmbed title+summary → query Vector"]
    S3 -- "QUERY (topK=1)" --> VectorDB[("Vector DB\nsemantic index")]
    VectorDB -- "cosine score" --> Dec{"Score ≥ 0.82?"}
    Dec -- "Yes → append to\nexisting story" --> Merge["Merge article\ninto story group"]
    Dec -- "No → mint\nnew story UUID" --> New["Create new\nstory group"]
    Merge --> Upsert["WRITE vector\nwith story_id tag"]
    New --> Upsert
    Upsert --> VectorDB

    Merge --> S4
    New --> S4

    S4["Step 4 · AI Briefing\nGemini generates / updates briefing"]
    S4 -- "new story" --> GenBrief["generateStoryBriefing\nheadline + summary + credibility"]
    S4 -- "existing story" --> UpdBrief["updateStoryBriefing\nmerge sources + revise analysis"]

    GenBrief --> S5
    UpdBrief --> S5

    S5["Step 5 · Persist"]
    S5 -- "WRITE story JSON" --> RedisB[("Redis\nstory cache")]
    S5 -- "WRITE processed URL" --> RedisC[("Redis\nseen-set")]
    S5 --> Velocity["updateVelocityScores\nrecalculate trending for all stories"]
    Velocity -- "WRITE trend scores" --> RedisB
    Velocity --> Done(["✅ Done"])
`;
</script>

<style>
@reference "../../assets/css/tailwind.css";

h1 {
  @apply text-3xl font-bold mb-6 text-primary-500;
}
h2 {
  @apply text-2xl font-bold mt-12 mb-4 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
