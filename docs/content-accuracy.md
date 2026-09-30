# Content accuracy — the ground-truth system

NipponDaily teaches Japanese, so a wrong reading or meaning is a bug, not a
typo. This is the short version of how that is enforced. The longer, reader-facing
write-up is the in-app page `/docs/data-integrity`
(`app/pages/docs/data-integrity.vue`); `CLAUDE.md` has the full architecture.
To author or change lesson content, follow `docs/authoring-checklist.md`.

## The idea

The dictionary data everything is checked against lives in Redis at runtime,
where no test can see it. So the evidence is committed to the repo instead, and
CI checks every hand-written fact against it.

| Piece                                            | What it is                                                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/reference/{n5,n4,n3,n2}-reference.json`    | Generated JMdict + KANJIDIC2 snapshot for every word the site serves (after `shared/meanings.ts` corrections) and every word/kanji the content mentions. **Never edit by hand.**               |
| `pnpm data:reference`                            | Rebuilds `n5-reference.json` from pinned sources.                                                                                                                                              |
| `pnpm data:reference:jlpt`                       | Rebuilds `n4`/`n3`/`n2` reference files.                                                                                                                                                       |
| `test/content/` (N5), `test/content/{n4,n3,n2}/` | The CI gate: words resolve in JMdict, no reversed meanings, rōmaji matches speech, example rōmaji matches its Japanese, prose words are real, every pool word is taught by exactly one lesson. |
| `shared/meanings.ts`                             | The **only** place to correct or enrich what a word says (`VOCAB_FORM_CORRECTIONS`, `VOCAB_MEANING_ENRICHMENTS`), applied at read time with the `id` unchanged — no re-seed needed.            |
| `pnpm data:draft:clusters <level>`               | Authoring evidence pack under `data/drafts/<level>/` (gitignored scratch).                                                                                                                     |
| `pnpm data:audit [level...]`                     | Looser-than-CI review queue → `data/drafts/audit-<level>.md`. Never gates; `--strict` exits 1 on likely wrong readings/meanings.                                                               |

## Rules

- Readings, meanings, POS and transitivity come from the evidence, never from
  memory. If the evidence doesn't say it, don't assert it.
- Fix bad source data in `shared/meanings.ts`, not by loosening a checker.
- Prose ("こ means near me") can't be machine-verified. Put factual claims in
  structured fields (`rows`, `examples`, meanings), where they _are_ checked,
  and review prose in PRs.
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
review every diff. Needs Node ≥ 22 (`node:sqlite`), `tar` and `xz`.

## When a check fails

| Failure                 | Fix                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Word not in JMdict      | Source list is wrong. Add a `VOCAB_FORM_CORRECTIONS` entry with a `reason` citing the JMdict entry id, then rebuild the reference.  |
| Wrong rōmaji            | Add a `romaji` correction in `VOCAB_FORM_CORRECTIONS`.                                                                              |
| Meaning not backed      | Reword to match JMdict or drop the sense.                                                                                           |
| Example rōmaji mismatch | Fix the rōmaji (or the Japanese). If you're sure it's valid but JMdict lacks it, rethink the example rather than special-casing it. |
| Unknown prose word      | Probably misspelt. If it's real and new, rebuild the reference so it's recorded.                                                    |
| Stale reference         | Run the reference builder for that level.                                                                                           |
