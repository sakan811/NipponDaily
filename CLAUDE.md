# CLAUDE.md

Agent notes, committed with the repo. The project's knowledge lives in
the in-app docs, a short book of pages under `app/pages/docs/` (chapters listed
in `shared/docs.ts`); do not restate it here. Update the chapters instead.

Read `app/pages/docs/core-theme.vue` and `architecture.vue` before changing
what the app is or how it is built.

Read `app/pages/docs/data-integrity.vue` and `authoring.vue` before touching a
word's form, reading, meaning or origin, or before adding a month, correcting a
word or refreshing sources.

## Rules

- **pnpm only.** Prefer the `package.json` scripts (`pnpm check-qa` runs lint,
  format, type-check, build and tests). `pnpm test:run` includes the
  integration test, which builds the app and requests every route, so it does
  prove the app builds; run `pnpm build` on its own only to see its output.
- **Never hand-edit generated data**: `data/words/`, `data/reference/`. Fix the
  source or the parser and regenerate (see the Adding and fixing words chapter).
- **Nothing under `app/` imports the modules listed in `shared/server-only.ts`
  or `data/words`** (future words would ship to the browser).
- **Keep docs in step.** One owner per topic (see the Development chapter). A
  chapter is `app/pages/docs/<slug>.vue` around `<DocsBook slug="…">`, listed in
  `shared/docs.ts`; figures are `DocDiagram` specs. When a change alters what a
  chapter says, update it in the same change. `test/server/docs-sync.test.ts`
  catches range, endpoint, command, path and chapter-list drift.
- **Facts live in code, docs are generated.** A number, version, count, size or
  list of names in prose is a fact: never type it into `app/` or the README.
  In order: read it from the `shared/` module or `package.json` that owns it
  (`shared/limits.ts`, `shared/stack.ts`, `shared/audio.ts`, `shared/sources.ts`,
  `shared/endpoints.ts`, `countWord()` for a count in words); generate it into the
  README with a `pnpm docs:sync` region (never edit between `<!-- docs:begin … -->`
  markers); only if the owner cannot be imported (a pin in `scripts/`, a measured
  file) type it once and add a case to `test/server/docs-claims.test.ts`.
  Wrap commands and paths in `<code>` (or backticks in table strings).
- **One implementation (DRY).** Reuse the existing helper before writing a
  second copy: `ok`/`notFound`/`parseQuery` (`server/utils/`), `useApiData`,
  `AppShell`, `scripts/lib/`. A constant the rules turn on lives in the
  `shared/` module that owns it; `test/server/single-source.test.ts` guards the
  ones already centralized, so add a case there when you centralize another.
- **Nothing leaves the app.** No export, download, analytics, form, or
  third-party script, font or embed (core theme, principle 7).
- AI may pick words, draft headlines and write code. It must never supply a
  reading, meaning, level, layer, morpheme split or etymology.

## Review pipeline

Local Haiku subagents in `.claude/agents/` check a change and fix what they
find. Each checker is read-only and ends in `VERDICT: PASS | FAIL` plus findings
as `file:line | problem | rule | fix`. Each fixer takes its checker's findings
and edits only those, then reports `FIXED`, `NEEDS HUMAN` and `VERIFY`.

| Check   | Checker         | Fixer         | Reads                                         |
| ------- | --------------- | ------------- | --------------------------------------------- |
| Docs    | `check-docs`    | `fix-docs`    | Development chapter, `shared/docs.ts`         |
| Code    | `check-code`    | `fix-code`    | Architecture chapter, `shared/server-only.ts` |
| DRY     | `check-dry`     | `fix-dry`     | `test/server/single-source.test.ts`           |
| Feature | `check-feature` | `fix-feature` | Features, Daily words, API, Error states      |
| Theme   | `check-theme`   | `fix-theme`   | Core theme, Color palette, Seasons            |
| Data    | `check-data`    | `fix-data`    | Data integrity, Adding and fixing words       |

Run it with `/pipeline [scope]` (scope defaults to `git diff main` plus
untracked files):

1. Run the six checkers in parallel.
2. Run the fixer of every FAIL, one at a time (they edit the same tree), with
   the checker's findings verbatim.
3. Re-run the failed checkers. At most two fix rounds; the rest goes to the user.
4. Run `pnpm check-qa`.
5. Report PASS or FAIL per check, what changed and what needs a human. Commit
   only when asked.

Fixers never decide product scope or supply a reading, meaning, level, layer,
morpheme split or etymology; those stay under NEEDS HUMAN. Haiku is the cheap
first pass, not the last word: read the findings before accepting a fix.
