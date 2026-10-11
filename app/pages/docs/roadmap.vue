<template>
  <DocsBook slug="roadmap">
    <template #lede>
      What is left to build or fix, and nothing else. A finished item is deleted
      from here, and the chapter that owns the feature describes it.
    </template>

    <p>
      Any item follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>

    <h2>Words and data</h2>
    <ul>
      <li>
        <strong>Words still unplanned.</strong> Read against the pinned dump,
        about a hundred pool words that are in no month's plan have an Etymology
        section for their own reading, and the generator builds most of them. A
        handful need <code>kana</code> in the plan because their spelling has
        two pool words, and two (道 みち, 冠 かんむり) are refused because the
        dump attached another reading's section. Each needs a person to choose
        it and to read the result once (<NuxtLink to="/docs/authoring"
          >Adding and fixing words</NuxtLink
        >).
      </li>
      <li>
        <strong>More breakdowns.</strong> Many entries show no “Taken apart”
        row. Most are a single kanji, or a single kanji with okurigana (抱く),
        where the only split is the word itself. The rest are words written only
        in kana, loanwords whose text names no one source, irregular spellings
        (為替, 足袋) and words whose page has no clean split (一日 is quoted as
        月 + 立ち, which does not spell it). Wiktionary's structured templates
        (compound, affix) are not read: fewer than thirty of these entries carry
        one whose parts spell the word, so each would need a human check for a
        very small gain, and reading them would need the templates pinned beside
        each section.
      </li>
      <li>
        <strong>Furigana that the checks accept wrongly.</strong> One sentence
        shows 光 as ひかり in 光ファイバーケーブル (Tatoeba 2574612, in
        <code>data/words/2022-02.json</code>), where it is こう, and the sources
        it is checked against let it through. Find how a reading like this gets
        past <code>scripts/lib/furigana.mjs</code> and close that gap there,
        never by editing the sentence.
      </li>
    </ul>

    <h2>Tests and tooling</h2>
    <ul>
      <li>
        <strong>Wider browser tests.</strong>
        <code>playwright.config.ts</code> runs Chromium only, at a desktop and a
        phone width. Add Firefox and WebKit, tests for the music switch and the
        seasonal animations (neither is exercised), and a run against
        <code>pnpm dev</code> that fails on a Vue warning, because a production
        build reports no hydration mismatch.
      </li>
    </ul>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
</script>
