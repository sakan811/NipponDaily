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
        multiple-choice round generated per day. Game generation is entirely
        in-repo: the backend deterministically builds each day's round from the
        pool the first time it's requested, then persists it so later requests
        read the same game back — no agent or AI provider is involved in game
        content. What <em>is</em> agent-controlled is the site's seasonal
        design: a Claude web agent that runs on its own schedule, entirely
        outside this codebase, switches NipponDaily's active season (its color
        palette and the shapes of its cards, buttons, and badges) by writing
        through a small remote MCP server this project exposes. If the agent
        hasn't set a season yet, the site falls back to a deterministic default
        itself, so the page is never left unstyled.
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
            play-through is ever sent back to the server. The Kana and N5
            Vocabulary guide pages (<code>/kana</code>, <code>/vocab</code>) are
            static study references; the vocab pages read the whole pool from
            <code>GET /api/n5-vocab</code>.
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
            today's game from Redis, or — if nothing's been persisted for that
            date yet — builds it deterministically on the spot from the
            persisted pool, avoiding any kanji/vocab/kana used in the past 7
            days. It never calls any external search or AI provider itself. A
            Vercel Cron job hits this same build path at 00:00 UTC daily so the
            game is usually already there by the first visitor (Section 4).
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
            Section 3), one small <code>DailyGame</code> record per date, and
            the single active <code>SiteTheme</code> record the theme agent
            controls (Section 2). When the Redis env vars are absent, the
            service falls back to an in-process in-memory store so the app still
            runs locally.
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
            agent switch the site's active season (palette and shapes).
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> A remote MCP (Model Context
            Protocol) server at <code>ALL /api/mcp</code>, built with
            <code>mcp-handler</code> and protected by a constant-time bearer
            token check. Exposes tools to read and set the active
            <code>SiteTheme</code> — see Section 2. It has no tools for game
            content; the daily game is generated entirely in-repo.
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
            <strong>What it does:</strong> Decides which of NipponDaily's
            implemented seasonal presets should be active right now.
          </p>
          <p class="text-sm">
            <strong>Technical Details:</strong> Runs entirely outside this
            repository, on a schedule set up in Claude's own web scheduling
            feature (not a cron job hosted by this project). It calls this
            project's MCP server to read and set the active season — no search
            or AI provider credentials live in this codebase at all.
          </p>
        </UCard>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- MCP-DRIVEN SEASONAL THEME PIPELINE                                 -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. MCP-Driven Seasonal Theme
      </h2>

      <p class="text-lg mb-6">
        The daily game is generated entirely in-repo (Section 4) — no agent
        involved. What an external agent <em>does</em> control is design: a
        <strong>Claude web agent</strong> — scheduled via Claude's own web
        scheduling feature, entirely outside this repository — checks
        NipponDaily's currently active season and, when it should change, calls
        the tools below to write a new <code>SiteTheme</code> record directly
        into Redis. The agent's full operating prompt lives at
        <code>docs/site-theme-agent-prompt.md</code>.
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
        <code>ALL /api/mcp</code> registers two tools:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">get_active_theme</h4>
          </template>
          <p class="text-sm">
            Returns
            <code>{ active, suggestedSeason, needsUpdate, seasons }</code>: the
            stored <code>SiteTheme</code> (or <code>null</code>), the preset
            whose months cover today's date in Japan, whether those differ, and
            every accepted preset with its months. The agent only writes when
            <code>needsUpdate</code> is true. Annotated read-only.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-mono text-sm font-bold m-0">save_site_theme</h4>
          </template>
          <p class="text-sm">
            Sets the active season and returns
            <code>{ saved, changed, season, previousSeason }</code>; saving the
            season that's already active skips the write. Only accepts one of
            the <em>implemented</em> presets — one per Japanese season:
            <code>sakura</code> (spring, the site's default),
            <code>summer</code>, <code>autumn</code>, and <code>winter</code> —
            anything else is rejected by the schema itself, not just by
            convention. The site picks the change up within about a minute
            (<code>GET /api/site-theme</code> is CDN-cached for 60 seconds).
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
            Never unstyled
          </p>
          <p class="m-0 text-blue-800 dark:text-blue-200 text-sm">
            <code>GET /api/site-theme</code> only ever reads from Redis first —
            but if no agent has set a season yet, it falls back to a
            deterministic default (Section 4) rather than returning nothing. The
            same <code>data-season</code> attribute that switches the color
            palette also drives
            <code>app/components/SeasonalEffects.vue</code>'s ambient graphic —
            falling petals for sakura; rising bubbles by day and fireflies by
            night for summer; for autumn, falling momiji leaves by day and
            susuki with a glowing tsukimi moon at night; falling snow for
            winter. It also re-points the <code>--shape-*</code> /
            <code>--motif-*</code> tokens that set the silhouettes of every
            card, button, badge, divider, and page backdrop. One CSS attribute,
            no separate agent call.
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
        3. N5 Data & Attribution
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
                Generated deterministically from the pool by
                <code>GET /api/daily-game</code> the first time each date is
                requested
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:daily_game:*</td>
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
        4. API Reference
      </h2>
      <p class="mb-8">Technical details on how our backend endpoints work.</p>

      <!-- /api/daily-game -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="success" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/daily-game</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Returns one day's game — from Redis if it's already been generated, or
          built deterministically from the pool otherwise (and persisted, so it
          isn't rebuilt on every request). Does not call any external search or
          AI provider.
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
                  any past date can be replayed. Must be a real calendar date,
                  today or earlier — anything else is a <code>400</code>.
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
    "source": "fallback"
  },
  "timestamp": "2026-09-18T00:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/n5-vocab -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="success" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/n5-vocab</h3>
          </div>
        </template>
        <p class="text-sm m-0">
          Returns the whole seeded N5 vocabulary pool as-is (<code
            >{ success, data: N5Vocab[], count, timestamp }</code
          >) for the vocabulary guide pages. No query parameters; nothing is
          generated or persisted.
        </p>
      </UCard>

      <!-- /api/site-theme -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="success" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">/api/site-theme</h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          Returns the single active <code>SiteTheme</code> — from Redis if the
          agent has set one, or a deterministic default otherwise (and
          persisted, so it isn't recomputed on every request). No query
          parameters. Served with
          <code>Cache-Control: s-maxage=60, stale-while-revalidate=600</code>
          so the CDN absorbs the per-page-load fetch.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-gray-500 mb-1">Request Example</p>
            <pre
              class="bg-stone-100 dark:bg-stone-900 rounded-xl p-3 overflow-x-auto text-xs m-0"
            ><code>curl "http://localhost:3000/api/site-theme"</code></pre>
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
    "season": "sakura",
    "updatedAt": 1758182400000,
    "source": "fallback"
  },
  "timestamp": "2026-09-18T00:00:00.000Z"
}</code></pre>
          </div>
        </div>
      </UCard>

      <!-- /api/cron/generate-daily-game -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UBadge color="success" variant="soft">GET</UBadge>
            <h3 class="font-mono text-lg font-bold m-0">
              /api/cron/generate-daily-game
            </h3>
          </div>
        </template>
        <p class="text-sm mb-4">
          A Vercel Cron target (<code>vercel.json</code>) that hits the same
          build path as <code>GET /api/daily-game</code> at
          <code>00:00 UTC</code> every day, pre-generating that day's game
          instead of waiting for the first visitor's request to trigger it.
          Idempotent — skips generation if a game for the date already exists,
          so a manual re-trigger never overwrites a game a player may have
          already started.
        </p>

        <div
          class="mb-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
        >
          <strong>🔒 Auth required:</strong>
          <code>Authorization: Bearer &lt;CRON_SECRET&gt;</code> header, which
          Vercel sends automatically on requests it triggers from this schedule.
          Missing or wrong tokens get a <code>401</code>.
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
          The remote MCP server described in Section 2 — this is how the Claude
          web agent (or any other MCP-speaking client) switches the site's
          active season in Redis. Not a plain REST endpoint; speaks the MCP
          protocol over HTTP via <code>mcp-handler</code>.
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
                <td class="py-2 px-2"><code>get_active_theme</code></td>
                <td class="py-2 px-2">
                  Read the active season, today's suggested season (Japan time),
                  and every accepted preset
                </td>
              </tr>
              <tr>
                <td class="py-2 px-2"><code>save_site_theme</code></td>
                <td class="py-2 px-2">
                  Set the active season to an implemented preset
                </td>
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

    Claude -- "checks / sets
the active season" --> MCP["ALL /api/mcp
(Nitro, bearer-token protected)"]

    MCP -- "get_active_theme /
save_site_theme" --> Redis[("Redis
N5 Pool + Daily Games + Site Theme")]

    Cron(["⏰ Vercel Cron
00:00 UTC daily"])
    Cron -- "GET /api/cron/generate-daily-game
(bearer: CRON_SECRET)" --> CronAPI["Cron target (Nitro)"]
    CronAPI -. "if missing: build
deterministically,
then persist it" .-> Redis

    User -- "GET /api/daily-game" --> GameAPI["GET /api/daily-game
(Nitro)"]
    GameAPI -- "read today's game" --> Redis
    GameAPI -. "if missing: build
deterministically,
then persist it" .-> Redis
    GameAPI -- "today's game" --> User

    User -- "GET /api/site-theme" --> ThemeAPI["GET /api/site-theme
(Nitro)"]
    ThemeAPI -- "read active season" --> Redis
    ThemeAPI -. "if missing: use
default season,
then persist it" .-> Redis
    ThemeAPI -- "active season" --> User
`;

const mcpDiagram = `
flowchart TD
    Start(["Claude web agent
runs on its own schedule"])

    Start --> S1["Step 1 · get_active_theme
Read active season +
suggestedSeason for today (JST)"]
    S1 -. "READ" .-> Redis[("Redis
Site Theme")]

    S1 --> S2{"needsUpdate?"}
    S2 -- "no" --> Done1(["✅ Done — nothing to write"])

    S2 -- "yes" --> S3["Step 2 · save_site_theme
Set season to
suggestedSeason"]
    S3 -- "WRITE" --> Redis

    S3 --> Done2(["✅ Done — visible on
GET /api/site-theme
within ~1 minute"])
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
