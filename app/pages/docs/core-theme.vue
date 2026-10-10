<template>
  <DocsBook slug="core-theme">
    <template #lede>
      NipponDaily teaches Japanese through linguistics and data. Each day opens
      one word, taken apart: its morphemes, its layer of the vocabulary, the
      processes that shaped it and the Wiktionary lines that back every claim.
    </template>

    <h2>What the app is</h2>
    <p>
      The layers are 和語 (native), 漢語 (Sino-Japanese), 外来語 (loanword) and
      混種語 (hybrid); the processes are compounding, rendaku, clipping, ateji
      and the like. Reading <em>across</em> the words, by counting and grouping
      what the entries already say, shows the patterns in the language itself.
    </p>
    <p>
      A wrong reading, meaning or origin is a bug, so every claim comes from a
      cited source and none is written from memory.
    </p>

    <h3>The vocabulary is the JLPT lists, on purpose</h3>
    <p>
      Every word comes from the community JLPT {{ JLPT_RANGE }} lists, and from
      nowhere else. The lists are a trusted, widely used starting point, and the
      app keeps to them rather than widen the pool to find more words. A word is
      added only if it is on a list and the pinned dump has an Etymology section
      for its reading, so when no more such words can be built the catalogue is
      complete, not short.
    </p>

    <h2>Time is the theme</h2>
    <p>
      Time is how the app is styled and how it is used. It runs on two clocks.
    </p>

    <DocDiagram
      label="Both clocks start from the date in Japan; neither needs the reader to have visited before"
      :nodes="clocks.nodes"
      :edges="clocks.edges"
      :groups="clocks.groups"
    />

    <h3>The year clock: the four seasons</h3>
    <p>
      The look of the site follows the Japanese calendar: spring, summer, autumn
      and winter. It repeats every year, so it never runs out. See
      <NuxtLink to="/docs/seasons">Seasons</NuxtLink>.
    </p>

    <h3>The learning clock: one word a day</h3>
    <p>
      Each date has one word, and which word a date shows depends only on the
      date, so any reader gets the same complete page. The words are finite, so
      when they run out the clock goes round again: a <em>lap</em> (周) starts
      from the first word, the day after the last one, and the home page says
      which lap it is on. Only the home page and the calendar repeat words (the
      calendar marks them ↻); every other page and every explicit date stays on
      the first lap, where each word has its own day, and each entry says when
      it was first opened.
    </p>
    <p>
      The loop is intended, not a stopgap. The words keep coming round in the
      order they first opened, so a reader meets every word that has opened
      again and again, and the app never reaches for words outside the lists to
      avoid a repeat.
    </p>

    <h2>Principles</h2>
    <p>Every new feature is checked against these seven.</p>
    <ol>
      <li>
        <strong>No reader data.</strong> No accounts, no progress, no streaks.
        Nothing about a reader is sent to or stored on the app's server; only a
        colour mode, a season pick, a cached copy of the site's season and a
        music volume stay in the reader's own browser. The site is the same for
        everyone.
      </li>
      <li>
        <strong>Fits whenever a reader comes.</strong> Daily is ideal but never
        required. Every page stands alone, nothing assumes yesterday was read,
        and the home page always shows a word.
      </li>
      <li>
        <strong>The page is never empty.</strong> The word list is finite, so
        the app starts another lap from the first word rather than run out.
      </li>
      <li>
        <strong>Derive, don't claim.</strong> Data pages and time labels read
        what the entries already say. They add no new fact about a word.
      </li>
      <li>
        <strong>Only what has arrived.</strong> A word is shown only once its
        day has come.
      </li>
      <li>
        <strong>Fits every device.</strong> The app is built to fit every
        device, from a narrow phone to a wide desktop screen. Pages are laid out
        mobile-first and flow to the width they are given, wide figures and
        tables scroll inside their own box instead of widening the page, and
        nothing important hides behind hover, so touch, keyboard and
        screen-reader readers get the same pages.
      </li>
      <li>
        <strong>Nothing leaves the app.</strong> Everything the app offers is
        read in the app. It exports nothing (no download, no file for another
        tool), sends nothing about a reader to anyone (no analytics, no sign-in,
        no form), loads no third-party script, font or embed, and keeps the data
        it shows committed beside the code. The one value the server keeps
        outside its own process is the season, in the app's own datastore. A
        link to a source is a citation the reader may follow, not something the
        app sends. A page that other sites preview is still served by the app,
        and no one is told who read it.
      </li>
    </ol>

    <aside class="note">
      <span class="note-title">The rule for AI</span>
      <p>
        AI may pick words, draft headlines and write code. It must never supply
        a reading, meaning, level, layer, morpheme split or etymology. See
        <NuxtLink to="/docs/data-integrity#ai">Data integrity</NuxtLink>.
      </p>
    </aside>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import type { DiagramSpec } from "../../utils/diagram";
import { JLPT_RANGE } from "~~/shared/jlpt";

const clocks: Required<DiagramSpec> = {
  nodes: [
    { id: "date", label: "Date\n(Japan, JST)", col: 0, row: 1, kind: "actor" },
    {
      id: "season",
      label: "A season",
      sub: "seasonForDate()",
      col: 1,
      row: 0.1,
    },
    {
      id: "look",
      label: "The site's look",
      sub: "data-season",
      col: 2,
      row: 0.1,
      kind: "check",
    },
    {
      id: "word",
      label: "That day's word",
      sub: "entryForDate()",
      col: 1,
      row: 1.9,
    },
    {
      id: "page",
      label: "Same page for\nevery reader",
      col: 2,
      row: 1.9,
      kind: "check",
    },
    {
      id: "newest",
      label: "Next lap (周)",
      sub: "lapEntryForDate()",
      col: 1,
      row: 2.9,
      kind: "ghost",
    },
  ],
  edges: [
    { from: "date", to: "season", out: "t", into: "l" },
    { from: "season", to: "look" },
    { from: "date", to: "word", out: "b", into: "l" },
    { from: "word", to: "page" },
    { from: "newest", to: "page", kind: "dashed", out: "r", into: "b" },
  ],
  groups: [
    { label: "Year clock", ids: ["season", "look"] },
    { label: "Learning clock", ids: ["word", "page", "newest"] },
  ],
};
</script>
