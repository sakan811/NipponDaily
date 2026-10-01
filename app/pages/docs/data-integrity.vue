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
        Data Integrity & Attribution
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300 text-lg">
        NipponDaily teaches Japanese, so a wrong reading, meaning or origin is a
        bug. Every word's reading, level and meaning traces to a licensed
        dictionary, every origin claim to a quoted line of a pinned Wiktionary
        revision, and the tests check both against committed evidence.
      </p>

      <h2
        id="data-attribution"
        class="text-3xl font-serif font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        1. Data & Sources
      </h2>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-2 text-left font-bold">Data</th>
              <th class="py-2 px-2 text-left font-bold">Source</th>
              <th class="py-2 px-2 text-left font-bold">Lives in</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-2 align-top">JLPT vocabulary (N5–N2)</td>
              <td class="py-2 px-2">
                <a
                  href="https://github.com/elzup/jlpt-word-list"
                  target="_blank"
                  rel="noopener"
                  >elzup/jlpt-word-list</a
                >
                (one CSV per level), cross-referenced against
                <a
                  href="https://github.com/scriptin/jmdict-simplified"
                  target="_blank"
                  rel="noopener"
                  >JMdict</a
                >
                for part of speech
              </td>
              <td class="py-2 px-2 font-mono text-xs align-top">
                Redis: n5:vocab:* (N4–N2: n5:vocab:N4:* …)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">JLPT kanji (N5–N2)</td>
              <td class="py-2 px-2">
                The unique kanji in each level's vocab list, enriched from
                KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings)
              </td>
              <td class="py-2 px-2 font-mono text-xs align-top">
                Redis: n5:kanji:* (N4–N2: n5:kanji:N4:* …)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 align-top">Daily words</td>
              <td class="py-2 px-2">
                Hand-written; origin claims quote
                <a
                  href="https://en.wiktionary.org"
                  target="_blank"
                  rel="noopener"
                  >English Wiktionary</a
                >
                through a snapshot pinned per revision id
              </td>
              <td class="py-2 px-2 font-mono text-xs align-top">
                data/words/YYYY-MM.json (not in Redis)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 season-box">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          The Data Pipeline, End to End (Zoomable)
        </h3>
        <MermaidDiagram id="data-pipeline-diag" :code="dataPipelineDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          Top: what the site serves. Bottom: an independent offline snapshot the
          top is checked against in CI.
        </p>
      </div>

      <ol
        class="list-decimal pl-6 space-y-3 mb-8 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Seed.</strong> <code>pnpm seed</code>
          (<code>scripts/seed-pool-data.mjs</code>) reads each level's word list
          and a pinned JMdict + KANJIDIC2 release, derives
          <code>romaji</code> with <code>wanakana</code>, and writes the pool to
          Redis. It never runs at request time.
        </li>
        <li>
          <strong>Serve, with corrections.</strong>
          <code>server/services/pool-data.ts</code> reads the pool back and
          applies <code>servedVocab()</code> from
          <code>shared/meanings.ts</code> to vocab: form corrections for words
          the source list gets wrong and fuller meanings (早い as “early; quick,
          soon”). Fixes ship with no re-seed.
        </li>
        <li>
          <strong>Snapshot the evidence.</strong>
          <code>pnpm data:reference</code> (N5) and
          <code>pnpm data:reference:jlpt</code> (N4–N2) rebuild committed
          JMdict/KANJIDIC2 snapshots
          (<code>data/reference/n5-reference.json</code>, with
          <code>n4</code>–<code>n2</code> alongside) from the same word-list
          commits and a checksum-verified
          <code>jamdict-data</code> release. The two builds are independent, so
          a mistake in one can't hide in the other.
        </li>
        <li>
          <strong>Pin the origins.</strong>
          <code>pnpm data:etymology</code> commits the plain text of each daily
          word's Wiktionary <em>Etymology</em> section to
          <code>data/reference/etymology-reference.json</code>, each page pinned
          to a revision id.
        </li>
      </ol>

      <div
        class="p-4 season-box bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm"
      >
        <p class="font-semibold mb-2">Attribution</p>
        <p class="mb-2">
          JMdict and KANJIDIC2 are property of the
          <a href="https://www.edrdg.org/" target="_blank" rel="noopener"
            >Electronic Dictionary Research and Development Group</a
          >, used under CC BY-SA 4.0 via the
          <a
            href="https://github.com/scriptin/jmdict-simplified"
            target="_blank"
            rel="noopener"
            >jmdict-simplified</a
          >
          JSON releases.
        </p>
        <p class="mb-2">
          Etymology text is quoted from
          <a href="https://en.wiktionary.org" target="_blank" rel="noopener"
            >English Wiktionary</a
          >
          under
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener"
            >CC BY-SA 4.0</a
          >. Each entry links the exact revision it quotes, and the entries' own
          prose is NipponDaily's paraphrase, shared under the same license.
        </p>
        <p class="m-0">
          The word lists come from the community list originally compiled at
          tanos.co.uk, via elzup/jlpt-word-list (MIT licence).
          <code>romaji</code> is derived with
          <a
            href="https://github.com/WaniKani/WanaKana"
            target="_blank"
            rel="noopener"
            >wanakana</a
          >
          (MIT licence).
        </p>
      </div>

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. Content-Accuracy CI Checks
      </h2>

      <p class="mb-6">
        The dictionary pool lives in Redis, where no test can see it, and
        etymology isn't in a dictionary at all. So the evidence is committed to
        the repo and the content tests (<code>test/content/</code>, their own
        Vitest project, run by <code>pnpm test</code> in CI) check every
        hand-written fact against it.
      </p>

      <ul class="list-disc pl-6 mb-6 space-y-3">
        <li>
          <strong>Every served word, at every level</strong>
          (<code>vocabulary.test.ts</code>, mirrored for N4/N3/N2):
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>
              is in JMdict <em>with that reading</em> (single-kanji affixes like
              ～月 may use a KANJIDIC2 reading instead);
            </li>
            <li>has no meaning that reverses JMdict's (this ↔ that…);</li>
            <li>
              has its reading attested by JMdict
              (<code>reading-attested.test.ts</code>);
            </li>
            <li>
              has rōmaji that matches speech (<code>romaji.test.ts</code>), so
              particle は is told apart from the letter は (では is
              <code>dewa</code>);
            </li>
            <li>
              has every enrichment in <code>shared/meanings.ts</code> backed by
              JMdict (each <code>;</code>-separated sense shares a content word
              with a JMdict gloss), and a reference snapshot that is not stale.
            </li>
          </ul>
        </li>
        <li>
          <strong>Every daily-word entry</strong>
          (<code>words.test.ts</code>):
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>
              is a real pool word whose reading, level and meaning equal what
              the pool serves;
            </li>
            <li>
              has morphemes whose readings join to the word's reading, or to a
              declared <code>partsReading</code> that is the word's other pool
              reading or is romanized in the cited text;
            </li>
            <li>
              gives each single-kanji morpheme a reading KANJIDIC2 lists and a
              gloss that KANJIDIC2 or the cited text backs (other morphemes need
              the cited text); ateji and archaic forms are marked
              <code>irregular</code>;
            </li>
            <li>
              cites at least one source, and every quote is found
              <strong>verbatim</strong> in that word's pinned Wiktionary text at
              the revision the entry names;
            </li>
            <li>mentions only Japanese its evidence or the pool contains;</li>
            <li>
              carries an uncertainty note whenever it is tagged
              <code>unclear</code>, and no snapshot pin outlives its entry.
            </li>
          </ul>
        </li>
      </ul>

      <div
        class="my-8 p-4 season-box border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
      >
        <strong>What these checks cannot prove:</strong> that a quote is
        <em>true</em> (only that Wiktionary says it, at that revision), or that
        an English sentence about a real word is correct. Prose is reviewed in
        PRs, and where sources disagree the entry says so instead of choosing.
      </div>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        When a check fails
      </h3>

      <ul class="list-disc pl-6 mb-6 space-y-3">
        <li>
          <strong>A word isn't in JMdict, or its rōmaji is wrong</strong> → add
          an entry to <code>VOCAB_FORM_CORRECTIONS</code> in
          <code>shared/meanings.ts</code>, then run
          <code>pnpm data:reference</code> (or
          <code>pnpm data:reference:jlpt</code> for N4–N2).
        </li>
        <li>
          <strong>A meaning isn't backed</strong> → reword it to match JMdict or
          drop the sense; don't widen the checker.
        </li>
        <li>
          <strong>A quote isn't found</strong> → copy it again from the
          snapshot, or run
          <code>pnpm data:etymology --refresh &lt;term&gt;</code> if the page
          was edited and you mean to re-pin it. Never loosen a quote.
        </li>
        <li>
          <strong>A morpheme's reading or gloss isn't backed</strong> → correct
          it, or mark it <code>irregular</code> and say why in the story.
        </li>
        <li>
          <strong>The prose mentions Japanese no evidence contains</strong> →
          remove it, or add the source line that supports it.
        </li>
      </ul>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        Updating the evidence
      </h3>

      <p class="mb-6">
        The sources are pinned in three places:
        <code>WORD_LIST_SOURCES</code> in
        <code>scripts/word-list-source.mjs</code> (shared by the seed and both
        reference builders, so they always read the same word lists),
        <code>JAMDICT_SOURCE</code> in <code>scripts/lib/jamdict.mjs</code>
        (the reference builders) and
        <code>JMDICT_SIMPLIFIED_RELEASE_TAG</code> in
        <code>scripts/seed-pool-data.mjs</code> (the seed). After moving a pin,
        run <code>pnpm seed</code>, <code>pnpm data:reference</code> and
        <code>pnpm data:reference:jlpt</code> together and review the diffs. The
        reference builders need Node 22.13 or newer (<code>node:sqlite</code>)
        plus <code>tar</code> and <code>xz</code>.
      </p>

      <p class="mb-6">
        Wiktionary pins are each term's <code>revid</code> in the snapshot. To
        add a month, write <code>data/words/YYYY-MM.json</code>, register it in
        <code>shared/words.ts</code> and run <code>pnpm data:etymology</code>:
        new terms are fetched at their current revision, existing ones at their
        pin. Re-pin one deliberately with
        <code>pnpm data:etymology --refresh &lt;term&gt;</code> and review the
        diff.
      </p>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";

const dataPipelineDiagram = `
flowchart TD
    subgraph LIVE["Live pool — what the site serves"]
        direction TB
        WordList["elzup/jlpt-word-list
n5–n2 CSVs @ pinned commits"]
        JMdictLatest["JMdict + KANJIDIC2
(jmdict-simplified, pinned release tag)"]
        Seed["pnpm seed
scripts/seed-pool-data.mjs"]
        Pool[("Redis pool
n5:vocab:* · n5:kanji:*
(N4–N2 namespaced)")]
        Served["PoolDataService
server/services/pool-data.ts
(vocab also runs servedVocab()
from shared/meanings.ts)"]
        VocabAPI["GET /api/pool-vocab"]
        KanjiAPI["GET /api/pool-kanji"]
        Words["data/words/*.json
daily-word entries (hand-written)"]
        WordAPI["GET /api/daily-word
GET /api/word-calendar"]

        WordList --> Seed
        JMdictLatest --> Seed
        Seed -- "romaji via wanakana,
cross-referenced readings + POS" --> Pool
        Pool --> Served
        Served --> VocabAPI
        Served --> KanjiAPI
        Words --> WordAPI
    end

    subgraph TRUTH["Ground truth — checked independently in CI"]
        direction TB
        SamePin["scripts/word-list-source.mjs
(same pinned commits as Seed)"]
        Jamdict["jamdict-data
checksum-verified JMdict/KANJIDIC2"]
        RefBuild["pnpm data:reference
pnpm data:reference:jlpt"]
        RefJSON["data/reference/n{5,4,3,2}-reference.json
(committed snapshots)"]
        Wikt["English Wiktionary
Japanese Etymology sections"]
        EtyBuild["pnpm data:etymology
pinned per revision id"]
        EtyJSON["data/reference/etymology-reference.json
(committed snapshot)"]
        ContentTests["test/content/*
vocabulary · romaji · words"]

        SamePin --> RefBuild
        Jamdict --> RefBuild
        RefBuild --> RefJSON
        Wikt --> EtyBuild
        EtyBuild --> EtyJSON
        RefJSON --> ContentTests
        EtyJSON --> ContentTests
    end

    WordList -. "same pinned commit" .-> SamePin
    Served -. "same servedVocab()
corrections, verified" .-> ContentTests
    Words -. "readings, meanings,
morphemes, quotes, prose" .-> ContentTests
    ContentTests --> CI{"pnpm test (CI)"}
    CI -- "wrong reading, meaning,
quote or invented word found" --> Fail(["❌ CI fails"])
    CI -- "every entry checks out" --> Pass(["✅ CI passes"])

    WordAPI --> Pages["/ · /words · /words/[date]"]
`;
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

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
