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
        bug that teaches people something false. Every word's reading, level and
        meaning traces back to a licensed dictionary source, every origin claim
        traces to a quoted line of a pinned Wiktionary revision, and CI checks
        all of it before a change can merge.
      </p>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- N5 DATA & SOURCES                                                  -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        id="data-attribution"
        class="text-3xl font-serif font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        1. Data & Sources
      </h2>

      <p class="text-lg mb-6">
        Each JLPT level's kanji and vocabulary (N5 through N2) are static
        reference data — they don't change day to day, so they're seeded once
        (or re-seeded occasionally, e.g. to deliberately bump the pinned JMdict
        release) by a standalone script rather than by any agent or request:
        <code>pnpm seed</code> (<code>scripts/seed-pool-data.mjs</code>). The
        daily words themselves are different: they're hand-written in-repo data
        (<code>data/words/YYYY-MM.json</code>), drawn from that pool, with their
        origin claims backed by a second, separately pinned source.
      </p>

      <div
        class="p-4 mb-8 season-box bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
      >
        <p class="m-0 text-blue-900 dark:text-blue-100 text-sm">
          <strong>All four levels are covered:</strong> the ground-truth
          reference and the CI content checks cover <strong>N5</strong>,
          <strong>N4</strong>, <strong>N3</strong> and
          <strong>N2</strong> (<code>test/content/</code> for N5,
          <code>test/content/n4/</code>, <code>test/content/n3/</code> and
          <code>test/content/n2/</code> for the rest — same checks, each against
          its own committed reference snapshot, built by
          <code>pnpm data:reference</code> and
          <code>pnpm data:reference:jlpt</code>). On top of those,
          <code>test/content/words.test.ts</code> checks every daily-word entry
          against that same evidence plus the Wiktionary snapshot built by
          <code>pnpm data:etymology</code> — see Section 2.
        </p>
      </div>

      <!-- Diagram: N5 Data Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 season-box">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          The Data Pipeline, End to End (Zoomable)
        </h3>
        <MermaidDiagram id="data-pipeline-diag" :code="dataPipelineDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          Left: what the site actually serves. Right: an independent, offline
          snapshot the left side is checked against in CI.
        </p>
      </div>

      <p class="mb-4">
        There are really two pipelines here, built from the same sources but run
        completely separately, so a mistake in one can't hide the same mistake
        in the other — plus a third source, Wiktionary, for the origin claims:
      </p>

      <ol
        class="list-decimal pl-6 space-y-3 mb-8 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Seed the pool.</strong> <code>pnpm seed</code> fetches the N5
          word list (a pinned commit of <code>elzup/jlpt-word-list</code>, via
          <code>scripts/word-list-source.mjs</code>) plus a pinned JMdict +
          KANJIDIC2 release (<code>JMDICT_SIMPLIFIED_RELEASE_TAG</code> in
          <code>scripts/seed-pool-data.mjs</code>), cross-references every word
          for its reading and part of speech, derives every kana/word's
          <code>romaji</code> with <code>wanakana</code>, and writes the whole
          pool into Redis (<code>n5:vocab:*</code>, <code>n5:kanji:*</code>,
          <code>n5:hiragana:*</code>, <code>n5:katakana:*</code>). This runs
          once, offline — never at request time.
        </li>
        <li>
          <strong>Serve it, with corrections.</strong>
          <code>PoolDataService</code>
          (<code>server/services/pool-data.ts</code>) reads the pool straight
          from Redis, then applies <code>shared/meanings.ts</code>'s
          <code>servedVocab()</code> — form corrections for the rare word the
          source list simply gets wrong (e.g. ラジオカセ → the real word,
          ラジカセ), and fuller meaning enrichments (早い as "early; quick,
          soon", not just "early"). This runs on every read, so a fix ships
          instantly with no re-seed. <code>GET /api/pool-vocab</code> and
          <code>GET /api/pool-kanji</code> both read through this corrected
          layer, and a daily word's <code>meaning</code> must equal what it
          serves.
        </li>
        <li>
          <strong>Check it, independently.</strong> Because the pool only exists
          inside Redis at runtime, no test could otherwise see it — so a second,
          completely offline pipeline exists purely to keep the first one
          honest.
          <code>pnpm data:reference</code>
          (<code>scripts/build-n5-reference.mjs</code>) reads the
          <em>same</em> pinned word-list commit plus a checksum-verified
          <code>jamdict-data</code> release, and writes a committed snapshot,
          <code>data/reference/n5-reference.json</code>. On every CI run,
          <code>test/content/</code> checks every word the site actually serves
          — reading, rōmaji, meaning, part of speech — against that snapshot: a
          wrong reading, a reversed meaning ("this" vs. "that"), or a rōmaji
          that doesn't match how the word is really pronounced all fail the
          build before they can merge. See Section 2 below for the full story.
        </li>
        <li>
          <strong>Quote the origin, pinned.</strong>
          <code>pnpm data:etymology</code>
          (<code>scripts/build-etymology-reference.mjs</code>) fetches the
          Japanese <em>Etymology</em> sections of English Wiktionary for every
          daily word and commits their plain text to
          <code>data/reference/etymology-reference.json</code>, each page pinned
          to one <strong>revision id</strong> so it can't change underneath us.
          A word already pinned is re-fetched at that exact revision; moving a
          pin is a deliberate <code>--refresh</code>.
        </li>
      </ol>

      <div
        class="my-8 p-4 season-box border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3"
      >
        <UIcon
          name="i-heroicons-information-circle"
          class="text-blue-500 w-6 h-6 shrink-0 mt-0.5"
        />
        <div>
          <p class="m-0 text-blue-900 dark:text-blue-100 font-semibold mb-1">
            Why the same pin appears twice
          </p>
          <p class="m-0 text-blue-800 dark:text-blue-200 text-sm">
            <code>scripts/seed-pool-data.mjs</code> and
            <code>scripts/build-n5-reference.mjs</code> both import their N5
            word-list commit from one shared file,
            <code>scripts/word-list-source.mjs</code>, instead of each
            hardcoding their own. If they ever read different commits, a change
            upstream could land in a freshly-seeded pool before the ground-truth
            snapshot had any evidence for it — a wrong word could ship and CI
            would have nothing to catch it with. Importing the same pin from
            both makes that impossible: the live seed and the committed evidence
            always read the exact same bytes.
          </p>
          <p class="m-0 mt-2 text-blue-800 dark:text-blue-200 text-sm">
            The JMdict + KANJIDIC2 pin is deliberately <em>not</em> shared the
            same way: <code>seed-pool-data.mjs</code> pins a
            <code>jmdict-simplified</code> release tag
            (<code>JMDICT_SIMPLIFIED_RELEASE_TAG</code>) and
            <code>build-n5-reference.mjs</code> pins a checksum-verified
            <code>jamdict-data</code> release (<code>JAMDICT_SOURCE</code>) —
            two independent builds of the same EDRDG data. Bump either one on
            its own schedule; just re-run both scripts and review the diffs
            after moving either pin.
          </p>
        </div>
      </div>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-2 text-left font-bold">Data</th>
              <th class="py-2 px-2 text-left font-bold">Source</th>
              <th class="py-2 px-2 text-left font-bold">Redis keys</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-2">JLPT vocabulary (N5–N2)</td>
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
              <td class="py-2 px-2 font-mono text-xs">
                n5:vocab:* (N4–N2: n5:vocab:N4:* …)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2">JLPT kanji (N5–N2)</td>
              <td class="py-2 px-2">
                Derived from the unique kanji in each level's vocab list,
                enriched from KANJIDIC2 (on'yomi, kun'yomi, stroke count,
                meanings)
              </td>
              <td class="py-2 px-2 font-mono text-xs">
                n5:kanji:* (N4–N2: n5:kanji:N4:* …)
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2">Daily words</td>
              <td class="py-2 px-2">
                Hand-written entries in <code>data/words/YYYY-MM.json</code>;
                origin claims quote
                <a
                  href="https://en.wiktionary.org"
                  target="_blank"
                  rel="noopener"
                  >Wiktionary</a
                >
                via a pinned snapshot
              </td>
              <td class="py-2 px-2 font-mono text-xs">
                none — in-repo, not in Redis
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="p-4 season-box bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm"
      >
        <p class="font-semibold mb-2">Attribution</p>
        <p class="mb-2">
          JMdict and KANJIDIC2 are property of the
          <a href="https://www.edrdg.org/" target="_blank" rel="noopener"
            >Electronic Dictionary Research and Development Group</a
          >, used in conformance with the Group's licence (CC BY-SA 4.0).
          Accessed via the
          <a
            href="https://github.com/scriptin/jmdict-simplified"
            target="_blank"
            rel="noopener"
            >jmdict-simplified</a
          >
          project's pre-parsed JSON releases.
        </p>
        <p class="mb-2">
          Etymology text is quoted from
          <a href="https://en.wiktionary.org" target="_blank" rel="noopener"
            >English Wiktionary</a
          >, available under
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener"
            >CC BY-SA 4.0</a
          >. Each entry links the exact revision it quotes, and the committed
          snapshot (<code>data/reference/etymology-reference.json</code>) keeps
          every page's permalink and the license in its metadata. The entries'
          own prose is NipponDaily's paraphrase of that evidence and is shared
          under the same license.
        </p>
        <p class="m-0 mb-2">
          The JLPT word lists are digitized from the community-standard list
          originally compiled at tanos.co.uk, via
          <a
            href="https://github.com/elzup/jlpt-word-list"
            target="_blank"
            rel="noopener"
            >elzup/jlpt-word-list</a
          >
          (MIT licence).
        </p>
        <p class="m-0">
          <code>romaji</code> for the kana is derived via
          <a
            href="https://github.com/WaniKani/WanaKana"
            target="_blank"
            rel="noopener"
            >wanakana</a
          >
          (MIT licence). Since that community word list occasionally carries a
          wrong English gloss, <code>scripts/seed-pool-data.mjs</code>
          cross-checks each entry's meaning against JMdict's own gloss for the
          same word and reading, and flags any that look like a swapped antonym
          (e.g. "this way" vs. "that way") for manual review at seed time —
          confirmed errors are corrected in that script's
          <code>VOCAB_MEANING_OVERRIDES</code>.
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- CONTENT-ACCURACY CI CHECKS                                         -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        class="text-3xl font-serif font-bold mt-16 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        2. Content-Accuracy CI Checks
      </h2>

      <p class="text-lg mb-6">
        Every accuracy bug so far had the same cause: a fact was
        <strong>written by hand</strong> (or copied from a community word list)
        and <strong>nothing checked it</strong>, because the dictionary data it
        depended on only existed inside Redis, where no test could see it. The
        fix is structural: the dictionary evidence above is committed to the
        repo, and CI checks every hand-written fact against it on every PR. A
        wrong entry fails CI before it can merge.
      </p>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        The pieces
      </h3>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-2 text-left font-bold">Piece</th>
              <th class="py-2 px-2 text-left font-bold">What it is</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>data/reference/n5-reference.json</code>
              </td>
              <td class="py-2 px-2">
                Committed, versioned dictionary evidence: JMdict entries
                (readings, senses, glosses, part of speech) for every N5 word as
                the site serves it, and KANJIDIC2 readings/meanings for every
                kanji the content uses. Generated — never edit by hand. N4, N3
                and N2 have their own files, built by
                <code>pnpm data:reference:jlpt</code>.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>pnpm data:reference</code>
              </td>
              <td class="py-2 px-2">
                Rebuilds that file from <strong>pinned</strong> sources
                (checksum-verified <code>jamdict-data</code> for
                JMdict/KANJIDIC2, and the N5 word list at a fixed commit). Same
                input → same output.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>test/content/</code>
              </td>
              <td class="py-2 px-2">
                The content-truth tests (their own Vitest project, run by
                <code>pnpm test:run</code> and CI).
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>shared/meanings.ts</code>
              </td>
              <td class="py-2 px-2">
                The only place to correct or enrich what a word says:
                <code>VOCAB_FORM_CORRECTIONS</code> (wrong written form/reading
                in the source list) and
                <code>VOCAB_MEANING_ENRICHMENTS</code> (fuller meanings).
                Applied at read time with ids unchanged — no re-seed needed.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>data/words/*.json</code>
              </td>
              <td class="py-2 px-2">
                The daily-word entries, one file per month. Every field is
                checked by <code>test/content/words.test.ts</code>.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                <code>data/reference/etymology-reference.json</code>
              </td>
              <td class="py-2 px-2">
                The pinned Wiktionary etymology text the entries quote, with
                each page's revision id, permalink and license. Generated by
                <code>pnpm data:etymology</code> — never edit by hand.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        What CI checks
      </h3>

      <ul class="list-disc pl-6 mb-6 space-y-3">
        <li>
          <strong>Every served word, at every level</strong>
          (<code>vocabulary.test.ts</code>, mirrored for N4/N3/N2):
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>
              is a real JMdict word <em>with that reading</em> (single-kanji
              affixes like ～月 may use a KANJIDIC2 reading instead);
            </li>
            <li>
              has no meaning that reverses JMdict's (this ↔ that, come ↔ go…);
            </li>
          </ul>
        </li>
        <li>
          <strong>Word-card rōmaji</strong> (<code>romaji.test.ts</code>) — the
          seed converts kana to rōmaji letter by letter, which is wrong wherever
          は/へ/を are particles (では is <code>dewa</code>, not
          <code>deha</code>). Each word's written form is tokenized so particle
          は (pronounced わ) is told apart from the letter は (歯
          <code>ha</code>), and every served rōmaji must match the spoken form.
          Fix a failure with a <code>romaji</code> entry in
          <code>VOCAB_FORM_CORRECTIONS</code>.
        </li>
        <li>
          <strong>Every hand-written meaning</strong> — enrichments, seed-time
          overrides, and corrections — must be backed by JMdict: each
          <code>;</code>-separated sense has to share a content word with one of
          the word's JMdict glosses. Seed reading overrides must be JMdict
          readings; part-of-speech overrides must be JMdict tags.
        </li>
        <li>
          <strong>Every daily-word entry</strong>
          (<code>words.test.ts</code>):
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>
              is a real pool word, and its term, reading, level and meaning
              equal what the pool serves;
            </li>
            <li>
              has morphemes whose readings join to the word's reading — or,
              where sound change hides the join, to a declared
              <code>partsReading</code> that is either the word's other pool
              reading or romanized in the cited evidence;
            </li>
            <li>
              gives each single-kanji morpheme a reading KANJIDIC2 lists for
              that kanji and a gloss that KANJIDIC2 or the cited text backs;
              anything that breaks the rule (ateji, archaic forms) must say so
              with <code>irregular</code>;
            </li>
            <li>
              cites at least one source, and every quote is found
              <strong>verbatim</strong> in that word's pinned Wiktionary text,
              at the revision the entry names;
            </li>
            <li>
              mentions only Japanese its evidence (or the pool) contains — an
              invented word or form in the prose fails;
            </li>
            <li>
              carries a “not settled” note whenever it is tagged
              <em>Origin unclear</em>, and no snapshot pin outlives its entry.
            </li>
          </ul>
        </li>
        <li>
          <strong>Staleness</strong> — the reference must match
          <code>shared/meanings.ts</code>. Change a correction without
          rebuilding and CI tells you to run <code>pnpm data:reference</code>.
        </li>
      </ul>

      <p class="mb-6">
        The checkers test themselves too: the rōmaji checkers must
        <em>reject</em> known-wrong readings (三日 as <code>yokka</code>, 七時
        as <code>hachi-ji</code>), and the daily-word suite was verified by
        deliberately corrupting entries — a wrong kanji reading, a wrong
        meaning, an invented quote, an unbacked gloss, morphemes that don't join
        — and confirming each is caught.
      </p>

      <div
        class="my-8 p-4 season-box border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm"
      >
        <strong>What these checks cannot prove:</strong> that a quote is
        <em>true</em> (it only proves Wiktionary says it, at that revision), or
        that a sentence about a real word is correct — the Japanese-in-prose
        check rejects words that aren't real, not false statements about words
        that are. Entries are reviewed in PRs, and where the sources disagree
        the entry says so rather than choosing.
      </div>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        When a check fails
      </h3>

      <ul class="list-disc pl-6 mb-6 space-y-3">
        <li>
          <strong>A word isn't in JMdict</strong> → the source list is wrong.
          Add a <code>VOCAB_FORM_CORRECTIONS</code> entry in
          <code>shared/meanings.ts</code> with the correct form and a
          <code>reason</code> citing the JMdict entry id, then run
          <code>pnpm data:reference</code>.
        </li>
        <li>
          <strong>A word's rōmaji is wrong</strong> → add a
          <code>romaji</code> correction in
          <code>VOCAB_FORM_CORRECTIONS</code> (ids stay the same; no re-seed).
        </li>
        <li>
          <strong>A meaning isn't backed</strong> → reword it to match what
          JMdict says, or drop the sense. Don't widen the checker to let it
          through.
        </li>
        <li>
          <strong>A quote isn't found</strong> → copy it again from the
          snapshot's text
          (<code>data/reference/etymology-reference.json</code>), or run
          <code>pnpm data:etymology --refresh &lt;term&gt;</code> if the page
          was edited and you mean to re-pin it. Never loosen a quote to match.
        </li>
        <li>
          <strong>A morpheme's reading or gloss isn't backed</strong> → correct
          it, or, if it really is ateji or an archaic form, mark it
          <code>irregular</code> and say why in the story.
        </li>
        <li>
          <strong>The prose mentions Japanese no evidence contains</strong> →
          remove it, or add the source line that supports it.
        </li>
      </ul>

      <p class="mb-6">
        English prose itself can't be machine-verified. Keep factual claims in
        structured fields (morphemes, sources, meanings) where they are checked,
        and review prose in PRs.
      </p>

      <h3
        class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200"
      >
        Updating the evidence
      </h3>

      <p class="mb-6">
        The sources are pinned in three places:
        <code>JMDICT_SIMPLIFIED_RELEASE_TAG</code> in
        <code>scripts/seed-pool-data.mjs</code>, <code>JAMDICT_SOURCE</code> in
        <code>scripts/build-n5-reference.mjs</code>, and
        <code>WORD_LIST_SOURCE</code> in
        <code>scripts/word-list-source.mjs</code> — the last is imported by both
        <code>build-n5-reference.mjs</code> and <code>seed-pool-data.mjs</code>,
        so the live seed and the committed evidence always read the exact same
        N5 word list commit; they can't silently diverge. To move to newer data,
        bump the pin(s), run <code>pnpm seed</code> and
        <code>pnpm data:reference</code>
        together, and review both diffs in the PR — every changed reading or
        gloss is visible, and the content tests show whether any entry now
        disagrees with it. Requires Node ≥ 22 (<code>node:sqlite</code>) and
        <code>tar</code>/<code>xz</code> on PATH.
      </p>

      <p class="mb-6">
        The Wiktionary pins live in the snapshot itself: each term's
        <code>revid</code>. To add a month, write
        <code>data/words/YYYY-MM.json</code>, register it in
        <code>shared/words.ts</code>, and run <code>pnpm data:etymology</code> —
        new terms are fetched at their current revision and recorded, existing
        ones are re-fetched at their pin, so the output is deterministic. Re-pin
        a term deliberately with
        <code>pnpm data:etymology --refresh &lt;term&gt;</code> and review the
        diff. Wikimedia rate-limits anonymous requests, so the script paces
        itself and honors <code>Retry-After</code>.
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
        Served["PoolDataService + servedVocab()
server/services/pool-data.ts
shared/meanings.ts"]
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
    ContentTests --> CI{"pnpm test:run (CI)"}
    CI -- "wrong reading, meaning,
quote or invented word found" --> Fail(["❌ PR blocked"])
    CI -- "every entry checks out" --> Pass(["✅ Safe to merge"])

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
