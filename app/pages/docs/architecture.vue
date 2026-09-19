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
        NipponDaily is a Japanese-learning game — a persisted pool of N5
        hiragana, katakana, kanji, and vocabulary, and one 20-question
        multiple-choice round generated per day. In simple terms, the website
        itself only reads a pre-computed daily game out of a database — all the
        "intelligence" (picking that day's items and authoring plausible
        distractor choices) is produced by a Claude web agent that runs daily,
        entirely outside this codebase, and writes its finished work in through
        a small remote MCP server this project exposes. If the agent hasn't run
        yet for a given day, the site generates a deterministic fallback itself
        from the same pool, so there's always a game to play.
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
            utilizing custom UI components and Tailwind CSS v4.
            <code>DailyGameBoard.vue</code> fetches one day's game, then runs
            the entire round — question index, per-kind accuracy, and the
            end-of-round summary — as local component state. Nothing about a
            play-through is ever sent back to the server.
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
            <strong>Technical Details:</strong> The Nitro-powered backend reads
            today's game from Redis, or — if the agent hasn't written one yet —
            builds a deterministic fallback on the spot from the persisted pool.
            It never calls any external search or AI provider itself.
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
            <strong>What it does:</strong> Where we store the learning pool and
            each day's game so the website loads instantly.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Powered by Upstash Redis,
            storing the static N5 kanji/vocab/kana pool (seeded offline, see
            Section 4) plus one small <code>DailyGame</code> record per date —
            never generated synchronously on a page request unless the fallback
            path kicks in. When the Redis env vars are absent, the service falls
            back to an in-process in-memory store so the app still runs locally.
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
            agent write each day's game directly into our database.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> A remote MCP (Model Context
            Protocol) server at <code>ALL /api/mcp</code>, built with
            <code>mcp-handler</code> and protected by a constant-time bearer
            token check. Exposes tools to sample the pool, check recent days,
            and save a day's game — see Section 3.
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
            <strong>What it does:</strong> The "brain" that picks each day's
            featured hiragana, katakana, kanji, and vocabulary, and writes
            plausible multiple-choice questions from them.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Runs entirely outside this
            repository, once a day, on a schedule set up in Claude's own web
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
                Main actions, primary buttons, game card headers, active
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
                Muted UI elements, subheadings, captions, kind badges
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
                Correct answers, warnings, alerts
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
      <!-- MCP-DRIVEN DAILY GAME PIPELINE                                     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        3. MCP-Driven Daily Game Pipeline
      </h2>

      <p class="text-lg mb-6">
        There is no in-repo game-authoring logic. Instead of this codebase
        calling a search API and an AI provider on a schedule, a
        <strong>Claude web agent</strong> — scheduled daily via Claude's own web
        scheduling feature, entirely outside this repository — samples the
        persisted N5 pool, avoids repeating recent days, authors plausible
        multiple-choice questions, and calls the tools below to write that day's
        finished <code>DailyGame</code> record directly into Redis. The agent's
        full operating prompt lives at
        <code>docs/daily-game-agent-prompt.md</code>.
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
        <code>ALL /api/mcp</code> registers three tools:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">get_n5_pool</h4>
          </template>
          <p class="text-sm">
            Returns a bounded random sample (default 20, max 50) of one pool
            kind — hiragana, katakana, kanji, or vocab — never the whole
            ~1,000-item pool. Accepts <code>excludeIds</code> so the agent can
            skip items featured in recent days.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">
              get_recent_daily_games
            </h4>
          </template>
          <p class="text-sm">
            Lists the item ids featured over the last N days (default 7), so the
            agent can pass them to <code>get_n5_pool</code>'s
            <code>excludeIds</code> and avoid repeating recent games.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">save_daily_game</h4>
          </template>
          <p class="text-sm">
            Persists one day's game — 4 to 40 authored questions, each with
            exactly 4 choices including the correct answer — visible at
            <code>GET /api/daily-game</code> immediately.
            <code>date</code> defaults to today (UTC) if omitted.
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
            Never "no game today"
          </p>
          <p class="m-0 text-blue-800 dark:text-blue-200 text-sm">
            <code>GET /api/daily-game</code> only ever reads from Redis first —
            but if no agent-authored game exists yet for today, it builds a
            deterministic fallback itself from the pool (Section 5) rather than
            returning nothing.
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
      <!-- DATA & ATTRIBUTION                                                 -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        id="data-attribution"
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        4. N5 Data & Attribution
      </h2>

      <p class="text-lg mb-6">
        Hiragana, katakana, N5 kanji, and N5 vocabulary are static reference
        data — they don't change day to day, so they're seeded once (or
        re-seeded occasionally, e.g. to pick up a newer JMdict release) by a
        standalone script rather than by any agent or request:
        <code>pnpm seed:n5</code> (<code>scripts/seed-n5-data.mjs</code>).
      </p>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-2 text-left font-bold">Data</th>
              <th class="py-2 px-2 text-left font-bold">Source</th>
              <th class="py-2 px-2 text-left font-bold">Redis keys</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-2">Hiragana / Katakana</td>
              <td class="py-2 px-2">
                Hardcoded (fixed, unchanging syllabaries — not dictionary
                content); <code>romaji</code> derived via
                <a
                  href="https://github.com/WaniKani/WanaKana"
                  target="_blank"
                  rel="noopener"
                  >wanakana</a
                >
              </td>
              <td class="py-2 px-2 font-mono text-xs">
                n5:hiragana:*, n5:katakana:*
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2">N5 vocabulary</td>
              <td class="py-2 px-2">
                <a
                  href="https://github.com/elzup/jlpt-word-list"
                  target="_blank"
                  rel="noopener"
                  >elzup/jlpt-word-list</a
                >
                (N5-tagged words), cross-referenced against
                <a
                  href="https://github.com/scriptin/jmdict-simplified"
                  target="_blank"
                  rel="noopener"
                  >JMdict</a
                >
                for part of speech
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:vocab:*</td>
            </tr>
            <tr>
              <td class="py-2 px-2">N5 kanji</td>
              <td class="py-2 px-2">
                Derived from the unique kanji in the N5 vocab list, enriched
                from KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings)
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:kanji:*</td>
            </tr>
            <tr>
              <td class="py-2 px-2">Daily games</td>
              <td class="py-2 px-2">
                Agent-authored via <code>save_daily_game</code>, or generated on
                the fly by <code>GET /api/daily-game</code>
              </td>
              <td class="py-2 px-2 font-mono text-xs">
                n5:daily_game:*, n5:daily_game_index
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm"
      >
        <p class="font-semibold mb-2">Attribution</p>
        <p class="mb-2">
          JMdict and KANJIDIC2 are property of the
          <a href="https://www.edrdg.org/" target="_blank" rel="noopener"
            >Electronic Dictionary Research and Development Group</a
          >, used in conformance with the Group's licence (CC BY-SA 4.0).
          Accessed via the
          <a
            href="https://github.com/scriptin/jmdict-simplified"
            target="_blank"
            rel="noopener"
            >jmdict-simplified</a
          >
          project's pre-parsed JSON releases.
        </p>
        <p class="m-0 mb-2">
          The N5-level word list is digitized from the community-standard list
          originally compiled at tanos.co.uk, via
          <a
            href="https://github.com/elzup/jlpt-word-list"
            target="_blank"
            rel="noopener"
            >elzup/jlpt-word-list</a
          >
          (MIT licence).
        </p>
        <p class="m-0">
          <code>romaji</code> for the hiragana/katakana pool is derived via
          <a
            href="https://github.com/WaniKani/WanaKana"
            target="_blank"
            rel="noopener"
            >wanakana</a
          >
          (MIT licence). Since that community word list occasionally carries a
          wrong English gloss, <code>scripts/seed-n5-data.mjs</code>
          cross-checks each entry's meaning against JMdict's own gloss for the
          same word and reading, and flags any that look like a swapped antonym
          (e.g. "this way" vs. "that way") for manual review at seed time —
          confirmed errors are corrected in that script's
          <code>VOCAB_MEANING_OVERRIDES</code>.
        </p>
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

      <!-- /api/daily-game -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="green" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/daily-game</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Returns one day's game — from Redis if the agent has already written
          it, or a deterministic fallback built from the pool otherwise (and
          persisted, so it isn't rebuilt on every request). Does not call any
          external search or AI provider.
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
                <td class="py-2 px-2"><code>date</code></td>
                <td class="py-2 px-2 text-gray-500">
                  string (<code>YYYY-MM-DD</code>)
                </td>
                <td class="py-2 px-2">
                  Defaults to today (UTC). Since daily games are never deleted,
                  any past date can be replayed.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Request Examples</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code># Today's game
curl "http://localhost:3000/api/daily-game"</code></pre>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">
              Response (200 OK)
            </p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>{
  "success": true,
  "data": {
    "date": "2026-09-18",
    "questions": [ ... 20 items ... ],
    "generatedAt": 1758182400000,
    "source": "agent"
  },
  "timestamp": "2026-09-18T00:00:00.000Z"
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
          The remote MCP server described in Section 3 — this is how the Claude
          web agent (or any other MCP-speaking client) writes each day's game
          into Redis. Not a plain REST endpoint; speaks the MCP protocol over
          HTTP via <code>mcp-handler</code>.
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
                <td class="py-2 px-2"><code>get_n5_pool</code></td>
                <td class="py-2 px-2">Sample one pool kind</td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>get_recent_daily_games</code></td>
                <td class="py-2 px-2">List recently-featured item ids</td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>save_daily_game</code></td>
                <td class="py-2 px-2">Persist one day's authored game</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
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

    Claude -- "samples N5 pool,
authors questions" --> MCP["ALL /api/mcp
(Nitro, bearer-token protected)"]

    MCP -- "get_n5_pool /
get_recent_daily_games /
save_daily_game" --> Redis[("Redis
N5 Pool + Daily Games")]

    User -- "GET /api/daily-game" --> GameAPI["GET /api/daily-game
(Nitro)"]
    GameAPI -- "read today's game" --> Redis
    GameAPI -. "if missing: build
deterministic fallback,
then persist it" .-> Redis
    GameAPI -- "today's game" --> User
`;

const mcpDiagram = `
flowchart TD
    Start(["Claude web agent
runs daily on its own schedule"])

    Start --> S1["Step 1 · get_recent_daily_games
List item ids featured over the
last N days, to avoid repeats"]
    S1 -. "READ" .-> Redis[("Redis
N5 Pool + Daily Games")]

    S1 --> S2["Step 2 · get_n5_pool
Sample hiragana / katakana / kanji / vocab,
excluding recent item ids"]
    S2 -. "READ pool" .-> Redis

    S2 --> S3["Step 3 · Author questions
Build ~20 multiple-choice questions
with plausible same-kind distractors"]

    S3 --> S4["Step 4 · save_daily_game
Persist today's DailyGame record"]
    S4 -- "WRITE" --> Redis

    S4 --> Done(["✅ Done — visible on
GET /api/daily-game immediately"])
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
