<template>
  <DocsBook slug="authoring">
    <template #lede>
      Words are added a month at a time, corrected at the source and checked by
      CI. Never edit <code>data/words/</code> or <code>data/reference/</code> by
      hand: fix the source or the parser, then regenerate.
    </template>

    <h2>Where things live</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Piece</th>
            <th>What it is</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pieces" :key="p.path">
            <td>
              <code>{{ p.path }}</code>
            </td>
            <td><RichText :text="p.what" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Commands</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Does</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in commands" :key="c.cmd">
            <td>
              <code>{{ c.cmd }}</code>
            </td>
            <td><RichText :text="c.does" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      <code>data:etymology</code> is offline and takes seconds: it reads the
      Wiktionary dump from {{ SOURCES.wiktionary.via.name }}, a 367 MB file that
      is never committed. Put it in the repo root (it is git-ignored) or point
      <code>--dump</code> at it; its name, date and checksum are pinned in
      <code>scripts/lib/wiktionary-dump.mjs</code> and any other file is
      refused. The reference builders use <code>node:sqlite</code>,
      <code>tar</code> and <code>xz</code>, and download from PyPI and GitHub.
    </p>
    <p>
      <code>data:sentences</code> is offline too. It reads four files of a
      {{ SOURCES.tatoeba.name }} export, a few seconds' work on about 150 MB
      that is never committed. Download them from the paths listed in
      <code>scripts/lib/tatoeba-export.mjs</code> (each is a <code>bz2</code>;
      the indices come in a <code>tar</code>), extract them into a
      <code>tatoeba</code> directory in the repo root (it is git-ignored), and
      the script verifies their size and checksum before it reads anything.
      Tatoeba overwrites its exports every week, so keep the files if you need
      to rebuild: the committed snapshot, not the export, is what CI checks. It
      reads the word plans, so it runs before <code>data:words</code>, which
      copies the sentences into each entry; <code>data:kanji</code> runs after
      it, because it reads the entries' spellings.
    </p>

    <h2>Adding a month</h2>
    <DocDiagram
      label="Adding a month, from choosing the words to a passing test run"
      :nodes="month.nodes"
      :edges="month.edges"
    />
    <ol>
      <li>
        <strong>Choose the words</strong> (a person or a model may do this).
        They must be pool words (N5–N1). Prefer words whose Wiktionary page has
        an Etymology section; the generator will tell you if one doesn't. Every
        pool word the pinned dump can back is already planned, so a further
        month needs a newer dump or a corrected pool.
      </li>
      <li>
        <strong>Write the plan</strong>
        <code>data/word-plan/YYYY-MM.json</code>: one
        <code>{ "date", "term", "headline" }</code> per day,
        <strong>every day of the month</strong>. Add <code>"kana"</code> only
        when a spelling has several pool words (明日, 梅雨). The headline is one
        sentence that earns the click and keeps to what the quoted evidence
        says. A new month continues directly after the last day, with no gap;
        any day already past opens at once.
      </li>
      <li>
        <strong>Pin the evidence</strong>: <code>pnpm data:etymology</code>, and
        <code>pnpm data:sentences</code> for the example sentences (a word with
        none is fine). Every term in the plans is included; add
        <code>--terms 電話,友達,…</code> for words with no plan yet. Many pool
        words have no usable Etymology section, so for a bulk batch pin more
        candidates than you need with <code>--skip-missing</code>, then
        <code>pnpm data:etymology --prune --terms &lt;the chosen ones&gt;</code>
        to drop the rest.
      </li>
      <li>
        <strong>Generate</strong>: <code>pnpm data:words</code>, then
        <code>pnpm data:kanji</code> for any kanji the new words add. It prints
        every entry it could not build and why, and writes nothing until they
        are fixed (or use <code>--keep-going</code>).
      </li>
      <li>
        <strong>Read the result once.</strong> Entries with no breakdown are
        normal (the source gave no clean split), as are entries with no layer
        (irregular spellings). Skim each headline against the quoted lines: it
        must not claim more than they do.
      </li>
      <li>
        <strong>Register the month</strong> in <code>shared/words.ts</code> (one
        import line plus the <code>MONTHS</code> array). Keep
        <code>shared/words.ts</code> out of <code>app/</code> (<NuxtLink
          to="/docs/architecture"
          >the import rule</NuxtLink
        >).
      </li>
      <li>
        <strong>Rebuild the share-image fonts</strong> if the new words use a
        kanji they lack: <code>pnpm assets:og-font</code>. The test fails and
        names the characters until you do.
      </li>
      <li>
        <code>pnpm test:run</code>. The range and count the docs quote are read
        live from <code>data/words/</code>, so there is nothing to update.
      </li>
    </ol>

    <h3>If the generator refuses an entry</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Message</th>
            <th>What to do</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in refusals" :key="r.message">
            <td><RichText :text="r.message" /></td>
            <td><RichText :text="r.todo" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Correcting a word's form, reading or meaning</h2>
    <ol>
      <li>
        Confirm against the JMdict evidence in
        <code>data/reference/&lt;level&gt;-reference.json</code>.
      </li>
      <li>
        Add to <code>VOCAB_FORM_CORRECTIONS</code> (wrong form or reading) or
        <code>VOCAB_MEANING_ENRICHMENTS</code> (fuller gloss) in
        <code>shared/meanings.ts</code>, keyed by <code>term kana</code>, with a
        <code>reason</code> citing the JMdict entry id. The word's
        <code>id</code> stays unchanged.
      </li>
      <li>
        Rebuild: <code>pnpm data:reference</code> (N5) or
        <code>pnpm data:reference:jlpt</code> (N4–N1), then
        <code>pnpm data:words</code>, and commit the diffs.
      </li>
    </ol>

    <h2>Refreshing the sources</h2>
    <ol>
      <li>
        <strong>JMdict and word lists:</strong> bump
        <code>WORD_LIST_SOURCES</code> and/or <code>JAMDICT_SOURCE</code>, then
        run <code>pnpm data:reference</code> and
        <code>pnpm data:reference:jlpt</code> <em>together</em> and review every
        diff.
      </li>
      <li>
        <strong>Wiktionary:</strong>
        point <code>WIKTIONARY_DUMP</code> in
        <code>scripts/lib/wiktionary-dump.mjs</code> at the new file (date,
        size, checksum), run <code>pnpm data:etymology</code>, review the text
        diff, then run <code>pnpm data:words</code>: a changed etymology changes
        the entry, and the diff shows it.
      </li>
      <li>
        <strong>Tatoeba:</strong> download the four files named in
        <code>scripts/lib/tatoeba-export.mjs</code>, extract them into a
        <code>tatoeba</code> directory, and put their date, sizes and checksums
        in <code>TATOEBA_EXPORT</code>. Run <code>pnpm data:sentences</code>,
        review the diff (sentences change, and some words gain or lose one),
        then <code>pnpm data:words</code>.
      </li>
      <li>
        Dropped a word? <code>pnpm data:etymology --prune</code> removes pins
        nothing uses, and <code>pnpm data:sentences</code> and
        <code>pnpm data:kanji</code> drop what the word alone used.
      </li>
      <li><code>pnpm test:run</code>: new gaps show up as failing entries.</li>
    </ol>

    <h2>When a check fails</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Failure</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in failures" :key="f.failure">
            <td>{{ f.failure }}</td>
            <td><RichText :text="f.fix" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      What the checks cover, and what they cannot, is in
      <NuxtLink to="/docs/data-integrity">Data integrity</NuxtLink>.
    </p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import DocDiagram from "../../components/DocDiagram.vue";
import RichText from "../../components/RichText.vue";
import type { DiagramSpec } from "../../utils/diagram";
import { SOURCES } from "~~/shared/sources";

const pieces = [
  {
    path: "data/reference/n{5,4,3,2,1}-reference.json",
    what: "JMdict and KANJIDIC2 snapshots of every pool word. Generated.",
  },
  {
    path: "data/reference/etymology/",
    what: "Plain text of each word's Wiktionary Etymology section, read from the pinned dump, one file per month of the plan. Generated.",
  },
  {
    path: "data/reference/sentences/",
    what: "The example sentences the pinned Tatoeba export gives each word, with their translations, one file per month of the plan. Generated.",
  },
  {
    path: "data/reference/kanji.json",
    what: "KANJIDIC2's record of every kanji the entries are written with, for the kanji pages. Generated.",
  },
  {
    path: "data/word-plan/YYYY-MM.json",
    what: "The only hand-written content: `{ date, term, headline }` per day (`kana` when a spelling has several pool words).",
  },
  {
    path: "data/words/YYYY-MM.json",
    what: "Generated entries. Never edit by hand.",
  },
  {
    path: "shared/meanings.ts",
    what: "Where to correct or enrich what a pool word says (`VOCAB_FORM_CORRECTIONS`, `VOCAB_MEANING_ENRICHMENTS`), keyed by `term kana` and applied by `servedVocab()` when a snapshot is built. Three rows the source list itself has wrong are fixed in `scripts/lib/word-list.mjs` (`VOCAB_MEANING_OVERRIDES`, `VOCAB_READING_OVERRIDES`).",
  },
];

const commands = [
  {
    cmd: "pnpm data:reference",
    does: "Rebuilds `n5-reference.json` from pinned sources (a checksum-verified `jamdict-data` release and a word list at a fixed commit).",
  },
  {
    cmd: "pnpm data:reference:jlpt",
    does: "Rebuilds the N4, N3, N2 and N1 files, reusing the N5 builder's helpers.",
  },
  {
    cmd: "pnpm data:etymology",
    does: "Reads Wiktionary Etymology sections from the pinned dump, offline, for every term in the entries and plans plus `--terms a,b,c`. `--prune` drops unused pins; `--skip-missing` skips a word the dump has no Etymology for; `--dump <path>` names the file.",
  },
  {
    cmd: "pnpm data:sentences",
    does: "Picks every entry's example sentences from the pinned Tatoeba export, offline (`--dir <path>` names the extracted files, `--check` fails if the snapshot is out of date).",
  },
  {
    cmd: "pnpm data:kanji",
    does: "Copies KANJIDIC2's record of every kanji the entries use out of the level snapshots into `data/reference/kanji.json`. Fetches nothing; `--check` fails if it is out of date.",
  },
  {
    cmd: "pnpm assets:og-font",
    does: "Rebuilds the fonts the share images are drawn with in `server/assets/og/`: a subset of Zen Old Mincho Bold cut to the characters of the entries, Outfit copied from `@fontsource/outfit`, and `glyphs.json`, the list of characters they can draw. The upstream font is pinned by commit and checksum in `scripts/build-og-font.mjs`; download it into the repo root (git-ignored) or pass `--font <path>`.",
  },
  {
    cmd: "pnpm data:words",
    does: "Generates `data/words/` from the plan and the committed sources (the sentences too). Fetches nothing. `--check` fails if a file is out of date; `--keep-going` writes every entry that built and lists the failures.",
  },
];

const month: Required<Pick<DiagramSpec, "nodes" | "edges">> = {
  nodes: [
    {
      id: "choose",
      label: "Choose words",
      sub: "pool words only",
      col: 0,
      row: 0,
      kind: "actor",
    },
    {
      id: "plan",
      label: "Write the plan",
      sub: "word-plan/YYYY-MM.json",
      col: 1,
      row: 0,
      kind: "actor",
    },
    { id: "pin", label: "Pin evidence", sub: "data:etymology", col: 2, row: 0 },
    { id: "gen", label: "Generate", sub: "data:words", col: 2, row: 1.4 },
    {
      id: "read",
      label: "Read it once",
      sub: "headlines vs quotes",
      col: 1,
      row: 1.4,
      kind: "actor",
    },
    { id: "reg", label: "Register", sub: "shared/words.ts", col: 0, row: 1.4 },
    {
      id: "test",
      label: "pnpm test:run",
      sub: "the docs read the new range",
      col: 0,
      row: 2.8,
      kind: "check",
    },
  ],
  edges: [
    { from: "choose", to: "plan" },
    { from: "plan", to: "pin" },
    { from: "pin", to: "gen" },
    { from: "gen", to: "read" },
    { from: "read", to: "reg" },
    { from: "reg", to: "test" },
  ],
};

const refusals = [
  {
    message: "“none for <reading>” or “its only section is for …”",
    todo: "The page has no Etymology section for the word's reading. Replace the word; do not borrow another reading's section.",
  },
  {
    message: "“2 pool words with that spelling”",
    todo: "Add `kana` to the plan entry.",
  },
  { message: "“no pinned Wiktionary page”", todo: "Pin it first (step 3)." },
  {
    message:
      "“KANJIDIC2 reads … as native but its section says it is from Middle Chinese”",
    todo: "The dump attached another reading's etymology (it did for 道 みち). Replace the word; do not edit the snapshot.",
  },
];

const failures = [
  {
    failure: "Word not in JMdict",
    fix: "The source list is wrong. Add a `VOCAB_FORM_CORRECTIONS` entry with a `reason` citing the JMdict entry id, then rebuild the reference.",
  },
  {
    failure: "Meaning not backed",
    fix: "Reword to match JMdict or drop the sense. Don't widen the checker.",
  },
  {
    failure: "Entry differs from the generator",
    fix: "Run `pnpm data:words` and review the diff. Fix the source or `scripts/lib/word-entry.mjs`, never the entry.",
  },
  {
    failure: "Quote not found",
    fix: "The snapshot changed: re-run `pnpm data:etymology`, then `pnpm data:words`. Never loosen a quote.",
  },
  {
    failure: "Morpheme or tag wrong",
    fix: "It is derived: fix the source (`shared/meanings.ts`, a re-pin) or the parser, then `pnpm data:words`.",
  },
  {
    failure: "Headline mentions Japanese no evidence contains",
    fix: "Reword it in `data/word-plan/`.",
  },
  {
    failure: "Share-image font missing a character",
    fix: "A new word uses a character the subset lacks. Run `pnpm assets:og-font` and commit the fonts. A character none of the fonts have (an IPA symbol) is not an error: the card leaves that headline out.",
  },
  {
    failure: "Stale reference",
    fix: "Run the reference builder for that level.",
  },
  {
    failure: "Sentences or kanji out of step with the entries",
    fix: "Run `pnpm data:sentences` (with the Tatoeba export in place), `pnpm data:words`, then `pnpm data:kanji`.",
  },
  {
    failure: "Entry disagrees with JMdict",
    fix: "The generator takes JMdict's loan source, `wasei` and ateji notes itself, so a failure means the entry is stale: run `pnpm data:words`. A word whose text and JMdict truly disagree is a case for a parser change, never a loosened test.",
  },
];
</script>
