<template>
  <DocsBook slug="seasons">
    <template #lede>
      The year clock. A season sets the site's colours and shapes through a
      <code>data-season</code> attribute on <code>&lt;html&gt;</code>, and a
      daily cron keeps it in step with the calendar in Japan.
    </template>

    <h2>The four seasons</h2>
    <p>
      <code>SeasonId</code> is a closed union, defined once in
      <code>shared/seasons.ts</code>. A season may be added only once its CSS
      preset exists in <code>app/assets/css/tailwind.css</code> <em>and</em> its
      id is in that file.
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Season</th>
            <th>Id</th>
            <th>Months</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in seasons" :key="s.id">
            <td>{{ s.glyph.light }} {{ s.label }}</td>
            <td>
              <code>{{ s.id }}</code
              ><template v-if="s.id === DEFAULT_SEASON"> (default)</template>
            </td>
            <td>{{ monthRange(s.months) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>How a season reaches the page</h2>
    <DocDiagram
      label="The cron writes the site's season; the reader's own pick wins over it"
      :nodes="flow.nodes"
      :edges="flow.edges"
      :groups="flow.groups"
    />
    <ul>
      <li>
        <strong>Cron.</strong> <code>vercel.json</code> runs
        <code>GET /api/cron/update-season</code> at <code>0 15 * * *</code> UTC
        (midnight in Japan). It checks
        <code>Authorization: Bearer &lt;CRON_SECRET&gt;</code> in constant time
        (a missing or wrong token, or no secret, is a <code>401</code>),
        computes <code>seasonForDate()</code> and saves a
        <code>SiteTheme</code> with <code>source: "cron"</code> only if it
        differs from the stored one. It returns
        <code>{ season, previousSeason, changed }</code>.
      </li>
      <li>
        <strong>Site theme.</strong> <code>GET /api/site-theme</code> reads the
        single record (<code>n5:site_theme</code>) from Redis, or builds one for
        today's season (<code>source: "fallback"</code>) and saves it with Redis
        <code>NX</code>, so a concurrent cron write is never clobbered, and the
        site is never unstyled. Responses carry
        <code
          >cache-control: public, max-age=0, s-maxage=60,
          stale-while-revalidate=600</code
        >
        (a <code>routeRules</code> entry in <code>nuxt.config.ts</code>).
      </li>
      <li>
        <strong>Applying it.</strong> <code>useSiteTheme()</code> sets
        <code>data-season</code> on <code>&lt;html&gt;</code>; the reader's
        <code>season-choice</code> wins over the site's season. An inline script
        in <code>nuxt.config.ts</code> applies <code>season-choice</code>, else
        the cached <code>site-theme-season</code>, before paint, so a repeat
        visit never flashes the default.
      </li>
      <li>
        <strong>Season button.</strong> <code>SeasonButton.vue</code> lets a
        reader pick any season or “Follow the calendar”. The pick lives only in
        <code>localStorage</code> (<code>season-choice</code>).
      </li>
      <li>
        <strong>Music.</strong> <code>BgmControl.vue</code> and
        <code>useBgm.ts</code> play a looping track in a season that has one
        (autumn only). It is off on every load; only the volume
        (<code>bgm-volume</code>) is remembered. Looping is gapless through a
        decoded audio buffer and a <code>GainNode</code> (iOS ignores
        <code>element.volume</code>), and it pauses while the tab is hidden.
      </li>
    </ul>

    <p>
      The palettes and shapes themselves are in
      <NuxtLink to="/docs/color-palette">Colour and shape</NuxtLink>.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import type { DiagramSpec } from "../../utils/diagram";
import { DEFAULT_SEASON, SEASON_IDS, SEASONS } from "~~/shared/seasons";

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

const flow: Required<DiagramSpec> = {
  nodes: [
    {
      id: "cron",
      label: "Vercel cron",
      sub: "00:00 JST",
      col: 0,
      row: 0,
      kind: "actor",
    },
    {
      id: "redis",
      label: "Redis",
      sub: "n5:site_theme",
      col: 1,
      row: 0,
      kind: "store",
    },
    {
      id: "theme",
      label: "GET /api/site-theme",
      sub: "fallback: today's",
      col: 2,
      row: 0,
    },
    {
      id: "hook",
      label: "useSiteTheme()",
      sub: "data-season on <html>",
      col: 2,
      row: 1.5,
      kind: "check",
    },
    {
      id: "pick",
      label: "Reader's pick",
      sub: "localStorage",
      col: 0,
      row: 1.5,
      kind: "actor",
    },
    {
      id: "script",
      label: "Inline script",
      sub: "applies it before paint",
      col: 1,
      row: 1.5,
    },
  ],
  edges: [
    { from: "cron", to: "redis", label: "if changed" },
    { from: "theme", to: "redis", label: "reads" },
    { from: "theme", to: "hook" },
    { from: "pick", to: "script", label: "wins" },
    { from: "script", to: "hook", kind: "dashed" },
  ],
  groups: [{ label: "Server", ids: ["cron", "redis", "theme"] }],
};
</script>
