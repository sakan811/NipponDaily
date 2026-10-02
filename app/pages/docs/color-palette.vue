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
        NipponDaily's colors are always one of four seasonal presets, applied
        through a <code>data-season</code> attribute on
        <code>&lt;html&gt;</code>. The site's season follows the date in Japan
        (see <NuxtLink to="/docs/architecture">System Architecture</NuxtLink>),
        and the season button in the header lets a reader pick another. Each
        preset defines primary, secondary, success, warning and error colors for
        light and dark mode. The values live in
        <code class="break-all">app/assets/css/tailwind.css</code>; the swatches
        below come from <code>shared/seasons.ts</code>, which a test keeps in
        sync with that CSS.
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
        Text on a solid primary, secondary, success or error fill uses a
        matching <code>--on-*</code> color picked per season and mode. There is
        no <code>--on-warning</code>: warning never backs text as a solid fill.
      </p>

      <h3>Seasonal shape language</h3>
      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        A season also changes the silhouette of the UI. Cards, panels, buttons
        and badges take their outline from <code>--shape-*</code> and
        <code>--corner-*</code> (CSS <code>corner-shape</code>) tokens, and the
        card motif, divider, bullet and page backdrop come from
        <code>--motif-*</code> tokens. Spring has petal cards with one scooped
        corner and pill buttons; summer, squircle panels and droplet buttons;
        autumn, bevel-cut leaf cards and pointed tags; winter, frosted octagons
        with hexagonal buttons and badges. Browsers without
        <code>corner-shape</code> fall back to rounded corners. Plain boxes opt
        in with <code>.season-box</code> and <code>.season-chip</code>, and
        <code>SeasonalEffects.vue</code> adds the ambient layer: petals, bubbles
        by day and fireflies by night, leaves, or snow.
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
import { usePageSeo } from "../../composables/usePageSeo";
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

usePageSeo({
  title: "Color palette & system",
  description:
    "The four seasonal palettes and the shape language each season applies.",
  path: "/docs/color-palette",
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
h3 {
  @apply text-xl font-serif font-bold mt-10 mb-3 text-stone-900 dark:text-white;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
