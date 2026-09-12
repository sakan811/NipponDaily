<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-60"
    />

    <AppHeader />

    <main
      class="relative z-10 container mx-auto px-4 max-w-4xl py-12 flex-1 prose dark:prose-invert"
    >
      <NuxtLink
        to="/docs"
        class="kicker text-stone-400 dark:text-stone-500 no-underline hover:text-primary-500 transition-colors"
      >
        &larr; Documentation
      </NuxtLink>
      <h1
        class="text-3xl sm:text-4xl font-serif font-bold mb-4 mt-4 text-stone-900 dark:text-white"
      >
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
        NipponDaily is a Japanese-learning app built on real Japan news — each
        record is one Japanese-language article turned into a self-contained
        lesson (a Japanese passage with furigana and rōmaji, an English
        translation, a vocabulary list, and grammar notes). In simple terms, the
        website itself only reads pre-computed lessons out of a database — all
        the "intelligence" (finding Japanese-language articles, scoring
        credibility, and authoring each lesson) is produced by a Claude web
        agent that runs weekly, entirely outside this codebase, and writes its
        finished work in through a small remote MCP server this project exposes.
        There is no clustering, no cross-article synthesis, and no topic
        taxonomy.
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
        class="text-3xl font-serif font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
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
              <UIcon
                name="i-heroicons-window"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Frontend (Nuxt 4)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> This is the user interface you see
            and interact with in your browser.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Built with Nuxt 4 and Vue 3,
            utilizing custom UI components and Tailwind CSS v4. The UI is a
            newspaper-inspired reader that presents one lesson at a time — a
            Japanese passage with furigana and rōmaji, an English translation, a
            vocabulary list, and grammar notes — with a JLPT difficulty filter.
            Tapping a highlighted vocab term in the passage opens a popover with
            its reading, rōmaji, meaning, JLPT level and example.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-server"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              API Engine (Nitro)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> The backend server that connects the
            frontend to our database.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> The Nitro-powered backend
            handles request validation, filtering/sorting of lessons, and secure
            communication with Redis. It never calls any external search or AI
            provider itself.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-circle-stack"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Database (Upstash Redis)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> Where we store the news so the
            website loads instantly.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Powered by Upstash Redis,
            storing <code>Lesson</code> records and ingestion metadata — all
            written by the MCP agent, never generated synchronously on a page
            request. When the Redis env vars are absent, the services fall back
            to an in-process in-memory store so the app still runs locally.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-command-line"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              MCP Server
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> The bridge that lets an external
            agent write finished lessons directly into our database.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> A remote MCP (Model Context
            Protocol) server at <code>ALL /api/mcp</code>, built with
            <code>mcp-handler</code> and protected by a constant-time bearer
            token check. Exposes tools to list, upsert, and clean up lessons —
            see Section 4.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon
                name="i-heroicons-sparkles"
                class="w-5 h-5 shrink-0 text-primary-500"
              />
              Claude Web Agent (External)
            </h4>
          </template>
          <p class="text-sm mb-2">
            <strong>What it does:</strong> The "brain" that finds
            Japanese-language Japan news and authors a self-contained Japanese
            lesson from each article.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Runs entirely outside this
            repository, once a week, on a schedule set up in Claude's own web
            scheduling feature (not a cron job hosted by this project). It calls
            this project's MCP server to persist its work — no search or AI
            provider credentials live in this codebase at all.
          </p>
        </UCard>
      </div>

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. Color Palette & System
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
                      style="background-color: #ffc7ce"
                    />
                    <span
                      class="text-[10px] font-serif font-bold text-stone-900 dark:text-white text-center leading-tight"
                      >Sakura Blossom</span
                    >
                    <span
                      class="text-[9px] font-mono text-stone-500 dark:text-stone-400 mt-0.5"
                      >#FFC7CE</span
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
                Main actions, primary buttons, lesson card headers, active
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
                Neutral (<code>neutral</code>, with <code>stone</code> /
                <code>gray</code> aliased to it)
              </td>
              <td class="py-3 px-4 text-sm leading-relaxed">
                Canvas backgrounds, text colors, gridlines, and borders
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- MCP-DRIVEN LESSON PIPELINE                                         -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        3. MCP-Driven Lesson Pipeline
      </h2>

      <p class="text-lg mb-6">
        There is no in-repo ingestion pipeline. Instead of this codebase calling
        a search API and an AI provider on a schedule, a
        <strong>Claude web agent</strong> — scheduled weekly via Claude's own
        web scheduling feature, entirely outside this repository — checks what's
        already published, then searches that week's Japanese-language Japan
        news, authors one self-contained lesson per article, and calls the tools
        below to write finished <code>Lesson</code> records directly into Redis.
        The agent's full operating prompt lives at
        <code>docs/news-pipeline-agent-prompt.md</code>.
      </p>

      <!-- Diagram: MCP Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          A Typical Agent Run (Zoomable)
        </h3>
        <MermaidDiagram id="mcp-diag" :code="mcpDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          Everything above the dashed line into Redis happens outside this
          codebase — the MCP server just exposes the tools that let it in.
        </p>
      </div>

      <p class="font-semibold text-xl mt-10 mb-4">
        <code>ALL /api/mcp</code> registers five tools:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">get_recent_lessons</h4>
          </template>
          <p class="text-sm">
            Lists existing lessons from Redis, newest article first (id, title,
            url, source, publishedAt, difficultyLevel). Called before searching
            each run so the agent doesn't re-teach an article it already
            covered.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">
              check_processed_urls
            </h4>
          </template>
          <p class="text-sm">
            Given candidate article URLs, returns which ones are already
            ingested so the agent doesn't create duplicate lessons.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">upsert_lesson</h4>
          </template>
          <p class="text-sm">
            Creates or updates one lesson — a single article plus its
            originalText, englishText, furiganaText, romajiText, vocabList,
            grammarNotes and difficultyLevel — visible on the site immediately.
            To update, pass the lesson's id or re-use its url; any mergeable
            field left out keeps its stored value. <code>favicon</code> and
            <code>source</code>
            are derived server-side; the submitted URL is marked processed.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">cleanup_old_data</h4>
          </template>
          <p class="text-sm">
            Deletes lessons whose article is older than 30 days from Redis
            (Section 5). The agent is expected to call this before writing new
            lessons each run; the site operator can also trigger it ad hoc by
            asking the agent to run it manually.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">
              mark_ingest_complete
            </h4>
          </template>
          <p class="text-sm">
            Records the current time as the last-ingest timestamp, which the UI
            surfaces to readers as "updated X ago."
          </p>
        </UCard>
      </div>

      <div
        class="my-8 p-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3"
      >
        <UIcon
          name="i-heroicons-information-circle"
          class="text-blue-500 w-6 h-6 shrink-0 mt-0.5"
        />
        <div>
          <p class="m-0 text-blue-900 dark:text-blue-100 font-semibold mb-1">
            No auto-triggered ingestion
          </p>
          <p class="m-0 text-blue-800 dark:text-blue-200 text-sm">
            <code>GET /api/news</code> only ever reads from Redis — it never
            fetches or generates content itself, even if the store is empty or
            stale. If no lessons show up, the MCP agent hasn't run yet.
          </p>
        </div>
      </div>

      <div
        class="mb-8 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
      >
        <strong>🔒 Authentication:</strong> Every call to
        <code>/api/mcp</code> requires an
        <code>Authorization: Bearer &lt;MCP_AUTH_TOKEN&gt;</code> header (or a
        <code>?token=</code> query param), checked with a constant-time
        comparison. Requests without a valid token get a <code>401</code>.
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- CLEANUP PIPELINE                                                   -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        4. Automated Data Retention (Cleanup Pipeline)
      </h2>

      <p class="text-lg mb-6">
        The MCP tool <code>cleanup_old_data</code> permanently deletes lessons
        whose article is older than 30 days from Redis so the store doesn't grow
        unbounded. The Claude web agent — running on a schedule configured in
        Claude's own web scheduling, not QStash — calls it before writing new
        lessons each run. There's no separate HTTP endpoint for this; the site
        operator can also trigger cleanup ad hoc by asking the agent (or any
        other MCP-speaking client with the bearer token) to call the same tool
        manually.
      </p>

      <!-- Diagram: Cleanup Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Cleanup Pipeline — Redis Pruning (Zoomable)
        </h3>
        <MermaidDiagram id="cleanup-diag" :code="cleanupDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          This chart shows how stale records are identified and permanently
          removed from Redis.
        </p>
      </div>

      <p class="font-semibold text-xl mt-10 mb-4">The cleanup process:</p>

      <div
        class="space-y-8 pl-4 border-l-4 border-primary-200 dark:border-primary-800"
      >
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            <span class="text-primary-500 mr-2">Step 1</span> Prune Stale
            Lessons (Redis)
          </h3>
          <p class="mb-2">
            <strong>The Concept:</strong> Any lesson whose article was published
            over a month ago is considered stale and removed.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <strong>Technical Details:</strong> Reads all lessons from Redis and
            deletes any where <code>publishedAt</code> falls before the 30-day
            cutoff (falling back to <code>addedAt</code> when the date is
            unparseable), removing both the
            <code>lesson:&#123;id&#125;</code> key and its entry in the
            <code>news:lessons</code> set. With <code>dryRun: true</code> it
            counts the matches but skips the deletes.
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
            <code>cleanup_old_data</code> supports a <code>dryRun: true</code>
            mode that reports how many lessons would be deleted without actually
            committing the deletion.
          </p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- API REFERENCE                                                     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        5. API Reference
      </h2>
      <p class="mb-8">Technical details on how our backend endpoints work.</p>

      <!-- /api/news -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="green" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/news</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Returns lessons straight from Redis — filtered, sorted
          newest-article-first, and paginated. Does not call any external search
          or AI provider, and never triggers ingestion of any kind.
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
                <td class="py-2 px-2"><code>difficulty</code></td>
                <td class="py-2 px-2 text-gray-500">
                  enum (<code>N5</code>–<code>N1</code>)
                </td>
                <td class="py-2 px-2">
                  JLPT difficulty filter (matches <code>difficultyLevel</code>
                  exactly, case-insensitive; invalid values ignored)
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>query</code></td>
                <td class="py-2 px-2 text-gray-500">string (max 100)</td>
                <td class="py-2 px-2">
                  Full-text search across <code>title</code>,
                  <code>titleJa</code>, <code>originalText</code> &amp;
                  <code>englishText</code>
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>limit</code></td>
                <td class="py-2 px-2 text-gray-500">
                  number (default: <code>20</code>)
                </td>
                <td class="py-2 px-2">Max lessons to return (1-20)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Request Examples</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code># Filter by JLPT level
curl "http://localhost:3000/api/news?difficulty=N4&amp;limit=5"</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{
  "success": true,
  "count": 10,
  "data": {
    "lessons": [ ... ],
    "lastIngestTime": 1718000000000
  },
  "timestamp": "2026-07-14T15:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/mcp -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="secondary" variant="soft">ALL</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/mcp</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          The remote MCP server described in Section 4 — this is how the Claude
          web agent (or any other MCP-speaking client) writes lessons into
          Redis. Not a plain REST endpoint; speaks the MCP protocol over HTTP
          via <code>mcp-handler</code>.
        </p>

        <div
          class="mb-4 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
        >
          <strong>🔒 Auth required:</strong>
          <code>Authorization: Bearer &lt;MCP_AUTH_TOKEN&gt;</code> header or
          <code>?token=</code> query param on every request, generated with
          <code>openssl rand -hex 32</code>. Missing or wrong tokens get a
          <code>401</code>.
        </div>

        <div class="overflow-x-auto mb-2">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 dark:border-gray-700">
                <th class="py-2 px-2 text-left font-bold">Tool</th>
                <th class="py-2 px-2 text-left font-bold">Purpose</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td class="py-2 px-2"><code>get_recent_lessons</code></td>
                <td class="py-2 px-2">List recent lessons</td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>check_processed_urls</code></td>
                <td class="py-2 px-2">Detect already-ingested URLs</td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>upsert_lesson</code></td>
                <td class="py-2 px-2">Create/update one lesson</td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>cleanup_old_data</code></td>
                <td class="py-2 px-2">
                  Delete lessons whose article is older than 30 days
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>mark_ingest_complete</code></td>
                <td class="py-2 px-2">Record the last-ingest timestamp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        6. Trust & Credibility
      </h2>
      <p class="mb-4">
        Every lesson includes a <strong>Trust Score</strong> the Claude agent
        assigns when it calls <code>upsert_lesson</code>, based on its own
        assessment of publisher reputation, editorial standards, and
        trustworthiness — so readers can tell how reliable the underlying
        article is at a glance. The agent only needs to judge a given publisher
        once: NipponDaily caches each domain's score in Redis and reuses it
        automatically for every later article from that domain.
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

const systemDiagram = `
flowchart TD
    Claude(["🤖 Claude Web Agent
(scheduled via Claude web,
not by this codebase)"])
    User(["👤 User"])
    Operator(["🧑‍💻 Site Operator
(manual/ad-hoc)"])

    Claude -- "researches Japan news
on its own" --> MCP["ALL /api/mcp
(Nitro, bearer-token protected)"]

    Operator -. "asks agent to run
cleanup_old_data manually" .-> MCP

    MCP -- "get_recent_lessons /
check_processed_urls /
upsert_lesson /
cleanup_old_data /
mark_ingest_complete" --> Redis[("Redis
Lesson Database")]

    User -- "GET /api/news" --> NewsAPI["GET /api/news
(Nitro)"]
    NewsAPI -- "read lessons" --> Redis
    NewsAPI -- "lessons" --> User
`;

const mcpDiagram = `
flowchart TD
    Start(["Claude web agent
runs weekly on its own schedule"])

    Start --> S1["Step 0 · cleanup_old_data
Preview/delete lessons whose
article is >30 days old"]
    S1 -. "DELETE stale lessons" .-> Redis[("Redis
Lesson Database")]

    S1 --> S2["Step 1 · get_recent_lessons
List published lessons to avoid
re-teaching the same article"]
    S2 -. "READ" .-> Redis

    S2 --> S3["Step 2 · Research
Search the week's Japanese-language
Japan news, pick teachable articles
across a spread of JLPT levels"]

    S3 --> S4["Step 3 · check_processed_urls
Skip candidate URLs already ingested"]
    S4 -. "READ processed URLs" .-> Redis

    S4 --> S5["Step 4 · Author lesson + upsert_lesson
For each article: pull a passage,
add furigana + romaji + translation + vocab + grammar,
estimate difficulty, then write one lesson"]
    S5 -- "WRITE lesson +
mark URL processed" --> Redis

    S5 --> S7["Step 5 · mark_ingest_complete
Record last-ingest timestamp"]
    S7 -- "WRITE" --> Redis

    S7 --> Done(["✅ Done — visible on
GET /api/news immediately"])
`;

const cleanupDiagram = `
flowchart TD
    Start(["cleanup_old_data MCP tool
(scheduled Claude web agent,
or manual ad-hoc request)"])

    Start --> S1["Scan for stale lessons
Read all lessons, flag where
publishedAt < 30 days ago"]
    S1 --> Cond{"dryRun == true?"}
    Cond -- "Yes" --> DryRunEnd(["✅ Return count of lessons
that would be deleted"])
    Cond -- "No" --> S2["Delete each stale lesson
(lesson:{id} key + news:lessons entry)"]
    S2 -- "DELETE" --> Redis[("Redis
Lesson Database")]
    S2 --> Done(["✅ Return count deleted"])
`;
</script>

<style>
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
