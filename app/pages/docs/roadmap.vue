<template>
  <DocsBook slug="roadmap">
    <template #lede>
      The app does a few things and says plainly where it stops. This chapter
      lists what is planned but not built, and what it cannot promise.
    </template>

    <h2>Not built yet</h2>
    <p>
      The laps, the multi-select and any/all filters in Explore, the
      part-of-speech groups, the “not stated” layer, the larger combinations in
      Patterns, and the share image are built and described in
      <NuxtLink to="/docs/core-theme">Core theme</NuxtLink> and
      <NuxtLink to="/docs/words">Words</NuxtLink>. What is left is a list of
      ideas, not a promise. Any of them follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>
    <ul>
      <li>
        <strong>More breakdowns.</strong> Most entries without one are a single
        kanji, or a kanji with okurigana whose Wiktionary text gives a
        derivation (the stem of a verb) rather than a split. Wiktionary's
        structured templates carry the same text as the prose, so reading them
        instead of the prose would add only a few dozen. A kanji-plus-okurigana
        split from KANJIDIC2 would add many more, as a derived split marked as
        such, like <code>glossSource: "kanjidic2"</code>.
      </li>
      <li>
        <strong>A second source for the processes.</strong> The reference
        snapshots keep only each word's kanji, readings, parts of speech and
        glosses. JMdict also tags abbreviations, ateji and the source language
        of a loanword, which would check the keyword-found processes and layers
        against a source other than Wiktionary.
      </li>
      <li>
        <strong>New data.</strong> JMdict's priority tags would give a “how
        common” filter. Kanji pages (KANJIDIC2 has grade, strokes and readings)
        and example sentences from an open corpus would each need a pinned
        source, a check and an entry in <code>shared/sources.ts</code>.
      </li>
      <li>
        <strong>Ways to follow the words</strong>: a feed or calendar
        (<code>.ics</code>) of the newest open words, and an export of the open
        words for flash-card tools, each with the licences they carry.
      </li>
      <li>
        <strong>More words.</strong> See the limit below: the supply is finite.
      </li>
    </ul>

    <h2>Limits</h2>
    <ul>
      <li>
        <strong>The tests prove agreement, not truth.</strong> They show that
        quotes, readings, meanings and parts of speech match the committed
        evidence, not that Wiktionary is right. The headline is the one
        hand-written line; a test only checks the Japanese it mentions
        (<NuxtLink to="/docs/data-integrity">Data integrity</NuxtLink>).
      </li>
      <li>
        <strong>The counts describe these entries.</strong> They are a JLPT
        N5–N2 sample with parser-derived tags, not the language. Coverage of
        parts is bounded by the parsers.
      </li>
      <li>
        <strong>Laps repeat the same entries.</strong> A later lap shows the
        same words, unchanged; it does not add new ones or reorder them, and the
        length of a lap is the number of words written.
      </li>
      <li>
        <strong>The words are nearly used up.</strong> Most pool words have no
        usable Etymology section in the dump, so the pool is far larger than the
        supply of words that can be built from it. Filling every day up to the
        end of the catalogue used almost all of them, and the catalogue starts a
        new lap when it runs out. More words need a larger pool or another
        source of origins.
      </li>
      <li>
        <strong>Loanwords are a large share of 2025.</strong> The words left to
        use were mostly katakana loanwords with a one-line origin, so Patterns,
        which counts these entries, shows them more than the language would.
      </li>
      <li>
        <strong>The share image can omit a headline.</strong> The two faces it
        is drawn in lack IPA symbols and a few rare kanji, and a headline using
        one is left off the card instead of showing empty boxes.
      </li>
      <li>
        <strong>Caching needs a CDN that honours <code>s-maxage</code>.</strong>
        Without one every request runs the app, which is correct but slower.
      </li>
      <li><strong>No request rate limiting</strong> on any endpoint.</li>
      <li>
        <strong>The fonts come from Google Fonts</strong>
        (<code>nuxt.config.ts</code>), so a reader's browser contacts Google
        when a page loads (<code>fonts.googleapis.com</code> and
        <code>fonts.gstatic.com</code>).
      </li>
      <li>
        <strong>No integration tests.</strong> Pages with no test are only
        exercised by <code>pnpm build</code>.
      </li>
      <li>
        <strong>Contrast is a target, not a guarantee.</strong> Text on colour
        aims for WCAG AA, but nothing enforces it in a test and a few pairings
        fall short.
      </li>
    </ul>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
</script>
