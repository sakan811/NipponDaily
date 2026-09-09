# NipponDaily Weekly Pipeline — External Agent Prompt

This is the operating prompt for the external Claude web agent that runs NipponDaily's
weekly news ingestion. It is not executed by this repo — the app only reads whatever the
agent writes into Redis, via `GET /api/news` (see `server/api/mcp.ts` and the "Lesson
Model & MCP-Driven Pipeline" section of `CLAUDE.md`). Update this file whenever the
agent's instructions or the MCP tool set change, so the two stay in sync.

There is no Tavily/Gemini pipeline and no vector store in this codebase. All discovery
happens via the agent's own web search; all persistence happens through the Redis-backed
tools on `/api/mcp` listed below.

**The site is a Japanese-learning app.** Each record is **one Japanese-language news
article turned into a self-contained lesson** — a passage of the article's own Japanese
(`originalText`), its English translation (`englishText`), the same passage with furigana
(`furiganaText`), its rōmaji
(`romajiText`), a vocab list (`vocabList`), grammar notes (`grammarNotes`) and one
overall difficulty estimate (`difficultyLevel`). There is **no clustering**, **no
cross-article synthesis**, **no summary/analysis prose**, and **no topic taxonomy**. Your
job each week: find that week's teachable Japan news in Japanese and write a solid lesson
for each article.

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

Search for recent (last 7–14 days) Japan-related news from **Japanese-language
publishers** — NHK (`www3.nhk.or.jp`), 朝日, 毎日, 読売, 日経, 共同, regional papers, etc.
Pick articles that:

- are genuinely about Japan and genuinely newsworthy,
- have a substantive passage of natural Japanese prose you can teach from, and
- together give a reasonable spread of difficulty (some N5/N4, some N3, the odd N2).

Aim for a handful of strong lessons, not a fixed quota. An English-only article can't
anchor a lesson — skip it.

## 3. Check what's already been processed

Call `check_processed_urls` with your full candidate URL list in **one batched call** →
drop any URL already processed.

## 4. Author the lesson for each article, then write it

Open each Japanese article you're keeping and pull one representative passage (a few
sentences to a short paragraph — enough to teach from, not the whole article). From that
passage produce:

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

Then call `upsert_lesson` once per article. To revise a lesson you published before,
pass its `id` (from `get_recent_lessons`) or just re-use its `url`; any mergeable field
you omit keeps its stored value.

## 5. Mark ingest complete

Call `mark_ingest_complete` at the end of **every** run, including runs where you wrote
nothing. The app surfaces this timestamp to readers as "Updated N ago" — it means "the
pipeline checked", not "new content was added" — so a quiet week should still move it
forward.

## MCP tool set

`ALL /api/mcp` (bearer-token protected) registers five tools:

| Tool                   | Purpose                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_recent_lessons`   | List existing lessons, newest article first (`id`, `title`, `url`, `source`, `publishedAt`, `difficultyLevel`).                                  |
| `check_processed_urls` | Given candidate URLs, return which are already ingested.                                                                                         |
| `upsert_lesson`        | Create/update one lesson. `favicon` derived server-side; `credibilityScore` cached per-domain; omitted mergeable fields keep their stored value. |
| `cleanup_old_data`     | Delete lessons whose article is older than 30 days; `{ dryRun: true }` previews.                                                                 |
| `mark_ingest_complete` | Record the last-ingest timestamp shown in the UI.                                                                                                |

## Token discipline

- **`get_recent_lessons`**: `days: 30`, not the full history.
- **One search per slot, not several rephrasings.** If the first query turns up nothing
  new, move on.
- **Read search snippets, not full article pages** — except that you _do_ open each
  Japanese article you'll teach from, to pull an accurate passage.
- **Batch `check_processed_urls`** into one call with every candidate URL.
- **Don't re-fetch a URL `check_processed_urls` already marked processed.**
- **Author the lesson from the passage you already pulled** — no separate fetch pass.
