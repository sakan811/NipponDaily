# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A Japanese word a day, taken apart.** Each day opens one word and shows how it is built: its morphemes, its layer of the vocabulary (和語 native, 漢語 Sino-Japanese, 外来語 loanword, 混種語 hybrid), the processes that shaped it, and the Wiktionary lines behind every claim. A calendar lets you look back through every word so far. No accounts, no tracking.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

## Features

One word a day at midnight in Japan (JST) · a month calendar · **Explore** and **Patterns** across the words · a **Parts** index of every morpheme · origin claims quoted from a pinned Wiktionary revision and checked in CI · four seasons that restyle the whole UI · a kana guide. The words are chosen from the JLPT N5–N2 vocabulary; only each headline is hand-written.

## Quick start

Node 22.19, 24.11 or 26 and newer (Nuxt's supported range) and [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env   # optional: Redis only stores the site's season
pnpm dev               # http://localhost:3000
pnpm check-qa          # lint, format, type-check, build and test
```

Built with [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript), [Tailwind CSS 4](https://tailwindcss.com/), [Upstash Redis](https://upstash.com/) and [Vitest](https://vitest.dev/).

## Documentation

The documentation is a short book inside the app, at [`/docs`](app/pages/docs/index.vue) once it is running. Its chapters are the pages under [`app/pages/docs/`](app/pages/docs/), listed in [`shared/docs.ts`](shared/docs.ts): core theme, features, architecture, daily words, API, seasons, colour and shape, error states, data integrity, adding and fixing words, development, and the roadmap. Setup, environment variables, every command and the test layout are in the Development chapter.

## Data & Attribution

<!-- docs:begin attribution -->

JMdict and KANJIDIC2 are property of the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/), used under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) via the [jamdict-data](https://pypi.org/project/jamdict-data/) release.

Etymology text is quoted from [English Wiktionary](https://en.wiktionary.org) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), as extracted by wiktextract and distributed by [Kaikki.org](https://kaikki.org/). Each entry names the dated dump it quotes, links the page and quotes it verbatim; the one-line headline is NipponDaily's own.

The word lists come from the community list originally compiled at [tanos.co.uk](https://www.tanos.co.uk/jlpt/) (CC BY; credit required), via [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT licence).

Kana conversion in the data scripts and checks uses [wanakana](https://github.com/WaniKani/WanaKana) (MIT licence).
<!-- docs:end attribution -->

Details: [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

## License

[Apache-2.0](LICENSE.txt)
