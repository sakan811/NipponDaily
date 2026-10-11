<template>
  <DocsBook slug="seasons">
    <template #lede>
      The year clock. A season sets the site's colours and shapes through a
      <code>data-season</code> attribute on <code>&lt;html&gt;</code>. The
      browser works the season out from the date in Japan and checks again at
      every midnight, so nothing about it is stored or fetched.
    </template>

    <h2>The four seasons</h2>
    <p>
      <code>SeasonId</code> is a closed union in <code>types/index.ts</code>,
      and <code>shared/seasons.ts</code> lists the ids and presets. A season may
      be added only once its CSS preset exists in
      <code>app/assets/css/tailwind.css</code> <em>and</em> its id is in both.
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
            <td>{{ monthsText(s.months) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>How a season reaches the page</h2>
    <DocDiagram
      label="The date in Japan gives the season; the reader's own pick wins over it"
      :nodes="flow.nodes"
      :edges="flow.edges"
      :groups="flow.groups"
    />
    <ul>
      <li>
        <strong>The calendar.</strong> <code>seasonForDate()</code> in
        <code>shared/seasons.ts</code> maps the month in Japan (UTC+9, no
        daylight saving) to a season. It is a pure function of the date, which
        is why no server, cron or datastore is involved: the same answer is
        worked out anywhere, and it cannot go stale.
      </li>
      <li>
        <strong>Before first paint.</strong> An inline script in
        <code>nuxt.config.ts</code> (built by <code>seasonBootScript()</code>)
        sets <code>data-season</code> on <code>&lt;html&gt;</code>: the reader's
        <code>{{ STORAGE_KEYS.seasonChoice }}</code> if there is one, else the
        season for this month in Japan, read from a twelve-entry table embedded
        in the script. A first visit therefore never flashes the default
        palette, and blocked storage cannot stop it. The season is applied in
        the browser, never in the HTML, which is why a page cached for everyone
        is safe.
      </li>
      <li>
        <strong>The daily check.</strong> Once the page is up,
        <code>useSiteTheme()</code> (started from <code>app.vue</code>) applies
        the season again, then checks at the next midnight in Japan and at every
        midnight after, and whenever the tab becomes visible again. A page left
        open past the turn of a month therefore changes season without a reload,
        and a hidden tab, whose timers sleep, catches up the moment it returns.
        The check does nothing while the reader has picked a season.
      </li>
      <li>
        <strong>Season button.</strong> <code>SeasonButton.vue</code> lets a
        reader pick any season or “Follow the calendar”. The pick lives only in
        <code>localStorage</code> (<code>{{ STORAGE_KEYS.seasonChoice }}</code
        >).
      </li>
      <li>
        <strong>Music.</strong> <code>BgmControl.vue</code> and
        <code>useBgm.ts</code> play a looping track for each season, all encoded
        to the same integrated loudness (−16 LUFS, measured on the MP3s) so a
        season change never changes the level. It is off on every load; only the
        volume (<code>{{ STORAGE_KEYS.bgmVolume }}</code
        >) is remembered. Looping is gapless through a decoded audio buffer and
        a <code>GainNode</code> (iOS ignores <code>element.volume</code>); a
        browser without Web Audio falls back to a plain looping audio element,
        with no crossfade. When the season changes mid-song the old track keeps
        playing until the new one has loaded, then the two crossfade over two
        seconds. The music pauses while the tab is hidden.
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
import {
  DEFAULT_SEASON,
  monthsText,
  SEASON_IDS,
  SEASONS,
} from "~~/shared/seasons";
import { STORAGE_KEYS } from "~~/shared/storage-keys";

const seasons = SEASON_IDS.map((id) => SEASONS[id]);

const flow: Required<DiagramSpec> = {
  nodes: [
    {
      id: "date",
      label: "Date\n(Japan, JST)",
      col: 0,
      row: 0,
      kind: "actor",
    },
    {
      id: "season",
      label: "A season",
      sub: "seasonForDate()",
      col: 1,
      row: 0,
    },
    {
      id: "script",
      label: "Inline script",
      sub: "applies it before paint",
      col: 2,
      row: 0,
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
      id: "hook",
      label: "useSiteTheme()",
      sub: "checks every midnight",
      col: 1,
      row: 1.5,
    },
    {
      id: "html",
      label: "The site's look",
      sub: "data-season on <html>",
      col: 2,
      row: 1.5,
      kind: "check",
    },
  ],
  edges: [
    { from: "date", to: "season" },
    { from: "season", to: "script" },
    { from: "script", to: "html", out: "b", into: "t" },
    { from: "season", to: "hook", label: "daily check" },
    { from: "pick", to: "hook", label: "wins" },
    { from: "hook", to: "html" },
  ],
  groups: [
    { label: "In the browser", ids: ["season", "script", "hook", "html"] },
  ],
};
</script>
