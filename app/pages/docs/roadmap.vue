<template>
  <DocsBook slug="roadmap">
    <template #lede>
      The app does a few things and says plainly where it stops. This chapter
      lists what is planned but not built, and what it cannot promise.
    </template>

    <h2>Not built yet</h2>
    <p>
      Nothing is queued. The laps, the multi-select and any/all filters in
      Explore, the part-of-speech groups, the “not stated” layer and the larger
      combinations in Patterns are built and described in
      <NuxtLink to="/docs/core-theme">Core theme</NuxtLink> and
      <NuxtLink to="/docs/words">Words</NuxtLink>.
    </p>
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
      <li>
        <strong>Laps repeat the same entries.</strong> A later lap shows the
        same words, unchanged; it does not add new ones or reorder them, and the
        length of a lap is the number of words written.
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
