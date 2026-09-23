---
name: review-loop
description: >-
  This skill should be used when the user asks to "review this", "verify my changes",
  "quality-check", or "check before merge" on uncommitted work, or types /review-loop.
  Covers running the bounded review-and-fix loop until GREEN, or escalating after 5
  rounds, and — on GREEN — committing the reviewed paths locally. Do NOT use it when the
  user wants an opinion rather than a verdict: "what do you think of this function", "is
  this approach right", "spot anything wrong here" are reads, and this skill would answer
  them by running the gate table and writing to git history. When the code does not exist
  yet, that is /ship-feature; when a gate is already failing and the cause is not yet
  understood, that is /fix-failure.
argument-hint: 'Optional: what changed'
---

# Review loop

Run the bounded review loop on the current changes. Delegate to the `planner` agent, which drives the loop. Everything below is the `planner`'s procedure — hand it over and stop. If you are already the `planner`, execute it yourself.

0. **Establish the review scope before anything else, and carry it through every round.** "The current changes" is not a scope — it is whatever happens to be dirty. Run `git status --short` and `git diff --stat`, then decide, against the user's actual request, which of those paths this review covers.

   Nothing downstream can do this for you. The `reviewer` is a cold start that reads `git diff` against the working tree, so an unscoped delegation has it review **every** dirty file, including anything a human left mid-flight. A RED raised on one of those flows verbatim into step 3, and the `implementer` then "fixes" work that was deliberately unfinished — correctly, per its instructions, and entirely wrongly. The same list is what step 2 stages; `never git add -A` is unenforceable without it.

   If the dirty set is wider than the request and you cannot tell which files belong to it, **ask**. That is the ambiguous-requirements exception to the no-pause rule, and it is far cheaper than the alternative: another author's work silently rewritten and then committed under your message.

1. Delegate to the `reviewer` subagent, **naming the step-0 paths as the scope**. It runs the gate table in `.github/instructions/quality-gates.instructions.md` in order, then inspects the diff for correctness, test depth, accessibility and scope creep.

   **Do not hand it a list of which gates are "unconditional".** An earlier revision of this line named gates 1–6 as always-run and 7–10 as conditional. That is wrong about gate 6, and it is the wrong shape besides: applicability is decided by the diff, not fixed by this file. The instruction file's own table says a diff touching only `.md` or `.github/` moves gates 1 and 2 and nothing else — a production build has no input to change. Restating a gate list here only gives it somewhere to drift out of sync, which is exactly what happened.

   Two things about that table are worth pasting into the delegation, because they are what reviewers get wrong in each direction. **There is no a11y gate** — accessibility is a diff review, not a command, so nobody should go hunting for its output. And **gate 10 (SSR / no-JS)** is the one that catches an empty server-rendered page; if the reviewer marks it `n/a`, confirm no component wrapping page content was touched. Every gate ruled out must be named with its reason: "not applicable" is a verdict, "skipped" is not.

2. On `VERDICT: GREEN` — delegate to `memory-updater` with a summary of what changed and what was learned, then commit.

   **Check the branch before you do: `git rev-parse --abbrev-ref HEAD`.** This skill's terminal state is a commit, and `permissions.ask` gates `git push` and nothing earlier — so a `/review-loop` that began on `master` lands a commit there with the human never consulted. That ending is _likelier_ here than under `/ship-feature`: this skill runs on work that already exists, written by a human who was on whatever branch they happened to be on, and nothing about the request signals which one. If HEAD is `master` or `develop`, derive a name from the table in `CONTRIBUTING.md` and `git switch -c` it before committing — do not stop and ask — then name the branch in your report so a rename stays one command away. On an existing `feature/`, `fix/`, `perf/`, `test/` or `chore/` branch, commit where you are.

   Then spawn an `implementer` stage to stage **exactly the step-0 paths** and `git commit` them in Conventional Commits format, and report. Do not ask before committing: a local commit publishes nothing, and `.husky/pre-commit` re-runs the gates as an independent check. If pre-commit fails, the GREEN was wrong; open a RED round rather than using `--no-verify`. Done.

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
