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
        NipponDaily teaches Japanese, so a wrong reading or meaning is a bug
        that teaches people something false. Every kanji, kana, and
        vocabulary word served by the game traces back to a licensed
        dictionary source, and every hand-written fact about that content is
        checked by CI against committed dictionary evidence before it can
        merge.
      </p>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- N5 DATA & SOURCES                                                  -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <h2
        id="data-attribution"
        class="text-3xl font-serif font-bold mt-12 mb-6 text-primary-500 border-b border-gray-200 dark:border-gray-800 pb-2"
      >
        1. N5 Data & Sources
      </h2>

      <p class="text-lg mb-6">
        Hiragana, katakana, N5 kanji, and N5 vocabulary are static reference
        data — they don't change day to day, so they're seeded once (or
        re-seeded occasionally, e.g. to pick up a newer JMdict release) by a
        standalone script rather than by any agent or request:
        <code>pnpm seed:n5</code> (<code>scripts/seed-n5-data.mjs</code>).
      </p>

      <!-- Diagram: N5 Data Pipeline -->
      <div class="my-10 bg-stone-50 dark:bg-stone-900/50 p-4 season-box">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          The N5 Data Pipeline, End to End (Zoomable)
        </h3>
        <MermaidDiagram id="n5-pipeline-diag" :code="n5PipelineDiagram" />
        <p class="text-center text-xs text-gray-500 mt-4 italic">
          Left: what the site actually serves. Right: an independent, offline
          snapshot the left side is checked against in CI.
        </p>
      </div>

      <p class="mb-4">
        There are really two pipelines here, built from the same sources but run
        completely separately, so a mistake in one can't hide the same mistake
        in the other:
      </p>

      <ol
        class="list-decimal pl-6 space-y-3 mb-8 text-gray-700 dark:text-gray-300"
      >
        <li>
          <strong>Seed the pool.</strong> <code>pnpm seed:n5</code> fetches the
          N5 word list (a pinned commit of <code>elzup/jlpt-word-list</code>,
          via <code>scripts/n5-word-list-source.mjs</code>) plus the latest
          JMdict + KANJIDIC2 release, cross-references every word for its
          reading and part of speech, derives every kana/word's
          <code>romaji</code> with <code>wanakana</code>, and writes the whole
          pool into Redis (<code>n5:vocab:*</code>, <code>n5:kanji:*</code>,
          <code>n5:hiragana:*</code>, <code>n5:katakana:*</code>). This runs
          once, offline — never at request time.
        </li>
        <li>
          <strong>Serve it, with corrections.</strong>
          <code>N5DataService</code> (<code>server/services/n5-data.ts</code>)
          reads the pool straight from Redis, then applies
          <code>shared/meanings.ts</code>'s <code>servedVocab()</code> — form
          corrections for the rare word the source list simply gets wrong (e.g.
          ラジオカセ → the real word, ラジカセ), and fuller meaning enrichments
          (早い as "early; quick, soon", not just "early"). This runs on every
          read, so a fix ships instantly with no re-seed.
          <code>GET /api/n5-vocab</code>, <code>GET /api/n5-kanji</code>, and
          the daily game's <code>buildDailyGame()</code> all read through this
          same corrected layer, so the game, the <code>/vocab</code> guide, and
          the <code>/learn</code> lesson path never disagree about what a word
          means.
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
            <code>scripts/seed-n5-data.mjs</code> and
            <code>scripts/build-n5-reference.mjs</code> both import their N5
            word-list commit from one shared file,
            <code>scripts/n5-word-list-source.mjs</code>, instead of each
            hardcoding their own. If they ever read different commits, a change
            upstream could land in a freshly-seeded pool before the ground-truth
            snapshot had any evidence for it — a wrong word could ship and CI
            would have nothing to catch it with. Importing the same pin from
            both makes that impossible: the live seed and the committed evidence
            always read the exact same bytes.
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
              <td class="py-2 px-2">Hiragana / Katakana</td>
              <td class="py-2 px-2">
                Hardcoded (fixed, unchanging syllabaries — not dictionary
                content); <code>romaji</code> derived via
                <a
                  href="https://github.com/WaniKani/WanaKana"
                  target="_blank"
                  rel="noopener"
                  >wanakana</a
                >
              </td>
              <td class="py-2 px-2 font-mono text-xs">
                n5:hiragana:*, n5:katakana:*
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2">N5 vocabulary</td>
              <td class="py-2 px-2">
                <a
                  href="https://github.com/elzup/jlpt-word-list"
                  target="_blank"
                  rel="noopener"
                  >elzup/jlpt-word-list</a
                >
                (N5-tagged words), cross-referenced against
                <a
                  href="https://github.com/scriptin/jmdict-simplified"
                  target="_blank"
                  rel="noopener"
                  >JMdict</a
                >
                for part of speech
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:vocab:*</td>
            </tr>
            <tr>
              <td class="py-2 px-2">N5 kanji</td>
              <td class="py-2 px-2">
                Derived from the unique kanji in the N5 vocab list, enriched
                from KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings)
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:kanji:*</td>
            </tr>
            <tr>
              <td class="py-2 px-2">Daily games</td>
              <td class="py-2 px-2">
                Generated deterministically from the pool by
                <code>GET /api/daily-game</code> the first time each date is
                requested
              </td>
              <td class="py-2 px-2 font-mono text-xs">n5:daily_game:*</td>
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
        <p class="m-0 mb-2">
          The N5-level word list is digitized from the community-standard list
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
          <code>romaji</code> for the hiragana/katakana pool is derived via
          <a
            href="https://github.com/WaniKani/WanaKana"
            target="_blank"
            rel="noopener"
            >wanakana</a
          >
          (MIT licence). Since that community word list occasionally carries a
          wrong English gloss, <code>scripts/seed-n5-data.mjs</code>
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
        <strong>written by hand</strong> (or copied from a community word
        list) and <strong>nothing checked it</strong>, because the dictionary
        data it depended on only existed inside Redis, where no test could see
        it. The fix is structural: the dictionary evidence above is committed
        to the repo, and CI checks every hand-written fact against it on every
        PR. A wrong lesson fails CI before it can merge.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200">
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
                data/reference/n5-reference.json
              </td>
              <td class="py-2 px-2">
                Committed, versioned dictionary evidence: JMdict entries
                (readings, senses, glosses, part of speech) for every N5 word
                as the site serves it, JMdict readings for every word in the
                example sentences, and KANJIDIC2 readings/meanings for every
                kanji the content uses. Generated — never edit by hand.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                pnpm data:reference
              </td>
              <td class="py-2 px-2">
                Rebuilds that file from <strong>pinned</strong> sources
                (checksum-verified <code>jamdict-data</code> for
                JMdict/KANJIDIC2, and the N5 word list at a fixed commit).
                Same input → same output.
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                test/content/
              </td>
              <td class="py-2 px-2">
                The content-truth tests (their own Vitest project, run by
                <code>pnpm test:run</code> and CI).
              </td>
            </tr>
            <tr>
              <td class="py-2 px-2 font-mono text-xs align-top">
                shared/meanings.ts
              </td>
              <td class="py-2 px-2">
                The only place to correct or enrich what a word says:
                <code>VOCAB_FORM_CORRECTIONS</code> (wrong written
                form/reading in the source list) and
                <code>VOCAB_MEANING_ENRICHMENTS</code> (fuller meanings).
                Applied at read time with ids unchanged — no re-seed needed.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200">
        What CI checks
      </h3>

      <ul class="list-disc pl-6 mb-6 space-y-3">
        <li>
          <strong>Example sentences</strong> (<code>examples.test.ts</code>)
          — every example's rōmaji must be a valid reading of its Japanese.
          The sentence is tokenized (kuromoji), and the rōmaji must be spelled
          by one reading per word, where each word may use the tokenizer's
          reading <em>or any reading JMdict lists for it</em>. So 七時 can be
          <code>shichi-ji</code> or <code>nana-ji</code>, but a wrong reading,
          the wrong word, or a typo fails. Use wāpuro rōmaji (<code
            >ou</code
          >, <code>ei</code>, no macrons).
        </li>
        <li>
          <strong>Every N5 word</strong> (<code>vocabulary.test.ts</code>):
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>
              is a real JMdict word <em>with that reading</em> (single-kanji
              affixes like ～月 may use a KANJIDIC2 reading instead);
            </li>
            <li>
              has no meaning that reverses JMdict's (this ↔ that, come ↔
              go…);
            </li>
            <li>
              is taught by exactly one lesson, and every lesson word is a real
              pool word.
            </li>
          </ul>
        </li>
        <li>
          <strong>Word-card rōmaji</strong> (<code>romaji.test.ts</code>) —
          the seed converts kana to rōmaji letter by letter, which is wrong
          wherever は/へ/を are particles (では is <code>dewa</code>, not
          <code>deha</code>). Each word's written form is tokenized so
          particle は (pronounced わ) is told apart from the letter は (歯
          <code>ha</code>), and every served rōmaji must match the spoken
          form. Fix a failure with a <code>romaji</code> entry in
          <code>VOCAB_FORM_CORRECTIONS</code>.
        </li>
        <li>
          <strong>Every hand-written meaning</strong> — enrichments,
          seed-time overrides, and corrections — must be backed by JMdict:
          each <code>;</code>-separated sense has to share a content word with
          one of the word's JMdict glosses. Seed reading overrides must be
          JMdict readings; part-of-speech overrides must be JMdict tags.
        </li>
        <li>
          <strong>Lesson prose</strong> (<code>prose.test.ts</code>) — every
          Japanese word in insights, titles and common-mistake notes must be a
          real word, and every "かな (romaji)" pair in the kana guide must be
          spelled correctly.
        </li>
        <li>
          <strong>Staleness</strong> — the reference must match
          <code>shared/meanings.ts</code>. Change a correction without
          rebuilding and CI tells you to run <code>pnpm data:reference</code>.
        </li>
      </ul>

      <p class="mb-6">
        The checkers test themselves too: they must <em>reject</em>
        known-wrong readings (三日 as <code>yokka</code>, 七時 as
        <code>hachi-ji</code>, 来週 as <code>senshuu</code>), so they can't
        silently pass everything.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200">
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
          <strong>A word's rōmaji is wrong</strong> → add a <code>romaji</code>
          correction in <code>VOCAB_FORM_CORRECTIONS</code> (ids stay the
          same; no re-seed).
        </li>
        <li>
          <strong>A meaning isn't backed</strong> → reword it to match what
          JMdict says, or drop the sense. Don't widen the checker to let it
          through.
        </li>
        <li>
          <strong>An example's rōmaji doesn't match</strong> → fix the rōmaji
          (or the Japanese). If you're sure it's a valid reading JMdict lacks,
          rethink the example rather than special-casing it.
        </li>
        <li>
          <strong>A prose word is unknown</strong> → it's probably misspelt.
          If it's a real word new to the content, run
          <code>pnpm data:reference</code> so the reference records it.
        </li>
      </ul>

      <p class="mb-6">
        Prose explanations themselves ("the こ-series means near me") can't be
        machine-verified. Keep factual claims in structured fields (examples,
        rows, meanings) where they are checked, and review prose in PRs.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4 text-stone-800 dark:text-stone-200">
        Updating the evidence
      </h3>

      <p class="mb-6">
        The sources are pinned in two places: <code>JAMDICT_SOURCE</code> in
        <code>scripts/build-n5-reference.mjs</code>, and
        <code>WORD_LIST_SOURCE</code> in
        <code>scripts/n5-word-list-source.mjs</code> — the latter is imported
        by both <code>build-n5-reference.mjs</code> and
        <code>seed-n5-data.mjs</code>, so the live seed and the committed
        evidence always read the exact same N5 word list commit; they can't
        silently diverge. To move to newer data, bump the pin(s), run
        <code>pnpm seed:n5</code> and <code>pnpm data:reference</code>
        together, and review both diffs in the PR — every changed reading or
        gloss is visible, and the content tests show whether any lesson now
        disagrees with it. Requires Node ≥ 22 (<code>node:sqlite</code>) and
        <code>tar</code>/<code>xz</code> on PATH.
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

const n5PipelineDiagram = `
flowchart TD
    subgraph LIVE["Live pool — what the site serves"]
        direction TB
        WordList["elzup/jlpt-word-list
n5.csv @ pinned commit"]
        JMdictLatest["JMdict + KANJIDIC2
(jmdict-simplified, latest release)"]
        Seed["pnpm seed:n5
scripts/seed-n5-data.mjs"]
        Pool[("Redis N5 Pool
n5:vocab:* · n5:kanji:*
n5:hiragana:* · n5:katakana:*")]
        Served["N5DataService + servedVocab()
server/services/n5-data.ts
shared/meanings.ts"]
        VocabAPI["GET /api/n5-vocab"]
        KanjiAPI["GET /api/n5-kanji"]
        Game["buildDailyGame()"]

        WordList --> Seed
        JMdictLatest --> Seed
        Seed -- "romaji via wanakana,
cross-referenced readings + POS" --> Pool
        Pool --> Served
        Served --> VocabAPI
        Served --> KanjiAPI
        Served --> Game
    end

    subgraph TRUTH["Ground truth — checked independently in CI"]
        direction TB
        SamePin["scripts/n5-word-list-source.mjs
(same pinned commit as Seed)"]
        Jamdict["jamdict-data
checksum-verified JMdict/KANJIDIC2"]
        RefBuild["pnpm data:reference
scripts/build-n5-reference.mjs"]
        RefJSON["data/reference/n5-reference.json
(committed snapshot)"]
        ContentTests["test/content/*
vocabulary · romaji · examples · prose"]

        SamePin --> RefBuild
        Jamdict --> RefBuild
        RefBuild --> RefJSON
        RefJSON --> ContentTests
    end

    WordList -. "same pinned commit" .-> SamePin
    Served -. "same servedVocab()
corrections, verified" .-> ContentTests
    ContentTests --> CI{"pnpm test:run (CI)"}
    CI -- "wrong reading, meaning,
or romaji found" --> Fail(["❌ PR blocked"])
    CI -- "every word checks out" --> Pass(["✅ Safe to merge"])

    VocabAPI --> VocabPage["/vocab guide"]
    KanjiAPI --> LearnPage["/learn kanji breakdown"]
    Game --> GamePage["/game daily round"]
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
