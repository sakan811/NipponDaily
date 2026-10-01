# Authoring checklist

Working notes for adding or changing daily-word content. Background:
`docs/content-accuracy.md`.

Accuracy rule that overrides everything below: **if unsure, leave the claim
out.** A thin entry is fixable; a wrong etymology misleads readers. The tests
reject invented quotes, readings and Japanese, but they cannot tell whether a
_sentence_ about a real word is true — that part is yours and the reviewer's.

## A. Add a month

Entries live in `data/words/YYYY-MM.json`, one `WordEntry` per day, **every day
of the month** (a test fails on a gap). The shape is `WordEntry` in
`types/index.ts`.

1. [ ] Choose the words. They must be real pool words (N5–N2) — the entry's
       `term`, `kana`, `level` and `meaning` must equal what the pool serves
       (copy from `data/reference/<level>-reference.json`). Prefer words with
       something evidenced to say: compounds, rendaku, clippings, loans,
       sound change, meaning shift, or an honestly disputed origin.
2. [ ] Pin the evidence: `pnpm data:etymology --terms 電話,友達,…`
       (new terms fetch at their current revision; existing pins are re-fetched
       at theirs). Wikimedia rate-limits anonymous clients — the script paces
       itself and honors `Retry-After`, so a full month takes a few minutes.
3. [ ] **Read the snapshot** (`data/reference/etymology-reference.json`) for
       each word before writing anything. Write from what it says, not from
       memory.
4. [ ] Write the entries (section B).
5. [ ] Register the month in `shared/words.ts` (one import line + the `MONTHS`
       array). Keep `shared/words.ts` out of `app/` — see section E.
6. [ ] `pnpm exec vitest run --project content test/content/words.test.ts`,
       fix, repeat.

## B. Write one entry

- [ ] `stratum` is the layer of the vocabulary (`wago` / `kango` / `gairaigo` /
      `hybrid`); `processes` are from `WORD_PROCESSES` in `shared/word-labels.ts`
- [ ] `headline` — one sentence that earns the click; no unsupported claim
- [ ] `morphemes` — left to right, each with its surface `reading` (hiragana),
      a `base` when rendaku/sokuon changed it, and a `meaning`
  - [ ] a single-kanji morpheme's reading must be a KANJIDIC2 reading and its
        gloss one of KANJIDIC2's meanings _or_ a phrase in the cited text
  - [ ] anything that breaks that (ateji, archaic readings) gets
        `"irregular": true`, and the story says why
  - [ ] if sound change means the parts don't join to `kana`, set
        `partsReading` — either the word's other pool reading or an earlier form
        the evidence romanizes
  - [ ] an unknown origin gets `morphemes: []` and the `unclear` process
- [ ] `story` — short English paragraphs. Japanese in them must appear in the
      entry's evidence or the pool (a kanji run, or a kana word, not in either
      fails the test). Hedge exactly as the source does
- [ ] `uncertainty` — required for `unclear`; use it whenever sources disagree
      or the source says "may be" / "probably". Never pick a winner the evidence
      doesn't
- [ ] `sources` — at least one verbatim quote from the snapshot (whitespace and
      directional marks are normalized). Quote the claim, not the whole section
- [ ] `wiktionaryRev` equals the snapshot's `revid`

## C. Correct a word's form, reading or meaning

1. [ ] Confirm against JMdict evidence in `data/reference/<level>-reference.json`.
2. [ ] Add to `VOCAB_FORM_CORRECTIONS` (wrong form/reading/rōmaji) or
       `VOCAB_MEANING_ENRICHMENTS` (fuller gloss) in `shared/meanings.ts`, keyed
       by `term kana`, with a `reason` citing the JMdict entry id. The word's
       `id` stays unchanged — no re-seed needed.
3. [ ] Rebuild evidence: `pnpm data:reference` (N5) or
       `pnpm data:reference:jlpt` (N4/N3/N2), and commit the JSON diff.
4. [ ] Never edit `data/reference/*.json` by hand.

## D. Before you commit content

- [ ] `pnpm test:run` — content, unit and server projects all green
- [ ] `pnpm type-check` and `pnpm lint`
- [ ] Snapshot regenerated and committed if any pin changed or entry was added
- [ ] Skim each rendered entry at `/words/<date>` — prose can't be
      machine-checked, so review it like a PR reviewer would
- [ ] Docs updated if behaviour changed: `CLAUDE.md`,
      `app/pages/docs/features.vue`, `app/pages/docs/data-integrity.vue`

## E. Don't leak future words

The API refuses future dates, but that protects nothing if the browser bundle
already contains the entries. Nothing under `app/` may import
`shared/words.ts` or `data/words/*` (a unit test enforces it); components that
need labels import the data-free `shared/word-labels.ts`.

## F. Refresh the sources (JMdict / word lists / Wiktionary)

1. [ ] JMdict/word lists: bump `WORD_LIST_SOURCES` in
       `scripts/word-list-source.mjs` and/or `JAMDICT_SOURCE` in
       `scripts/lib/jamdict.mjs`, then `pnpm seed`, `pnpm data:reference`,
       `pnpm data:reference:jlpt` — together — and review **every** diff.
2. [ ] Wiktionary: `pnpm data:etymology --refresh <term>` re-pins one term to
       its current revision. Review the text diff — a changed etymology can
       invalidate an entry's quotes or claims.
3. [ ] `pnpm test:run` — new gaps show up as failing entries.
