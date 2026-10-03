<template>
  <DocsBook slug="development">
    <template #lede>
      Everything for working on the code: setup, environment, commands, tests,
      and the rules that keep these docs true. Use <strong>pnpm</strong> only.
    </template>

    <h2>Setup</h2>
    <p>Node 22 or newer (CI runs Node 25) and pnpm.</p>
    <pre><code>pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000</code></pre>
    <p>
      The daily words need no configuration. Redis is only used for the site's
      season; without it the season is kept in process memory. The data scripts
      (<code>scripts/build-*.mjs</code>) run as bare <code>node</code> and need
      no credentials.
    </p>

    <h2>Environment</h2>
    <p>
      See <code>.env.example</code>. All server-side config goes through
      <code>getEnvOrConfig</code> in <code>server/utils/config.ts</code>.
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
      The <code>data:*</code> commands are explained in
      <NuxtLink to="/docs/authoring">Adding and fixing words</NuxtLink>.
    </p>

    <h2>Tests</h2>
    <p>Vitest, three projects (<code>vitest.config.ts</code>).</p>
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
        handlers, the <code>shared/</code> modules, the data scripts and
        services. The word endpoints need no mock because they read in-repo
        data; their tests freeze the clock with <code>vi.useFakeTimers()</code>.
      </li>
      <li>
        <strong><code>test/content</code></strong> (fully offline): every entry
        and every word-list word against the committed snapshots (<NuxtLink
          to="/docs/data-integrity"
          >Data integrity</NuxtLink
        >).
      </li>
    </ul>
    <p>
      There are no integration tests. <code>pnpm test:run</code> passing does
      not prove the app builds: pages with no test are only exercised by
      <code>pnpm build</code>, so run it after deleting or renaming a component.
      CI (<code>.github/workflows/webpage-test.yml</code>) runs
      <code>pnpm run test</code> on pushes to <code>main</code> and on pull
      requests targeting it, on Node 25 with pnpm 10.
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
      <li><code>docs-sync</code>: the docs against the code (see below).</li>
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
        <code>shared/seasons.ts</code>, and the word range comes from
        <code>data/words/</code> (<code>GET /api/catalogue</code>). The pages
        read them; never type a source URL, a licence name, a route list or a
        word count into a chapter.
      </li>
      <li>
        <strong><code>pnpm docs:sync</code></strong> fills the one generated
        region left in the repo, the attribution in the README (between
        <code>&lt;!-- docs:begin … --&gt;</code> markers, never edited by hand).
        <code>pnpm docs:check</code> fails if it is stale.
      </li>
      <li>
        <strong>Change a behaviour, change its chapter</strong> in the same
        commit. <code>test/server/docs-sync.test.ts</code> catches a hand-typed
        range or count, a source URL or licence, a route that doesn't exist, a
        <code>pnpm</code> command that isn't a script, a path in
        <code>&lt;code&gt;</code> that isn't in the repo, and a chapter list
        that disagrees with the page files.
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

const env = [
  {
    name: "UPSTASH_REDIS_REST_URL",
    use: "Upstash Redis REST URL, storing the active site theme. Not needed for the words.",
  },
  { name: "UPSTASH_REDIS_REST_TOKEN", use: "Upstash Redis REST token." },
  {
    name: "CRON_SECRET",
    use: "Bearer token `GET /api/cron/update-season` requires (Vercel sends it on cron requests). Generate with `openssl rand -hex 32`. Unset, the endpoint answers `401`.",
  },
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
  { cmd: "pnpm generate", does: "Static site generation." },
  {
    cmd: "pnpm test / test:run / test:coverage",
    does: "Vitest in watch mode, once, or with coverage.",
  },
  {
    cmd: "pnpm lint / format / type-check",
    does: "ESLint (auto-fix), Prettier, `tsc --noEmit`.",
  },
  { cmd: "pnpm check-qa", does: "Lint, format, type-check, build and test." },
  {
    cmd: "pnpm data:reference / data:reference:jlpt",
    does: "Rebuild the JMdict and KANJIDIC2 snapshots for N5, and for N4 to N2.",
  },
  { cmd: "pnpm data:etymology", does: "Pin Wiktionary pages." },
  {
    cmd: "pnpm data:words",
    does: "Generate `data/words/` from the plan and the committed sources.",
  },
  {
    cmd: "pnpm docs:sync / docs:check",
    does: "Fill, or verify, the README's generated attribution.",
  },
];
</script>
