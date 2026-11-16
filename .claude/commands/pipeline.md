---
description: Run the Haiku check and fix pipeline over the current change
argument-hint: "[scope: files, a commit range, or empty for git diff main]"
---

Run the review pipeline described in `CLAUDE.md` over this scope: $ARGUMENTS
(if empty, `git diff main` plus untracked files).

1. Start the six checkers in parallel, in one message: `check-docs`, `check-code`, `check-dry`, `check-feature`, `check-theme`, `check-data`. Give each the scope.
2. For each checker that reports FAIL, start its fixer (`fix-docs`, `fix-code`, `fix-dry`, `fix-feature`, `fix-theme`, `fix-data`) with that checker's findings verbatim. Run the fixers one after another in the order docs, code, dry, feature, theme, data, because they edit the same tree.
3. Run the failed checkers again. Allow at most two fix rounds; anything still failing, and every NEEDS HUMAN item, goes to the user.
4. Run `pnpm check-qa`.
5. Report: per checker PASS or FAIL, what the fixers changed, what needs a human decision. Do not commit unless asked.
