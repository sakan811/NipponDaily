# Authoring checklist

Working notes for adding or changing lesson content. All four levels (N5–N2)
are authored, so day-to-day work is: add/extend a cluster, correct a word, or
refresh the sources. Background: `docs/content-accuracy.md`.

Accuracy rule that overrides everything below: **if unsure, leave the claim
out.** An incomplete lesson is fixable; a wrong one misleads learners.

## A. Add or extend a word cluster

Content lives in `app/data/vocab-guide{,-n4,-n3,-n2}.ts` (`WORD_CLUSTERS`,
`N4_WORD_CLUSTERS`, …). Lessons are derived from them by `app/data/lessons*.ts`.

1. [ ] `pnpm data:draft:clusters <level>` — already-authored words drop out, so
       the pack shows only what's left.
2. [ ] Read `data/drafts/<level>/flags.md` **first**. Settle every flagged word
       (see section B) before writing about it.
3. [ ] Skim `patterns.md` — homophones (wrong-kanji trap), vt/vi pairs, affixes
       and counters are natural cluster seeds.
4. [ ] Work one `words-*.md` batch (≤ 50 words) at a time; group by teachable idea.
5. [ ] Write the cluster (`WordCluster`):
   - [ ] `key` is unique and follows the level's naming (`n2-v01-…`)
   - [ ] `rows[].terms` are pool **ids**, not surface forms — check the `-2`
         suffix for same-spelling/different-reading words (十 じゅう/とお)
   - [ ] `pairwise: true` only on rows of exactly 2 terms
   - [ ] `insight` (and optional `extendedInsight`) states only what the evidence backs
   - [ ] 2+ `examples`: natural, use the cluster's words, wāpuro rōmaji
         (ou/ei, no macrons), English says what the Japanese says
   - [ ] `commonMistake` is a real pitfall for _this_ cluster; don't reuse example sentences across clusters
   - [ ] `kanjiBreakdowns` only for genuine etymology (`parts` must cover the word's kanji, in order); skip folk etymology
   - [ ] Transitivity / conjugation-class claims match the JMdict tags shown in the pack
6. [ ] Register the cluster's `key` in a stage's `clusters` list in
       `app/data/lessons*.ts` — an unregistered cluster never becomes a lesson.
7. [ ] Every pool word is in exactly one cluster (a word in several is taught
       once, in the first lesson that reaches it).
8. [ ] `pnpm exec vitest run --project content`, re-run `data:draft:clusters`,
       repeat.

## B. Correct a word's form, reading or meaning

1. [ ] Confirm against JMdict evidence (`flags.md`, or `pnpm data:audit <level>`).
2. [ ] Add to `VOCAB_FORM_CORRECTIONS` (wrong form/reading/rōmaji) or
       `VOCAB_MEANING_ENRICHMENTS` (fuller gloss) in `shared/meanings.ts`, keyed by
       `term kana`, with a `reason` citing the JMdict entry id. The word's `id`
       stays unchanged — no re-seed needed.
3. [ ] Rebuild evidence: `pnpm data:reference` (N5) or
       `pnpm data:reference:jlpt` (N4/N3/N2), and commit the JSON diff.
4. [ ] Never edit `data/reference/*.json` by hand.

## C. Before you commit content

- [ ] `pnpm data:audit <level> --strict` exits 0 (skim the full report in
      `data/drafts/audit-<level>.md` too — it's looser than CI)
- [ ] `pnpm test:run` — content, unit and server projects all green
- [ ] `pnpm type-check` and `pnpm lint`
- [ ] Reference JSON regenerated and committed if any correction changed
- [ ] Skim the rendered lesson at `/learn/<n>?level=<level>` — prose can't be
      machine-checked, so review it like a PR reviewer would
- [ ] Docs updated if counts/behaviour changed: the `CLAUDE.md` word/lesson
      counts, `app/pages/docs/features.vue`, `app/pages/docs/data-integrity.vue`

## D. Refresh the sources (JMdict / word lists)

1. [ ] Bump the pin: `WORD_LIST_SOURCES` in `scripts/word-list-source.mjs`
       and/or `JAMDICT_SOURCE` in `scripts/lib/jamdict.mjs`
2. [ ] `pnpm seed`, `pnpm data:reference`, `pnpm data:reference:jlpt` — together
3. [ ] Review **every** diff (changed readings/glosses, words added/removed
       from a level)
4. [ ] `pnpm test:run` — new gaps show up as untaught words or unresolved JMdict entries
5. [ ] `pnpm data:draft:clusters <level>` for any level with newly untaught
       words, then follow section A

## E. Daily game / lesson linking

Every vocab word in a daily game links to the lesson that teaches it, in every
round including `ALL`. That relies on each pool id being taught by a lesson
(section A, step 7) — a word missing from the lesson path silently loses its link.
