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
      combinations in Patterns, the kanji pages with their stroke order, the
      example sentences with their furigana, the pitch accent, JMdict's
      register, field and dialect tags, the JMdict cross-check and the share
      image are built and described in
      <NuxtLink to="/docs/core-theme">Core theme</NuxtLink> and
      <NuxtLink to="/docs/words">Daily words</NuxtLink>. What is left is a list
      of ideas, not a promise. Any of them follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>
    <ul>
      <li>
        <strong>More breakdowns.</strong> A KANJIDIC2 split now covers words
        written with kanji and their okurigana (手続き, 言い出す), marked as
        derived. Most entries still without one are a single kanji, or a single
        kanji with okurigana (抱く), where the only split is the word itself.
        The rest are words written only in kana, loanwords whose text names no
        one source, irregular spellings (為替, 足袋) and words whose page has no
        clean split. Wiktionary's structured templates (compound, affix) were
        checked as a source: only a handful of the remaining entries have one
        whose parts spell the word, and some of those say something other than
        the sentence (一日 as 月 + 立ち), so each would need a human check for a
        very small gain. Reading them would also need the templates pinned
        beside each section.
      </li>
      <li>
        <strong>A second source for the pitch accent.</strong> The accent list
        is one source, so nothing checks it the way KANJIDIC2 and a second
        analyser check the furigana. An independent open accent dictionary would
        let the app show an accent only where two agree, and name the words they
        disagree on. It would need its own pinned file, a check and an entry in
        <code>shared/sources.ts</code>.
      </li>
      <li>
        <strong>More words.</strong> See the limit below: the supply is finite.
      </li>
    </ul>

    <h2>Limits</h2>
    <ul>
      <li>
        <strong>Furigana is nearly complete, not guaranteed.</strong> The
        readings are Tatoeba's. Fewer than half were written by a contributor
        and the rest by software that Tatoeba says sometimes errs, so a reading
        is shown only if it passes a check against KANJIDIC2 or JMdict and a
        contributor, kuromoji, UniDic or Tatoeba's index stands behind it. A
        reading the sources cannot settle, a number with its counter (３月) and
        a name stay bare, so a bare kanji means “unsure”, not “easy”. A
        contributor can still be wrong, and so can the analysers together: two
        of them reading 光 as ひかり in 光ファイバー agree, and are wrong.
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
        <strong>JMdict changes every day, and has moved.</strong> The file is
        pinned by checksum, but EDRDG overwrites it daily, so rebuilding needs
        the files kept beside the code (they are git-ignored) and a newer pin
        can reword tags and glosses: the move to the 2026 file renamed
        “colloquialism” to “colloquial”, merged senses and changed a handful of
        meanings, and two list rows needed a correction. Even the 2026 file
        names a loan source for few loanwords (カメラ, ノート have none), so the
        cross-check still only confirms a keyword tag and cannot refute one.
      </li>
      <li>
        <strong
          >Register, field and dialect are JMdict's labels, and often
          absent.</strong
        >
        A tag is shown only if every sense the word's meaning matches carries
        it, so a word with one tagged sense and one untagged sense shows
        nothing. The register list is a fixed set of JMdict's usage tags
        (<code>REGISTER_TAGS</code>); other tags, such as “archaic” or
        “abbreviation”, are not shown. No word in the catalogue shows a dialect
        at present.
      </li>
      <li>
        <strong>Pitch accent is one list's, not a recording.</strong> It comes
        from Kanjium's accent list, which credits an individual's free database
        and does not say whose speech it records, and a word is shown an accent
        only where the list gives that exact spelling and reading, so some words
        show none. The number is the mora after which the pitch falls; how it
        changes in a compound, with a particle or in a sentence is not shown.
        Where the list gives several accents all are shown, without saying which
        is more usual.
      </li>
      <li>
        <strong>Stroke order is KanjiVG's drawing.</strong> It is shown only
        where KanjiVG draws as many strokes as KANJIDIC2 counts, so a few kanji
        show none, and a kanji is drawn in KanjiVG's standard hand, not in every
        typeface's. The frames are static; nothing is animated.
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
        none, so the pool is far larger than the supply. Nearly every word that
        can be built is in the catalogue (about thirty were left out by hand
        because the page's text was thin or about another sense), which starts a
        new lap when it runs out. More words need a newer dump or another source
        of origins.
      </li>
      <li>
        <strong>Some years are lopsided.</strong> Katakana spellings are nearly
        half of 2022, and 2025 and 2026 are almost all N1 (no word before 2024
        is), so Patterns, which counts these entries, shows more of each than
        the language would.
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
