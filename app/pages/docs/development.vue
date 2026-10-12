<template>
  <DocsBook slug="development">
    <template #lede>
      Everything for working on the code: setup, environment, commands, tests,
      and the rules that keep these docs true. Use <strong>pnpm</strong> only.
    </template>

    <h2>Setup</h2>
    <p>Node {{ stack.node }} (Nuxt's supported range) and pnpm.</p>
    <pre><code>pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000</code></pre>
    <p>
      The site needs no configuration: the daily words are in-repo data and the
      season is worked out in the browser from the date. The data scripts
      (<code>scripts/build-*.mjs</code>) run through the
      <code>data:*</code> commands under plain <code>node</code> and need no
      credentials.
    </p>

    <h2>Environment</h2>
    <p>
      See <code>.env.example</code>. There is one optional variable; the site
      URL is read from <code>runtimeConfig.public</code>.
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in env" :key="v.name">
            <td>
              <code>{{ v.name }}</code>
            </td>
            <td><RichText :text="v.use" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Commands</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in commands" :key="c.cmd">
            <td>
              <code>{{ c.cmd }}</code>
            </td>
            <td><RichText :text="c.does" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      The <code>data:*</code> commands and <code>pnpm assets:og-font</code> are
      listed once, with what they read and write, in
      <NuxtLink to="/docs/authoring">Adding and fixing words</NuxtLink>. A test
      fails if a script in <code>package.json</code> is in neither table.
    </p>

    <h2>Tests</h2>
    <p>
      Vitest, in the projects <code>vitest.config.ts</code> defines, and
      Playwright for the browser tests in <code>e2e/</code>.
    </p>
    <ul>
      <li>
        <strong><code>test/unit</code></strong> (happy-dom): components and
        pages. <code>test/setup.ts</code> mocks
        <code>#app</code> (<code>useRoute</code>, <code>useRouter</code>, a
        working <code>useAsyncData</code>, no-op <code>useSeoMeta</code> and
        <code>useHead</code>); add to it and to <code>test/mocks/app.ts</code>
        when a page needs another composable.
      </li>
      <li>
        <strong><code>test/server</code></strong> (node; no project name, so
        scope by path: <code>pnpm exec vitest run test/server</code>): API
        handlers, the <code>shared/</code> modules, the data scripts and the
        server utilities. The word endpoints need no mock because they read
        in-repo data; their tests freeze the clock with
        <code>vi.useFakeTimers()</code>.
      </li>
      <li>
        <strong><code>test/content</code></strong> (fully offline): every entry
        and every word-list word against the committed snapshots (<NuxtLink
          to="/docs/data-integrity"
          >Data integrity</NuxtLink
        >).
      </li>
      <li>
        <strong><code>test/integration</code></strong> (node): builds Nuxt into
        a throwaway directory, starts the built server and requests every route
        over HTTP. It checks that the home page and a day's page hold their word
        in the HTML, that every part, kanji and chapter page answers, that a day
        that has not arrived is a <code>404</code> and the old links redirect,
        that the share image is a PNG, and that the cache header is on an answer
        and not on an error. It has no setup file, because
        <code>test/setup.ts</code> replaces the global <code>fetch</code> with a
        mock. To run it alone:
        <code>pnpm exec vitest run --project integration</code>.
      </li>
      <li>
        <strong><code>e2e</code></strong> (Playwright; the desktop browsers and
        phones <code>playwright.config.ts</code> lists):
        <code>pnpm test:e2e</code> builds the app, starts it on its own port and
        drives it in each. It checks that every page renders with no uncaught
        error or console error and cannot be scrolled sideways, that today's
        word opens from the home page, that the colour mode and season picks
        change the page and are remembered, that the Explore chips narrow the
        list and write the URL, that any/all agrees with the API, that the
        calendar moves between months and that a kanji page draws one frame per
        stroke. The music switch is driven too: it never starts by itself, asks
        for the season's track (and the next one when the season changes), and
        keeps the volume in the browser; the tracks are served as a short tone
        so no browser's codecs matter. Each season's falling or rising
        particles, glyphs and corner graphic are read back as the browser
        computes them, in light and dark, and are gone under reduced motion.
        Playwright needs its browsers (<code
          >pnpm exec playwright install chromium firefox webkit</code
        >) and the system libraries behind them; it is not part of
        <code>pnpm check-qa</code>. The API is rate limited per address and
        every test comes from one, so keep the tests few.
      </li>
      <li>
        <strong><code>e2e-dev</code></strong> (Playwright, Chromium):
        <code>pnpm test:e2e:dev</code> starts <code>nuxt dev</code> and visits
        every page, a word, a kanji and a part, and each season in dark mode,
        failing on any Vue warning, hydration mismatch, console error or
        uncaught exception. A production build prints none of these, so this is
        where a template naming something its script never defines is found. The
        <code>hints:hydration</code> notes from <code>@nuxt/hints</code> are not
        counted: they also flag what the app changes on purpose once mounted.
        The unit test for the docs chapters makes the same check without a
        browser.
      </li>
    </ul>
    <p>
      The integration test builds the app, so <code>pnpm test:run</code> passing
      does prove it builds and serves; run <code>pnpm build</code> on its own
      only to see the build's output. CI
      (<code>.github/workflows/webpage-test.yml</code>; every job sets up
      through <code>.github/actions/setup</code>, which names the pnpm version
      once and takes Node's from <code>engines</code> in
      <code>package.json</code>) runs <code>pnpm run test</code>,
      <code>pnpm test:e2e</code> and <code>pnpm test:e2e:dev</code> as separate
      jobs on pushes to <code>main</code> and on pull requests targeting it.
    </p>
    <p>Tests that guard against drift:</p>
    <ul>
      <li>
        <code>no-future-leak</code>: nothing under <code>app/</code> imports the
        entries.
      </li>
      <li>
        <code>seasons-css-sync</code>: <code>shared/seasons.ts</code> against
        the CSS.
      </li>
      <li>
        <code>icons</code>: every <code>i-heroicons-*</code> name used has a
        path in <code>app/data/icons.ts</code>.
      </li>
      <li>
        <code>og-font</code>: the share-image fonts can draw every word, reading
        and meaning, and nearly every headline.
      </li>
      <li>
        <code>contrast</code>: text on colour in every season and mode against
        WCAG AA (fills, shaded text and the muted grey of captions and labels,
        on the canvas, a card, a tint and a badge), that no class sets text in a
        500 step or in a neutral step below AA, that the focus ring, the search
        box's border, a chip's border, the music switch's off track and a
        pressed chip's border reach 3:1 and that the classes shipping are the
        ones measured, and that text reaches AA under each seasonal backdrop
        wash.
      </li>
      <li>
        <code>single-source</code>: a fact owned by one module (Japan's offset,
        the <code>localStorage</code> keys, the JSON envelope, the JLPT levels,
        the page chrome) is not written out again beside it.
      </li>
      <li>
        <code>principles</code>: the principles no other test sees. Nothing
        leaves the app (no other origin, script, frame, download, beacon or
        server write) and no reader data (no cookie, no storage but the named
        <code>localStorage</code> keys, no address read but by the rate
        limiter).
      </li>
      <li>
        <code>server-only-modules</code>: the import rule's list in
        <code>shared/server-only.ts</code> against the imports, so a new module
        that reads the entries cannot go unlisted.
      </li>
      <li>
        <code>docs-sync</code>: the docs against the code (see below), including
        the Architecture chapter's lists of modules, components, pages and
        redirects.
      </li>
      <li>
        <code>docs-claims</code>: the figures the docs quote against their
        source: the Node range against Nuxt's, the loudness in
        <code>shared/audio.ts</code> against ffmpeg's measure of the tracks
        (skipped without ffmpeg), the download sizes in Adding and fixing words
        against the pins, a chapter that lists the same backers as another, a
        link to the Roadmap while it is empty, and a word written twice.
      </li>
    </ul>

    <h2 id="releases">Releases</h2>
    <p>
      A release is a git tag on <code>main</code> plus a GitHub Release; the tag
      is the only record of the version, so <code>package.json</code> carries
      none. The Releases page is the changelog, and there is no
      <code>CHANGELOG.md</code>.
    </p>
    <ul>
      <li>
        <strong>Versions are SemVer, read for a product.</strong> Major: what
        the app is, or something readers could use, changed or was removed.
        Minor: new features or data. Patch: fixes only.
      </li>
      <li>
        <strong>Notes are written by theme</strong>, starting from
        <code>gh release create --generate-notes</code> and trimmed to Features,
        Data, Docs and Maintenance. Dependency bumps become one Maintenance
        line.
      </li>
      <li>
        <strong>A major opens with a Breaking or Pivot line</strong> saying what
        was removed and which earlier tag still has it. The tags are the
        archive, not long-lived branches.
      </li>
      <li>
        <strong>Published tags are never moved or deleted.</strong> Fix a
        mistake in the notes with <code>gh release edit</code>.
      </li>
      <li>Run <code>pnpm check-qa</code> on the commit being tagged.</li>
    </ul>

    <h2 id="docs">Keeping the docs true</h2>
    <p>
      These docs are the pages under <code>app/pages/docs/</code>. There is no
      separate copy in the repo, so a chapter is the only place its topic is
      written.
    </p>
    <ul>
      <li>
        <strong>Add a chapter</strong> by writing
        <code>app/pages/docs/&lt;slug&gt;.vue</code> around
        <code>&lt;DocsBook slug="…"&gt;</code> and listing it in
        <code>shared/docs.ts</code>. Title, summary, path, contents, previous
        and next links, the home page and the sitemap all follow from that one
        entry. Figures are <code>DocDiagram</code> specs: boxes on a grid joined
        by arrows, drawn as inline SVG in the season's colours.
      </li>
      <li>
        <strong>One owner per topic.</strong> A chapter either owns a topic or
        links to the one that does:
        <NuxtLink to="/docs/core-theme">Core theme</NuxtLink> owns the
        principles; <NuxtLink to="/docs/architecture">Architecture</NuxtLink>
        the layout, the import rule and the single sources of truth;
        <NuxtLink to="/docs/words">Daily words</NuxtLink> the entry, dates and
        derived pages; <NuxtLink to="/docs/api">API</NuxtLink> the endpoints;
        <NuxtLink to="/docs/data-integrity">Data integrity</NuxtLink> the
        evidence and checks;
        <NuxtLink to="/docs/authoring">Adding and fixing words</NuxtLink> the
        procedures; this chapter setup, commands and tests.
      </li>
      <li>
        <strong>Facts live in code.</strong> Attribution is
        <code>shared/sources.ts</code>, routes are
        <code>shared/endpoints.ts</code>, seasons are
        <code>shared/seasons.ts</code>, the limits are
        <code>shared/limits.ts</code>, the Node range and framework versions are
        <code>package.json</code>, and the word range comes from
        <code>data/words/</code> (<code>GET /api/catalogue</code>). The pages
        read them. Never type a source URL, a licence name, a route list, a word
        count, a version, a limit or a size into a chapter or the README. When a
        chapter needs a fact, in this order: <strong>read it</strong> from the
        module that owns it (move the constant into <code>shared/</code> first
        if it is private, and use <code>countWord()</code> for a count in
        words); <strong>generate it</strong> where the page is Markdown, with a
        <code>pnpm docs:sync</code> region; and only when the owner cannot be
        imported (a pin in a script, a measurement of a file) type it once and
        add a case to <code>test/server/docs-claims.test.ts</code> that checks
        it against the owner.
      </li>
      <li>
        <strong><code>pnpm docs:sync</code></strong> fills the generated regions
        of the README (the attribution, the Node range, the stack line, the JLPT
        levels, the vocabulary layers and the chapter titles, between
        <code>&lt;!-- docs:begin … --&gt;</code> markers, never edited by hand).
        <code>pnpm docs:check</code> fails if it is stale.
      </li>
      <li>
        <strong>Change a behaviour, change its chapter</strong> in the same
        commit. <code>test/server/docs-sync.test.ts</code> catches a hand-typed
        range or count, a source URL or licence, a route that doesn't exist, a
        <code>pnpm</code> command that isn't a script, a path in
        <code>&lt;code&gt;</code> that isn't in the repo, a chapter list that
        disagrees with the page files, a script, environment variable or
        composable the book does not mention.
      </li>
      <li>
        Wrap every command, path and identifier in <code>&lt;code&gt;</code>
        (or backticks in the strings a table renders through
        <code>RichText</code>), never bare text.
      </li>
    </ul>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import RichText from "../../components/RichText.vue";
import pkg from "~~/package.json";
import { stackOf } from "~~/shared/stack";

const stack = stackOf(pkg);

const env = [
  {
    name: "NUXT_PUBLIC_SITE_URL",
    use: "Optional canonical origin for canonical and Open Graph URLs and the sitemap; otherwise each request's own origin.",
  },
];

const commands = [
  {
    cmd: "pnpm dev / build / start / preview",
    does: "Dev server, production build, run the build, preview it.",
  },
  {
    cmd: "pnpm test / test:run / test:coverage",
    does: "Vitest in watch mode, once, or with coverage.",
  },
  {
    cmd: "pnpm lint / format / type-check",
    does: "ESLint and Prettier (both rewrite files: `--fix`, `--write`), and `tsc --noEmit`.",
  },
  {
    cmd: "pnpm test:e2e",
    does: "Build, then run the Playwright browser tests in `e2e/` in Chromium, Firefox and WebKit.",
  },
  {
    cmd: "pnpm test:e2e:dev",
    does: "Run the app with `nuxt dev` and fail on a Vue warning (`e2e-dev/`).",
  },
  { cmd: "pnpm check-qa", does: "Lint, format, type-check, build and test." },
  {
    cmd: "pnpm docs:sync / docs:check",
    does: "Fill, or verify, the README's generated regions.",
  },
];
</script>
