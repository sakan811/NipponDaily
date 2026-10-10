<template>
  <DocsBook slug="architecture">
    <template #lede>
      NipponDaily is a Nuxt 4 app (Vue 3, TypeScript, pnpm) with a small Nitro
      API. The words are JSON in the repo, served by date and never before their
      day arrives; the pages are rendered on the server, so the HTML a crawler
      gets already holds the word.
    </template>

    <h2>Overview</h2>
    <ul>
      <li>
        <strong>The entries are in-repo data</strong>:
        <code>data/words/YYYY-MM.json</code>, one entry per day, no day missing
        in a month, running <CatalogueRange />. Only the headline is
        hand-written; everything else is generated from sources (<NuxtLink
          to="/docs/data-integrity"
          >Data integrity</NuxtLink
        >).
      </li>
      <li>
        <strong>A day is open once midnight in Japan has passed.</strong> The
        API, the sitemap and every derived page read only open days.
      </li>
      <li>
        <strong>Redis holds only the site's season.</strong> Without Redis the
        season is kept in process memory; the words need no configuration.
      </li>
      <li>
        <strong
          >Nothing about a reader is stored or sent to the app's server.</strong
        >
        No accounts, and no request to a third party: the fonts are served from
        the app. The rate limiter counts addresses in process memory only, a
        minute at a time, and writes them nowhere.
      </li>
    </ul>

    <DocDiagram
      label="A page asks the API in-process; only the API reads the entries, so no upcoming word reaches the browser"
      :nodes="system.nodes"
      :edges="system.edges"
      :groups="system.groups"
    />

    <h2>Layout</h2>
    <pre><code>app/        pages/, components/, composables/, utils/, data/, assets/css/tailwind.css
shared/     code imported by both app/ and server/ (the ~~/shared alias); not auto-imported
server/     api/ (handlers), routes/ (sitemap, robots, share images), middleware/ (rate limit), plugins/ (caching), services/ (Redis), utils/, assets/og/ (share-image fonts)
scripts/    data builders run with node: reference snapshots, etymology pins, example sentences, pitch accents, kanji records, strokes, entry generator
data/       word-plan/ (hand-written), words/ (generated), reference/ (generated evidence)
types/      shared TypeScript shapes (index.ts)
test/       unit/ (happy-dom), server/ (node), content/ (offline, against the snapshots), integration/ (the built app over HTTP)
e2e/        Playwright browser tests of the built app</code></pre>

    <h2>The shared modules</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in sharedModules" :key="m.file">
            <td>
              <code>{{ m.file }}</code
              ><template v-if="m.serverOnly"
                ><br ><em>server and tests only</em></template
              >
            </td>
            <td><RichText :text="m.role" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <aside class="note">
      <span class="note-title">The one import rule</span>
      <p>
        Nothing under <code>app/</code> may import
        <code>shared/words|parts|kanji|explore|patterns|related|sitemap</code>
        or <code>data/words</code>. They carry every entry, upcoming ones
        included, and would ship them to the browser. The server fetches through
        <code>$fetch</code>, which calls the API handler in-process, so the data
        never enters the client bundle.
        <code>test/unit/no-future-leak.test.ts</code> enforces it, and
        components that need labels import the data-free
        <code>shared/word-labels.ts</code>.
      </p>
    </aside>

    <h2>The app</h2>
    <ul>
      <li>
        <strong>Pages:</strong> <code>/</code> (today's word),
        <code>/words</code> (month calendar), <code>/words/&lt;date&gt;</code>,
        <code>/explore</code>, <code>/patterns</code>, <code>/parts</code>,
        <code>/parts/&lt;text&gt;</code>, <code>/kanji</code>,
        <code>/kanji/&lt;character&gt;</code>, <code>/kana</code>,
        <code>/docs/*</code> (this book) and a catch-all that answers a real
        <code>404</code> and is <code>noindex</code>. Old links to
        <code>/game</code>, <code>/learn/**</code> and
        <code>/vocab/**</code> redirect to <code>/</code> (<code
          >routeRules</code
        >
        in <code>nuxt.config.ts</code>).
      </li>
      <li>
        <strong>Composables</strong> are <code>useAsyncData</code>-based, so the
        server renders with data. <code>useApiData</code> is the one place that
        fetches, turns a failure into a message and, on the server, into a
        <code>404</code>; <code>useDailyWord</code>,
        <code>useWordCalendar</code>, <code>usePartsIndex</code>,
        <code>usePart</code>, <code>useKanjiIndex</code>, <code>useKanji</code>,
        <code>useExplore</code>, <code>usePatterns</code> and
        <code>useCatalogue</code> are each a call to it.
        <code>useRelatedWords</code> alone fetches by itself, because its
        failure must never make the page a <code>404</code>. Besides these are
        <code>usePageSeo</code> (with <code>useSiteUrl</code>, the canonical
        origin), <code>useSiteTheme</code> and <code>useBgm</code>.
      </li>
      <li>
        <strong>Components:</strong> <code>WordEntryView</code> (one entry, with
        its pitch accent), <code>KanjiStrokes</code> (a kanji's strokes, one
        frame each), <code>RelatedWords</code>, <code>WordFilters</code> (the
        filter form shared by Explore and the calendar), <code>AppHeader</code>,
        <code>AppFooter</code>, <code>AppShell</code> (the header, backdrop and
        footer every page sits in), <code>DocsBook</code> (a docs page),
        <code>DocDiagram</code>, <code>SeasonButton</code>,
        <code>BgmControl</code>, <code>SeasonalEffects</code>,
        <code>TrendingFallback</code> (the generic fetch-error card), the
        education charms of <code>/kana</code>, and small local
        <code>U*.vue</code> primitives that mimic the <code>@nuxt/ui</code> API
        (the project does not depend on it).
      </li>
      <li>
        <strong>SEO:</strong> every page calls <code>usePageSeo</code> (title,
        description, canonical, Open Graph, <code>noindex</code> for error
        states). URLs are absolute: <code>NUXT_PUBLIC_SITE_URL</code>, else the
        request origin.
      </li>
      <li>
        <strong>SSR errors:</strong> a server fetch that fails with
        <code>400</code>/<code>404</code> makes the HTTP response a
        <code>404</code>. A skeleton shows only while a client-side fetch is
        pending; <code>TrendingFallback</code> shows on failure (<NuxtLink
          to="/docs/error-states"
          >all the states</NuxtLink
        >).
      </li>
    </ul>

    <h2 id="caching">Caching</h2>
    <p>
      The site has no per-reader state, so every successful page and API answer
      is the same for everyone until the next midnight in Japan, when the day's
      word opens. <code>server/plugins/day-cache.ts</code> marks each successful
      <code>GET</code> with <code>s-maxage</code> set to the seconds left until
      then (<code>server/utils/day-cache.ts</code>), so a CDN serves it without
      running the app and the copy expires at the moment a new word opens. It
      sets no <code>stale-while-revalidate</code>, which would show yesterday's
      word after the day had turned, and it never marks an error. The exceptions
      are <code>/api/site-theme</code> (a short rule of its own in
      <code>nuxt.config.ts</code>), the cron, and the share image, which never
      changes once its day has opened and so keeps longer; both rules are in
      <code>shared/endpoints.ts</code> and the
      <NuxtLink to="/docs/api">API</NuxtLink>
      chapter. The season is applied in the browser, never in the HTML, which is
      why a cached page is safe. Without a CDN that honours
      <code>s-maxage</code> every request runs the app, which is correct but
      slower.
    </p>
    <p>
      This saves invocations, not computation: with every entry in memory a
      patterns, parts or explore answer takes a few milliseconds, so no
      in-process cache is kept.
    </p>

    <h2>Conventions</h2>
    <ul>
      <li>
        <strong>Service layer.</strong> Storage and external calls live in
        <code>server/services/</code>; each exports the class and a singleton
        (<code>siteThemeService</code>). The daily words deliberately have no
        service: they are in-repo data.
      </li>
      <li>
        <strong>Configuration</strong> (Redis credentials, the cron secret) goes
        through <code>server/utils/config.ts</code>'s
        <code>getEnvOrConfig(configKey, envKey)</code>, which prefers Nuxt
        <code>runtimeConfig</code> and falls back to <code>process.env</code>,
        so it also works outside a request. The public site URL is read from
        <code>runtimeConfig.public</code> by <code>siteOrigin()</code> in
        <code>server/utils/site-url.ts</code>. The data scripts run under plain
        <code>node</code> and need no Redis credentials.
      </li>
      <li><strong>Types</strong> live in <code>types/index.ts</code>.</li>
      <li>
        <strong>State</strong> is local (<code>ref</code>,
        <code>computed</code>); there is no global store. Only
        <template v-for="(key, i) in storageKeys" :key="key"
          >{{ i ? ", " : "" }}<code>{{ key }}</code></template
        >
        ever sit in a reader's <code>localStorage</code>.
      </li>
      <li>
        <strong>One implementation.</strong> Before writing a second copy of a
        handler, composable, page shell or script step, use or extend the helper
        that already does it: <code>ok</code>, <code>notFound</code> and
        <code>parseQuery</code> for API answers (<code>server/utils/</code>),
        <code>useApiData</code> for fetching, <code>AppShell</code> for a page's
        header, backdrop and footer, and <code>scripts/lib/</code> for the data
        scripts. A number or name the rules turn on goes in the
        <code>shared/</code> module that owns it (see below).
        <code>test/server/single-source.test.ts</code> fails when one of those
        facts is typed again beside its owner.
      </li>
      <li><strong>Package manager</strong> is pnpm only.</li>
    </ul>

    <h2 id="single-sources">Single sources of truth</h2>
    <p>
      A fact is written once, in code, and everything else reads it. Prose that
      explains something stays hand-written, once per audience, and points here
      instead of restating the fact. The rule (often called DRY) applies in four
      places:
    </p>
    <ul>
      <li>
        <strong>Code.</strong> One implementation per job, and a constant the
        rules turn on lives in the <code>shared/</code> module that owns it (see
        <em>One implementation</em> above).
      </li>
      <li>
        <strong>Data.</strong> Entries in <code>data/words/</code> and
        <code>data/reference/</code> are generated, never edited by hand. A
        wrong value is fixed in its source or in the parser, then regenerated
        (<NuxtLink to="/docs/authoring">Adding and fixing words</NuxtLink>), and
        a test fails when a committed entry differs from what the generator
        derives (<NuxtLink to="/docs/data-integrity">Data integrity</NuxtLink>).
      </li>
      <li>
        <strong>Facts the pages state.</strong> Sources, routes, seasons and the
        word range are read from code or data when the page renders, as the
        table below shows.
      </li>
      <li>
        <strong>Docs.</strong> One chapter owns each topic and the others link
        to it (<NuxtLink to="/docs/development#docs">Development</NuxtLink>).
      </li>
    </ul>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fact</th>
            <th>Written once in</th>
            <th>Read by</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sources" :key="row.fact">
            <td>{{ row.fact }}</td>
            <td>
              <code>{{ row.file }}</code>
            </td>
            <td><RichText :text="row.readers" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      To add a data source, add it to <code>shared/sources.ts</code>; it then
      appears in Data integrity and the README. The footer names only the two
      sources whose licence calls for a visible credit, so add a line there by
      hand if a new one needs it. To add an endpoint, add the handler under
      <code>server/api/</code> (or <code>server/routes/</code>) and an entry in
      <code>shared/endpoints.ts</code>; a test fails until both exist. How the
      docs are kept in step is in
      <NuxtLink to="/docs/development#docs">Development</NuxtLink>.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import CatalogueRange from "../../components/CatalogueRange.vue";
import RichText from "../../components/RichText.vue";
import type { DiagramSpec } from "../../utils/diagram";
import { STORAGE_KEYS } from "~~/shared/storage-keys";

const storageKeys = Object.values(STORAGE_KEYS);

const system: Required<DiagramSpec> = {
  nodes: [
    { id: "reader", label: "Reader", col: 0, row: 1, kind: "actor" },
    { id: "pages", label: "Pages", sub: "app/ (Nuxt, SSR)", col: 1, row: 1 },
    { id: "api", label: "API", sub: "server/ (Nitro)", col: 2, row: 1 },
    {
      id: "shared",
      label: "Modules",
      sub: "shared/words, parts…",
      col: 3,
      row: 1,
    },
    {
      id: "words",
      label: "Entries",
      sub: "data/words/*.json",
      col: 3,
      row: 2.4,
      kind: "store",
    },
    {
      id: "redis",
      label: "Redis",
      sub: "the site's season",
      col: 2,
      row: 2.4,
      kind: "store",
    },
    {
      id: "cron",
      label: "Vercel cron",
      sub: "midnight JST daily",
      col: 1,
      row: 2.4,
      kind: "actor",
    },
  ],
  edges: [
    { from: "reader", to: "pages", label: "HTML" },
    { from: "pages", to: "api", label: "$fetch\nin-process" },
    { from: "api", to: "shared" },
    { from: "shared", to: "words", label: "open days only" },
    { from: "api", to: "redis", out: "b", into: "t", label: "season" },
    { from: "cron", to: "redis", label: "writes" },
    {
      from: "pages",
      to: "shared",
      kind: "never",
      out: "t",
      into: "t",
      label: "never imports",
    },
  ],
  groups: [{ label: "Server only", ids: ["api", "shared", "words", "redis"] }],
};

const sharedModules = [
  {
    file: "words.ts",
    serverOnly: true,
    role: "The catalogue (`WORD_ENTRIES`), JST date logic (`todayJst`…), `entryForDate`, `lapEntryForDate`, `payloadFor`, `calendarForMonth`.",
  },
  {
    file: "parts.ts",
    serverOnly: true,
    role: "`partsIndex(today)` and `partDetail(text, today)`: the morpheme index, derived from the entries' `morphemes`.",
  },
  {
    file: "kanji.ts",
    serverOnly: true,
    role: "`kanjiIndex(today)` and `kanjiDetail(char, today)`: KANJIDIC2's record of each kanji an open word is written with (`data/reference/kanji.json`), its KanjiVG strokes where the counts agree (`data/reference/strokes.json`) and the open words that use it.",
  },
  {
    file: "explore.ts",
    serverOnly: true,
    role: "`exploreWords(filters, today)`: search and filters (several choices, any or all) with facet counts. `exploreCalendar(month, filters, today)`: one calendar month marked against the same filters, with per-month counts.",
  },
  {
    file: "related.ts",
    serverOnly: true,
    role: "`relatedWords(entry, today)`: the open words most like one entry.",
  },
  {
    file: "patterns.ts",
    serverOnly: true,
    role: "`patternsFor(today)`: counts across the open words, including rendaku.",
  },
  {
    file: "sitemap.ts",
    serverOnly: true,
    role: "`sitemapXml()` and `robotsTxt()`: open days only.",
  },
  {
    file: "og-card.ts",
    role: "`ogCard(entry, glyphs)`: the share image of one word as a tree satori draws, in its day's season. Takes the entry as an argument, so it is data-free.",
  },
  {
    file: "catalogue.ts",
    role: "The written range and count, computed from entry dates. Data-free.",
  },
  {
    file: "explore-query.ts",
    role: "Reads and writes the Explore filters as a URL query (comma-joined lists). Data-free.",
  },
  {
    file: "word-labels.ts",
    role: "`WORD_STRATA`, `WORD_PROCESSES`, `POS_GROUPS` and `FREQUENCY_GROUPS` labels and definitions, `posGroupsOf()`, `frequencyOf()` and `isHedged()`. Data-free.",
  },
  {
    file: "meanings.ts",
    role: "`servedVocab()`: the corrections and enrichments applied to a word-list entry (with the row overrides in `scripts/lib/word-list.mjs`).",
  },
  {
    file: "seasons.ts",
    role: "The seasonal presets: `SEASONS`, `SEASON_IDS`, `DEFAULT_SEASON`, `seasonForDate()`.",
  },
  { file: "sources.ts", role: "Data sources, licences and credit lines." },
  {
    file: "endpoints.ts",
    role: "The route list, the rate limit and the CDN cache rules.",
  },
  { file: "docs.ts", role: "The chapters of this book." },
  { file: "jlpt.ts", role: "`JLPT_LEVELS`." },
  {
    file: "limits.ts",
    role: "The numbers the rules turn on: `MAX_PART_LENGTH`, the related-words limit, weight and minimum score, `MAX_EXAMPLES`.",
  },
  {
    file: "jst.ts",
    role: "Japan's calendar: `JST_OFFSET_MS`, `DAY_MS`, `toJst()`.",
  },
  {
    file: "storage-keys.ts",
    role: "`STORAGE_KEYS`, the only keys in a reader's `localStorage`.",
  },
];

const sources = [
  {
    fact: "Data sources, licences, credit lines, the revision permalink",
    file: "shared/sources.ts",
    readers: "The footer, each entry's citation, Data integrity, the README",
  },
  {
    fact: "HTTP routes",
    file: "shared/endpoints.ts",
    readers: "The API chapter",
  },
  {
    fact: "Word range and count",
    file: "data/words/",
    readers:
      "`GET /api/catalogue` (via `shared/catalogue.ts`), which every chapter that quotes the range reads",
  },
  {
    fact: "Season palettes, months, motifs",
    file: "shared/seasons.ts",
    readers: "The CSS (a test keeps it in step), Seasons, Colour and shape",
  },
  {
    fact: "Japan's calendar: the offset and the length of a day",
    file: "shared/jst.ts",
    readers:
      "`todayJst()`, `seasonForDate()`, the cache lifetime in `server/utils/day-cache.ts`",
  },
  {
    fact: "The rate limit and the CDN cache rules",
    file: "shared/endpoints.ts",
    readers:
      "The rate limiter, `nuxt.config.ts`, the share-image route, the API and Seasons chapters",
  },
  {
    fact: "The numbers the rules turn on (related words, examples, part length)",
    file: "shared/limits.ts",
    readers:
      "The code that applies them, the tests and the Daily words chapter",
  },
  {
    fact: "The `localStorage` keys",
    file: "shared/storage-keys.ts",
    readers:
      "The buttons and composables that write them, the inline script in `nuxt.config.ts`, the docs",
  },
  {
    fact: "The JLPT levels",
    file: "shared/jlpt.ts",
    readers:
      "The Explore filters, the data scripts, every chapter that names the range",
  },
  {
    fact: "Chapters, titles, summaries, order",
    file: "shared/docs.ts",
    readers:
      "The contents, each chapter's heading and SEO, the home page, the sitemap",
  },
];
</script>
