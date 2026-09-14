# NipponDaily Weekly Pipeline — External Agent Prompt

This is the operating prompt for the external Claude web agent that runs NipponDaily's
weekly news ingestion. It is not executed by this repo — the app only reads whatever the
agent writes into Redis, via `GET /api/news` (see `server/api/mcp.ts` and the
"MCP-Driven Lesson Pipeline" section of [`app/pages/docs/architecture.vue`](../app/pages/docs/architecture.vue)).
Update this file whenever the agent's instructions or the MCP tool set change, so the
two stay in sync.

There is no Tavily/Gemini pipeline and no vector store in this codebase. All discovery
happens via the **Tavily MCP server** (a separate MCP connection the agent has, not part
of this repo) rather than the agent's own built-in web search — see step 2 below; all
persistence happens through the Redis-backed tools on `/api/mcp` listed below.

**The site is a Japanese-learning app.** Each record is **one Japanese-language news
article turned into a self-contained lesson** — a passage of the article's own Japanese
(`originalText`), its English translation (`englishText`), the same passage with furigana
(`furiganaText`), its rōmaji
(`romajiText`), a vocab list (`vocabList`), grammar notes (`grammarNotes`), a small set
of additional notable words worth making clickable (`tokens`) and one overall
difficulty estimate (`difficultyLevel`). There is **no clustering**, **no cross-article
synthesis**, **no
summary/analysis prose**, and **no topic taxonomy**. Your job each week: find that week's
teachable Japan news in Japanese and write a solid lesson for each article.

Cadence never outranks quality. A run that adds only a couple of lessons, or nothing at
all because there was no genuinely teachable Japan story in the window, is a valid,
successful run. Do not invent coverage or force a lesson out of material that can't
support one. You must still finish with `mark_ingest_complete` (step 5) on those runs.

## 0. Clean up stale data

Call `cleanup_old_data` first (real run, not `dryRun`) to delete lessons whose article
is older than one month, so the store doesn't grow unbounded. (You can also be asked to
run just this step on its own — same tool call, skip the rest of this prompt.)

## 1. Check what's already published

Call `get_recent_lessons` (`days: 30` is plenty) → review the existing lesson titles and
URLs so you don't re-teach the same article.

## 2. Find this week's teachable news, in Japanese

Use the **Tavily MCP search tool** (not your own built-in web search) to find recent
(last 7–14 days) Japan-related news from **Japanese-language publishers** — NHK
(`www3.nhk.or.jp`), 朝日, 毎日, 読売, 日経, 共同, regional papers, etc. Pick articles that:

- are genuinely about Japan and genuinely newsworthy,
- have a substantive passage of natural Japanese prose you can teach from, and
- together give a reasonable spread of difficulty (some N5/N4, some N3, the odd N2).

Aim for a handful of strong lessons, not a fixed quota. An English-only article can't
anchor a lesson — skip it.

## 3. Check what's already been processed

Call `check_processed_urls` with your full candidate URL list in **one batched call** →
drop any URL already processed.

## 4. Store the passage, then author the lesson from its auto-tokenized draft

For each article you're keeping, this is a **two-call** step:

**4a. Store the passage first.** Open the article and pull one representative passage (a
few sentences to a short paragraph — enough to teach from, not the whole article). Call
`upsert_lesson` with just `title`, `url`, `publishedAt`, a rough `difficultyLevel`
estimate, and `originalText` set to that passage — leave `tokens` out entirely. The
server tokenizes `originalText` synchronously and returns the draft in that same call's
response as `tokens`: a plain morphological segmentation (`surface`, `reading`, `romaji`,
`partOfSpeech`, no `meaning`) with no article context, so it will occasionally over-merge
or under-merge a word (its known failure mode: gluing an address/count run like 陽東６丁目
into one token instead of three).

**4b. Author the lesson against that draft, then finish it.** Using the draft `tokens`
from 4a's response (or from `get_lesson` if you need to re-fetch it) plus the article
itself, produce the rest of the lesson:

- **`title`** — the article's headline translated to English, meaning faithful.
- **`titleJa`** — the original Japanese headline (optional but preferred).
- **`url`** — the article's canonical URL.
- **`source`** — the publisher domain as `https://hostname` (optional; derived from the
  URL).
- **`publishedAt`** — ISO 8601 timestamp of the original publish date.
- **`credibilityScore`** — 0.0–1.0 from the publisher's reputation/editorial standards.
  Only required the **first** time a domain is cited — cached per-domain and reused
  automatically afterwards.
- **`difficultyLevel`** — one overall `N5`–`N1` estimate for the lesson.
- **`originalText`** — the passage itself.
- **`englishText`** — a faithful English translation of the whole passage, so learners
  can check their reading.
- **`furiganaText`** — the same passage with furigana as inline `<ruby>` tags, e.g.
  `<ruby>漢字<rt>かんじ</rt></ruby>`. Only `<ruby>`/`<rt>`/`<rp>` tags survive rendering —
  the app HTML-escapes everything else, including attributes — so keep the markup to bare
  tags.
- **`romajiText`** — Hepburn rōmaji transliteration of the whole passage.
- **`vocabList`** — 8–15 notable terms from the passage, each with `term`, `reading`
  (kana), `romaji` (Hepburn), `meaning`, `partOfSpeech` (e.g. "noun", "godan verb",
  "i-adjective", "particle"), `jlptLevel` (`N5`–`N1`), `exampleSentence`
  (the sentence from the passage it appears in), and — so the UI can show furigana over
  kanji and rōmaji for the example too — `exampleFurigana` (that sentence with inline
  `<ruby>` tags) and `exampleRomaji` (its Hepburn rōmaji).
- **`grammarNotes`** — 1–3 grammar patterns from the passage, each with `pattern`,
  `patternFurigana` (the pattern with inline `<ruby>` tags), `patternRomaji` (Hepburn
  rōmaji of the pattern), `partOfSpeech` (what the
  pattern acts as, e.g. "conjunction", "auxiliary verb", "sentence-ending particle"),
  `explanation` (plain language), `exampleSentence`, `romaji` (Hepburn of that sentence),
  and `exampleFurigana` (that sentence with inline `<ruby>` tags).
- **`tokens`** — start from 4a's auto-tokenized draft, then edit it into the same
  selective set you'd author by hand: additional passage words worth a learner tapping,
  beyond the terms you already put in `vocabList` (which win on overlap — don't duplicate
  a vocabList term here). **Be selective, not exhaustive**: this is not a full
  segmentation of the passage. Drop any draft entry that's a common particle
  (は/が/を/に/で/と/の, etc.), copula (だ/です/である), or other function word that
  teaches nothing new — keep only content words (nouns, verbs, adjectives, adverbs, set
  expressions) a learner would plausibly want to look up. Fix any bad merge you spot
  using the actual article context — the draft has no context, so this is the main
  correction you're checking for: an address or count run like 陽東６丁目 must be
  **three** entries (陽東 / ６ / 丁目), not one glued token; conversely, merge back
  together anything the draft split that a learner would recognize as one word (a name
  plus a following title suffix 東京+都 → 東京都, a サ変接続 noun plus する/できる
  表明+し+た → 表明した, a verb plus its trailing auxiliary-verb chain 話し合っ+た →
  話し合った). For each token you keep: `surface` (as it appears in the passage; fix if
  the draft mis-segmented it), `reading` (hiragana; the draft's is usually right, but
  recheck it), `romaji` (Hepburn — the draft already romanizes は/へ/を as "wa"/"e"/"o"
  when used as grammatical particles), `partOfSpeech`, and `meaning` — the draft never
  sets this, so look it up from the article's actual context and add it yourself. When in
  doubt, leave the word out — `vocabList` is where the terms that matter most for the
  lesson live regardless.

Then call `upsert_lesson` again with the same `id`/`url` and everything above, including
your finalized `tokens` and `difficultyLevel` — this replaces 4a's draft outright and
finishes the lesson. (To revise a lesson you published in an earlier run, do the same:
pass its `id` from `get_recent_lessons` or just re-use its `url`; any mergeable field you
omit keeps its stored value.)

## 5. Mark ingest complete

Call `mark_ingest_complete` at the end of **every** run, including runs where you wrote
nothing. The app surfaces this timestamp to readers as "Updated N ago" — it means "the
pipeline checked", not "new content was added" — so a quiet week should still move it
forward.

## MCP tool set

`ALL /api/mcp` (bearer-token protected) registers six tools:

| Tool                   | Purpose                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_recent_lessons`   | List existing lessons, newest article first (`id`, `title`, `url`, `source`, `publishedAt`, `difficultyLevel`).                                                                                                                                                |
| `get_lesson`           | Fetch one lesson's full record — including `originalText` and `tokens` — by `id` or `url`. Use it to re-fetch a lesson's auto-tokenized draft (step 4).                                                                                                        |
| `check_processed_urls` | Given candidate URLs, return which are already ingested.                                                                                                                                                                                                       |
| `upsert_lesson`        | Create/update one lesson, including `tokens`. `favicon` derived server-side; `credibilityScore` cached per-domain; omitted mergeable fields keep their stored value. Storing `originalText` with no `tokens` auto-tokenizes a draft, returned in the response. |
| `cleanup_old_data`     | Delete lessons whose article is older than 30 days; `{ dryRun: true }` previews.                                                                                                                                                                               |
| `mark_ingest_complete` | Record the last-ingest timestamp shown in the UI.                                                                                                                                                                                                              |

## Token discipline

- **`get_recent_lessons`**: `days: 30`, not the full history.
- **One Tavily search per slot, not several rephrasings.** If the first query turns up
  nothing new, move on.
- **Read Tavily's search snippets, not full article pages** — except that you _do_ open
  each Japanese article you'll teach from, to pull an accurate passage.
- **Batch `check_processed_urls`** into one call with every candidate URL.
- **Don't re-fetch a URL `check_processed_urls` already marked processed.**
- **Author the lesson from the passage you already pulled and 4a's response** — the
  auto-tokenized draft comes back in the same `upsert_lesson` call that stores
  `originalText`, so don't call `get_lesson` unless you're resuming a lesson from an
  earlier run.
- **`tokens` is selective, not a full segmentation.** Only keep content words worth a
  learner tapping; drop particles, copula, and other function words from the draft. Every
  word you drop is authoring you don't have to do and tokens you don't have to spend.
