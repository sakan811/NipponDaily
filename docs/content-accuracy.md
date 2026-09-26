# Content accuracy: how NipponDaily keeps its lessons true

NipponDaily teaches Japanese, so a wrong reading or meaning is a bug that
teaches people something false. Every accuracy bug so far had the same
cause: a fact was **written by hand** (or copied from a community word list)
and **nothing checked it**, because the dictionary data it depended on only
existed inside Redis, where no test could see it.

The fix is structural: the dictionary evidence is committed to the repo, and
CI checks every hand-written fact against it on every PR. A wrong lesson
fails CI before it can merge.

## The pieces

| Piece                              | What it is                                                                                                                                                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/reference/n5-reference.json` | Committed, versioned dictionary evidence: JMdict entries (readings, senses, glosses, part of speech) for every N5 word as the site serves it, JMdict readings for every word in the example sentences, and KANJIDIC2 readings/meanings for every kanji the content uses. Generated — never edit by hand. |
| `pnpm data:reference`              | Rebuilds that file from **pinned** sources (checksum-verified `jamdict-data` for JMdict/KANJIDIC2, and the N5 word list at a fixed commit). Same input → same output.                                                                                                                                    |
| `test/content/`                    | The content-truth tests (their own Vitest project, run by `pnpm test:run` and CI).                                                                                                                                                                                                                       |
| `shared/meanings.ts`               | The only place to correct or enrich what a word says: `VOCAB_FORM_CORRECTIONS` (wrong written form/reading in the source list) and `VOCAB_MEANING_ENRICHMENTS` (fuller meanings). Applied at read time with ids unchanged — no re-seed needed.                                                           |

## What CI checks

**Example sentences** (`examples.test.ts`) — every example's rōmaji must
be a valid reading of its Japanese. The sentence is tokenized (kuromoji),
and the rōmaji must be spelled by one reading per word, where each word may
use the tokenizer's reading _or any reading JMdict lists for it_. So 七時 can
be `shichi-ji` or `nana-ji`, but a wrong reading, the wrong word, or a typo
fails. Use wāpuro rōmaji (`ou`, `ei`, no macrons).

**Every N5 word** (`vocabulary.test.ts`):

- is a real JMdict word _with that reading_ (single-kanji affixes like ～月
  may use a KANJIDIC2 reading instead);
- has no meaning that reverses JMdict's (this ↔ that, come ↔ go…);
- is taught by exactly one lesson, and every lesson word is a real pool word.

**Every hand-written meaning** — enrichments, seed-time overrides, and
corrections — must be backed by JMdict: each `;`-separated sense has to share
a content word with one of the word's JMdict glosses. Seed reading overrides
must be JMdict readings; part-of-speech overrides must be JMdict tags.

**Lesson prose** (`prose.test.ts`) — every Japanese word in insights,
titles and common-mistake notes must be a real word, and every
"かな (romaji)" pair in the kana guide must be spelled correctly.

**Staleness** — the reference must match `shared/meanings.ts`. Change a
correction without rebuilding and CI tells you to run `pnpm data:reference`.

The checkers test themselves too: they must _reject_ known-wrong readings
(三日 as `yokka`, 七時 as `hachi-ji`, 来週 as `senshuu`), so they can't
silently pass everything.

## When a check fails

- **A word isn't in JMdict** → the source list is wrong. Add a
  `VOCAB_FORM_CORRECTIONS` entry in `shared/meanings.ts` with the correct
  form and a `reason` citing the JMdict entry id, then run
  `pnpm data:reference`.
- **A meaning isn't backed** → reword it to match what JMdict says, or drop
  the sense. Don't widen the checker to let it through.
- **An example's rōmaji doesn't match** → fix the rōmaji (or the Japanese).
  If you're sure it's a valid reading JMdict lacks, rethink the example
  rather than special-casing it.
- **A prose word is unknown** → it's probably misspelt. If it's a real word
  new to the content, run `pnpm data:reference` so the reference records it.

Prose explanations themselves ("the こ-series means near me") can't be
machine-verified. Keep factual claims in structured fields (examples, rows,
meanings) where they are checked, and review prose in PRs.

## Updating the evidence

The sources are pinned in `scripts/build-n5-reference.mjs`
(`JAMDICT_SOURCE`, `WORD_LIST_SOURCE`). To move to newer data, bump the
pin, run `pnpm data:reference`, and review the JSON diff in the PR — every
changed reading or gloss is visible, and the content tests show whether any
lesson now disagrees with it. Requires Node ≥ 22 (`node:sqlite`) and
`tar`/`xz` on PATH.
