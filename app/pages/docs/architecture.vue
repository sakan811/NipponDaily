<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img
            src="/favicon-light.ico"
            alt="NipponDaily"
            class="w-6 h-6 dark:hidden border border-neutral-900 rounded-sm"
          >
          <img
            src="/favicon-dark.ico"
            alt="NipponDaily"
            class="w-6 h-6 hidden dark:block border border-neutral-50 rounded-sm"
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
              <UIcon name="i-heroicons-arrow-path-rounded-square" /> Grouping
              Engine
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> A tool that groups similar stories
            together using AI.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> An automated grouping endpoint
            (<code>POST /api/group</code>) that reconciles data across Redis and
            Upstash Vector, using Gemini in a single pass to evaluate and
            cluster articles into cohesive stories before summarization.
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
        configured in <code>app/assets/css/tailwind.css</code>. We use a dual
        color system: traditional Japanese pigments for Light mode, and their
        functional high-contrast opposites for Dark mode to maximize
        readability.
      </p>

      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">
                Classic Sakura (Light Theme)
              </th>
              <th class="py-2 px-4 text-left font-bold">
                Opposite Color (Dark Theme)
              </th>
              <th class="py-2 px-4 text-left font-bold">Semantic Mappings</th>
              <th class="py-2 px-4 text-left font-bold">Application</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #ffbfc8"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Sakura Blossom</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#FFBFC8</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #d2385a"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Deep Rose</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#D2385A</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #16b385"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Luminous Teal</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#16B385</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #0f926b"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Emerald</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#0F926B</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm">Primary (<code>primary</code>)</td>
              <td class="py-3 px-4 text-sm leading-relaxed">
                Main actions, primary buttons, briefing headers, active
                highlights
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4">
                <div
                  class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                >
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #7e957a"
                  />
                  <span
                    class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                    >Sage Leaf</span
                  >
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                    >#7E957A</span
                  >
                </div>
              </td>
              <td class="py-3 px-4">
                <div
                  class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                >
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #a957a9"
                  />
                  <span
                    class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                    >Evening Orchid</span
                  >
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                    >#A957A9</span
                  >
                </div>
              </td>
              <td class="py-3 px-4 text-sm">
                Secondary (<code>secondary</code>)
              </td>
              <td class="py-3 px-4 text-sm leading-relaxed">
                Muted UI elements, subheadings, captions, secondary filters
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #559e4e"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Herbal Green</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#559E4E</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #d88b27"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Sunset Gold</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#D88B27</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #10b981"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Emerald</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#10B981</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #eab308"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Yellow</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#EAB308</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm">
                Success &amp; Warning (<code>success</code> &amp;
                <code>warning</code>)
              </td>
              <td class="py-3 px-4 text-sm leading-relaxed">
                Trust scores, positive indicators, warnings, alerts
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #fdfbf7"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Cream Washi</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#FDFBF7</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #2e231c"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Bark Brown</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#2E231C</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #0b0e14"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Midnight Slate</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#0B0E14</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40 shadow-xs w-32 not-prose"
                  >
                    <div
                      class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                      style="background-color: #f3f5fa"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Ice Silver</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#F3F5FA</span
                    >
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm">
                Neutral (<code>stone</code> / <code>zinc</code> /
                <code>gray</code> / <code>neutral</code>)
              </td>
              <td class="py-3 px-4 text-sm leading-relaxed">
                Canvas backgrounds, text colors, gridlines, and borders
              </td>
            </tr>
          </tbody>
        </table>
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
        The process happens in 3 steps:
      </p>

      <div
        class="space-y-8 pl-4 border-l-4 border-primary-200 dark:border-primary-800"
      >
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 1</span> Fetch &amp;
            Frontline Filter (Tavily)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We search the web for the latest news
            across different categories and run a fast frontline check to filter
            out obviously unrelated articles.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Tavily returns pre-filtered,
            high-quality excerpts. Fetches 20 articles in parallel for each
            category. We then perform a light keyword-matching and character
            check to reject obviously non-Japan news prior to deduplication,
            preserving API quotas and database space.
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
            <span class="text-primary-500 mr-2">Step 3</span> Vector Embedding
            (Upstash Vector)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We create a mathematical
            representation of the article so AI can understand it later.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Articles are embedded using
            Gemini's embedding model and stored in Upstash Vector, using the
            SHA-256 hash of the article's URL as the document ID.
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
      <!-- GROUPING PIPELINE                                              -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        5. Grouping Engine Pipeline
      </h2>

      <p class="text-lg mb-6">
        The Grouping Engine uses AI to evaluate all available articles and
        cluster them into cohesive stories based on the specific events or
        topics they cover.
      </p>

      <!-- Diagram 3: Regroup Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Grouping Engine Flow (Zoomable)
        </h3>
        <MermaidDiagram id="group-diag" :code="groupDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          This chart visualizes how all articles are passed to Gemini in a
          single prompt to group them.
        </p>
      </div>

      <p class="font-semibold text-xl mt-10 mb-4">
        The grouping process happens in these detailed steps:
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
            "orphaned" articles. All compiled articles are mapped into the
            grouping payload.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 3</span> Single-Pass Group
            &amp; Relevance Check
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We ask the AI to evaluate the
            articles, organize them into cohesive stories, and dynamically
            isolate non-Japan content.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Packages all existing story
            clusters and orphaned articles into a single prompt payload. Sends
            this payload to Gemini to group articles and dynamically isolate any
            articles unrelated to Japan into the
            <code>unrelatedArticleUrls</code> array.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 4</span> Rebuild &amp;
            Filter Metadata
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We translate the AI's corrections back
            into data our app understands, performing database cleanups for
            unrelated articles.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Parses Gemini's JSON response.
            If any unrelated article URLs are returned, they are immediately
            deleted from Upstash Vector (using their SHA-256 URL hash) and Redis
            processed set (if <code>dryRun</code> is false). Maps valid assigned
            article URLs back to full metadata, dropping any empty stories.
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
            developers verify the grouping results safely before it commits
            destructive changes to Redis and Upstash Vector.
          </p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- SUMMARIZATION PIPELINE                                           -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        6. Summarization Pipeline
      </h2>

      <p class="text-lg mb-6">
        Once stories are grouped, the Summarization Pipeline uses Gemini to
        write neat, professional summaries, generate cross-source thematic
        analyses, and assess credibility.
      </p>

      <div
        class="space-y-8 pl-4 border-l-4 border-primary-200 dark:border-primary-800"
      >
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 1</span> AI Briefing
            (Gemini)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> The AI reads the grouped articles and
            writes a neat, professional summary.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Technical Details:</strong> Unsummarized stories (marked
            with <code>isSummarized: false</code> by the grouping pipeline
            because they are new or have updated source articles) are processed
            in batches of up to 15 stories using Gemini's
            <code>batchProcessStories</code> API. To run safely within Gemini's
            free-tier rate limits, a 12-second delay is introduced between
            batches.
          </p>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 2</span> Persist Summaries
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> We save the final summaries to our
            database.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Summarized stories are written
            back to Redis and marked as <code>isSummarized: true</code>.
          </p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- QUOTA MANAGEMENT                                                   -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <h2
        class="text-3xl font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        7. Gemini Rate Limiting & Quota Management
      </h2>
      <p class="mb-4">
        Because we use the free version of Google Gemini, we are strictly
        limited on how many requests we can make (e.g., only 5 requests per
        minute, and 1,500 total requests per day). We use clever strategies to
        avoid getting blocked.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <h3 class="text-lg font-bold mb-2">1. Summarization Pipeline</h3>
          <p class="text-xs text-gray-500 mb-3">
            (<code>POST /api/summarize</code>)
          </p>
          <ul
            class="list-disc pl-4 space-y-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <li>
              <strong>Batch Briefings:</strong> Summarization batches up to 15
              new or updated stories (marked with
              <code>isSummarized: false</code> by the grouping pipeline) per API
              call to conserve request quota.
            </li>
            <li>
              <strong>Throttling Delay:</strong> Enforces a 12-second delay
              between summarization batches to stay under 5 RPM limit.
            </li>
            <li>
              <strong>Implicit 30-Day Cutoff:</strong> Inherits the grouping
              pipeline's 30-day cutoff, as only stories younger than 30 days are
              present in Redis to be summarized.
            </li>
            <li>
              <strong>Error Handling:</strong> If a summarization batch fails
              completely, it safely skips and leaves stories for the next run.
            </li>
          </ul>
        </UCard>

        <UCard>
          <h3 class="text-lg font-bold mb-2">2. Grouping Pipeline</h3>
          <p class="text-xs text-gray-500 mb-3">
            (<code>POST /api/group</code>)
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
              <strong>Token Limit Protection (30-day cutoff):</strong> Strictly
              filters out stories and articles older than 30 days before sending
              to Gemini, keeping payloads under 250k input tokens.
            </li>
            <li>
              <strong>Model Failover:</strong> Sequentially falls back through
              available Gemini models (3.5-flash &rarr; 3-flash &rarr;
              2.5-flash).
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
        8. API Reference
      </h2>
      <p class="mb-8">Technical details on how our backend endpoints work.</p>

      <!-- /api/group -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft">POST</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/group</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Fetches all current stories from Redis and all articles from the
          Upstash Vector database, reconciles them, filters out and deletes any
          non-Japan articles, and sends the remaining data to Google Gemini in a
          single pass to group and cluster articles into stories.
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
curl -X POST http://localhost:3000/api/group \
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
  "dryRun": false,
  "originalStoriesCount": 5,
  "newStoriesCount": 4,
  "data": [ ... ],
  "timestamp": "2026-07-14T15:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/summarize -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft">POST</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/summarize</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Finds all stories that have `isSummarized: false` and processes them
          via Gemini to generate summaries and thematic analyses.
        </p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Trigger Locally</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>curl -X POST http://localhost:3000/api/summarize</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{
  "success": true,
  "summarizedCount": 3,
  "timestamp": "2026-07-14T15:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/ingest -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft">POST</UBadge>
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
  "articlesProcessed": 12,
  "message": "News ingestion completed successfully",
  "timestamp": "2026-07-14T15:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/news -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="green" variant="soft">GET</UBadge>
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
    "stories": [ ... ],
    "lastIngestTime": 1718000000000
  },
  "timestamp": "2026-07-14T15:00:00.000Z"
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

const systemDiagram = `
flowchart TD
    User(["👤 User"])
    QStash(["🕐 QStash
Scheduler"])

    User -- "GET /api/news" --> NewsAPI["GET /api/news
(Nitro)"]
    NewsAPI -- "stories + briefings" --> User

    QStash -- "POST /api/ingest
(on schedule)" --> IngestAPI["POST /api/ingest
(Nitro)"]
    QStash -- "POST /api/group
(on schedule)" --> GroupAPI["POST /api/group
(Nitro)"]
    QStash -- "POST /api/summarize
(on schedule)" --> SummarizeAPI["POST /api/summarize
(Nitro)"]

    subgraph Storage ["💾 Storage Layer (Upstash)"]
        Redis[("Redis
Story Cache")]
        Vector[("Vector DB
Semantic Index")]
    end

    subgraph External ["🌐 External APIs"]
        Tavily["Tavily Search"]
        Gemini["Gemini AI"]
    end

    IngestAPI --> Tavily
    IngestAPI --> Vector
    IngestAPI --> Redis

    GroupAPI --> Gemini
    GroupAPI --> Redis
    GroupAPI --> Vector

    SummarizeAPI --> Gemini
    SummarizeAPI --> Redis

    NewsAPI -- "read stories" --> Redis
    NewsAPI -. "auto-trigger
if cache stale" .-> IngestAPI
`;

const ingestDiagram = `
flowchart TD
    Start(["QStash triggers
POST /api/ingest"])

    Start --> S1["Step 1 · Fetch
Tavily Search → 120 articles"]

    S1 --> S1_5["Step 1.5 · Frontline Filter
Check keywords/chars for Japan relevance"]

    S1_5 --> S2["Step 2 · Deduplicate
Check each URL vs Redis seen-set"]
    S2 -- "READ" --> RedisA[("Redis
seen-set")]
    RedisA -- "skip already-seen" --> S2

    S2 --> S3["Step 3 · Vector Embedding
Embed article → write to Vector DB"]
    S3 -- "WRITE vector
with metadata" --> VectorDB[("Vector DB
semantic index")]
    S3 -- "WRITE processed URL" --> RedisC[("Redis
seen-set")]

    VectorDB --> Done(["✅ Done"])
    RedisC --> Done
`;

const groupDiagram = `
flowchart TD
    Start(["QStash triggers
POST /api/group"])

    Start --> S1["Step 1 · Fetch State
Read Redis & Upstash"]
    S1 -- "Read All Stories" --> Redis[("Redis
Story Cache")]
    S1 -- "Read All Vectors" --> VectorDB[("Vector DB
Semantic Index")]

    S1 --> S2["Step 2 · Reconcile
Map existing stories & identify orphans"]

    S2 --> Dec{"Is DB Empty?"}
    Dec -- "Yes" --> EarlyReturn(["✅ Return Early (No-op)"])
    Dec -- "No" --> S3["Step 3 · AI Group & Relevance Check
Gemini groups articles & isolates unrelated content"]

    S3 -- "Send entire dataset" --> Gemini["Gemini AI (Single Pass)"]
    Gemini -- "JSON story groups + unrelatedArticleUrls" --> S4["Step 4 · Rebuild & Filter Metadata
Delete unrelated articles from DB, drop empty stories"]

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
