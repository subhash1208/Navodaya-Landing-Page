---
name: review-loop
description: >-
  This skill should be used when the user asks to "review this", "verify my changes",
  "quality-check", or "check before merge" on uncommitted work, or types /review-loop.
  Covers running the bounded review-and-fix loop until GREEN, or escalating after 5 rounds.
argument-hint: 'Optional: what changed'
---

# Review loop

Run the bounded review loop on the current changes. Delegate to the `planner` agent, which drives the loop. Everything below is the `planner`'s procedure — hand it over and stop. If you are already the `planner`, execute it yourself.

0. **Establish the review scope before anything else, and carry it through every round.** "The current changes" is not a scope — it is whatever happens to be dirty. Run `git status --short` and `git diff --stat`, then decide, against the user's actual request, which of those paths this review covers.

   Nothing downstream can do this for you. The `reviewer` is a cold start that reads `git diff` against the working tree, so an unscoped delegation has it review **every** dirty file, including anything a human left mid-flight. A RED raised on one of those flows verbatim into step 3, and the `implementer` then "fixes" work that was deliberately unfinished — correctly, per its instructions, and entirely wrongly. The same list is what step 2 stages; `never git add -A` is unenforceable without it.

   If the dirty set is wider than the request and you cannot tell which files belong to it, **ask**. That is the ambiguous-requirements exception to the no-pause rule, and it is far cheaper than the alternative: another author's work silently rewritten and then committed under your message.

1. Delegate to the `reviewer` subagent, **naming the step-0 paths as the scope**. It runs format, lint, typecheck, tests, coverage and build unconditionally, plus the conditional e2e, dependency, bundle and **SSR / no-JS** gates, then inspects the diff for correctness, test depth, accessibility and scope creep. **There is no a11y gate** — accessibility is a diff review, not a command, so do not go looking for its output. Gate 10 (SSR / no-JS) is the one that catches an empty server-rendered page; if the reviewer marks it `n/a`, check that no component wrapping page content was touched.

2. On `VERDICT: GREEN` — delegate to `memory-updater` with a summary of what changed and what was learned, then spawn an `implementer` stage to stage **exactly the step-0 paths** and `git commit` them in Conventional Commits format, then report. Do not ask before committing: `permissions.ask` gates `git push` and nothing earlier, and `.husky/pre-commit` re-runs the gates as an independent check. If pre-commit fails, the GREEN was wrong; open a RED round rather than using `--no-verify`. Done.

3. On `VERDICT: RED` — pass the `## Required Fixes` list **verbatim** to the `implementer` subagent. Do not summarise or reinterpret it. Include the original spec as context. Do not ask the user first.

4. Re-review. Increment the round counter.

**Round 3 is a decision point.** Read the reviewer's `## Why this is not converging` section before re-spawning. If it concludes the spec is wrong or the requirement is ambiguous, escalate immediately rather than continuing.

**Hard cap: 5 rounds.** On round 5, stop and report:

```markdown
## ESCALATE — 5 review rounds exhausted

**Still failing:** <what>
**Tried:** <each approach, one line>
**Root disagreement:** <why reviewer and implementer are not converging>
**Decision needed from you:** <the specific choice>
```

Five failed rounds means the spec is wrong, not the code. Do not attempt a sixth round.
