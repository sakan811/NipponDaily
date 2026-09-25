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
        Color Palette &amp; System
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        NipponDaily's colors are always one of four seasonal presets. The active
        one is set site-wide by an external agent through the
        <code>save_site_theme</code> MCP tool (see
        <NuxtLink to="/docs/architecture">System Architecture</NuxtLink>), which
        puts <code>data-season</code> on <code>&lt;html&gt;</code>. Each preset
        defines a full semantic palette — primary, secondary, success, warning,
        and error — for light and dark mode, and every text-on-color pairing
        clears WCAG AA (4.5:1 or better). The schema rejects any other season,
        so the site can never land on an undefined or half-applied palette. The
        values come from <code>app/assets/css/tailwind.css</code>; the swatches
        below are generated from <code>shared/seasons.ts</code>, which a test
        keeps in sync with that CSS.
      </p>

      <h2>Seasonal Theme Palettes</h2>

      <div class="my-6 space-y-6 not-prose">
        <section
          v-for="season in seasons"
          :key="season.id"
          class="border-t border-stone-200 dark:border-stone-800 pt-4"
        >
          <h3 class="!mt-0 !mb-3 text-lg font-serif font-bold">
            {{ season.glyph.light }} {{ season.label }}
            <span class="ml-2 text-xs font-sans font-normal text-stone-500">
              <code>{{ season.id }}</code> · {{ monthRange(season.months) }}
            </span>
          </h3>
          <div
            v-for="mode in MODES"
            :key="mode"
            class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-3"
          >
            <span
              class="w-12 shrink-0 pt-4 text-xs capitalize text-stone-500 dark:text-stone-400"
              >{{ mode }}</span
            >
            <dl class="flex flex-wrap gap-x-3 gap-y-2 m-0">
              <div v-for="role in PALETTE_ROLES" :key="role">
                <dt
                  class="text-[10px] uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-0.5"
                >
                  {{ role }}
                </dt>
                <dd class="m-0">
                  <ColorSwatchBadge :swatch="season.palette[mode][role]" />
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <h3>Shared canvas</h3>
      <p class="mb-4 text-gray-700 dark:text-gray-300 text-lg">
        <code>neutral</code> (with <code>stone</code> / <code>gray</code>
        aliased to it) is the one family that stays the same in every season:
        page backgrounds, body text, gridlines, and borders.
      </p>
      <div class="flex flex-wrap gap-2 mb-8 not-prose">
        <ColorSwatchBadge
          v-for="swatch in [...NEUTRALS.light, ...NEUTRALS.dark]"
          :key="swatch.hex"
          :swatch="swatch"
        />
      </div>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        There is no <code>--on-warning</code> token — <code>warning</code> is
        never used as a solid fill needing contrast-matched text, only as a
        translucent <code>bg-warning-500/10</code> pill with
        <code>text-warning-700</code>/<code>text-warning-400</code>.
      </p>

      <h3>Seasonal shape language</h3>
      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        A season also changes the <em>silhouette</em> of the UI, not just its
        corner roundness. Cards, panels, buttons, badges and other boxes take
        their outline from <code>--shape-*</code> (radius) plus
        <code>--corner-*</code> (CSS <code>corner-shape</code>) tokens, and
        borders, shadows and focus rings follow that outline. The card's corner
        motif, the divider, the kicker bullet, and the page backdrop come from
        <code>--motif-*</code> tokens. Each <code>[data-season]</code> block
        re-points those tokens: <strong>spring</strong> gives petals — round
        cards with one scooped notch tip, and pill buttons;
        <strong>summer</strong> gives sea glass and water — squircle pebble
        panels, droplet buttons, fan badges and wave-edged cards;
        <strong>autumn</strong> gives cut leaves and tags — two bevel-cut
        corners on cards and buttons, and pointed tag badges;
        <strong>winter</strong> gives ice crystals — frosted octagonal panels
        and hexagonal buttons and badges. Browsers without
        <code>corner-shape</code> fall back to rounded corners. Plain boxes opt
        in with the <code>.season-box</code> (panel) and
        <code>.season-chip</code> (button-sized) classes.
        <code>SeasonalEffects.vue</code> adds the matching ambient layer
        (petals, bubbles/fireflies, leaves, or snow). See
        <code>app/assets/css/tailwind.css</code> ("Seasonal shape language") for
        the full CSS.
      </p>
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
import ColorSwatchBadge from "../../components/ColorSwatchBadge.vue";
import {
  NEUTRALS,
  PALETTE_ROLES,
  SEASON_IDS,
  SEASONS,
} from "~~/shared/seasons";

const MODES = ["light", "dark"] as const;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const seasons = SEASON_IDS.map((id) => SEASONS[id]);

const monthRange = (months: readonly number[]) =>
  `${MONTH_NAMES[months[0]! - 1]}–${MONTH_NAMES[months[months.length - 1]! - 1]}`;
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
h3 {
  @apply text-xl font-serif font-bold mt-10 mb-3 text-stone-900 dark:text-white;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
