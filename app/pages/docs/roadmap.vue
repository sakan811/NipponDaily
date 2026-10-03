<template>
  <DocsBook slug="roadmap">
    <template #lede>
      The app does a few things and says plainly where it stops. This chapter
      lists what is planned but not built, and what it cannot promise.
    </template>

    <h2>Not built yet</h2>
    <ul>
      <li>
        <strong>Laps (周).</strong> Starting again from the first word once the
        words are used up. Today no page or API repeats a word; after the last
        written day the home page keeps showing the newest word until the next
        month is written (<NuxtLink to="/docs/core-theme">Core theme</NuxtLink
        >).
      </li>
      <li>Multi-select filters and an OR/AND toggle in Explore.</li>
      <li>
        Filter by JMdict part-of-speech tag (the verbatim tags are long, so they
        need grouping).
      </li>
      <li>
        A “layer not stated” option in Explore, since some entries have none.
      </li>
      <li>
        Co-occurrence beyond pairs in Patterns (for example rendaku, compound
        and native together).
      </li>
    </ul>
    <p>
      Any new data feature follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>

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
