# Documentation

Three documents, one owner per topic. When two would say the same thing, one
links to the other instead of repeating it.

| Read                                 | When you want to know                                                                                                            |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [`core-theme.md`](core-theme.md)     | What the app is and the principles a new feature is checked against (no reader data, derive don't claim, only what has arrived). |
| [`architecture.md`](architecture.md) | How it is built: layout, data model, season system, colour, the API, tests. **Owns the word range and the endpoint list.**       |
| [`content.md`](content.md)           | How words are generated and checked, and how to add a month, correct a word or refresh the sources.                              |

Also in the repo: [`../README.md`](../README.md) (setup and commands) and
[`../TODO.md`](../TODO.md) (the data-feature backlog). The reader-facing
counterparts are the in-app pages under `app/pages/docs/` (`/docs/features`,
`/docs/architecture`, `/docs/data-integrity`, `/docs/color-palette`,
`/docs/error-states`); change them in the same commit when a change alters what
they say.

Facts are written once and copied out: attribution in `shared/sources.ts`, the
route list in `shared/endpoints.ts`, the word range from `data/words/`. The web
app reads them directly, and `pnpm docs:sync` fills the generated regions
(`<!-- docs:begin … -->`) of the README and these docs. Never edit inside those
markers. See [Single sources of truth](architecture.md#single-sources-of-truth).

`test/server/docs-sync.test.ts` fails when a generated region is stale, when a
licence name or source URL is typed anywhere but `shared/sources.ts`, when the
route list and the server disagree, or when a doc names a `pnpm` command or file
that no longer exists.
