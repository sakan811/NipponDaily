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
        to="/#docs"
        class="kicker text-stone-400 dark:text-stone-500 no-underline hover:text-primary-500 transition-colors"
      >
        &larr; Documentation
      </NuxtLink>
      <h1
        class="text-3xl sm:text-4xl font-serif font-bold mb-4 mt-4 text-stone-900 dark:text-white"
      >
        Color Palette &amp; System
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        The application leverages Tailwind CSS v4's theme color mappings
        configured in <code>app/assets/css/tailwind.css</code>. We use a dual
        color system: traditional Japanese pigments for Light mode, and their
        functional high-contrast opposites for Dark mode to maximize
        readability. See
        <NuxtLink to="/docs/architecture">System Architecture</NuxtLink>
        for how this palette is layered with an agent-controlled seasonal theme.
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

      <h2>Seasonal Theme Palettes</h2>
      <p class="mb-6 text-gray-700 dark:text-gray-300 text-lg">
        An external agent can override the site's full semantic palette —
        primary, secondary, success, warning, and error, each with its own
        contrast-matched on-color — site-wide via <code>data-season</code> on
        <code>&lt;html&gt;</code>, set through the
        <code>save_site_theme</code> MCP tool. Only two seasons are implemented
        (<code>SEASON_IDS</code> in <code>server/utils/site-theme.ts</code>),
        and the schema rejects anything else, so an agent can never land the
        site on an undefined or half-applied palette.
        <code>neutral</code> (backgrounds, body text, borders) is the one family
        that stays constant across seasons — it's the shared canvas, not part of
        a season's identity. The values below are taken directly from each
        <code>[data-season="..."]</code> block in
        <code>app/assets/css/tailwind.css</code>.
      </p>

      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-3 text-left font-bold">Season / Mode</th>
              <th class="py-2 px-3 text-left font-bold">Primary</th>
              <th class="py-2 px-3 text-left font-bold">Secondary</th>
              <th class="py-2 px-3 text-left font-bold">Success</th>
              <th class="py-2 px-3 text-left font-bold">Warning</th>
              <th class="py-2 px-3 text-left font-bold">Error</th>
              <th class="py-2 px-3 text-left font-bold">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-3 px-3 text-sm font-semibold align-top">
                🌸 Sakura<br />
                <span class="font-normal text-stone-500 dark:text-stone-400"
                  >(default, light)</span
                >
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #d2385a"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#D2385A</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #7e957a"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#7E957A</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #559e4e"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#559E4E</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #d88b27"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#D88B27</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #e03e3e"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#E03E3E</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 text-sm leading-relaxed">
                Identical to the base <code>:root</code> palette above — sakura
                <em>is</em> the site's un-seasoned default look, made explicit
                and self-contained as its own
                <code>[data-season="sakura"]:not(.dark)</code> block. On-color
                text: white on primary, Bark Brown (<code>#2E231C</code>) on
                secondary/success/error.
              </td>
            </tr>
            <tr>
              <td class="py-3 px-3 text-sm font-semibold align-top">
                🌸 Sakura<br />
                <span class="font-normal text-stone-500 dark:text-stone-400"
                  >(default, dark)</span
                >
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #16b385"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#16B385</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #a957a9"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#A957A9</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #10b981"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#10B981</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #eab308"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#EAB308</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #f43f5e"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#F43F5E</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 text-sm leading-relaxed">
                Identical to <code>.dark</code> above. Reached whenever
                <code>data-season="sakura"</code> is set on a
                <code>&lt;html class="dark"&gt;</code> element: the
                <code>[data-season="sakura"]:not(.dark)</code> block simply
                doesn't match, so these <code>.dark</code> values apply
                untouched rather than being overridden by sakura's light colors.
                On-color text: Midnight Slate (<code>#0B0E14</code>) on all
                four.
              </td>
            </tr>
            <tr>
              <td class="py-3 px-3 text-sm font-semibold align-top">
                🍁 Autumn<br />
                <span class="font-normal text-stone-500 dark:text-stone-400"
                  >(light)</span
                >
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #d26b38"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#D26B38</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #d1911f"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#D1911F</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #6da446"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#6DA446</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #cc751e"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#CC751E</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #d02539"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#D02539</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 text-sm leading-relaxed">
                Momiji red-orange, icho (ginkgo) gold, "Matcha" moss green,
                "Kabocha" amber, "Kurenai" crimson — the classic kōyō
                foliage-viewing palette, with success/warning/error tuned to
                stay distinct from the warm primary/secondary rather than
                blending into them. On-color text: Bark Brown
                (<code>#2E231C</code>) on primary/success (contrast ≈4.3–5.1:1
                against Bark Brown), white on error (≈5.2:1 — too magenta for
                Bark Brown to clear WCAG AA).
              </td>
            </tr>
            <tr>
              <td class="py-3 px-3 text-sm font-semibold align-top">
                🌾 Autumn<br />
                <span class="font-normal text-stone-500 dark:text-stone-400"
                  >(dark)</span
                >
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #b35516"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#B35516</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #a8781f"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#A8781F</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #48a630"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#48A630</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #e89417"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#E89417</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 align-top">
                <div class="flex flex-col items-center not-prose">
                  <div
                    class="w-6 h-6 rounded-full mb-1 border border-stone-200/50"
                    style="background-color: #c62f48"
                  />
                  <span
                    class="text-[9px] font-mono text-stone-500 dark:text-stone-400"
                    >#C62F48</span
                  >
                </div>
              </td>
              <td class="py-3 px-3 text-sm leading-relaxed">
                Ember orange, burnished ginkgo gold, "Forest Moss" green, "Ember
                Amber", and "Garnet" — deeper/brighter counterparts to the
                light-mode set, tuned to read clearly against the midnight
                neutral background. On-color text: Midnight Slate
                (<code>#0B0E14</code>) on primary/secondary/success/warning
                (≈5.0–8.0:1), white on error (≈5.4:1 — too dark/saturated for
                Midnight Slate to clear WCAG AA).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        There is no <code>--on-warning</code> token in either season (or the
        base palette) — <code>warning</code> is never used as a solid fill
        needing contrast-matched text, only as a translucent
        <code>bg-warning-500/10</code> pill with
        <code>text-warning-700</code>/<code>text-warning-400</code>. Autumn also
        swaps the site's chrome and ambient graphic to match: its
        <code>[data-season="autumn"]</code> rules restyle
        <code>.u-card</code>/<code>.u-button</code>/<code>.u-badge</code> with
        asymmetric corners and warm ember-tinted shadows instead of the
        default's uniform rounded corners and neutral shadows, and
        <code>SeasonalEffects.vue</code>'s falling-particle layer swaps sakura's
        🌸 for 🍁 by day and 🌾 (susuki/pampas grass) by night, with a fixed
        🍁/🌕 (moon) corner glyph — see
        <NuxtLink to="/docs/architecture">System Architecture</NuxtLink>
        for the full CSS.
      </p>

      <div
        class="p-4 mt-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
      >
        <p class="m-0 text-blue-900 dark:text-blue-100">
          <strong>🍂 Seasonal overrides:</strong> This base palette can be
          overridden site-wide by an agent-controlled seasonal theme — see the
          "Color System" and "MCP-Driven Seasonal Theme" sections of
          <NuxtLink to="/docs/architecture">System Architecture</NuxtLink>
          for how <code>data-season</code> swaps <code>--primary-*</code> /
          <code>--secondary-*</code> and restyles cards, buttons, and badges.
        </p>
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
