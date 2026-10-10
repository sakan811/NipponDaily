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

    <h2>Accessibility</h2>
    <ul>
      <li>
        <strong>Grey text that reaches AA.</strong> Most captions and labels are
        <code>text-stone-500</code>, about 3.3:1 on the light canvas (and 3.9:1
        on the dark one wherever no <code>dark:</code> colour overrides it), and
        some are <code>text-stone-400</code>, about 2.3:1 in light mode. Body
        text needs 4.5:1. Darken them a step in light mode, then extend the
        <code>contrast</code> test to neutral text so it cannot slip back. The
        test now covers only text on the season colours, the focus ring, the
        search box's border and a pressed chip's border (<NuxtLink
          to="/docs/development"
          >Development</NuxtLink
        >).
      </li>
      <li>
        <strong>Controls that colour alone shows.</strong> An unpressed filter
        chip's border is about 1.6:1 against the page in both modes, and the off
        track of the music switch about 1.6:1 in light mode and 2.3:1 in dark.
        Raise them to 3:1 or show the state another way, and measure them in the
        same test.
      </li>
    </ul>

    <h2>Tests and tooling</h2>
    <ul>
      <li>
        <strong>A passing <code>pnpm type-check</code>.</strong> The
        <code>h3</code> devDependency is at 2.0.1 while Nitro's server types use
        h3 1.15.11, so every server file that takes an
        <code>H3Event</code> fails to type-check, and
        <code>pnpm check-qa</code> fails with it. CI runs only
        <code>pnpm run test</code>, so it has not shown there. Pin
        <code>h3</code> back to <code>^1.15.11</code>.
      </li>
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
