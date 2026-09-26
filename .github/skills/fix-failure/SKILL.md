---
name: fix-failure
description: >-
  This skill should be used when the user says something is "broken", "failing", or
  "erroring", asks to "fix the build", "fix this test", "debug this", or "why is CI red",
  or types /fix-failure. Covers reproducing, isolating, and fixing a failing test, build
  error, runtime exception, or quality gate through a bounded hypothesis loop, when the
  root cause is not yet understood. Do NOT use it when the cause is already known and the
  fix is a plain edit — a wrong import path, a typo'd assertion, a missing prop the error
  message names outright — a hypothesis loop buys nothing there. And a red `pnpm audit`
  reads exactly like "why is CI red" but is not a debugging problem: that is
  /dependency-audit, which already carries the pnpm-11 facts a hypothesis loop would have
  to rediscover the hard way.
argument-hint: 'Paste the error or the failing command'
---

# Fix a failure

Delegate to the `debugger` agent. Do not change any code until the failure has been reproduced. Everything below is the `debugger`'s procedure — hand it over and stop. If you are already the `debugger`, execute it yourself.

1. **Reproduce** — run the exact failing command. Capture real output, not a paraphrase. Strip ANSI (`sed 's/\x1b\[[0-9;]*[A-Za-z]//g'`) before grepping, and after any pipe read `${PIPESTATUS[0]}`, never `$?`. **If the failing command is `pnpm test:e2e`:** free port 3000 first (`netstat -ano | grep -E ':3000\s+.*LISTENING'`) or Playwright reuses that server and you debug a stale build — a plausible cause of the failure itself. The contact-form spec submits for real; `permissions.json` pins `env.RESEND_API_KEY` to the sentinel the action branches on, so a Claude session cannot reach the live inbox. A separate `export` call is a no-op — shell state does not survive between tool calls. One command: `RESEND_API_KEY= pnpm test:e2e`. **Both commands in this step are bash-only and fail in PowerShell** — pwsh has no `grep`, and it parses `VAR=val cmd` as the command name. Do not improvise the rewrite; the measured pwsh equivalents are in the Debugger agent's instructions and in `.github/instructions/quality-gates.instructions.md`, and in both cases the obvious rewrite is wrong in a way that looks right.
2. **Localise** — read the stack trace bottom-up to the first frame in `src/`. Search for that symbol.
3. **Hypothesise** — state one specific, falsifiable cause. One at a time.
4. **Test it** — smallest possible probe or change.
5. **Fix and verify** — re-run the original command, then `pnpm format:check`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm test:coverage`. **Coverage belongs on that list because it is the gate a bug fix in particular fails:** fixes are disproportionately a guard, a null check, an early return or a `catch` — a new branch whose regression test exercises exactly one side. The 90% threshold is project-wide and `.husky/pre-commit` enforces it again, so the uncovered side blocks the commit long after you reported done. Cover both sides of any branch you add; never lower a threshold or add an exclusion to reach one.
6. **Regress-proof** — confirm a test exists that would have caught this. If not, write it, and **watch it fail against the original defect before accepting it**. A regression test never observed red proves only that it passes.

7. **Commit the fix.** Check the branch first — `git rev-parse --abbrev-ref HEAD` — and if HEAD is `master` or `develop`, `git switch -c fix/<name>` per the table in `CONTRIBUTING.md` before committing. Stage the fix and its regression test by path, never `git add -A`, and commit in Conventional Commits format. Do not ask first: `permissions.ask` gates `git push` and nothing earlier, so a local commit publishes nothing, and `.husky/pre-commit` re-runs prettier, eslint and coverage as an independent check on your step-5 verification.

   This step exists because `.github/instructions/agentic-workflow.instructions.md` says the pipeline "ends with a **local commit**, not with a request for one" — and of the three skills that change code, this was the one still ending with the request. A verified fix left uncommitted costs a human turn and protects nothing.

8. **Hand the root cause onward — you cannot file it yourself.** "This failed because X" is the most durable thing a debugging session produces; it is what stops the next session re-deriving the same cause from the same stack trace. The doctrine ends every pipeline that produced findings with a `memory-updater` stage, and a root cause is squarely that.

   **But `debugger` holds `search_nodes` and `open_nodes` only — read-only memory — and no delegation tool**, so it can neither write the fact nor spawn the agent that can. Do not write an instruction to yourself that your tools cannot honour. Put the fact in your report instead, phrased as a standing fact rather than a narrative of the hunt — "`useTypewriter` leaks its interval when `text` changes mid-run; the effect's cleanup was keyed on mount only, `src/hooks/useTypewriter.ts:31`" — and whoever invoked this skill runs the `memory-updater` stage with it. If nobody does, the finding dies with the session.

Constraints:

- Never delete, skip, or loosen a failing test to get green.
- Never fix a symptom when the root cause is reachable.
- Never apply two hypotheses at once.
- After 3 disproven hypotheses, stop and report everything ruled out.

Report in the debug format defined in the Debugger agent's instructions.
