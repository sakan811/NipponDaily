# Content: accuracy and authoring

NipponDaily teaches Japanese, so a wrong reading, meaning or origin is a bug,
not a typo. This document covers how that is enforced and how to add or change
words. The reader-facing version is the in-app page `/docs/data-integrity`.
Where things live is in [`architecture.md`](architecture.md).

**The rule:** accuracy comes from sources, never from a person's or a model's
memory. The only hand-written text is a **headline** (a hook, not a claim).
Everything else (reading, meaning, level, part of speech, layer, processes,
morphemes and the origin text) is generated from JMdict, KANJIDIC2 and pinned
Wiktionary text by `pnpm data:words`. If a field looks wrong, fix the source or
the parser; never edit `data/words/*.json`.

## The evidence

Dictionary data isn't in the repo's tests, and etymology isn't in a dictionary
at all. So the evidence is committed, and CI checks every entry against it
offline.

| Piece                                         | What it is                                                                                                                                                                                                                                                                                              |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/reference/{n5,n4,n3,n2}-reference.json` | Generated JMdict + KANJIDIC2 snapshot for every word in the JLPT lists (after `shared/meanings.ts` corrections) and every kanji the content uses. **Never edit by hand.**                                                                                                                               |
| `data/reference/etymology/`                   | Generated plain text of English Wiktionary's Japanese _Etymology_ sections for every daily word, each page pinned to a **revision id** (CC BY-SA 4.0), as `meta.json` plus one `YYYY-MM.json` shard per word-plan month. Each section records the reading(s) its page declares. **Never edit by hand.** |
| `data/word-plan/YYYY-MM.json`                 | **The only hand-written content**: `{ date, term, headline }` per day (`kana` when a spelling has several pool words).                                                                                                                                                                                  |
| `data/words/YYYY-MM.json`                     | Generated entries. **Never edit by hand.**                                                                                                                                                                                                                                                              |
| `shared/meanings.ts`                          | The **only** place to correct or enrich what a pool word says (`VOCAB_FORM_CORRECTIONS`, `VOCAB_MEANING_ENRICHMENTS`), keyed by `term kana` and applied by `servedVocab()` when a snapshot is built.                                                                                                    |

| Command                    | Does                                                                                                                                                                                               |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm data:reference`      | Rebuilds `n5-reference.json` from pinned sources (checksum-verified `jamdict-data` release + a word list at a fixed commit). Node ≥ 22, `tar`, `xz`, network.                                      |
| `pnpm data:reference:jlpt` | Rebuilds the N4/N3/N2 files, reusing the N5 builder's helpers.                                                                                                                                     |
| `pnpm data:etymology`      | Pins Wiktionary pages. `--terms a,b,c` pins new terms at their current revision; `--refresh <term>` re-pins one; `--prune` drops unused pins; `--skip-missing` skips a page that can't be fetched. |
| `pnpm data:words`          | Generates `data/words/` from the plan and the committed sources. Fetches nothing. `--check` fails if a file is out of date; `--keep-going` writes every entry that built and lists the failures.   |

Word-list commits are pinned in `scripts/word-list-source.mjs`
(`WORD_LIST_SOURCES`) and the JMdict release in `scripts/lib/jamdict.mjs`
(`JAMDICT_SOURCE`), so no builder can fetch different upstream data for the same
level. Wikimedia rate-limits anonymous clients, so `data:etymology` paces itself
and honours `Retry-After`; a month takes a few minutes.

## How an entry is generated

`scripts/lib/word-entry.mjs` builds an entry from sources only
(`scripts/generate-word-entries.mjs` runs it):

- `pickSections` picks the Wiktionary section whose declared reading covers the
  word's, and refuses rather than guess.
- `evidenceLines` yields one verbatim quote per line, minus Wikipedia furniture.
- `posOf` takes JMdict's tags for the sense matching the pool meaning.
- `parseMorphemes` reads `A (a, “gloss”) + B (b, “gloss”)` chains and keeps them
  only if the parts spell the word and join to its reading (rendaku allowed). It
  also accepts a stem glossed through its base verb (缶詰), a dropped okurigana
  (出る → 出口) and bare kana parts (お), and picks nothing when two different
  splits fit.
- `parseLiteral` pairs a “warm + spring” style gloss with KANJIDIC2's
  unambiguous per-kanji readings; `parseLoan` handles loanwords.
- `parseKanji` is the last resort for an all-kanji word the text doesn't split:
  one part per kanji with KANJIDIC2's reading and a meaning the text or the
  JMdict meaning already uses (else its first), marked `glossSource: "kanjidic2"`.
  It is refused for ateji/jukujikun or an ambiguous split.
- `processesOf` finds keyword tags in the quoted text; `stratumOf` analyses
  KANJIDIC2's on/kun readings.

### What each field comes from

| Field                      | Source                                                                                                                                                     |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kana`, `meaning`, `level` | the pool (`data/reference/n*-reference.json`, after `shared/meanings.ts` corrections)                                                                      |
| `pos`                      | JMdict's tags for the sense matching the pool meaning, verbatim                                                                                            |
| `stratum`                  | KANJIDIC2 on/kun analysis of the spelling; omitted when irregular spellings defeat it                                                                      |
| `sources[]`                | the lines of Wiktionary's Etymology section for this reading, verbatim                                                                                     |
| `morphemes[]`              | parsed from those lines, or a literal gloss plus KANJIDIC2 readings, or per-kanji KANJIDIC2 data; only if the parts spell the word and join to its reading |
| `processes`                | keyword tags found in the quoted text (`rendaku`, `clipping`, `ateji`, …)                                                                                  |
| `wiktionaryRev`            | the snapshot's `revid`                                                                                                                                     |
| `headline`                 | **hand-written** (`data/word-plan/`)                                                                                                                       |

## Where AI (or any model) may help, and where it may not

A model's output can be wrong in ways that read as confident, so **AI is only
given tasks whose output is allowed to be inaccurate**: nothing it produces is
shown to a reader as a fact unless a source backs it.

- **OK:** choosing which words go in a month (a poor pick costs nothing; the
  generator refuses a word with no usable source), drafting a headline (a hook,
  not a claim; a test limits its Japanese to what the evidence or pool
  contains), and writing code or tests, which CI then checks.
- **Not OK:** supplying a reading, meaning, level, layer, morpheme split,
  etymology or any other claim about a word.

Before handing a task to a model, ask: _if this came back wrong, would a check
catch it or would it simply not matter?_ If neither, it must come from a source.
The same goes for any new feature's data.

## What the checks prove, and don't

`test/content/word-generation.test.ts` regenerates every month from the plan and
the committed sources and fails if a committed entry differs, so a derived field
can't be edited by hand or left stale.

`test/content/words.test.ts` checks every entry independently of the generator
(so a generator bug can't vouch for itself). Across the catalogue: every date and
term is unique, each month it starts is complete, and entries are sorted. For
every entry:

- the term, reading, level and meaning equal the word list's, and its layer and
  processes are ones the site knows (`shared/word-labels.ts`);
- `pos` holds only tags JMdict gives that word;
- every `sources[].quote` is found verbatim (modulo whitespace and direction
  marks) in a Wiktionary Etymology section **declared for the entry's own
  reading**, at the revision the entry names (a page like 大人 has one section per
  reading);
- the morphemes literally spell the word and join to `kana`; each non-`irregular`
  single-kanji morpheme has a reading KANJIDIC2 lists and a gloss KANJIDIC2 or
  the cited text backs;
- the headline mentions only Japanese the entry's evidence or the pool contains;
- an `unclear` entry quotes a hedged line, no snapshot pin is orphaned, each pin
  sits in the shard of the month that plans its word, and the snapshot records
  its source and licence.

`test/content/` (N5) and `test/content/{n4,n3,n2}/` gate the word lists: words
resolve in JMdict, no reversed meanings, readings are attested
(`reading-attested.test.ts`). Each level's `vocabulary.test.ts` also has a
**staleness check** that fails if its reference file no longer matches what
`servedVocab()` would produce, so re-run the builder after editing a correction.

**They cannot prove** that Wiktionary is _right_ (only that it says so, at that
revision), that JMdict's tags suit every usage, or that a headline is a fair
hook. Where Wiktionary hedges, the entry quotes the hedge and flags it instead of
choosing a winner.

## Adding a month

1. [ ] **Choose the words** (a person or a model may do this). They must be pool
       words (N5–N2). Prefer words whose Wiktionary page has an Etymology
       section; the generator will tell you if one doesn't.
2. [ ] **Write the plan** `data/word-plan/YYYY-MM.json`: one
       `{ "date", "term", "headline" }` per day, **every day of the month**. Add
       `"kana"` only when a spelling has several pool words (明日, 梅雨). The
       headline is one sentence that earns the click and keeps to what the quoted
       evidence says.
3. [ ] **Pin the evidence**: `pnpm data:etymology --terms 電話,友達,…`. Pinned
       terms are untouched. Many pool words have no usable Etymology section, so
       for a bulk batch pin more candidates than you need with `--skip-missing`,
       then `pnpm data:etymology --prune --terms <the chosen ones>` to drop the
       rest.
4. [ ] **Generate**: `pnpm data:words`. It prints every entry it could not build
       and why, and writes nothing until they are fixed (or use `--keep-going`).
5. [ ] **Read the result once.** Entries with no breakdown are normal (the source
       gave no clean split), as are entries with no layer (irregular spellings).
       Skim each headline against the quoted lines: it must not claim more than
       they do.
6. [ ] **Register the month** in `shared/words.ts` (one import line plus the
       `MONTHS` array). Keep `shared/words.ts` out of `app/` (see
       [`architecture.md`](architecture.md)).
7. [ ] **Refresh the generated docs**: `pnpm docs:sync`. The word range and
       count are computed from `data/words/`, so there is nothing to type; the
       README and `architecture.md` are filled in, and `/docs/features` reads
       `GET /api/catalogue`.
8. [ ] `pnpm test:run`.

**If the generator refuses an entry:**

| Message                                            | What to do                                                                                                           |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| "none for <reading>" / "its only section is for …" | The page has no Etymology section for the word's reading. Replace the word; do not borrow another reading's section. |
| "2 pool words with that spelling"                  | Add `kana` to the plan entry.                                                                                        |
| "no pinned Wiktionary page"                        | Pin it first (step 3).                                                                                               |

## Correcting a word's form, reading or meaning

1. [ ] Confirm against the JMdict evidence in `data/reference/<level>-reference.json`.
2. [ ] Add to `VOCAB_FORM_CORRECTIONS` (wrong form/reading) or
       `VOCAB_MEANING_ENRICHMENTS` (fuller gloss) in `shared/meanings.ts`, keyed by
       `term kana`, with a `reason` citing the JMdict entry id. The word's `id`
       stays unchanged.
3. [ ] Rebuild: `pnpm data:reference` (N5) or `pnpm data:reference:jlpt`
       (N4/N3/N2), then `pnpm data:words`, and commit the diffs.

## Refreshing the sources

1. [ ] JMdict / word lists: bump `WORD_LIST_SOURCES` and/or `JAMDICT_SOURCE`, then
       run `pnpm data:reference` and `pnpm data:reference:jlpt` **together** and
       review every diff.
2. [ ] Wiktionary: `pnpm data:etymology --refresh <term>` re-pins one term. Review
       the text diff, then `pnpm data:words`: a changed etymology changes the
       entry, and the diff shows it.
3. [ ] Dropped a word? `pnpm data:etymology --prune` removes pins nothing uses.
4. [ ] `pnpm test:run`: new gaps show up as failing entries.

## When a check fails

| Failure                      | Fix                                                                                                                                |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| Word not in JMdict           | Source list is wrong. Add a `VOCAB_FORM_CORRECTIONS` entry with a `reason` citing the JMdict entry id, then rebuild the reference. |
| Meaning not backed           | Reword to match JMdict or drop the sense.                                                                                          |
| Entry differs from generator | Run `pnpm data:words` and review the diff. Fix the source or `scripts/lib/word-entry.mjs`, never the entry.                        |
| Quote not found              | The snapshot changed: `pnpm data:etymology --refresh <term>` if you mean to re-pin, then `pnpm data:words`.                        |
| Morpheme/tag wrong           | It is derived: fix the source (`shared/meanings.ts`, a re-pin) or the parser, then `pnpm data:words`.                              |
| Headline mentions Japanese   | Reword it in `data/word-plan/` so it only uses Japanese from the evidence or the pool.                                             |
| Stale reference              | Run the reference builder for that level.                                                                                          |

## Attribution

Written once in `shared/sources.ts` and generated here by `pnpm docs:sync`.

<!-- docs:begin attribution -->

JMdict and KANJIDIC2 are property of the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/), used under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) via the [jamdict-data](https://pypi.org/project/jamdict-data/) release.

Etymology text is quoted from [English Wiktionary](https://en.wiktionary.org) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each entry links the exact revision it quotes and quotes it verbatim; the one-line headline is NipponDaily's own.

The word lists come from the community list originally compiled at tanos.co.uk, via [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT licence).

Kana conversion in the data scripts and checks uses [wanakana](https://github.com/WaniKani/WanaKana) (MIT licence).
<!-- docs:end attribution -->
