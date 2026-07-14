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
      <h1 class="text-4xl font-extrabold mb-4 text-primary-500">
        System Architecture
      </h1>

      <div
        class="p-4 mb-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
      >
        <p class="m-0 text-blue-900 dark:text-blue-100">
          <strong>👋 Welcome!</strong> Whether you are an experienced developer
          or a beginner exploring how modern AI apps are built, this guide will
          walk you through how NipponDaily works behind the scenes. We've broken
          down complex topics to make them easy to understand, without skipping
          any of the technical details.
        </p>
      </div>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        NipponDaily is built with a modern stack focusing on performance,
        scalability, and AI integration. In simple terms, the system aggregates
        raw news from the internet and transforms it into synthesized
        intelligence (easy-to-read summaries) using Google Gemini AI.
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

      <h2
        class="text-3xl font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        1. Core Components
      </h2>
      <p class="mb-6">
        Here are the main building blocks (technologies) that make NipponDaily
        work:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-window" /> Frontend (Nuxt 4)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> This is the user interface you see
            and interact with in your browser.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Built with Nuxt 4 and Vue 3,
            utilizing custom UI components and Tailwind CSS v4. The UI is
            designed for "Synthesized Reading," prioritizing summarized
            briefings over raw lists of links.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-server" /> API Engine (Nitro)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> The backend server that connects the
            frontend to our databases and AI.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> The Nitro-powered backend
            handles request validation, search orchestration, and secure
            communication with AI services and Redis.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-magnifying-glass" /> Search (Tavily)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> Our search engine that finds the
            latest news articles.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Optimized news discovery via
            Tavily API, specifically filtered for Japan-related context and
            high-quality journalistic sources.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" /> AI (Google Gemini)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> The "brain" that reads and summarizes
            the news for you.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Handles
            <strong>Executive Briefing</strong> generation,
            <strong>Cross-Source Analysis</strong>, and
            <strong>Trust Scoring</strong>. Features automatic fallback to
            preserve accessibility if the AI is busy.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-circle-stack" /> Database & Cache
              (Upstash)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> Where we store the news so the
            website loads instantly.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Powered by Upstash Redis and
            Vector database, storing clustered story articles, daily briefings,
            and ingestion caching metadata.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-path-rounded-square" /> Re-grouping
              Engine
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> A tool that fixes any mistakes the AI
            made when grouping similar stories together.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> An automated correction endpoint
            (<code>POST /api/regroup</code>) that reconciles data across Redis
            and Upstash Vector, using Gemini in a single pass to evaluate and
            resolve any story clustering mistakes.
          </p>
        </UCard>
      </div>

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. Developer Debug Mode
      </h2>

      <p class="mb-4">
        We included a special tool for developers to test how the app handles
        errors without actually breaking anything or using up API credits.
      </p>
      <p class="mb-4">
        <strong>Technical Details:</strong> Setting
        <code>DEBUG_ERROR_UI=true</code> enables a specialized UI panel to
        simulate API failures, rate limit resets, and AI fallback states,
        allowing for exhaustive layout testing without consuming real quotas.
      </p>

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        3. Color Palette & System
      </h2>

      <p>
        The application leverages Tailwind CSS v4's theme color mappings
        configured in <code>app/assets/css/tailwind.css</code>. We use
        traditional Japanese colors to give the app its unique feel:
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
              <td class="py-2 px-4"><strong>Serene Sky (Sora-iro)</strong></td>
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

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        4. News Ingestion Pipeline
      </h2>

      <p class="text-lg mb-6">
        This is the core journey of a news article: how it transforms from a raw
        URL on the web into an AI-synthesised story briefing you can read on the
        site.
      </p>

      <!-- Diagram 2: Ingestion Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Ingestion Pipeline — Redis &amp; Vector Interaction (Zoomable)
        </h3>
        <MermaidDiagram id="ingest-diag" :code="ingestDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          This chart shows exactly when our databases (Redis and Vector) are
          read from and written to at each step.
        </p>
      </div>

      <p class="font-semibold text-xl mt-10 mb-4">
        The process happens in 5 steps:
      </p>

      <div
        class="space-y-8 pl-4 border-l-4 border-primary-200 dark:border-primary-800"
      >
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 1</span> Fetch (Tavily)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We search the web for the latest news
            across different categories.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Tavily returns pre-filtered,
            high-quality excerpts — no HTML parsing needed. Fetches 20 articles
            in parallel for each specific category (Society, Tech, Pop Culture,
            Tourism, Food, Nature) totaling up to 120 articles, and assigns
            categories properly before deduplication.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 2</span> Deduplication
            (Redis)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We throw away articles we have already
            processed to save time and money.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> A Redis <code>SADD</code>/<code
              >SISMEMBER</code
            >
            seen-set gives O(1) duplicate detection <em>before</em> vector
            embedding and AI calls — the two costliest steps.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 3</span> Semantic
            Clustering (Upstash Vector)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> AI groups articles that are talking
            about the exact same event together, so you don't read the same news
            twice.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Articles are embedded and
            compared via cosine similarity. A threshold of
            <code>0.82</code> groups same-event coverage into one story without
            merging loosely related topics (e.g. two separate earthquakes).
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 4</span> AI Briefing
            (Gemini)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> The AI reads the grouped articles and
            writes a neat, professional summary.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Technical Details:</strong> Story groups are processed in
            batches of up to 15 stories using Gemini's
            <code>batchProcessStories</code> API. To run safely within Gemini's
            free-tier rate limits (5 RPM, 250K TPM, 20 RPD per model):
          </p>
          <ul
            class="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400"
          >
            <li>
              <strong>Batch Optimization:</strong> Increasing the batch size to
              15 groups all stories into a single request whenever possible,
              minimizing API consumption against the daily 20 RPD request quota.
            </li>
            <li>
              <strong>Rate Limiting Throttling:</strong> A 12-second delay is
              introduced between successive batch requests to respect the 5
              Requests Per Minute limit.
            </li>
            <li>
              <strong>Model Failover:</strong> The system sequential tries
              <code>gemini-3.5-flash</code>, <code>gemini-3-flash</code>, and
              <code>gemini-2.5-flash</code>, skipping 429-limited models
              immediately. It retries only when the last model in the failover
              list fails.
            </li>
            <li>
              <strong>Cascading Failure Protection:</strong> If a batch API call
              fails completely, individual LLM story calls are bypassed, falling
              back directly to local text briefings to prevent rate-limit
              request flooding.
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 5</span> Persist &amp;
            Score
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We save the final summaries to our
            database and figure out which stories are currently trending the
            most.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Stories are written to Redis
            only after a successful briefing, so the cache never holds
            half-processed entries. Velocity (trending) scores are recalculated
            across <em>all</em> stories at the end of each run — trending is
            relative, not per-story.
          </p>
        </div>
      </div>

      <!-- Auto-trigger note -->
      <div
        class="my-8 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3"
      >
        <UIcon
          name="i-heroicons-bolt"
          class="text-amber-500 w-6 h-6 shrink-0 mt-0.5"
        />
        <div>
          <p class="m-0 text-amber-900 dark:text-amber-100 font-semibold mb-1">
            How does it start automatically?
          </p>
          <p class="m-0 text-amber-800 dark:text-amber-200 text-sm">
            <code>GET /api/news</code> fires a background ingestion
            automatically when the cache is stale (&gt; 24 h) or empty.
          </p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- REGROUPING PIPELINE                                              -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        5. Regrouping Engine Pipeline
      </h2>

      <p class="text-lg mb-6">
        Sometimes, the initial vector similarity search might mistakenly cluster
        loosely related articles together, or leave out important ones that
        missed the similarity threshold. The Re-grouping Engine acts as an
        automated editor to correct these vector search mistakes by having the
        AI evaluate the entire database at once to organize them correctly.
      </p>

      <!-- Diagram 3: Regroup Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Regrouping Engine Flow (Zoomable)
        </h3>
        <MermaidDiagram id="regroup-diag" :code="regroupDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          This chart visualizes how all articles are passed to Gemini in a
          single prompt to fix clustering mistakes.
        </p>
      </div>

      <p class="font-semibold text-xl mt-10 mb-4">
        The regrouping process happens in these detailed steps:
      </p>

      <div
        class="space-y-8 pl-4 border-l-4 border-primary-200 dark:border-primary-800"
      >
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 1</span> Fetch Current
            State
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We gather everything currently saved
            in our databases.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Reads all current stories from
            the Redis cache and all article vectors + metadata from the Upstash
            Vector database.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 2</span> Reconcile Datasets
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We figure out which articles belong to
            which stories, and spot any left-behind articles that the system
            missed.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Maps each article to its current
            story (based on the Redis story's source list) and identifies any
            "orphaned" articles (articles present in Vector DB but not assigned
            to any story in Redis).
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 3</span> Single-Pass
            Regroup (Gemini)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We ask the AI to re-evaluate the
            entire board and fix any mistakes it made in the past.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> If not empty, it packages all
            existing story clusters and orphaned articles into a single prompt
            payload. Sends this payload to Gemini in a single pass to correct
            misclusterings, split stories, merge overlapping topics, and assign
            orphaned articles.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 4</span> Rebuild Metadata
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We translate the AI's corrections back
            into data our app understands.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Parses Gemini's JSON response,
            maps the assigned article URLs back to their full metadata, computes
            region breakdowns, and aggregates categories.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 5</span> Database Commit
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We overwrite the old data with the
            newly corrected stories.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> If <code>dryRun</code> is false,
            it clears the old story cache in Redis, saves the new story objects,
            updates the <code>story_id</code> metadata tags for every modified
            article in the Upstash Vector index, and updates story velocity
            (trending) scores.
          </p>
        </div>
      </div>

      <div
        class="my-8 p-4 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30 flex items-start gap-3"
      >
        <UIcon
          name="i-heroicons-shield-check"
          class="text-sky-500 w-6 h-6 shrink-0 mt-0.5"
        />
        <div>
          <p class="m-0 text-sky-900 dark:text-sky-100 font-semibold mb-1">
            Safe Testing (Dry Run)
          </p>
          <p class="m-0 text-sky-800 dark:text-sky-200 text-sm">
            The endpoint supports a <code>dryRun: true</code> mode to let
            developers verify the regrouping results safely before it commits
            destructive changes to Redis and Upstash Vector.
          </p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- QUOTA MANAGEMENT                                                   -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        6. Gemini Rate Limiting & Quota Management
      </h2>
      <p class="mb-4">
        Because we use the free version of Google Gemini, we are strictly
        limited on how many requests we can make (e.g., only 5 requests per
        minute, and 1,500 total requests per day). We use clever strategies to
        avoid getting blocked.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <UCard>
          <h3 class="text-lg font-bold mb-2">1. Ingestion Pipeline</h3>
          <p class="text-xs text-gray-500 mb-3">
            (<code>POST /api/ingest</code>)
          </p>
          <ul
            class="list-disc pl-4 space-y-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <li>
              <strong>Batch Briefings:</strong> Instead of executing a separate
              request for every story cluster, it batches them into groups of up
              to 15 stories per API call.
            </li>
            <li>
              <strong>Throttling Delay:</strong> Enforces a 12-second delay
              between batch requests to not exceed 5 RPM.
            </li>
            <li>
              <strong>Embedding Backoff:</strong> Retries up to 5 times for
              429/Resource Exhausted errors.
            </li>
            <li>
              <strong>Cascading Fallback:</strong> If a batch fails, falls back
              directly to local text synthesis.
            </li>
          </ul>
        </UCard>

        <UCard>
          <h3 class="text-lg font-bold mb-2">2. Regrouping Pipeline</h3>
          <p class="text-xs text-gray-500 mb-3">
            (<code>POST /api/regroup</code>)
          </p>
          <ul
            class="list-disc pl-4 space-y-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <li>
              <strong>Single-Pass Aggregation:</strong> Combines the entire
              dataset into a single request.
            </li>
            <li>
              <strong>Early-Return:</strong> Bypasses Gemini entirely if
              databases are empty.
            </li>
            <li>
              <strong>Model Failover:</strong> Sequentially falls back through
              available Gemini models (3.5-flash &rarr; 3-flash &rarr;
              2.5-flash).
            </li>
          </ul>
        </UCard>

        <UCard>
          <h3 class="text-lg font-bold mb-2">3. Client News API</h3>
          <p class="text-xs text-gray-500 mb-3">(<code>GET /api/news</code>)</p>
          <ul
            class="list-disc pl-4 space-y-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <li>
              <strong>Zero Live Calls:</strong> Serves current stories
              exclusively from the Redis cache. Client traffic never hits the
              Gemini API limits directly.
            </li>
          </ul>
        </UCard>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- API REFERENCE                                                     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        7. API Reference
      </h2>
      <p class="mb-8">Technical details on how our backend endpoints work.</p>

      <!-- /api/regroup -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle">POST</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/regroup</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Fetches all current stories from Redis and all articles from the
          Upstash Vector database, reconciles them, and sends them to Google
          Gemini in a single pass to correct any grouping or clustering
          mistakes.
        </p>

        <div
          class="mb-4 p-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sm"
        >
          <strong>🗓 QStash Scheduled:</strong> Similar to the ingest pipeline,
          this runs on an automated schedule (e.g. <code>0 0 * * *</code>) to
          perform daily database corrections.
        </div>

        <div
          class="mb-4 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
        >
          <strong>⚡ Token Limit Protection (30-day cutoff):</strong> To prevent
          exceeding Gemini's 250k input token limit as the database grows, the
          pipeline strictly filters out stories and articles older than 30 days
          before sending the payload. Older stories simply age out of the Redis
          cache.
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Request Example</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code># Run actual database updates
curl -X POST http://localhost:3000/api/regroup \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{
  "success": true,
  "dryRun": true,
  "originalStoriesCount": 5,
  "newStoriesCount": 4,
  "data": [ ... ]
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/ingest -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle">POST</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/ingest</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Runs the full ingestion pipeline. Called on a schedule via
          <strong>QStash</strong> — register the URL in the Upstash console, no
          code changes needed.
        </p>

        <div
          class="mb-4 p-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sm"
        >
          <strong>🗓 QStash one-time setup:</strong>
          <em>QStash → Schedules → New Schedule</em>, URL
          <code>https://your-domain.com/api/ingest</code>, method
          <code>POST</code>, cron e.g. <code>0 */6 * * *</code>.
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Trigger Locally</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>curl -X POST http://localhost:3000/api/ingest</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{ 
  "success": true, 
  "storiesUpdated": 4, 
  "articlesProcessed": 12 
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/news -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="green" variant="subtle">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/news</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Returns story briefings from Redis. Auto-triggers background ingestion
          if the cache is stale or empty.
        </p>

        <div class="overflow-x-auto mb-4">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 dark:border-gray-700">
                <th class="py-2 px-2 text-left font-bold">Parameter</th>
                <th class="py-2 px-2 text-left font-bold">Type</th>
                <th class="py-2 px-2 text-left font-bold">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td class="py-2 px-2"><code>category</code></td>
                <td class="py-2 px-2 text-gray-500">string</td>
                <td class="py-2 px-2">
                  Topic filter (e.g. <code>society</code>, <code>tech</code>)
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>query</code></td>
                <td class="py-2 px-2 text-gray-500">string (max 100)</td>
                <td class="py-2 px-2">
                  Full-text search across headlines &amp; summaries
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>timeRange</code></td>
                <td class="py-2 px-2 text-gray-500">
                  enum (default: <code>week</code>)
                </td>
                <td class="py-2 px-2">Relative time window</td>
              </tr>
              <tr>
                <td class="py-2 px-2">
                  <code>startDate</code> / <code>endDate</code>
                </td>
                <td class="py-2 px-2 text-gray-500">YYYY-MM-DD</td>
                <td class="py-2 px-2">
                  Absolute date range (both required together, max 365 days)
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>limit</code></td>
                <td class="py-2 px-2 text-gray-500">
                  number (default: <code>20</code>)
                </td>
                <td class="py-2 px-2">Max stories to return (1-20)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Request Examples</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code># Filter by category
curl "http://localhost:3000/api/news?category=tech&amp;limit=5"</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{
  "success": true,
  "count": 8,
  "data": {
    "mainHeadline": "...",
    "stories": [ ... ]
  }
}</code></pre>
          </div>
        </div>
      </UCard>

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        8. Trust & Credibility
      </h2>
      <p class="mb-4">
        Every briefing includes an AI-computed <strong>Trust Score</strong>.
        This score is a weighted assessment of source reputation, content
        verifiability, and publisher history, helping readers know how reliable
        the news is at a glance.
      </p>

      <div
        class="p-6 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
      >
        <h3 class="text-xl font-bold mb-4 m-0 text-gray-800 dark:text-gray-200">
          Trust Gradient Indicator
        </h3>
        <p class="text-sm mb-6">
          The trust score badge uses a dynamic color scale that smoothly
          transitions from green to red based on the score (Formula:
          <code>hsl(score × 120, 70%, 45%)</code>).
        </p>

        <div
          class="flex flex-col sm:flex-row gap-4 items-center justify-between not-prose"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-md"
            >
              100%
            </div>
            <div>
              <p class="font-bold text-sm text-stone-900 dark:text-white m-0">
                High Trust
              </p>
              <p class="text-xs text-stone-500 m-0">Verified sources</p>
            </div>
          </div>

          <div
            class="hidden sm:block w-16 h-1 bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 rounded-full"
          />

          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold shadow-md"
            >
              50%
            </div>
            <div>
              <p class="font-bold text-sm text-stone-900 dark:text-white m-0">
                Moderate
              </p>
              <p class="text-xs text-stone-500 m-0">Mixed signals</p>
            </div>
          </div>

          <div
            class="hidden sm:block w-16 h-1 bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 rounded-full"
          />

          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-md"
            >
              0%
            </div>
            <div>
              <p class="font-bold text-sm text-stone-900 dark:text-white m-0">
                Low Trust
              </p>
              <p class="text-xs text-stone-500 m-0">Unreliable</p>
            </div>
          </div>
        </div>
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
    QStash -- "POST /api/regroup\n(on schedule)" --> RegroupAPI["POST /api/regroup\n(Nitro)"]

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

const regroupDiagram = `
flowchart TD
    Start(["QStash triggers\nPOST /api/regroup"])

    Start --> S1["Step 1 · Fetch State\nRead Redis & Upstash"]
    S1 -- "Read All Stories" --> Redis[("Redis\nStory Cache")]
    S1 -- "Read All Vectors" --> VectorDB[("Vector DB\nSemantic Index")]

    S1 --> S2["Step 2 · Reconcile\nIdentify orphaned articles"]

    S2 --> Dec{"Is DB Empty?"}
    Dec -- "Yes" --> EarlyReturn(["✅ Return Early (No-op)"])
    Dec -- "No" --> S3["Step 3 · AI Regrouping\nGemini evaluates all data in one pass"]

    S3 -- "Send entire dataset" --> Gemini["Gemini AI (Single Pass)"]
    Gemini -- "JSON grouping correction" --> S4["Step 4 · Rebuild Metadata\nParse JSON, compute regions/categories"]

    S4 --> Cond{"dryRun == true?"}
    Cond -- "Yes" --> DryRunEnd(["✅ Return Preview"])
    Cond -- "No" --> S5["Step 5 · Database Commit"]

    S5 -- "Clear & Save New Stories" --> Redis
    S5 -- "Update story_id tags" --> VectorDB
    S5 --> Done(["✅ Done"])
`;
</script>

<style>
@reference "../../assets/css/tailwind.css";

/* Basic styling rules for markdown elements are retained but simplified for UCard compatibility */
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
