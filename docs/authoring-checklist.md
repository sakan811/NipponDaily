# Authoring checklist

Working notes for adding or changing daily-word content. Background:
`docs/content-accuracy.md`.

**The rule:** accuracy comes from sources, never from a person's or a model's
memory. The only hand-written text is a **headline** (a hook, not a claim).
Everything else — reading, meaning, level, part of speech, layer, processes,
morphemes and the origin text — is generated from JMdict, KANJIDIC2 and the
pinned Wiktionary text by `pnpm data:words`. If a field looks wrong, fix the
source or the parser; never edit `data/words/*.json`.

## A. Add a month

1. [ ] **Choose the words** (a person or a model may do this — a poor pick costs
       nothing). They must be pool words (N5–N2). Prefer words whose Wiktionary
       page has an Etymology section; the generator will tell you if one doesn't.
2. [ ] **Write the plan** `data/word-plan/YYYY-MM.json`: one
       `{ "date", "term", "headline" }` per day, **every day of the month**.
       Add `"kana"` only when a spelling has several pool words (明日, 梅雨).
       The headline is one sentence that earns the click. Keep it to what the
       quoted evidence says; Japanese in it must appear in the evidence or the
       pool (a test enforces this).
3. [ ] **Pin the evidence**: `pnpm data:etymology --terms 電話,友達,…`. New terms
       are fetched at their current Wiktionary revision; pinned terms are
       untouched. Wikimedia rate-limits anonymous clients; the script paces
       itself and honours `Retry-After`.
4. [ ] **Generate**: `pnpm data:words`. It prints every entry it could not build
       and why, and writes nothing until they are all fixed (`--keep-going`
       writes the rest). Typical refusals and what to do: - _“none for <reading>”_ / _“its only section is for …”_ — the page has
       no Etymology section for the word's reading. Replace the word; do not
       borrow another reading's section (see the 大人 / 曲る cases). - _“2 pool words with that spelling”_ — add `kana` to the plan entry. - _“no pinned Wiktionary page”_ — step 3.
5. [ ] **Read the result once.** Entries with no breakdown are normal (the source
       gave no clean split) as are entries with no layer (irregular spellings).
       Skim the headline against the quoted lines: a headline must not claim
       more than they do.
6. [ ] Register the month in `shared/words.ts` (one import line + the `MONTHS`
       array). Keep `shared/words.ts` out of `app/` — see section D.
7. [ ] `pnpm test:run` — `word-generation.test.ts` fails if a committed entry
       differs from what the sources produce; `words.test.ts` checks every
       entry independently of the generator.

## B. What each field is derived from

| Field                      | Source                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kana`, `meaning`, `level` | the pool (`data/reference/n*-reference.json`, after `shared/meanings.ts` corrections)                                                                                        |
| `pos`                      | JMdict's tags for the sense matching the pool meaning, **verbatim** (same file)                                                                                              |
| `stratum`                  | KANJIDIC2 on/kun analysis of the spelling; omitted when irregular spellings defeat it                                                                                        |
| `sources[]`                | the lines of Wiktionary's Etymology section **for this reading**, verbatim                                                                                                   |
| `morphemes[]`              | parsed from those lines (`A (a, “gloss”) + B (b, “gloss”)`) or a “literally “a + b”” gloss plus KANJIDIC2 readings; only if the parts spell the word and join to its reading |
| `processes`                | keyword tags found in the quoted text (`rendaku`, `clipping`, `ateji`, …)                                                                                                    |
| `wiktionaryRev`            | the snapshot's `revid`                                                                                                                                                       |
| `headline`                 | **hand-written** (`data/word-plan/`)                                                                                                                                         |

## C. Correct a word's form, reading or meaning

1. [ ] Confirm against JMdict evidence in `data/reference/<level>-reference.json`.
2. [ ] Add to `VOCAB_FORM_CORRECTIONS` (wrong form/reading/rōmaji) or
       `VOCAB_MEANING_ENRICHMENTS` (fuller gloss) in `shared/meanings.ts`, keyed
       by `term kana`, with a `reason` citing the JMdict entry id. The word's
       `id` stays unchanged — no re-seed needed.
3. [ ] Rebuild evidence: `pnpm data:reference` (N5) or
       `pnpm data:reference:jlpt` (N4/N3/N2), then `pnpm data:words`, and commit
       the diffs.
4. [ ] Never edit `data/reference/*.json` or `data/words/*.json` by hand.

## D. Don't leak future words

The API refuses future dates, but that protects nothing if the browser bundle
already contains the entries. Nothing under `app/` may import
`shared/words.ts`, `data/words/*` or `data/word-plan/*` (a unit test enforces
it); components that need labels import the data-free `shared/word-labels.ts`.

## E. Refresh the sources (JMdict / word lists / Wiktionary)

1. [ ] JMdict/word lists: bump `WORD_LIST_SOURCES` in
       `scripts/word-list-source.mjs` and/or `JAMDICT_SOURCE` in
       `scripts/lib/jamdict.mjs`, then `pnpm seed`, `pnpm data:reference`,
       `pnpm data:reference:jlpt` — together — and review **every** diff.
2. [ ] Wiktionary: `pnpm data:etymology --refresh <term>` re-pins one term to
       its current revision. Review the text diff, then `pnpm data:words`: a
       changed etymology changes the entry, and the diff shows it.
3. [ ] Dropped a word from the catalogue? `pnpm data:etymology --prune` removes
       pins nothing uses.
4. [ ] `pnpm test:run` — new gaps show up as failing entries.
