# Content accuracy — the ground-truth system

NipponDaily teaches Japanese, so a wrong reading, meaning or origin is a bug,
not a typo. This is the short version of how that is enforced. The longer,
reader-facing write-up is the in-app page `/docs/data-integrity`
(`app/pages/docs/data-integrity.vue`); `CLAUDE.md` has the full architecture.
To author or change daily words, follow `docs/authoring-checklist.md`.

## The idea

The dictionary data everything is checked against lives in Redis at runtime,
where no test can see it — and etymology isn't in a dictionary at all. So the
evidence is committed to the repo instead, and CI checks every hand-written
fact against it.

| Piece                                            | What it is                                                                                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/reference/{n5,n4,n3,n2}-reference.json`    | Generated JMdict + KANJIDIC2 snapshot for every word the site serves (after `shared/meanings.ts` corrections) and every kanji the content uses. **Never edit by hand.**                  |
| `data/reference/etymology-reference.json`        | Generated plain text of English Wiktionary's Japanese _Etymology_ sections for every daily word, each page pinned to a **revision id** (CC BY-SA 4.0). **Never edit by hand.**           |
| `pnpm data:reference`                            | Rebuilds `n5-reference.json` from pinned sources.                                                                                                                                        |
| `pnpm data:reference:jlpt`                       | Rebuilds `n4`/`n3`/`n2` reference files.                                                                                                                                                 |
| `pnpm data:etymology`                            | Rebuilds the Wiktionary snapshot. Pinned terms are re-fetched at their revision (deterministic); new terms are pinned at their current one; `--refresh <term>` re-pins deliberately.     |
| `data/words/YYYY-MM.json`                        | The daily-word entries — the hand-written content being checked.                                                                                                                         |
| `test/content/words.test.ts`                     | The entry gate (below).                                                                                                                                                                  |
| `test/content/` (N5), `test/content/{n4,n3,n2}/` | The pool gate: words resolve in JMdict, no reversed meanings, rōmaji matches speech, readings are attested.                                                                              |
| `shared/meanings.ts`                             | The **only** place to correct or enrich what a pool word says (`VOCAB_FORM_CORRECTIONS`, `VOCAB_MEANING_ENRICHMENTS`), applied at read time with the `id` unchanged — no re-seed needed. |

## What `words.test.ts` proves — and doesn't

For every entry it checks that:

- the term, reading, level and meaning equal what the pool serves;
- the morphemes' readings join to the word's reading, or to a declared
  `partsReading` that is another pool reading or is romanized in the evidence;
- each non-`irregular` single-kanji morpheme has a reading KANJIDIC2 lists and a
  gloss KANJIDIC2 or the cited text backs;
- every `sources[].quote` is found verbatim (modulo whitespace and direction
  marks) in that word's pinned Wiktionary text, at the revision the entry names;
- the headline, story and uncertainty mention only Japanese that the entry's
  evidence or the pool contains;
- an `unclear` entry carries an `uncertainty` note, and no snapshot pin is
  orphaned.

It was verified by corrupting entries on purpose (wrong reading, wrong meaning,
invented quote, unbacked gloss, morphemes that don't join) and confirming each
is caught.

**It cannot prove** that a quote is _true_ (only that Wiktionary says it, at that
revision), or that an English sentence about a real word is correct: a real pool
word mentioned in a false sentence passes. Prose is reviewed in PRs; where
sources disagree the entry says so instead of choosing.

## Rules

- Readings, meanings and origins come from the evidence, never from memory. If
  the evidence doesn't say it, don't assert it.
- Fix bad source data in `shared/meanings.ts`, not by loosening a checker.
- Put factual claims in structured fields (`morphemes`, `sources`, meanings),
  where they _are_ checked.
- A staleness check in each level's `vocabulary.test.ts` fails if the
  reference file no longer matches what `servedVocab()` would produce — rerun
  the reference builder after editing a correction.

## Source pinning

`scripts/seed-pool-data.mjs` (live seed) and both reference builders import the
same word-list commits from `scripts/word-list-source.mjs`
(`WORD_LIST_SOURCES`), and the JMdict/KANJIDIC2 release from
`scripts/lib/jamdict.mjs` (`JAMDICT_SOURCE`), so live data and committed
evidence can't diverge. To move to newer data: bump the pin, then run
`pnpm seed`, `pnpm data:reference` and `pnpm data:reference:jlpt` together and
review every diff. Needs Node ≥ 22 (`node:sqlite`), `tar` and `xz`. The
Wiktionary pins live in the snapshot itself (`revid`).

## When a check fails

| Failure                      | Fix                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Word not in JMdict           | Source list is wrong. Add a `VOCAB_FORM_CORRECTIONS` entry with a `reason` citing the JMdict entry id, then rebuild the reference. |
| Wrong rōmaji                 | Add a `romaji` correction in `VOCAB_FORM_CORRECTIONS`.                                                                             |
| Meaning not backed           | Reword to match JMdict or drop the sense.                                                                                          |
| Quote not found              | Re-copy it from the snapshot, or `pnpm data:etymology --refresh <term>` if you mean to re-pin. Never loosen a quote to match.      |
| Morpheme reading/gloss       | Correct it; if it is genuinely ateji or archaic, mark it `irregular` and say why in the story.                                     |
| Japanese in prose not backed | Remove it, or add the source line that supports it.                                                                                |
| Stale reference              | Run the reference builder for that level.                                                                                          |
