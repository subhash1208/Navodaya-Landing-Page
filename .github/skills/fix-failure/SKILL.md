---
name: fix-failure
description: >-
  This skill should be used when the user says something is "broken", "failing", or
  "erroring", asks to "fix the build", "fix this test", "debug this", or "why is CI red",
  or types /fix-failure. Covers reproducing, isolating, and fixing a failing test, build
  error, runtime exception, or quality gate through a bounded hypothesis loop, when the
  root cause is not yet understood.
argument-hint: 'Paste the error or the failing command'
---

# Fix a failure

Delegate to the `debugger` agent. Do not change any code until the failure has been reproduced. Everything below is the `debugger`'s procedure — hand it over and stop. If you are already the `debugger`, execute it yourself.

1. **Reproduce** — run the exact failing command. Capture real output, not a paraphrase. Strip ANSI (`sed 's/\x1b\[[0-9;]*[A-Za-z]//g'`) before grepping, and after any pipe read `${PIPESTATUS[0]}`, never `$?`. **If the failing command is `pnpm test:e2e`:** free port 3000 first (`netstat -ano | grep -E ':3000\s+.*LISTENING'`) or Playwright reuses that server and you debug a stale build — a plausible cause of the failure itself. The contact-form spec submits for real; `permissions.json` pins `env.RESEND_API_KEY` to the sentinel the action branches on, so a Claude session cannot reach the live inbox. A separate `export` call is a no-op — shell state does not survive between tool calls. One command: `RESEND_API_KEY= pnpm test:e2e`.
2. **Localise** — read the stack trace bottom-up to the first frame in `src/`. Search for that symbol.
3. **Hypothesise** — state one specific, falsifiable cause. One at a time.
4. **Test it** — smallest possible probe or change.
5. **Fix and verify** — re-run the original command, then `pnpm format:check`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`.
6. **Regress-proof** — confirm a test exists that would have caught this. If not, write it.

Constraints:

- Never delete, skip, or loosen a failing test to get green.
- Never fix a symptom when the root cause is reachable.
- Never apply two hypotheses at once.
- After 3 disproven hypotheses, stop and report everything ruled out.

Report in the debug format defined in the Debugger agent's instructions.
