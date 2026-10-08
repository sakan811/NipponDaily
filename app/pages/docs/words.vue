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
      The page shows <code>register</code>, <code>field</code> and
      <code>dialect</code> as outlined badges beside the part-of-speech tags,
      and <code>pitch</code> as the reading with a line over the high morae and
      a ↓ after the one the pitch falls on, named heiban, atamadaka, nakadaka or
      odaka (<code>app/utils/pitch.ts</code> only lays the number over the
      word's own kana), with a short note under the line saying how to read it.
      Neither adds a claim.
    </p>
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
      round again after the last. Until the last written day it serves the
      newest word that is open, on lap 1. The payload's <code>lap</code> says
      which one (1 until then), and the home page names the lap from 2 on. A
      word shown on a later lap has always opened already, so nothing leaks; an
      explicit <code>date</code> is always lap 1. The calendar fills those days
      too: <code>calendarForMonth()</code> gives each open day after the last
      entry the lap word, linked to that word's own page. The page is never
      empty, and before the first day it is a <code>404</code>.
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
        <code>calendarForMonth()</code> gives an upcoming day only its date, and
        <code>exploreCalendar()</code> never matches one, so filtering the
        calendar cannot find a word early.
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
      words, a single kanji with its okurigana (抱く), many loanwords and any
      word whose text gives no clean split have no parts. The sitemap lists
      parts seen in more than one open word.
    </p>

    <h3>Kanji</h3>
    <p>
      <code>/kanji</code> and <code>/kanji/&lt;character&gt;</code>: every kanji
      an open word is written with, from KANJIDIC2's own record of it (its
      on'yomi and kun'yomi, meanings, school grade, stroke count and newspaper
      frequency rank) and the order its strokes are drawn in, beside the open
      words that contain it. It is built from the spellings of the entries
      alone, so it adds no claim about a word: the record describes the
      character, and a word does not use every reading or meaning listed. A
      kanji used only by an upcoming word is a <code>404</code>, like a part.
      The records are <code>data/reference/kanji.json</code>, made offline by
      <code>pnpm data:kanji</code> from the level snapshots, and
      <code>data/reference/strokes.json</code>, made by
      <code>pnpm data:strokes</code> from a pinned KanjiVG release, which keeps
      a kanji's strokes only where KanjiVG draws as many as KANJIDIC2 counts (a
      kanji with fewer or more shows none). <code>shared/kanji.ts</code> reads
      both (server only, like the other modules that see every entry), and the
      page draws the strokes one at a time, numbered at their start
      (<code>KanjiStrokes</code>). Each entry links its kanji, and the sitemap
      lists kanji seen in more than one open word.
    </p>

    <h3>Explore</h3>
    <p>
      <code>/explore</code> filters by <code>q</code> (term, kana, meaning;
      katakana folded to hiragana), <code>level</code>, <code>stratum</code>,
      <code>process</code>, <code>pos</code>, <code>frequency</code> and
      <code>part</code>, newest first. Different filters always narrow together.
      Within <code>level</code>, <code>stratum</code>, <code>process</code> and
      <code>pos</code> several choices are joined by commas
      (<code>?process=rendaku,compound</code>), and <code>match</code> says how
      they combine: by default a word needs <em>any</em> of them, with
      <code>match=all</code> it needs <em>every</em> process and every part of
      speech. A word has one level, one layer and one frequency group, so those
      always read as “any”. <code>/words</code> (the calendar) takes the same
      filters beside <code>month</code>:
      <code>GET /api/word-calendar</code> marks each open day of the month
      <code>match</code> or not and returns the same counts, plus how many words
      match in every month. Both endpoints read the filters through
      <code>server/utils/explore-filters.ts</code>, so a filter means the same
      thing in each; the page shares one form, <code>WordFilters</code>.
    </p>
    <p>
      The layer <code>unstated</code> picks the words with no stated layer.
      <code>pos</code> filters on a coarse group of JMdict's tags (noun, verb,
      adjective, adverb, prefix or suffix, other, or not stated;
      <code>POS_GROUPS</code> in <code>shared/word-labels.ts</code>), because
      the verbatim tags are long. The entry keeps the tags as they are, and a
      word can fall in more than one group. <code>frequency</code> filters on
      how common JMdict says a word is, from the priority codes its entry keeps
      (<code>FREQUENCY_GROUPS</code>): <em>common</em> when its spelling or
      reading is in the first tier of a list JMdict draws on
      (<code>ichi1</code>, <code>news1</code>, <code>spec1</code>,
      <code>spec2</code>, <code>gai1</code>, the codes JMdict itself counts as
      common), <em>less common</em> when it has only other codes
      (<code>news2</code>, <code>ichi2</code>, <code>nf01</code>…), and
      <em>not ranked</em> when it has none, which says the word is outside those
      lists and not that it is rare. Each facet's counts are taken over the
      words the <em>other</em> filters leave, so an option never promises a
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
      other. The page says the counts describe these entries (a JLPT N5–N1
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

    <h2 id="sharing">Sharing a word</h2>
    <p>
      <strong>The share image</strong>, <code>GET /og.png?date=…</code>, is what
      a shared link shows as its preview. The app serves it and sends nothing to
      anyone. It is derived from fields the entry already has, reads open days
      only and adds no claim. It is a 1200 by 630 PNG of the word, its reading,
      meaning, level, layer and headline, in the palette of the season its day
      falls in. The page's Open Graph and Twitter tags point at it, so a shared
      link unfolds into the card. It is drawn on the server by satori and resvg
      (<code>shared/og-card.ts</code>, <code>server/utils/og-image.ts</code>)
      and is served outside <code>/api/</code> so that
      <code>robots.txt</code> does not stop a link preview from fetching it. A
      future, malformed or unknown date is a <code>404</code> rather than a
      <code>400</code>, so the image cannot be used to learn a word early.
    </p>
    <p>
      The card draws Japanese in Zen Old Mincho and Latin in Outfit, the site's
      two faces, from subsets bundled in <code>server/assets/og/</code> (<code
        >pnpm assets:og-font</code
      >, see <NuxtLink to="/docs/authoring">Adding and fixing words</NuxtLink>).
      Zen Old Mincho has no macron vowels, which Outfit supplies, and neither
      has IPA symbols or a few rare kanji. A headline with a character neither
      can draw is left off the card, never shown with empty boxes, and
      <code>glyphs.json</code> lists what can be drawn so a test can say how
      often that happens.
    </p>

    <h2>The word pool</h2>
    <p>
      The pool is the community JLPT lists (one CSV per level, N5 to N1),
      cross-referenced against JMdict and KANJIDIC2. It exists only as the
      committed
      <code>data/reference/n{5,4,3,2,1}-reference.json</code> snapshots; there
      is no Redis pool. <code>scripts/lib/word-list.mjs</code> holds the
      parsing, the reading and meaning overrides and the gloss cross-check.
    </p>
    <p>
      A handful of words appear at more than one level with the same reading;
      <code>dedupeAcrossLevels()</code> keeps each at the lowest. A shared
      spelling with a <em>different</em> reading (開く あく and ひらく) is a
      different word. An entry's <code>term</code>, <code>kana</code>,
      <code>level</code> and <code>meaning</code> must equal a pool word.
    </p>
    <p>
      The pool is larger than the catalogue. A pool word becomes a daily word
      only if the pinned dump has an Etymology section for its own reading,
      because every claim is quoted from one. Most pool words have none, so the
      catalogue holds only the ones that do.
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
    name: "priority?",
    meaning:
      "JMdict's priority codes for the spelling and reading (`ichi1`, `news1`, `nf05`…), verbatim; left out when JMdict tags neither.",
  },
  {
    name: "register?, field?, dialect?",
    meaning:
      "JMdict's tags for how the word is used (`colloquial`, `polite (teineigo) language`, `slang`…), the field it belongs to (`medicine`, `baseball`…) and its dialect (`Kansai-ben`…), verbatim; each is a tag every sense the meaning matched carries, and is left out when there is none.",
  },
  {
    name: "pitch?",
    meaning:
      "The mora after which the pitch falls, as the pinned Kanjium accent list gives it for this exact spelling and reading (`0`: it never falls, `1`: after the first mora…) and UniDic gives it too; several when both give several. Left out when they share none.",
  },
  {
    name: "stratum?",
    meaning:
      "`wago`, `kango`, `gairaigo` or `hybrid`; stated only when KANJIDIC2, JMdict's loan source or the evidence establishes it.",
  },
  {
    name: "processes",
    meaning:
      "Keyword tags found in the quoted text (`WORD_PROCESSES`), plus the ones JMdict independently records: a coinage made in Japan, an ateji, gikun or jukujikun spelling or reading (for a word written with kanji), a loan source.",
  },
  { name: "headline", meaning: "The only hand-written field." },
  {
    name: "morphemes[]",
    meaning:
      "`text`, surface `reading` (hiragana; the single part of a loanword keeps its katakana), `base?` when rendaku or sokuon changed it, `meaning`, `irregular?`, and `glossSource?` (`kanjidic2` when the meaning is KANJIDIC2's, not Wiktionary's; a part may carry the okurigana written after its kanji). Empty when the source gives no clean split.",
  },
  {
    name: "sources[]",
    meaning:
      "`{ quote }`: one verbatim line of Wiktionary's Etymology section for this reading.",
  },
  {
    name: "examples[]?",
    meaning:
      "`{ id, ja, en, enId, form, furigana? }`: up to two example sentences from the pinned Tatoeba export, with their translations, unchanged. `id` and `enId` are Tatoeba's numbers and `form` is the word as the sentence writes it. `furigana` cuts `ja` into parts that join back to it, `[text]` or `[kanji, reading]`, and is left out when no kanji got a verified reading; a kanji whose reading the sources cannot settle stays bare in it. The whole field is left out when no sentence qualifies.",
  },
  { name: "wiktionaryDump", meaning: "Date of the pinned Wiktionary dump." },
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
