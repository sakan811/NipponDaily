<template>
  <DocsBook slug="roadmap">
    <template #lede>
      The app does a few things and says plainly where it stops. This chapter
      lists what is planned but not built, and what it cannot promise.
    </template>

    <h2>Not built yet</h2>
    <p>
      The laps, the multi-select and any/all filters in Explore, the
      part-of-speech and how-common groups, the “not stated” layer, the larger
      combinations in Patterns, the kanji pages, the example sentences with
      their furigana, the JMdict cross-check and the share image are built and
      described in
      <NuxtLink to="/docs/core-theme">Core theme</NuxtLink> and
      <NuxtLink to="/docs/words">Words</NuxtLink>. What is left is a list of
      ideas, not a promise. Any of them follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>
    <ul>
      <li>
        <strong>More breakdowns.</strong> A KANJIDIC2 split now covers words
        written with kanji and their okurigana (手続き, 言い出す), marked as
        derived. What is left without one is mostly a single kanji, or a single
        kanji with okurigana (抱く), where the only split is the word itself;
        loanwords whose text names no one source; and a few dozen where
        Wiktionary's structured templates give a derivation that its prose words
        differently. Reading the templates would need them pinned beside each
        section.
      </li>
      <li>
        <strong>A newer JMdict.</strong> The checks against JMdict use the
        <code>jamdict-data</code> release already pinned, which records a loan
        source only where JMdict names the foreign word or marks a coinage made
        in Japan. A newer release, or one that keeps the language of every
        loanword, would let the cross-check refute a keyword tag as well as
        confirm one.
      </li>
      <li>
        <strong>More data on each word.</strong> Pitch accent from an open
        accent dictionary, stroke order from an open kanji set, and the other
        JMdict notes (field, register, dialect) each need a pinned source, a
        check and an entry in <code>shared/sources.ts</code>.
      </li>
      <li>
        <strong>A second analyser for the furigana.</strong> kuromoji uses the
        IPADIC dictionary, as Tatoeba's software does, so their mistakes can
        agree. An analyser built on a different dictionary (UniDic: Sudachi,
        Lindera or MeCab) would check Tatoeba's machine-made readings
        independently and settle some of the few kanji still left bare.
      </li>
      <li>
        <strong>An export for flash-card tools</strong> of the open words, with
        the licences they carry.
      </li>
      <li>
        <strong>More words.</strong> See the limit below: the supply is finite.
      </li>
    </ul>

    <h2>Limits</h2>
    <ul>
      <li>
        <strong>Furigana is nearly complete, not guaranteed.</strong> The
        readings are Tatoeba's. About a third were written by a contributor and
        the rest by software that Tatoeba says sometimes errs, so a reading is
        shown only if it passes a check against KANJIDIC2 or JMdict and a
        contributor, kuromoji or Tatoeba's index stands behind it. A reading the
        sources cannot settle, a number with its counter (３月) and a name stay
        bare, so a bare kanji means “unsure”, not “easy”. A contributor can
        still be wrong, and so can software and kuromoji together.
      </li>
      <li>
        <strong>Example sentences are picked, not reviewed.</strong> They come
        from a community collection by fixed rules (the corpus indexes them
        under the word, with a translation, short, with the word's own form in
        the text) and a short filter drops the plainly unsuitable. A sentence
        can still be awkward or oddly translated, and a word whose spelling
        JMdict reads several ways gets one only where the corpus says which
        reading it means. Skim a new month's sentences as you skim its
        headlines.
      </li>
      <li>
        <strong>“Common” is JMdict's flag.</strong> It comes from lists JMdict
        draws on (a newspaper count, an old frequency list, a loanword list), so
        it says how a word ranks there, not how often it is used today, and a
        word outside the lists is “not ranked”, not rare.
      </li>
      <li>
        <strong>A kanji page describes the character.</strong> KANJIDIC2 lists
        every reading and meaning the character can have; a word uses one. A
        derived breakdown shows KANJIDIC2's meaning, not always the one the word
        uses.
      </li>
      <li>
        <strong>The tests prove agreement, not truth.</strong> They show that
        quotes, readings, meanings and parts of speech match the committed
        evidence, not that Wiktionary is right. The headline is the one
        hand-written line; a test only checks the Japanese it mentions
        (<NuxtLink to="/docs/data-integrity">Data integrity</NuxtLink>).
      </li>
      <li>
        <strong>The counts describe these entries.</strong> They are a JLPT
        N5–N1 sample with parser-derived tags, not the language. Coverage of
        parts is bounded by the parsers.
      </li>
      <li>
        <strong>Laps repeat the same entries.</strong> A later lap shows the
        same words, unchanged; it does not add new ones or reorder them, and the
        length of a lap is the number of words written.
      </li>
      <li>
        <strong>The words are used up.</strong> A word needs an Etymology
        section for its reading in the pinned dump, and most pool words have
        none, so the pool is far larger than the supply. Every word that can be
        built is in the catalogue, which starts a new lap when it runs out. More
        words need a newer dump or another source of origins.
      </li>
      <li>
        <strong>Some years are lopsided.</strong> Katakana loanwords with a
        one-line origin are over half of 2025, and 2028 and 2029 are almost all
        N1, so Patterns, which counts these entries, shows more of each than the
        language would.
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
      <li>
        <strong>Rate limiting is per server instance.</strong> The counters live
        in process memory (nothing about a client is stored), so where the host
        runs several instances each counts alone, and a client behind a proxy
        that does not set <code>X-Forwarded-For</code> is counted by the proxy's
        address.
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
