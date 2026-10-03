# Core theme

## What the app is

**Learning Japanese through linguistics and data.** Each day opens one word,
taken apart: its morphemes, the layer of the vocabulary it belongs to (和語 /
漢語 / 外来語 / 混種語), the processes that shaped it (compounding, rendaku,
clipping, ateji…) and the Wiktionary lines that back every claim. Reading
_across_ the words, by counting and grouping what the entries already say,
shows the patterns in the language itself.

A wrong reading, meaning or origin is a bug, so every claim comes from a cited
source and none is written from memory.

## Time is the theme

Time is how the app is styled and used. It runs on two clocks.

**The year clock: the four seasons.** The look of the site follows the Japanese
calendar's four seasons: spring, summer, autumn and winter. It repeats every
year, so it never runs out.

**The learning clock: one word a day.** Each date has one word, and which word
a date shows depends only on the date, so any reader gets the same complete
page. The words are finite (the range is in [`architecture.md`](architecture.md)),
so when they run out the home page keeps showing the newest word instead of going
blank. The idea of a lap (周), starting again from the first word once the words
are used up, is where this clock is meant to go; it is not built yet, and no
page or API repeats a word today.

## Principles

1. **No reader data.** No accounts, no progress, no streaks. Nothing about a
   reader is sent to or stored on a server; only a colour mode, a season pick
   and a music volume stay in the reader's own browser. The site is the same
   for everyone.
2. **Fits whenever a reader comes.** Daily is ideal but never required. Every
   page stands alone, nothing assumes yesterday was read, and the home page
   always shows a word: today's, or the newest one once the words have run out.
3. **The page is never empty.** The word list is finite, so the app falls back
   to the newest word rather than run out. Repeating the words in laps is the
   intended next step, not a current feature.
4. **Derive, don't claim.** Data pages and time labels read what the entries
   already say. They add no new fact about a word.
5. **Only what has arrived.** A word is shown only once its day has come.
