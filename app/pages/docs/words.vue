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
      The accent is the word's own: how it changes in a compound, with a
      particle or in a sentence is not shown, and where several accents are kept
      all are shown, without saying which is more usual. Neither adds a claim.
    </p>
    <p>
      A hedge in a quoted line (“probably”, “unknown”…) is detected when the
      page renders (<code>isHedged</code> in <code>shared/word-labels.ts</code>)
      and shown as “Not settled”. Where each field comes from is in
      <NuxtLink to="/docs/data-integrity#provenance">Data integrity</NuxtLink>.
    </p>

    <h2>When a day opens</h2>
    <p>
      Dates are JST (<code>shared/jst.ts</code>). <code>todayJst()</code> shifts
      UTC to Japan's calendar, so a new word opens at midnight there. With no
      <code>date</code>, <code>GET /api/daily-word</code> serves today's word.
      Once the catalogue has run out it starts a new lap
      (<code>lapEntryForDate()</code>): the day after the last word shows the
      first, the next day the second, and so on, round again after the last.
      Until the last written day it serves the newest word that is open, on lap
      1. The payload's <code>lap</code> says which one (1 until then), and the
      home page names the lap from 2 on. A word shown on a later lap has always
      opened already, so nothing leaks; an explicit <code>date</code> is always
      lap 1. The calendar fills those days too:
      <code>calendarForMonth()</code> gives each open day after the last entry
      the lap word, linked to that word's own page. The page is never empty, and
      before the first day it is a <code>404</code>.
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
      claiming nothing. Coverage is bounded by the sources and the parsers: a
      word the dump has no Etymology section for has no parts, nor do
      single-character words, a single kanji with its okurigana (抱く), many
      loanwords and any word whose text gives no clean split. The sitemap lists
      parts seen in more than one open word.
    </p>

    <h3>Kanji</h3>
    <p>
      <code>/kanji</code> and <code>/kanji/&lt;character&gt;</code>: every kanji
      an open word is written with, from KANJIDIC2's own record of it (its
      on'yomi and kun'yomi, meanings, school grade, stroke count and newspaper
      frequency rank) and the order its strokes are drawn in, beside the open
      words that contain it, grouped by their JLPT level (easiest first, oldest
      first within a level). It is built from the spellings of the entries
      alone, so it adds no claim about a word: the record describes the
      character, and a word does not use every reading or meaning listed. A
      kanji used only by an upcoming word is a <code>404</code>, like a part.
      The records are <code>data/reference/kanji.json</code>, made offline by
      <code>pnpm data:kanji</code> from the level snapshots, and
      <code>data/reference/strokes.json</code>, made by
      <code>pnpm data:strokes</code> from a pinned KanjiVG release, which keeps
      a kanji's strokes only where KanjiVG draws as many as KANJIDIC2 counts (a
      kanji with fewer or more shows none). <code>shared/kanji.ts</code> reads
      those and the shapes (server only, like the other modules that see every
      entry), and the page draws the strokes one at a time, numbered at their
      start (<code>KanjiStrokes</code>). Under them it names the shapes the
      character contains, from
      <code>data/reference/components.json</code> (<code
        >pnpm data:components</code
      >, EDRDG's KRADFILE): a lookup aid that says what the character contains
      and not where it comes from, each shape that is itself a kanji of an open
      word linked, with a few other kanji that contain it. Each entry links its
      kanji, and the sitemap lists kanji seen in more than one open word.
    </p>

    <h3>Explore</h3>
    <p>
      <code>/explore</code> filters by <code>q</code> (term, kana, meaning;
      katakana folded to hiragana, and romaji read as kana and matched against
      the readings only), <code>level</code>, <code>stratum</code>,
      <code>process</code>, <code>pos</code>, <code>frequency</code>,
      <code>pitch</code> and <code>part</code>, newest first.
      <code>count</code> is every match, but <code>words</code> holds only the
      newest {{ EXPLORE_PAGE_SIZE }}; the page's “Show more” asks again with
      <code>limit</code> raised by a page, so the list (which grows by a word a
      day) never reaches the browser whole. Different filters always narrow
      together. Within <code>level</code>, <code>stratum</code>,
      <code>process</code>, <code>pos</code>, <code>frequency</code> and
      <code>pitch</code> several choices are joined by commas
      (<code>?process=rendaku,compound</code>), and <code>match</code> says how
      they combine: by default a word needs <em>any</em> of them, with
      <code>match=all</code> it needs <em>every</em> process, every part of
      speech and every accent pattern. A word has one level, one layer and one
      frequency group, so those always read as “any”. <code>/words</code> (the
      calendar) takes the same filters beside <code>month</code>:
      <code>GET /api/word-calendar</code> marks each open day of the month
      <code>match</code> or not and returns the same counts, plus how many words
      match in every month. Both endpoints read the filters through
      <code>server/utils/explore-filters.ts</code>, so a filter means the same
      thing in each; the page shares one form, <code>WordFilters</code>.
    </p>
    <p>
      The layer <code>unstated</code> picks the words with no stated layer.
      <code>pos</code> filters on a coarse group of JMdict's tags ({{
        posText
      }}; <code>POS_GROUPS</code> in <code>shared/word-labels.ts</code>),
      because the verbatim tags are long. The entry keeps the tags as they are,
      and a word can fall in more than one group. <code>frequency</code> filters
      on how common JMdict says a word is, from the priority codes its entry
      keeps (<code>FREQUENCY_GROUPS</code>):
      <em>{{ frequencyLabel("common") }}</em> when its spelling or reading is in
      the first tier of a list JMdict draws on (<code>{{
        COMMON_PRIORITY_TEXT
      }}</code
      >, the codes JMdict itself counts as common),
      <em>{{ frequencyLabel("less") }}</em> when it has only other codes,
      <em>{{ frequencyLabel("unlisted") }}</em> when it has none, which says the
      word is outside those lists and not that it is rare.
      <code>pitch</code> filters on the patterns of the accents the entry shows
      (flat, head-high, middle-high or tail-high, named by
      <code>pitchTypesOf</code> in <code>app/utils/pitch.ts</code>, the same
      naming the entry page and Patterns use), and <code>unstated</code> on the
      words that show none; a word given several accents has the pattern of
      each. Each facet's counts are taken over the words the
      <em>other</em> filters leave, so an option never promises a count it can't
      deliver. Filters live in the URL; an unknown value in a hand-edited URL is
      dropped, while the API answers <code>400</code>.
    </p>

    <h3>Patterns</h3>
    <p>
      <code>/patterns</code>: counts by layer, level and process; level × layer;
      process × layer; process pairs and, beyond them, sets of
      {{ countWord(PATTERN_MIN_COMBINATION) }} to
      {{ countWord(PATTERN_MAX_COMBINATION) }} tags (processes plus the layer,
      such as rendaku, compound and native) with up to
      {{ countWord(PATTERN_EXAMPLE_LIMIT) }} example words each, linking into
      Explore with <code>match=all</code>; and a rendaku section. It lists every
      part whose recorded <code>base</code> differs from its
      <code>reading</code>, classed from the two spellings as a voiced first
      kana (ひ → び; ち → じ and つ → ず count, being the merged voiced sounds),
      a reading ending in っ, or other. The page says the counts describe these
      entries (a JLPT
      {{ JLPT_RANGE }}
      sample, parser-derived tags), not the language. The catalogue is lopsided
      by how it was filled (the words chosen for their origin, then each list in
      turn), so a stretch of days can hold mostly one level or one script, and
      the counts show more of it than the language would. Two sections read
      fields other than the tags: the pitch accents the entries show, sorted
      into flat, head-high, middle-high and tail-high for each layer (an accent
      counts once, so a word with two counts in both, and a word with none shown
      is left out), and the mean number of morae and kanji of each level's
      words. A last section compares readings alone: how many readings two or
      more open words share, how many of those show an accent for every word,
      how many the pitch alone tells apart (every word shows one and no two
      share one), and the
      {{ SOUND_ALIKE_GROUP_LIMIT }} readings with the most words, each word with
      the accents its entry shows.
    </p>

    <h3>Related words</h3>
    <p>
      Under an entry on <code>/words/&lt;date&gt;</code>: up to
      {{ RELATED_LIMIT }} other open words, scored {{ RELATED_PART_WEIGHT }} per
      shared part plus <code>1 − (fraction of open words carrying it)</code> for
      each shared process and for a shared layer. Below
      {{ RELATED_MIN_SCORE }} a word is not offered. Each card names what is
      shared and links to <code>/parts/&lt;text&gt;</code> or
      <code>/explore</code>. The row is hidden when the fetch fails or nothing
      clears the minimum.
    </p>

    <h3>Words read alike</h3>
    <p>
      Under an entry, the other open words whose reading is the same once
      katakana is folded to hiragana (<code>readingKey</code> in
      <code>shared/related.ts</code>) and whose spelling differs: 橋, 箸 and 端
      are all はし. Each is shown with the pitch accents its own entry shows,
      marked with ↓ where the pitch falls, and the entry itself comes first so
      the accents stand side by side; a word whose entry shows none says so.
      Only the readings are compared, so the block claims nothing about how the
      words are related, and nothing that has not opened is listed.
    </p>

    <h3>The same day in other years</h3>
    <p>
      Under an entry, and under the word on the home page, the open words whose
      day has the same month and day in another year, oldest first, each linking
      to its own page. Only the dates are compared: the words share nothing
      else, and the block says so. On a later lap the home page lists the days
      that match the word's own first day, which its heading names. They come
      with the entry in <code>GET /api/daily-word</code> (<code>sameDay</code>,
      from <code>sameDayWords</code> in <code>shared/words.ts</code>), so the
      home page renders them on the server with its word and fetches nothing
      more.
    </p>

    <h2 id="sharing">Sharing a word</h2>
    <p>
      <strong>The share image</strong>, <code>GET /og.png?date=…</code>, is what
      a shared link shows as its preview. The app serves it and sends nothing to
      anyone. It is derived from fields the entry already has, reads open days
      only and adds no claim. It is a {{ OG_WIDTH }} by {{ OG_HEIGHT }} PNG of
      the word, its reading, meaning, level, layer and headline, in the palette
      of the season its day falls in. The page's Open Graph and Twitter tags
      point at it, so a shared link unfolds into the card. It is drawn on the
      server by satori and resvg (<code>shared/og-card.ts</code>,
      <code>server/utils/og-image.ts</code>) and is served outside
      <code>/api/</code> so that <code>robots.txt</code> does not stop a link
      preview from fetching it. A future, malformed or unknown date is a
      <code>404</code> rather than a <code>400</code>, so the image cannot be
      used to learn a word early.
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
      The pool is the community JLPT lists (one CSV per level,
      {{ JLPT_RANGE }}), cross-referenced against JMdict and KANJIDIC2. It
      exists only as the committed <code>{{ REFERENCE_FILES }}</code> snapshots.
      <code>scripts/lib/word-list.mjs</code> holds the parsing, the reading and
      meaning overrides and the gloss cross-check.
    </p>
    <p>
      A handful of words appear at more than one level with the same reading;
      <code>dedupeAcrossLevels()</code> keeps each at the lowest, and the few
      that coincide once their corrections are applied (キロ) count as one. A
      shared spelling with a <em>different</em> reading (開く あく and ひらく)
      is a different word. An entry's <code>term</code>, <code>kana</code>,
      <code>level</code> and <code>meaning</code> must equal a pool word.
    </p>
    <p>
      The catalogue is the pool, one word a day. The words that were chosen for
      their origin come first and carry a headline; the rest of the pool
      follows, easiest list first, without one. Last come the words that share a
      spelling with an earlier one (後 あと, then 後 ご), easiest list first
      again; such a word carries a headline when the dump has an Etymology
      section for its reading. A word shows an origin only if the pinned dump
      has an Etymology section for its own reading, because every claim is
      quoted from one; without it the entry has no
      <code>sources</code>, no <code>morphemes</code>, no headline and no dump
      date, and the page says the data is missing in those sections. Its layer
      and processes come from KANJIDIC2 and JMdict alone. The same goes for the
      example sentences and the pitch accent. One spelling can be several words:
      後 あと and 後 ご are two pool words and two entries, so the plan names
      the reading (<code>kana</code>), and the sentence and pitch snapshots are
      keyed by spelling and reading together.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import CatalogueRange from "../../components/CatalogueRange.vue";
import RichText from "../../components/RichText.vue";
import type { DiagramSpec } from "../../utils/diagram";
import { JLPT_RANGE, REFERENCE_FILES } from "~~/shared/jlpt";
import {
  COMMON_PRIORITY_TEXT,
  FREQUENCY_GROUPS,
  POS_GROUP_IDS,
  POS_GROUPS,
} from "~~/shared/word-labels";
import type { FrequencyGroup } from "~~/types/index";
import { countWord } from "~~/shared/count";
import {
  EXPLORE_PAGE_SIZE,
  MAX_EXAMPLES,
  SOUND_ALIKE_GROUP_LIMIT,
  PATTERN_EXAMPLE_LIMIT,
  PATTERN_MAX_COMBINATION,
  PATTERN_MIN_COMBINATION,
  RELATED_LIMIT,
  RELATED_MIN_SCORE,
  RELATED_PART_WEIGHT,
} from "~~/shared/limits";
import { OG_HEIGHT, OG_WIDTH } from "~~/shared/og-card";

const posText = POS_GROUP_IDS.map((id) =>
  POS_GROUPS[id].label.toLowerCase(),
).join(", ");
const frequencyLabel = (id: FrequencyGroup): string =>
  FREQUENCY_GROUPS[id].label.toLowerCase();

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
    name: "pitchDisagreement?",
    meaning:
      "`{ kanjium, unidic }`: the accents each source gave where both have one for this spelling and reading and the sets differ; the ones they share are in `pitch`. Left out when they agree, or UniDic has none.",
  },
  {
    name: "antonyms?, seeAlso?",
    meaning:
      "`{ term, kana? }[]`: the words JMdict gives as the opposite (`ant`) of the sense the meaning came from, and the words it says to see (`xref`), as it writes them. Left out when it gives none.",
  },
  {
    name: "stratum?",
    meaning:
      "`wago`, `kango`, `gairaigo` or `hybrid`; stated only when the spelling, KANJIDIC2, JMdict's loan source or the quoted text establishes it.",
  },
  {
    name: "processes",
    meaning:
      "Keyword tags found in the quoted text (`WORD_PROCESSES`), plus the ones JMdict independently records: a coinage made in Japan, an ateji, gikun or jukujikun spelling or reading (for a word written with kanji), a loan source.",
  },
  {
    name: "headline?",
    meaning:
      "The only hand-written field. Left out for a word with no origin to hook.",
  },
  {
    name: "morphemes[]",
    meaning:
      "`text`, surface `reading` (hiragana; the single part of a loanword keeps its katakana), `base?` when rendaku or sokuon changed it, `meaning`, `irregular?`, and `glossSource?` (`kanjidic2` when the meaning is KANJIDIC2's, not Wiktionary's; a part may carry the okurigana written after its kanji). Empty when the source gives no clean split.",
  },
  {
    name: "sources[]",
    meaning:
      "`{ quote }`: one verbatim line of Wiktionary's Etymology section for this reading. Empty when the dump has none for it.",
  },
  {
    name: "otherReadings[]?",
    meaning:
      "`{ readings, quotes }`: the Etymology sections the same Wiktionary page declares for other readings of the spelling (抱く だく next to いだく), verbatim and in the page's order, one entry per section. Shown apart from the origin and never used for the parts, layer or processes. Left out when the page has none or the entry has no origin.",
  },
  {
    name: "examples[]?",
    meaning:
      "`{ id, ja, en, enId, form, furigana? }`: up to " +
      MAX_EXAMPLES +
      " example sentences from the pinned Tatoeba export, with their translations, unchanged. `id` and `enId` are Tatoeba's numbers and `form` is the word as the sentence writes it. `furigana` cuts `ja` into parts that join back to it, `[text]` or `[kanji, reading]`, and is left out when no kanji got a verified reading; a kanji whose reading the sources cannot settle stays bare in it. The whole field is left out when no sentence qualifies.",
  },
  {
    name: "wiktionaryDump?",
    meaning: "Date of the pinned Wiktionary dump; left out with the sources.",
  },
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
