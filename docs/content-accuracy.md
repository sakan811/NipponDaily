# Content accuracy — the ground-truth system

NipponDaily teaches Japanese, so a wrong reading, meaning or origin is a bug,
not a typo. This is the short version of how that is enforced. The longer,
reader-facing write-up is the in-app page `/docs/data-integrity`
(`app/pages/docs/data-integrity.vue`); `CLAUDE.md` has the full architecture.
To author or change daily words, follow `docs/authoring-checklist.md`.

## The idea

Dictionary data isn't in the repo's tests — and etymology isn't in a dictionary
at all. So the evidence is committed to the repo, and CI checks everything
against it offline. Daily-word entries are not written from memory at all: only
the one-line headline is hand-written, and every other field is **generated
from these sources** (`pnpm data:words`) and checked in CI.

| Piece                                            | What it is                                                                                                                                                                                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/reference/{n5,n4,n3,n2}-reference.json`    | Generated JMdict + KANJIDIC2 snapshot for every word in the JLPT lists (after `shared/meanings.ts` corrections) and every kanji the content uses. **Never edit by hand.**                                                                                                                |
| `data/reference/etymology/`                      | Generated plain text of English Wiktionary's Japanese _Etymology_ sections for every daily word, each page pinned to a **revision id** (CC BY-SA 4.0), stored as `meta.json` plus one `YYYY-MM.json` shard per word-plan month. **Never edit by hand.**                                  |
| `pnpm data:reference`                            | Rebuilds `n5-reference.json` from pinned sources.                                                                                                                                                                                                                                        |
| `pnpm data:reference:jlpt`                       | Rebuilds `n4`/`n3`/`n2` reference files.                                                                                                                                                                                                                                                 |
| `pnpm data:etymology`                            | Rebuilds the Wiktionary snapshot. Pinned terms keep their stored text (and gain per-section `readings`); new terms (`--terms a,b,c`) are pinned at their current revision, `--skip-missing` skips a page that can't be fetched; `--refresh <term>` re-pins; `--prune` drops unused pins. |
| `data/word-plan/YYYY-MM.json`                    | **The only hand-written content**: `{ date, term, headline }` per day (`kana` when a spelling has several pool words).                                                                                                                                                                   |
| `pnpm data:words`                                | Generates `data/words/YYYY-MM.json` from the plan and the sources above (`scripts/lib/word-entry.mjs`). Never edit the output by hand.                                                                                                                                                   |
| `test/content/word-generation.test.ts`           | Regenerates every month and fails on any difference from the committed entries.                                                                                                                                                                                                          |
| `test/content/words.test.ts`                     | Independent checks of every entry (below).                                                                                                                                                                                                                                               |
| `test/content/` (N5), `test/content/{n4,n3,n2}/` | The pool gate: words resolve in JMdict, no reversed meanings, readings are attested.                                                                                                                                                                                                     |
| `shared/meanings.ts`                             | The **only** place to correct or enrich what a pool word says (`VOCAB_FORM_CORRECTIONS`, `VOCAB_MEANING_ENRICHMENTS`), applied with `servedVocab()` when a reference snapshot is built.                                                                                                  |

## Where AI (or any model) may help — and where it may not

A model's output can be wrong in ways that read as confident, and a wrong
reading, meaning or origin is a bug here. So **AI is only given tasks whose
output is allowed to be inaccurate**, because nothing it produces is shown to
a reader as a fact unless a source backs it:

- **OK:** choosing which words go in a month (a poor pick costs nothing; the
  generator refuses a word with no usable source), drafting a headline (a hook,
  not a claim — a test limits its Japanese to what the evidence or pool
  contains), and writing code or tests, which CI then checks.
- **Not OK:** supplying a reading, meaning, level, layer, morpheme split,
  etymology or any other claim about a word. These come only from JMdict,
  KANJIDIC2 and the pinned Wiktionary text, via `pnpm data:words`.

Before handing a task to a model, ask: _if this came back wrong, would a check
catch it or would it simply not matter?_ If neither, it must come from a source
instead. The same goes for any new feature's data.

## What the entry checks prove — and don't

Across the catalogue `words.test.ts` checks that every date and term is unique,
that each month it starts is complete and that the entries are sorted by date.
For every entry it checks, independently of the generator, that:

- the term, reading, level and meaning equal the word list's (after `shared/meanings.ts`), and its layer and processes are ones the site knows (`shared/word-labels.ts`);
- `pos` holds only tags JMdict gives that word;
- every `sources[].quote` is found verbatim (modulo whitespace and direction
  marks) in a Wiktionary Etymology section **declared for the entry's own
  reading**, at the revision the entry names (a page like 大人 has one section
  per reading);
- the morphemes literally spell the word and their readings join to its reading;
  each non-`irregular` single-kanji morpheme has a reading KANJIDIC2 lists and a
  gloss KANJIDIC2 or the cited text backs (a part marked `glossSource:
"kanjidic2"` has one of KANJIDIC2's own meanings, used when the source text
  gives no split of an all-kanji word);
- the headline mentions only Japanese that the entry's evidence or the pool
  contains;
- an `unclear` entry quotes a hedged line, no snapshot pin is orphaned, each pin sits in the shard of the month that plans its word, and the snapshot records its source and licence.

`word-generation.test.ts` additionally requires every committed entry to equal
what the generator derives from the plan and the sources, so a derived field
can't be edited by hand or left stale when a source changes.

**They cannot prove** that Wiktionary is _right_ (only that it says so, at that
revision), that JMdict's tags suit every usage, or that a headline is a fair
hook. The headline is the one hand-written line and carries no claim the page
relies on. Where Wiktionary hedges the page quotes the hedge and flags it
instead of choosing a winner.

## When a check fails

| Failure                      | Fix                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Word not in JMdict           | Source list is wrong. Add a `VOCAB_FORM_CORRECTIONS` entry with a `reason` citing the JMdict entry id, then rebuild the reference. |
| Meaning not backed           | Reword to match JMdict or drop the sense.                                                                                          |
| Entry differs from generator | Run `pnpm data:words` and review the diff. Never edit generated entries; fix the source or `scripts/lib/word-entry.mjs`.           |
| Quote not found              | The snapshot changed: `pnpm data:etymology --refresh <term>` if you mean to re-pin, then `pnpm data:words`.                        |
| Morpheme/tag wrong           | It is derived: fix the source (`shared/meanings.ts`, a re-pin) or the parser, then `pnpm data:words`.                              |
| Headline mentions Japanese   | Reword it in `data/word-plan/` so it only uses Japanese from the evidence or the pool.                                             |
| Stale reference              | Run the reference builder for that level.                                                                                          |
