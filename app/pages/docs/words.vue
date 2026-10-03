<template>
  <DocsBook slug="words">
    <template #lede>
      One entry per day, in <code>data/words/</code>. This chapter says what an
      entry holds, when its day opens, and how the app reads across the entries
      without adding a claim.
    </template>

    <h2>An entry</h2>
    <p>
      A <code>WordEntry</code> (<code>types/index.ts</code>). The range written
      so far is <CatalogueRange />.
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in fields" :key="f.name">
            <td>
              <code>{{ f.name }}</code>
            </td>
            <td><RichText :text="f.meaning" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      A hedge in a quoted line (“probably”, “unknown”…) is detected when the
      page renders (<code>isHedged</code> in <code>shared/word-labels.ts</code>)
      and shown as “Not settled”. Where each field comes from is in
      <NuxtLink to="/docs/data-integrity#provenance">Data integrity</NuxtLink>.
    </p>

    <h2>When a day opens</h2>
    <p>
      Dates are JST. <code>todayJst()</code> shifts UTC by +9 hours, so a new
      word opens at 15:00 UTC. With no <code>date</code>,
      <code>GET /api/daily-word</code> serves today's word. Once the catalogue
      has run out it starts a new lap (<code>lapEntryForDate()</code>): the day
      after the last word shows the first, the next day the second, and so on,
      round again after the last. The payload's <code>lap</code> says which one
      (1 until then), and the home page names the lap from 2 on. A word shown on
      a later lap has always opened already, so nothing leaks; an explicit
      <code>date</code> is always lap 1. The page is never empty, and before the
      first day it is a <code>404</code>.
    </p>

    <DocDiagram
      label="How GET /api/daily-word decides what to answer"
      :nodes="flow.nodes"
      :edges="flow.edges"
    />

    <ul>
      <li>
        <strong>No future leaks.</strong> The API rejects a future
        <code>date</code> (<code>400</code>); <code>payloadFor()</code> reveals
        <code>next</code> only once that day has arrived;
        <code>calendarForMonth()</code> gives an upcoming day only its date.
      </li>
      <li>
        <strong>Server rendering.</strong> A server fetch that fails with
        <code>400</code>/<code>404</code> makes the HTTP response a
        <code>404</code>, and such pages are <code>noindex</code>.
      </li>
    </ul>

    <h2>Reading across the words</h2>
    <p>
      Everything here derives from fields entries already have, reads
      <strong>open days only</strong> (<code>today</code> is always a
      parameter), and adds no new claim.
    </p>

    <h3>Parts</h3>
    <p>
      <code>/parts</code> and <code>/parts/&lt;text&gt;</code>: the morpheme
      index. A part page groups its words by the reading the part has in each
      (日 → び, ひ, か, にち), with rendaku shown as “from ひ”.
      <code>alsoIn</code> lists open words whose <em>spelling</em> contains a
      kanji part but whose breakdown doesn't name it, flagged on the page as
      claiming nothing. Coverage is bounded by the parsers: single-character
      words, most native verbs and adjectives, many loanwords and any word whose
      text gives no clean split have no parts. The sitemap lists parts seen in
      more than one open word.
    </p>

    <h3>Explore</h3>
    <p>
      <code>/explore</code> filters by <code>q</code> (term, kana, meaning;
      katakana folded to hiragana), <code>level</code>, <code>stratum</code>,
      <code>process</code>, <code>pos</code> and <code>part</code>, newest
      first. Different filters always narrow together. Within
      <code>level</code>, <code>stratum</code>, <code>process</code> and
      <code>pos</code> several choices are joined by commas
      (<code>?process=rendaku,compound</code>), and <code>match</code> says how
      they combine: by default a word needs <em>any</em> of them, with
      <code>match=all</code> it needs <em>every</em> process and every part of
      speech. A word has one level and one layer, so those always read as “any”.
    </p>
    <p>
      The layer <code>unstated</code> picks the words with no stated layer.
      <code>pos</code> filters on a coarse group of JMdict's tags (noun, verb,
      adjective, adverb, prefix or suffix, other, or not stated;
      <code>POS_GROUPS</code> in <code>shared/word-labels.ts</code>), because
      the verbatim tags are long. The entry keeps the tags as they are, and a
      word can fall in more than one group. Each facet's counts are taken over
      the words the <em>other</em> filters leave, so an option never promises a
      count it can't deliver. Filters live in the URL; an unknown value in a
      hand-edited URL is dropped, while the API answers <code>400</code>.
    </p>

    <h3>Patterns</h3>
    <p>
      <code>/patterns</code>: counts by layer, level and process; level × layer;
      process × layer; process pairs and, beyond them, sets of three or four
      tags (processes plus the layer, such as rendaku, compound and native) with
      up to three example words each, linking into Explore with
      <code>match=all</code>; and a rendaku section. It lists every part whose
      recorded <code>base</code> differs from its <code>reading</code>, classed
      from the two spellings as a voiced first kana (ひ → び; ち → じ and つ →
      ず count, being the merged voiced sounds), a reading ending in っ, or
      other. The page says the counts describe these entries (a JLPT N5–N2
      sample, parser-derived tags), not the language.
    </p>

    <h3>Related words</h3>
    <p>
      Under an entry on <code>/words/&lt;date&gt;</code>: up to six other open
      words, scored 3 per shared part plus
      <code>1 − (fraction of open words carrying it)</code> for each shared
      process and for a shared layer. Below 1.5 a word is not offered. Each card
      names what is shared and links to <code>/parts/&lt;text&gt;</code> or
      <code>/explore</code>. The row is hidden when the fetch fails or nothing
      clears the minimum.
    </p>

    <h2>The word pool</h2>
    <p>
      The pool is the community JLPT lists (one CSV per level, N5 to N2),
      cross-referenced against JMdict and KANJIDIC2. It exists only as the
      committed <code>data/reference/n{5,4,3,2}-reference.json</code> snapshots;
      there is no Redis pool. <code>scripts/lib/word-list.mjs</code> holds the
      parsing, the reading and meaning overrides and the gloss cross-check.
    </p>
    <p>
      A handful of words appear at more than one level with the same reading;
      <code>dedupeAcrossLevels()</code> keeps each at the lowest. A shared
      spelling with a <em>different</em> reading (開く あく and ひらく) is a
      different word. An entry's <code>term</code>, <code>kana</code>,
      <code>level</code> and <code>meaning</code> must equal a pool word.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import CatalogueRange from "../../components/CatalogueRange.vue";
import RichText from "../../components/RichText.vue";
import type { DiagramSpec } from "../../utils/diagram";

const fields = [
  { name: "date", meaning: "`YYYY-MM-DD`, JST." },
  {
    name: "term, kana, meaning, level",
    meaning:
      "From the JLPT word list, after the corrections in `shared/meanings.ts`.",
  },
  {
    name: "pos",
    meaning:
      "JMdict's own part-of-speech tags, verbatim, for the sense the meaning came from.",
  },
  {
    name: "stratum?",
    meaning:
      "`wago`, `kango`, `gairaigo` or `hybrid`; stated only when KANJIDIC2 or the evidence establishes it.",
  },
  {
    name: "processes",
    meaning: "Keyword tags found in the quoted text (`WORD_PROCESSES`).",
  },
  { name: "headline", meaning: "The only hand-written field." },
  {
    name: "morphemes[]",
    meaning:
      "`text`, surface `reading` (hiragana), `base?` when rendaku or sokuon changed it, `meaning`, `irregular?`, and `glossSource?` (`kanjidic2` when the meaning is KANJIDIC2's, not Wiktionary's). Empty when the source gives no clean split.",
  },
  {
    name: "sources[]",
    meaning:
      "`{ quote }`: one verbatim line of Wiktionary's Etymology section for this reading.",
  },
  { name: "wiktionaryRev", meaning: "The pinned Wiktionary revision." },
];

const flow: Required<Pick<DiagramSpec, "nodes" | "edges">> = {
  nodes: [
    {
      id: "req",
      label: "Request",
      sub: "?date=…",
      col: 0,
      row: 1.5,
      kind: "actor",
    },
    {
      id: "bad",
      label: "400",
      sub: "future or malformed",
      col: 1,
      row: 0,
      kind: "ghost",
    },
    {
      id: "entry",
      label: "The day's entry",
      sub: "no date: today, by lap",
      col: 1,
      row: 1.5,
    },
    {
      id: "none",
      label: "404",
      sub: "past day, no entry",
      col: 1,
      row: 3,
      kind: "ghost",
    },
    {
      id: "payload",
      label: "Entry + prev/next",
      sub: "next once arrived",
      col: 2,
      row: 1.5,
      kind: "check",
    },
  ],
  edges: [
    { from: "req", to: "bad", out: "r", into: "l" },
    { from: "req", to: "entry" },
    { from: "req", to: "none", out: "r", into: "l" },
    { from: "entry", to: "payload" },
  ],
};
</script>
