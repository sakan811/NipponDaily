<template>
  <DocsBook slug="color-palette">
    <template #lede>
      The site's colours are always one of four seasonal presets, applied
      through a <code>data-season</code> attribute on <code>&lt;html&gt;</code>.
      A season also changes the shape of the UI. The swatches below come from
      <code>shared/seasons.ts</code>, which a test keeps in step with the CSS in
      <code class="break-all">app/assets/css/tailwind.css</code>.
    </template>

    <h2>How the tokens work</h2>
    <p>
      Tokens are defined directly in the CSS; <code>app.config.ts</code> is
      intentionally empty and there is no <code>@nuxt/ui</code>. A Tailwind v4
      <code>@theme</code> block maps <code>--color-primary-*</code>,
      <code>secondary</code>, <code>success</code>, <code>warning</code>,
      <code>error</code> and <code>neutral</code> onto CSS variables defined
      under <code>:root</code> (light) and <code>.dark</code>.
    </p>
    <ul>
      <li>
        <strong>The base palette is also spring</strong> (<code>sakura</code>):
        deep rose primary and sage secondary in light, teal and orchid in dark.
        <code>sakura</code> has no <code>[data-season]</code> block;
        <code>autumn</code> overrides all five colour families, and
        <code>summer</code> and <code>winter</code> only primary and secondary.
      </li>
      <li>
        <strong>Dark mode</strong> is a <code>.dark</code> class on
        <code>&lt;html&gt;</code>, toggled by
        <code>UColorModeButton</code> (persisted as <code>color-theme</code>)
        and applied before hydration by an inline script.
      </li>
      <li>
        <strong>Text on colour.</strong> A solid <code>*-500</code> fill uses
        <code>text-on-primary</code> and its kin (the <code>--on-*</code>
        tokens, chosen per season and mode against that scope's real
        <code>*-500</code>), never a hard-coded <code>text-white</code>. There
        is no <code>--on-warning</code>: warning only ever backs text as a
        translucent tint.
      </li>
    </ul>

    <h2>Seasonal palettes</h2>
    <section v-for="season in seasons" :key="season.id" class="palette">
      <h3>
        {{ season.glyph.light }} {{ season.label }}
        <small
          ><code>{{ season.id }}</code> · {{ monthRange(season.months) }}</small
        >
      </h3>
      <div v-for="mode in MODES" :key="mode" class="palette-row">
        <span class="palette-mode">{{ mode }}</span>
        <dl>
          <div v-for="role in PALETTE_ROLES" :key="role">
            <dt>{{ role }}</dt>
            <dd><ColorSwatchBadge :swatch="season.palette[mode][role]" /></dd>
          </div>
        </dl>
      </div>
    </section>

    <h3>Shared canvas</h3>
    <p>
      <code>neutral</code> (with <code>stone</code> and <code>gray</code>
      aliased to it) is the one family that is the same in every season: page
      backgrounds, body text, gridlines and borders.
    </p>
    <div class="swatches">
      <ColorSwatchBadge
        v-for="swatch in [...NEUTRALS.light, ...NEUTRALS.dark]"
        :key="swatch.hex"
        :swatch="swatch"
      />
    </div>

    <h2>Shape language</h2>
    <p>
      A season also changes the silhouette of the UI. Cards, panels, buttons and
      badges take their outline from <code>--shape-*</code> and
      <code>--corner-*</code> tokens (CSS <code>corner-shape</code>), and the
      card motif, divider, bullet and page backdrop come from
      <code>--motif-*</code> tokens.
    </p>
    <ul>
      <li>
        <strong>Spring:</strong> petal cards with one scooped corner, pill
        buttons.
      </li>
      <li><strong>Summer:</strong> squircle pebble panels, droplet buttons.</li>
      <li><strong>Autumn:</strong> bevel-cut leaf cards, pointed tags.</li>
      <li>
        <strong>Winter:</strong> frosted octagons, hexagonal buttons and badges.
      </li>
    </ul>
    <p>
      Browsers without <code>corner-shape</code> fall back to rounded corners.
      Plain boxes opt in with <code>.season-box</code> and
      <code>.season-chip</code>, and <code>SeasonalEffects.vue</code> adds the
      ambient layer: petals, bubbles by day and fireflies by night, leaves, or
      snow. This book's pages keep that shape language for their notes, tables
      of swatches and code, and add the paper, running head and folio on top.
    </p>
    <p>
      The <NuxtLink to="/kana">kana chart</NuxtLink> adds education charms:
      学業守 omamori (<code>OmamoriCharm.vue</code>) and ema plaques
      (<code>EmaPlaque.vue</code>), coloured through <code>--charm-*</code> and
      <code>--ema-*</code>, with motion off under
      <code>prefers-reduced-motion</code>. How a season is chosen is in
      <NuxtLink to="/docs/seasons">Seasons</NuxtLink>.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
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
.palette {
  margin: 1.5rem 0;
  padding-top: 0.75rem;
  border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
}
.palette h3 {
  margin-top: 0;
}
.palette h3 small {
  margin-left: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.7;
}
.palette-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.palette-mode {
  padding-top: 1rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: capitalize;
  opacity: 0.6;
}
.palette dl {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  margin: 0;
}
.palette dt {
  margin-bottom: 0.125rem;
  font-family: var(--font-sans);
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.55;
}
.palette dd {
  margin: 0;
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 640px) {
  .palette-row {
    flex-direction: row;
    gap: 1rem;
  }
  .palette-mode {
    width: 3rem;
    flex-shrink: 0;
  }
}
</style>
