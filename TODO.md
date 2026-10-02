# TODO — make the app do something with its data

The site shows one word a day and a parts index. These items make it _compute_
over the 365 entries instead of only displaying them.

Ground rules for every item:

- Read **open days only**. Every `shared/` function takes `today` (JST); an
  upcoming word is never counted, listed or linked.
- Nothing under `app/` imports `shared/words`, `shared/parts`, `shared/explore`,
  `shared/patterns` or `shared/sitemap` (`test/unit/no-future-leak.test.ts`).
- Derive, don't claim: no new facts about a word, only the entries' existing,
  source-checked fields read across words. Say so on the page where a count is
  only as good as the parsers behind it.
- Nothing about a reader goes to a server. Reader state lives in `localStorage`.

## 1. Explore — browse and filter (`/explore`, `GET /api/explore`)

- [x] `shared/explore.ts`: `exploreWords(filters, today)` — filter by search text
      (term, kana — katakana matches hiragana — and meaning), level, layer,
      process and part; return matches newest first plus facet counts
- [x] `GET /api/explore` (zod-validated query; `400` on a bad filter value)
- [x] `useExplore` composable, filters mirrored in the URL (`?level=N5&stratum=wago`)
- [x] `/explore` page: search box, level / layer / process chips with live
      counts, result list linking to each word, clear-filters
- [x] header nav + sitemap + docs/features entry
- [x] tests: shared, API, page

## 2. Patterns — what the vocabulary is made of (`/patterns`, `GET /api/patterns`)

- [x] `shared/patterns.ts`: `patternsFor(today)` — counts by layer, level and
      process; level × layer; process × layer; process pairs with examples
- [x] `GET /api/patterns`
- [x] `usePatterns` composable
- [x] `/patterns` page: bar charts that link into `/explore`, with a note on
      what the numbers can and can't say
- [x] header nav + sitemap + docs/features entry
- [x] tests: shared, API, page

## 3. Rendaku explorer

- [ ] Which first-element / second-element readings voice (`ひ → び`, `かみ → がみ`),
      from the 49 entries that record a morpheme `base`, with examples
- [ ] Label it "what these entries show", not a rule of the language (small,
      parser-derived sample)
- [ ] Probably a section of `/patterns` or `/parts` rather than its own page

## 4. Reader-side review (`localStorage` only)

- [ ] "Mark as known" on an entry; a "seen / known" filter in Explore
- [ ] Quiz drawn from open days only: "which part makes 手紙?", "what is the base
      reading of the voiced part?" — answers come from committed entry data
- [ ] Never sent or stored server-side (keeps the no-reader-data rule)

## 5. Related words

- [ ] On an entry: other open words sharing a part, a process or a layer
- [ ] Mostly covered by `/parts`; only worth it if the entry page needs a
      "more like this" row

## Later / maybe

- [ ] Multi-select filters and an OR/AND toggle in Explore
- [ ] Filter by JMdict part-of-speech tag (verbatim tags are long; needs grouping)
- [ ] "Stratum not stated" option in Explore (33 entries have none)
- [ ] Co-occurrence beyond pairs (e.g. rendaku + compound + native)
