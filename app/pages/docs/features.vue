<template>
  <DocsBook slug="features">
    <template #lede>
      NipponDaily opens one Japanese word a day and takes it apart: its
      morphemes, its layer of the vocabulary, the processes that shaped it and
      the evidence behind every claim, with a calendar to look back through
      every word so far.
    </template>

    <h2>What a reader gets</h2>
    <section v-for="feature in features" :key="feature.title">
      <h3>{{ feature.title }}</h3>
      <p><RichText :text="feature.description" /></p>
    </section>
  </DocsBook>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DocsBook from "../../components/DocsBook.vue";
import RichText from "../../components/RichText.vue";
import { useCatalogue } from "../../composables/useCatalogue";
import { rangeMonthsText } from "~~/shared/catalogue";
import { JLPT_RANGE } from "~~/shared/jlpt";
import { LICENCES } from "~~/shared/sources";

// The word range and count come from GET /api/catalogue, never typed here.
const { catalogue } = useCatalogue();

const wordsFeature = computed(() => {
  const base =
    "One entry opens each day at midnight in Japan (JST), the same word for every reader, all from the JLPT " +
    JLPT_RANGE +
    " vocabulary, and only words with a Wiktionary Etymology section.";
  const c = catalogue.value;
  return c
    ? `${base} ${c.total} words are written, ${rangeMonthsText(c)}, and ${c.open} have opened so far.`
    : base;
});

const features = computed(() => [
  {
    title: "A New Word Every Day",
    description: wordsFeature.value,
  },
  {
    title: "A Calendar to Look Back Through",
    description:
      "`/words` is a month grid. A day that has arrived shows its word and links to the full entry; an upcoming day shows only its date, and the API refuses to serve it, so a word can't be read early; a day the catalogue has no word for is left blank, except that once the catalogue has run out each open day shows the word of its lap, marked ↻ with a legend entry saying the word was first opened on another day (its link goes to that day). A short note under the heading explains that a word sits on the day it first opened, and each entry page is headed “First opened” with its date. Jump to any year and month from the picker above the grid. “Filter the calendar” opens the Explore filters (search, level, layer, process, part of speech, how common, any or all): days whose word doesn't match fade but stay links, each month in the picker shows how many matches it holds, and a month with none points to the nearest months that do. The month and filters live in the URL, so a view can be shared.",
  },
  {
    title: "Explore by How Words Are Built",
    description:
      "`/explore` searches every word that has opened — by the word, its reading (katakana or hiragana) or its meaning — and narrows by JLPT level, layer (including “not stated”), process, part of speech or how common JMdict says the word is. Pick several options in a group and choose whether a word needs any or all of them. Each option shows how many words it would leave, and the filters live in the URL so a search can be shared. The calendar uses the same filters. Upcoming words are never searched.",
  },
  {
    title: "Patterns Across the Vocabulary",
    description:
      "`/patterns` counts the same entries across words: how the vocabulary splits by layer, how each JLPT level's mix differs, which processes are most common and which turn up together, in pairs and in sets of three or four. Every bar links into Explore, and the page says what the counts can't tell you — they describe these entries, not the language. It also lists which sounds voice inside a word (ひ → び, か → が…), with the parts and words that show each change — a small, parser-derived sample, not a rule of the language.",
  },
  {
    title: "The Parts, Across Words",
    description:
      "`/parts` gathers every part a “Taken apart” row has shown. Open one — 日, say — to see each word it turns up in, grouped by the reading it takes there (び, ひ, か, にち), with rendaku shown. Words that merely contain the character, with no breakdown naming it, are listed apart and claim nothing.",
  },
  {
    title: "The Kanji",
    description:
      "`/kanji` lists every kanji a word that has opened is written with. Open one — 日, say — for KANJIDIC2's record of it (on'yomi, kun'yomi, meanings, school grade, stroke count, newspaper rank), the order its strokes are drawn in (KanjiVG's, shown only where KanjiVG and KANJIDIC2 count the same number of strokes) and every word so far that is written with it. Each entry links its own kanji, and the page says a word doesn't use every reading or meaning of its kanji.",
  },
  {
    title: "In a Sentence",
    description:
      "Most entries show a sentence or two that use the word, with their English translations, from Tatoeba's community collection. They are picked by fixed rules from one dated export, quoted unchanged, linked to their Tatoeba pages, and credited. Furigana is Tatoeba's own, drawn over a kanji only where it passes a check against the dictionaries and a contributor or a second source stands behind it; a word is shown in a sentence whose kanji are all read where one exists, and a reading that cannot be settled is left bare, not guessed. Nobody has reviewed them one by one, and the page says so.",
  },
  {
    title: "More Like This",
    description:
      "Under each entry on its own page (`/words/<date>`), a few other words that have opened and share something with it: a part, a process or a layer. Each card says exactly what is shared and links to where you can see more of it. A word that shares only very common tags is not offered, and upcoming words never are.",
  },
  {
    title: "Taken Apart",
    description:
      "Where Wiktionary splits a word into parts with glosses, each morpheme is shown with its reading and that gloss, but only if the parts spell the word and join to its reading. When the text gives no split of a word written with kanji (and the okurigana after them), each part is one of its kanji with KANJIDIC2's reading and meaning, and the page says so. Otherwise no breakdown is shown, since any other split would be a guess.",
  },
  {
    title: "How It Is Said",
    description:
      "Where the pinned Kanjium accent list gives a word's exact spelling and reading and UniDic gives the same accent, the entry shows its pitch accent: the reading with a line over the high morae and a ↓ after the one where the pitch falls, named flat (heiban), head-high (atamadaka), middle-high (nakadaka) or tail-high (odaka). A word the two do not agree on shows none, and where both give several accents they are all shown.",
  },
  {
    title: "Which Layer, Which Process",
    description:
      "Every entry shows JMdict's part-of-speech tags, a “Common” mark when JMdict counts the word as common, JMdict's own register, field and dialect tags where every sense the meaning matches carries them (colloquial, polite, baseball, Kansai-ben…), its layer when KANJIDIC2's readings or JMdict's loan source establish it — native 和語, Sino-Japanese 漢語, loanword 外来語 or hybrid 混種語 — and the processes its Wiktionary text mentions, or JMdict records (compounding, rendaku, clipping, ateji, sound change…), each defined on the page.",
  },
  {
    title: "The Story, in Wiktionary's Words",
    description:
      "Where the word comes from is quoted line by line from Wiktionary's Etymology section for that reading, never paraphrased. Lines that hedge (“probably”, “unknown”) are flagged “Not settled” instead of being turned into a verdict.",
  },
  {
    title: "Evidence for Every Claim",
    description: `Each entry quotes the Wiktionary lines it shows, taken from one dated dump, with a link to the page and its ${LICENCES.ccBySa4.name} license. Only the one-line headline is hand-written.`,
  },
  {
    title: "Share a Word",
    description:
      "A shared link unfolds into a card: the word, its reading, meaning, level and layer, and the headline, in the colours of the season it falls in. It never shows a word before its day.",
  },
  {
    title: "Verified in CI",
    description:
      "Every entry is regenerated from JMdict, KANJIDIC2 and the pinned Wiktionary snapshot and compared, and checked independently: reading, level and meaning against the pool, part of speech, register, field and dialect against JMdict, morphemes against KANJIDIC2 or the cited text, priority, loan and ateji claims against JMdict, each pitch accent against the committed accent snapshot and the word's count of morae, each kanji's strokes against KANJIDIC2's stroke count, each example sentence against the committed export snapshot, and every quote against the section for its own reading.",
  },
  {
    title: "Four Seasons",
    description:
      "The site follows the Japanese calendar: spring (sakura), summer, autumn and winter. A daily cron sets the season for the date in Japan. Each one changes the palette, the shapes of cards, buttons and badges, and the falling petals, bubbles and fireflies, leaves or snow.",
  },
  {
    title: "Pick Your Season",
    description:
      "The season button in the header lets you choose any season, or “Follow the calendar”. Your choice is kept in this browser only.",
  },
  {
    title: "Season Music",
    description:
      "The header's music button plays a looping background track for the season on screen. All four tracks are mastered to the same loudness, and changing season while the music plays crossfades into the new track. It is off every time the page loads, and the volume you choose is remembered in this browser.",
  },
  {
    title: "Kana Reference",
    description:
      "A hiragana/katakana chart with romaji and shape mnemonics at `/kana`, laid out as 学業守 omamori charms and ema plaques.",
  },
  {
    title: "Nothing Stored About You",
    description:
      "No accounts, no tracking. The site fetches words, the month grid, the counts and the season, and sends nothing about you back. Only your color mode, season choice, the site's season and music volume are remembered, in your own browser.",
  },
  {
    title: "Dark Mode & Fallbacks",
    description:
      "A light and a dark palette for every season. If a fetch fails, a retry card appears instead of an empty page, and once the catalogue runs out the home page starts another lap from the first word.",
  },
]);
</script>
